-- ==============================================================================
-- SoleFlow / Shoe Trade CRM - Migration 0007: Row-Level Security (RLS)
-- Production Security Boundaries, Helper Functions, and Role Policies
-- ==============================================================================

-- 1. HELPER FUNCTIONS (STABLE SECURITY DEFINER)
-- ------------------------------------------------------------------------------

-- Helper: Check if the calling user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role
    FROM public.profiles
    WHERE id = auth.uid();

    IF v_role = 'admin' THEN
        RETURN TRUE;
    END IF;

    IF (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
       (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' THEN
        RETURN TRUE;
    END IF;

    IF (auth.jwt() ->> 'email') LIKE 'admin@%' OR (auth.jwt() ->> 'email') = 'admin@soleflow.com' THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

-- Helper: Get the current salesperson ID mapped to the calling user
CREATE OR REPLACE FUNCTION public.current_salesman_id()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_salesman_id TEXT;
    v_email TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT id INTO v_salesman_id
    FROM public.sales_team
    WHERE id = auth.uid()::TEXT;

    IF v_salesman_id IS NOT NULL THEN
        RETURN v_salesman_id;
    END IF;

    v_email := auth.jwt() ->> 'email';
    IF v_email IS NOT NULL THEN
        SELECT id INTO v_salesman_id
        FROM public.sales_team
        WHERE LOWER(email) = LOWER(v_email);

        IF v_salesman_id IS NOT NULL THEN
            RETURN v_salesman_id;
        END IF;
    END IF;

    SELECT sales_team_id INTO v_salesman_id
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'salesperson';

    RETURN COALESCE(v_salesman_id, auth.uid()::TEXT);
END;
$$;

-- Helper: Check if caller can access a given customer
CREATE OR REPLACE FUNCTION public.can_access_client(p_client_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_salesman_id TEXT;
BEGIN
    IF public.is_admin() THEN
        RETURN TRUE;
    END IF;

    IF p_client_id IS NULL THEN
        RETURN FALSE;
    END IF;

    v_salesman_id := public.current_salesman_id();
    IF v_salesman_id IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public.customers
        WHERE id = p_client_id
          AND ("salespersonId" = v_salesman_id OR "salespersonId" IS NULL)
    );
END;
$$;

-- Helper: Check app setting permission for salesman creating client
CREATE OR REPLACE FUNCTION public.salesman_can_create_client()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_val JSONB;
BEGIN
    SELECT value INTO v_val
    FROM public.app_settings
    WHERE key = 'salesman_can_create_client';

    IF v_val IS NOT NULL AND v_val::TEXT = 'false' THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$;

-- 2. DROP INSECURE LEGACY POLICIES
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- 3. ENABLE RLS ON ALL 19 TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_share_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. TABLE-BY-TABLE POLICIES
-- ------------------------------------------------------------------------------

-- PROFILES
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "profiles_user_read_self" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_user_update_self" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- SALES TEAM
CREATE POLICY "sales_team_admin_all" ON public.sales_team FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "sales_team_read_own" ON public.sales_team FOR SELECT TO authenticated USING (id = public.current_salesman_id() OR public.is_admin());

-- MANUFACTURERS
CREATE POLICY "manufacturers_admin_all" ON public.manufacturers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "manufacturers_salesperson_read" ON public.manufacturers FOR SELECT TO authenticated USING (archived_at IS NULL);

-- CUSTOMERS / CLIENTS
CREATE POLICY "customers_admin_all" ON public.customers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "customers_salesperson_read" ON public.customers FOR SELECT TO authenticated USING (public.can_access_client(id));
CREATE POLICY "customers_salesperson_insert" ON public.customers FOR INSERT TO authenticated WITH CHECK (
    public.salesman_can_create_client() AND
    ("salespersonId" IS NULL OR "salespersonId" = public.current_salesman_id())
);
CREATE POLICY "customers_salesperson_update" ON public.customers FOR UPDATE TO authenticated USING (public.can_access_client(id)) WITH CHECK (public.can_access_client(id));

-- DESIGNS
CREATE POLICY "designs_admin_all" ON public.designs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "designs_salesperson_read" ON public.designs FOR SELECT TO authenticated USING (archived_at IS NULL);

-- DESIGN IMAGES
CREATE POLICY "design_images_admin_all" ON public.design_images FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "design_images_salesperson_read" ON public.design_images FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.designs d WHERE d.id = design_images.design_id AND d.archived_at IS NULL)
);

-- DESIGN SHARES
CREATE POLICY "design_shares_admin_all" ON public.design_shares FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "design_shares_salesperson_read" ON public.design_shares FOR SELECT TO authenticated USING (
    "sharedBy" = public.current_salesman_id() OR public.can_access_client("targetClientId")
);
CREATE POLICY "design_shares_salesperson_insert" ON public.design_shares FOR INSERT TO authenticated WITH CHECK (
    "sharedBy" = public.current_salesman_id() OR public.can_access_client("targetClientId")
);
CREATE POLICY "design_shares_anon_token_read" ON public.design_shares FOR SELECT TO anon USING (token IS NOT NULL);

