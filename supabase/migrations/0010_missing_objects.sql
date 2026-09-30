-- =========================================================================
-- MIGRATION 0010: MISSING OBJECTS, AUDIT FIXES & LOOKBOOK RPC
-- Adds field_visits.updated_at, sales_team.user_id, collections hardening,
-- get_shared_designs RPC, and storage buckets configuration.
-- =========================================================================

-- 1. HARDEN SALES_TEAM & FIELD_VISITS
ALTER TABLE public.sales_team
    ADD COLUMN IF NOT EXISTS user_id UUID,
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE public.field_visits
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trigger_set_field_visits_updated_at ON public.field_visits;
CREATE TRIGGER trigger_set_field_visits_updated_at
    BEFORE UPDATE ON public.field_visits
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- 2. HARDEN PAYMENTS TABLE WITH CHEQUE, VERIFICATION & IDEMPOTENCY FIELDS
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments 
    ADD CONSTRAINT payments_status_check 
    CHECK (status IN ('recorded', 'pending_clearance', 'verified', 'bounced', 'reversed'));

ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS cheque_no TEXT,
    ADD COLUMN IF NOT EXISTS cheque_bank TEXT,
    ADD COLUMN IF NOT EXISTS cheque_date DATE,
    ADD COLUMN IF NOT EXISTS bounce_reason TEXT,
    ADD COLUMN IF NOT EXISTS reversal_reason TEXT,
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
    ADD COLUMN IF NOT EXISTS verified_by UUID,
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency_key 
    ON public.payments(idempotency_key) 
    WHERE idempotency_key IS NOT NULL;

-- 3. ENHANCED RECORD_PAYMENT RPC WITH FIFO & CHEQUE SUPPORT
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
    p_idempotency_key TEXT DEFAULT NULL
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
    v_order RECORD;
    v_order_alloc NUMERIC(14,2);
    v_collector_name TEXT;
    v_existing_id TEXT;
