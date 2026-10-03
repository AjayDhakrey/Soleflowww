-- ==============================================================================
-- 0013 — MULTI-TENANT ISOLATION, BUSINESS SIGNUP, SUPER ADMIN & DEMO FENCING
-- Idempotent, additive migration.
-- Enforces absolute data isolation per organization via RLS and DB triggers.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ORGANIZATIONS & INVITES TABLES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 120),
    phone TEXT,
    city TEXT,
    state TEXT,
    gstin TEXT,
    owner_id UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_owner ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(status);

-- Profiles tenant and super admin columns
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id),
    ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_demo_account BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON public.profiles(org_id);

CREATE TABLE IF NOT EXISTS public.org_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'salesperson' CHECK (role IN ('admin', 'salesperson')),
    token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    invited_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '7 days',
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_invites_token ON public.org_invites(token);
CREATE INDEX IF NOT EXISTS idx_org_invites_org ON public.org_invites(org_id);

-- Super Admin Access Log
CREATE TABLE IF NOT EXISTS public.super_admin_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    record_type TEXT NOT NULL,
    record_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_super_admin_access_log_admin ON public.super_admin_access_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_super_admin_access_log_org ON public.super_admin_access_log(org_id);

-- ------------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS
-- ------------------------------------------------------------------------------

-- Current Org ID of authenticated user
CREATE OR REPLACE FUNCTION public.current_org_id() 
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth, pg_temp
AS $$ 
    SELECT p.org_id 
    FROM public.profiles p 
    JOIN public.organizations o ON o.id = p.org_id
    WHERE p.id = auth.uid() AND o.status = 'active';
$$;

-- Super Admin Check
CREATE OR REPLACE FUNCTION public.is_super_admin() 
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth, pg_temp
AS $$ 
    SELECT COALESCE((SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()), false);
$$;

-- Demo Account Check
CREATE OR REPLACE FUNCTION public.is_current_demo_account() 
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth, pg_temp
AS $$ 
    SELECT COALESCE((SELECT is_demo_account FROM public.profiles WHERE id = auth.uid()), false);
$$;

-- Check Org Access (Handles Normal Users, Real Super Admin, and Demo Super Admin)
CREATE OR REPLACE FUNCTION public.can_access_org(p_org UUID) 
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_is_super BOOLEAN;
    v_is_demo_user BOOLEAN;
    v_org_is_demo BOOLEAN;
BEGIN
    IF p_org IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Direct org match
    IF p_org = public.current_org_id() THEN
        RETURN TRUE;
    END IF;

    v_is_super := public.is_super_admin();
    IF v_is_super THEN
        v_is_demo_user := public.is_current_demo_account();
        IF v_is_demo_user THEN
            SELECT is_demo INTO v_org_is_demo FROM public.organizations WHERE id = p_org;
            RETURN COALESCE(v_org_is_demo, false);
        ELSE
            RETURN TRUE;
        END IF;
    END IF;

    RETURN FALSE;
END;
$$;

-- Enhanced is_admin(): includes super admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    IF public.is_super_admin() THEN
        RETURN TRUE;
    END IF;
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RETURN TRUE;
    END IF;
    RETURN COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', FALSE);
END;
$$;

-- Guard profile role and super admin changes
CREATE OR REPLACE FUNCTION public.guard_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NOT NULL THEN
        -- Prevent changing is_super_admin or is_demo_account from client API
        IF NEW.is_super_admin IS DISTINCT FROM OLD.is_super_admin THEN
            RAISE EXCEPTION 'is_super_admin can only be modified via database administrator.' USING ERRCODE = '42501';
        END IF;

        IF NEW.is_demo_account IS DISTINCT FROM OLD.is_demo_account THEN
            RAISE EXCEPTION 'is_demo_account can only be modified via database administrator.' USING ERRCODE = '42501';
        END IF;

        -- Prevent changing org_id
        IF NEW.org_id IS DISTINCT FROM OLD.org_id AND NOT public.is_super_admin() THEN
            RAISE EXCEPTION 'org_id cannot be changed by user.' USING ERRCODE = '42501';
        END IF;

        -- Prevent self-promotion or non-admin changing role
        IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
            RAISE EXCEPTION 'Only an admin can change user roles.' USING ERRCODE = '42501';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_role_change ON public.profiles;
CREATE TRIGGER trg_guard_profile_role_change
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role_change();

-- ------------------------------------------------------------------------------
-- 3. DEFAULT ORGANIZATION & DATA BACKFILL
-- ------------------------------------------------------------------------------

DO $$
DECLARE
    v_default_org_id UUID;
    v_first_admin_id UUID;
BEGIN
    -- Find existing admin or null
    SELECT id INTO v_first_admin_id FROM public.profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1;

    -- Ensure default organization exists
    SELECT id INTO v_default_org_id FROM public.organizations WHERE name = 'ShoeConnect (default)' LIMIT 1;
    IF v_default_org_id IS NULL THEN
        INSERT INTO public.organizations (name, phone, city, state, gstin, owner_id)
        VALUES ('ShoeConnect (default)', '+91 98000 00000', 'Agra', 'Uttar Pradesh', '09AAAAA0000A1Z5', v_first_admin_id)
        RETURNING id INTO v_default_org_id;
    END IF;

    -- Backfill profiles
    UPDATE public.profiles SET org_id = v_default_org_id WHERE org_id IS NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 4. GENERIC TRIGGER FUNCTION TO ENFORCE ORG_ID
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.force_org_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_cur_org UUID;
    v_is_super BOOLEAN;
BEGIN
    v_is_super := public.is_super_admin();
    v_cur_org := public.current_org_id();

    IF TG_OP = 'INSERT' THEN
        IF auth.uid() IS NOT NULL THEN
            IF v_is_super AND NEW.org_id IS NOT NULL THEN
                -- Super admin explicitly targeting a specific org
                NULL;
            ELSE
                IF v_cur_org IS NULL THEN
                    RAISE EXCEPTION 'User has no active organization' USING ERRCODE = '42501';
                END IF;
                NEW.org_id := v_cur_org;
            END IF;
        ELSE
            -- Service role / backend without auth.uid
            IF NEW.org_id IS NULL THEN
                SELECT id INTO NEW.org_id FROM public.organizations WHERE name = 'ShoeConnect (default)' LIMIT 1;
            END IF;
        END IF;

        IF NEW.org_id IS NULL THEN
            RAISE EXCEPTION 'org_id is mandatory' USING ERRCODE = '23502';
        END IF;

        -- Log super admin mutation if actor is super admin and target is another org
        IF v_is_super AND auth.uid() IS NOT NULL THEN
            INSERT INTO public.super_admin_access_log (admin_id, org_id, action, record_type, record_id)
            VALUES (auth.uid(), NEW.org_id, 'INSERT', TG_TABLE_NAME, COALESCE(NEW.id::text, 'NEW'));
        END IF;

    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.org_id IS DISTINCT FROM OLD.org_id THEN
            RAISE EXCEPTION 'org_id cannot be changed once assigned.' USING ERRCODE = '42501';
        END IF;

        IF v_is_super AND auth.uid() IS NOT NULL THEN
            INSERT INTO public.super_admin_access_log (admin_id, org_id, action, record_type, record_id)
            VALUES (auth.uid(), NEW.org_id, 'UPDATE', TG_TABLE_NAME, COALESCE(NEW.id::text, OLD.id::text));
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        IF v_is_super AND auth.uid() IS NOT NULL THEN
            INSERT INTO public.super_admin_access_log (admin_id, org_id, action, record_type, record_id)
            VALUES (auth.uid(), OLD.org_id, 'DELETE', TG_TABLE_NAME, COALESCE(OLD.id::text, 'DELETED'));
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. ATTACH ORG_ID + INDEX + TRIGGER + RESTRICTIVE RLS TO ALL BUSINESS TABLES
-- ------------------------------------------------------------------------------

DO $$
DECLARE
    v_default_org_id UUID;
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
        'app_settings'
    ];
BEGIN
    SELECT id INTO v_default_org_id FROM public.organizations WHERE name = 'ShoeConnect (default)' LIMIT 1;

    FOREACH t IN ARRAY v_tables LOOP
        -- Check if table exists
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
            -- 1. Add org_id column
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id);', t);
            
            -- 2. Backfill nulls
            EXECUTE format('UPDATE public.%I SET org_id = %L WHERE org_id IS NULL;', t, v_default_org_id);
            
            -- 3. Set default and NOT NULL
            EXECUTE format('ALTER TABLE public.%I ALTER COLUMN org_id SET DEFAULT public.current_org_id();', t);
            EXECUTE format('ALTER TABLE public.%I ALTER COLUMN org_id SET NOT NULL;', t);

            -- 4. Index
            EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_org_id ON public.%I(org_id);', t, t);

            -- 5. Trigger
            EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_force_org ON public.%I;', t, t);
            EXECUTE format('CREATE TRIGGER trg_%I_force_org BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.force_org_id();', t, t);

            -- 6. Enable & Force RLS
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
            EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY;', t);

            -- 7. Restrictive tenant policy
            EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON public.%I;', t);
            EXECUTE format('CREATE POLICY tenant_isolation ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (public.can_access_org(org_id)) WITH CHECK (public.can_access_org(org_id));', t);

            -- 8. Revoke from anon
            EXECUTE format('REVOKE ALL ON public.%I FROM anon;', t);
        END IF;
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 6. PER-ORG UNIQUE CONSTRAINTS & APP SETTINGS PK
-- ------------------------------------------------------------------------------

