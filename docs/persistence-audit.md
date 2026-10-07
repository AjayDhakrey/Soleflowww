# Supabase account persistence audit

Checked on 2026-10-07 against Supabase project `jpcaptmmcbuqlgrdetde` (Shoesell), which matches this application's configured backend. Live frontend: https://soleflowww.vercel.app/.

## Account and schema model

Each real Supabase Auth user has a `profiles` record linked to an `organizations` record. Business records belong to an organization through `org_id`. Admin and salesperson access uses row-level security; platform access uses `is_super_admin` and read-only view sessions. Creating a separate PostgreSQL schema for each user is unnecessary for this model.

All 26 public application tables already existed. All 26 have RLS enabled. All eight reporting views have `security_invoker=true`. No real profiles lack an organization; no salesperson profiles lack a sales-team mapping after the repair. Supabase-managed schemas such as auth and storage were inspected through their application dependencies rather than recreated.

| Area | Existing tables |
| --- | --- |
| Accounts | organizations, profiles, org_invites, app_settings |
| Customers | customers, client_notes |
| Catalog | designs, design_images, design_shares, design_share_items |
| Orders | orders, order_items, order_status_history, discount_requests |
| Payments | payments, payment_allocations, payment_adjustments |
| Sales | sales_team, follow_ups, field_visits |
| Operations | manufacturers, notifications, audit_logs, activity_events |
| Platform | super_admin_access_log, super_admin_view_sessions |

The eight views cover client finances, order finances, receivables, design performance, discount statistics, manufacturer performance, salesperson collections and salesperson performance. Both application storage buckets (`design-images`, `payment-receipts`) are private.

## Causes and implementation

The application could show successful local changes when Supabase writes failed. Local fake IDs then failed to match saved records on later updates. Real sessions could also restore demo data, and empty real account data could be replaced with fixtures.

Frontend writes now wait for persisted results and retain the database identifiers. Failed saves keep the form available and do not fabricate successful receipts or rows. Refresh hydration loads records for the effective organization, accepts empty accounts, clears stale account data and query caches, and restores real profiles without guessing organization or role. Quick-login demos are explicitly labeled as sample workspaces. Catalog uploads store durable storage references and renew signed image URLs on load.

Two migrations were applied successfully to live Supabase and are included in source control:

- `20261007053045_account_persistence_repair.sql`: removes conflicting legacy RPC overloads, saves parent orders before line items, validates account/client/allocation boundaries, uses transactional payment saves and retries, corrects signup invite matching and settings triggers, enforces read-only write guards, persists salesperson checklists, corrects platform field names and restricts function grants.
- `20261007053926_account_storage_and_team_persistence.sql`: backfills missing salesperson mappings, maintains mappings on signup, safely parses old storage paths, enforces an authenticated account storage boundary and fixes platform overview return types.

Existing business records were retained. Temporary verification customers, designs, orders, payments and auth users were created only inside transactions that rolled back. Database sequences can advance during rolled-back tests.

The missing Vercel API entry point is included as `api/index.js`, exporting the existing Express application.

## Verification

- `npm run lint`: passed.
- `npm run build`: passed; existing large-bundle warnings remain.
- `npm test`: 20 tests passed across six files, including six new persistence regression tests covering remount reloads, database IDs, failed saves and genuinely empty accounts.
- `supabase/tests/persistence_roundtrip.sql`: passed on the live database, including order totals/items, verified payment allocations, idempotent retries, follow-up/visit updates and account isolation under the authenticated role.
- `supabase/tests/account_signup_and_storage.sql`: passed on the live database, including owner settings, invited salesperson/team records, invite email matching and storage ownership checks.
- Platform overview/timeline and salesperson mappings passed transactional checks without permanently granting platform privileges.
- The exported API handler returned HTTP 200 for `/api/health` locally. Protected API features additionally require server-only Supabase credentials.

## Deployment status and limits

### Follow-up repair for reported console errors

The 2026-10-07 Auth logs identified `confirmation_token` NULL scan failures. Two legacy Auth users had NULL confirmation/recovery/email-change fields. Migration `20261007061505_auth_tokens_and_remaining_persistence.sql` normalizes those fields to empty strings following the official [Supabase troubleshooting guidance](https://supabase.com/docs/guides/troubleshooting/scan-error-on-column-confirmation_token-converting-null-to-string-is-unsupported-during-auth-login-a0c686). Passwords and confirmation state are unchanged. The malformed-field count is now zero. Both affected email accounts were checked with deliberately incorrect passwords: Auth returns HTTP 400 `invalid_credentials`, rather than the previous HTTP 500 schema error.

Password login errors no longer create sample sessions. Build-time demo configuration no longer diverts real-account service writes into memory; sample mode is selected by the active account/session. Demo role switches are restricted to sample sessions, and production role-switch controls are hidden. Real roles continue to come from database profiles.

The follow-up component audit found and repaired additional incomplete actions: dispatching route stops now saves the checklist through `set_sales_tasks`; customer-menu follow-ups, archiving and salesperson assignment now write to Supabase; archived customers stay hidden when the account reloads; audit entries appear only after successful writes; single-record customer, manufacturer, member and notification updates detect zero-row results. Order stage advancement now uses the database's supported states (`Confirmed`, `Ready`, `Dispatched`) and waits for a confirmed result before updating the detail screen. Follow-up completion no longer displays success before the write completes.

The expanded live roundtrip test passed for order stages, checklist saves, assignment, notes and archiving, with all fixtures rolled back. The frontend suite has 26 passing tests across seven files; type checking and the production build also pass.

Migrations `20261007062015_normalize_legacy_order_stages.sql` and `20261007062056_order_stage_compatibility.sql` align old stored stage labels with the database's transition rules and accept older UI/discount labels as aliases. Both canonical and alias transition checks passed. The discount request modal no longer attempts a second stage update after its transactional RPC has already placed the order under review.

The database migrations are live. The user confirmed that pushing to `AjayDhakrey/Soleflowww` triggers the site's automatic deployment; these frontend and API changes are being delivered through that repository's `main` branch. The connected Vercel account returned no matching project or teams, so its deployment logs and environment settings could not be inspected. The public landing page was inspected; a real signed-in browser refresh cycle has not yet been tested.

Production should use the matching `VITE_SUPABASE_URL` and public `VITE_SUPABASE_ANON_KEY`, with `VITE_DEMO_MODE=false`. Server API routes require `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel's server environment; never expose the service-role key through a VITE variable. Those server credentials are absent in this local checkout, and the owning Vercel project's environment could not be inspected.

Sample demo records and unsaved local edits from the old application cannot be reconstructed from Supabase. These changes protect saves going forward; they do not establish that every historical demo/local record existed in the database.
