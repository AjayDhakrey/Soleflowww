# MASTER PROMPT — Database Connection & Schema Audit (ShoeConnect / SoleFlow)

> Paste everything below into your AI coding tool (Claude Code / Cursor / Lovable) with the project open.
> Read `docs/DB_SCHEMA_AUDIT.md` first — it lists issues already found.

---

You are a senior Supabase + React/TypeScript engineer. Audit and fix the database wiring of this Shoe Trade CRM so that **every menu, form, input, dropdown, toggle and feed stores and reads real data from Supabase**.

## Hard rules
1. **Only ADD code. Never delete existing code.** To replace behaviour, add the new function/adapter and route calls to it; comment old code with `// DEPRECATED:` instead of removing it.
2. Never change existing data. Schema changes go in **new** migration files only: `supabase/migrations/0010_*.sql`, `0011_*.sql` … (never edit 0001–0009).
3. Every migration must be idempotent (`IF NOT EXISTS`, `CREATE OR REPLACE`, `ADD COLUMN IF NOT EXISTS`).
4. Test records must be tagged (`notes`/`summary` = `'__AUDIT_TEST__'`) and cleaned up at the end.
5. Never print or commit secret keys. Service-role key only in `backend/`, never in `frontend/`.

## Stack facts
- Frontend: Vite + React + TS in `frontend/src`. Data layers: `frontend/src/services/*.ts` (primary) and `frontend/src/lib/supabase.ts` (legacy, parallel).
- Backend: Express in `backend/src` using `lib/supabaseAdmin.js`.
- Schema: `supabase/migrations/0001–0009`, seed `supabase/seed.sql`, RLS tests `supabase/tests/rls.test.sql`.
- Real table names: `customers` (NOT clients), `sales_team` (NOT salesmen), `designs`, `orders`, `order_items`, `order_status_history`, `payments`, `payment_allocations`, `payment_adjustments`, `manufacturers`, `field_visits`, `follow_ups`, `discount_requests`, `notifications`, `activity_events`, `audit_logs`, `client_notes`, `design_shares`, `design_share_items`, `design_images`, `profiles`, `app_settings`.
- Legacy tables `customers`, `designs`, `sales_team` use lowercase-no-underscore columns (`businessname`, `salespersonid`, `articlecode`, `moqpairs`).

---

