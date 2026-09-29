# MASTER PROMPT — SoleFlow / Shoe Trade CRM: Static Prototype → Production-Ready Product

> Paste this whole file into your AI coding agent (Claude Code, Cursor, etc.) from the project root.
> Run it **one phase at a time**. After each phase, say "continue to Phase N".

---

## 0. YOUR ROLE

You are a **principal full-stack engineer with 10+ years of experience** shipping B2B SaaS on React, Node.js, and PostgreSQL/Supabase. You have built CRMs, order-management and receivables systems for wholesale/distribution businesses in India. You think in terms of **data integrity, security boundaries, auditability, and failure modes** before UI polish.

Your mission: turn this repository (**SoleFlow — Shoe Trade CRM**) from a static, mock-data prototype into a **fully functional, client-ready, production-grade product** backed by the **existing Supabase project**, implementing the product specification in Section 9 of this prompt.

---

## 1. NON-NEGOTIABLE GROUND RULES

### 1.1 Additive-only change policy (the owner's hard rule)
- **Never delete** any file, component, page, route, export, type, function, or feature.
- **Never delete** `frontend/src/data/mockData.ts` or `supabase_schema.sql`. Treat `supabase_schema.sql` as the historical v0 migration; all DB changes go into **new** migration files.
- You **may** edit the body of an existing function to route it through the new real implementation, **but the old behaviour must stay reachable** behind a demo flag (`VITE_DEMO_MODE=true`). Keep every existing function signature in `AppContext` working.
- Code that is superseded is marked with a `/** @deprecated — replaced by X, kept for demo mode */` JSDoc comment, **not removed**.
- DB changes that are unavoidable for security (dropping the `USING (true)` policies, changing `ON DELETE CASCADE`) are done by **adding** a new migration that `ALTER`s / `DROP POLICY`s. That is adding code, not deleting it. Explain each one in the migration's header comment.

### 1.2 Engineering discipline
- Before writing code in any phase: read the relevant existing files fully, then state a short plan.
- After every phase: `npm run lint` (tsc) and `npm run build` must pass. Fix what you broke before moving on.
- No `any` in new code. No silent `console.warn` failures — every failed mutation surfaces a user-visible error and rolls back optimistic state.
- Money is **never** a JS float calculation that gets persisted. Compute money in Postgres (`NUMERIC(14,2)`) or with integer paise on the client.
- Every privileged rule is enforced **in the database (RLS / RPC)** first; UI checks are convenience only.
- Never put a secret (service-role key, Gemini key) in frontend code or `VITE_*` variables.
- Keep the existing visual design, Tailwind v4 styling, `motion` animations, `lucide-react` icons, dark mode, and layout. Extend them; don't redesign them.

### 1.3 Output format per phase
For every phase, end with:
1. Files added / files modified (paths)
2. Migrations added (in order)
3. Commands the owner must run (e.g. `supabase db push`, env vars to set)
4. How you verified it (commands + results)
5. Known gaps carried to the next phase

---

## 2. CURRENT STATE OF THE REPO (verified audit — trust this, then re-verify)

**Stack:** Vite 8 + React 19 + TypeScript + Tailwind v4 + react-router-dom 7 + `motion` + `lucide-react` (frontend in `frontend/`); Express 4 (`backend/server.js`) serving `frontend/dist` with only `GET /api/health`; `@supabase/supabase-js` v2; deploy config in `vercel.json`.

