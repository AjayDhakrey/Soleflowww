-- =========================================================================
-- MIGRATION 0008: DYNAMIC DISCOUNT REQUESTS & MARGIN OVERRIDES
-- Introduces special trade discount authorization workflow, database
-- entities, transactional RPC functions, audit logging, and RLS policies.
-- =========================================================================

-- 1. APP SETTINGS DEFAULTS FOR DISCOUNT & PROFITABILITY THRESHOLDS
INSERT INTO public.app_settings (key, value, description)
VALUES 
    ('default_trade_discount_percent', '8'::jsonb, 'Standard default trade discount percentage applied to footwear orders'),
    ('max_trade_discount_percent', '15'::jsonb, 'Maximum allowable discount percentage threshold for special requests'),
    ('min_margin_percent', '15'::jsonb, 'Minimum target profit margin threshold percentage before warning')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description;

-- 2. DESIGNS: ADD COST_PER_PAIR COLUMN IF NOT EXISTS
ALTER TABLE public.designs
    ADD COLUMN IF NOT EXISTS cost_per_pair NUMERIC(14,2) NULL;

-- 3. DISCOUNT REQUESTS SEQUENCE & TABLE
CREATE SEQUENCE IF NOT EXISTS seq_discount_request_num START WITH 1;

CREATE TABLE IF NOT EXISTS public.discount_requests (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    client_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    requested_by UUID NOT NULL,
    salesman_id TEXT,
    default_percent NUMERIC(5,2) NOT NULL,
    requested_percent NUMERIC(5,2) NOT NULL CHECK (requested_percent > 0),
    approved_percent NUMERIC(5,2) NULL,
    order_subtotal NUMERIC(14,2) NOT NULL,
    pairs INT NOT NULL,
    product_summary TEXT,
    margin_concession NUMERIC(14,2) NOT NULL,
    projected_margin_percent NUMERIC(5,2) NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'expired')),
    decided_by UUID NULL,
    decided_at TIMESTAMPTZ NULL,
    decision_note TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial Unique Index: Only ONE pending discount request per order
