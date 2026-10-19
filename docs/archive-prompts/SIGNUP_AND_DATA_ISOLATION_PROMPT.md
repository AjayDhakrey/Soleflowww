# MASTER PROMPT — Create Account + Private, Isolated Data per Business (ShoeConnect / SoleFlow)

> Paste everything below into your AI coding tool with the project open.
> Run the SQL migration it creates in the Supabase SQL editor (or `npx supabase db push`) — the AI tool usually can't reach your database itself.

---

You are a senior Supabase (Postgres/RLS) + React/TypeScript engineer. Implement:
1. **"Create account"** on the login page, saved in Supabase Auth + `profiles` + a new `organizations` table.
2. **Complete data isolation between accounts**: no business can ever see, change or search another business's customers, orders, designs, payments, files or notifications.
3. **Super Admin (platform owner)**: one special role that **can see and manage every account's data**, so the owner can take care of all businesses. Ordinary business admins can NOT.

## Hard rules
1. **Only ADD code. Never delete existing code.** Mark replaced code `// DEPRECATED:`.
2. Never edit migrations 0001–0012. New SQL → `supabase/migrations/0013_multi_tenant_isolation.sql` (and `0014_*` if needed). Idempotent (`IF NOT EXISTS`, `CREATE OR REPLACE`).
3. Isolation is enforced **in the database** (RLS + RPC checks + triggers), never only in the UI.
4. Existing data must keep working: it is moved into one "default" organization owned by the current admin.

## Design decision — read first
**Three levels of access:**
| Role | Who | Sees |
|---|---|---|
| `super_admin` | Platform owner only (you). Granted **only** by SQL in the Supabase dashboard — never through the app or signup. | **All businesses, all data** |
| `admin` | Owner of one business (whoever creates an account) | Only their own business |
| `salesperson` | Invited by a business admin | Only their own business, only assigned customers |

**Account = Business (organization).** The person who creates an account becomes the **Admin/Owner** of a new, empty, private workspace. They invite their salespeople into it. Inside a business, the existing rules stay (admin sees everything; a salesperson sees only their assigned customers via `can_access_client`).

**Do NOT create a separate Postgres schema per account.** Supabase's API only exposes fixed schemas, every migration would have to run N times, and new tables/functions would drift. The industry-standard, secure way is **one schema + `org_id` on every row + Row-Level Security**. Achieve "separate storage" through:
- `org_id` on every business table, set automatically and impossible to spoof;
- **RESTRICTIVE** RLS policies (AND-ed with every existing policy) so no query can cross organizations;
- Storage files under `<org_id>/…` folders with folder-level policies.

---

## STEP 1 — Database: tenants (`0013_multi_tenant_isolation.sql`)

### 1a. Tables
```sql
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 120),
  phone TEXT, city TEXT, state TEXT, gstin TEXT,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id);

CREATE TABLE IF NOT EXISTS public.org_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'salesperson' CHECK (role IN ('admin','salesperson')),
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '7 days',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 1b. Helper
```sql
CREATE OR REPLACE FUNCTION public.current_org_id() RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth, pg_temp
AS $$ SELECT org_id FROM public.profiles WHERE id = auth.uid() $$;

-- Platform owner flag (separate from business role)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.is_super_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth, pg_temp
AS $$ SELECT COALESCE((SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()), false) $$;

-- Can this user access rows of org X?
CREATE OR REPLACE FUNCTION public.can_access_org(p_org UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth, pg_temp
AS $$ SELECT public.is_super_admin() OR p_org = public.current_org_id() $$;
```
- `is_super_admin` can **never** be set from the app: extend the `guard_profile_role_change` trigger (0011) so any change to `is_super_admin` with `auth.uid() IS NOT NULL` raises an exception. Only the SQL editor / service role can set it.
- Grant it once, manually (document in the report):
  `update public.profiles set is_super_admin = true where email = '<platform-owner-email>';`
- A super admin also counts as admin everywhere: `is_admin()` → `RETURN TRUE` when `is_super_admin()`.

### 1c. Backfill existing data → default org
- Create one organization "ShoeConnect (default)" with `owner_id` = the current admin (`profiles.role='admin'`, oldest).
- `UPDATE profiles SET org_id = <default>` where null.

### 1d. Add `org_id` to EVERY business table
Tables: `customers, designs, design_images, design_shares, design_share_items, orders, order_items, order_status_history, payments, payment_allocations, payment_adjustments, manufacturers, sales_team, field_visits, follow_ups, discount_requests, notifications, activity_events, audit_logs, client_notes, app_settings` (plus any other table in `public` found by `select tablename from pg_tables where schemaname='public'` except `organizations`, `org_invites`, `profiles`).
For each table, in a `DO $$ … FOREACH … $$` loop:
1. `ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id)`;
2. backfill `org_id = <default org>`;
3. `SET DEFAULT public.current_org_id()`, then `SET NOT NULL`;
4. `CREATE INDEX IF NOT EXISTS <t>_org_id_idx ON <t>(org_id)`;
5. trigger `trg_<t>_force_org` BEFORE INSERT OR UPDATE → `force_org_id()`:
   - INSERT: if `auth.uid()` is not null → `NEW.org_id := current_org_id()` (ignore any value the client sent). **Exception:** if `is_super_admin()` and the client sent an `org_id`, keep it (super admin creating data inside the business they are managing).
   - UPDATE: `IF NEW.org_id IS DISTINCT FROM OLD.org_id THEN RAISE EXCEPTION 'org_id cannot be changed'`.
   - service role / SQL editor (`auth.uid()` null): require `NEW.org_id IS NOT NULL`.
6. `ALTER TABLE <t> ENABLE ROW LEVEL SECURITY; ALTER TABLE <t> FORCE ROW LEVEL SECURITY;`
7. **Restrictive** isolation policy (AND-ed with every existing permissive policy — existing policies stay untouched):
```sql
CREATE POLICY tenant_isolation ON public.<t> AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.can_access_org(org_id))
  WITH CHECK (public.can_access_org(org_id));
