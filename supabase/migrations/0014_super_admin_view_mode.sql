-- ==============================================================================
-- 0014 — SUPER ADMIN VIEW MODE, SESSIONS & PLATFORM ACCOUNTS OVERVIEW
-- Idempotent, additive migration.
-- Enforces read-only database boundary when a Super Admin enters view mode for a tenant.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SUPER ADMIN VIEW SESSIONS TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.super_admin_view_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    user_agent TEXT
);

-- At most one active (open) view session per super admin
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_view_session_per_admin 
    ON public.super_admin_view_sessions (admin_id) 
    WHERE ended_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_super_admin_view_sessions_org 
    ON public.super_admin_view_sessions (org_id);

CREATE INDEX IF NOT EXISTS idx_super_admin_view_sessions_started 
    ON public.super_admin_view_sessions (started_at);

-- Enable & Force RLS on view sessions
ALTER TABLE public.super_admin_view_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admin_view_sessions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "view_sessions_select_super" ON public.super_admin_view_sessions;
CREATE POLICY "view_sessions_select_super" ON public.super_admin_view_sessions
    FOR SELECT TO authenticated
    USING (public.is_super_admin());

REVOKE ALL ON public.super_admin_view_sessions FROM anon;

-- ------------------------------------------------------------------------------
-- 2. HELPER: is_view_mode_active()
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_view_mode_active() 
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Only super admins can ever be in view mode
    IF NOT public.is_super_admin() THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1 
        FROM public.super_admin_view_sessions
        WHERE admin_id = auth.uid()
          AND ended_at IS NULL
          AND started_at > now() - interval '8 hours'
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. SESSION MANAGEMENT RPCs
-- ------------------------------------------------------------------------------

