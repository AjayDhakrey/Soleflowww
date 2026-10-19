# Technology Stack

**Analysis Date:** 2026-10-19

## Languages

**Primary:**
- TypeScript 5.8 / 7.0 (`frontend/tsconfig.json`, `package.json`) - Core frontend client application, typed services, UI components, state management contexts, and tests.
- JavaScript (Node.js ESM) (`package.json`, `backend/server.js`, `backend/src/app.js`, `scripts/*.mjs`) - Backend API server, production reverse proxy, utility migrations, and automated verification scripts.

**Secondary:**
- PostgreSQL / PLpgSQL (`supabase/migrations/*.sql`) - Database schemas, row-level security (RLS) policies, triggers, and RPC stored procedures.
- CSS / Tailwind CSS (`frontend/src/index.css`) - Utility-first styling with modern Tailwind CSS v4 design tokens and claymorphic theme variables.

## Runtime

**Environment:**
- Node.js >= 20.x (`package.json`)
- Browser: Modern Evergreen Browsers (Chrome, Edge, Safari, Firefox) supporting ES2022 and WebSockets

**Package Manager:**
- npm (lockfile `package-lock.json` present)

## Frameworks

**Core:**
- React 19 (`react: ^19.0.1`, `react-dom: ^19.0.1`) - Component-based user interface (`frontend/src/App.tsx`).
- React Router 7 (`react-router-dom: ^7.18.4`) - Hash and browser-based routing for Admin, Sales, Platform, and Public Lookbook views.
- TanStack React Query 5 (`@tanstack/react-query: ^5.104.0`) - Client-side asynchronous cache and query invalidation.
- Express 4 (`express: ^4.21.2`) - Production backend HTTP API server (`backend/src/app.js`).

**Styling & Motion:**
- Tailwind CSS 4 (`tailwindcss: ^4.3.3`, `@tailwindcss/vite: ^4.3.3`)
- Motion (`motion: ^12.23.24`) - Smooth entrance transitions and micro-interactions
- Lucide React (`lucide-react: ^0.546.0`) - Icon system

**Testing:**
- Vitest 5 (`vitest: ^5.0.2`, `vitest.config.ts`) - Unit and integration test runner
- React Testing Library (`@testing-library/react: ^16.3.3`, `@testing-library/jest-dom: ^7.0.1`) - DOM component testing
- JSDOM (`jsdom: ^29.1.1`) - In-memory browser environment

**Build / Dev Tools:**
- Vite 6 / 8 (`vite: ^8.3.0`, `@vitejs/plugin-react: ^6.1.1`) - Rapid dev server and optimized production bundler (`frontend/vite.config.ts`).
- TypeScript (`typescript: ^7.0.2`, `tsx: ^4.21.0`) - Static typing and TypeScript execution.

## Key Dependencies

**Critical:**
- `@supabase/supabase-js: ^2.117.2` - Supabase Postgres client, real-time WebSocket pub/sub listeners, and authentication provider.
- `zod: ^4.6.5` & `react-hook-form: ^7.89.0` - Schema validation and form management (`frontend/src/utils/validation.ts`).
- `html2pdf.js: ^0.14.0` & `pdfkit: ^0.20.2` - In-browser and backend PDF slip generation for orders and payment receipts (`backend/src/routes/documents.js`).

**Infrastructure & Security:**
- `helmet: ^8.3.0` - HTTP security headers in Express.
- `cors: ^2.8.6` - Cross-origin resource sharing configuration.
- `express-rate-limit: ^8.7.0` - API request throttling and brute-force prevention.
- `pino: ^10.3.1` & `pino-http: ^11.0.0` - High-performance structured logging.

## Configuration

**Environment:**
- Handled via `.env` loaded through `dotenv` in `backend/server.js` and Vite's `envPrefix: ['VITE_', 'NEXT_PUBLIC_']` in `frontend/vite.config.ts`.
- Critical environment keys:
  - `VITE_SUPABASE_URL` / `SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ALLOWED_ORIGINS`
  - `PORT`

**Build:**
- Frontend: `npm run build` generates optimized bundle into `frontend/dist/`.
- Backend: `npm start` serves `frontend/dist/` as static assets and handles `/api/*` endpoints.

## Platform Requirements

**Development:**
- Windows / macOS / Linux with Node.js >= 20.x
- Local ports: `3000` (frontend/backend dev)

**Production:**
- Vercel (`https://soleflowww.vercel.app`) / Render / Node.js container hosting.

---

*Stack analysis: 2026-10-19*
