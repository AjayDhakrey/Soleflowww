# SoleFlow — B2B Footwear Trade Management & CRM

> **Enterprise-grade B2B Footwear Wholesale, Production, and Receivables Management Platform** tailored for wholesale shoe distributors, manufacturers, and sales representatives.

---

## 1. Architecture Overview

SoleFlow combines a high-performance **React + Vite** frontend with a **PostgreSQL/Supabase** database layer and a hardened **Node.js/Express** backend service.

```
                  +----------------------------------------------+
                  |         React 19 + Vite + Tailwind CSS       |
                  |  - Role-based Auth (Trader vs Sales Rep)     |
                  |  - React Query v5 Caching & Optimistic UI    |
                  |  - Mobile Bottom Nav & PWA Offline Support   |
                  +-----------------------+----------------------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
         (Direct via Anon Key + RLS)             (Privileged Admin Actions)
                        |                                   |
                        v                                   v
          +-----------------------------+     +-----------------------------+
          |     Supabase PostgreSQL     |     |     Express API Service     |
          | - 19 Tables + 7 Migrations  |     | - Auth Middleware & Helmet  |
          | - Row-Level Security (RLS)  |     | - PDFKit Order/Payment Docs |
          | - Computed Ledger Views     |     | - Streaming CSV Reports     |
          | - Atomic Transaction RPCs   |     | - Admin Invites & Gemini AI |
          | - Audit Triggers & Realtime |     +--------------+--------------+
          +-----------------------------+                    |
                        ^                                    |
                        +------------------------------------+
                             (Service Role Key Access)
```

---

## 2. Key Modules & Capabilities

- **Customer Management & Credit:** GSTIN validation, dynamic credit limits, multi-tier pricing, and automated status tagging (`Active`, `Due Soon`, `Overdue`, `Zero Due`).
- **Design Catalogue & Lookbook:** Article codes, MOQ cartons/pairs, multi-size breakdowns, sample pricing, and tokenized public lookbook links.
- **Order Lifecycle & State Machine:** Draft $\rightarrow$ Confirmed $\rightarrow$ In Production $\rightarrow$ Ready QC $\rightarrow$ Dispatched $\rightarrow$ Delivered with atomic status updates and audit logs.
- **Money & Receivables Ledger:** Transactional payment allocation across multiple invoices, 0-30/31-60/61-90/90+ day aging buckets, and immutable audit logs.
- **Field Visits & Follow-ups:** Salesperson GPS check-ins, collection reminders, and WhatsApp deep links (`wa.me`).
- **PWA & Offline Demo Mode:** Toggle between live Supabase cloud connectivity and instantaneous offline mock demonstration with `VITE_DEMO_MODE=true`.

---

## 3. Quick Start & Local Setup

### 3.1 Prerequisites
- Node.js 20+
- npm 10+
- A Supabase Project (e.g. `https://your-project.supabase.co`)

### 3.2 Installation
```bash
# 1. Clone repository
git clone https://github.com/AjayDhakrey/Soleflowww.git
cd Soleflowww

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
PORT=3001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key
VITE_DEMO_MODE=false
```

### 3.3 Database Migrations & Seed Data
Execute the SQL migration files sequentially in your Supabase SQL Editor:
1. `supabase/migrations/0001_baseline.sql` — Schema definition, 19 tables, indexes, and constraints.
2. `supabase/migrations/0002_extensions.sql` — Extensions and helper types.
3. `supabase/migrations/0003_computed_views.sql` — Financial views (`v_receivables_aging`, `v_client_summary`).
4. `supabase/migrations/0004_storage.sql` — Storage bucket configuration (`catalogue`, `documents`).
5. `supabase/migrations/0005_rpcs.sql` — Transactional RPCs (`create_order_v2`, `record_payment_v2`, `global_search`).
6. `supabase/migrations/0006_audit_triggers.sql` — Immutable event audit logging triggers.
7. `supabase/migrations/0007_rls.sql` — Row-Level Security policies across all tables.
8. `supabase/seed.sql` *(Optional for testing)* — Realistic sample dataset for Indian footwear wholesale.

### 3.4 Running the Application
```bash
# Start frontend and backend concurrently
npm run dev

# Or run individually:
npm run dev:frontend   # Vite dev server on http://localhost:3000
npm run dev:backend    # Express backend on http://localhost:3001
```

---

## 4. Testing & Verification

```bash
# Run TypeScript typecheck (zero errors)
npm run lint

# Run Vitest unit & integration test suite
npm run test

# Run Playwright End-to-End tests
npm run test:e2e

# Run production Vite build
npm run build
```

---

## 5. Deployment Guide

### 5.1 Frontend (Vercel)
- Connect repository to Vercel.
- Framework Preset: **Vite**.
- Build Command: `npm run build`.
- Output Directory: `frontend/dist`.
- Set Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`.
- Security headers and SPA rewrites are pre-configured in `vercel.json`.

### 5.2 Backend API (Render / Railway / Docker)
- Deploy using Docker:
```bash
docker build -t soleflow-app .
docker run -p 3001:3001 --env-file .env soleflow-app
```
- Or run `node backend/server.js` directly with environment variables configured.

---

## 6. Project Directory Layout

```
Soleflowww/
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── lib/              # Logger & Supabase Admin client
│   │   ├── middleware/       # Auth guards & error handlers
│   │   └── routes/           # Admin, documents (PDF), reports (CSV), AI routes
│   └── server.js             # API entrypoint
├── frontend/                 # React 19 + Vite SPA
│   ├── public/               # Manifest & PWA Service Worker (sw.js)
│   ├── src/
│   │   ├── __tests__/        # Vitest unit test suites
│   │   ├── auth/             # AuthProvider & RouteGuards
│   │   ├── components/       # Reusable UI & Layout components
│   │   ├── context/          # AppContext state store
│   │   ├── hooks/            # TanStack React Query custom hooks
│   │   ├── pages/            # Domain views (Admin, Sales, Auth, Public)
│   │   ├── services/         # Domain API services & Zod validation
│   │   ├── types/            # TypeScript database definitions
│   │   └── utils/            # Formatters & statusTokens
│   └── vite.config.ts
├── supabase/                 # Database Migrations & Seeds
│   ├── migrations/           # 0001 to 0007 SQL migrations
│   ├── tests/                # pgTAP RLS test assertions
│   └── seed.sql              # Seed data for development
├── docs/                     # Architectural documentation
│   ├── GAP_REPORT.md         # Completed audit & gap resolution log
│   └── RELEASE_CHECKLIST.md  # Production go-live verification checklist
├── Dockerfile                # Multi-stage production container build
├── docker-compose.yml
└── package.json
```

---

## 7. License & Compliance
Proprietary B2B Enterprise Software. Built for Indian footwear distribution, compliance, and trade management.
