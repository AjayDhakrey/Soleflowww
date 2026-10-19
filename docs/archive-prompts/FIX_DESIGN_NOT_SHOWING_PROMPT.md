# MASTER PROMPT — Fix: New Design Not Showing in Catalog (ShoeConnect / SoleFlow)

> Also run `supabase/migrations/0012_design_delete_admin.sql` in the Supabase SQL editor (after 0011) before using this prompt.
> Paste everything below into your AI coding tool with the project open.
> Root cause verified by reading the code on 30 Sep 2026 (commit 3fd153f).

---

You are a senior React + TypeScript + Supabase engineer. Fix the bug and add one feature. Bug: **an admin adds a new design, it doesn't appear in the catalog (or flashes then disappears), and salespeople never see it.** Feature: **admin can permanently delete a design (STEP 4B).**

## Hard rules
1. **Only ADD code. Never delete existing code.** Add new functions/branches; mark replaced code `// DEPRECATED:`.
2. Never edit migrations 0001–0012. New DB changes → `supabase/migrations/0013_*.sql`.
3. Never report "saved" unless the row is really in Supabase.

---

## ROOT CAUSE (verified chain — fix ALL links, not just one)

**① Fake admin login, no Supabase session**
- `pages/login/LoginPage.tsx:141-163` — `handleSubmit` ignores the result of `signIn()` and logs the user in anyway; role is guessed from the email (`email.includes('admin')`).
- `handleQuickLogin` (line 167, "Instant 1-Click Demo Login") never calls Supabase at all.
- `auth/AuthProvider.tsx:215-236` — if Supabase login fails with `admin@soleflow.com / admin123`, it silently creates a **demo** admin session.
- Result: the UI shows you as Admin, but to Supabase you are **anonymous** (`auth.uid()` = null).

**② Database correctly rejects the insert**
- Migration 0011: `create_design` is admin-only and revoked from `anon` → the call fails with permission denied (42501).

**③ The error is hidden and faked as success**
- `services/designs.ts` `createDesignV2` → the `catch` block builds a local `sf-<timestamp>` design and returns `{ success: true }` for **any** error except duplicate code. Nothing was saved.

