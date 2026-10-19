# MASTER PROMPT — Admin-Only Design Catalog + Live Sync (ShoeConnect / SoleFlow)

> Paste everything below into your AI coding tool with the project open.
> Database part is already written: `supabase/migrations/0011_design_catalog_admin_only.sql`.

---

You are a senior React + TypeScript + Supabase engineer. Implement this rule across the whole app:

**Only ADMIN can add, edit, archive or restore designs in the catalog.
EVERY salesperson can see ALL active designs.
A newly added design is saved to Supabase and appears on every salesperson's screen instantly, without a refresh.**

## Hard rules
1. **Only ADD code. Never delete existing code.** Replace behaviour by adding new functions/components and routing calls to them. Mark old code `// DEPRECATED:` instead of removing it.
2. Never edit migrations 0001–0011. New DB changes → `0012_*.sql`.
3. Security lives in the database (RLS + RPC checks + triggers from 0011). The UI hiding buttons is only convenience — never the only protection.
4. Keep the current clean, minimal, icon-led UI style (see `LOVABLE_CLEAN_UI_PROMPT.md`). Use `frontend/src/lib/icons.ts` and `components/ui/*`.

## Current state (verified)
- `pages/designs/DesignsPage.tsx` gets `designs` from `AppContext`, which is **`useState(MOCK_DESIGNS)`** (`context/AppContext.tsx:199`) → the page never reads Supabase. New designs will NOT show until this is fixed.
- There is **no "Add Design" button or form** anywhere.
- `services/designs.ts:91` calls `rpc('create_design', { p_design })` → wrong args, fails.
- `services/designs.ts:118,134` update/archive via direct `.update()` using `is_active` (column doesn't exist).
- `hooks/useRealtime.ts` subscribes to orders + notifications only, **not designs**.
- `auth/AuthProvider.tsx:47` defaults role to `'admin'` → a user briefly (or on profile-load failure) gets admin UI.
- Designs columns are camelCase in quotes: `"articleCode"`, `"moqPairs"`, `"moqCartons"`, `"soleType"`, `"upperMaterial"`, plus `id, name, category, price, sizes (jsonb), colors (jsonb), status, subline, image, archived_at, created_by, updated_by, created_at, updated_at`.

---

## STEP 0 — Apply the database migration
1. In Supabase SQL editor first run:
   `select id, email, role from public.profiles;`
   Make sure your admin account has `role = 'admin'`
   (`update public.profiles set role='admin' where email='<admin email>';`).
2. Run `supabase/migrations/0011_design_catalog_admin_only.sql` (SQL editor or `npx supabase db push`).
3. Run the VERIFY queries at the bottom of that file. Your admin must appear.

What 0011 does: admin-only `create_design` (same arguments) + new `update_design(p_design_id, p_changes jsonb)`, `archive_design(p_design_id)`, `restore_design(p_design_id)`; trigger that blocks non-admin writes on `designs`; admin-only uploads to the `design-images` bucket; `designs` added to Realtime; auto-notification to salespeople on new design; closes 3 "make myself admin" holes (`is_admin()` no longer trusts email `admin@%` or user_metadata; signup always = salesperson; non-admins can't change `profiles.role`).

## STEP 1 — Service layer (`frontend/src/services/designs.ts`)
Add (don't delete old ones — mark them DEPRECATED and make them call the new ones):
- `toCreateDesignArgs(form)` → maps form fields to `p_article_code, p_name, p_category, p_price, p_moq_pairs, p_moq_cartons, p_sizes, p_colors, p_image, p_subline, p_sole_type, p_upper_material`.
- `createDesignV2(form)` → `rpc('create_design', toCreateDesignArgs(form))`.
- `updateDesignV2(id, changes)` → `rpc('update_design', { p_design_id: id, p_changes: changes })` (camelCase keys: `name, category, price, moqPairs, moqCartons, sizes, colors, status, subline, image, soleType, upperMaterial`).
- `archiveDesignV2(id)` → `rpc('archive_design', { p_design_id: id })`; `restoreDesignV2(id)` → `rpc('restore_design', …)`.
- `uploadDesignImage(file)` → upload to bucket `design-images` at `designs/<uuid>.<ext>`, return public URL. Validate: jpg/png/webp only, max 5 MB.
- `fetchDesigns()` must select `*` from `designs` where `archived_at is null`, ordered `created_at desc`. Admin variant `fetchAllDesigns({ includeArchived })`.
- Map DB rows → existing `ShoeDesign` type in one `fromDesignRow()` mapper.
- Every error → readable message. Permission error (code `42501`) → "Only an admin can add or change designs."
- No fake success: if Supabase isn't configured and `VITE_DEMO_MODE !== 'true'`, return an error, not `{ success: true }`.

## STEP 2 — Real data + live sync
- New hook `hooks/useDesignCatalog.ts` (React Query key `['designs']`) using `fetchDesigns()`.
- New hook `hooks/useDesignsRealtime.ts`: `supabase.channel('designs-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'designs' }, …)`:
  - INSERT → prepend to the cache + toast for salespeople: "New design added: <name>" (icon, no heavy text).
  - UPDATE → replace in cache; if `archived_at` set → remove from salesperson list.
  - Unsubscribe on unmount. Mount it once in the app shell (next to existing `useRealtime`).
- `AppContext.tsx`: add `designsLive` from `useDesignCatalog`; expose `designs = isDemoMode ? MOCK_DESIGNS : designsLive`. Keep `MOCK_DESIGNS` only for demo mode.
- Anything else using designs (Create Order wizard, Share Lookbook modal, KPI cards, Dashboard, Reports, `v_design_performance`) must read the same live list.

## STEP 3 — Admin-only UI
- `useAuth()` → add `canManageCatalog = role === 'admin' && !isLoading`.
- `AuthProvider.tsx`: add a safe default — role is `'salesperson'` until the profile loads (new state; keep old line marked DEPRECATED). Role must come from `profiles.role`, never from the signup form or localStorage. `switchDemoRole` only works when `isDemoMode`.
- `DesignsPage.tsx` header: **"+ Add Design"** button (plus icon) rendered only when `canManageCatalog`.
- New `components/designs/AddDesignModal.tsx` (also used for Edit):
  - Fields: Image upload (drag & drop + preview), Article code*, Name*, Category* (select), Wholesale price ₹*, MOQ pairs, MOQ cartons, Sizes (chips 5–11), Colors (chips + add), Sole type, Upper material, Subline, Status (New Designs / Available / Popular / Out of Stock).
  - Validation before submit: required fields, price > 0, at least 1 size & 1 color, duplicate article code message from DB shown inline.
  - Flow: upload image → `createDesignV2` → close → success toast → card appears at top (from realtime/cache).
  - Buttons disabled + spinner while saving; no double submit.
- Design card / detail: **Edit**, **Archive** (confirm dialog) and, in an admin "Archived" filter, **Restore** — only when `canManageCatalog`.
- Salesperson view: no add/edit/archive controls anywhere; keeps Share, Create Order, view details. Show a small "New" badge for designs created in the last 7 days.
- Mobile: Add button becomes a floating round "+" (admin only).

## STEP 4 — Notifications
- New design → DB trigger already inserts a notification with `recipient_role='salesperson'`, `type='design_added'`, `record_type='design'`, `record_id=<design id>`.
- `NotificationsPage` + header bell: show it with a shoe icon; clicking opens that design.

## STEP 5 — Tests
1. `scripts/design-permissions.mjs` (uses `AUDIT_ADMIN_EMAIL/PASSWORD` and `AUDIT_SALES_EMAIL/PASSWORD`):
   - Admin: create design ✅ → read back all fields ✅ → update price ✅ → upload image ✅ → archive ✅ → restore ✅.
   - Salesperson: can read the new design ✅; `create_design` ❌ 42501; `update_design` ❌; `archive_design` ❌; direct `from('designs').insert/update/delete` ❌; upload to `design-images` ❌; cannot see archived designs ✅; got a `design_added` notification ✅.
   - Salesperson `from('profiles').update({ role: 'admin' })` on self ❌.
   - Anonymous: `create_design` ❌.
   - Realtime: salesperson subscription receives the INSERT within 5 s ✅.
   - Clean up test rows (article code prefix `AUDIT-`).
   - Add npm script `"test:designs": "node scripts/design-permissions.mjs"`.
2. Playwright `frontend/e2e/design-catalog.spec.ts`: admin sees Add button and adds a design; salesperson (2nd browser context) sees it appear without reload and has no Add/Edit/Archive buttons.
3. `npx tsc --noEmit -p frontend` → 0 errors (PowerShell: don't use `&&`).

## Done when
- `npm run test:designs` all ✅, Playwright spec passes, tsc clean.
- Write `docs/DESIGN_CATALOG_REPORT.md`: what changed (files), permission test table (Action × Admin × Salesperson × Anonymous), screenshots of admin vs salesperson Designs page.
