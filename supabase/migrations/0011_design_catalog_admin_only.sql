-- =====================================================================
-- 0011 — DESIGN CATALOG: ADMIN-ONLY WRITE, ALL SALESPEOPLE READ, LIVE SYNC
-- Additive migration. Idempotent. Safe to run more than once.
--
-- Rules enforced by the DATABASE (not just the UI):
--   • Only admins can create / edit / archive designs and upload design images
--   • Every logged-in salesperson can see every active (non-archived) design
--   • New / changed designs are pushed live to all open apps (Realtime)
--   • Salespeople get a notification when a new design is added
--   • Nobody can make themselves admin (closes 3 escalation holes)
--
-- ⚠ BEFORE RUNNING: make sure your real admin account has profiles.role = 'admin'
--   select id, email, role from public.profiles;
--   update public.profiles set role = 'admin' where email = '<your-admin-email>';
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Backfill: keep existing admins working after is_admin() is tightened
-- ---------------------------------------------------------------------
UPDATE public.profiles p
SET role = 'admin'
FROM auth.users u
WHERE u.id = p.id
  AND p.role IS DISTINCT FROM 'admin'
  AND (u.raw_app_meta_data->>'role' = 'admin' OR u.email = 'admin@soleflow.com');

-- ---------------------------------------------------------------------
-- 1. Harden is_admin()
--    Removed: user_metadata role (users can edit it themselves)
--    Removed: email LIKE 'admin@%' (anyone can sign up as admin@gmail.com)
--    Kept:    profiles.role and app_metadata.role (only server can set)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RETURN TRUE;
    END IF;
    RETURN COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', FALSE);
END;
$$;

-- ---------------------------------------------------------------------
-- 2. New signups are ALWAYS salesperson (role from signup form ignored).
--    Admins are promoted by an existing admin or via app_metadata.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        CASE WHEN NEW.raw_app_meta_data->>'role' = 'admin' THEN 'admin' ELSE 'salesperson' END,
        NEW.raw_user_meta_data->>'phone'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- ---------------------------------------------------------------------
-- 3. Block self-promotion: a non-admin cannot change profiles.role
--    (policy "profiles_user_update_self" otherwise allows it)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role
       AND auth.uid() IS NOT NULL          -- service role / SQL editor bypass
       AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only an admin can change user roles.' USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_role_change ON public.profiles;
CREATE TRIGGER trg_guard_profile_role_change
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role_change();

-- ---------------------------------------------------------------------
-- 4. Designs table: defence-in-depth trigger.
--    RLS already limits INSERT/UPDATE/DELETE to admins, but SECURITY
--    DEFINER functions bypass RLS — this trigger does not.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_design_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only an admin can add or change catalog designs.' USING ERRCODE = '42501';
    END IF;
    IF auth.uid() IS NULL AND auth.role() = 'anon' THEN
        RAISE EXCEPTION 'Login required.' USING ERRCODE = '42501';
    END IF;
    IF TG_OP = 'INSERT' THEN
        NEW.created_by := COALESCE(NEW.created_by, auth.uid());
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_by := auth.uid();
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_design_write ON public.designs;
CREATE TRIGGER trg_guard_design_write
    BEFORE INSERT OR UPDATE OR DELETE ON public.designs
    FOR EACH ROW EXECUTE FUNCTION public.guard_design_write();

-- ---------------------------------------------------------------------
-- 5. RPCs: create_design admin-only (same signature — frontend unchanged)
--    + new admin RPCs update_design / archive_design / restore_design
-- ---------------------------------------------------------------------
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
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only an admin can add new designs to the catalog.' USING ERRCODE = '42501';
    END IF;
    IF p_article_code IS NULL OR TRIM(p_article_code) = '' THEN
        RAISE EXCEPTION 'Article code is required.';
    END IF;
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        RAISE EXCEPTION 'Design name is required.';
    END IF;
    IF p_price IS NULL OR p_price <= 0 THEN
        RAISE EXCEPTION 'Design wholesale price must be greater than zero.';
    END IF;
    IF EXISTS (SELECT 1 FROM public.designs WHERE LOWER("articleCode") = LOWER(TRIM(p_article_code))) THEN
        RAISE EXCEPTION 'Article code % already exists in the catalog.', p_article_code USING ERRCODE = '23505';
    END IF;

    v_design_id := public.gen_design_id();

    INSERT INTO public.designs (
        id, "articleCode", name, category, price, "moqPairs", "moqCartons",
        sizes, colors, status, subline, image, "soleType", "upperMaterial",
        created_by, created_at, updated_at
    ) VALUES (
        v_design_id, TRIM(p_article_code), TRIM(p_name), p_category, p_price, p_moq_pairs, p_moq_cartons,
        p_sizes, p_colors, 'New Designs', p_subline, p_image, p_sole_type, p_upper_material,
        auth.uid(), NOW(), NOW()
    );

    SELECT to_jsonb(d.*) INTO v_design_record FROM public.designs d WHERE d.id = v_design_id;
    RETURN v_design_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

