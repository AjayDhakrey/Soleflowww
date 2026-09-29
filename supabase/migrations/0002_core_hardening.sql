-- =========================================================================
-- MIGRATION 0002: CORE HARDENING & EXTENSIONS
-- Enables security extensions, profiles, audit columns, RESTRICT FKs,
-- generic timestamp triggers, and transactional ID sequence generators.
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "citext";

-- 2. GENERIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. PROFILES TABLE (Mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
    full_name TEXT NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'salesperson' CHECK (role IN ('admin', 'salesperson')),
    sales_team_id TEXT REFERENCES public.sales_team(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_set_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Automatically create profile row when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'salesperson'),
        NEW.raw_user_meta_data->>'phone'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. ADD HARDENING & AUDIT COLUMNS TO EXISTING TABLES (ADDITIVE)
ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS updated_by UUID,
    ADD COLUMN IF NOT EXISTS last_order_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMPTZ;

ALTER TABLE public.designs
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS updated_by UUID;

ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS updated_by UUID,
    ADD COLUMN IF NOT EXISTS order_date_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS expected_delivery_at TIMESTAMPTZ;

ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS updated_by UUID,
    ADD COLUMN IF NOT EXISTS payment_date_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.design_shares
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS updated_by UUID,
    ADD COLUMN IF NOT EXISTS token UUID UNIQUE DEFAULT gen_random_uuid(),
    ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.manufacturers
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS updated_by UUID,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.sales_team
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS updated_by UUID,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. APPLY UPDATED_AT TRIGGERS TO ALL TABLES
DROP TRIGGER IF EXISTS trigger_customers_updated_at ON public.customers;
CREATE TRIGGER trigger_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_designs_updated_at ON public.designs;
CREATE TRIGGER trigger_designs_updated_at BEFORE UPDATE ON public.designs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_payments_updated_at ON public.payments;
CREATE TRIGGER trigger_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_design_shares_updated_at ON public.design_shares;
CREATE TRIGGER trigger_design_shares_updated_at BEFORE UPDATE ON public.design_shares FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_manufacturers_updated_at ON public.manufacturers;
CREATE TRIGGER trigger_manufacturers_updated_at BEFORE UPDATE ON public.manufacturers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_sales_team_updated_at ON public.sales_team;
CREATE TRIGGER trigger_sales_team_updated_at BEFORE UPDATE ON public.sales_team FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. REPLACE ON DELETE CASCADE WITH ON DELETE RESTRICT FOR FINANCIAL INTEGRITY
-- Note: Replaced to ensure customer deactivation preserves historical orders & payments (spec §27)
DO $$
BEGIN
    -- Orders
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'orders_customerId_fkey' AND table_name = 'orders'
    ) THEN
        ALTER TABLE public.orders DROP CONSTRAINT "orders_customerId_fkey";
        ALTER TABLE public.orders ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON DELETE RESTRICT;
    END IF;

    -- Payments
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'payments_customerId_fkey' AND table_name = 'payments'
    ) THEN
        ALTER TABLE public.payments DROP CONSTRAINT "payments_customerId_fkey";
        ALTER TABLE public.payments ADD CONSTRAINT "payments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON DELETE RESTRICT;
    END IF;

    -- Design shares
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'design_shares_targetClientId_fkey' AND table_name = 'design_shares'
    ) THEN
        ALTER TABLE public.design_shares DROP CONSTRAINT "design_shares_targetClientId_fkey";
        ALTER TABLE public.design_shares ADD CONSTRAINT "design_shares_targetClientId_fkey" FOREIGN KEY ("targetClientId") REFERENCES public.customers(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- 7. HUMAN-READABLE TRANSACTIONAL ID GENERATORS
CREATE SEQUENCE IF NOT EXISTS seq_client_num START WITH 101;
CREATE SEQUENCE IF NOT EXISTS seq_order_num START WITH 101;
CREATE SEQUENCE IF NOT EXISTS seq_payment_num START WITH 101;
CREATE SEQUENCE IF NOT EXISTS seq_design_num START WITH 101;
CREATE SEQUENCE IF NOT EXISTS seq_mfg_num START WITH 11;
CREATE SEQUENCE IF NOT EXISTS seq_share_num START WITH 101;

CREATE OR REPLACE FUNCTION public.gen_client_id() RETURNS TEXT AS $$
BEGIN
    RETURN 'CLI-' || LPAD(nextval('seq_client_num')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.gen_order_id() RETURNS TEXT AS $$
BEGIN
    RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('seq_order_num')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.gen_payment_id() RETURNS TEXT AS $$
BEGIN
    RETURN 'PAY-' || LPAD(nextval('seq_payment_num')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.gen_design_id() RETURNS TEXT AS $$
BEGIN
    RETURN 'DSG-' || LPAD(nextval('seq_design_num')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.gen_manufacturer_id() RETURNS TEXT AS $$
BEGIN
    RETURN 'MFR-' || LPAD(nextval('seq_mfg_num')::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;
