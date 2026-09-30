-- =========================================================================
-- MIGRATION 0009: ADVANCED COLLECTIONS, CHEQUE LIFECYCLE & RPC UPGRADE
-- Adds cheque tracking, payment verification, bounce handling, reversals,
-- FIFO auto-allocations, idempotency, and salesman collection views.
-- =========================================================================

-- 1. HARDEN PAYMENTS TABLE WITH CHEQUE & IDEMPOTENCY FIELDS
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
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency_key 
    ON public.payments(idempotency_key) 
    WHERE idempotency_key IS NOT NULL;

-- 2. ENHANCED RECORD_PAYMENT RPC WITH FIFO & CHEQUE SUPPORT
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
    v_collector_id UUID;
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
    v_collector_id := auth.uid();
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
        -- Explicit allocations provided
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

-- 3. CLEAR CHEQUE RPC
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

    -- Update payment
    UPDATE public.payments
    SET status = 'verified',
        verified_by = auth.uid(),
        verified_at = NOW(),
        "amountDueAfter" = GREATEST(0, COALESCE(v_client."amountDue", 0) - v_payment."paymentAmount"),
        updated_at = NOW()
    WHERE id = p_payment_id;

    -- Update client balances
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

    -- Log activity
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

    -- Notification
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

-- 4. BOUNCE CHEQUE RPC
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

    -- Log activity
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

    -- Notification (urgent)
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

-- 5. VERIFY PAYMENT RPC
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

-- 6. REVERSE PAYMENT RPC
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

    -- If it was previously verified, reverse customer balances
    IF v_payment.status = 'verified' AND v_client.id IS NOT NULL THEN
        UPDATE public.customers
        SET "totalPaid" = GREATEST(0, "totalPaid" - v_payment."paymentAmount"),
            "amountDue" = "amountDue" + v_payment."paymentAmount",
            updated_at = NOW()
        WHERE id = v_client.id;

        -- Record adjustment
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

-- 7. SALESMAN COLLECTIONS COMPUTED VIEW
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
