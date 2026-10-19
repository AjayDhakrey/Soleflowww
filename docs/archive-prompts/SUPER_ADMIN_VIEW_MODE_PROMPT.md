# MASTER PROMPT — Super Admin "All Accounts" + Read-Only View Mode (SoleFlow)

> Paste this whole file into your AI coding agent (Claude Code, Cursor, Lovable, etc.) from the project root.
> Run it **one phase at a time**. After each phase, say "continue to Phase N".

---

## 0. YOUR ROLE

You are a senior full-stack engineer experienced in multi-tenant B2B SaaS on **React 19 + Vite + Tailwind + React Query v5**, **Supabase (Postgres + RLS)** and **Node/Express**. You put security boundaries in the **database first**, the UI second.

## 1. GOAL

Give the **Super Admin (platform owner)** a single place to:

1. See **every account (organization) ever created** on SoleFlow, including inactive, suspended and demo ones.
2. See each account's **progress at a glance**: setup, usage, business numbers and last activity.
3. Open any account in **View Mode**: the Super Admin sees that account's app exactly as its own admin would (dashboard, orders, customers, payments, designs, sales team, reports), but **strictly read-only**. Nothing can be created, edited, deleted, approved or sent.
4. Leave View Mode with one click and return to the Accounts list.

## 2. NON-NEGOTIABLE RULES

- **Additive only.** Never delete any file, component, page, route, export, type, function or migration. Superseded code gets `/** @deprecated — kept for compatibility */`, not removal. DB changes go in a **new** migration file (`supabase/migrations/0014_super_admin_view_mode.sql`).
- **Read-only is enforced in the database and backend**, not just by hiding buttons. UI disabling is convenience only.
- Every view session is **audit-logged** (who viewed which account, when started, when ended).
- No `any` in new code. `npm run lint` and `npm run build` must pass after every phase.
- Keep the existing clean, minimal, icon-led UI style (Plus Jakarta Sans, primary `#2563EB`, slate neutrals, rounded-2xl cards). Minimal text.
- Read these files fully before you start: `supabase/migrations/0013_multi_tenant_isolation.sql`, `frontend/src/auth/AuthProvider.tsx`, `frontend/src/context/AppContext.tsx`, all of `frontend/src/hooks/*`, `frontend/src/pages/admin/PlatformAdminPage.tsx`, `frontend/src/components/layout/Header.tsx`, `frontend/src/components/layout/Sidebar.tsx`, `frontend/src/App.tsx`, `backend/src/routes/admin.js` and the backend auth middleware.

## 3. WHAT ALREADY EXISTS (build on it, do not duplicate)

- `profiles.is_super_admin`, `profiles.is_demo_account`, `organizations` (with `status`, `is_demo`).
- SQL helpers: `current_org_id()`, `is_super_admin()`, `is_current_demo_account()`, `can_access_org(org)`, `is_admin()`, `force_org_id()` trigger, `super_admin_access_log` table.
- RESTRICTIVE `tenant_isolation` policy on every tenant table, using `can_access_org(org_id)`. Tables: `customers/clients, orders, order_items, payments, designs, collections, manufacturers, sales_team, field_visits, follow_ups, discount_requests, notifications, activity_events, audit_logs, client_notes, app_settings` (use the exact list from 0013).
- `AuthProvider` exposes `isSuperAdmin`, `isDemoAccount`, `activeOrgId`, `setActiveOrgId`.
- `/platform` → `PlatformAdminPage` with an org list and a "Switch" button. Header has a business picker.
- **Known gap to fix:** `activeOrgId` is **not used by any data query**. Because RLS lets a super admin read every org, the data pages currently show **all accounts' data mixed together**. This feature must fix that.

---

## PHASE 1 — Database (migration `0014_super_admin_view_mode.sql`)

