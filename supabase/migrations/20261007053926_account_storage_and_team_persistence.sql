-- Invited sales accounts need a durable sales_team record for visits and checklists.
CREATE OR REPLACE FUNCTION public.sync_profile_sales_team() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth,pg_temp AS $$
DECLARE v_id text;
BEGIN
    IF NEW.role='salesperson' AND NEW.org_id IS NOT NULL THEN
        SELECT id INTO v_id FROM public.sales_team
        WHERE org_id=NEW.org_id AND (id=NEW.id::text OR id=NEW.sales_team_id OR lower(email)=lower(NEW.email))
        ORDER BY (id=NEW.id::text) DESC LIMIT 1;
        IF v_id IS NULL THEN
            v_id := NEW.id::text;
            INSERT INTO public.sales_team(id,org_id,name,"roleTitle",email,phone)
            VALUES(v_id,NEW.org_id,COALESCE(NEW.full_name,split_part(NEW.email,'@',1)),'Field Sales Rep',NEW.email,NEW.phone);
        END IF;
        NEW.sales_team_id := v_id;
    END IF;
    RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.sync_profile_sales_team() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS zz_sync_profile_sales_team ON public.profiles;
CREATE TRIGGER zz_sync_profile_sales_team BEFORE INSERT OR UPDATE OF role,full_name,email,phone,org_id
ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.sync_profile_sales_team();
UPDATE public.profiles SET full_name=full_name WHERE role='salesperson';

-- Use a safe parser for legacy paths; old "designs/..." paths are not UUIDs.
CREATE OR REPLACE FUNCTION public.can_access_storage_object(p_bucket text,p_name text) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,auth,pg_temp AS $$
DECLARE v_prefix text := split_part(p_name,'/',1);
BEGIN
    IF auth.uid() IS NULL THEN RETURN false; END IF;
    IF v_prefix ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        RETURN public.can_access_org(v_prefix::uuid);
    END IF;
    IF p_bucket='design-images' THEN
        RETURN EXISTS(SELECT 1 FROM public.designs d WHERE public.can_access_org(d.org_id) AND (d.image='storage://design-images/'||p_name OR position('/design-images/'||p_name in d.image)>0));
    ELSIF p_bucket='payment-receipts' THEN
        RETURN EXISTS(SELECT 1 FROM public.payments p WHERE public.can_access_org(p.org_id) AND p.receipt_path=p_name);
    END IF;
    RETURN false;
END $$;
REVOKE ALL ON FUNCTION public.can_access_storage_object(text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.can_access_storage_object(text,text) TO authenticated;

-- Replace policies that incorrectly cast old filenames to UUIDs.
DROP POLICY IF EXISTS storage_tenant_design_images_select ON storage.objects;
DROP POLICY IF EXISTS storage_tenant_design_images_insert ON storage.objects;
DROP POLICY IF EXISTS storage_tenant_payment_receipts_all ON storage.objects;
CREATE POLICY storage_tenant_design_images_select ON storage.objects FOR SELECT TO authenticated
USING(bucket_id='design-images' AND public.can_access_storage_object(bucket_id,name));
CREATE POLICY storage_tenant_design_images_insert ON storage.objects FOR INSERT TO authenticated
WITH CHECK(bucket_id='design-images' AND public.is_admin() AND public.can_access_storage_object(bucket_id,name) AND NOT public.is_view_mode_active());
CREATE POLICY storage_tenant_payment_receipts_all ON storage.objects FOR ALL TO authenticated
USING(bucket_id='payment-receipts' AND public.can_access_storage_object(bucket_id,name))
WITH CHECK(bucket_id='payment-receipts' AND public.can_access_storage_object(bucket_id,name) AND NOT public.is_view_mode_active());
-- Existing permissive policies cannot override this account boundary.
DROP POLICY IF EXISTS account_storage_isolation ON storage.objects;
CREATE POLICY account_storage_isolation ON storage.objects AS RESTRICTIVE FOR ALL TO authenticated
USING(bucket_id NOT IN ('design-images','payment-receipts') OR public.can_access_storage_object(bucket_id,name))
WITH CHECK(bucket_id NOT IN ('design-images','payment-receipts') OR (public.can_access_storage_object(bucket_id,name) AND NOT public.is_view_mode_active()));
NOTIFY pgrst, 'reload schema';

-- profiles stores full_name; there is no name column.
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
            COALESCE(p.full_name, 'Admin') AS owner_name,
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
            COUNT(CASE WHEN o.order_date_at >= (CURRENT_DATE - INTERVAL '30 days') THEN 1 END) AS orders_last_30d,
            COALESCE(SUM(COALESCE(o."netPayable", o.subtotal, 0)), 0) AS total_order_value,
            MAX(o.created_at) AS last_order_at
        FROM public.orders o
        GROUP BY o.org_id
    ),
    payment_stats AS (
        SELECT
            p.org_id,
            COUNT(*) AS payments_count,
            COALESCE(SUM(p."paymentAmount"), 0) AS total_collected,
            MAX(p.payment_date_at) AS last_payment_at
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
        COALESCE(ow.owner_email, '')::text AS owner_email,
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
