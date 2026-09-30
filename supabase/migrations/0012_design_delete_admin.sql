-- =====================================================================
-- 0012 — ADMIN CAN PERMANENTLY DELETE A SHOE DESIGN FROM THE CATALOG
-- Additive. Idempotent. Run AFTER 0011.
--
-- Rules:
--   • Admin only (salespeople / logged-out users are rejected)
--   • A design that appears in ANY order cannot be deleted — order history,
--     invoices and receivables must stay intact. Archive it instead.
--   • Share-link items for the design are removed; gallery images cascade.
--   • Returns the image URL so the app can remove the file from Storage.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.delete_design(p_design_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_design RECORD;
    v_order_count INT;
    v_share_count INT;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only an admin can delete designs from the catalog.' USING ERRCODE = '42501';
    END IF;

    SELECT id, "articleCode", name, image INTO v_design
    FROM public.designs WHERE id = p_design_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Design % not found.', p_design_id USING ERRCODE = 'P0002';
    END IF;

    SELECT COUNT(DISTINCT order_id) INTO v_order_count
    FROM public.order_items WHERE design_id = p_design_id;

    IF v_order_count > 0 THEN
        RAISE EXCEPTION 'Design % is used in % order(s) and cannot be deleted. Archive it instead to hide it from the catalog.',
            v_design."articleCode", v_order_count USING ERRCODE = '23503';
    END IF;

    DELETE FROM public.design_share_items WHERE design_id = p_design_id;
    GET DIAGNOSTICS v_share_count = ROW_COUNT;

    DELETE FROM public.designs WHERE id = p_design_id;   -- design_images cascade

    RETURN jsonb_build_object(
        'deleted_id', v_design.id,
        'article_code', v_design."articleCode",
        'name', v_design.name,
        'image', v_design.image,
        'removed_share_items', v_share_count
    );
END;
$$;

-- Helper for the UI: can this design be deleted, or only archived?
CREATE OR REPLACE FUNCTION public.design_delete_check(p_design_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_orders INT;
    v_shares INT;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only an admin can manage catalog designs.' USING ERRCODE = '42501';
    END IF;
    SELECT COUNT(DISTINCT order_id) INTO v_orders FROM public.order_items WHERE design_id = p_design_id;
    SELECT COUNT(*) INTO v_shares FROM public.design_share_items WHERE design_id = p_design_id;
    RETURN jsonb_build_object('can_delete', v_orders = 0, 'order_count', v_orders, 'share_count', v_shares);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.delete_design(TEXT)       FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.design_delete_check(TEXT) FROM anon, public;
GRANT  EXECUTE ON FUNCTION public.delete_design(TEXT)       TO authenticated;
GRANT  EXECUTE ON FUNCTION public.design_delete_check(TEXT) TO authenticated;

-- VERIFY:
--   select proname from pg_proc where proname in ('delete_design','design_delete_check');
