# Testing Patterns

**Analysis Date:** 2026-10-19

## Test Framework

**Runner & Environment:**
- Vitest 5 (`vitest: ^5.0.2`, `vitest.config.ts`)
- JSDOM (`jsdom: ^29.1.1`) for browser DOM emulation
- Testing Library (`@testing-library/react: ^16.3.3`, `@testing-library/jest-dom: ^7.0.1`)

**Run Commands:**
```bash
npm test              # Run all unit and integration tests (34 tests across 8 suites)
npm run lint          # Run TypeScript typecheck (tsc --noEmit)
npm run build         # Verify full Vite/Rolldown production compilation
```

## Test File Organization

**Location:**
- Centrally located in `frontend/src/__tests__/`:
  - `persistence.test.tsx` - Multi-tier persistence, database failover, and reload tests.
  - `authPersistence.test.tsx` - Session preservation, role switching, demo mode tests.
  - `pricing.test.ts` - Trade discount, GST calculation, cartons-to-pairs calculations.
  - `receivables.test.ts` - Customer ledger aging and payment deductions.
  - `salesRoutes.test.ts` - Express backend sales team endpoints.
  - `stateMachine.test.ts` - Order lifecycle transition safety.
  - `validation.test.ts` - Form schema and GSTIN validators.
  - `formatters.test.ts` - Currency, date, and telephone formatting.
  - `setup.ts` - Global test environment setup.

## Test Structure

**Suite Example from Codebase (`persistence.test.tsx`):**
```typescript
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProvider, useApp } from '../context/AppContext';

describe('Account data persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });
  afterEach(cleanup);

  it('persists a dispatched route stop before updating the checklist and restores it on reload', async () => {
    // Assert optimistic update + mock sync
  });
});
```

## Mocking Strategies

**What to Mock:**
- Network / Database: Supabase client (`supabase.from(...)`) and service adapters (`salesmenService`, `ordersService`).
- Timers / Windows: `Date.now()`, `localStorage`.

**What NOT to Mock:**
- Domain calculations: Pricing algorithms, GST arithmetic, validation logic, and formatter functions.
- Context provider state reducers: Execute through real `AppProvider` wrapper.

## Current Test Health

- **Suites**: 8 passed (100%)
- **Tests**: 34 passed (100%)
- **Type Checking**: 0 errors (`tsc --noEmit`)

---

*Testing analysis: 2026-10-19*