BEGIN
    -- Idempotency check
    IF p_idempotency_key IS NOT NULL AND TRIM(p_idempotency_key) <> '' THEN
        SELECT id INTO v_existing_id FROM public.payments WHERE idempotency_key = p_idempotency_key LIMIT 1;
        IF v_existing_id IS NOT NULL THEN
            SELECT to_jsonb(p.*) INTO v_payment_record FROM public.payments p WHERE p.id = v_existing_id;
            RETURN v_payment_record;
        END IF;
    END IF;

    -- Validate client
    SELECT * INTO v_client FROM public.customers WHERE id = p_client_id;
    IF v_client.id IS NULL THEN
        RAISE EXCEPTION 'Customer % not found.', p_client_id;
    END IF;

    -- Validate amount
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Payment amount must be greater than zero.';
    END IF;

    -- Validate method specifics
    IF UPPER(p_method) = 'CHEQUE' THEN
        IF p_cheque_no IS NULL OR TRIM(p_cheque_no) = '' THEN
            RAISE EXCEPTION 'Cheque number is required for Cheque payments.';
        END IF;
        IF p_cheque_bank IS NULL OR TRIM(p_cheque_bank) = '' THEN
            RAISE EXCEPTION 'Cheque bank name is required for Cheque payments.';
        END IF;
        v_status := 'pending_clearance';
    ELSE
        v_status := 'verified';
    END IF;

    v_payment_id := public.gen_payment_id();
    v_receipt_num := 'SF-REC-' || LPAD(nextval('seq_payment_num')::TEXT, 5, '0');
    v_collector_name := COALESCE(
        (SELECT full_name FROM public.profiles WHERE id = auth.uid()),
        v_client."salespersonName",
        'Field Representative'
    );

    INSERT INTO public.payments (
        id, "receiptNumber", "customerId", "customerName", "customerCity",
        "orderId", "orderNumber", "amountDueBefore", "paymentAmount",
        "amountDueAfter", "paymentDate", "paymentMethod", "utrRef",
        "collectedBy", notes, "sentSms", status, payment_date_at,
        cheque_no, cheque_bank, cheque_date, idempotency_key,
        created_by, created_at, updated_at
    ) VALUES (
        v_payment_id, v_receipt_num, v_client.id, v_client."businessName", v_client.city,
        NULL, NULL, v_client."amountDue", p_amount,
        CASE WHEN v_status = 'verified' THEN GREATEST(0, v_client."amountDue" - p_amount) ELSE v_client."amountDue" END,
        TO_CHAR(COALESCE(p_payment_date, NOW()), 'DD Mon YYYY'),
        p_method, p_reference,
        v_collector_name,
        p_notes, true, v_status, COALESCE(p_payment_date, NOW()),
        p_cheque_no, p_cheque_bank, p_cheque_date, p_idempotency_key,
        auth.uid(), NOW(), NOW()
    );

    -- Order allocation handling
    v_remaining_amount := p_amount;

    IF jsonb_array_length(p_allocations) > 0 THEN
        FOR v_alloc IN SELECT * FROM jsonb_array_elements(p_allocations) LOOP
            v_alloc_order_id := v_alloc->>'orderId';
            v_alloc_amount := (v_alloc->>'amount')::NUMERIC;
            IF v_alloc_amount > 0 AND v_alloc_order_id IS NOT NULL THEN
                INSERT INTO public.payment_allocations (payment_id, order_id, amount)
                VALUES (v_payment_id, v_alloc_order_id, v_alloc_amount);
            END IF;
        END LOOP;
    ELSE
        -- Auto-allocate FIFO across unpaid orders
        FOR v_order IN 
            SELECT o.id, o."netPayable",
                   (o."netPayable" - COALESCE((SELECT SUM(pa.amount) FROM public.payment_allocations pa JOIN public.payments p ON p.id = pa.payment_id WHERE pa.order_id = o.id AND p.status = 'verified'), 0)) AS outstanding
            FROM public.orders o
            WHERE o."customerId" = p_client_id 
              AND o.archived_at IS NULL
              AND o.status NOT IN ('Cancelled', 'Draft')
            ORDER BY COALESCE(o.order_date_at, o.created_at) ASC
        LOOP
            IF v_remaining_amount <= 0 THEN
                EXIT;
            END IF;

            IF v_order.outstanding > 0 THEN
                v_order_alloc := LEAST(v_remaining_amount, v_order.outstanding);
                INSERT INTO public.payment_allocations (payment_id, order_id, amount)
                VALUES (v_payment_id, v_order.id, v_order_alloc);
                v_remaining_amount := v_remaining_amount - v_order_alloc;
            END IF;
        END LOOP;
    END IF;

    -- If payment is verified immediately, update customer balance
    IF v_status = 'verified' THEN
        UPDATE public.customers
        SET "totalPaid" = "totalPaid" + p_amount,
            "amountDue" = GREATEST(0, "amountDue" - p_amount),
            "lastPaymentDate" = 'Today',
            "lastPaymentAmount" = p_amount,
            last_payment_at = COALESCE(p_payment_date, NOW()),
            updated_at = NOW()
        WHERE id = p_client_id;
    END IF;

    -- Log activity
    INSERT INTO public.activity_events (
        actor, actor_id, action, record_type, record_id, client_id, payment_id, summary, metadata
    ) VALUES (
        v_collector_name,
        auth.uid(),
        'Recorded Payment Collection',
        'Payment',
        v_payment_id,
        p_client_id,
        v_payment_id,
        'Collected ₹' || TO_CHAR(p_amount, 'FM99,99,999') || ' from ' || v_client."businessName" || ' via ' || p_method || ' (' || v_status || ')',
        jsonb_build_object('receiptNumber', v_receipt_num, 'amount', p_amount, 'method', p_method, 'status', v_status)
    );

    -- Create notification
    INSERT INTO public.notifications (
        user_id, recipient_role, type, title, body, record_type, record_id
    ) VALUES (
        NULL,
        'all',
        'payment_collected',
        'Payment of ₹' || TO_CHAR(p_amount, 'FM99,99,999') || ' Recorded',
        v_collector_name || ' recorded ' || p_method || ' collection from ' || v_client."businessName",
        'Payment',
        v_payment_id
    );

    SELECT to_jsonb(p.*) INTO v_payment_record FROM public.payments p WHERE p.id = v_payment_id;
    RETURN v_payment_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. CLEAR CHEQUE RPC