**④ The fake design is then wiped**
- `pages/designs/DesignsPage.tsx:516-523` `onSaved` prepends the fake design, then immediately calls `refreshDesigns()`.
- `refreshDesigns()` → `fetchDesigns()` reads Supabase (the design isn't there) → `setDesigns(live + MOCK)` → **the new design disappears.**
- As anon, RLS returns no designs, and on any error `fetchDesigns` silently returns `MOCK_DESIGNS`.

**⑤ Realtime can't reach the page**
- `hooks/useDesignsRealtime.ts` only calls `queryClient.invalidateQueries(['designs'])`.
- But `DesignsPage` reads `designs` from `AppContext` `useState` (`context/AppContext.tsx:202`), **not** React Query → realtime events never update the screen. Salespeople never see new designs without a full reload.

**⑥ Data loads once, before login**
- `AppContext.tsx:216-245` hydrates designs once on mount (`[isSupabaseActive]`), before the user is logged in → RLS returns nothing → mock data stays. It never re-fetches after login.

**⑦ Mock designs mixed into real catalog**
- `fetchDesigns` / `fetchAllDesigns` merge `MOCK_DESIGNS` into live results → fake products shown to real clients, and it hides whether the DB actually returned anything.

---

## STEP 0 — Confirm in Supabase (SQL editor) before coding
```sql
-- A. Does your admin exist as a REAL auth user with admin role?
select u.id, u.email, p.role from auth.users u left join public.profiles p on p.id = u.id;
-- B. Was 0011 applied?
select proname from pg_proc where proname in ('create_design','update_design','archive_design','guard_design_write');
-- C. Is designs in realtime?
select tablename from pg_publication_tables where pubname = 'supabase_realtime';
-- D. Did any design ever get saved?
select id, "articleCode", name, created_by, created_at from public.designs order by created_at desc limit 10;
```
- If (A) has no row for your admin → create the user in **Authentication → Users → Add user** (email + password, auto-confirm), then
  `update public.profiles set role='admin' where email='<admin email>';`
- If (B) is missing functions → run `0011_design_catalog_admin_only.sql` first.
- If (C) lacks `designs` → `alter publication supabase_realtime add table public.designs;`

## STEP 1 — Real login only (fixes ①)
- `AuthProvider.tsx`: add `const allowDemo = import.meta.env.VITE_DEMO_MODE === 'true';`. The demo fallback on Supabase auth error (lines 215-236) and the "2. Demo mode" branch run **only if `allowDemo`**. Otherwise return `{ success: false, error }`.
- `LoginPage.tsx` `handleSubmit`: add `const res = await signIn(email, password); if (!res.success) { setError(res.error); return; }`. Take the role from `useAuth().role` (from `profiles.role`), **never** from the email text. The catch-block demo fallback and `appLogin` run only when `allowDemo`.
- `handleQuickLogin` + "Instant 1-Click Demo Login" buttons: render only when `allowDemo`.
- Add `hasRealSession` to `useAuth()` (`supabase.auth.getSession()` has a user). `canManageCatalog = role === 'admin' && hasRealSession`.
- Set `VITE_DEMO_MODE=false` in `frontend/.env` for real use.

## STEP 2 — Stop fake success (fixes ③)
- `services/designs.ts` `createDesignV2`: in `catch`, return `{ success: false, error: formatDesignError(err) }` for every error. Keep the local-design fallback **only** when `!isSupabaseConfigured() || VITE_DEMO_MODE === 'true'`.
- Same for `updateDesignV2`, `archiveDesignV2`, `restoreDesignV2`, `uploadDesignImage` (no `{ success: true }` without Supabase unless demo mode).
- `formatDesignError`: `42501` → "Only an admin can add designs. Please log in with your admin account." · `PGRST202`/"function does not exist" → "Database not updated — run migration 0011." · JWT/anon → "Session expired, please log in again."
- After a successful create, verify: `select id from designs where id = <returned id>`; if missing, show an error.

## STEP 3 — One source of truth for designs (fixes ④ ⑤ ⑥)
- `AppContext.tsx`: add `const designQuery = useDesignCatalog()` (React Query key `['designs']`). New value `designsLive = isDemo ? MOCK_DESIGNS : (designQuery.data ?? [])`. Expose `designs = designsLive`, `isDesignsLoading`, `designsError`. Mark the old `useState(MOCK_DESIGNS)` + mount hydration for designs as DEPRECATED (keep `setDesigns` as a function that writes into the query cache with `queryClient.setQueryData(['designs'], …)` so existing callers keep working).
- `refreshDesigns()` → `queryClient.invalidateQueries({ queryKey: ['designs'] })`.
- `useDesignCatalog`: `enabled: hasRealSession || isDemo`, and refetch when the auth user id changes (include `userId` in the key: `['designs', userId, filters]`).
- `useDesignsRealtime`: on INSERT → `queryClient.setQueriesData({ queryKey: ['designs'] }, old => [fromDesignRow(payload.new), ...old without same id])`; on UPDATE → replace, and remove if `archived_at` is set; on DELETE → remove. Then invalidate. Subscribe only when there's a real session, and resubscribe on login/logout (depend on `userId`). Log channel status (`SUBSCRIBED` / `CHANNEL_ERROR`) in dev.
- `DesignsPage` `onSaved`: put the saved design into the query cache (optimistic) — don't overwrite it with a stale refetch; then invalidate.
- Everything else that shows designs (Create Order wizard, Share Lookbook, KPI cards, Dashboard, Reports) must read the same `designs` from context.

## STEP 4 — Remove mock mixing in live mode (fixes ⑦)
- `fetchDesigns` / `fetchAllDesigns`: when Supabase is configured and not demo mode → return **only** live rows; on error **throw** (React Query shows the error state) instead of returning `MOCK_DESIGNS`. Keep the mock merge only for demo mode.
- `DesignsPage`: add loading skeleton, empty state ("No designs yet — Add your first design" for admin / "Catalog is empty" for sales) and an error banner with a Retry button.

## STEP 4B — Admin can DELETE a design permanently (new feature)
Database part is ready: `supabase/migrations/0012_design_delete_admin.sql` (run it in the SQL editor after 0011).
It adds `delete_design(p_design_id)` (admin only) and `design_delete_check(p_design_id)`.
**Rule:** a design used in any order **cannot** be deleted (keeps order history, invoices and receivables correct) → the admin is offered **Archive** instead. Designs never ordered can be deleted; their share-link items are removed and gallery images cascade.

- `services/designs.ts` — add:
  - `checkDesignDeletable(id)` → `rpc('design_delete_check', { p_design_id: id })` → `{ canDelete, orderCount, shareCount }`.
  - `deleteDesignV2(id)` → `rpc('delete_design', { p_design_id: id })`; on success, if the returned `image` URL is in the `design-images` bucket, remove that file with `supabase.storage.from('design-images').remove([path])` (ignore "not found"). Return real errors — **no fake success**. Map `23503` → "This design is in N order(s). Archive it instead."
- `DesignsPage.tsx` / design card / Quick View — admin only (`canManageCatalog`):
  - Add a **Delete** action (trash icon, red) next to Edit / Archive, also inside the Archived tab.
  - On click → call `checkDesignDeletable` → open a confirm dialog:
    - If `canDelete`: "Delete **<name> (<articleCode>)** permanently? This can't be undone." + "Removed from N shared lookbooks" when `shareCount > 0`. Admin must type the article code to enable the red **Delete permanently** button.
    - If not: "Used in N orders — can't be deleted." with a single **Archive instead** button.
  - While deleting: spinner, buttons disabled. On success → remove from the `['designs']` query cache immediately + toast "Design deleted".
- `hooks/useDesignsRealtime.ts`: handle `DELETE` events (`payload.old.id`, needs `REPLICA IDENTITY FULL`, already set in 0011) → remove the design from every open screen, including salespeople's. If a salesperson has that design open in Quick View or in a Create Order cart, close it / remove it with a toast "This design was removed from the catalog".
- Salespeople never see Delete anywhere.

## STEP 5 — Verify
1. `scripts/design-sync-check.mjs` (npm script `test:design-sync`) — using real admin + salesperson credentials from env:
   - admin signs in → `create_design` → row exists in `designs` ✅
   - salesperson realtime channel receives the INSERT within 5 s ✅
   - salesperson `select` sees the new design ✅
   - anon `create_design` fails ✅ ; salesperson `create_design` fails 42501 ✅
   - admin `delete_design` on a never-ordered design → row gone ✅, image file gone from Storage ✅, salesperson realtime gets DELETE ✅
   - admin `delete_design` on a design used in an order → fails 23503 with "Archive it instead" ✅
   - salesperson / anon `delete_design` → fails ✅
   - clean up (article code prefix `AUDIT-`)
2. Manual: log in as admin in Chrome and as salesperson in an incognito window → add a design → it appears **immediately** for admin and **within seconds, without refresh** for salesperson, and it's still there after F5 on both.
3. `npx tsc --noEmit -p frontend` → 0 errors.
4. Write `docs/DESIGN_SYNC_FIX_REPORT.md`: root cause ①–⑦, what changed per file, test results.
