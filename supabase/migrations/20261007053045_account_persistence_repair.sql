-- Repair persistence without deleting business records.
-- Remove superseded overloads: PostgREST cannot choose between default arguments.
DROP FUNCTION IF EXISTS public.create_client(text,text,text,text,text,text,text,text,text,text,text,numeric,text);
DROP FUNCTION IF EXISTS public.create_design(text,text,text,numeric,integer,integer,jsonb,jsonb,text,text,text,text);
DROP FUNCTION IF EXISTS public.record_payment(text,numeric,text,text,timestamptz,jsonb,text,text,text,date,text);
DROP FUNCTION IF EXISTS public.record_payment(text,text,numeric,text,text,jsonb,text,text);

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

    IF auth.uid() IS NULL OR public.is_view_mode_active() THEN
        RAISE EXCEPTION 'An authenticated, editable account is required' USING ERRCODE = '42501';
    END IF;
    SELECT * INTO v_client_record
    FROM public.customers
    WHERE id = p_client_id AND public.can_access_org(org_id);

    IF v_client_record.id IS NULL THEN
        RAISE EXCEPTION 'Customer account % not found or permission denied.', p_client_id;
    END IF;

    IF NOT public.can_access_client(p_client_id) THEN
        RAISE EXCEPTION 'Client access denied' USING ERRCODE = '42501';
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

        v_item_qty := COALESCE((v_item->>'qtyPairs')::INT, (v_item->>'quantity')::INT, (v_item->>'totalPairs')::INT, 0);
        IF v_item_qty <= 0 THEN
            RAISE EXCEPTION 'Quantity for design % must be greater than 0.', v_design.name;
        END IF;

        v_item_cartons := COALESCE((v_item->>'cartons')::INT, (v_item->>'totalCartons')::INT, CEIL(v_item_qty::NUMERIC / 12));
        v_item_rate := COALESCE((v_item->>'rate')::NUMERIC, (v_item->>'ratePerPair')::NUMERIC, v_design.price);
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

    -- The parent must exist before inserting its foreign-key children.
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        SELECT * INTO v_design FROM public.designs WHERE id = v_item->>'designId' AND org_id = v_org_id;
        v_item_qty := COALESCE((v_item->>'qtyPairs')::INT, (v_item->>'quantity')::INT, (v_item->>'totalPairs')::INT, 0);
        v_item_cartons := COALESCE((v_item->>'cartons')::INT, (v_item->>'totalCartons')::INT, CEIL(v_item_qty::NUMERIC / 12));
        v_item_rate := COALESCE((v_item->>'rate')::NUMERIC, (v_item->>'ratePerPair')::NUMERIC, v_design.price);
        v_item_discount := COALESCE((v_item->>'discount')::NUMERIC, 0);
        INSERT INTO public.order_items (
            org_id, order_id, design_id, design_code_snapshot, design_name_snapshot,
            size_matrix, qty_pairs, cartons, rate, discount, created_at
        ) VALUES (
            v_org_id, v_order_id, v_design.id, v_design."articleCode", v_design.name,
            COALESCE(v_item->'sizeMatrix', v_item->'sizeBreakdown', '[]'::jsonb), v_item_qty, v_item_cartons, v_item_rate, v_item_discount, NOW()
        );
    END LOOP;

    UPDATE public.customers SET "ordersCount" = COALESCE("ordersCount",0) + 1,
        "totalBusiness" = COALESCE("totalBusiness",0) + v_net_payable,
        "amountDue" = COALESCE("amountDue",0) + v_balance_due,
        last_order_at = now(), "lastOrderDate" = 'Today'
    WHERE id = p_client_id AND org_id = v_org_id;

    INSERT INTO public.order_status_history (org_id, order_id, from_status, to_status, actor, actor_id, note)
    VALUES (v_org_id, v_order_id, NULL, 'Submitted', COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'System'), auth.uid(), 'Order submitted');

    SELECT to_jsonb(o.*) INTO v_order_record FROM public.orders o WHERE o.id = v_order_id AND public.can_access_org(o.org_id);
    RETURN v_order_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

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
    v_order RECORD;
    v_auto_amount NUMERIC;
    v_allocated NUMERIC := 0;
