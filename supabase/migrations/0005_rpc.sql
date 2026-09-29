-- =========================================================================
-- MIGRATION 0005: TRANSACTIONAL BUSINESS RPC FUNCTIONS
-- All transactional mutations, validation rules, state machines, and
-- timeline event logging are encapsulated in Postgres RPC functions.
-- =========================================================================

-- 1. CLIENT / CUSTOMER RPCs

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
    p_payment_terms TEXT DEFAULT '30% Advance + 70% Bilty'
)
RETURNS JSONB AS $$
DECLARE
    v_client_id TEXT;
    v_salesman_name TEXT := 'Unassigned';
    v_actor TEXT := 'System Admin';
    v_client_record JSONB;
BEGIN
    IF p_business_name IS NULL OR TRIM(p_business_name) = '' THEN
        RAISE EXCEPTION 'Business / Store name is required.';
    END IF;

    IF p_phone IS NULL OR TRIM(p_phone) = '' THEN
        RAISE EXCEPTION 'Phone number is required.';
    END IF;

    v_client_id := public.gen_client_id();

    IF p_salesperson_id IS NOT NULL THEN
        SELECT name INTO v_salesman_name FROM public.sales_team WHERE id = p_salesperson_id;
        IF v_salesman_name IS NULL THEN
            v_salesman_name := 'Sales Representative';
        END IF;
    END IF;

    INSERT INTO public.customers (
        id, "businessName", "propName", phone, whatsapp, email,
        city, state, cluster, address, gstin,
        "salespersonId", "salespersonName", "creditLimit", "paymentTerms",
        status, "totalBusiness", "totalPaid", "amountDue", "ordersCount",
        created_by, created_at, updated_at
    ) VALUES (
        v_client_id, p_business_name, p_prop_name, p_phone, COALESCE(p_whatsapp, p_phone), p_email,
        p_city, p_state, p_cluster, p_address, p_gstin,
        p_salesperson_id, v_salesman_name, p_credit_limit, p_payment_terms,
        'active', 0, 0, 0, 0,
        auth.uid(), NOW(), NOW()
    );

    -- Log Timeline Activity
    INSERT INTO public.activity_events (
        actor, actor_id, action, record_type, record_id, client_id, summary
    ) VALUES (
        COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'System Admin'),
        auth.uid(),
        'Created Client Account',
        'Client',
        v_client_id,
        v_client_id,
        'Registered client ' || p_business_name || ' in ' || p_city || ' (' || p_payment_terms || ')'
    );

    SELECT to_jsonb(c.*) INTO v_client_record FROM public.customers c WHERE c.id = v_client_id;
    RETURN v_client_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.archive_client(p_client_id TEXT, p_reason TEXT DEFAULT 'Archived by administrator')
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.customers
    SET archived_at = NOW(), status = 'inactive', updated_by = auth.uid(), updated_at = NOW()
    WHERE id = p_client_id;

    INSERT INTO public.activity_events (
        actor, actor_id, action, record_type, record_id, client_id, summary
    ) VALUES (
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.assign_salesman(p_client_id TEXT, p_salesman_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_salesman_name TEXT;
    v_old_salesman TEXT;
BEGIN
    SELECT name INTO v_salesman_name FROM public.sales_team WHERE id = p_salesman_id;
    IF v_salesman_name IS NULL THEN
        RAISE EXCEPTION 'Salesman ID % not found.', p_salesman_id;
    END IF;

    SELECT "salespersonName" INTO v_old_salesman FROM public.customers WHERE id = p_client_id;

    UPDATE public.customers
    SET "salespersonId" = p_salesman_id, "salespersonName" = v_salesman_name, updated_by = auth.uid(), updated_at = NOW()
    WHERE id = p_client_id;

    INSERT INTO public.activity_events (
        actor, actor_id, action, record_type, record_id, client_id, salesman_id, summary
    ) VALUES (
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. SHOE DESIGN RPCs

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
    p_upper_material TEXT DEFAULT 'Synthetic Microfibre Leather'
)
RETURNS JSONB AS $$
DECLARE
    v_design_id TEXT;
    v_design_record JSONB;
BEGIN
    IF p_article_code IS NULL OR TRIM(p_article_code) = '' THEN
        RAISE EXCEPTION 'Article code is required.';
    END IF;

    IF p_price <= 0 THEN
        RAISE EXCEPTION 'Design wholesale price must be greater than zero.';
    END IF;

    v_design_id := public.gen_design_id();

    INSERT INTO public.designs (
        id, "articleCode", name, category, price, "moqPairs", "moqCartons",
        sizes, colors, status, subline, image, "soleType", "upperMaterial",
        created_by, created_at, updated_at
    ) VALUES (
        v_design_id, p_article_code, p_name, p_category, p_price, p_moq_pairs, p_moq_cartons,
        p_sizes, p_colors, 'Available', p_subline, p_image, p_sole_type, p_upper_material,
        auth.uid(), NOW(), NOW()
    );

    SELECT to_jsonb(d.*) INTO v_design_record FROM public.designs d WHERE d.id = v_design_id;
    RETURN v_design_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. DESIGN SHARING RPC
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
            channel, "wasViewed", "viewCount", token, created_at, updated_at
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

-- 4. ORDER CREATION & LIFECYCLE STATE MACHINE RPCs

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

    -- Calculate line totals and insert order items
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

        INSERT INTO public.order_items (
            order_id, design_id, design_code_snapshot, design_name_snapshot,
            size_matrix, qty_pairs, cartons, rate, discount, created_at
        ) VALUES (
            v_order_id, v_design.id, v_design."articleCode", v_design.name,
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

    -- Log status history
    INSERT INTO public.order_status_history (order_id, from_status, to_status, actor, actor_id, note)
    VALUES (v_order_id, NULL, 'Submitted', COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'System'), auth.uid(), 'Order submitted');

    SELECT to_jsonb(o.*) INTO v_order_record FROM public.orders o WHERE o.id = v_order_id;
    RETURN v_order_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
    IF v_order.id IS NULL THEN
        RAISE EXCEPTION 'Order % not found.', p_order_id;
    END IF;

    v_from_status := v_order.status;

    -- State Machine Transitions (Spec §6.2)
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
    WHERE id = p_order_id;

    INSERT INTO public.order_status_history (
        order_id, from_status, to_status, actor, actor_id, note
    ) VALUES (
        p_order_id, v_from_status, p_to_status,
        COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'System Admin'),
        auth.uid(),
        p_note
    );

    RETURN jsonb_build_object('orderId', p_order_id, 'fromStatus', v_from_status, 'toStatus', p_to_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. PAYMENT RECORDING & VERIFICATION RPCs

CREATE OR REPLACE FUNCTION public.record_payment(
    p_client_id TEXT,
    p_order_id TEXT,
    p_amount NUMERIC,
    p_method TEXT DEFAULT 'UPI',
    p_reference TEXT DEFAULT '',
    p_allocations JSONB DEFAULT '[]'::jsonb,
    p_notes TEXT DEFAULT '',
    p_receipt_path TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_payment_id TEXT;
    v_receipt_num TEXT;
    v_client RECORD;
    v_payment_record JSONB;
    v_alloc JSONB;
    v_alloc_order_id TEXT;
    v_alloc_amount NUMERIC(14,2);
BEGIN
    SELECT * INTO v_client FROM public.customers WHERE id = p_client_id;
    IF v_client.id IS NULL THEN
        RAISE EXCEPTION 'Customer % not found.', p_client_id;
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Payment amount must be greater than zero.';
    END IF;

    v_payment_id := public.gen_payment_id();
    v_receipt_num := 'SF-REC-' || LPAD(nextval('seq_payment_num')::TEXT, 5, '0');

    INSERT INTO public.payments (
        id, "receiptNumber", "customerId", "customerName", "customerCity",
        "orderId", "orderNumber", "amountDueBefore", "paymentAmount",
        "amountDueAfter", "paymentDate", "paymentMethod", "utrRef",
        "collectedBy", notes, "sentSms", status, receipt_path, payment_date_at,
        created_by, created_at, updated_at
    ) VALUES (
        v_payment_id, v_receipt_num, v_client.id, v_client."businessName", v_client.city,
        p_order_id, p_order_id, v_client."amountDue", p_amount,
        GREATEST(0, v_client."amountDue" - p_amount), TO_CHAR(NOW(), 'DD Mon YYYY'),
        p_method, p_reference,
        COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'Field Sales Rep'),
        p_notes, true, 'verified', p_receipt_path, NOW(),
        auth.uid(), NOW(), NOW()
    );

    -- Multi-order allocation handling
    IF jsonb_array_length(p_allocations) > 0 THEN
        FOR v_alloc IN SELECT * FROM jsonb_array_elements(p_allocations) LOOP
            v_alloc_order_id := v_alloc->>'orderId';
            v_alloc_amount := (v_alloc->>'amount')::NUMERIC;
            IF v_alloc_amount > 0 AND v_alloc_order_id IS NOT NULL THEN
                INSERT INTO public.payment_allocations (payment_id, order_id, amount)
                VALUES (v_payment_id, v_alloc_order_id, v_alloc_amount);
            END IF;
        END LOOP;
    ELSIF p_order_id IS NOT NULL THEN
        INSERT INTO public.payment_allocations (payment_id, order_id, amount)
        VALUES (v_payment_id, p_order_id, p_amount);
    END IF;

    -- Update denormalized customer totals for legacy compatibility
    UPDATE public.customers
    SET "totalPaid" = "totalPaid" + p_amount,
        "amountDue" = GREATEST(0, "amountDue" - p_amount),
        "lastPaymentDate" = 'Today',
        "lastPaymentAmount" = p_amount,
        last_payment_at = NOW(),
        updated_at = NOW()
    WHERE id = p_client_id;

    SELECT to_jsonb(p.*) INTO v_payment_record FROM public.payments p WHERE p.id = v_payment_id;
    RETURN v_payment_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. GLOBAL SEARCH RPC (pg_trgm search across all records)
CREATE OR REPLACE FUNCTION public.global_search(q TEXT)
RETURNS JSONB AS $$
DECLARE
    v_results JSONB := '{"clients": [], "orders": [], "designs": [], "payments": [], "manufacturers": []}'::jsonb;
    v_clients JSONB;
    v_orders JSONB;
    v_designs JSONB;
    v_payments JSONB;
    v_mfg JSONB;
BEGIN
    IF q IS NULL OR LENGTH(TRIM(q)) = 0 THEN
        RETURN v_results;
    END IF;

    -- Search Clients
    SELECT COALESCE(jsonb_agg(to_jsonb(t.*)), '[]'::jsonb) INTO v_clients FROM (
        SELECT id, "businessName" AS title, "propName" AS subtitle, city, 'client' AS type
        FROM public.customers
        WHERE archived_at IS NULL AND (
            "businessName" ILIKE '%' || q || '%' OR
            "propName" ILIKE '%' || q || '%' OR
            phone ILIKE '%' || q || '%' OR
            city ILIKE '%' || q || '%' OR
            id ILIKE '%' || q || '%'
        )
        LIMIT 5
    ) t;

    -- Search Orders
    SELECT COALESCE(jsonb_agg(to_jsonb(t.*)), '[]'::jsonb) INTO v_orders FROM (
        SELECT id, id AS title, "customerName" AS subtitle, "netPayable", status, 'order' AS type
        FROM public.orders
        WHERE archived_at IS NULL AND (
            id ILIKE '%' || q || '%' OR
            "customerName" ILIKE '%' || q || '%' OR
            "salespersonName" ILIKE '%' || q || '%'
        )
        LIMIT 5
    ) t;

    -- Search Designs
    SELECT COALESCE(jsonb_agg(to_jsonb(t.*)), '[]'::jsonb) INTO v_designs FROM (
        SELECT id, name AS title, "articleCode" AS subtitle, price, category, 'design' AS type
        FROM public.designs
        WHERE archived_at IS NULL AND (
            name ILIKE '%' || q || '%' OR
            "articleCode" ILIKE '%' || q || '%' OR
            category ILIKE '%' || q || '%'
        )
        LIMIT 5
    ) t;

    -- Search Payments
    SELECT COALESCE(jsonb_agg(to_jsonb(t.*)), '[]'::jsonb) INTO v_payments FROM (
        SELECT id, "receiptNumber" AS title, "customerName" AS subtitle, "paymentAmount", "paymentMethod", 'payment' AS type
        FROM public.payments
        WHERE archived_at IS NULL AND (
            id ILIKE '%' || q || '%' OR
            "receiptNumber" ILIKE '%' || q || '%' OR
            "customerName" ILIKE '%' || q || '%' OR
            "utrRef" ILIKE '%' || q || '%'
        )
        LIMIT 5
    ) t;

    RETURN jsonb_build_object(
        'clients', v_clients,
        'orders', v_orders,
        'designs', v_designs,
        'payments', v_payments
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
