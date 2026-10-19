# Codebase Structure

**Analysis Date:** 2026-10-19

## Directory Layout

```
ShoeFlow-latest/
├── .planning/                  # Project planning, specifications, sketches, and codebase docs
│   ├── codebase/               # Codebase reference maps (STACK, ARCHITECTURE, etc.)
│   └── sketches/               # Design ideas and front-end mockups
├── backend/                    # Node.js Express REST API server
│   ├── server.js               # Server entry point
│   └── src/
│       ├── app.js              # Express app setup, CORS, Helmet, RateLimiting
│       ├── lib/                # Backend utilities (logger, supabaseAdmin)
│       ├── middleware/         # Auth verification, rate limiting, error handling
│       └── routes/             # admin, sales, reports, documents, platform, ai routes
├── frontend/                   # React + TypeScript SPA client
│   ├── src/
│   │   ├── assets/             # 3D sneaker models, images, brand assets
│   │   ├── auth/               # AuthProvider, session handling, user credentials
│   │   ├── components/         # Reusable UI widgets, layout, navigation, modals
│   │   ├── context/            # AppContext (global domain state), ViewModeContext
│   │   ├── data/               # Static mock data fallbacks (mockData.ts)
│   │   ├── hooks/              # Custom hooks (useRealtime, useCustomerMetrics, etc.)
│   │   ├── lib/                # Supabase client, lucide icons, utility helpers
│   │   ├── pages/              # Route views (admin, sales, customers, landing, etc.)
│   │   ├── services/           # Backend and Supabase CRUD adapters
│   │   ├── types/              # Domain interfaces, database schema types
│   │   ├── utils/              # Calculation helpers, currency formatters, validation
│   │   └── __tests__/          # Vitest and React Testing Library test suites
│   ├── vite.config.ts          # Vite configuration and plugin setup
│   └── index.html              # HTML entry point
├── scripts/                    # Maintenance, migration, and health verification scripts
├── supabase/                   # Supabase database configuration and migrations
│   ├── migrations/             # SQL migration files (0001 to 0014 + hotfixes)
│   └── seed.sql                # Initial baseline footwear catalog and test records
├── package.json                # Project dependencies, scripts, and build targets
├── tsconfig.json               # TypeScript compiler options
└── vitest.config.ts            # Vitest unit test configuration
```

## Directory Purposes

**`frontend/src/pages/`:**
- Purpose: Top-level views rendered by the router.
- Subdirectories:
  - `admin/`: Admin dashboard, platform admin, notifications.
  - `sales/`: Sales dashboard, field route stops, store visits, collections, sales team page.
  - `customers/`: Customer directory, customer detail, aging receivables insights.
  - `orders/`: Wholesale orders list, order drawer, invoice print view.
  - `designs/`: Footwear catalogue, gallery, 3D product showcase.
  - `manufacturers/`: Production plant directory and job-work tracking.
  - `landing/`: High-converting B2B wholesale footwear landing page.

**`frontend/src/services/`:**
- Purpose: Encapsulates database and API network calls.
- Files: `orders.ts`, `designs.ts`, `salesmen.ts`, `notifications.ts`, `payments.ts`, `clients.ts`, `manufacturers.ts`, `visits.ts`, `followUps.ts`.

**`frontend/src/components/`:**
- Purpose: Modular, claymorphic UI elements and modals.
- Subdirectories: `layout/` (Header, Sidebar, TopNav), `ui/` (KpiCard, Panel, Button, Modal, EmptyState), `customers/`, `orders/`, `payments/`, `sales/`.

## Key File Locations

**Entry Points:**
- `frontend/src/main.tsx` & `frontend/src/App.tsx`: Frontend React bootstrapper and route switcher.
- `backend/server.js`: Production Node.js server entry point.

**Configuration:**
- `frontend/vite.config.ts`: Frontend bundler config.
- `tsconfig.json`: TypeScript configuration.
- `vitest.config.ts`: Test runner settings.
- `.env`: Environment variables (Supabase URL, anon keys, ports).

**Domain Logic & Schema:**
- `frontend/src/types/index.ts`: Business interfaces (`Order`, `Customer`, `ShoeDesign`, `Salesperson`, `NotificationItem`).
- `frontend/src/types/database.types.ts`: Supabase auto-generated database row typings.
- `frontend/src/context/AppContext.tsx`: Master business logic orchestration.

## Where to Add New Code

**New Business Feature (e.g. New Admin Tool):**
- Domain types: Add interfaces to `frontend/src/types/index.ts`.
- Service adapter: Create `frontend/src/services/[feature].ts`.
- State methods: Expose handler inside `frontend/src/context/AppContext.tsx`.
- View Page: Create `frontend/src/pages/[feature]/[Feature]Page.tsx`.
- Route: Wire path in `frontend/src/App.tsx` and menu entry in `frontend/src/components/layout/Sidebar.tsx`.
- Tests: Add corresponding suite in `frontend/src/__tests__/[feature].test.ts`.

---

*Structure analysis: 2026-10-19*