CREATE OR REPLACE FUNCTION public.clear_cheque(p_payment_id TEXT)
RETURNS JSONB AS $$
DECLARE
    v_payment RECORD;
    v_client RECORD;
    v_result JSONB;
BEGIN
    SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id;
    IF v_payment.id IS NULL THEN
        RAISE EXCEPTION 'Payment % not found.', p_payment_id;
    END IF;

    IF v_payment.status <> 'pending_clearance' THEN
        RAISE EXCEPTION 'Payment % is not in pending_clearance status (current: %)', p_payment_id, v_payment.status;
    END IF;

    SELECT * INTO v_client FROM public.customers WHERE id = v_payment."customerId";

    UPDATE public.payments
    SET status = 'verified',
        verified_by = auth.uid(),
        verified_at = NOW(),
        "amountDueAfter" = GREATEST(0, COALESCE(v_client."amountDue", 0) - v_payment."paymentAmount"),
        updated_at = NOW()
    WHERE id = p_payment_id;

    IF v_client.id IS NOT NULL THEN
        UPDATE public.customers
        SET "totalPaid" = "totalPaid" + v_payment."paymentAmount",
            "amountDue" = GREATEST(0, "amountDue" - v_payment."paymentAmount"),
            "lastPaymentDate" = 'Today',
            "lastPaymentAmount" = v_payment."paymentAmount",
            last_payment_at = NOW(),
            updated_at = NOW()
        WHERE id = v_client.id;
    END IF;

    INSERT INTO public.activity_events (
        actor, actor_id, action, record_type, record_id, client_id, payment_id, summary
    ) VALUES (
        COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'Accounts Admin'),
        auth.uid(),
        'Cleared Cheque Payment',
        'Payment',
        p_payment_id,
        v_payment."customerId",
        p_payment_id,
        'Cheque #' || COALESCE(v_payment.cheque_no, '') || ' (' || COALESCE(v_payment.cheque_bank, '') || ') of ₹' || TO_CHAR(v_payment."paymentAmount", 'FM99,99,999') || ' cleared successfully.'
    );

    INSERT INTO public.notifications (
        recipient_role, type, title, body, record_type, record_id
    ) VALUES (
        'all',
        'cheque_cleared',
        'Cheque Cleared: ₹' || TO_CHAR(v_payment."paymentAmount", 'FM99,99,999'),
        'Cheque #' || COALESCE(v_payment.cheque_no, '') || ' from ' || v_payment."customerName" || ' has cleared.',
        'Payment',
        p_payment_id
    );

    SELECT to_jsonb(p.*) INTO v_result FROM public.payments p WHERE p.id = p_payment_id;
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. BOUNCE CHEQUE RPC
CREATE OR REPLACE FUNCTION public.bounce_cheque(p_payment_id TEXT, p_reason TEXT DEFAULT 'Insufficient funds')
RETURNS JSONB AS $$
DECLARE
    v_payment RECORD;
    v_result JSONB;
BEGIN
    SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id;
    IF v_payment.id IS NULL THEN
        RAISE EXCEPTION 'Payment % not found.', p_payment_id;
    END IF;

    IF v_payment.status NOT IN ('pending_clearance', 'recorded') THEN
        RAISE EXCEPTION 'Payment % cannot be bounced from status "%"', p_payment_id, v_payment.status;
    END IF;

    UPDATE public.payments
    SET status = 'bounced',
        bounce_reason = COALESCE(p_reason, 'Cheque dishonoured / bounced'),
        updated_at = NOW()
    WHERE id = p_payment_id;

    INSERT INTO public.activity_events (
        actor, actor_id, action, record_type, record_id, client_id, payment_id, summary
    ) VALUES (
        COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'Accounts Admin'),
        auth.uid(),
        'Cheque Bounced',
        'Payment',
        p_payment_id,
        v_payment."customerId",
        p_payment_id,
        'Cheque #' || COALESCE(v_payment.cheque_no, '') || ' of ₹' || TO_CHAR(v_payment."paymentAmount", 'FM99,99,999') || ' bounced: ' || COALESCE(p_reason, 'Dishonoured')
    );

    INSERT INTO public.notifications (
        recipient_role, type, title, body, record_type, record_id
    ) VALUES (
        'all',
        'cheque_bounced',
        '⚠️ Cheque Bounced: ' || v_payment."customerName",
        'Cheque #' || COALESCE(v_payment.cheque_no, '') || ' for ₹' || TO_CHAR(v_payment."paymentAmount", 'FM99,99,999') || ' bounced (' || COALESCE(p_reason, 'Dishonoured') || ')',
        'Payment',
        p_payment_id
    );

    SELECT to_jsonb(p.*) INTO v_result FROM public.payments p WHERE p.id = p_payment_id;
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. VERIFY PAYMENT RPC
CREATE OR REPLACE FUNCTION public.verify_payment(p_payment_id TEXT)
RETURNS JSONB AS $$
DECLARE
    v_payment RECORD;
    v_client RECORD;
    v_result JSONB;