BEGIN

    IF auth.uid() IS NULL OR public.is_view_mode_active() THEN
        RAISE EXCEPTION 'An authenticated, editable account is required' USING ERRCODE = '42501';
    END IF;
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

    IF NOT public.can_access_client(p_client_id) THEN
        RAISE EXCEPTION 'Client access denied' USING ERRCODE = '42501';
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
        v_status := 'verified';
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
        v_client."amountDue", p_amount, CASE WHEN v_status = 'pending_clearance' THEN v_client."amountDue" ELSE GREATEST(0, v_client."amountDue" - p_amount) END,
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
                IF NOT EXISTS (SELECT 1 FROM public.orders WHERE id = v_alloc_order_id AND org_id = v_org_id AND "customerId" = p_client_id) THEN
                    RAISE EXCEPTION 'Allocation order belongs to a different client or organization' USING ERRCODE = '42501';
                END IF;
                v_allocated := v_allocated + v_alloc_amount;
                IF v_allocated > p_amount THEN RAISE EXCEPTION 'Allocations exceed payment amount'; END IF;
                INSERT INTO public.payment_allocations (org_id, payment_id, order_id, amount)
                VALUES (v_org_id, v_payment_id, v_alloc_order_id, v_alloc_amount);
            END IF;
        END LOOP;
    END IF;

    IF jsonb_array_length(p_allocations) = 0 THEN
        v_remaining_amount := p_amount;
        FOR v_order IN
            SELECT o.id, GREATEST(0, o."netPayable" - COALESCE(o."advanceDeposited",0) -
                COALESCE((SELECT SUM(pa.amount) FROM public.payment_allocations pa JOIN public.payments p ON p.id=pa.payment_id WHERE pa.order_id=o.id AND p.status='verified'),0)) outstanding
            FROM public.orders o WHERE o.org_id=v_org_id AND o."customerId"=p_client_id AND o.archived_at IS NULL AND o.status NOT IN ('Draft','Cancelled')
            ORDER BY COALESCE(o.order_date_at,o.created_at)
        LOOP
            EXIT WHEN v_remaining_amount <= 0;
            v_auto_amount := LEAST(v_remaining_amount,v_order.outstanding);
            IF v_auto_amount > 0 THEN
                INSERT INTO public.payment_allocations(org_id,payment_id,order_id,amount) VALUES(v_org_id,v_payment_id,v_order.id,v_auto_amount);
                v_remaining_amount := v_remaining_amount-v_auto_amount;
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

    IF auth.uid() IS NULL OR public.is_view_mode_active() THEN
        RAISE EXCEPTION 'An authenticated, editable account is required' USING ERRCODE = '42501';
    END IF;
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

    IF NOT public.is_admin() AND NOT public.salesman_can_create_client() THEN
        RAISE EXCEPTION 'Client creation is disabled for this role' USING ERRCODE='42501';
    END IF;
    IF NOT public.is_admin() THEN p_salesperson_id := public.current_salesman_id(); END IF;
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
              AND LOWER(email) = LOWER(NEW.email)
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
            VALUES (auth.uid(), NEW.org_id, 'INSERT', TG_TABLE_NAME, COALESCE(to_jsonb(NEW)->>'id', to_jsonb(NEW)->>'key', 'NEW'));
        END IF;

    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.org_id IS DISTINCT FROM OLD.org_id THEN
            RAISE EXCEPTION 'org_id cannot be changed once assigned.' USING ERRCODE = '42501';
        END IF;

        IF v_is_super AND auth.uid() IS NOT NULL THEN
            INSERT INTO public.super_admin_access_log (admin_id, org_id, action, record_type, record_id)
            VALUES (auth.uid(), NEW.org_id, 'UPDATE', TG_TABLE_NAME, COALESCE(to_jsonb(NEW)->>'id', to_jsonb(NEW)->>'key', 'UPDATED'));
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        IF v_is_super AND auth.uid() IS NOT NULL THEN
            INSERT INTO public.super_admin_access_log (admin_id, org_id, action, record_type, record_id)
            VALUES (auth.uid(), OLD.org_id, 'DELETE', TG_TABLE_NAME, COALESCE(to_jsonb(OLD)->>'id', to_jsonb(OLD)->>'key', 'DELETED'));
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

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
        COALESCE(a.record_type, 'activity') AS event_type,
        a.action,
        COALESCE(a.summary, '') AS description,
        a.actor_id,
        COALESCE(a.actor, 'Team Member') AS actor_name,
        a.created_at,
        COALESCE(a.metadata, '{}'::jsonb) AS metadata
    FROM public.activity_events a
    WHERE a.org_id = p_org
    ORDER BY a.created_at DESC
    LIMIT LEAST(p_limit, 200);