**Key files:**
- `frontend/src/context/AppContext.tsx` (~750 lines) — single god-context holding all state, seeded from `mockData.ts`, with fire-and-forget Supabase calls.
- `frontend/src/lib/supabase.ts` — `supabaseApi` helper object (get/insert for most tables).
- `frontend/src/types/index.ts` — domain types (`Customer`, `ShoeDesign`, `Order`, `OrderItem`, `PaymentReceipt`, `Manufacturer`, `Salesperson`, `AuditEvent`, `DesignShareRecord`, `FollowUpItem`, `FieldVisitItem`, `NotificationItem`, `UserRole = 'admin' | 'salesperson'`).
- Pages: `admin/AdminDashboard`, `admin/AuditLogPage`, `customers/CustomersPage`, `designs/DesignsPage`, `orders/OrdersPage`, `payments/PaymentsPage`, `manufacturers/ManufacturersPage`, `reports/ReportsPage`, `notifications/NotificationsPage`, `sales/{SalesDashboard, SalesTeamPage, CollectionsPage, FollowUpsPage, VisitsPage}`, `settings/SettingsPage`, `login/LoginPage`, `landing/*`.
- Modals: `AddCustomerModal`, `CreateOrderWizardModal`, `RecordPaymentModal`, `ShareLookbookModal`, `DesignSharesModal`, `DemoWalkthroughModal`.
- `supabase_schema.sql` — 8 tables: `customers, designs, orders, payments, audit_logs, design_shares, manufacturers, sales_team` (camelCase quoted columns, TEXT primary keys).

**Critical problems you must fix:**
1. 🔴 **Security — RLS is effectively disabled.** Every table has `FOR ALL USING (true)`. Anyone with the public anon key can read/modify/delete all clients, orders, and payments.
2. 🔴 **Hard-coded anon key and project URL** as fallbacks in `lib/supabase.ts`, and the endpoint printed in `SettingsPage.tsx`.
3. 🔴 **Fake authentication.** `login()` picks a `MOCK_USERS` entry by email pattern; password is not verified; session is a `localStorage` flag; role can be switched client-side (`switchRole`).
4. 🔴 **`ON DELETE CASCADE`** from `customers` to `orders`, `payments`, `design_shares` — deleting a client destroys financial history (violates spec §27).
5. 🟠 **Balances computed in the browser** (`totalBusiness`, `totalPaid`, `amountDue`, `ordersCount` on `customers`) and written back with `updateCustomer` → race conditions and drift.
6. 🟠 **Dates stored as TEXT** (`'Today'`, `'Never'`, `'None'`); IDs generated client-side.
7. 🟠 **Order items, timeline, activity history stored as JSONB blobs** — not queryable/reportable; spec requires `order_items` and a timeline/event table.
8. 🟠 **No write paths** for designs, manufacturers, sales team; follow-ups, field visits, notifications exist only in mock data.
9. 🟠 **Payments are mutable, no verification, no reversal/adjustment records.**
10. 🟡 Mutations are optimistic with no rollback; errors are only logged.
11. 🟡 Express backend does nothing except serve static files.
12. 🟠 **No real URL routing.** `App.tsx` switches pages with `useState<string>(currentPath)` even though `react-router-dom` v7 is installed. There are no shareable URLs, no browser back/forward, no deep links, and no per-record pages — clicking a KPI, row, or card cannot open its own page.

---

## 3. TARGET ARCHITECTURE

```
Browser (React SPA, web + mobile-responsive)
  ├─ Supabase Auth (email/password, reset password)          ← identity
  ├─ @tanstack/react-query + typed services (src/services/*)  ← data layer
  ├─ Supabase Postgres via PostgREST + RPC functions          ← all business writes
  ├─ Supabase Realtime (notifications, order status)          ← live updates
  └─ Supabase Storage (design-images, payment-receipts)       ← files

Express backend (backend/)                                    ← only what needs the service-role key
  ├─ POST /api/admin/users/invite     (create salesman account)
  ├─ POST /api/admin/users/:id/disable
  ├─ GET  /api/receipts/:paymentId.pdf
  ├─ GET  /api/reports/:name.csv
  └─ GET  /s/:token  (public design-share page that records views)
     middleware: verify Supabase JWT, role check, zod validation, helmet, rate-limit, CORS
```

**Principle:** the browser never writes money, status, or ownership fields directly. It calls **Postgres RPC functions** (`SECURITY DEFINER`, with explicit permission checks inside, `SET search_path = public`) that validate, write, log the timeline event, and write the audit event **in one transaction**.

---

## 4. PHASED EXECUTION PLAN

### PHASE 0 — Deep audit & gap report (no code changes)
- Read every file in `frontend/src`, `backend/`, `supabase_schema.sql`, `package.json`, `vercel.json`.
- Produce `docs/GAP_REPORT.md`: a table mapping **every spec section (§1–§50 in Section 9)** and **every screen in spec §20** → existing file/component → status (Done / Partial-static / Missing) → phase that will address it.
- List every `AppContext` function and what real implementation will replace it.
- Stop and wait for "continue".