```
(Business users → only their org. Super admin → every org.)
8. Revoke all on these tables from `anon`.

### 1e. Per-org uniqueness & numbering
- `designs."articleCode"` is globally UNIQUE today → two businesses couldn't use the same code. Add `UNIQUE (org_id, "articleCode")` and drop the global unique constraint in the migration (constraint, not code). Same for `payments."receiptNumber"` and any other UNIQUE business key.
- ID generators (`gen_client_id`, `gen_order_id`, `gen_design_id`, `gen_payment_id`, `gen_manufacturer_id`) use global sequences. Keep IDs globally unique (they're primary keys) but add a per-org display number if needed; never expose another org's counts.

### 1f. Fix everything that BYPASSES RLS (critical)
`SECURITY DEFINER` functions and views ignore RLS. For **every** function in 0005, 0008, 0009, 0010, 0011, 0012 (`create_client, archive_client, assign_salesman, create_design, update_design, archive_design, restore_design, delete_design, design_delete_check, share_designs, create_order_draft, advance_order_status, record_payment, verify_payment, clear_cheque, bounce_cheque, reverse_payment, request_discount, approve_discount_request, reject_discount_request, cancel_discount_request, global_search, get_shared_designs, notify_new_design, audit_row_change`, …):
- `CREATE OR REPLACE` with the **same signature**;
- every `SELECT/UPDATE/DELETE` adds `AND public.can_access_org(org_id)`; every `INSERT` sets `org_id = current_org_id()`, or — for a super admin — the org of the parent record (e.g. the customer's org for a new order) or an explicit `p_org_id` argument (add as a new optional last parameter, `DEFAULT NULL`);
- "not found" when the row belongs to another org (don't reveal it exists);
- `notify_new_design` / audit triggers copy `NEW.org_id`;
- `is_admin()` stays role-based (plus super admin), but because of the restrictive policies a business admin is only admin **of their own org**; the super admin passes everywhere;
- `global_search` for a super admin searches all orgs and returns `org_id` + business name with each result;
- `get_shared_designs(token)` (public lookbook) returns only items of that share's org.
- All 8 views (`v_order_financials, v_client_financials, v_receivables, v_salesman_performance, v_design_performance, v_manufacturer_performance, v_discount_request_stats, v_salesman_collections`): `ALTER VIEW … SET (security_invoker = true)` and include `org_id` in their output.

### 1g. Profiles & organizations RLS
- `organizations`: members can SELECT their own org; only its admin can UPDATE; **super admin can SELECT/UPDATE all and suspend an org** (add `status TEXT DEFAULT 'active' CHECK (status IN ('active','suspended'))`; suspended orgs' users are blocked by `current_org_id()` returning NULL); no client INSERT/DELETE (created by the signup trigger only).
- `profiles`: a user sees profiles of their own org only (super admin: all); keep `guard_profile_role_change` (0011); add: `org_id` can't be changed by the user.
- `org_invites`: only org admins can SELECT/INSERT/DELETE for their org (super admin: all).

### 1g-2. Super admin audit trail
- Table `super_admin_access_log (id, admin_id, org_id, action, record_type, record_id, created_at)`; readable only by super admins.
- Every write a super admin makes in another org is logged there by the audit trigger (`actor_is_super_admin = true`), and also appears in that org's own `audit_logs` as "Platform Admin" — businesses can see that the platform touched their data.

### 1h. Signup trigger (replaces `handle_new_user`, same trigger name)
On `auth.users` insert, read `raw_user_meta_data`:
- If `invite_token` present and valid (matching email, not expired, not accepted) → profile joins that `org_id` with the invite's `role`; mark invite accepted.
- Else → create a **new organization** from `business_name`, `phone`, `city`, `gstin`; profile `role = 'admin'`, `org_id` = new org, `owner_id` = user. Seed that org's `app_settings` with defaults.
- Never trust a `role` sent from the client.

### 1i. Storage isolation
- Paths become `<org_id>/designs/<uuid>.<ext>` and `<org_id>/receipts/<uuid>.<ext>`.
- Policies on `storage.objects` for `design-images` and `payment-receipts`: `public.can_access_org(((storage.foldername(name))[1])::uuid)` for SELECT/INSERT/UPDATE/DELETE (+ admin check for design-images writes, as in 0011).
- Make `design-images` **private** and use signed URLs (`createSignedUrl`, 1h) in the app; the public lookbook gets signed URLs from `get_shared_designs`. Existing files: move into `<default org_id>/…` with a one-off script `scripts/move-storage-to-org.mjs` (service key, backend only).

### 1j. Realtime
Realtime `postgres_changes` respects RLS for logged-in users → other orgs' inserts are not delivered. Also add `filter: \`org_id=eq.${orgId}\`` on every channel in `useRealtime.ts` / `useDesignsRealtime.ts` (super admin: filter by the business currently selected in the switcher, or no filter in "All businesses" view).