BEGIN
    SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id;
    IF v_payment.id IS NULL THEN
        RAISE EXCEPTION 'Payment % not found.', p_payment_id;
    END IF;

    IF v_payment.status = 'verified' THEN
        SELECT to_jsonb(p.*) INTO v_result FROM public.payments p WHERE p.id = p_payment_id;
        RETURN v_result;
    END IF;

    SELECT * INTO v_client FROM public.customers WHERE id = v_payment."customerId";

    UPDATE public.payments
    SET status = 'verified',
        verified_by = auth.uid(),
        verified_at = NOW(),
        updated_at = NOW()
    WHERE id = p_payment_id;

    IF v_payment.status IN ('pending_clearance', 'recorded') AND v_client.id IS NOT NULL THEN
        UPDATE public.customers
        SET "totalPaid" = "totalPaid" + v_payment."paymentAmount",
            "amountDue" = GREATEST(0, "amountDue" - v_payment."paymentAmount"),
            last_payment_at = NOW(),
            updated_at = NOW()
        WHERE id = v_client.id;
    END IF;

    INSERT INTO public.activity_events (
        actor, actor_id, action, record_type, record_id, client_id, payment_id, summary
    ) VALUES (
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. REVERSE PAYMENT RPC
CREATE OR REPLACE FUNCTION public.reverse_payment(p_payment_id TEXT, p_reason TEXT DEFAULT 'Payment reversal')
RETURNS JSONB AS $$
DECLARE
    v_payment RECORD;
    v_client RECORD;
    v_result JSONB;
BEGIN
    SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id;
    IF v_payment.id IS NULL THEN
        RAISE EXCEPTION 'Payment % not found.', p_payment_id;
    END IF;

    IF v_payment.status = 'reversed' THEN
        RAISE EXCEPTION 'Payment % is already reversed.', p_payment_id;
    END IF;

    SELECT * INTO v_client FROM public.customers WHERE id = v_payment."customerId";

    IF v_payment.status = 'verified' AND v_client.id IS NOT NULL THEN
        UPDATE public.customers
        SET "totalPaid" = GREATEST(0, "totalPaid" - v_payment."paymentAmount"),
            "amountDue" = "amountDue" + v_payment."paymentAmount",
            updated_at = NOW()
        WHERE id = v_client.id;

        INSERT INTO public.payment_adjustments (
            client_id, type, amount, reason, reverses_payment_id, created_by
        ) VALUES (
            v_client.id, 'reversal', v_payment."paymentAmount", COALESCE(p_reason, 'Manual reversal'), p_payment_id, auth.uid()
        );
    END IF;

    UPDATE public.payments
    SET status = 'reversed',
        reversal_reason = COALESCE(p_reason, 'Manual reversal'),
        updated_at = NOW()
    WHERE id = p_payment_id;

    INSERT INTO public.activity_events (
        actor, actor_id, action, record_type, record_id, client_id, payment_id, summary
    ) VALUES (
        COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'Accounts Admin'),
        auth.uid(),
        'Reversed Payment',
        'Payment',
        p_payment_id,
        v_payment."customerId",
        p_payment_id,
        'Payment ' || v_payment."receiptNumber" || ' (₹' || TO_CHAR(v_payment."paymentAmount", 'FM99,99,999') || ') reversed: ' || COALESCE(p_reason, 'Reversed')
    );

    SELECT to_jsonb(p.*) INTO v_result FROM public.payments p WHERE p.id = p_payment_id;
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. SALESMAN COLLECTIONS COMPUTED VIEW (Idempotent)
CREATE OR REPLACE VIEW public.v_salesman_collections AS
SELECT 
    st.id AS salesman_id,
    st.name AS salesman_name,
    COALESCE((
        SELECT SUM(p."paymentAmount")
        FROM public.payments p
        WHERE (p."collectedBy" = st.name OR p.created_by = st.user_id)
          AND p.status = 'verified'
          AND p.archived_at IS NULL
          AND DATE_TRUNC('month', COALESCE(p.payment_date_at, p.created_at)) = DATE_TRUNC('month', CURRENT_DATE)
    ), 0)::NUMERIC(14,2) AS collected_this_month,
    COALESCE((
        SELECT SUM(p."paymentAmount")
        FROM public.payments p
        WHERE (p."collectedBy" = st.name OR p.created_by = st.user_id)
          AND p.status = 'pending_clearance'
          AND p.archived_at IS NULL
    ), 0)::NUMERIC(14,2) AS cheques_in_transit,
    COALESCE((
        SELECT SUM(c."amountDue")
        FROM public.customers c
        WHERE c."salespersonId" = st.id AND c.archived_at IS NULL
    ), 0)::NUMERIC(14,2) AS total_pending_client_balance,
    COALESCE((
        SELECT COUNT(c.id)
        FROM public.customers c
        WHERE c."salespersonId" = st.id AND c.archived_at IS NULL AND c."amountDue" > 0
    ), 0)::INT AS pending_accounts_count
