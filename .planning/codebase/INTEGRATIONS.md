# External Integrations

**Analysis Date:** 2026-10-19

## APIs & External Services

**Backend REST Services (`backend/src/routes/`):**
- `/api/admin` - Admin customer and sales rep administration (`backend/src/routes/admin.js`).
- `/api/sales-team` & `/api/sales` - Sales team management and route stop synchronization (`backend/src/routes/sales.js`).
- `/api/documents` & `/api/orders/:id/pdf` - Server-side PDF generation for invoices, packing slips, and receipts (`backend/src/routes/documents.js`).
- `/api/reports` - Exporting CSV receivables, sales activity, and turnover analytics (`backend/src/routes/reports.js`).
- `/api/ai` - AI footwear trend recommendations powered by `@google/genai` (`backend/src/routes/ai.js`).

**Artificial Intelligence:**
- Google Gemini API (`@google/genai: ^2.4.0`) - Generates wholesale footwear recommendations, product descriptions, and market trend forecasts.
  - Auth: `GEMINI_API_KEY`

## Data Storage

**Databases:**
- **Supabase PostgreSQL Managed Database** (`https://jpcaptmmcbuqlgrdetde.supabase.co`):
  - Client: `@supabase/supabase-js` (`frontend/src/lib/supabase.ts`, `backend/src/lib/supabaseAdmin.js`)
  - Connection Config: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - Tables: `customers`, `designs`, `orders`, `order_items`, `payments`, `sales_team`, `manufacturers`, `field_visits`, `follow_ups`, `notifications`, `audit_events`, `discount_requests`, `organizations`, `profiles`.

**File & Media Storage:**
- Supabase Storage Bucket `design-images` - Stores uploaded wholesale footwear pictures and thumbnails.
- Local public assets (`frontend/src/assets/`) - Static 3D hero assets, editorial sneaker photos, and branding logos.

**Caching & Local Offline Storage:**
- Browser `localStorage`:
  - `soleflow_auth_session` - User identity & active JWT profile
  - `soleflow_sales_team` - Sales representative list & assigned route stops overlay
  - `soleflow_notifications` - Locally cached notifications
  - `soleflow_read_notifications` - Persistent set of acknowledged notification IDs
  - `soleflow_created_users` - Offline-first salesman account credentials

## Authentication & Identity

**Auth Provider:**
- Supabase Auth + Custom Multi-Tenant Role Verification (`frontend/src/auth/AuthProvider.tsx`, `backend/src/middleware/auth.js`):
  - Implementation: JWT bearer token authentication, secure password hashes, and database-level `public.is_admin()` / `public.is_salesperson()` functions.
  - Multi-Tenant Isolation: Scoped by `org_id` with Super Admin view-mode switching support (`frontend/src/context/ViewModeContext.tsx`).

## Monitoring & Observability

**Error Tracking:**
- Handled via `frontend/src/services/apiError.ts` and Express error middleware `backend/src/middleware/errorHandler.js`.

**Logs:**
- Pino structured logger (`backend/src/lib/logger.js`) with request ID tracing in backend Express API.

## CI/CD & Deployment

**Hosting:**
- Production Frontend: Vercel (`soleflowww.vercel.app`)
- Backend Node Server: Render / Containerized Node.js environment

**Environment Configuration:**
- `.env` file containing:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `PORT`
  - `ALLOWED_ORIGINS`

## Webhooks & Real-Time Callbacks

**Incoming Realtime WebSockets:**
- Supabase Realtime Channels (`frontend/src/hooks/useRealtime.ts`):
  - Table subscriptions: `sales_team`, `customers`, `orders`, `payments`, `follow_ups`, `field_visits`, `designs`, `notifications`.
  - Pushes live updates across admin and salesperson devices without manual page reloads.

---

*Integration audit: 2026-10-19*