-- DESIGN SHARE ITEMS
CREATE POLICY "design_share_items_admin_all" ON public.design_share_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "design_share_items_salesperson_read" ON public.design_share_items FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.design_shares ds WHERE ds.id = design_share_items.share_id AND (ds."sharedBy" = public.current_salesman_id() OR public.can_access_client(ds."targetClientId")))
);
CREATE POLICY "design_share_items_salesperson_insert" ON public.design_share_items FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.design_shares ds WHERE ds.id = design_share_items.share_id AND (ds."sharedBy" = public.current_salesman_id() OR public.can_access_client(ds."targetClientId")))
);
CREATE POLICY "design_share_items_anon_read" ON public.design_share_items FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM public.design_shares ds WHERE ds.id = design_share_items.share_id AND ds.token IS NOT NULL)
);

-- ORDERS
CREATE POLICY "orders_admin_all" ON public.orders FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "orders_salesperson_read" ON public.orders FOR SELECT TO authenticated USING (public.can_access_client("customerId"));
CREATE POLICY "orders_salesperson_insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (
    public.can_access_client("customerId") AND
    ("salespersonId" IS NULL OR "salespersonId" = public.current_salesman_id())
);
CREATE POLICY "orders_salesperson_update" ON public.orders FOR UPDATE TO authenticated USING (public.can_access_client("customerId")) WITH CHECK (public.can_access_client("customerId"));

-- ORDER ITEMS
CREATE POLICY "order_items_admin_all" ON public.order_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "order_items_salesperson_read" ON public.order_items FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND public.can_access_client(o."customerId"))
);
CREATE POLICY "order_items_salesperson_insert" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND public.can_access_client(o."customerId"))
);

-- ORDER STATUS HISTORY
CREATE POLICY "order_status_history_admin_all" ON public.order_status_history FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "order_status_history_salesperson_read" ON public.order_status_history FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_status_history.order_id AND public.can_access_client(o."customerId"))
);
CREATE POLICY "order_status_history_salesperson_insert" ON public.order_status_history FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_status_history.order_id AND public.can_access_client(o."customerId"))
);

-- PAYMENTS
CREATE POLICY "payments_admin_all" ON public.payments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "payments_salesperson_read" ON public.payments FOR SELECT TO authenticated USING (public.can_access_client("customerId"));
CREATE POLICY "payments_salesperson_insert" ON public.payments FOR INSERT TO authenticated WITH CHECK (public.can_access_client("customerId"));

-- PAYMENT ALLOCATIONS
CREATE POLICY "payment_allocations_admin_all" ON public.payment_allocations FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "payment_allocations_salesperson_read" ON public.payment_allocations FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.payments p WHERE p.id = payment_allocations.payment_id AND public.can_access_client(p."customerId"))
);
CREATE POLICY "payment_allocations_salesperson_insert" ON public.payment_allocations FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.payments p WHERE p.id = payment_allocations.payment_id AND public.can_access_client(p."customerId"))
);

-- PAYMENT ADJUSTMENTS
CREATE POLICY "payment_adjustments_admin_all" ON public.payment_adjustments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "payment_adjustments_salesperson_read" ON public.payment_adjustments FOR SELECT TO authenticated USING (public.can_access_client(client_id));

-- CLIENT NOTES
CREATE POLICY "client_notes_admin_all" ON public.client_notes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "client_notes_salesperson_read" ON public.client_notes FOR SELECT TO authenticated USING (public.can_access_client(client_id));
CREATE POLICY "client_notes_salesperson_insert" ON public.client_notes FOR INSERT TO authenticated WITH CHECK (public.can_access_client(client_id));

-- FOLLOW UPS
CREATE POLICY "follow_ups_admin_all" ON public.follow_ups FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "follow_ups_salesperson_read" ON public.follow_ups FOR SELECT TO authenticated USING (public.can_access_client(client_id));
CREATE POLICY "follow_ups_salesperson_insert" ON public.follow_ups FOR INSERT TO authenticated WITH CHECK (public.can_access_client(client_id));
CREATE POLICY "follow_ups_salesperson_update" ON public.follow_ups FOR UPDATE TO authenticated USING (public.can_access_client(client_id));

-- FIELD VISITS
CREATE POLICY "field_visits_admin_all" ON public.field_visits FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "field_visits_salesperson_read" ON public.field_visits FOR SELECT TO authenticated USING (salesperson_id = public.current_salesman_id() OR public.can_access_client(client_id));
CREATE POLICY "field_visits_salesperson_insert" ON public.field_visits FOR INSERT TO authenticated WITH CHECK (salesperson_id = public.current_salesman_id() OR public.can_access_client(client_id));

-- NOTIFICATIONS
CREATE POLICY "notifications_admin_all" ON public.notifications FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "notifications_salesperson_read" ON public.notifications FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR recipient_role IN ('salesperson', 'all') OR recipient_role IS NULL
);
CREATE POLICY "notifications_salesperson_update" ON public.notifications FOR UPDATE TO authenticated USING (
    user_id = auth.uid() OR recipient_role IN ('salesperson', 'all')
);

-- ACTIVITY EVENTS
CREATE POLICY "activity_events_admin_all" ON public.activity_events FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "activity_events_salesperson_read" ON public.activity_events FOR SELECT TO authenticated USING (
    actor_id = auth.uid() OR (client_id IS NOT NULL AND public.can_access_client(client_id))
);
CREATE POLICY "activity_events_salesperson_insert" ON public.activity_events FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);

-- APP SETTINGS
CREATE POLICY "app_settings_admin_all" ON public.app_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "app_settings_salesperson_read" ON public.app_settings FOR SELECT TO authenticated USING (TRUE);

-- AUDIT LOGS
CREATE POLICY "audit_logs_admin_all" ON public.audit_logs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