---

## STEP 2 — "Create account" UI (`pages/login/LoginPage.tsx`)
- Tabs at the top of the card: **Log in | Create account** (icons, minimal text; same style as the login page).
- Fields: Business name*, Your full name*, Mobile (+91, 10 digits)*, Email*, Password* (min 8, 1 number, 1 letter, show/hide + strength bar), Confirm password*, City, GSTIN (optional, validate 15-char GST format), ☐ I agree to Terms & Privacy*.
- Inline validation; disabled submit + spinner while saving; friendly errors ("This email is already registered — log in instead").
- Submit → `supabase.auth.signUp({ email, password, options: { data: { full_name, phone, business_name, city, gstin }, emailRedirectTo: `${window.location.origin}/#login` } })`.
- If email confirmation is on → "Check your inbox to verify your email" screen with Resend button (`supabase.auth.resend`). If off → sign in and open the new empty dashboard with a short welcome checklist (Add first design → Add customer → Invite salesperson).
- If the URL has `?invite=<token>` → show "Join <org name>" form (name, mobile, password); email pre-filled & locked; pass `invite_token` in `options.data`.
- Demo shortcuts: see STEP 3C (only with `VITE_DEMO_MODE=true`).
- Supabase dashboard (do manually, document it): Authentication → Providers → Email: enable "Confirm email"; URL configuration: add site URL + redirect URLs; set minimum password length 8; enable leaked-password protection and CAPTCHA if available.

## STEP 3 — Team invites (admin)
- Settings → **Team** tab (admin only): list members (name, role, status), invite form (email + role), resend/revoke invite, change a member's role, deactivate a member.
- Backend `backend/src/routes/admin.js`: add `POST /admin/invite` → verify caller's JWT is an admin of org X → insert `org_invites` → `supabaseAdmin.auth.admin.inviteUserByEmail(email, { data: { invite_token }, redirectTo: …/?invite=<token> })`. Service key stays on the backend only.

## STEP 3B — Super Admin console (only when `profile.is_super_admin`)
- New sidebar item **Platform** (shield icon), hidden for everyone else; route guard + DB checks.
- **All Businesses** page: table of every organization — name, owner, city, created date, users, customers, orders, receivables, last activity, status (Active/Suspended); search & sort.
- **Business switcher** in the header (super admin only): "All businesses" or one business. Choosing one makes every page (Dashboard, Customers, Orders, Designs, Payments, Reports…) show that business's data, with a visible amber banner "Viewing: <Business name> — Platform Admin" so it's never confused with your own business.
  - Implement with an `activeOrgId` in AuthProvider; services add `.eq('org_id', activeOrgId)` when set; RPCs pass the new `p_org_id`.
  - "All businesses" mode: lists show a Business column.
- Actions: view everything, edit records (logged), suspend/reactivate a business, reset a user's role, resend an invite. No "delete business" from the UI.
- Business admins never see the Platform menu, switcher or other businesses' names.

## STEP 3C — Quick demo logins on the login page (Super Admin · Admin · Salesperson)
Show a small "Quick demo login" row with 3 icon buttons: **Super Admin** (shield), **Admin** (briefcase), **Salesperson** (user).

