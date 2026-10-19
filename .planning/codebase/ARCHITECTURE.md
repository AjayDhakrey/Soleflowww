<!-- refreshed: 2026-10-19 -->
# Architecture

**Analysis Date:** 2026-10-19

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                   Frontend Presentation Layer               │
├──────────────────┬──────────────────┬───────────────────────┤
│   Admin Pages    │   Sales Pages    │   Public Lookbook     │
│ `pages/admin/*`  │ `pages/sales/*`  │ `pages/landing/*`     │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Application State & Domain Layer             │
│ `context/AppContext.tsx`    `auth/AuthProvider.tsx`         │
│ `context/ViewModeContext.tsx`  `hooks/useRealtime.ts`       │
└────────┬───────────────────────────────────────┬────────────┘
         │                                       │
         ▼                                       ▼
┌─────────────────────────────────────┐ ┌─────────────────────┐
│       Modular Service Layer         │ │  Express API Layer  │
│ `services/orders.ts`                │ │ `backend/src/app.js`│
│ `services/designs.ts`               │ │ `backend/routes/*`  │
│ `services/salesmen.ts`              │ └──────────┬──────────┘
│ `services/notifications.ts`         │            │
└────────┬────────────────────────────┘            │
         │                                         │
         ▼                                         ▼
┌─────────────────────────────────────────────────────────────┐
│            Supabase Cloud & Managed Database Layer          │
│   PostgreSQL + RLS + Realtime WebSockets + Storage Buckets  │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|---|---|---|
| `App.tsx` | Root router, layout orchestrator, unauthenticated route gating, realtime subscription wiring | `frontend/src/App.tsx` |
| `AppContext.tsx` | Central state management (orders, customers, designs, payments, salesTeam, notifications) | `frontend/src/context/AppContext.tsx` |
| `AuthProvider.tsx` | Session tracking, login, logout, password reset, demo mode fallback | `frontend/src/auth/AuthProvider.tsx` |
| `ViewModeContext.tsx` | Super-admin multi-tenant view switcher and org scoping | `frontend/src/context/ViewModeContext.tsx` |
| `useRealtime.ts` | Multi-table Supabase Realtime WebSocket hook | `frontend/src/hooks/useRealtime.ts` |
| `notificationsService` | Dual-tier cloud/local notifications persistence and live broadcast | `frontend/src/services/notifications.ts` |
| `salesmenService` | Sales team CRUD, route stops, commission rate management | `frontend/src/services/salesmen.ts` |
| `ordersService` | Order drafts, status lifecycle, invoice items | `frontend/src/services/orders.ts` |
| `designsService` | Shoe catalog, article codes, wholesale pricing, gallery uploads | `frontend/src/services/designs.ts` |
| `backend/src/app.js` | Express REST server, rate-limiting, PDF slip rendering, health monitoring | `backend/src/app.js` |

## Pattern Overview

**Overall:** Client-Server Monorepo with React SPA Frontend, Modular Services, Express REST Backend, and Supabase Cloud Backend-as-a-Service (BaaS).

**Key Characteristics:**
- **Dual-Tier State (Cloud + Local)**: Seamless fallback between live Supabase cloud data and offline/demo `localStorage` persistence.
- **Event-Driven Realtime Pub/Sub**: Database changes push instant UI updates via WebSockets.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `admin` (Trader/Owner), `salesperson` (Field Rep), and `super_admin`.

## Layers

**1. Presentation Layer:**
- Location: `frontend/src/pages/`, `frontend/src/components/`
- Contains: Clean UI panels, claymorphic cards, forms, modals, tables, and KPI metric cards.
- Depends on: `AppContext.tsx`, `useApp()`, `AuthProvider.tsx`.

**2. State & Context Layer:**
- Location: `frontend/src/context/`, `frontend/src/auth/`
- Contains: React context providers (`AppContext`, `AuthProvider`, `ViewModeContext`).
- Depends on: Services, React Query, LocalStorage.

**3. Service Layer:**
- Location: `frontend/src/services/`
- Contains: Strongly typed API adapters (`orders.ts`, `designs.ts`, `salesmen.ts`, `notifications.ts`, `payments.ts`, `clients.ts`).
- Depends on: `frontend/src/lib/supabase.ts`.

**4. Backend API & Engine:**
- Location: `backend/src/`
- Contains: Express server, route controllers, PDF generation, logger.

## Data Flow

### Dispatched Route Stop Flow
1. Admin enters route stop on `/admin/sales-team` (`frontend/src/pages/sales/SalesTeamPage.tsx`).
2. Calls `AppContext.addSalesTask(salespersonId, task)`.
3. `salesmenService.updateSalesman` updates in-memory array, persists to `localStorage.soleflow_sales_team`, and updates Supabase `sales_team.tasksChecklist`.
4. Planned visit row inserted into `field_visits`.
5. Notification created via `notificationsService.createNotification` targeting the rep.
6. Supabase Realtime pushes event to rep's device via WebSocket (`frontend/src/hooks/useRealtime.ts`).
7. Sales Rep's dashboard immediately shows stop under Today's Field Route Stops.

## Architectural Constraints

- **Single-Threaded Node Backend**: Express server uses non-blocking async handlers and Pino logging.
- **Client Cache Synchronization**: TanStack Query invalidation prevents stale state across route transitions.
- **Multi-Tenant Org Isolation**: Postgres RLS policies and `toValidOrgId()` prevent cross-tenant data leakage.

---

*Architecture analysis: 2026-10-19*