## PHASE 1 — Connection test
Create `scripts/db-health.mjs` (Node, uses `@supabase/supabase-js`, reads `frontend/.env`) that:
1. Prints whether `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set (masked).
2. Signs in with a test admin user (`AUDIT_EMAIL` / `AUDIT_PASSWORD` env vars) — anon RLS blocks most reads.
3. For each table and view above: `select('*', { count: 'exact', head: true })` → print ✅/❌, row count, error message.
4. For each RPC in `supabase/migrations/0005_rpc.sql` + `0008` + `0009`: call with invalid dummy args and classify:
   `function does not exist` → ❌ MISSING · argument/validation error → ✅ EXISTS.
5. Check storage buckets `design-images` and `payment-receipts` exist (`storage.listBuckets()` / upload a 1-byte test file then delete it).
6. Add npm script `"db:health": "node scripts/db-health.mjs"`.

Also run in the Supabase SQL editor and paste results into the report:
```sql
-- Live tables & columns
select table_name, string_agg(column_name||':'||data_type, ', ' order by ordinal_position)
from information_schema.columns where table_schema='public' group by table_name order by 1;
-- Live functions & argument names
select p.proname, pg_get_function_identity_arguments(p.oid)
from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' order by 1;
-- Which migrations actually ran
select * from supabase_migrations.schema_migrations order by version;
-- RLS enabled?
select tablename, rowsecurity from pg_tables where schemaname='public';
```
Compare live DB vs migration files — list anything that exists in one but not the other.

## PHASE 2 — Map every UI input to its database destination
Go through **every page in `frontend/src/pages`** and **every modal/drawer in `frontend/src/components`** (Sidebar menu order: Dashboard, Customers, Orders, Designs, Manufacturers, Payments, Collections, Sales Team, Visits, Follow-ups, Discounts, Notifications, Reports, Audit Log, Settings, Public Lookbook).

For each form / input / select / toggle / action button, produce one row:

| Menu | Component | Field / action | Service fn | Table.column or RPC(arg) | Column type & constraint | Status |
|---|---|---|---|---|---|---|

Status values: ✅ saves correctly · ❌ table/RPC missing · ❌ column/arg name wrong · ⚠️ type mismatch (e.g. string → numeric, date format) · ⚠️ required column not sent (NOT NULL without default) · ⚠️ enum/CHECK value not allowed · 🟡 UI-only / mock / hardcoded (never saved) · 🟡 feed reads from `mockData.ts` instead of DB.

Also check every **list, KPI card, chart and feed** reads from a real table/view (not `data/mockData.ts` or hardcoded arrays). See `docs/HARDCODED_DATA.md`.

Save as `docs/DB_FIELD_MAP.md`.

## PHASE 3 — Fix (additive only)
Fix these known issues first (details in `docs/DB_SCHEMA_AUDIT.md`), then everything found in Phase 2:
1. `services/clients.ts` → use `customers`; map snake_case form fields to real columns via a new `toCustomerRow()` mapper.
2. `services/salesmen.ts`, `backend/src/routes/admin.js` → use `sales_team`; never `.update()` the view `v_salesman_performance`.
3. RPC args — add wrapper functions that send the correct names:
   `create_client` (p_business_name…p_payment_terms), `assign_salesman` (p_salesman_id), `create_design` (p_article_code…), `share_designs` (p_design_ids, p_client_ids, p_channel), `create_order_draft` (p_client_id, p_items…), `advance_order_status` (p_order_id, p_to_status, p_note), `global_search` (q).
4. Columns — `notifications.is_read` → set `read_at = now()`; `activity_events` → `record_type, record_id, actor, actor_id, summary, metadata`; `designs.is_active` → `status`/`archived_at`; `field_visits.updated_at` → add via migration `0010`; `profiles` → `full_name, role`.
5. New migration `0010_missing_objects.sql`: `get_shared_designs(token)` RPC (SECURITY DEFINER, only returns shared, non-archived designs), `field_visits.updated_at` + trigger, storage buckets `design-images` (public read) and `payment-receipts` (private) with RLS policies.
6. **Kill silent fake saves:** where services return `{ success: true }` when `!supabase`, add a visible error toast / console.error `"Supabase not configured — data NOT saved"` in production builds (keep demo mode only behind `VITE_DEMO_MODE=true`).
7. Make sure every mutation surfaces the Supabase error to the UI (toast) instead of swallowing it.
8. Regenerate types: `npx supabase gen types typescript --project-id <id> > frontend/src/types/database.types.ts` and fix any TS errors (`npx tsc --noEmit`).

## PHASE 4 — Round-trip test every form
Create `frontend/e2e/db-roundtrip.spec.ts` (Playwright, logged in as admin) — and `scripts/db-roundtrip.mjs` (service layer only) — that for each entity:
**create → read back from DB → assert every field matches → update one field → read back → archive/delete test row.**
Entities: customer, client note, design (+ image upload), design share, order draft (+ items), order status advance, manufacturer, payment (+ receipt upload, clear/bounce cheque), discount request (request/approve/reject), field visit, follow-up, notification mark-read, app_settings toggle, sales team member.
Also verify: `activity_events` / `audit_logs` got a row for each mutation (triggers from 0006), and **realtime** (`hooks/useRealtime.ts`) pushes the new row to an open second tab.
Run as **salesman** role too and confirm RLS (0007) allows/blocks correctly.

## PHASE 5 — Report
Create `docs/DB_TEST_REPORT.md`:
- Connection: ✅/❌, URL masked, auth OK
- Table: `Menu | Feature | Saves? | Reads? | Realtime? | RLS OK? | Fix applied`
- Live-vs-migration differences
- Remaining issues ranked 🔴 blocker / 🟠 major / 🟡 minor
- Exact commands to re-run: `npm run db:health`, `npx playwright test db-roundtrip`

Finish only when `npm run db:health` is all ✅, the round-trip suite passes, and `npx tsc --noEmit` has 0 errors.