**Safety rules (mandatory — a one-click super admin on a live site would expose every business):**
1. The row renders **only when `VITE_DEMO_MODE === 'true'`**. In production builds (`VITE_DEMO_MODE=false`) the buttons and their code path don't exist (guard with `if (import.meta.env.VITE_DEMO_MODE === 'true')` so Vite tree-shakes it).
2. Each button performs a **real** `supabase.auth.signInWithPassword` with dedicated demo accounts — no fake/local sessions, no email-guessing.
3. Credentials come from env, never hard-coded: `VITE_DEMO_SUPERADMIN_EMAIL / _PASSWORD`, `VITE_DEMO_ADMIN_EMAIL / _PASSWORD`, `VITE_DEMO_SALES_EMAIL / _PASSWORD` (add to `frontend/.env.example` with placeholders).
4. **Demo data is fenced off from real data:**
   - Add `organizations.is_demo BOOLEAN NOT NULL DEFAULT false`. Create 2 demo businesses ("Demo Footwear Traders", "Demo Shoe Mart") with `is_demo = true` and sample customers/designs/orders (seed script `supabase/seed_demo.sql`).
   - Add `profiles.is_demo_account BOOLEAN NOT NULL DEFAULT false` for the 3 demo users (set via SQL only, protected by the same guard trigger as `is_super_admin`).
   - Change `can_access_org(p_org)`: a super admin whose `is_demo_account = true` can access **only orgs where `is_demo = true`**. The real super admin (you) is unaffected.
   - Demo admin / demo salesperson belong to "Demo Footwear Traders".
5. Demo accounts can't change their password/email, invite users, or suspend businesses (check `is_demo_account` in those RPCs/backend routes).
6. Optional nightly reset: `scripts/reset-demo.mjs` (service key, backend) wipes and re-seeds only `is_demo` orgs.
7. Show a "DEMO" badge in the header while logged in with a demo account.

Setup (document in the report): create the 3 users in Supabase Auth, then
```sql
update profiles set is_super_admin = true, is_demo_account = true where email = '<demo super admin email>';
update profiles set is_demo_account = true, role = 'admin', org_id = '<Demo Footwear Traders id>' where email = '<demo admin email>';
update profiles set is_demo_account = true, role = 'salesperson', org_id = '<Demo Footwear Traders id>' where email = '<demo sales email>';
```
Tests (add to STEP 5): demo super admin sees both demo businesses but **zero** rows of real businesses; demo buttons are absent when `VITE_DEMO_MODE=false` (check the built bundle with `grep -r "DEMO_SUPERADMIN" frontend/dist` → nothing).

## STEP 4 — App wiring
- `AuthProvider`: load `profile.org_id` + organization (name, logo) after login; expose `org`, `orgId`. Block the app with "Your account isn't linked to a business" if `org_id` is null.
- Header/Sidebar shows the business name.
- Remove reliance on `MOCK_*` data and `soleflow_auth_session` in live mode (only demo mode) — a new account must start **completely empty**, never seeded with sample customers/orders.
- All services keep calling the same tables/RPCs (org_id is automatic); never send `org_id` from the client.
- React Query keys include `orgId` so switching accounts never shows cached data from the previous account; call `queryClient.clear()` on logout.

## STEP 5 — Isolation tests (must all pass)
Create `scripts/tenant-isolation-test.mjs` (`npm run test:isolation`):
1. Sign up **Business A** (admin A) and **Business B** (admin B) + a salesperson in A (via invite).
2. A creates: customer, design (+ image), order, payment (+ receipt), visit, follow-up, discount request, share link.
3. As B, for **every table and view**: `select` returns 0 of A's rows; `update`/`delete` by A's ids affect 0 rows; inserting with `org_id = A` ends up in B (trigger) or fails.
4. As B, call **every RPC** with A's ids → "not found"/denied; `global_search` with A's customer name → nothing.
5. As B, download A's image/receipt path → denied; list A's storage folder → empty.
6. Realtime: B's subscription receives nothing when A inserts.
7. Salesperson in A sees only A's data and only their assigned customers; can't read `org_invites`.
7b. **Super admin** (set via SQL): sees A's and B's rows in every table/view, `global_search` finds both, can download both orgs' files, can switch to A and create a customer that lands in A; the write appears in `super_admin_access_log` and A's `audit_logs`.
7c. Admin A tries `update profiles set is_super_admin = true` on self → **fails**; signup with `is_super_admin` in metadata → ignored.
8. Anonymous: every table/view/RPC denied except `get_shared_designs(valid token)`.
9. Old data still visible to the original admin in the default org.
10. Clean up test users/orgs (service key, backend script).
Also: Playwright `frontend/e2e/signup.spec.ts` (create account → empty dashboard; invite → join; logout → login shows only own data).

## STEP 6 — Report
`docs/MULTI_TENANT_REPORT.md`: tables changed, functions rewritten, policies list (`select tablename, policyname, permissive, cmd from pg_policies where schemaname in ('public','storage')`), test results table (Table/RPC × Super Admin × A × B × Sales × Anon), the SQL used to grant super admin, and the manual Supabase dashboard settings.
