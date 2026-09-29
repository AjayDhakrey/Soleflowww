-- =========================================================================
-- MIGRATION 0003: NEW ENTITIES & RELATIONAL NORMALIZATION
-- Introduces normalized child tables: order_items, order_status_history,
-- payment_allocations, payment_adjustments, client_notes, follow_ups,
-- field_visits, notifications, activity_events, design_share_items,
-- design_images, and app_settings.
-- =========================================================================

-- 1. ORDER ITEMS (Normalized line items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    design_id TEXT REFERENCES public.designs(id) ON DELETE RESTRICT,
    design_code_snapshot TEXT NOT NULL,
    design_name_snapshot TEXT NOT NULL,
    size_matrix JSONB DEFAULT '[]'::jsonb,
    qty_pairs INT NOT NULL CHECK (qty_pairs > 0),
    cartons INT NOT NULL DEFAULT 1 CHECK (cartons > 0),
    rate NUMERIC(14,2) NOT NULL CHECK (rate >= 0),
    discount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    line_total NUMERIC(14,2) GENERATED ALWAYS AS (qty_pairs * rate - discount) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ORDER STATUS HISTORY (Timeline state machine trail)
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    actor TEXT NOT NULL,
    actor_id UUID,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PAYMENT FIELDS HARDENING
ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'recorded' CHECK (status IN ('recorded', 'verified', 'reversed')),
    ADD COLUMN IF NOT EXISTS verified_by UUID,
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS receipt_path TEXT;

-- 4. PAYMENT ALLOCATIONS (Multi-order payment coverage)
CREATE TABLE IF NOT EXISTS public.payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id TEXT NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PAYMENT ADJUSTMENTS & CREDIT NOTES
CREATE TABLE IF NOT EXISTS public.payment_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    order_id TEXT REFERENCES public.orders(id) ON DELETE RESTRICT,
    type TEXT NOT NULL CHECK (type IN ('credit_note', 'write_off', 'reversal', 'correction')),
    amount NUMERIC(14,2) NOT NULL,
    reason TEXT NOT NULL,
    reverses_payment_id TEXT REFERENCES public.payments(id) ON DELETE RESTRICT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CLIENT NOTES
CREATE TABLE IF NOT EXISTS public.client_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    author_id UUID,
    author_name TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. FOLLOW-UPS
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    owner_id UUID,
    owner_name TEXT NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('call', 'visit', 'collection', 'design_followup')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    outcome TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. FIELD VISITS
CREATE TABLE IF NOT EXISTS public.field_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    salesperson_id TEXT REFERENCES public.sales_team(id) ON DELETE SET NULL,
    salesperson_name TEXT NOT NULL,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    purpose TEXT NOT NULL,
    outcome TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('planned', 'completed', 'missed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    recipient_role TEXT CHECK (recipient_role IN ('admin', 'salesperson', 'all')),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    record_type TEXT,
    record_id TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ACTIVITY EVENTS (Universal timeline)
CREATE TABLE IF NOT EXISTS public.activity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor TEXT NOT NULL,
    actor_id UUID,
    action TEXT NOT NULL,
    record_type TEXT NOT NULL,
    record_id TEXT NOT NULL,
    client_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
    design_id TEXT REFERENCES public.designs(id) ON DELETE SET NULL,
    payment_id TEXT REFERENCES public.payments(id) ON DELETE SET NULL,
    manufacturer_id TEXT REFERENCES public.manufacturers(id) ON DELETE SET NULL,
    salesman_id TEXT REFERENCES public.sales_team(id) ON DELETE SET NULL,
    summary TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. DESIGN SHARE ITEMS & IMAGES
CREATE TABLE IF NOT EXISTS public.design_share_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id TEXT NOT NULL REFERENCES public.design_shares(id) ON DELETE CASCADE,
    design_id TEXT NOT NULL REFERENCES public.designs(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.design_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id TEXT NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. APP SETTINGS
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default app settings
INSERT INTO public.app_settings (key, value, description)
VALUES 
    ('salesman_can_create_client', 'true'::jsonb, 'Allow field salesmen to register new client accounts'),
    ('salesman_can_record_collection', 'true'::jsonb, 'Allow salesmen to log payments (status=recorded)'),
    ('salesman_can_approve_orders', 'false'::jsonb, 'Allow salesmen to directly approve wholesale orders'),
    ('default_gst_percent', '12'::jsonb, 'Default GST rate percentage for footwear orders'),
    ('overdue_after_days', '30'::jsonb, 'Days after delivery when unpaid balance is marked Overdue')
ON CONFLICT (key) DO NOTHING;