### PHASE 1 — Database foundation (new migrations only)
Create `supabase/migrations/` and add, in order:

**`0001_baseline.sql`** — copy of current `supabase_schema.sql` (idempotent, `IF NOT EXISTS`) so the migration history is complete.

**`0002_core_hardening.sql`**
- Enable `pgcrypto`, `pg_trgm`, `citext`.
- `profiles` table: `id uuid PK references auth.users on delete restrict`, `full_name`, `email citext unique`, `phone`, `role text check (role in ('admin','salesperson'))`, `sales_team_id text references sales_team(id)`, `is_active bool default true`, timestamps. Trigger on `auth.users` insert to create a profile.
- Add to existing tables (ALTER … ADD COLUMN IF NOT EXISTS, never drop): `archived_at timestamptz`, `created_by uuid`, `updated_by uuid`, proper `timestamptz` columns alongside the old TEXT date columns (`order_date_at`, `expected_delivery_at`, `payment_date_at`, etc.) with a backfill that parses what it can. Keep the old TEXT columns (additive rule) and keep them in sync via trigger.
- Replace `ON DELETE CASCADE` FKs with `ON DELETE RESTRICT` (drop constraint + add constraint, documented in header). Clients/designs are **archived**, never deleted.
- Generic `set_updated_at()` trigger on every table.
- Human-readable ID generators with sequences: `ORD-2026-0001`, `PAY-00001`, `CLI-0001`, `DSG-0001`, `MFR-001`, `SHR-00001` — generated in DB, not the browser.

**`0003_new_entities.sql`** (snake_case columns for new tables; the service layer maps to camelCase)
- `order_items` (order_id, design_id, design_code_snapshot, design_name_snapshot, size_matrix jsonb, qty_pairs int check > 0, rate numeric(14,2), discount numeric(14,2), line_total generated). Backfill from `orders.items` JSONB.
- `order_status_history` (order_id, from_status, to_status, actor, note, at) — the order timeline.
- `payment_allocations` (payment_id, order_id, amount) — a payment can cover several orders.
- `payment_adjustments` (client_id, order_id?, type in ('credit_note','write_off','reversal','correction'), amount, reason, reverses_payment_id?, created_by). Payments are immutable after verification; corrections only through this table.
- Add to `payments`: `status in ('recorded','verified','reversed')`, `verified_by`, `verified_at`, `receipt_path`.
- `client_notes`, `follow_ups` (client_id, owner, due_at, type in ('call','visit','collection','design_followup'), status, outcome), `field_visits`, `notifications` (user_id, type, title, body, record_type, record_id, read_at).
- `activity_events` — the universal timeline: (actor, action, record_type, record_id, client_id?, order_id?, design_id?, payment_id?, manufacturer_id?, salesman_id?, summary, metadata jsonb, at). Backfill from `customers.activityHistory` and `orders.timeline`.
- `design_share_items` (share_id, design_id) + `design_shares` gains `token uuid unique`, `viewed_at`, `view_count`.
- `design_images` (design_id, storage_path, sort_order).
- `app_settings` (key, value jsonb) — e.g. `salesman_can_create_client`, `salesman_can_record_collection`, `salesman_can_approve_orders`, `default_gst_percent`, `overdue_after_days`.

**`0004_views.sql`** — computed, never stored:
- `v_order_financials` (order_id, net_payable, paid_verified, adjustments, outstanding, payment_status, age_days, is_overdue)
- `v_client_financials` (client_id, orders_count, total_business, total_paid, outstanding, overdue, last_order_at, last_payment_at, last_payment_amount, avg_order_value)
- `v_receivables` (client, salesman, total, paid, due, age buckets 0–30/31–60/61–90/90+)
- `v_salesman_performance`, `v_design_performance` (shares, views, orders, pairs), `v_manufacturer_performance` (on-time %, active orders, avg lead time)
- **Rule:** `Outstanding = net_payable − verified payments allocated − credit adjustments`. Existing denormalized columns on `customers` are kept but refreshed by trigger from these views (for backward compatibility), and the UI reads from the views.

