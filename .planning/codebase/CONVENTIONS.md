# Coding Conventions

**Analysis Date:** 2026-10-19

## Naming Patterns

**Files & Directories:**
- Component & Page files: PascalCase (e.g. `NotificationsPage.tsx`, `ReceiptTemplate.tsx`, `QuickShortcutsGrid.tsx`).
- Service & Hook files: camelCase (e.g. `notifications.ts`, `salesmen.ts`, `useRealtime.ts`).
- Utility & Type files: camelCase (e.g. `formatters.ts`, `validation.ts`, `database.types.ts`).
- Test files: Co-located in `frontend/src/__tests__/` ending in `.test.ts` or `.test.tsx`.

**Functions & Variables:**
- Functions & Methods: camelCase (e.g. `formatNotificationTime()`, `mapNotificationRow()`, `addSalesTask()`).
- React Hooks: prefixed with `use` (e.g. `useApp()`, `useAuth()`, `useRealtimeSubscriptions()`).
- Constants & Enums: UPPER_SNAKE_CASE (e.g. `DEFAULT_ORG_ID`, `MOCK_NOTIFICATIONS`, `AUTH_STORAGE_KEY`).

**Types & Interfaces:**
- PascalCase (e.g. `NotificationItem`, `Salesperson`, `PaymentReceipt`, `FieldVisitItem`).

## Code Style

**Formatting & Typography:**
- 2-space indentation throughout.
- Single quotes preferred for strings in TypeScript; double quotes in JSON.
- Semicolons used consistently.
- Tailwind CSS v4 class utility strings formatted logically from layout to typography and color transitions.

**TypeScript & Linting:**
- Strict TypeScript enforcement via `tsc --noEmit`.
- No implicit any; explicit return types on service calls (`Promise<{ success: boolean; error?: string }>`).

## Import Organization

**Order:**
1. React & Core External Libraries (`react`, `react-router-dom`, `@tanstack/react-query`)
2. Icons & Third-Party UI Tools (`lucide-react`, `motion`)
3. Internal Contexts & Hooks (`../../context/AppContext`, `../../auth/AuthProvider`)
4. Internal Services & API Libs (`../../services/notifications`, `../../lib/supabase`)
5. Internal UI Components (`../../components/ui`)
6. Types & Utility Formatters (`../../types`, `../../utils/formatters`)

**Path Aliases:**
- Standard relative imports (`../`, `../../`) and `@/` path alias mapped to `frontend/src/`.

## Error Handling

**Patterns:**
- Typed error parsers (`frontend/src/services/apiError.ts`):
  ```typescript
  try {
    const { data, error } = await supabase.from('...').select('*');
    if (error) throw parseSupabaseError(error);
    return data;
  } catch (err: any) {
    console.warn('Action warning:', err);
    return [];
  }
  ```
- User feedback via non-intrusive toast notification system (`showToast('...')` in `AppContext.tsx`).
- Safe null/undefined fallback access (`(item.title || '').toLowerCase()`) to prevent white-screen crashes.

## State & Persistence Patterns

- **Three-Tier Failover:**
  1. Primary: Supabase PostgreSQL Database with RLS.
  2. Secondary: Browser `localStorage` cache for offline/demo persistence.
  3. Tertiary: In-memory mock fallbacks for initial cold loads.
- **Optimistic Updates:** UI state updates immediately in React state, followed by background async sync and rollback on failure.

---

*Convention analysis: 2026-10-19*