1. **View sessions table**
   ```sql
   CREATE TABLE IF NOT EXISTS public.super_admin_view_sessions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     admin_id UUID NOT NULL REFERENCES auth.users(id),
     org_id UUID NOT NULL REFERENCES public.organizations(id),
     started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     ended_at TIMESTAMPTZ,
     user_agent TEXT
   );
   ```
   Add a unique partial index so there is at most one open session per admin: `(admin_id) WHERE ended_at IS NULL`. Enable and force RLS; the policy allows SELECT only for `is_super_admin()`. All writes go through the RPCs below.

2. **Helper** `public.is_view_mode_active() RETURNS BOOLEAN` (STABLE, SECURITY DEFINER, `search_path` pinned). It returns true when the caller has an open session (`ended_at IS NULL`) that is less than 8 hours old.

3. **RPCs** (SECURITY DEFINER, super admin only, raise `42501` otherwise):
   - `start_view_session(p_org UUID) RETURNS UUID`: closes any open session, opens a new one and inserts `VIEW_START` into `super_admin_access_log`. A demo super admin may only open demo orgs (reuse the `can_access_org` logic).
   - `end_view_session() RETURNS VOID`: sets `ended_at = now()` and logs `VIEW_END`.
   - `current_view_session() RETURNS TABLE(org_id UUID, started_at TIMESTAMPTZ)`: lets the frontend restore the session after a page refresh.

4. **Read-only enforcement**. For **every** tenant table from the 0013 list, loop and add **RESTRICTIVE** per-command policies (restrictive policies combine with AND, so they block writes without loosening reads):
   ```sql
   CREATE POLICY view_mode_no_insert ON public.<t> AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (NOT public.is_view_mode_active());
   CREATE POLICY view_mode_no_update ON public.<t> AS RESTRICTIVE FOR UPDATE TO authenticated USING (NOT public.is_view_mode_active());
   CREATE POLICY view_mode_no_delete ON public.<t> AS RESTRICTIVE FOR DELETE TO authenticated USING (NOT public.is_view_mode_active());
   ```
   Do the same for `organizations`, `profiles` and `org_invites` writes. Also add a guard at the top of **every existing write RPC** (order creation, payment recording, discount approval, etc.): `IF public.is_view_mode_active() THEN RAISE EXCEPTION 'Read-only view mode' USING ERRCODE = '42501'; END IF;`. Do this with `CREATE OR REPLACE` that keeps each existing body intact and only adds the guard line.

5. **Account overview RPC** `platform_accounts_overview() RETURNS TABLE(...)`: SECURITY DEFINER, super admin only (a demo super admin gets demo orgs only). One row per organization, including inactive ones:
   - Identity: `org_id, name, status, is_demo, created_at, owner_name, owner_email, owner_phone`
   - Team: `admin_count, sales_rep_count, pending_invites`
   - Usage: `customers_count, designs_count, orders_count, orders_last_30d, payments_count`
   - Money (NUMERIC): `total_order_value, total_collected, total_outstanding`
   - Activity: `last_activity_at` (max of `activity_events.created_at`, `orders.created_at`, `payments.created_at`, profile last sign-in), `days_since_last_activity`
   - Setup progress: `setup_steps_done` out of 6. The steps are: company profile filled, ≥1 design, ≥1 customer, ≥1 sales rep invited, ≥1 order, ≥1 payment. Also return `setup_percent`.
   - Health: `health` text, computed in SQL as `'active'` (activity ≤ 7 days), `'slowing'` (8–30 days), `'inactive'` (> 30 days or never), `'new'` (created ≤ 7 days with no orders yet).

   Use CTEs with `GROUP BY org_id`. No N+1 queries.

6. **Detail RPC** `platform_account_timeline(p_org UUID, p_limit INT DEFAULT 50)` returns recent `activity_events` and `audit_logs` for that org (super admin only), so the Super Admin can see what has been happening.

7. Header comment in the migration explains every block. Make it idempotent (`IF NOT EXISTS`, `DROP POLICY IF EXISTS` before `CREATE`).

**Verify (SQL):** As a super admin with an open session, `INSERT` and `UPDATE` on `orders` fail with 42501 and `SELECT` works. As a normal admin, nothing changes. After `end_view_session()`, the super admin's normal behaviour is restored.

