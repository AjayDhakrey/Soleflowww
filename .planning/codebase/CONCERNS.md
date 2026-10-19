# Codebase Concerns

**Analysis Date:** 2026-10-19

## Technical Debt

**1. Dual-Track Mock vs Supabase Branching:**
- Issue: Components and services historically branched on `if (isDemoModeActive)` or `if (auth.isDemoAccount)`.
- Files: `frontend/src/context/AppContext.tsx`, `frontend/src/services/*.ts`.
- Impact: In previous versions, demo workspace edits bypassed cloud/local persistence.
- Fix approach: Now unified with multi-tier persistence (Memory -> LocalStorage -> Supabase), but continuing to decouple mock fallback data into dedicated fixture loaders is advised.

**2. Large Context Provider (`AppContext.tsx`):**
- Issue: `frontend/src/context/AppContext.tsx` is over 1,300 lines long, managing state for customers, orders, designs, sales team, payments, notifications, and modals.
- Files: `frontend/src/context/AppContext.tsx`.
- Impact: Any change triggers re-renders across consumers unless selectors or split sub-contexts are used.
- Fix approach: Gradually decompose into domain slices (`OrdersContext`, `SalesTeamContext`, `NotificationsContext`).

## Fragile Areas

**1. Realtime WebSocket Filters:**
- Files: `frontend/src/hooks/useRealtime.ts`.
- Why fragile: Applying strict server-side `filter: 'org_id=eq...'` on Postgres changes drops rows created with `org_id: null` (such as automated database trigger notifications).
- Safe modification: Retain client-side scope filtering in the event callback so system-wide alerts are never dropped.

**2. Formatter Null Safety:**
- Files: `frontend/src/pages/notifications/NotificationsPage.tsx`, `frontend/src/pages/sales/SalesTeamPage.tsx`.
- Why fragile: Unsafe invocations like `date.toLocaleTimeString()` or `title.toLowerCase()` without fallback cause runtime white-screen crashes if fields are missing.
- Safe modification: Always wrap string operations with `(value || '').toLowerCase()` and use defensive safe formatters like `formatTimeSafely()`.

## Security Considerations

**1. Row-Level Security (RLS):**
- Mitigation: Supabase RLS policies are enabled across `customers`, `orders`, `designs`, `sales_team`, and `notifications` (`supabase/migrations/0007_rls.sql`, `0013_multi_tenant_isolation.sql`).
- Recommendation: Ensure all newly created tables in future migrations have `ENABLE ROW LEVEL SECURITY` declared immediately.

**2. Service Role Key Isolation:**
- Mitigation: Service role key is restricted strictly to backend scripts and server API (`backend/src/lib/supabaseAdmin.js`). The frontend client strictly uses the public publishable anon key.

## Performance Bottlenecks

**1. Bundle Chunk Size Warning:**
- Files: `frontend/src/pages/LandingPage.tsx`, `frontend/src/pages/CustomersPage.tsx`, `html2pdf.js`.
- Problem: Vite build reports chunks exceeding 500 kB (e.g. `html2pdf` is ~935 kB).
- Improvement path: Continue dynamic imports (`React.lazy`) for heavy PDF generation libraries and charts so they only load when triggered.

---

*Concerns audit: 2026-10-19*

