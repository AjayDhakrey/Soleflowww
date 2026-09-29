# SoleFlow — Production Release & Deployment Checklist

Use this checklist prior to promoting SoleFlow builds to staging or production.

---

## 1. Database & Supabase Configuration
- [ ] **Run Baseline Migrations:** Ensure migrations `0001_baseline.sql` through `0007_rls.sql` are applied on Supabase.
- [ ] **Verify RLS Enabled:** Verify all 19 tables in PostgreSQL have Row-Level Security active (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- [ ] **Storage Buckets:** Verify `catalogue`, `attachments`, `documents`, and `temp` buckets are created with private access and proper RLS policies.
- [ ] **Database Triggers & Views:** Check `v_receivables_aging`, `v_client_summary`, and `v_dashboard_metrics` return accurate figures.
- [ ] **Seed Data (Optional for Non-Prod):** Run `supabase/seed.sql` on test or staging environments.

---

## 2. Environment Variables & Secrets
- [ ] `VITE_SUPABASE_URL`: Target Supabase project URL configured.
- [ ] `VITE_SUPABASE_ANON_KEY`: Supabase anon key configured in frontend runtime.
- [ ] `SUPABASE_SERVICE_ROLE_KEY`: Configured exclusively on backend server / container. **Never exposed to frontend client**.
- [ ] `GEMINI_API_KEY`: Configured on backend server for Gemini AI proxy features.
- [ ] `PORT`: Set to `3001` (or provider dynamic port).
- [ ] `NODE_ENV`: Set to `production`.
- [ ] `VITE_DEMO_MODE`: Set to `false` for live production.

---

## 3. Security & Boundaries
- [ ] **CORS & Rate Limiting:** Backend rate limiter enabled on `/api/` (max 100 requests per 15 min per IP).
- [ ] **Security Headers:** `helmet` active on Express; Vercel security headers (`X-Frame-Options: DENY`, `Strict-Transport-Security`, `CSP`, `nosniff`) active in `vercel.json`.
- [ ] **Auth Route Guards:** Test unauthenticated access redirects to `/login`; verify sales reps cannot access `/admin/*`.
- [ ] **PDF & CSV Export:** Validate authenticated access to `/api/documents/order/:id/pdf` and `/api/reports/:type/csv`.

---

## 4. Build, Lint & Automated Tests
- [ ] **Typecheck:** `npm run lint` (`tsc --noEmit`) passes with 0 errors.
- [ ] **Unit Tests:** `npm run test` (Vitest) passes (14/14 tests).
- [ ] **Production Build:** `npm run build` generates `frontend/dist/` bundle without errors.
- [ ] **E2E Smoke Test:** `npm run test:e2e` completes.

---

## 5. Deployment Verification
- [ ] **Vercel Frontend:** Deploy `frontend/dist` with SPA rewrite rules.
- [ ] **Backend Service:** Deploy `backend/server.js` on Node.js container / service.
- [ ] **Health Check:** `GET https://your-domain/api/health` returns `{ "status": "healthy", "service": "soleflow-backend" }`.
- [ ] **PWA & Offline Test:** Verify `manifest.json` and `sw.js` cache static assets appropriately.
