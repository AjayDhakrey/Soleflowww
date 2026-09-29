-- =========================================================================
-- MIGRATION 0006: AUTOMATED AUDIT TRIGGERS
-- Replaces manual logging with guaranteed database-level audit triggers
-- recording exact before/after JSON diffs on every critical table.
-- =========================================================================

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
        'aud-' || extract(epoch from now())::bigint || '-' || floor(random()*1000)::text,
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

-- Attach triggers
DROP TRIGGER IF EXISTS trg_audit_customers ON public.customers;
CREATE TRIGGER trg_audit_customers AFTER INSERT OR UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_orders ON public.orders;
CREATE TRIGGER trg_audit_orders AFTER INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_payments ON public.payments;
CREATE TRIGGER trg_audit_payments AFTER INSERT OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_designs ON public.designs;
CREATE TRIGGER trg_audit_designs AFTER INSERT OR UPDATE ON public.designs FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_manufacturers ON public.manufacturers;
CREATE TRIGGER trg_audit_manufacturers AFTER INSERT OR UPDATE ON public.manufacturers FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_sales_team ON public.sales_team;
CREATE TRIGGER trg_audit_sales_team AFTER INSERT OR UPDATE ON public.sales_team FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();