-- Designs: articleCode is unique PER ORG
ALTER TABLE public.designs DROP CONSTRAINT IF EXISTS designs_articleCode_key;
ALTER TABLE public.designs DROP CONSTRAINT IF EXISTS designs_org_article_code_unique;
ALTER TABLE public.designs ADD CONSTRAINT designs_org_article_code_unique UNIQUE (org_id, "articleCode");

-- Payments: receiptNumber is unique PER ORG
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_receiptNumber_key;
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_org_receipt_number_unique;
ALTER TABLE public.payments ADD CONSTRAINT payments_org_receipt_number_unique UNIQUE (org_id, "receiptNumber");

-- App settings: key unique PER ORG
ALTER TABLE public.app_settings DROP CONSTRAINT IF EXISTS app_settings_pkey CASCADE;
ALTER TABLE public.app_settings ADD PRIMARY KEY (org_id, key);

-- ------------------------------------------------------------------------------
-- 7. ORGANIZATIONS, PROFILES & ORG_INVITES RLS
-- ------------------------------------------------------------------------------

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizations_select" ON public.organizations;
CREATE POLICY "organizations_select" ON public.organizations
    FOR SELECT TO authenticated
    USING (public.can_access_org(id));

DROP POLICY IF EXISTS "organizations_update" ON public.organizations;
CREATE POLICY "organizations_update" ON public.organizations
    FOR UPDATE TO authenticated
    USING (public.is_super_admin() OR (id = public.current_org_id() AND public.is_admin()))
    WITH CHECK (public.is_super_admin() OR (id = public.current_org_id() AND public.is_admin()));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_tenant" ON public.profiles;
CREATE POLICY "profiles_select_tenant" ON public.profiles
    AS RESTRICTIVE FOR ALL TO authenticated
    USING (public.is_super_admin() OR org_id = public.current_org_id() OR id = auth.uid())
    WITH CHECK (public.is_super_admin() OR org_id = public.current_org_id() OR id = auth.uid());

ALTER TABLE public.org_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_invites FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_invites_admin_all" ON public.org_invites;
CREATE POLICY "org_invites_admin_all" ON public.org_invites
    FOR ALL TO authenticated
    USING (public.is_super_admin() OR (org_id = public.current_org_id() AND public.is_admin()))
    WITH CHECK (public.is_super_admin() OR (org_id = public.current_org_id() AND public.is_admin()));

-- Super Admin access log RLS (super admin only)
ALTER TABLE public.super_admin_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admin_access_log FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_access_log_policy" ON public.super_admin_access_log;
CREATE POLICY "super_admin_access_log_policy" ON public.super_admin_access_log
    FOR ALL TO authenticated
    USING (public.is_super_admin());

-- ------------------------------------------------------------------------------
-- 8. SIGNUP TRIGGER (Replaces handle_new_user)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_invite_token_raw TEXT;
    v_invite_token UUID;
    v_invite RECORD;
    v_org_id UUID;
    v_role TEXT := 'salesperson';
    v_business_name TEXT;
    v_phone TEXT;
    v_city TEXT;
    v_gstin TEXT;