CREATE OR REPLACE FUNCTION public.update_design(p_design_id TEXT, p_changes JSONB)
RETURNS JSONB AS $$
DECLARE
    v_rec JSONB;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only an admin can edit catalog designs.' USING ERRCODE = '42501';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.designs WHERE id = p_design_id) THEN
        RAISE EXCEPTION 'Design % not found.', p_design_id;
    END IF;
    IF p_changes ? 'price' AND (p_changes->>'price')::NUMERIC <= 0 THEN
        RAISE EXCEPTION 'Design wholesale price must be greater than zero.';
    END IF;

    UPDATE public.designs SET
        name            = COALESCE(p_changes->>'name', name),
        category        = COALESCE(p_changes->>'category', category),
        price           = COALESCE((p_changes->>'price')::NUMERIC, price),
        "moqPairs"      = COALESCE((p_changes->>'moqPairs')::INT, "moqPairs"),
        "moqCartons"    = COALESCE((p_changes->>'moqCartons')::INT, "moqCartons"),
        sizes           = COALESCE(p_changes->'sizes', sizes),
        colors          = COALESCE(p_changes->'colors', colors),
        status          = COALESCE(p_changes->>'status', status),
        subline         = COALESCE(p_changes->>'subline', subline),
        image           = COALESCE(p_changes->>'image', image),
        "soleType"      = COALESCE(p_changes->>'soleType', "soleType"),
        "upperMaterial" = COALESCE(p_changes->>'upperMaterial', "upperMaterial"),
        updated_at      = NOW()
    WHERE id = p_design_id;

    SELECT to_jsonb(d.*) INTO v_rec FROM public.designs d WHERE d.id = p_design_id;
    RETURN v_rec;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

CREATE OR REPLACE FUNCTION public.archive_design(p_design_id TEXT)
RETURNS VOID AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only an admin can remove designs from the catalog.' USING ERRCODE = '42501';
    END IF;
    UPDATE public.designs SET archived_at = NOW(), updated_at = NOW() WHERE id = p_design_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

CREATE OR REPLACE FUNCTION public.restore_design(p_design_id TEXT)
RETURNS VOID AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only an admin can restore designs.' USING ERRCODE = '42501';
    END IF;
    UPDATE public.designs SET archived_at = NULL, updated_at = NOW() WHERE id = p_design_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- Logged-out visitors cannot call design write functions at all
REVOKE EXECUTE ON FUNCTION public.create_design(TEXT,TEXT,TEXT,NUMERIC,INT,INT,JSONB,JSONB,TEXT,TEXT,TEXT,TEXT) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.update_design(TEXT, JSONB)  FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.archive_design(TEXT)        FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.restore_design(TEXT)        FROM anon, public;
GRANT  EXECUTE ON FUNCTION public.create_design(TEXT,TEXT,TEXT,NUMERIC,INT,INT,JSONB,JSONB,TEXT,TEXT,TEXT,TEXT) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.update_design(TEXT, JSONB)  TO authenticated;
GRANT  EXECUTE ON FUNCTION public.archive_design(TEXT)        TO authenticated;
GRANT  EXECUTE ON FUNCTION public.restore_design(TEXT)        TO authenticated;

-- ---------------------------------------------------------------------
-- 6. Read access: every logged-in user sees active designs
--    (0007 already has this; recreated idempotently to be sure)
-- ---------------------------------------------------------------------
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "designs_salesperson_read" ON public.designs;
CREATE POLICY "designs_salesperson_read" ON public.designs
    FOR SELECT TO authenticated USING (archived_at IS NULL OR public.is_admin());

-- ---------------------------------------------------------------------
-- 7. Storage: anyone may VIEW design images, only admins may upload/change/delete
--    (0010 let any logged-in user upload or delete)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated Upload Design Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Design Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Design Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Design Images" ON storage.objects;
CREATE POLICY "Admin Insert Design Images" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'design-images' AND public.is_admin());
CREATE POLICY "Admin Update Design Images" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'design-images' AND public.is_admin())
    WITH CHECK (bucket_id = 'design-images' AND public.is_admin());
CREATE POLICY "Admin Delete Design Images" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'design-images' AND public.is_admin());

-- design_images table (gallery rows) — ensure admin-only writes
ALTER TABLE public.design_images ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 8. Realtime: push design changes to every open app instantly
-- ---------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'designs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.designs;
    END IF;
END $$;
ALTER TABLE public.designs REPLICA IDENTITY FULL;

-- ---------------------------------------------------------------------
-- 9. Notify all salespeople when a new design is added
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_new_design()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.notifications (recipient_role, type, title, body, record_type, record_id)
    VALUES (
        'salesperson',
        'design_added',
        'New design: ' || COALESCE(NEW.name, NEW."articleCode"),
        COALESCE(NEW."articleCode", '') || ' · ' || COALESCE(NEW.category, '') || ' · ₹' || COALESCE(NEW.price::TEXT, '') || ' is now in the catalog.',
        'design',
        NEW.id
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_design ON public.designs;
CREATE TRIGGER trg_notify_new_design
    AFTER INSERT ON public.designs
    FOR EACH ROW EXECUTE FUNCTION public.notify_new_design();

-- =====================================================================
-- VERIFY (run after migration, in SQL editor):
--   select proname from pg_proc where proname in ('update_design','archive_design','restore_design','guard_design_write');
--   select policyname, cmd from pg_policies where tablename in ('designs','objects');
--   select tablename from pg_publication_tables where pubname='supabase_realtime';
--   select id, email, role from public.profiles where role = 'admin';   -- must show YOUR admin
-- =====================================================================
