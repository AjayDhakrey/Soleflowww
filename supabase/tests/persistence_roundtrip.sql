-- Run through an administrative SQL connection. All fixtures roll back.
BEGIN;
DO $$
DECLARE v_actor uuid; v_org uuid; v_client jsonb; v_design jsonb; v_order jsonb; v_payment jsonb; v_key text; v_team text;
BEGIN
    SELECT p.id,p.org_id INTO v_actor,v_org FROM public.profiles p JOIN auth.users u ON u.id=p.id WHERE p.role='admin' AND NOT p.is_super_admin ORDER BY p.created_at DESC LIMIT 1;
    IF v_actor IS NULL THEN RAISE EXCEPTION 'A real admin account is required for this test'; END IF;
    PERFORM set_config('request.jwt.claim.sub',v_actor::text,true);
    PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',v_actor,'role','authenticated')::text,true);
    v_key := 'persistence-test-' || gen_random_uuid()::text;
    v_client := public.create_client(p_business_name=>'Persistence test',p_prop_name=>'Test',p_phone=>'0000000000');
    v_design := public.create_design(p_article_code=>v_key,p_name=>'Persistence test',p_category=>'Athletic Sneakers',p_price=>100,p_moq_pairs=>12,p_moq_cartons=>1);
    v_order := public.create_order_draft(p_client_id=>v_client->>'id',p_items=>jsonb_build_array(jsonb_build_object('designId',v_design->>'id','totalPairs',24,'totalCartons',2,'ratePerPair',100,'sizeBreakdown',jsonb_build_array(jsonb_build_object('size',8,'pairs',24)))) ,p_trade_discount_percent=>0,p_gst_percent=>12);
    IF (v_order->>'pairsCount')::int <> 24 OR (v_order->>'netPayable')::numeric <> 2688 THEN RAISE EXCEPTION 'Order totals failed'; END IF;
    IF NOT EXISTS(SELECT 1 FROM public.order_items WHERE order_id=v_order->>'id' AND qty_pairs=24 AND org_id=v_org) THEN RAISE EXCEPTION 'Order items were not persisted'; END IF;
    v_payment := public.record_payment(p_client_id=>v_client->>'id',p_amount=>500,p_method=>'Cash',p_idempotency_key=>v_key);
    IF v_payment->>'status' <> 'verified' THEN RAISE EXCEPTION 'Cash payment not verified'; END IF;
    IF NOT EXISTS(SELECT 1 FROM public.payment_allocations WHERE payment_id=v_payment->>'id' AND order_id=v_order->>'id' AND amount=500) THEN RAISE EXCEPTION 'Payment allocation missing'; END IF;
    IF (public.record_payment(p_client_id=>v_client->>'id',p_amount=>500,p_method=>'Cash',p_idempotency_key=>v_key)->>'id') <> v_payment->>'id' THEN RAISE EXCEPTION 'Payment retry duplicated'; END IF;
    IF v_order->>'status'='Draft' THEN PERFORM public.advance_order_status(v_order->>'id','Submitted'); END IF;
    PERFORM public.advance_order_status(v_order->>'id','Confirmed');
    PERFORM public.advance_order_status(v_order->>'id','In Production');
    PERFORM public.advance_order_status(v_order->>'id','Ready');
    PERFORM public.advance_order_status(v_order->>'id','Dispatched');
    PERFORM public.advance_order_status(v_order->>'id','Delivered');
    IF NOT EXISTS(SELECT 1 FROM public.orders WHERE id=v_order->>'id' AND status='Delivered') THEN RAISE EXCEPTION 'Order stage did not persist'; END IF;
    v_team:=gen_random_uuid()::text;
    INSERT INTO public.sales_team(id,org_id,name,"roleTitle") VALUES(v_team,v_org,'Persistence rep','Field Sales Rep');
    PERFORM public.set_sales_tasks(v_team,'[{"id":"test-stop","title":"Saved stop","completed":false}]'::jsonb);
    PERFORM public.assign_salesman(v_client->>'id',v_team);
    IF NOT EXISTS(SELECT 1 FROM public.sales_team WHERE id=v_team AND "tasksChecklist"->0->>'id'='test-stop') OR NOT EXISTS(SELECT 1 FROM public.customers WHERE id=v_client->>'id' AND "salespersonId"=v_team) THEN RAISE EXCEPTION 'Checklist or assignment did not persist'; END IF;
    INSERT INTO public.client_notes(client_id,author_id,author_name,note) VALUES(v_client->>'id',v_actor,'Test','Saved note');
    INSERT INTO public.follow_ups(client_id,owner_id,owner_name,due_at,type,status) VALUES(v_client->>'id',v_actor,'Test',now(),'call','pending');
    UPDATE public.follow_ups SET status='completed' WHERE client_id=v_client->>'id';
    INSERT INTO public.field_visits(client_id,salesperson_name,visit_date,purpose,status) VALUES(v_client->>'id','Test',current_date,'Persistence test','planned');
    UPDATE public.field_visits SET status='completed' WHERE client_id=v_client->>'id';
    IF NOT EXISTS(SELECT 1 FROM public.follow_ups WHERE client_id=v_client->>'id' AND status='completed') OR NOT EXISTS(SELECT 1 FROM public.field_visits WHERE client_id=v_client->>'id' AND status='completed') THEN RAISE EXCEPTION 'Follow-up or visit update missing'; END IF;
    PERFORM public.archive_client(v_client->>'id');
    IF NOT EXISTS(SELECT 1 FROM public.customers WHERE id=v_client->>'id' AND archived_at IS NOT NULL) THEN RAISE EXCEPTION 'Archive did not persist'; END IF;
    PERFORM set_config('request.jwt.claim.sub',(SELECT id::text FROM public.profiles WHERE role='admin' AND org_id<>v_org LIMIT 1),true);
    BEGIN
        PERFORM public.record_payment(p_client_id=>v_client->>'id',p_amount=>1,p_method=>'Cash');
        RAISE EXCEPTION 'Cross-account payment was allowed';
    EXCEPTION WHEN no_data_found THEN NULL;
    END;
END $$;
-- Verify API row security under the actual client role.
SET LOCAL ROLE authenticated;
DO $$ BEGIN
    IF EXISTS(SELECT 1 FROM public.customers WHERE org_id<>public.current_org_id()) THEN RAISE EXCEPTION 'Cross-account customer rows leaked'; END IF;
    IF EXISTS(SELECT 1 FROM public.orders WHERE org_id<>public.current_org_id()) THEN RAISE EXCEPTION 'Cross-account order rows leaked'; END IF;
    IF EXISTS(SELECT 1 FROM public.payments WHERE org_id<>public.current_org_id()) THEN RAISE EXCEPTION 'Cross-account payment rows leaked'; END IF;
END $$;
ROLLBACK;
SELECT 'Order, payment, idempotency, visit, follow-up and tenant isolation checks passed; test data rolled back.' AS result;