BEGIN
    v_invite_token_raw := NEW.raw_user_meta_data->>'invite_token';
    v_phone := NEW.raw_user_meta_data->>'phone';
    v_city := COALESCE(NEW.raw_user_meta_data->>'city', 'Agra');
    v_gstin := NEW.raw_user_meta_data->>'gstin';

    -- Case 1: Joining via Org Invite
    IF v_invite_token_raw IS NOT NULL AND TRIM(v_invite_token_raw) <> '' THEN
        BEGIN
            v_invite_token := v_invite_token_raw::UUID;
            SELECT * INTO v_invite
            FROM public.org_invites
            WHERE token = v_invite_token
              AND (LOWER(email) = LOWER(NEW.email) OR email IS NOT NULL)
              AND expires_at > now()
              AND accepted_at IS NULL;

            IF v_invite.id IS NOT NULL THEN
                v_org_id := v_invite.org_id;
                v_role := v_invite.role;

                -- Mark invite accepted
                UPDATE public.org_invites
                SET accepted_at = now()
                WHERE id = v_invite.id;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            v_org_id := NULL;
        END;
    END IF;

    -- Case 2: New Business Signup (Org Owner / Admin)
    IF v_org_id IS NULL THEN
        v_business_name := COALESCE(NEW.raw_user_meta_data->>'business_name', NEW.raw_user_meta_data->>'businessName');
        IF v_business_name IS NULL OR TRIM(v_business_name) = '' THEN
            v_business_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '''s Footwear';
        END IF;

        INSERT INTO public.organizations (name, phone, city, gstin, owner_id)
        VALUES (TRIM(v_business_name), v_phone, v_city, v_gstin, NEW.id)
        RETURNING id INTO v_org_id;

        v_role := 'admin';

        -- Seed initial app settings for this organization
        INSERT INTO public.app_settings (org_id, key, value, description)
        VALUES 
            (v_org_id, 'salesman_can_create_client', 'true'::jsonb, 'Allow field salesmen to register new client accounts'),
            (v_org_id, 'salesman_can_record_collection', 'true'::jsonb, 'Allow salesmen to log payments (status=recorded)'),
            (v_org_id, 'salesman_can_approve_orders', 'false'::jsonb, 'Allow salesmen to directly approve wholesale orders'),
            (v_org_id, 'default_gst_percent', '12'::jsonb, 'Default GST rate percentage for footwear orders'),
            (v_org_id, 'overdue_after_days', '30'::jsonb, 'Days after delivery when unpaid balance is marked Overdue'),
            (v_org_id, 'default_trade_discount_percent', '8'::jsonb, 'Standard default trade discount percentage applied to footwear orders'),
            (v_org_id, 'max_trade_discount_percent', '15'::jsonb, 'Maximum allowable discount percentage threshold for special requests'),
            (v_org_id, 'min_margin_percent', '15'::jsonb, 'Minimum target profit margin threshold percentage before warning')
        ON CONFLICT (org_id, key) DO NOTHING;
    END IF;

    -- Insert Profile
    INSERT INTO public.profiles (id, org_id, full_name, email, role, phone, is_super_admin, is_demo_account)
    VALUES (
        NEW.id,
        v_org_id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        v_role,
        v_phone,
        false,
        false
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        org_id = COALESCE(public.profiles.org_id, EXCLUDED.org_id);

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 9. TRANSACTIONAL BUSINESS RPC FUNCTIONS UPDATED FOR MULTI-TENANCY
-- ------------------------------------------------------------------------------

-- 9.1 CREATE CLIENT
CREATE OR REPLACE FUNCTION public.create_client(
    p_business_name TEXT,
    p_prop_name TEXT,
    p_phone TEXT,
    p_whatsapp TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_city TEXT DEFAULT 'Agra',
    p_state TEXT DEFAULT 'Uttar Pradesh',
    p_cluster TEXT DEFAULT 'Agra Footwear Cluster',
    p_address TEXT DEFAULT NULL,
    p_gstin TEXT DEFAULT NULL,
    p_salesperson_id TEXT DEFAULT NULL,
    p_credit_limit NUMERIC DEFAULT 500000,
    p_payment_terms TEXT DEFAULT '30% Advance + 70% Bilty',
    p_org_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_client_id TEXT;
    v_salesman_name TEXT := 'Unassigned';
    v_target_org UUID;
    v_client_record JSONB;
BEGIN
    IF p_business_name IS NULL OR TRIM(p_business_name) = '' THEN
        RAISE EXCEPTION 'Business / Store name is required.';
    END IF;

    IF p_phone IS NULL OR TRIM(p_phone) = '' THEN
        RAISE EXCEPTION 'Phone number is required.';
    END IF;

    IF public.is_super_admin() AND p_org_id IS NOT NULL THEN
        v_target_org := p_org_id;
    ELSE
        v_target_org := public.current_org_id();
    END IF;

    IF v_target_org IS NULL OR NOT public.can_access_org(v_target_org) THEN
        RAISE EXCEPTION 'Invalid or inaccessible organization' USING ERRCODE = '42501';
    END IF;

    v_client_id := public.gen_client_id();

    IF p_salesperson_id IS NOT NULL THEN
        SELECT name INTO v_salesman_name 
        FROM public.sales_team 
        WHERE id = p_salesperson_id AND public.can_access_org(org_id);
        IF v_salesman_name IS NULL THEN
            v_salesman_name := 'Sales Representative';
        END IF;
    END IF;

    INSERT INTO public.customers (
        id, org_id, "businessName", "propName", phone, whatsapp, email,
        city, state, cluster, address, gstin,
        "salespersonId", "salespersonName", "creditLimit", "paymentTerms",
        status, "totalBusiness", "totalPaid", "amountDue", "ordersCount",
        created_by, created_at, updated_at
    ) VALUES (
        v_client_id, v_target_org, p_business_name, p_prop_name, p_phone, COALESCE(p_whatsapp, p_phone), p_email,
        p_city, p_state, p_cluster, p_address, p_gstin,
        p_salesperson_id, v_salesman_name, p_credit_limit, p_payment_terms,
        'active', 0, 0, 0, 0,
        auth.uid(), NOW(), NOW()
    );

    INSERT INTO public.activity_events (
        org_id, actor, actor_id, action, record_type, record_id, client_id, summary
    ) VALUES (
        v_target_org,
        COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'System Admin'),
        auth.uid(),
        'Created Client Account',
        'Client',
        v_client_id,
        v_client_id,
        'Registered client ' || p_business_name || ' in ' || p_city || ' (' || p_payment_terms || ')'
    );

    SELECT to_jsonb(c.*) INTO v_client_record FROM public.customers c WHERE c.id = v_client_id AND public.can_access_org(c.org_id);
    RETURN v_client_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 9.2 ARCHIVE CLIENT
CREATE OR REPLACE FUNCTION public.archive_client(
    p_client_id TEXT, 
    p_reason TEXT DEFAULT 'Archived by administrator'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_org_id UUID;
BEGIN
    SELECT org_id INTO v_org_id FROM public.customers WHERE id = p_client_id AND public.can_access_org(org_id);
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Customer % not found or permission denied.', p_client_id USING ERRCODE = 'P0002';
    END IF;

    UPDATE public.customers
    SET archived_at = NOW(), status = 'inactive', updated_by = auth.uid(), updated_at = NOW()
    WHERE id = p_client_id AND public.can_access_org(org_id);

    INSERT INTO public.activity_events (
        org_id, actor, actor_id, action, record_type, record_id, client_id, summary
    ) VALUES (
        v_org_id,
        COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'System Admin'),
        auth.uid(),
        'Archived Client Account',
        'Client',
        p_client_id,
        p_client_id,
        'Client account deactivated/archived: ' || p_reason
    );
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 9.3 ASSIGN SALESMAN
CREATE OR REPLACE FUNCTION public.assign_salesman(p_client_id TEXT, p_salesman_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_salesman_name TEXT;
    v_old_salesman TEXT;
    v_org_id UUID;
BEGIN
    SELECT org_id INTO v_org_id FROM public.customers WHERE id = p_client_id AND public.can_access_org(org_id);
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Customer % not found or access denied.', p_client_id USING ERRCODE = 'P0002';
    END IF;

    SELECT name INTO v_salesman_name FROM public.sales_team WHERE id = p_salesman_id AND public.can_access_org(org_id);
    IF v_salesman_name IS NULL THEN
        RAISE EXCEPTION 'Salesman ID % not found in this organization.', p_salesman_id;
    END IF;

    SELECT "salespersonName" INTO v_old_salesman FROM public.customers WHERE id = p_client_id AND public.can_access_org(org_id);

    UPDATE public.customers
    SET "salespersonId" = p_salesman_id, "salespersonName" = v_salesman_name, updated_by = auth.uid(), updated_at = NOW()
    WHERE id = p_client_id AND public.can_access_org(org_id);

    INSERT INTO public.activity_events (
        org_id, actor, actor_id, action, record_type, record_id, client_id, salesman_id, summary
    ) VALUES (
        v_org_id,
        COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'System Admin'),
        auth.uid(),
        'Reassigned Client Salesman',
        'Client',
        p_client_id,
        p_client_id,
        p_salesman_id,
        'Reassigned client from ' || COALESCE(v_old_salesman, 'None') || ' to ' || v_salesman_name
    );
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 9.4 CREATE DESIGN
CREATE OR REPLACE FUNCTION public.create_design(
    p_article_code TEXT,
    p_name TEXT,
    p_category TEXT,
    p_price NUMERIC,
    p_moq_pairs INT DEFAULT 120,
    p_moq_cartons INT DEFAULT 10,
    p_sizes JSONB DEFAULT '[6, 7, 8, 9, 10]'::jsonb,
    p_colors JSONB DEFAULT '["Slate Grey", "Midnight Black"]'::jsonb,
    p_image TEXT DEFAULT '',
    p_subline TEXT DEFAULT NULL,
    p_sole_type TEXT DEFAULT 'TPR / Phylon Sole',
    p_upper_material TEXT DEFAULT 'Synthetic Microfibre Leather',
    p_org_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_design_id TEXT;
    v_design_record JSONB;
    v_target_org UUID;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only an admin can create catalogue designs.' USING ERRCODE = '42501';
    END IF;

    IF p_article_code IS NULL OR TRIM(p_article_code) = '' THEN
        RAISE EXCEPTION 'Article code is required.';
    END IF;

    IF p_price <= 0 THEN
        RAISE EXCEPTION 'Design wholesale price must be greater than zero.';
    END IF;

    IF public.is_super_admin() AND p_org_id IS NOT NULL THEN
        v_target_org := p_org_id;
    ELSE
        v_target_org := public.current_org_id();
    END IF;

    IF v_target_org IS NULL OR NOT public.can_access_org(v_target_org) THEN
        RAISE EXCEPTION 'Invalid or inaccessible organization' USING ERRCODE = '42501';
    END IF;

    v_design_id := public.gen_design_id();

    INSERT INTO public.designs (
        id, org_id, "articleCode", name, category, price, "moqPairs", "moqCartons",
        sizes, colors, status, subline, image, "soleType", "upperMaterial",
        created_by, created_at, updated_at
    ) VALUES (
        v_design_id, v_target_org, p_article_code, p_name, p_category, p_price, p_moq_pairs, p_moq_cartons,
        p_sizes, p_colors, 'Available', p_subline, p_image, p_sole_type, p_upper_material,
        auth.uid(), NOW(), NOW()
    );

    SELECT to_jsonb(d.*) INTO v_design_record FROM public.designs d WHERE d.id = v_design_id AND public.can_access_org(d.org_id);
    RETURN v_design_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 9.5 DELETE DESIGN
CREATE OR REPLACE FUNCTION public.delete_design(p_design_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_design RECORD;
    v_order_count INT;
    v_share_count INT;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only an admin can delete designs from the catalog.' USING ERRCODE = '42501';
    END IF;

    SELECT id, org_id, "articleCode", name, image INTO v_design
    FROM public.designs 
    WHERE id = p_design_id AND public.can_access_org(org_id);

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Design % not found.', p_design_id USING ERRCODE = 'P0002';
    END IF;

    SELECT COUNT(DISTINCT order_id) INTO v_order_count
    FROM public.order_items 
    WHERE design_id = p_design_id AND public.can_access_org(org_id);

    IF v_order_count > 0 THEN
        RAISE EXCEPTION 'Design % is used in % order(s) and cannot be deleted. Archive it instead to hide it from the catalog.',
            v_design."articleCode", v_order_count USING ERRCODE = '23503';
    END IF;

    DELETE FROM public.design_share_items WHERE design_id = p_design_id AND public.can_access_org(org_id);
    GET DIAGNOSTICS v_share_count = ROW_COUNT;

    DELETE FROM public.designs WHERE id = p_design_id AND public.can_access_org(org_id);

    RETURN jsonb_build_object(
        'deleted_id', v_design.id,
        'article_code', v_design."articleCode",
        'name', v_design.name,
        'image', v_design.image,
        'removed_share_items', v_share_count
    );
END;
$$;

-- 9.6 DESIGN DELETE CHECK
CREATE OR REPLACE FUNCTION public.design_delete_check(p_design_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_orders INT;
    v_shares INT;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only an admin can manage catalog designs.' USING ERRCODE = '42501';
    END IF;
    SELECT COUNT(DISTINCT order_id) INTO v_orders FROM public.order_items WHERE design_id = p_design_id AND public.can_access_org(org_id);
    SELECT COUNT(*) INTO v_shares FROM public.design_share_items WHERE design_id = p_design_id AND public.can_access_org(org_id);
    RETURN jsonb_build_object('can_delete', v_orders = 0, 'order_count', v_orders, 'share_count', v_shares);
END;
$$;

-- 9.7 SHARE DESIGNS
CREATE OR REPLACE FUNCTION public.share_designs(
    p_design_ids TEXT[],
    p_client_ids TEXT[],
    p_channel TEXT DEFAULT 'WhatsApp'
)
RETURNS JSONB AS $$
DECLARE
    v_client_id TEXT;
    v_design_id TEXT;
    v_share_id TEXT;
    v_token UUID;
    v_client_name TEXT;
    v_client_phone TEXT;
    v_design_names TEXT[];
    v_results JSONB := '[]'::jsonb;
    v_org_id UUID := public.current_org_id();
BEGIN
    IF array_length(p_design_ids, 1) IS NULL OR array_length(p_client_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'Select at least one design and one client to share.';
    END IF;

    SELECT array_agg(name) INTO v_design_names 
    FROM public.designs 
    WHERE id = ANY(p_design_ids) AND public.can_access_org(org_id);

    FOREACH v_client_id IN ARRAY p_client_ids LOOP
        SELECT "businessName", phone, org_id INTO v_client_name, v_client_phone, v_org_id 
        FROM public.customers 
        WHERE id = v_client_id AND public.can_access_org(org_id);

        IF v_client_name IS NOT NULL THEN
            v_share_id := 'SHR-' || LPAD(nextval('seq_share_num')::TEXT, 5, '0');
            v_token := gen_random_uuid();

            INSERT INTO public.design_shares (
                id, org_id, "sharedBy", "sharedByRole", "targetClientId", "targetClientName",
                "targetPhone", "designsCount", "designIds", "designNames",
                channel, "wasViewed", "viewCount", token, created_at, updated_at
            ) VALUES (
                v_share_id,
                v_org_id,
                COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'Sales Rep'),
                COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), 'salesperson'),
                v_client_id,
                COALESCE(v_client_name, 'Client'),
                COALESCE(v_client_phone, '+91 98000 00000'),
                array_length(p_design_ids, 1),
                to_jsonb(p_design_ids),
                to_jsonb(v_design_names),
                p_channel,
                false,
                0,
                v_token,
                NOW(),
                NOW()
            );

            FOREACH v_design_id IN ARRAY p_design_ids LOOP
                INSERT INTO public.design_share_items (org_id, share_id, design_id)
                VALUES (v_org_id, v_share_id, v_design_id);
            END LOOP;

            v_results := v_results || jsonb_build_object(
                'shareId', v_share_id,
                'clientId', v_client_id,
                'token', v_token,
                'url', '/s/' || v_token::text
            );
        END IF;
    END LOOP;

    RETURN v_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 9.8 PUBLIC LOOKBOOK (get_shared_designs)
CREATE OR REPLACE FUNCTION public.get_shared_designs(p_token UUID)
RETURNS JSONB AS $$
DECLARE
    v_share RECORD;
    v_designs JSONB;
    v_org_name TEXT;
BEGIN
    SELECT * INTO v_share FROM public.design_shares WHERE token = p_token;
    IF v_share.id IS NULL THEN
        RAISE EXCEPTION 'Share link not found or expired.' USING ERRCODE = 'P0002';
    END IF;

    -- Update view metrics
    UPDATE public.design_shares
    SET "wasViewed" = true,
        "viewCount" = COALESCE("viewCount", 0) + 1,
        "lastViewedAt" = NOW()
    WHERE id = v_share.id;

    SELECT name INTO v_org_name FROM public.organizations WHERE id = v_share.org_id;

    -- Retrieve designs belonging ONLY to this share's organization
    SELECT COALESCE(jsonb_agg(to_jsonb(d.*)), '[]'::jsonb) INTO v_designs
    FROM (
        SELECT des.id, des."articleCode", des.name, des.category, des.price, des."moqPairs", des."moqCartons",
               des.sizes, des.colors, des.status, des.subline, des.image, des."soleType", des."upperMaterial"
        FROM public.designs des
        JOIN public.design_share_items dsi ON dsi.design_id = des.id
        WHERE dsi.share_id = v_share.id AND des.org_id = v_share.org_id AND des.archived_at IS NULL
    ) d;

    RETURN jsonb_build_object(
        'shareId', v_share.id,
        'businessName', v_share."targetClientName",
        'organizationName', COALESCE(v_org_name, 'SoleFlow Footwear'),
        'sharedBy', v_share."sharedBy",
        'sharedAt', v_share.created_at,
        'designs', v_designs
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

GRANT EXECUTE ON FUNCTION public.get_shared_designs(UUID) TO anon, authenticated;

-- 9.9 CREATE ORDER DRAFT
CREATE OR REPLACE FUNCTION public.create_order_draft(
    p_client_id TEXT,
    p_items JSONB,
    p_trade_discount_percent NUMERIC DEFAULT 5,
    p_gst_percent NUMERIC DEFAULT 12,
    p_advance_deposited NUMERIC DEFAULT 0,
    p_expected_delivery TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_order_id TEXT;
    v_client_record RECORD;
    v_item JSONB;
    v_total_pairs INT := 0;
    v_total_cartons INT := 0;
    v_subtotal NUMERIC(14,2) := 0;
    v_trade_discount_amount NUMERIC(14,2) := 0;
    v_taxable NUMERIC(14,2) := 0;
    v_gst_amount NUMERIC(14,2) := 0;
    v_net_payable NUMERIC(14,2) := 0;
    v_balance_due NUMERIC(14,2) := 0;
    v_order_record JSONB;
    v_design RECORD;
    v_item_qty INT;
    v_item_cartons INT;
    v_item_rate NUMERIC(14,2);
    v_item_discount NUMERIC(14,2);
    v_item_line_total NUMERIC(14,2);
    v_org_id UUID;
BEGIN
    SELECT * INTO v_client_record 
    FROM public.customers 
    WHERE id = p_client_id AND public.can_access_org(org_id);

    IF v_client_record.id IS NULL THEN
        RAISE EXCEPTION 'Customer account % not found or permission denied.', p_client_id;
    END IF;

    v_org_id := v_client_record.org_id;

    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Order must contain at least one design item.';
    END IF;

    v_order_id := public.gen_order_id();

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        SELECT * INTO v_design 
        FROM public.designs 
        WHERE id = (v_item->>'designId') AND org_id = v_org_id;

        IF v_design.id IS NULL THEN
            RAISE EXCEPTION 'Design % does not exist in this organization.', (v_item->>'designId');
        END IF;

        IF v_design.archived_at IS NOT NULL THEN
            RAISE EXCEPTION 'Design % is archived and cannot be ordered.', v_design.name;
        END IF;

        v_item_qty := COALESCE((v_item->>'qtyPairs')::INT, (v_item->>'quantity')::INT, 120);
        IF v_item_qty <= 0 THEN
            RAISE EXCEPTION 'Quantity for design % must be greater than 0.', v_design.name;
        END IF;

        v_item_cartons := COALESCE((v_item->>'cartons')::INT, CEIL(v_item_qty::NUMERIC / 12));
        v_item_rate := COALESCE((v_item->>'rate')::NUMERIC, v_design.price);
        v_item_discount := COALESCE((v_item->>'discount')::NUMERIC, 0);
        v_item_line_total := (v_item_qty * v_item_rate) - v_item_discount;

        v_total_pairs := v_total_pairs + v_item_qty;
        v_total_cartons := v_total_cartons + v_item_cartons;
        v_subtotal := v_subtotal + v_item_line_total;

        INSERT INTO public.order_items (
            org_id, order_id, design_id, design_code_snapshot, design_name_snapshot,
            size_matrix, qty_pairs, cartons, rate, discount, created_at
        ) VALUES (
            v_org_id, v_order_id, v_design.id, v_design."articleCode", v_design.name,
            COALESCE(v_item->'sizeMatrix', '[]'::jsonb), v_item_qty, v_item_cartons, v_item_rate, v_item_discount, NOW()
        );
    END LOOP;

    -- Financial Totals
    v_trade_discount_amount := ROUND((v_subtotal * COALESCE(p_trade_discount_percent, 0) / 100.0), 2);
    v_taxable := v_subtotal - v_trade_discount_amount;
    v_gst_amount := ROUND((v_taxable * COALESCE(p_gst_percent, 12) / 100.0), 2);
    v_net_payable := v_taxable + v_gst_amount;
    v_balance_due := GREATEST(0, v_net_payable - COALESCE(p_advance_deposited, 0));

    INSERT INTO public.orders (
        id, org_id, "customerId", "customerName", "propName", "customerCity", "customerState",
        "salespersonId", "salespersonName", items, "pairsCount", "cartonsCount",
        "wholesaleRate", subtotal, "tradeDiscountPercent", "tradeDiscountAmount",
        "taxableSubtotal", "gstPercent", "gstAmount", "netPayable",
        "advanceDeposited", "balanceDue", "expectedDelivery", "paymentStatus",
        status, "orderDate", order_date_at, created_by, created_at, updated_at
    ) VALUES (
        v_order_id, v_org_id, v_client_record.id, v_client_record."businessName", v_client_record."propName",
        v_client_record.city, v_client_record.state, v_client_record."salespersonId", v_client_record."salespersonName",
        p_items, v_total_pairs, v_total_cartons, (v_subtotal / v_total_pairs)::NUMERIC(14,2),
        v_subtotal, p_trade_discount_percent, v_trade_discount_amount,
        v_taxable, p_gst_percent, v_gst_amount, v_net_payable,
        p_advance_deposited, v_balance_due, COALESCE(p_expected_delivery, 'Est. 15 Days'),
        CASE WHEN p_advance_deposited >= v_net_payable THEN 'Paid' WHEN p_advance_deposited > 0 THEN 'Advance Deposited' ELSE 'Payment Pending' END,
        'Submitted', TO_CHAR(NOW(), 'DD Mon YYYY'), NOW(), auth.uid(), NOW(), NOW()
    );

    INSERT INTO public.order_status_history (org_id, order_id, from_status, to_status, actor, actor_id, note)
    VALUES (v_org_id, v_order_id, NULL, 'Submitted', COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'System'), auth.uid(), 'Order submitted');

    SELECT to_jsonb(o.*) INTO v_order_record FROM public.orders o WHERE o.id = v_order_id AND public.can_access_org(o.org_id);
    RETURN v_order_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 9.10 ADVANCE ORDER STATUS
CREATE OR REPLACE FUNCTION public.advance_order_status(
    p_order_id TEXT,
    p_to_status TEXT,
    p_note TEXT DEFAULT ''
)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_from_status TEXT;
    v_is_valid BOOLEAN := false;
BEGIN
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id AND public.can_access_org(org_id);
    IF v_order.id IS NULL THEN
        RAISE EXCEPTION 'Order % not found or permission denied.', p_order_id USING ERRCODE = 'P0002';
    END IF;

    v_from_status := v_order.status;

    IF (v_from_status = 'Draft' AND p_to_status IN ('Submitted', 'Cancelled')) OR
       (v_from_status = 'Submitted' AND p_to_status IN ('Under Review', 'Draft', 'Confirmed', 'Cancelled')) OR
       (v_from_status = 'Under Review' AND p_to_status IN ('Confirmed', 'Draft', 'Cancelled')) OR
       (v_from_status = 'Confirmed' AND p_to_status IN ('Pending Manufacturer', 'In Production', 'On Hold', 'Cancelled')) OR
       (v_from_status = 'Pending Manufacturer' AND p_to_status IN ('In Production', 'On Hold', 'Cancelled')) OR
       (v_from_status = 'In Production' AND p_to_status IN ('Ready', 'On Hold')) OR
       (v_from_status = 'Ready' AND p_to_status IN ('Dispatched', 'On Hold')) OR
       (v_from_status = 'Dispatched' AND p_to_status IN ('Partially Delivered', 'Delivered')) OR
       (v_from_status = 'Partially Delivered' AND p_to_status = 'Delivered') OR
       (v_from_status = 'Delivered' AND p_to_status IN ('Payment Pending', 'Paid', 'Closed')) OR
       (v_from_status = 'Payment Pending' AND p_to_status IN ('Paid', 'Closed')) OR
       (v_from_status = 'Paid' AND p_to_status = 'Closed') OR
       (v_from_status = 'On Hold') OR
       (p_to_status = 'Cancelled') THEN
        v_is_valid := true;
    END IF;

    IF NOT v_is_valid THEN
        RAISE EXCEPTION 'Invalid order state transition from "%" to "%".', v_from_status, p_to_status;
    END IF;

    UPDATE public.orders
    SET status = p_to_status, updated_by = auth.uid(), updated_at = NOW()
    WHERE id = p_order_id AND public.can_access_org(org_id);

    INSERT INTO public.order_status_history (
        org_id, order_id, from_status, to_status, actor, actor_id, note
    ) VALUES (
        v_order.org_id,
        p_order_id, v_from_status, p_to_status,
        COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'System Admin'),
        auth.uid(),
        p_note
    );

    RETURN jsonb_build_object('orderId', p_order_id, 'fromStatus', v_from_status, 'toStatus', p_to_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 9.11 RECORD PAYMENT (Enhanced Multi-Tenant with Cheque support)
CREATE OR REPLACE FUNCTION public.record_payment(
    p_client_id TEXT,
    p_amount NUMERIC,
    p_method TEXT DEFAULT 'UPI',
    p_reference TEXT DEFAULT '',
    p_payment_date TIMESTAMPTZ DEFAULT NOW(),
    p_allocations JSONB DEFAULT '[]'::jsonb,
    p_notes TEXT DEFAULT '',
    p_cheque_no TEXT DEFAULT NULL,
    p_cheque_bank TEXT DEFAULT NULL,
    p_cheque_date DATE DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL,
    p_org_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_payment_id TEXT;
    v_receipt_num TEXT;
    v_client RECORD;
    v_payment_record JSONB;
    v_status TEXT;
    v_remaining_amount NUMERIC(14,2);
    v_alloc JSONB;
    v_alloc_order_id TEXT;
    v_alloc_amount NUMERIC(14,2);
    v_collector_name TEXT;
    v_existing_id TEXT;
    v_org_id UUID;
BEGIN
    -- Idempotency check
    IF p_idempotency_key IS NOT NULL AND TRIM(p_idempotency_key) <> '' THEN
        SELECT id INTO v_existing_id 
        FROM public.payments 
        WHERE idempotency_key = p_idempotency_key AND public.can_access_org(org_id) 
        LIMIT 1;
        
        IF v_existing_id IS NOT NULL THEN
            SELECT to_jsonb(p.*) INTO v_payment_record FROM public.payments p WHERE p.id = v_existing_id;
            RETURN v_payment_record;
        END IF;
    END IF;

    -- Validate client & get org
    SELECT * INTO v_client FROM public.customers WHERE id = p_client_id AND public.can_access_org(org_id);
    IF v_client.id IS NULL THEN
        RAISE EXCEPTION 'Customer % not found or permission denied.', p_client_id USING ERRCODE = 'P0002';
    END IF;

    v_org_id := v_client.org_id;

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Payment amount must be greater than zero.';
    END IF;

    IF UPPER(p_method) = 'CHEQUE' THEN
        IF p_cheque_no IS NULL OR TRIM(p_cheque_no) = '' THEN
            RAISE EXCEPTION 'Cheque number is required for Cheque payments.';
        END IF;
        IF p_cheque_bank IS NULL OR TRIM(p_cheque_bank) = '' THEN
            RAISE EXCEPTION 'Cheque bank name is required for Cheque payments.';
        END IF;
        v_status := 'pending_clearance';
    ELSE
        v_status := 'recorded';
    END IF;

    v_payment_id := public.gen_payment_id();
    v_receipt_num := 'SF-REC-' || LPAD(nextval('seq_payment_num')::TEXT, 5, '0');
    v_collector_name := COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'Sales Rep');

    INSERT INTO public.payments (
        id, org_id, "receiptNumber", "customerId", "customerName", "customerCity",
        "amountDueBefore", "paymentAmount", "amountDueAfter",
        "paymentDate", "paymentMethod", "utrRef", "collectedBy", notes, "sentSms",
        status, cheque_no, cheque_bank, cheque_date, idempotency_key,
        payment_date_at, created_by, created_at, updated_at
    ) VALUES (
        v_payment_id, v_org_id, v_receipt_num, v_client.id, v_client."businessName", v_client.city,
        v_client."amountDue", p_amount, GREATEST(0, v_client."amountDue" - p_amount),
        TO_CHAR(COALESCE(p_payment_date, NOW()), 'DD Mon YYYY'),
        p_method, p_reference, v_collector_name, p_notes, true,
        v_status, p_cheque_no, p_cheque_bank, p_cheque_date, p_idempotency_key,
        COALESCE(p_payment_date, NOW()), auth.uid(), NOW(), NOW()
    );

    -- Multi-order allocations
    IF jsonb_array_length(p_allocations) > 0 THEN
        FOR v_alloc IN SELECT * FROM jsonb_array_elements(p_allocations) LOOP
            v_alloc_order_id := v_alloc->>'orderId';
            v_alloc_amount := (v_alloc->>'amount')::NUMERIC;
            IF v_alloc_amount > 0 AND v_alloc_order_id IS NOT NULL THEN
                INSERT INTO public.payment_allocations (org_id, payment_id, order_id, amount)
                VALUES (v_org_id, v_payment_id, v_alloc_order_id, v_alloc_amount);
            END IF;
        END LOOP;
    END IF;

    -- Update client balances immediately for verified / online modes
    IF v_status <> 'pending_clearance' THEN
        UPDATE public.customers
        SET "totalPaid" = "totalPaid" + p_amount,
            "amountDue" = GREATEST(0, "amountDue" - p_amount),
            "lastPaymentDate" = 'Today',
            "lastPaymentAmount" = p_amount,
            last_payment_at = NOW(),
            updated_at = NOW()
        WHERE id = p_client_id AND org_id = v_org_id;
    END IF;

    -- Activity & Notifications
    INSERT INTO public.activity_events (
        org_id, actor, actor_id, action, record_type, record_id, client_id, payment_id, summary
    ) VALUES (
        v_org_id,
        v_collector_name,
        auth.uid(),
        'Recorded Payment Collection',
        'Payment',
        v_payment_id,
        v_client.id,
        v_payment_id,
        'Collected ₹' || TO_CHAR(p_amount, 'FM99,99,999') || ' (' || p_method || ') from ' || v_client."businessName"
    );

    SELECT to_jsonb(p.*) INTO v_payment_record FROM public.payments p WHERE p.id = v_payment_id AND public.can_access_org(p.org_id);
    RETURN v_payment_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 9.12 VERIFY PAYMENT
CREATE OR REPLACE FUNCTION public.verify_payment(p_payment_id TEXT)
RETURNS JSONB AS $$
DECLARE
    v_payment RECORD;
    v_client RECORD;
    v_result JSONB;
BEGIN
    SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id AND public.can_access_org(org_id);
    IF v_payment.id IS NULL THEN
        RAISE EXCEPTION 'Payment % not found or access denied.', p_payment_id USING ERRCODE = 'P0002';
    END IF;

    IF v_payment.status = 'verified' THEN
        SELECT to_jsonb(p.*) INTO v_result FROM public.payments p WHERE p.id = p_payment_id;
        RETURN v_result;
    END IF;

    SELECT * INTO v_client FROM public.customers WHERE id = v_payment."customerId" AND org_id = v_payment.org_id;

    UPDATE public.payments
    SET status = 'verified',
        verified_by = auth.uid(),
        verified_at = NOW(),
        updated_at = NOW()
    WHERE id = p_payment_id AND org_id = v_payment.org_id;

    IF v_payment.status IN ('pending_clearance', 'recorded') AND v_client.id IS NOT NULL THEN
        UPDATE public.customers
        SET "totalPaid" = "totalPaid" + v_payment."paymentAmount",
            "amountDue" = GREATEST(0, "amountDue" - v_payment."paymentAmount"),
            last_payment_at = NOW(),
            updated_at = NOW()
        WHERE id = v_client.id AND org_id = v_payment.org_id;
    END IF;

    INSERT INTO public.activity_events (
        org_id, actor, actor_id, action, record_type, record_id, client_id, payment_id, summary
    ) VALUES (
        v_payment.org_id,
        COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'Accounts Admin'),
        auth.uid(),
        'Verified Payment',
        'Payment',
        p_payment_id,
        v_payment."customerId",
        p_payment_id,
        'Payment receipt ' || v_payment."receiptNumber" || ' (₹' || TO_CHAR(v_payment."paymentAmount", 'FM99,99,999') || ') verified.'
    );

    SELECT to_jsonb(p.*) INTO v_result FROM public.payments p WHERE p.id = p_payment_id;
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 9.13 CLEAR CHEQUE
CREATE OR REPLACE FUNCTION public.clear_cheque(p_payment_id TEXT)
RETURNS JSONB AS $$
DECLARE
    v_payment RECORD;
    v_client RECORD;
    v_result JSONB;
BEGIN
    SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id AND public.can_access_org(org_id);
    IF v_payment.id IS NULL THEN
        RAISE EXCEPTION 'Payment % not found or access denied.', p_payment_id USING ERRCODE = 'P0002';
    END IF;

    IF v_payment.status <> 'pending_clearance' THEN
        RAISE EXCEPTION 'Payment % is not in pending_clearance status (current: %)', p_payment_id, v_payment.status;
    END IF;

    SELECT * INTO v_client FROM public.customers WHERE id = v_payment."customerId" AND org_id = v_payment.org_id;

    UPDATE public.payments
    SET status = 'verified',
        verified_by = auth.uid(),
        verified_at = NOW(),
        "amountDueAfter" = GREATEST(0, COALESCE(v_client."amountDue", 0) - v_payment."paymentAmount"),
        updated_at = NOW()
    WHERE id = p_payment_id AND org_id = v_payment.org_id;

    IF v_client.id IS NOT NULL THEN
        UPDATE public.customers
        SET "totalPaid" = "totalPaid" + v_payment."paymentAmount",
            "amountDue" = GREATEST(0, "amountDue" - v_payment."paymentAmount"),
            "lastPaymentDate" = 'Today',
            "lastPaymentAmount" = v_payment."paymentAmount",
            last_payment_at = NOW(),
            updated_at = NOW()
        WHERE id = v_client.id AND org_id = v_payment.org_id;
    END IF;

    INSERT INTO public.activity_events (
        org_id, actor, actor_id, action, record_type, record_id, client_id, payment_id, summary
    ) VALUES (
        v_payment.org_id,
        COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'Accounts Admin'),
        auth.uid(),
        'Cleared Cheque Payment',
        'Payment',
        p_payment_id,
        v_payment."customerId",
        p_payment_id,
        'Cheque #' || COALESCE(v_payment.cheque_no, '') || ' (' || COALESCE(v_payment.cheque_bank, '') || ') of ₹' || TO_CHAR(v_payment."paymentAmount", 'FM99,99,999') || ' cleared successfully.'
    );

    SELECT to_jsonb(p.*) INTO v_result FROM public.payments p WHERE p.id = p_payment_id;
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 9.14 BOUNCE CHEQUE
CREATE OR REPLACE FUNCTION public.bounce_cheque(p_payment_id TEXT, p_reason TEXT DEFAULT 'Insufficient funds')
RETURNS JSONB AS $$
DECLARE
    v_payment RECORD;
    v_result JSONB;
BEGIN
    SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id AND public.can_access_org(org_id);
    IF v_payment.id IS NULL THEN
        RAISE EXCEPTION 'Payment % not found or access denied.', p_payment_id USING ERRCODE = 'P0002';
    END IF;

    IF v_payment.status NOT IN ('pending_clearance', 'recorded') THEN
        RAISE EXCEPTION 'Payment % cannot be bounced from status "%"', p_payment_id, v_payment.status;
    END IF;

    UPDATE public.payments
    SET status = 'bounced',
        bounce_reason = COALESCE(p_reason, 'Cheque dishonoured / bounced'),
        updated_at = NOW()
    WHERE id = p_payment_id AND org_id = v_payment.org_id;

    INSERT INTO public.activity_events (
        org_id, actor, actor_id, action, record_type, record_id, client_id, payment_id, summary
    ) VALUES (
        v_payment.org_id,
        COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'Accounts Admin'),
        auth.uid(),
        'Cheque Bounced',
        'Payment',
        p_payment_id,
        v_payment."customerId",
        p_payment_id,
        'Cheque #' || COALESCE(v_payment.cheque_no, '') || ' of ₹' || TO_CHAR(v_payment."paymentAmount", 'FM99,99,999') || ' bounced: ' || COALESCE(p_reason, 'Dishonoured')
    );

    SELECT to_jsonb(p.*) INTO v_result FROM public.payments p WHERE p.id = p_payment_id;
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 9.15 REVERSE PAYMENT
CREATE OR REPLACE FUNCTION public.reverse_payment(p_payment_id TEXT, p_reason TEXT DEFAULT 'Payment reversal')
RETURNS JSONB AS $$
DECLARE
    v_payment RECORD;
    v_client RECORD;
    v_result JSONB;
BEGIN
    SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id AND public.can_access_org(org_id);
    IF v_payment.id IS NULL THEN
        RAISE EXCEPTION 'Payment % not found or access denied.', p_payment_id USING ERRCODE = 'P0002';
    END IF;

    IF v_payment.status = 'reversed' THEN
        RAISE EXCEPTION 'Payment % is already reversed.', p_payment_id;
    END IF;

    SELECT * INTO v_client FROM public.customers WHERE id = v_payment."customerId" AND org_id = v_payment.org_id;

    UPDATE public.payments
    SET status = 'reversed',
        reversal_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_payment_id AND org_id = v_payment.org_id;

    IF v_payment.status = 'verified' AND v_client.id IS NOT NULL THEN
        UPDATE public.customers
        SET "totalPaid" = GREATEST(0, "totalPaid" - v_payment."paymentAmount"),
            "amountDue" = "amountDue" + v_payment."paymentAmount",
            updated_at = NOW()
        WHERE id = v_client.id AND org_id = v_payment.org_id;
    END IF;

    INSERT INTO public.activity_events (
        org_id, actor, actor_id, action, record_type, record_id, client_id, payment_id, summary
    ) VALUES (
        v_payment.org_id,
        COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'Accounts Admin'),
        auth.uid(),
        'Reversed Payment',
        'Payment',
        p_payment_id,
        v_payment."customerId",
        p_payment_id,
        'Payment ' || v_payment."receiptNumber" || ' of ₹' || TO_CHAR(v_payment."paymentAmount", 'FM99,99,999') || ' reversed: ' || p_reason
    );

    SELECT to_jsonb(p.*) INTO v_result FROM public.payments p WHERE p.id = p_payment_id;
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 9.16 GLOBAL SEARCH (pg_trgm search across tenant or all orgs for super admin)
CREATE OR REPLACE FUNCTION public.global_search(q TEXT)
RETURNS JSONB AS $$
DECLARE
    v_results JSONB := '{"clients": [], "orders": [], "designs": [], "payments": []}'::jsonb;
    v_clients JSONB;
    v_orders JSONB;
    v_designs JSONB;
    v_payments JSONB;
    v_is_super BOOLEAN := public.is_super_admin();
BEGIN
    IF q IS NULL OR LENGTH(TRIM(q)) = 0 THEN
        RETURN v_results;
    END IF;

    -- Search Clients
    SELECT COALESCE(jsonb_agg(to_jsonb(t.*)), '[]'::jsonb) INTO v_clients FROM (
        SELECT c.id, c.org_id, o.name AS "orgName", c."businessName" AS title, c."propName" AS subtitle, c.city, 'client' AS type
        FROM public.customers c
        JOIN public.organizations o ON o.id = c.org_id
        WHERE c.archived_at IS NULL AND public.can_access_org(c.org_id) AND (
            c."businessName" ILIKE '%' || q || '%' OR
            c."propName" ILIKE '%' || q || '%' OR
            c.phone ILIKE '%' || q || '%' OR
            c.city ILIKE '%' || q || '%' OR
            c.id ILIKE '%' || q || '%'
        )
        LIMIT 10
    ) t;

    -- Search Orders
    SELECT COALESCE(jsonb_agg(to_jsonb(t.*)), '[]'::jsonb) INTO v_orders FROM (
        SELECT ord.id, ord.org_id, o.name AS "orgName", ord.id AS title, ord."customerName" AS subtitle, ord."netPayable", ord.status, 'order' AS type
        FROM public.orders ord
        JOIN public.organizations o ON o.id = ord.org_id
        WHERE ord.archived_at IS NULL AND public.can_access_org(ord.org_id) AND (
            ord.id ILIKE '%' || q || '%' OR
            ord."customerName" ILIKE '%' || q || '%' OR
            ord."salespersonName" ILIKE '%' || q || '%'
        )
        LIMIT 10
    ) t;

    -- Search Designs
    SELECT COALESCE(jsonb_agg(to_jsonb(t.*)), '[]'::jsonb) INTO v_designs FROM (
        SELECT d.id, d.org_id, o.name AS "orgName", d.name AS title, d."articleCode" AS subtitle, d.price, d.category, 'design' AS type
        FROM public.designs d
        JOIN public.organizations o ON o.id = d.org_id
        WHERE d.archived_at IS NULL AND public.can_access_org(d.org_id) AND (
            d.name ILIKE '%' || q || '%' OR
            d."articleCode" ILIKE '%' || q || '%' OR
            d.category ILIKE '%' || q || '%'
        )
        LIMIT 10
    ) t;

    -- Search Payments
    SELECT COALESCE(jsonb_agg(to_jsonb(t.*)), '[]'::jsonb) INTO v_payments FROM (
        SELECT p.id, p.org_id, o.name AS "orgName", p."receiptNumber" AS title, p."customerName" AS subtitle, p."paymentAmount", p."paymentMethod", 'payment' AS type
        FROM public.payments p
        JOIN public.organizations o ON o.id = p.org_id
        WHERE p.archived_at IS NULL AND public.can_access_org(p.org_id) AND (
            p.id ILIKE '%' || q || '%' OR
            p."receiptNumber" ILIKE '%' || q || '%' OR
            p."customerName" ILIKE '%' || q || '%' OR
            p."utrRef" ILIKE '%' || q || '%'
        )
        LIMIT 10
    ) t;

    RETURN jsonb_build_object(
        'clients', v_clients,
        'orders', v_orders,
        'designs', v_designs,
        'payments', v_payments
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- ------------------------------------------------------------------------------
-- 10. VIEWS UPGRADE (security_invoker = true + org_id column)
-- ------------------------------------------------------------------------------

-- Safely drop existing views to allow column name / structure alterations
DROP VIEW IF EXISTS public.v_salesman_collections CASCADE;
DROP VIEW IF EXISTS public.v_discount_request_stats CASCADE;
DROP VIEW IF EXISTS public.v_receivables CASCADE;
DROP VIEW IF EXISTS public.v_client_financials CASCADE;
DROP VIEW IF EXISTS public.v_order_financials CASCADE;
DROP VIEW IF EXISTS public.v_salesman_performance CASCADE;
DROP VIEW IF EXISTS public.v_design_performance CASCADE;
DROP VIEW IF EXISTS public.v_manufacturer_performance CASCADE;

-- 1. ORDER FINANCIALS VIEW
CREATE VIEW public.v_order_financials 
WITH (security_invoker = true) AS
WITH verified_payments AS (
    SELECT 
        pa.org_id,
        pa.order_id,
        COALESCE(SUM(pa.amount), 0) AS paid_verified
    FROM public.payment_allocations pa
    JOIN public.payments p ON p.id = pa.payment_id AND p.org_id = pa.org_id
    WHERE p.status = 'verified' AND p.archived_at IS NULL
    GROUP BY pa.org_id, pa.order_id
),
direct_order_payments AS (
    SELECT
        p.org_id,
        p."orderId" AS order_id,
        COALESCE(SUM(p."paymentAmount"), 0) AS paid_direct
    FROM public.payments p
    WHERE p."orderId" IS NOT NULL AND p.status = 'verified' AND p.archived_at IS NULL
      AND NOT EXISTS (SELECT 1 FROM public.payment_allocations pa WHERE pa.payment_id = p.id AND pa.org_id = p.org_id)
    GROUP BY p.org_id, p."orderId"
),
order_adjustments AS (
    SELECT 
        adj.org_id,
        adj.order_id,
        COALESCE(SUM(adj.amount), 0) AS total_adjustments
    FROM public.payment_adjustments adj
    WHERE adj.order_id IS NOT NULL
    GROUP BY adj.org_id, adj.order_id
)
SELECT 
    o.id AS order_id,
    o.org_id,
    o."customerId" AS client_id,
    o."customerName" AS client_name,
    o."salespersonId" AS salesman_id,
    o."salespersonName" AS salesman_name,
    o.status AS order_status,
    o."netPayable"::NUMERIC(14,2) AS net_payable,
    (COALESCE(vp.paid_verified, 0) + COALESCE(dop.paid_direct, 0))::NUMERIC(14,2) AS paid_verified,
    COALESCE(oa.total_adjustments, 0)::NUMERIC(14,2) AS adjustments,
    GREATEST(0, o."netPayable" - (COALESCE(vp.paid_verified, 0) + COALESCE(dop.paid_direct, 0)) - COALESCE(oa.total_adjustments, 0))::NUMERIC(14,2) AS outstanding,
    CASE 
        WHEN (COALESCE(vp.paid_verified, 0) + COALESCE(dop.paid_direct, 0)) >= o."netPayable" THEN 'Paid'
        WHEN (COALESCE(vp.paid_verified, 0) + COALESCE(dop.paid_direct, 0)) > 0 THEN 'Partially Paid'
        ELSE 'Unpaid'
    END AS payment_status,
    GREATEST(0, EXTRACT(DAY FROM (NOW() - COALESCE(o.order_date_at, o.created_at))))::INT AS age_days,
    CASE
        WHEN GREATEST(0, o."netPayable" - (COALESCE(vp.paid_verified, 0) + COALESCE(dop.paid_direct, 0)) - COALESCE(oa.total_adjustments, 0)) > 0
             AND EXTRACT(DAY FROM (NOW() - COALESCE(o.order_date_at, o.created_at))) > 30 THEN true
        ELSE false
    END AS is_overdue,
    o.order_date_at,
    o.expected_delivery_at,
    o.created_at
FROM public.orders o
LEFT JOIN verified_payments vp ON vp.order_id = o.id AND vp.org_id = o.org_id
LEFT JOIN direct_order_payments dop ON dop.order_id = o.id AND dop.org_id = o.org_id
LEFT JOIN order_adjustments oa ON oa.order_id = o.id AND oa.org_id = o.org_id
WHERE o.archived_at IS NULL;

-- 2. CLIENT FINANCIALS VIEW
CREATE VIEW public.v_client_financials 
WITH (security_invoker = true) AS
WITH client_orders AS (
    SELECT 
        vof.org_id,
        vof.client_id,
        COUNT(vof.order_id) AS orders_count,
        COALESCE(SUM(vof.net_payable), 0) AS total_business,
        COALESCE(SUM(vof.paid_verified), 0) AS total_paid,
        COALESCE(SUM(vof.outstanding), 0) AS outstanding,
        COALESCE(SUM(CASE WHEN vof.is_overdue THEN vof.outstanding ELSE 0 END), 0) AS overdue_amount,
        MAX(vof.created_at) AS last_order_at,
        AVG(vof.net_payable) AS avg_order_value
    FROM public.v_order_financials vof
    GROUP BY vof.org_id, vof.client_id
),
client_last_payment AS (
    SELECT DISTINCT ON (p.org_id, p."customerId")
        p.org_id,
        p."customerId" AS client_id,
        p."paymentAmount" AS last_payment_amount,
        COALESCE(p.payment_date_at, p.created_at) AS last_payment_at
    FROM public.payments p
    WHERE p.status = 'verified' AND p.archived_at IS NULL
    ORDER BY p.org_id, p."customerId", COALESCE(p.payment_date_at, p.created_at) DESC
)
SELECT 
    c.id AS client_id,
    c.org_id,
    c."businessName" AS business_name,
    c."propName" AS prop_name,
    c.phone,
    c.city,
    c.state,
    c."salespersonId" AS salesman_id,
    c."salespersonName" AS salesman_name,
    c.status AS client_status,
    c."creditLimit"::NUMERIC(14,2) AS credit_limit,
    c."paymentTerms" AS payment_terms,
    COALESCE(co.orders_count, 0)::INT AS orders_count,
    COALESCE(co.total_business, 0)::NUMERIC(14,2) AS total_business,
    COALESCE(co.total_paid, 0)::NUMERIC(14,2) AS total_paid,
    COALESCE(co.outstanding, 0)::NUMERIC(14,2) AS outstanding,
    COALESCE(co.overdue_amount, 0)::NUMERIC(14,2) AS overdue_amount,
    COALESCE(co.avg_order_value, 0)::NUMERIC(14,2) AS avg_order_value,
    co.last_order_at,
    clp.last_payment_at,
    COALESCE(clp.last_payment_amount, 0)::NUMERIC(14,2) AS last_payment_amount
FROM public.customers c
LEFT JOIN client_orders co ON co.client_id = c.id AND co.org_id = c.org_id
LEFT JOIN client_last_payment clp ON clp.client_id = c.id AND clp.org_id = c.org_id
WHERE c.archived_at IS NULL;

-- 3. RECEIVABLES VIEW
CREATE VIEW public.v_receivables 
WITH (security_invoker = true) AS
SELECT 
    vof.org_id,
    vof.client_id,
    vof.client_name,
    vof.salesman_id,
    vof.salesman_name,
    SUM(vof.net_payable)::NUMERIC(14,2) AS total_invoiced,
    SUM(vof.paid_verified)::NUMERIC(14,2) AS total_paid,
    SUM(vof.outstanding)::NUMERIC(14,2) AS amount_due,
    SUM(CASE WHEN vof.age_days <= 30 THEN vof.outstanding ELSE 0 END)::NUMERIC(14,2) AS bucket_0_30,
    SUM(CASE WHEN vof.age_days BETWEEN 31 AND 60 THEN vof.outstanding ELSE 0 END)::NUMERIC(14,2) AS bucket_31_60,
    SUM(CASE WHEN vof.age_days BETWEEN 61 AND 90 THEN vof.outstanding ELSE 0 END)::NUMERIC(14,2) AS bucket_61_90,
    SUM(CASE WHEN vof.age_days > 90 THEN vof.outstanding ELSE 0 END)::NUMERIC(14,2) AS bucket_90_plus,
    MAX(vof.age_days) AS max_age_days
FROM public.v_order_financials vof
WHERE vof.outstanding > 0
GROUP BY vof.org_id, vof.client_id, vof.client_name, vof.salesman_id, vof.salesman_name;

-- 4. SALESMAN PERFORMANCE VIEW
CREATE VIEW public.v_salesman_performance 
WITH (security_invoker = true) AS
SELECT 
    st.id AS salesman_id,
    st.org_id,
    st.name AS salesman_name,
    st.zone,
    st.cluster,
    st."monthlyTarget"::NUMERIC(14,2) AS monthly_target,
    COUNT(DISTINCT c.id) AS assigned_clients_count,
    COUNT(DISTINCT o.id) AS orders_count,
    COALESCE(SUM(o."netPayable"), 0)::NUMERIC(14,2) AS total_booked_value,
    COALESCE(SUM(p."paymentAmount"), 0)::NUMERIC(14,2) AS total_collections,
    COUNT(DISTINCT fu.id) FILTER (WHERE fu.status = 'pending') AS pending_followups_count
FROM public.sales_team st
LEFT JOIN public.customers c ON c."salespersonId" = st.id AND c.org_id = st.org_id AND c.archived_at IS NULL
LEFT JOIN public.orders o ON o."salespersonId" = st.id AND o.org_id = st.org_id AND o.archived_at IS NULL
LEFT JOIN public.payments p ON p."collectedBy" = st.name AND p.org_id = st.org_id AND p.status = 'verified' AND p.archived_at IS NULL
LEFT JOIN public.follow_ups fu ON fu.owner_name = st.name AND fu.org_id = st.org_id AND fu.status = 'pending'
WHERE st.archived_at IS NULL
GROUP BY st.id, st.org_id, st.name, st.zone, st.cluster, st."monthlyTarget";

-- 5. DESIGN PERFORMANCE VIEW
CREATE VIEW public.v_design_performance 
WITH (security_invoker = true) AS
SELECT 
    d.id AS design_id,
    d.org_id,
    d."articleCode" AS article_code,
    d.name AS design_name,
    d.category,
    d.price::NUMERIC(14,2) AS price,
    d.status,
    COUNT(DISTINCT dsi.share_id) AS total_shares_count,
    COALESCE(SUM(ds."viewCount"), 0) AS total_views_count,
    COUNT(DISTINCT oi.order_id) AS total_orders_count,
    COALESCE(SUM(oi.qty_pairs), 0) AS total_pairs_ordered,
    COALESCE(SUM(oi.line_total), 0)::NUMERIC(14,2) AS total_revenue_generated
FROM public.designs d
LEFT JOIN public.design_share_items dsi ON dsi.design_id = d.id AND dsi.org_id = d.org_id
LEFT JOIN public.design_shares ds ON ds.id = dsi.share_id AND ds.org_id = d.org_id
LEFT JOIN public.order_items oi ON oi.design_id = d.id AND oi.org_id = d.org_id
WHERE d.archived_at IS NULL
GROUP BY d.id, d.org_id, d."articleCode", d.name, d.category, d.price, d.status;

-- 6. MANUFACTURER PERFORMANCE VIEW
CREATE VIEW public.v_manufacturer_performance 
WITH (security_invoker = true) AS
SELECT 
    m.id AS manufacturer_id,
    m.org_id,
    m."companyName" AS company_name,
    m."hubLocation" AS hub_location,
    m."monthlyCapacityPairs" AS monthly_capacity_pairs,
    m."onTimeDeliveryRate" AS on_time_rate,
    m."qcPassRatio" AS qc_pass_ratio,
    m.status,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status IN ('In Production', 'Pending Manufacturer', 'Ready')) AS active_orders_count,
    COALESCE(SUM(o."pairsCount") FILTER (WHERE o.status IN ('In Production', 'Pending Manufacturer', 'Ready')), 0) AS active_pairs_count
FROM public.manufacturers m
LEFT JOIN public.orders o ON o."manufacturerId" = m.id AND o.org_id = m.org_id AND o.archived_at IS NULL
WHERE m.archived_at IS NULL
GROUP BY m.id, m.org_id, m."companyName", m."hubLocation", m."monthlyCapacityPairs", m."onTimeDeliveryRate", m."qcPassRatio", m.status;

-- 7. DISCOUNT REQUEST STATS VIEW
CREATE VIEW public.v_discount_request_stats 
WITH (security_invoker = true) AS
SELECT
    org_id,
    COUNT(*) FILTER (WHERE status = 'pending')::INT AS pending_count,
    COALESCE(SUM(margin_concession) FILTER (WHERE status = 'pending'), 0)::NUMERIC(14,2) AS pending_concession_total,
    COUNT(*) FILTER (WHERE status = 'approved' AND decided_at >= DATE_TRUNC('month', CURRENT_DATE))::INT AS approved_this_month,
    COUNT(*) FILTER (WHERE status = 'rejected' AND decided_at >= DATE_TRUNC('month', CURRENT_DATE))::INT AS rejected_this_month,
    COUNT(*)::INT AS total_requests
FROM public.discount_requests
GROUP BY org_id;

-- 8. SALESMAN COLLECTIONS VIEW
CREATE VIEW public.v_salesman_collections 
WITH (security_invoker = true) AS
SELECT 
    st.id AS salesman_id,
    st.org_id,
    st.name AS salesman_name,
    COALESCE((
        SELECT SUM(p."paymentAmount")
        FROM public.payments p
        WHERE (p."collectedBy" = st.name OR p.created_by = st.user_id)
          AND p.org_id = st.org_id
          AND p.status = 'verified'
          AND p.archived_at IS NULL
          AND DATE_TRUNC('month', COALESCE(p.payment_date_at, p.created_at)) = DATE_TRUNC('month', CURRENT_DATE)
    ), 0)::NUMERIC(14,2) AS collected_this_month,
    COALESCE((
        SELECT SUM(p."paymentAmount")
        FROM public.payments p
        WHERE (p."collectedBy" = st.name OR p.created_by = st.user_id)
          AND p.org_id = st.org_id
          AND p.status = 'pending_clearance'
          AND p.archived_at IS NULL
    ), 0)::NUMERIC(14,2) AS cheques_in_transit,
    COALESCE((
        SELECT SUM(c."amountDue")
        FROM public.customers c
        WHERE c."salespersonId" = st.id AND c.org_id = st.org_id AND c.archived_at IS NULL
    ), 0)::NUMERIC(14,2) AS total_pending_client_balance,
    COALESCE((
        SELECT COUNT(c.id)
        FROM public.customers c
        WHERE c."salespersonId" = st.id AND c.org_id = st.org_id AND c.archived_at IS NULL AND c."amountDue" > 0
    ), 0)::INT AS pending_accounts_count
FROM public.sales_team st
WHERE st.archived_at IS NULL;


-- ------------------------------------------------------------------------------
-- 11. STORAGE ISOLATION POLICIES
-- ------------------------------------------------------------------------------

-- Ensure buckets exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('design-images', 'design-images', false),
    ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "storage_tenant_design_images_select" ON storage.objects;
CREATE POLICY "storage_tenant_design_images_select" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'design-images' AND 
        public.can_access_org(((storage.foldername(name))[1])::uuid)
    );

DROP POLICY IF EXISTS "storage_tenant_design_images_insert" ON storage.objects;
CREATE POLICY "storage_tenant_design_images_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'design-images' AND 
        public.is_admin() AND
        public.can_access_org(((storage.foldername(name))[1])::uuid)
    );

DROP POLICY IF EXISTS "storage_tenant_payment_receipts_all" ON storage.objects;
CREATE POLICY "storage_tenant_payment_receipts_all" ON storage.objects
    FOR ALL TO authenticated
    USING (
        bucket_id = 'payment-receipts' AND 
        public.can_access_org(((storage.foldername(name))[1])::uuid)
    )
    WITH CHECK (
        bucket_id = 'payment-receipts' AND 
        public.can_access_org(((storage.foldername(name))[1])::uuid)
    );