FROM public.sales_team st
WHERE st.archived_at IS NULL;

-- 9. SHARE_DESIGNS & GET_SHARED_DESIGNS RPCs (Lookbook sharing)
ALTER TABLE public.design_shares ALTER COLUMN timestamp SET DEFAULT TO_CHAR(NOW(), 'DD Mon YYYY, HH:MI AM');
ALTER TABLE public.design_shares ALTER COLUMN timestamp DROP NOT NULL;

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
BEGIN
    IF array_length(p_design_ids, 1) IS NULL OR array_length(p_client_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'Select at least one design and one client to share.';
    END IF;

    SELECT array_agg(name) INTO v_design_names FROM public.designs WHERE id = ANY(p_design_ids);

    FOREACH v_client_id IN ARRAY p_client_ids LOOP
        SELECT "businessName", phone INTO v_client_name, v_client_phone FROM public.customers WHERE id = v_client_id;
        v_share_id := 'SHR-' || LPAD(nextval('seq_share_num')::TEXT, 5, '0');
        v_token := gen_random_uuid();

        INSERT INTO public.design_shares (
            id, "sharedBy", "sharedByRole", "targetClientId", "targetClientName",
            "targetPhone", "designsCount", "designIds", "designNames",
            timestamp, channel, "wasViewed", "viewCount", token, created_at, updated_at
        ) VALUES (
            v_share_id,
            COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'Sales Rep'),
            COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), 'salesperson'),
            v_client_id,
            COALESCE(v_client_name, 'Client'),
            COALESCE(v_client_phone, '+91 98000 00000'),
            array_length(p_design_ids, 1),
            to_jsonb(p_design_ids),
            to_jsonb(v_design_names),
            TO_CHAR(NOW(), 'DD Mon YYYY, HH:MI AM'),
            p_channel,
            false,
            0,
            v_token,
            NOW(),
            NOW()
        );

        FOREACH v_design_id IN ARRAY p_design_ids LOOP
            INSERT INTO public.design_share_items (share_id, design_id)
            VALUES (v_share_id, v_design_id);
        END LOOP;

        v_results := v_results || jsonb_build_object(
            'shareId', v_share_id,
            'clientId', v_client_id,
            'token', v_token,
            'url', '/s/' || v_token::text
        );
    END LOOP;

    RETURN v_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9.1 AUDIT TRIGGER ID FIX
