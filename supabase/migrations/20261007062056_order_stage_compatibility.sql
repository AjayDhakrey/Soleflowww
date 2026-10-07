-- Older UI labels and discount approvals must use the same transition rules.
DO $repair$
DECLARE definition text; old_fragment text := 'v_from_status := v_order.status;';
BEGIN
 SELECT pg_get_functiondef('public.advance_order_status(text,text,text)'::regprocedure) INTO definition;
 IF position(old_fragment in definition)=0 THEN RAISE EXCEPTION 'Unexpected order stage function; review before applying'; END IF;
 definition:=replace(definition,old_fragment,$replacement$
 v_from_status := CASE v_order.status WHEN 'Approved' THEN 'Confirmed' WHEN 'Ready QC' THEN 'Ready' WHEN 'Ready to Dispatch' THEN 'Ready' ELSE v_order.status END;
 p_to_status := CASE p_to_status WHEN 'Approved' THEN 'Confirmed' WHEN 'Ready QC' THEN 'Ready' WHEN 'Ready to Dispatch' THEN 'Ready' ELSE p_to_status END;
 $replacement$);
 EXECUTE definition;
END $repair$;
NOTIFY pgrst, 'reload schema';