CREATE UNIQUE INDEX IF NOT EXISTS idx_discount_requests_one_pending_per_order 
ON public.discount_requests (order_id) 
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_discount_requests_status ON public.discount_requests (status);
CREATE INDEX IF NOT EXISTS idx_discount_requests_client ON public.discount_requests (client_id);
CREATE INDEX IF NOT EXISTS idx_discount_requests_order ON public.discount_requests (order_id);
CREATE INDEX IF NOT EXISTS idx_discount_requests_salesman ON public.discount_requests (salesman_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_set_discount_requests_updated_at ON public.discount_requests;
CREATE TRIGGER trigger_set_discount_requests_updated_at
    BEFORE UPDATE ON public.discount_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- 4. VIEW: DISCOUNT REQUEST STATS
CREATE OR REPLACE VIEW public.v_discount_request_stats AS
SELECT
    COUNT(*) FILTER (WHERE status = 'pending')::INT AS pending_count,
    COALESCE(SUM(margin_concession) FILTER (WHERE status = 'pending'), 0)::NUMERIC(14,2) AS pending_concession_total,
    COUNT(*) FILTER (WHERE status = 'approved' AND decided_at >= DATE_TRUNC('month', CURRENT_DATE))::INT AS approved_this_month,
    COUNT(*) FILTER (WHERE status = 'rejected' AND decided_at >= DATE_TRUNC('month', CURRENT_DATE))::INT AS rejected_this_month,
    COUNT(*)::INT AS total_requests
FROM public.discount_requests;

-- 5. TRANSACTIONAL RPC FUNCTIONS (SECURITY DEFINER)

-- a) REQUEST DISCOUNT
CREATE OR REPLACE FUNCTION public.request_discount(
    p_order_id TEXT,
    p_requested_percent NUMERIC,
    p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_client RECORD;
    v_default_pct NUMERIC(5,2) := 8.00;
    v_max_pct NUMERIC(5,2) := 15.00;
    v_min_margin NUMERIC(5,2) := 15.00;
    v_setting_val JSONB;
    v_concession NUMERIC(14,2);
    v_request_id TEXT;
    v_actor_name TEXT;
    v_actor_role TEXT := 'salesperson';
    v_salesman_id TEXT;
    v_prod_summary TEXT;
    v_projected_margin NUMERIC(5,2) := NULL;
    v_res JSONB;
BEGIN
    IF p_reason IS NULL OR TRIM(p_reason) = '' THEN
        RAISE EXCEPTION 'Reason / justification is required when requesting a special discount.';
    END IF;

    -- Load settings
    SELECT value INTO v_setting_val FROM public.app_settings WHERE key = 'default_trade_discount_percent';
    IF v_setting_val IS NOT NULL THEN
        v_default_pct := (v_setting_val#>>'{}')::NUMERIC;
    END IF;

    SELECT value INTO v_setting_val FROM public.app_settings WHERE key = 'max_trade_discount_percent';
    IF v_setting_val IS NOT NULL THEN
        v_max_pct := (v_setting_val#>>'{}')::NUMERIC;
    END IF;

    SELECT value INTO v_setting_val FROM public.app_settings WHERE key = 'min_margin_percent';
    IF v_setting_val IS NOT NULL THEN
        v_min_margin := (v_setting_val#>>'{}')::NUMERIC;
    END IF;

    -- Fetch and lock order
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    IF v_order.id IS NULL THEN
        RAISE EXCEPTION 'Order % not found.', p_order_id;
    END IF;

    IF v_order.status NOT IN ('Draft', 'Submitted', 'Under Review') THEN
        RAISE EXCEPTION 'Special discounts can only be requested for orders in Draft, Submitted, or Under Review status (current status: %).', v_order.status;
    END IF;

    -- Check caller permission
    v_salesman_id := public.current_salesman_id();
    IF NOT public.is_admin() AND v_salesman_id != v_order."salespersonId" AND auth.uid() != v_order.created_by THEN
        RAISE EXCEPTION 'You do not have permission to request special discounts on this order.';
    END IF;

    -- Validate requested percent
    IF p_requested_percent <= v_default_pct THEN
        RAISE EXCEPTION 'Requested discount (% pct) must be greater than the default standard discount (% pct).', p_requested_percent, v_default_pct;
    END IF;

    IF p_requested_percent > v_max_pct THEN
        RAISE EXCEPTION 'Requested discount (% pct) exceeds the maximum allowed authorization threshold (% pct).', p_requested_percent, v_max_pct;
    END IF;

    -- Calculate concession
    v_concession := ROUND(((p_requested_percent - v_default_pct) * v_order.subtotal / 100.0), 2);

    -- Build product summary
    v_prod_summary := v_order."pairsCount" || ' Pairs';
    IF v_order.items IS NOT NULL AND jsonb_array_length(v_order.items) > 0 THEN
        v_prod_summary := v_prod_summary || ' • ' || COALESCE(v_order.items->0->>'name', v_order.items->0->>'designName', 'Footwear Line');
    END IF;

    -- Projected margin estimate (Standard wholesale footwear gross margin approximation 24% - concession)
    v_projected_margin := GREATEST(5.0, ROUND((26.0 - (p_requested_percent - v_default_pct)), 1));

    -- Get actor name
    SELECT full_name, role INTO v_actor_name, v_actor_role FROM public.profiles WHERE id = auth.uid();
    v_actor_name := COALESCE(v_actor_name, v_order."salespersonName", 'Sales Representative');
    v_actor_role := COALESCE(v_actor_role, 'salesperson');

    -- Generate request ID
    v_request_id := 'DR-' || LPAD(nextval('seq_discount_request_num')::TEXT, 5, '0');

    -- Insert discount request
    INSERT INTO public.discount_requests (
        id, order_id, client_id, requested_by, salesman_id, default_percent,
        requested_percent, approved_percent, order_subtotal, pairs, product_summary,
        margin_concession, projected_margin_percent, reason, status, created_at, updated_at
    ) VALUES (
        v_request_id, v_order.id, v_order."customerId", auth.uid(), COALESCE(v_order."salespersonId", v_salesman_id),
        v_default_pct, p_requested_percent, NULL, v_order.subtotal, v_order."pairsCount",
        v_prod_summary, v_concession, v_projected_margin, p_reason, 'pending', NOW(), NOW()
    );

    -- Update order status to Under Review
    UPDATE public.orders
    SET status = 'Under Review', updated_at = NOW(), updated_by = auth.uid()
    WHERE id = v_order.id;

    -- Order Status Timeline Entry
    INSERT INTO public.order_status_history (
        order_id, from_status, to_status, actor, actor_id, note, created_at
    ) VALUES (
        v_order.id, v_order.status, 'Under Review', v_actor_name, auth.uid(),
        'Special discount requested (' || p_requested_percent || '% vs ' || v_default_pct || '%) — ' || p_reason,
        NOW()
    );

    -- Activity Event
    INSERT INTO public.activity_events (
        actor, actor_id, action, record_type, record_id, client_id, order_id, salesman_id, summary
    ) VALUES (
        v_actor_name, auth.uid(), 'Requested Special Margin Override', 'DiscountRequest',
        v_request_id, v_order."customerId", v_order.id, v_order."salespersonId",
        v_actor_name || ' requested ' || p_requested_percent || '% margin override for ' || v_order."customerName" || ' (Concession: ₹' || v_concession || ')'
    );

    -- Audit Log
    INSERT INTO public.audit_logs (
        id, actor, "actorRole", action, "recordType", "recordId", "recordTitle",
        "oldValue", "newValue", timestamp, source
    ) VALUES (
        gen_random_uuid()::TEXT, v_actor_name, v_actor_role, 'REQUEST_DISCOUNT', 'Order',
        v_order.id, 'Order ' || v_order.id || ' (' || v_order."customerName" || ')',
        v_default_pct || '% (Default)', p_requested_percent || '% Special Requested',
        TO_CHAR(NOW(), 'DD Mon YYYY, HH:MI AM'), 'Web App'
    );

    -- Admin Notification
    INSERT INTO public.notifications (
        recipient_role, type, title, body, record_type, record_id, created_at
    ) VALUES (
        'admin', 'discount_request', 'Special Margin Request (' || p_requested_percent || '%)',
        'Special ' || p_requested_percent || '% discount requested for ' || v_order."customerName" || ' (' || v_order.id || ') by ' || v_actor_name || '. Reason: ' || p_reason,
        'DiscountRequest', v_request_id, NOW()
    );

    SELECT to_jsonb(dr.*) INTO v_res FROM public.discount_requests dr WHERE dr.id = v_request_id;
    RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- b) APPROVE DISCOUNT REQUEST
CREATE OR REPLACE FUNCTION public.approve_discount_request(
    p_request_id TEXT,
    p_approved_percent NUMERIC DEFAULT NULL,
    p_note TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_req RECORD;
    v_order RECORD;
    v_final_pct NUMERIC(5,2);
    v_max_pct NUMERIC(5,2) := 15.00;
    v_setting_val JSONB;
    v_actor_name TEXT;
    v_trade_disc_amt NUMERIC(14,2);
    v_taxable NUMERIC(14,2);
    v_gst_amt NUMERIC(14,2);
    v_net_payable NUMERIC(14,2);
    v_balance_due NUMERIC(14,2);
    v_res JSONB;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only administrators / traders can approve discount requests.';
    END IF;

    -- Fetch and lock request
    SELECT * INTO v_req FROM public.discount_requests WHERE id = p_request_id FOR UPDATE;
    IF v_req.id IS NULL THEN
        RAISE EXCEPTION 'Discount request % not found.', p_request_id;
    END IF;

    IF v_req.status != 'pending' THEN
        RAISE EXCEPTION 'Discount request % is already % (must be pending).', p_request_id, v_req.status;
    END IF;

    -- Load max percent setting
    SELECT value INTO v_setting_val FROM public.app_settings WHERE key = 'max_trade_discount_percent';
    IF v_setting_val IS NOT NULL THEN
        v_max_pct := (v_setting_val#>>'{}')::NUMERIC;
    END IF;

    v_final_pct := COALESCE(p_approved_percent, v_req.requested_percent);
    IF v_final_pct <= 0 OR v_final_pct > v_max_pct THEN
        RAISE EXCEPTION 'Approved discount percent (% pct) must be between 0 and % pct.', v_final_pct, v_max_pct;
    END IF;

    -- Fetch and lock order
    SELECT * INTO v_order FROM public.orders WHERE id = v_req.order_id FOR UPDATE;
    IF v_order.id IS NULL THEN
        RAISE EXCEPTION 'Associated order % not found.', v_req.order_id;
    END IF;

    SELECT full_name INTO v_actor_name FROM public.profiles WHERE id = auth.uid();
    v_actor_name := COALESCE(v_actor_name, 'Trader / Admin');

    -- Recompute financial totals
    v_trade_disc_amt := ROUND((v_order.subtotal * v_final_pct / 100.0), 2);
    v_taxable := v_order.subtotal - v_trade_disc_amt;
    v_gst_amt := ROUND((v_taxable * COALESCE(v_order."gstPercent", 12) / 100.0), 2);
    v_net_payable := v_taxable + v_gst_amt;
    v_balance_due := GREATEST(0, v_net_payable - COALESCE(v_order."advanceDeposited", 0));

    -- Update discount request record
    UPDATE public.discount_requests
    SET status = 'approved', approved_percent = v_final_pct, decided_by = auth.uid(),
        decided_at = NOW(), decision_note = p_note, updated_at = NOW()
    WHERE id = p_request_id;

    -- Update order with new discount and recalculated totals
    UPDATE public.orders
    SET "tradeDiscountPercent" = v_final_pct,
        "tradeDiscountAmount" = v_trade_disc_amt,
        "taxableSubtotal" = v_taxable,
        "gstAmount" = v_gst_amt,
        "netPayable" = v_net_payable,
        "balanceDue" = v_balance_due,
        status = 'Approved',
        updated_at = NOW(),
        updated_by = auth.uid()
    WHERE id = v_order.id;

    -- Timeline Entry
    INSERT INTO public.order_status_history (
        order_id, from_status, to_status, actor, actor_id, note, created_at
    ) VALUES (
        v_order.id, v_order.status, 'Approved', v_actor_name, auth.uid(),
        'Special discount ' || v_final_pct || '% approved by ' || v_actor_name || COALESCE(' — ' || p_note, ''),
        NOW()
    );

    -- Activity Event
    INSERT INTO public.activity_events (
        actor, actor_id, action, record_type, record_id, client_id, order_id, salesman_id, summary
    ) VALUES (
        v_actor_name, auth.uid(), 'Approved Special Discount', 'DiscountRequest',
        p_request_id, v_order."customerId", v_order.id, v_order."salespersonId",
        v_actor_name || ' approved ' || v_final_pct || '% discount for ' || v_order."customerName" || ' (' || v_order.id || ')'
    );

    -- Audit Log
    INSERT INTO public.audit_logs (
        id, actor, "actorRole", action, "recordType", "recordId", "recordTitle",
        "oldValue", "newValue", timestamp, source
    ) VALUES (
        gen_random_uuid()::TEXT, v_actor_name, 'admin', 'APPROVE_DISCOUNT', 'Order',
        v_order.id, 'Order ' || v_order.id || ' (' || v_order."customerName" || ')',
        v_req.default_percent || '%', v_final_pct || '% (Approved)',
        TO_CHAR(NOW(), 'DD Mon YYYY, HH:MI AM'), 'Web App'
    );

    -- Salesperson Notification
    INSERT INTO public.notifications (
        user_id, recipient_role, type, title, body, record_type, record_id, created_at
    ) VALUES (
        v_req.requested_by, 'salesperson', 'discount_approved',
        'Special Discount Approved (' || v_final_pct || '%)',
        'Your special ' || v_final_pct || '% discount request for ' || v_order."customerName" || ' (' || v_order.id || ') was approved by ' || v_actor_name || '.' || COALESCE(' Note: ' || p_note, ''),
        'DiscountRequest', p_request_id, NOW()
    );

    SELECT to_jsonb(dr.*) INTO v_res FROM public.discount_requests dr WHERE dr.id = p_request_id;
    RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- c) REJECT DISCOUNT REQUEST
CREATE OR REPLACE FUNCTION public.reject_discount_request(
    p_request_id TEXT,
    p_note TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_req RECORD;
    v_order RECORD;
    v_actor_name TEXT;
    v_default_pct NUMERIC(5,2);
    v_trade_disc_amt NUMERIC(14,2);
    v_taxable NUMERIC(14,2);
    v_gst_amt NUMERIC(14,2);
    v_net_payable NUMERIC(14,2);
    v_balance_due NUMERIC(14,2);
    v_res JSONB;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only administrators / traders can reject discount requests.';
    END IF;

    IF p_note IS NULL OR TRIM(p_note) = '' THEN
        RAISE EXCEPTION 'A rejection reason / note is required to reject this discount request.';
    END IF;

    SELECT * INTO v_req FROM public.discount_requests WHERE id = p_request_id FOR UPDATE;
    IF v_req.id IS NULL THEN
        RAISE EXCEPTION 'Discount request % not found.', p_request_id;
    END IF;

    IF v_req.status != 'pending' THEN
        RAISE EXCEPTION 'Discount request % is already % (must be pending).', p_request_id, v_req.status;
    END IF;

    SELECT * INTO v_order FROM public.orders WHERE id = v_req.order_id FOR UPDATE;
    IF v_order.id IS NULL THEN
        RAISE EXCEPTION 'Associated order % not found.', v_req.order_id;
    END IF;

    SELECT full_name INTO v_actor_name FROM public.profiles WHERE id = auth.uid();
    v_actor_name := COALESCE(v_actor_name, 'Trader / Admin');
    v_default_pct := v_req.default_percent;

    -- Recompute totals back to default percent
    v_trade_disc_amt := ROUND((v_order.subtotal * v_default_pct / 100.0), 2);
    v_taxable := v_order.subtotal - v_trade_disc_amt;
    v_gst_amt := ROUND((v_taxable * COALESCE(v_order."gstPercent", 12) / 100.0), 2);
    v_net_payable := v_taxable + v_gst_amt;
    v_balance_due := GREATEST(0, v_net_payable - COALESCE(v_order."advanceDeposited", 0));

    -- Mark request rejected
    UPDATE public.discount_requests
    SET status = 'rejected', decided_by = auth.uid(), decided_at = NOW(),
        decision_note = p_note, updated_at = NOW()
    WHERE id = p_request_id;

    -- Revert order status and recalculate
    UPDATE public.orders
    SET "tradeDiscountPercent" = v_default_pct,
        "tradeDiscountAmount" = v_trade_disc_amt,
        "taxableSubtotal" = v_taxable,
        "gstAmount" = v_gst_amt,
        "netPayable" = v_net_payable,
        "balanceDue" = v_balance_due,
        status = 'Submitted',
        updated_at = NOW(),
        updated_by = auth.uid()
    WHERE id = v_order.id;

    -- Timeline Entry
    INSERT INTO public.order_status_history (
        order_id, from_status, to_status, actor, actor_id, note, created_at
    ) VALUES (
        v_order.id, v_order.status, 'Submitted', v_actor_name, auth.uid(),
        'Special discount rejected — reset to ' || v_default_pct || '%. Reason: ' || p_note,
        NOW()
    );

    -- Activity Event
    INSERT INTO public.activity_events (
        actor, actor_id, action, record_type, record_id, client_id, order_id, salesman_id, summary
    ) VALUES (
        v_actor_name, auth.uid(), 'Rejected Special Discount', 'DiscountRequest',
        p_request_id, v_order."customerId", v_order.id, v_order."salespersonId",
        v_actor_name || ' rejected special discount request for ' || v_order."customerName" || '. Reason: ' || p_note
    );

    -- Audit Log
    INSERT INTO public.audit_logs (
        id, actor, "actorRole", action, "recordType", "recordId", "recordTitle",
        "oldValue", "newValue", timestamp, source
    ) VALUES (
        gen_random_uuid()::TEXT, v_actor_name, 'admin', 'REJECT_DISCOUNT', 'Order',
        v_order.id, 'Order ' || v_order.id || ' (' || v_order."customerName" || ')',
        v_req.requested_percent || '% (Requested)', v_default_pct || '% (Reset to Default)',
        TO_CHAR(NOW(), 'DD Mon YYYY, HH:MI AM'), 'Web App'
    );

    -- Salesperson Notification
    INSERT INTO public.notifications (
        user_id, recipient_role, type, title, body, record_type, record_id, created_at
    ) VALUES (
        v_req.requested_by, 'salesperson', 'discount_rejected',
        'Special Discount Request Rejected',
        'Your special discount request for ' || v_order."customerName" || ' (' || v_order.id || ') was declined by ' || v_actor_name || '. Reason: ' || p_note,
        'DiscountRequest', p_request_id, NOW()
    );

    SELECT to_jsonb(dr.*) INTO v_res FROM public.discount_requests dr WHERE dr.id = p_request_id;
    RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- d) CANCEL DISCOUNT REQUEST
CREATE OR REPLACE FUNCTION public.cancel_discount_request(
    p_request_id TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_req RECORD;
    v_order RECORD;
    v_actor_name TEXT;
    v_default_pct NUMERIC(5,2);
    v_trade_disc_amt NUMERIC(14,2);
    v_taxable NUMERIC(14,2);
    v_gst_amt NUMERIC(14,2);
    v_net_payable NUMERIC(14,2);
    v_balance_due NUMERIC(14,2);
    v_res JSONB;
BEGIN
    SELECT * INTO v_req FROM public.discount_requests WHERE id = p_request_id FOR UPDATE;
    IF v_req.id IS NULL THEN
        RAISE EXCEPTION 'Discount request % not found.', p_request_id;
    END IF;

    IF v_req.status != 'pending' THEN
        RAISE EXCEPTION 'Only pending requests can be cancelled (current status: %).', v_req.status;
    END IF;

    IF NOT public.is_admin() AND auth.uid() != v_req.requested_by THEN
        RAISE EXCEPTION 'Only the requester or an administrator can cancel this request.';
    END IF;

    SELECT * INTO v_order FROM public.orders WHERE id = v_req.order_id FOR UPDATE;
    SELECT full_name INTO v_actor_name FROM public.profiles WHERE id = auth.uid();
    v_actor_name := COALESCE(v_actor_name, 'Requester');
    v_default_pct := v_req.default_percent;

    -- Revert order
    v_trade_disc_amt := ROUND((v_order.subtotal * v_default_pct / 100.0), 2);
    v_taxable := v_order.subtotal - v_trade_disc_amt;
    v_gst_amt := ROUND((v_taxable * COALESCE(v_order."gstPercent", 12) / 100.0), 2);
    v_net_payable := v_taxable + v_gst_amt;
    v_balance_due := GREATEST(0, v_net_payable - COALESCE(v_order."advanceDeposited", 0));

    UPDATE public.discount_requests
    SET status = 'cancelled', decided_by = auth.uid(), decided_at = NOW(),
        decision_note = 'Cancelled by requester', updated_at = NOW()
    WHERE id = p_request_id;

    UPDATE public.orders
    SET "tradeDiscountPercent" = v_default_pct,
        "tradeDiscountAmount" = v_trade_disc_amt,
        "taxableSubtotal" = v_taxable,
        "gstAmount" = v_gst_amt,
        "netPayable" = v_net_payable,
        "balanceDue" = v_balance_due,
        status = 'Submitted',
        updated_at = NOW()
    WHERE id = v_order.id;

    -- Timeline Entry
    INSERT INTO public.order_status_history (
        order_id, from_status, to_status, actor, actor_id, note, created_at
    ) VALUES (
        v_order.id, v_order.status, 'Submitted', v_actor_name, auth.uid(),
        'Special discount request cancelled by ' || v_actor_name,
        NOW()
    );

    SELECT to_jsonb(dr.*) INTO v_res FROM public.discount_requests dr WHERE dr.id = p_request_id;
    RETURN v_res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.discount_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "discount_requests_admin_all" ON public.discount_requests;
CREATE POLICY "discount_requests_admin_all" ON public.discount_requests
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "discount_requests_salesman_select" ON public.discount_requests;
CREATE POLICY "discount_requests_salesman_select" ON public.discount_requests
    FOR SELECT
    USING (
        requested_by = auth.uid() OR
        salesman_id = public.current_salesman_id() OR
        client_id IN (
            SELECT id FROM public.customers WHERE "salespersonId" = public.current_salesman_id()
        )
    );