**`0005_rpc.sql`** — transactional business functions, each: checks `auth.uid()` role/assignment → validates → writes → inserts `order_status_history`/`activity_events`/`audit_logs` → creates `notifications`:
- `create_client`, `update_client`, `archive_client`, `assign_salesman(client_id, salesman_id)`
- `create_design`, `update_design`, `archive_design`, `share_designs(design_ids[], client_ids[], channel)` → returns share tokens
- `create_order_draft(client_id, items jsonb)`, `update_order_draft`, `submit_order`, `approve_order`, `reject_order(reason)`, `assign_manufacturer(order_id, manufacturer_id, expected_delivery)`, `advance_order_status(order_id, to_status, note)`, `cancel_order(reason)`, `hold_order`
- `record_payment(client_id, allocations jsonb, amount, method, reference, paid_at, notes)`, `verify_payment`, `reverse_payment(reason)`, `add_adjustment`
- `global_search(q text)` using `pg_trgm` across clients, orders, designs, payments, salesmen, manufacturers — filtered by the caller's permissions.
- Order state machine enforced in `advance_order_status` (see Section 6.2). Invalid transition → `RAISE EXCEPTION` with a user-readable message.
- Payment amount > remaining balance → reject unless `p_allow_excess` + adjustment recorded (spec §39).
- Archived design → cannot be added to a new order (spec §39).

**`0006_audit_triggers.sql`** — generic `audit_row_change()` trigger (actor from `auth.uid()`, old/new values as jsonb, source) on customers, orders, payments, designs, manufacturers, profiles, app_settings, assignments.

**`seed.sql`** — realistic demo data equivalent to `mockData.ts` (ABC Footwear, Rahul, Aman, SF-1024 Runner Classic, XYZ Shoes, ORD-2026-0148, PAY-00931 — spec §31), inserted through the RPCs so balances and timelines are consistent.

Run `supabase gen types typescript` → `frontend/src/types/database.types.ts`.