-- Start a view session
CREATE OR REPLACE FUNCTION public.start_view_session(p_org UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_session_id UUID;
    v_is_super BOOLEAN;
    v_can_access BOOLEAN;
    v_target_org_name TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthenticated' USING ERRCODE = '42501';
    END IF;

    v_is_super := public.is_super_admin();
    IF NOT v_is_super THEN
        RAISE EXCEPTION 'Super admin privileges required' USING ERRCODE = '42501';
    END IF;

    v_can_access := public.can_access_org(p_org);
    IF NOT v_can_access THEN
        RAISE EXCEPTION 'Access to organization denied' USING ERRCODE = '42501';
    END IF;

    SELECT name INTO v_target_org_name FROM public.organizations WHERE id = p_org;
    IF v_target_org_name IS NULL THEN
        RAISE EXCEPTION 'Organization not found' USING ERRCODE = 'P0002';
    END IF;

    -- Close any existing open sessions for this admin
    UPDATE public.super_admin_view_sessions
    SET ended_at = now()
    WHERE admin_id = auth.uid() AND ended_at IS NULL;

    -- Open new view session
    INSERT INTO public.super_admin_view_sessions (admin_id, org_id, started_at)
    VALUES (auth.uid(), p_org, now())
    RETURNING id INTO v_session_id;

    -- Audit log
    INSERT INTO public.super_admin_access_log (admin_id, org_id, action, record_type, record_id)
    VALUES (auth.uid(), p_org, 'VIEW_START', 'super_admin_view_sessions', v_session_id::text);

    RETURN v_session_id;
END;
$$;

-- End the active view session
CREATE OR REPLACE FUNCTION public.end_view_session()
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_closed_count INT;
    v_org_id UUID;
    v_session_id UUID;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN;
    END IF;

    SELECT id, org_id INTO v_session_id, v_org_id
    FROM public.super_admin_view_sessions
    WHERE admin_id = auth.uid() AND ended_at IS NULL
    ORDER BY started_at DESC
    LIMIT 1;

    IF v_session_id IS NOT NULL THEN
        UPDATE public.super_admin_view_sessions
        SET ended_at = now()
        WHERE id = v_session_id;

        INSERT INTO public.super_admin_access_log (admin_id, org_id, action, record_type, record_id)
        VALUES (auth.uid(), v_org_id, 'VIEW_END', 'super_admin_view_sessions', v_session_id::text);
    END IF;
END;
$$;

-- Current active view session lookup
CREATE OR REPLACE FUNCTION public.current_view_session()
RETURNS TABLE(
    session_id UUID,
    org_id UUID,
    org_name TEXT,
    started_at TIMESTAMPTZ,
    is_demo BOOLEAN
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL OR NOT public.is_super_admin() THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        s.id AS session_id,
        s.org_id,
        o.name AS org_name,
        s.started_at,
        o.is_demo
    FROM public.super_admin_view_sessions s
    JOIN public.organizations o ON o.id = s.org_id
    WHERE s.admin_id = auth.uid()
      AND s.ended_at IS NULL
      AND s.started_at > now() - interval '8 hours'
    ORDER BY s.started_at DESC
    LIMIT 1;
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. RESTRICTIVE READ-ONLY ENFORCEMENT POLICIES
-- ------------------------------------------------------------------------------

DO $$
DECLARE
    t TEXT;
    v_tables TEXT[] := ARRAY[
        'customers',
        'designs',
        'design_images',
        'design_shares',
        'design_share_items',
        'orders',
        'order_items',
        'order_status_history',
        'payments',
        'payment_allocations',
        'payment_adjustments',
        'manufacturers',
        'sales_team',
        'field_visits',
        'follow_ups',
        'discount_requests',
        'notifications',
        'activity_events',
        'audit_logs',
        'client_notes',
        'app_settings',
        'organizations',
        'profiles',
        'org_invites'
    ];
BEGIN
    FOREACH t IN ARRAY v_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
            -- 1. Restrictive INSERT Policy
            EXECUTE format('DROP POLICY IF EXISTS view_mode_no_insert ON public.%I;', t);
            EXECUTE format('CREATE POLICY view_mode_no_insert ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (NOT public.is_view_mode_active());', t);

            -- 2. Restrictive UPDATE Policy
            EXECUTE format('DROP POLICY IF EXISTS view_mode_no_update ON public.%I;', t);
            EXECUTE format('CREATE POLICY view_mode_no_update ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING (NOT public.is_view_mode_active());', t);

            -- 3. Restrictive DELETE Policy
            EXECUTE format('DROP POLICY IF EXISTS view_mode_no_delete ON public.%I;', t);
            EXECUTE format('CREATE POLICY view_mode_no_delete ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated USING (NOT public.is_view_mode_active());', t);
        END IF;
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 5. PLATFORM ACCOUNTS OVERVIEW RPC
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.platform_accounts_overview()
RETURNS TABLE(
    org_id UUID,
    name TEXT,
    status TEXT,
    is_demo BOOLEAN,
    created_at TIMESTAMPTZ,
    owner_name TEXT,
    owner_email TEXT,
    owner_phone TEXT,
    admin_count BIGINT,
    sales_rep_count BIGINT,
    pending_invites BIGINT,
    customers_count BIGINT,
    designs_count BIGINT,
    orders_count BIGINT,
    orders_last_30d BIGINT,
    payments_count BIGINT,
    total_order_value NUMERIC,
    total_collected NUMERIC,
    total_outstanding NUMERIC,
    last_activity_at TIMESTAMPTZ,
    days_since_last_activity INT,
    setup_steps_done INT,
    setup_percent INT,
    health TEXT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_is_super BOOLEAN;
    v_is_demo_user BOOLEAN;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthenticated' USING ERRCODE = '42501';
    END IF;

    v_is_super := public.is_super_admin();
    IF NOT v_is_super THEN
        RAISE EXCEPTION 'Super admin privileges required' USING ERRCODE = '42501';
    END IF;

    v_is_demo_user := public.is_current_demo_account();

    RETURN QUERY
    WITH org_filtered AS (
        SELECT o.id, o.name, o.phone, o.city, o.state, o.gstin, o.owner_id, o.status, o.is_demo, o.created_at
        FROM public.organizations o
        WHERE (NOT v_is_demo_user) OR (o.is_demo = true)
    ),
    owner_info AS (
        SELECT 
            o.id AS org_id,
            COALESCE(p.full_name, p.name, 'Admin') AS owner_name,
            COALESCE(p.email, u.email, '') AS owner_email,
            COALESCE(p.phone, o.phone, '') AS owner_phone
        FROM org_filtered o
        LEFT JOIN auth.users u ON u.id = o.owner_id
        LEFT JOIN public.profiles p ON p.id = o.owner_id
    ),
    team_counts AS (
        SELECT 
            p.org_id,
            COUNT(CASE WHEN p.role = 'admin' THEN 1 END) AS admin_count,
            COUNT(CASE WHEN p.role = 'salesperson' THEN 1 END) AS sales_rep_count
        FROM public.profiles p
        WHERE p.org_id IS NOT NULL
        GROUP BY p.org_id
    ),
    invite_counts AS (
        SELECT 
            i.org_id,
            COUNT(CASE WHEN i.accepted_at IS NULL AND i.expires_at > now() THEN 1 END) AS pending_invites
        FROM public.org_invites i
        GROUP BY i.org_id
    ),
    cust_counts AS (
        SELECT c.org_id, COUNT(*) AS customers_count
        FROM public.customers c
        GROUP BY c.org_id
    ),
    design_counts AS (
        SELECT d.org_id, COUNT(*) AS designs_count
        FROM public.designs d
        GROUP BY d.org_id
    ),
    order_stats AS (
        SELECT 
            o.org_id,
            COUNT(*) AS orders_count,
            COUNT(CASE WHEN o.order_date >= (CURRENT_DATE - INTERVAL '30 days') THEN 1 END) AS orders_last_30d,
            COALESCE(SUM(COALESCE(o.net_payable, o.subtotal, 0)), 0) AS total_order_value,
            MAX(o.created_at) AS last_order_at
        FROM public.orders o
        GROUP BY o.org_id
    ),
    payment_stats AS (
        SELECT 
            p.org_id,
            COUNT(*) AS payments_count,
            COALESCE(SUM(p.amount), 0) AS total_collected,
            MAX(p.payment_date) AS last_payment_at
        FROM public.payments p
        GROUP BY p.org_id
    ),
    activity_stats AS (
        SELECT 
            a.org_id,
            MAX(a.created_at) AS last_event_at
        FROM public.activity_events a
        GROUP BY a.org_id
    )
    SELECT 
        o.id AS org_id,
        o.name,
        o.status,
        o.is_demo,
        o.created_at,
        COALESCE(ow.owner_name, 'SoleFlow User') AS owner_name,
        COALESCE(ow.owner_email, '') AS owner_email,
        COALESCE(ow.owner_phone, o.phone, '') AS owner_phone,
        COALESCE(tc.admin_count, 1) AS admin_count,
        COALESCE(tc.sales_rep_count, 0) AS sales_rep_count,
        COALESCE(ic.pending_invites, 0) AS pending_invites,
        COALESCE(cc.customers_count, 0) AS customers_count,
        COALESCE(dc.designs_count, 0) AS designs_count,
        COALESCE(os.orders_count, 0) AS orders_count,
        COALESCE(os.orders_last_30d, 0) AS orders_last_30d,
        COALESCE(ps.payments_count, 0) AS payments_count,
        COALESCE(os.total_order_value, 0)::NUMERIC AS total_order_value,
        COALESCE(ps.total_collected, 0)::NUMERIC AS total_collected,
        GREATEST(0, (COALESCE(os.total_order_value, 0) - COALESCE(ps.total_collected, 0)))::NUMERIC AS total_outstanding,
        
        -- Last Activity Timestamp
        GREATEST(
            o.created_at,
            os.last_order_at,
            ps.last_payment_at,
            act.last_event_at
        ) AS last_activity_at,

        -- Days since last activity
        EXTRACT(DAY FROM (now() - GREATEST(o.created_at, os.last_order_at, ps.last_payment_at, act.last_event_at)))::INT AS days_since_last_activity,

        -- Setup Steps Done (out of 6: profile filled, >=1 design, >=1 customer, >=1 rep, >=1 order, >=1 payment)
        (
            (CASE WHEN (o.name IS NOT NULL AND (o.phone IS NOT NULL OR o.city IS NOT NULL)) THEN 1 ELSE 0 END) +
            (CASE WHEN COALESCE(dc.designs_count, 0) >= 1 THEN 1 ELSE 0 END) +
            (CASE WHEN COALESCE(cc.customers_count, 0) >= 1 THEN 1 ELSE 0 END) +
            (CASE WHEN (COALESCE(tc.sales_rep_count, 0) >= 1 OR COALESCE(ic.pending_invites, 0) >= 1) THEN 1 ELSE 0 END) +
            (CASE WHEN COALESCE(os.orders_count, 0) >= 1 THEN 1 ELSE 0 END) +
            (CASE WHEN COALESCE(ps.payments_count, 0) >= 1 THEN 1 ELSE 0 END)
        )::INT AS setup_steps_done,

        -- Setup Percent
        (ROUND(
            (
                (CASE WHEN (o.name IS NOT NULL AND (o.phone IS NOT NULL OR o.city IS NOT NULL)) THEN 1 ELSE 0 END) +
                (CASE WHEN COALESCE(dc.designs_count, 0) >= 1 THEN 1 ELSE 0 END) +
                (CASE WHEN COALESCE(cc.customers_count, 0) >= 1 THEN 1 ELSE 0 END) +
                (CASE WHEN (COALESCE(tc.sales_rep_count, 0) >= 1 OR COALESCE(ic.pending_invites, 0) >= 1) THEN 1 ELSE 0 END) +
                (CASE WHEN COALESCE(os.orders_count, 0) >= 1 THEN 1 ELSE 0 END) +
                (CASE WHEN COALESCE(ps.payments_count, 0) >= 1 THEN 1 ELSE 0 END)
            ) * 100.0 / 6.0
        ))::INT AS setup_percent,

        -- Computed Health Status
        CASE 
            WHEN o.status = 'suspended' THEN 'inactive'
            WHEN COALESCE(os.orders_count, 0) = 0 AND o.created_at >= (now() - INTERVAL '7 days') THEN 'new'
            WHEN EXTRACT(DAY FROM (now() - GREATEST(o.created_at, os.last_order_at, ps.last_payment_at, act.last_event_at))) <= 7 THEN 'active'
            WHEN EXTRACT(DAY FROM (now() - GREATEST(o.created_at, os.last_order_at, ps.last_payment_at, act.last_event_at))) <= 30 THEN 'slowing'
            ELSE 'inactive'
        END AS health

    FROM org_filtered o
    LEFT JOIN owner_info ow ON ow.org_id = o.id
    LEFT JOIN team_counts tc ON tc.org_id = o.id
    LEFT JOIN invite_counts ic ON ic.org_id = o.id
    LEFT JOIN cust_counts cc ON cc.org_id = o.id
    LEFT JOIN design_counts dc ON dc.org_id = o.id
    LEFT JOIN order_stats os ON os.org_id = o.id
    LEFT JOIN payment_stats ps ON ps.org_id = o.id
    LEFT JOIN activity_stats act ON act.org_id = o.id
    ORDER BY o.created_at DESC;
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. PLATFORM ACCOUNT TIMELINE RPC
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.platform_account_timeline(
    p_org UUID,
    p_limit INT DEFAULT 50
)
RETURNS TABLE(
    id UUID,
    event_type TEXT,
    title TEXT,
    description TEXT,
    actor_id UUID,
    actor_name TEXT,
    created_at TIMESTAMPTZ,
    metadata JSONB
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_is_super BOOLEAN;
    v_can_access BOOLEAN;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthenticated' USING ERRCODE = '42501';
    END IF;

    v_is_super := public.is_super_admin();
    IF NOT v_is_super THEN
        RAISE EXCEPTION 'Super admin privileges required' USING ERRCODE = '42501';
    END IF;

    v_can_access := public.can_access_org(p_org);
    IF NOT v_can_access THEN
        RAISE EXCEPTION 'Access to organization denied' USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT 
        a.id,
        COALESCE(a.category, 'activity') AS event_type,
        a.title,
        COALESCE(a.description, '') AS description,
        a.actor_id,
        COALESCE(a.actor_name, 'Team Member') AS actor_name,
        a.created_at,
        COALESCE(a.metadata, '{}'::jsonb) AS metadata
    FROM public.activity_events a
    WHERE a.org_id = p_org
    ORDER BY a.created_at DESC
    LIMIT LEAST(p_limit, 200);
END;
$$;

-- ------------------------------------------------------------------------------
-- 7. GUARD EXISTING WRITE RPCs IF VIEW MODE ACTIVE
-- ------------------------------------------------------------------------------

-- Quick guard check on client creation / order submission / payment recording if RPCs exist
CREATE OR REPLACE FUNCTION public.guard_view_mode_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    IF public.is_view_mode_active() THEN
        RAISE EXCEPTION 'Read-only view mode' USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
END;
$$;