CREATE OR REPLACE FUNCTION public.audit_row_change()
RETURNS TRIGGER AS $$
DECLARE
    v_actor TEXT;
    v_action TEXT;
    v_record_id TEXT;
    v_record_type TEXT := TG_TABLE_NAME;
    v_title TEXT := '';
    v_old_val TEXT := '';
    v_new_val TEXT := '';
BEGIN
    SELECT COALESCE(full_name, email) INTO v_actor FROM public.profiles WHERE id = auth.uid();
    IF v_actor IS NULL THEN
        v_actor := 'System Transaction';
    END IF;

    IF (TG_OP = 'INSERT') THEN
        v_action := 'CREATE';
        v_record_id := NEW.id::TEXT;
        v_new_val := to_jsonb(NEW)::TEXT;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_action := 'UPDATE';
        v_record_id := NEW.id::TEXT;
        v_old_val := to_jsonb(OLD)::TEXT;
        v_new_val := to_jsonb(NEW)::TEXT;
    ELSIF (TG_OP = 'DELETE') THEN
        v_action := 'DELETE';
        v_record_id := OLD.id::TEXT;
        v_old_val := to_jsonb(OLD)::TEXT;
    END IF;

    INSERT INTO public.audit_logs (
        id, actor, "actorRole", action, "recordType", "recordId", "recordTitle",
        "oldValue", "newValue", timestamp, source, created_at
    ) VALUES (
        'aud-' || extract(epoch from now())::bigint || '-' || substr(gen_random_uuid()::text, 1, 8),
        v_actor,
        COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), 'System'),
        v_action,
        v_record_type,
        COALESCE(v_record_id, 'N/A'),
        v_record_type || ' #' || COALESCE(v_record_id, ''),
        v_old_val,
        v_new_val,
        TO_CHAR(NOW(), 'DD Mon YYYY, HH:MI AM'),
        'Postgres DB Trigger',
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
BEGIN
    SELECT * INTO v_client_record FROM public.customers WHERE id = p_client_id;
    IF v_client_record.id IS NULL THEN
        RAISE EXCEPTION 'Customer account % not found.', p_client_id;
    END IF;

    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Order must contain at least one design item.';
    END IF;

    v_order_id := public.gen_order_id();

    -- Calculate line totals first
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        SELECT * INTO v_design FROM public.designs WHERE id = (v_item->>'designId');
        IF v_design.id IS NULL THEN
            RAISE EXCEPTION 'Design % does not exist.', (v_item->>'designId');
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
    END LOOP;

    -- Financial Totals
    v_trade_discount_amount := ROUND((v_subtotal * COALESCE(p_trade_discount_percent, 0) / 100.0), 2);
    v_taxable := v_subtotal - v_trade_discount_amount;
    v_gst_amount := ROUND((v_taxable * COALESCE(p_gst_percent, 12) / 100.0), 2);
    v_net_payable := v_taxable + v_gst_amount;
    v_balance_due := GREATEST(0, v_net_payable - COALESCE(p_advance_deposited, 0));

    -- Insert Order header first
    INSERT INTO public.orders (
        id, "customerId", "customerName", "propName", "customerCity", "customerState",
        "salespersonId", "salespersonName", items, "pairsCount", "cartonsCount",
        "wholesaleRate", subtotal, "tradeDiscountPercent", "tradeDiscountAmount",
        "taxableSubtotal", "gstPercent", "gstAmount", "netPayable",
        "advanceDeposited", "balanceDue", "expectedDelivery", "paymentStatus",
        status, "orderDate", order_date_at, created_by, created_at, updated_at
    ) VALUES (
        v_order_id, v_client_record.id, v_client_record."businessName", v_client_record."propName",
        v_client_record.city, v_client_record.state, v_client_record."salespersonId", v_client_record."salespersonName",
        p_items, v_total_pairs, v_total_cartons, (v_subtotal / v_total_pairs)::NUMERIC(14,2),
        v_subtotal, p_trade_discount_percent, v_trade_discount_amount,
        v_taxable, p_gst_percent, v_gst_amount, v_net_payable,
        p_advance_deposited, v_balance_due, COALESCE(p_expected_delivery, 'Est. 15 Days'),
        CASE WHEN p_advance_deposited >= v_net_payable THEN 'Paid' WHEN p_advance_deposited > 0 THEN 'Advance Deposited' ELSE 'Payment Pending' END,
        'Submitted', TO_CHAR(NOW(), 'DD Mon YYYY'), NOW(), auth.uid(), NOW(), NOW()
    );

    -- Insert line items now that parent order exists
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        SELECT * INTO v_design FROM public.designs WHERE id = (v_item->>'designId');
        v_item_qty := COALESCE((v_item->>'qtyPairs')::INT, (v_item->>'quantity')::INT, 120);
        v_item_cartons := COALESCE((v_item->>'cartons')::INT, CEIL(v_item_qty::NUMERIC / 12));
        v_item_rate := COALESCE((v_item->>'rate')::NUMERIC, v_design.price);
        v_item_discount := COALESCE((v_item->>'discount')::NUMERIC, 0);

        INSERT INTO public.order_items (
            order_id, design_id, design_code_snapshot, design_name_snapshot,
            size_matrix, qty_pairs, cartons, rate, discount, created_at
        ) VALUES (
            v_order_id, v_design.id, v_design."articleCode", v_design.name,
            COALESCE(v_item->'sizeMatrix', '[]'::jsonb), v_item_qty, v_item_cartons, v_item_rate, v_item_discount, NOW()
        );
    END LOOP;

    -- Log status history
    INSERT INTO public.order_status_history (order_id, from_status, to_status, actor, actor_id, note)
    VALUES (v_order_id, NULL, 'Submitted', COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'System'), auth.uid(), 'Order submitted');

    SELECT to_jsonb(o.*) INTO v_order_record FROM public.orders o WHERE o.id = v_order_id;
    RETURN v_order_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_shared_designs(p_share_token TEXT)
