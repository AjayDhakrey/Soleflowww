BEGIN;
SELECT set_config('request.jwt.claim.sub','',true),set_config('request.jwt.claims','{}',true);
DO $test$
DECLARE owner_uid uuid:=gen_random_uuid(); rep_uid uuid:=gen_random_uuid(); other_uid uuid:=gen_random_uuid(); org uuid; token_value uuid:=gen_random_uuid(); test_email text;
BEGIN
 test_email:=owner_uid::text||'@persistence-test.invalid';
 INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES(owner_uid,test_email,'{"business_name":"Persistence signup test","full_name":"Test owner"}');
 SELECT org_id INTO org FROM public.profiles WHERE id=owner_uid AND role='admin';
 IF org IS NULL OR (SELECT count(*) FROM public.app_settings WHERE org_id=org)<>8 THEN RAISE EXCEPTION 'Owner signup/settings failed'; END IF;
 INSERT INTO public.org_invites(org_id,email,token,role) VALUES(org,rep_uid::text||'@persistence-test.invalid',token_value,'salesperson');
 INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES(rep_uid,rep_uid::text||'@persistence-test.invalid',jsonb_build_object('invite_token',token_value,'full_name','Test rep'));
 IF NOT EXISTS(SELECT 1 FROM public.profiles p JOIN public.sales_team s ON s.id=p.sales_team_id WHERE p.id=rep_uid AND p.org_id=org AND s.org_id=org AND p.role='salesperson') THEN RAISE EXCEPTION 'Invited rep/team signup failed'; END IF;
 INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES(other_uid,other_uid::text||'@persistence-test.invalid',jsonb_build_object('invite_token',token_value));
 IF EXISTS(SELECT 1 FROM public.profiles WHERE id=other_uid AND org_id=org) THEN RAISE EXCEPTION 'Wrong email joined account'; END IF;
 PERFORM set_config('request.jwt.claim.sub',owner_uid::text,true);
 IF NOT public.can_access_storage_object('design-images',org::text||'/designs/test.jpg') OR public.can_access_storage_object('design-images',gen_random_uuid()::text||'/designs/test.jpg') OR public.can_access_storage_object('design-images','designs/unowned.jpg') THEN RAISE EXCEPTION 'Storage isolation failed'; END IF;
END $test$;
ROLLBACK;
SELECT 'New owner settings, invited salesperson mapping, invite email and storage isolation checks passed; rolled back.' AS result;