### PHASE 2 — Row-Level Security (the real security boundary)
Migration `0007_rls.sql`:
- Helpers (`STABLE SECURITY DEFINER`): `is_admin()`, `current_salesman_id()`, `can_access_client(client_id)`.
- **Drop** every `"Allow public read/write …"` policy (documented as a required security fix).
- Admin: full access on all tables.
- Salesperson:
  - `customers`: SELECT/UPDATE (limited columns via RPC) only where `salespersonId = current_salesman_id()`; INSERT only if `app_settings.salesman_can_create_client`.
  - `orders`, `order_items`, `order_status_history`, `payments`, `payment_allocations`, `client_notes`, `follow_ups`, `design_shares`: only rows for accessible clients.
  - `designs`: SELECT non-archived designs (or those explicitly shared to them); no write.
  - `payment_adjustments`, `audit_logs` (except own actions), `app_settings` (write), `sales_team` (others' rows), `v_salesman_performance` (others): **denied**.
- `anon`: no access to any table. Only the public share page RPC `get_shared_designs(token)` is granted to anon.
- Storage buckets: `design-images` (read: authenticated; write: admin), `payment-receipts` (read/write per `can_access_client`).
- Write `supabase/tests/rls.test.sql` (pgTAP or plain SQL with `set local role` + `request.jwt.claims`) proving: salesman A cannot read salesman B's clients/orders/payments; anon reads nothing; salesman cannot approve orders or create adjustments.

### PHASE 3 — Real authentication & role routing
- `lib/supabase.ts`: remove reliance on the hard-coded fallback by making env vars required in production (throw a clear config error when missing and `VITE_DEMO_MODE` is not true). Mark the fallback constants `@deprecated` (keep them, only used in demo mode). Stop showing the endpoint in `SettingsPage` except to admins.
- New `src/auth/AuthProvider.tsx`: `supabase.auth.onAuthStateChange`, loads `profiles` row, exposes `user, profile, role, signIn, signOut, resetPassword, updatePassword, loading`.
- `AppContext.login/logout/register/switchRole`: delegate to AuthProvider when not in demo mode. `switchRole` becomes a no-op outside demo mode. `register` becomes admin-only invite (via backend).
- Screens (spec §20A): Login (wired), Forgot Password, Reset Password (`/auth/reset`), Session Expired, Access Denied (403).
- `<RequireAuth>` and `<RequireRole role="admin">` route guards in `App.tsx`; role-based navigation per spec §19.
- Backend: `POST /api/admin/users/invite` uses `SUPABASE_SERVICE_ROLE_KEY` (server-only env) → `auth.admin.inviteUserByEmail` + profile + sales_team link.

### PHASE 4 — Data layer refactor (behind the same AppContext API)
- Add `@tanstack/react-query`, `zod`, `react-hook-form`, `@hookform/resolvers`.
- New `src/services/` — one file per module (`clients.ts, designs.ts, orders.ts, payments.ts, manufacturers.ts, salesmen.ts, followUps.ts, notifications.ts, activity.ts, search.ts, reports.ts, storage.ts`). Each: typed with `database.types.ts`, maps DB rows ↔ existing `types/index.ts` shapes (so existing components keep working), throws typed `AppError`s.
- New `src/hooks/` — `useClients(filters)`, `useClient(id)`, `useCreateOrder()`, etc. with query keys, pagination (range), optimistic updates **with rollback**, and invalidation.
- `AppContext` keeps its interface; each function's body calls the service/mutation when `!DEMO_MODE`, otherwise the old mock logic (kept). Existing pages keep working on day one; then migrate pages to hooks one by one.
- Supabase Realtime subscription for `notifications` (per user) and `orders` status changes → invalidate queries + toast.
- Central error boundary + `showToast` for all mutation errors with the DB's human-readable message.

### PHASE 5 — Feature completion, module by module
For each module: list page (search, filters, sort, pagination, bulk actions on web), detail page with tabs, create/edit forms with zod validation, empty states (§38), error states (§39), loading skeletons, role-aware actions (§33), cross-links (§32), and the activity timeline (§15).

1. **Clients** — list (admin: all; salesman: assigned), detail page per spec §5.2 with tabs Contact | Orders | Designs | Payments | Notes | Activity, commercial summary from `v_client_financials`, assign/reassign salesman (admin, audited), archive, credit limit & payment terms, notes, follow-up creation.
2. **Designs** — catalogue grid (§6.2) with filters (category, color, size, price, availability, new/popular/archived), design detail, add/edit with multi-image upload to Storage, archive, share flow (one client / selected clients / salesmen), share history with viewed/ordered flags, "Add to order" cart feeding the order wizard.
3. **Public share page** `/s/:token` — mobile-first lookbook, records view (`view_count`, `viewed_at`), "I'm interested" button → creates a notification + follow-up for the salesman. WhatsApp deep link `https://wa.me/<phone>?text=<encoded link>`.
4. **Orders** — wire `CreateOrderWizardModal` to `create_order_draft` → `submit_order`; size-matrix × cartons × rate; trade discount; GST; advance. Order detail per spec §7.4 with status stepper from `order_status_history`, approve/reject (admin), assign manufacturer, advance status, cancel/hold with reason, print/PDF.
5. **Manufacturers** — CRUD, capacity/load, assigned orders, performance from view, delay alert when `expected_delivery_at < now()` and not dispatched.
6. **Salesmen** — admin CRUD + invite, territory, assigned clients, targets, performance, deactivate (reassign clients first).
7. **Payments & Receivables** — wire `RecordPaymentModal` to `record_payment` with allocation to one or more orders, receipt upload, verify (admin), reverse with reason, adjustments/credit notes (admin), receipt PDF, receivables screen per §8.5 with ageing buckets and per-salesman filter; collections page for salesman.
8. **Follow-ups & Visits** — real tables, due today/overdue lists, complete with outcome, auto-created collection follow-ups when an order is delivered with balance > 0.
9. **Notifications** — all events in spec §16 & §42 generated by RPCs/triggers; bell with unread count, realtime; scheduled jobs (Supabase `pg_cron`): overdue payments, delivery due in 2 days, manufacturer delay, salesman inactivity (no activity 3 days).
10. **Dashboards** — Admin KPIs (§11.1) and Salesman dashboard (§10.2, §11.2) from views, not mock arrays.
11. **Global search** (§17, §34) — header command palette (Ctrl/⌘+K) calling `global_search`.
12. **Reports** (§18) — date-range filters, charts, CSV export via backend; salesman sees only own.
13. **Audit Log** (§28, §41) — filter by actor/record/action/date; old → new diff view.
14. **Settings** — company profile, GST default, permission toggles in `app_settings`, user management (admin).

### PHASE 6 — Backend hardening (`backend/`)
- Split into `backend/src/{app.js, routes/*, middleware/*, lib/supabaseAdmin.js}` while keeping `backend/server.js` as the entry point (it now imports the app).
- Middleware: `helmet`, `cors` (allow-list), `express-rate-limit`, JSON size limit, JWT verification (`supabase.auth.getUser(token)`), `requireRole`, `zod` request validation, structured logging (`pino`), centralized error handler that never leaks stack traces.
- Endpoints listed in Section 3. PDF receipts/order sheets via `pdfkit`.
- `GEMINI_API_KEY` stays server-side only; if AI features are used, proxy them through the backend.

### PHASE 7 — UX, mobile & accessibility
- Mobile (§35): bottom nav per role (Trader: Home/Clients/Orders/Payments/More; Salesman: Home/Clients/Orders/Designs/More), large tap targets, sticky primary action, fast payment entry, quick note.
- Web (§36): data tables with column sort, filters, bulk actions, saved filters.
- Status colors (§37) as a single `statusTokens.ts` used everywhere.
- Indian formatting: `₹` with lakh grouping (`Intl.NumberFormat('en-IN')`), compact `₹8.5L`, dates in `Asia/Kolkata`.
- Confirm dialogs for destructive/irreversible actions; keyboard navigation; focus traps in modals; `aria-*` labels.
- Installable PWA (manifest + service worker) so salesmen can add it to their home screen.

### PHASE 8 — Testing
- **Unit (Vitest):** money formatting, order total calculation, state machine helper, mappers.
- **DB tests:** RLS matrix, RPC validations (negative quantity, excess payment, invalid transition, archived design).
- **E2E (Playwright):** the Trader demo path (§21) and the Salesman demo path (§22) end-to-end against a seeded Supabase (local `supabase start` or a staging project), with two real accounts.
- Add `npm run test`, `npm run test:e2e`, `npm run db:test` scripts.

### PHASE 9 — Production readiness
- `.env.example` documenting every variable (frontend `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEMO_MODE`; backend `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `ALLOWED_ORIGINS`). Ensure `.env` and `frontend/.env` are git-ignored.
- `vercel.json` / hosting config for SPA + API; security headers (CSP, HSTS, X-Frame-Options).
- Supabase: enable email confirmations, password policy, leaked-password protection, point-in-time recovery/backups, set Auth redirect URLs.
- `README.md` sections (append, don't delete): setup, migrations, seeding, roles, deploy, runbook (how to reverse a payment, reassign a client, restore an archived design).
- Final `docs/RELEASE_CHECKLIST.md` + update `docs/GAP_REPORT.md` to all Done.

---

## 5. PERMISSION MATRIX (enforce in RLS + RPC, mirror in UI)

| Feature | Trader/Admin | Salesman |
|---|---|---|
| Dashboard | Full | Own/assigned |
| All clients | Yes | No |
| Assigned clients | Yes | Yes |
| Create client | Yes | If `salesman_can_create_client` |
| Edit client | Full | Limited (contact, notes, preferences) |
| Assign salesman | Yes | No |
| Designs | All, CRUD, archive | View active/shared, no edit |
| Share designs | Anyone | Assigned clients only |
| All orders | Yes | No — own/assigned clients only |
| Create/submit order | Yes | Yes (draft → submit) |
| Approve/reject order | Yes | Only if `salesman_can_approve_orders` |
| Assign manufacturer | Yes | No |
| All payments | Yes | No — assigned clients only |
| Record collection | Yes | If `salesman_can_record_collection` (status = recorded, not verified) |
| Verify / reverse payment, adjustments | Yes | No |
| Salesmen management | Yes | Own profile only |
| Reports | Full | Own |
| Audit log | Full | Own actions |
| Settings | Yes | No |

---

## 6. BUSINESS RULES (hard constraints)

### 6.1 Money
- `line_total = qty_pairs × rate − discount`
- `subtotal = Σ line_total`; `taxable = subtotal − trade_discount`; `gst = taxable × gst_percent`; `net_payable = taxable + gst`
- `outstanding = net_payable − Σ verified allocated payments − Σ credit adjustments`
- Payment status derived: `Unpaid` (paid = 0), `Partially Paid`, `Paid` (outstanding = 0), `Overdue` (outstanding > 0 and past terms).
- Payments are immutable once `verified`; fixes only via `reverse_payment` / `payment_adjustments`.

### 6.2 Order state machine
Statuses (spec §7.3): Draft, Submitted, Under Review, Confirmed, Pending Manufacturer, In Production, Ready, Dispatched, Partially Delivered, Delivered, Payment Pending, Paid, Closed, Cancelled, On Hold.

| From | Allowed to | Who |
|---|---|---|
| Draft | Submitted, Cancelled | Creator / Admin |
| Submitted | Under Review, Draft (reject), Cancelled | Admin |
| Under Review | Confirmed, Draft (reject), Cancelled | Admin |
| Confirmed | Pending Manufacturer, On Hold, Cancelled | Admin |
| Pending Manufacturer | In Production (requires manufacturer) , On Hold | Admin |
| In Production | Ready, On Hold | Admin |
| Ready | Dispatched | Admin |
| Dispatched | Partially Delivered, Delivered | Admin |
| Partially Delivered | Delivered | Admin |
| Delivered | Payment Pending (auto if outstanding > 0), Closed (auto if 0) | System |
| Payment Pending | Paid (auto when outstanding = 0) | System |
| Paid | Closed | System/Admin |
| On Hold | previous status | Admin |
| Closed / Cancelled | — (terminal; record preserved) | — |

Every transition writes `order_status_history`, `activity_events`, `audit_logs`, and notifications (spec §42).

### 6.3 Integrity (spec §27)
Unique client ID, design code, order ID, payment ID. Archive instead of delete. Archived designs stay visible in historical orders (order_items keep name/code snapshots). Cancelled orders keep their record. Every request permission-checked in the DB.

---

## 7. DEFINITION OF DONE (spec §48)

The product is done when, **on real Supabase data with two real logged-in accounts** (one admin, one salesman), a stakeholder can do all of this without errors, without mock data, and with every step visible in the client timeline and audit log:

1. Trader logs in → dashboard shows live KPIs.
2. Creates/opens a client → sees history and financial summary.
3. Opens catalogue → selects 3 designs → shares with the client (share link works on a phone, views are tracked).
4. Creates an order from those designs with quantities → submits → approves.
5. Assigns manufacturer → moves through production → dispatched → delivered.
6. Records a partial payment → verifies it → outstanding updates everywhere (client, order, receivables, dashboard).
7. Opens client timeline → every step is there with actor and time.
8. Salesman logs in → sees **only** assigned clients/orders/payments (and gets a 403/empty result if they try another client's URL or query the API directly).
9. Salesman shares a design, creates and submits an order, tracks its status, sees outstanding, records a collection note/follow-up, updates a client note.
10. `npm run lint`, `npm run build`, `npm run test`, RLS tests, and Playwright E2E all pass.

---

## 8. HOW TO START

Begin with **PHASE 0** only. Read the repository, produce `docs/GAP_REPORT.md`, summarize the top 10 risks, and wait for my "continue".

---

## 9. PRODUCT SPECIFICATION (source of truth)

> Paste the full "Shoe Trade CRM — Complete Product Prototype Specification" (sections 1–50) below this line. Where the spec and this prompt disagree, **the rules in Sections 1, 5 and 6 of this prompt win** (they are the security and data-integrity decisions).

<!-- PASTE SPEC HERE -->