END;
$$;

-- ------------------------------------------------------------------------------

-- Foreign-key ownership and read-only checks also protect SECURITY DEFINER writes.
CREATE OR REPLACE FUNCTION public.guard_persistence_write() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,auth,pg_temp AS $$
DECLARE v_row jsonb; v_client text; v_order text; v_parent_org uuid;
BEGIN
    IF auth.uid() IS NOT NULL AND public.is_view_mode_active() THEN
        RAISE EXCEPTION 'Read-only view mode' USING ERRCODE='42501';
    END IF;
    IF TG_OP='DELETE' THEN RETURN OLD; END IF;
    v_row := to_jsonb(NEW);
    v_client := COALESCE(v_row->>'client_id',v_row->>'customerId',v_row->>'targetClientId');
    IF v_client IS NOT NULL AND v_client <> '' THEN
        SELECT org_id INTO v_parent_org FROM public.customers WHERE id=v_client;
        IF v_parent_org IS DISTINCT FROM NEW.org_id THEN RAISE EXCEPTION 'Customer organization mismatch' USING ERRCODE='42501'; END IF;
    END IF;
    v_order := COALESCE(v_row->>'order_id',v_row->>'orderId');
    IF v_order IS NOT NULL AND v_order <> '' THEN
        SELECT org_id INTO v_parent_org FROM public.orders WHERE id=v_order;
        IF v_parent_org IS DISTINCT FROM NEW.org_id THEN RAISE EXCEPTION 'Order organization mismatch' USING ERRCODE='42501'; END IF;
    END IF;
    RETURN NEW;
END $$;
DO $$ DECLARE t text; BEGIN
    FOREACH t IN ARRAY ARRAY['customers','designs','orders','order_items','order_status_history','payments','payment_allocations','payment_adjustments','follow_ups','field_visits','design_shares','discount_requests','client_notes','app_settings','sales_team','manufacturers'] LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS zz_guard_persistence ON public.%I',t);
        EXECUTE format('CREATE TRIGGER zz_guard_persistence BEFORE INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.guard_persistence_write()',t);
    END LOOP;
END $$;
-- Field representatives can persist their own checklist without editing targets or role.
CREATE OR REPLACE FUNCTION public.set_sales_tasks(p_salesman_id text, p_tasks jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth,pg_temp AS $$
BEGIN
    IF auth.uid() IS NULL OR public.is_view_mode_active() THEN RAISE EXCEPTION 'Editable login required' USING ERRCODE='42501'; END IF;
    IF NOT public.is_admin() AND p_salesman_id IS DISTINCT FROM public.current_salesman_id() THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
    UPDATE public.sales_team SET "tasksChecklist"=p_tasks WHERE id=p_salesman_id AND public.can_access_org(org_id);
    IF NOT FOUND THEN RAISE EXCEPTION 'Sales representative not found' USING ERRCODE='P0002'; END IF;
END $$;
-- Keep application writes and internal helpers unavailable to anonymous API callers.
DO $$ DECLARE f record; BEGIN
    FOR f IN SELECT p.oid::regprocedure signature,p.prorettype FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prosecdef AND p.proname <> 'get_shared_designs' LOOP
        EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon',f.signature);
        IF f.prorettype <> 'trigger'::regtype THEN EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated,service_role',f.signature); END IF;
    END LOOP;
END $$;
ALTER FUNCTION public.gen_order_id() SET search_path=public,pg_temp;
ALTER FUNCTION public.gen_payment_id() SET search_path=public,pg_temp;
ALTER FUNCTION public.gen_design_id() SET search_path=public,pg_temp;
ALTER FUNCTION public.gen_manufacturer_id() SET search_path=public,pg_temp;
ALTER FUNCTION public.gen_client_id() SET search_path=public,pg_temp;
ALTER FUNCTION public.set_updated_at() SET search_path=public,pg_temp;
NOTIFY pgrst, 'reload schema';