---

## PHASE 2 — Backend (Express)

The backend uses the **service role key**, which bypasses RLS, so it needs its own guard:

1. New middleware `backend/src/middleware/viewModeGuard.js`. For authenticated requests from a super admin, look up an open row in `super_admin_view_sessions`. If one exists and the method is not `GET`/`HEAD`/`OPTIONS`, respond `403 { error: 'READ_ONLY_VIEW_MODE' }`. Mount it **after** auth middleware on all routers (do not remove any existing middleware).
2. For `GET` routes that use the service role (PDF order/payment documents, CSV reports), when a view session is open, scope queries to `session.org_id`, not the admin's own org.
3. New read-only routes under `/api/platform/` (super admin only), proxying the RPCs if needed: `GET /accounts`, `GET /accounts/:orgId/timeline`.
4. Log the PDF and CSV exports done during view mode into `super_admin_access_log` (`action = 'VIEW_EXPORT'`).

---

## PHASE 3 — Frontend state: `ViewModeProvider`

1. New `frontend/src/context/ViewModeContext.tsx` exposing:
   ```ts
   interface ViewModeState {
     viewOrgId: string | null;      // org being viewed, null = not in view mode
     viewOrgName: string | null;
     isReadOnly: boolean;            // true while viewOrgId != null
     enterViewMode(orgId: string, orgName: string): Promise<void>; // calls start_view_session RPC
     exitViewMode(): Promise<void>;                                // calls end_view_session RPC
   }
   ```
   On load, call `current_view_session()` to restore state after a refresh. Keep `AuthProvider.activeOrgId` and `setActiveOrgId` in sync (set them from here) so the existing Header and PlatformAdminPage keep working.
2. **Effective org.** Add a helper `useEffectiveOrgId()`: it returns `viewOrgId` in view mode, otherwise the user's own `orgId`. For a super admin who is not in view mode, it returns **their own org**, never "all".
3. **Scope every query.** Add `frontend/src/lib/scopeToOrg.ts`:
   ```ts
   export function scopeToOrg<T>(query: T, orgId: string | null): T // adds .eq('org_id', orgId) when orgId is set
   ```
   Apply it to **every** Supabase `select` in `frontend/src/hooks/*` and `AppContext.tsx` (orders, order_items, payments, customers/clients, designs, collections, manufacturers, sales_team, field_visits, follow_ups, discount_requests, notifications, activity_events, client_notes, app_settings, dashboard overview and KPI pages). Add the org id to **every React Query key** (`['orders', orgId, ...]`) so switching accounts never shows cached data from another account. Realtime subscriptions must filter `org_id=eq.<orgId>` and resubscribe when the org changes.
4. **Mutation guard.** Add `useReadOnly()` and a wrapper `guardWrite(fn)`. Every existing mutation function in `AppContext` and in the hooks first checks `isReadOnly`. If it's set, the mutation shows a toast ("View mode is read-only") and returns without calling Supabase. Keep all existing function signatures.
5. Handle the DB/API errors `42501`, `Read-only view mode` and `READ_ONLY_VIEW_MODE` globally with the same toast, as a second line of defence.

---

## PHASE 4 — UI

### 4.1 "All Accounts" page — `/platform/accounts`
Add a sidebar item under **PLATFORM OWNER** (keep the existing "Platform Admin" item) with an icon (e.g. `Building2`), labelled **Accounts**. Add the route in `App.tsx`, guarded so only `isSuperAdmin` can open it.

- **Top stat cards** (icon + number, minimal text): Total accounts, Active (7d), New this month, Inactive (> 30d), Total order value across accounts.
- **Toolbar:** search (name, owner email or phone), filters (Health: All/Active/Slowing/Inactive/New; Status: Active/Suspended; Demo: show/hide), sort (Newest, Last activity, Orders, Order value, Setup %).
- **Accounts table** (cards on mobile). Columns:
  - Account: name, owner and email
  - Created date
  - Team (admins / reps)
  - Customers
  - Orders (total and last 30 days)
  - Order value
  - Collected
  - Outstanding
  - Setup progress (a thin progress bar, `n/6`)
  - Last activity (relative time)
  - Health (coloured dot chip: green active, amber slowing, slate inactive, blue new)
  - Actions: **View** (Eye icon, primary) and **Details** (ChevronRight)