RETURNS JSONB AS $$
DECLARE
    v_share RECORD;
    v_client RECORD;
    v_designs JSONB := '[]'::jsonb;
    v_token_uuid UUID;
BEGIN
    -- Try matching token as UUID or text ID
    BEGIN
        v_token_uuid := p_share_token::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_token_uuid := NULL;
    END;

    SELECT * INTO v_share
    FROM public.design_shares
    WHERE (token = v_token_uuid OR id = p_share_token)
      AND archived_at IS NULL
    LIMIT 1;

    IF v_share.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Shared lookbook not found or expired.'
        );
    END IF;

    -- Update view tracking
    UPDATE public.design_shares
    SET "viewCount" = COALESCE("viewCount", 0) + 1,
        "wasViewed" = true,
        viewed_at = NOW(),
        updated_at = NOW()
    WHERE id = v_share.id;

    -- Get client details
    SELECT "businessName", city INTO v_client
    FROM public.customers
    WHERE id = v_share."targetClientId";

    -- Get design items
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', d.id,
            'articleCode', d."articleCode",
            'name', d.name,
            'category', d.category,
            'price', d.price,
            'moqPairs', d."moqPairs",
            'moqCartons', d."moqCartons",
            'sizes', d.sizes,
            'colors', d.colors,
            'status', d.status,
            'tags', d.tags,
            'subline', d.subline,
            'image', d.image,
            'soleType', d."soleType",
            'pairsPerCarton', d."pairsPerCarton",
            'upperMaterial', d."upperMaterial",
            'marginBadge', d."marginBadge",
            'velocityBadge', d."velocityBadge"
        )
    ), '[]'::jsonb) INTO v_designs
    FROM public.designs d
    WHERE (
        d.id IN (SELECT dsi.design_id FROM public.design_share_items dsi WHERE dsi.share_id = v_share.id)
        OR (v_share."designIds" IS NOT NULL AND jsonb_path_exists(v_share."designIds", ('$[*] ? (@ == "' || d.id || '")')::jsonpath))
    )
    AND d.archived_at IS NULL;

    -- Return combined response
    RETURN jsonb_build_object(
        'success', true,
        'shareId', v_share.id,
        'client', jsonb_build_object(
            'businessName', COALESCE(v_client."businessName", v_share."targetClientName"),
            'city', COALESCE(v_client.city, 'Agra')
        ),
        'designs', v_designs
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. STORAGE BUCKETS CONFIGURATION (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-images', 'design-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$
BEGIN
    -- Public read on design-images
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access Design Images'
    ) THEN
        CREATE POLICY "Public Access Design Images" ON storage.objects
            FOR SELECT USING (bucket_id = 'design-images');
    END IF;

    -- Authenticated insert/update/delete on design-images
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Upload Design Images'
    ) THEN
        CREATE POLICY "Authenticated Upload Design Images" ON storage.objects
            FOR ALL USING (bucket_id = 'design-images' AND auth.role() = 'authenticated')
            WITH CHECK (bucket_id = 'design-images' AND auth.role() = 'authenticated');
    END IF;

    -- Authenticated access on payment-receipts
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Access Payment Receipts'
    ) THEN
        CREATE POLICY "Authenticated Access Payment Receipts" ON storage.objects
            FOR ALL USING (bucket_id = 'payment-receipts' AND auth.role() = 'authenticated')
            WITH CHECK (bucket_id = 'payment-receipts' AND auth.role() = 'authenticated');
    END IF;

    -- Public reference read policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'sales_team' AND policyname = 'Allow public read sales_team'
    ) THEN
        CREATE POLICY "Allow public read sales_team" ON public.sales_team FOR SELECT TO anon, authenticated USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'manufacturers' AND policyname = 'Allow public read manufacturers'
    ) THEN
        CREATE POLICY "Allow public read manufacturers" ON public.manufacturers FOR SELECT TO anon, authenticated USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Allow public read app_settings'
    ) THEN
        CREATE POLICY "Allow public read app_settings" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
    END IF;