- Data comes from `platform_accounts_overview()` via a React Query hook `usePlatformAccounts()`. Show a skeleton while loading, an empty state, and an error state with a retry button.
- **CSV export** of the table (client-side). Exporting is allowed in view mode because it's read-only.

### 4.2 Account detail drawer
Opens from **Details** as a right-side slide-over:
- Header: name, health chip, created date, owner contact (click to copy).
- **Setup checklist:** the 6 steps with tick or empty icons.
- **Mini charts:** orders per week (last 12 weeks) and collected vs outstanding. Use the chart library already in the project.
- **Recent activity timeline** from `platform_account_timeline()`.
- **Open in View Mode** button.

### 4.3 View Mode experience
- Clicking **View** calls `enterViewMode(orgId, name)`, then navigates to that account's admin dashboard (`/admin/dashboard`).
- A **sticky amber banner** sits at the top of every page while in view mode: Eye icon · "Viewing **{Account name}** · Read-only" · session timer · **Exit view** button (`LogOut` icon). The banner can't be dismissed. Reuse the existing amber style from the Header's switched-org pill.
- The Sidebar shows that account's normal **admin** navigation (it shows what their admin sees), plus a "← Back to Accounts" item at the top.
- **Disable every write control** using `useReadOnly()`:
  - Buttons: Create, Add, New order, Record payment, Approve or Reject discount, Edit, Delete, Invite, Upload design, Save settings, status dropdowns, drag-and-drop.
  - Show disabled controls with a `Lock` icon and a tooltip "Read-only view".
  - Hide forms and modals that only exist to write (or open them with inputs disabled).
  - Do this with a reusable `<ReadOnlyGuard>` wrapper component, plus `disabled={isReadOnly}` on shared `Button` and `Input` components, so most screens get it automatically.
- Downloading PDFs and receipts and exporting reports **is allowed**.
- **Exit view** calls `exitViewMode()`, clears the React Query cache for that org, and returns to `/platform/accounts`.
- Logging out also ends the view session.

### 4.4 Header
The existing business picker for a super admin should now list accounts from `platform_accounts_overview()`. Choosing one calls `enterViewMode` (read-only). Rename "All Businesses" to "My workspace", which exits view mode.

---

## PHASE 5 — Tests & acceptance

**Automated** (use the existing Vitest and Playwright setup):
- Unit: `scopeToOrg` adds the filter; mutation functions are no-ops with a toast when `isReadOnly`.
- E2E (Playwright, demo super admin plus 2 demo orgs):
  1. The Accounts list shows both orgs with correct counts.
  2. View org A: the dashboard shows only org A's orders (none from org B).
  3. Every "Create/Edit/Delete" control is disabled.
  4. A forced API call (`supabase.from('orders').insert(...)`) fails with 42501.
  5. Exit view: back on the Accounts page, and writing in your own org works again.
  6. Refresh during view mode restores the session and the banner.

**Acceptance checklist** (all must be true):
- [ ] Super admin sees **every** org ever created, including inactive and suspended ones.
- [ ] Progress metrics match manual SQL counts for 2 sample orgs.
- [ ] In view mode, **only** the viewed org's data shows on every page (no mixing).
- [ ] In view mode, **no write succeeds** through the UI, the Supabase client or the Express API.
- [ ] Every view start, end and export is in `super_admin_access_log`.
- [ ] Normal admins and sales reps see no change in behaviour.
- [ ] A demo super admin can only see and view demo orgs.
- [ ] No existing code or features were deleted; lint and build pass.

When finished, output: the list of new files, the list of modified files (with one line on what was **added** to each), and the SQL to run in Supabase.