END $$;

-- 11. BASE REFERENCE SEED DATA (Idempotent)
INSERT INTO public.sales_team (
    id, name, "roleTitle", cluster, zone, phone, email, "empId",
    "monthlyTarget", "bookedThisMonth", "commissionRate", "commissionAccrued",
    "collectionDue", "assignedAccountsCount", status
) VALUES 
('sales-1', 'Rahul Sharma', 'Senior Rep', 'Agra North', 'North', '+91 98765 43210', 'rahul.s@soleflow.in', 'EMP-0101', 1200000, 750000, 2.5, 18750, 230000, 18, 'In Market'),
('sales-2', 'Amit Verma', 'Territory Lead', 'Kanpur Central', 'Central', '+91 98765 43211', 'amit.v@soleflow.in', 'EMP-0102', 1500000, 920000, 2.8, 25760, 310000, 22, 'In Market'),
('sales-3', 'Vikram Malhotra', 'Field Rep', 'Delhi NCR', 'North', '+91 98765 43212', 'vikram.m@soleflow.in', 'EMP-0103', 1000000, 480000, 2.0, 9600, 150000, 14, 'Office/HQ')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.manufacturers (
    id, "companyName", "hubLocation", "estYear", "primarySpecialization",
    "monthlyCapacityPairs", "runningBatchesCount", "onTimeDeliveryRate",
    "qcPassRatio", "generalManager", phone, "loadPercentage", status
) VALUES
('mfg-1', 'Apex Footwear Works', 'Agra Hub (Bodla)', 2012, 'Formal Derby & Oxford', 15000, 4, 96, 98.5, 'Suresh Chandra', '+91 98970 11223', 72, 'Active Plants'),
('mfg-2', 'Crown Leather Crafts', 'Agra Hub (Sikandra)', 2016, 'Handcrafted Leather Boots', 10000, 2, 94, 97.8, 'Rajeev Agarwal', '+91 98970 11224', 65, 'Active Plants'),
('mfg-3', 'Sprint Sole Manufacturing', 'Kanpur Hub (Jajmau)', 2018, 'Athletic Sneakers & EVA', 25000, 6, 98, 99.1, 'Manish Tiwari', '+91 98970 11225', 85, 'Active Plants')
ON CONFLICT (id) DO NOTHING;

