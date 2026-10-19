# Master Prompt — Dashboard as a Business Overview of Every Section (ShoeConnect)

Paste the box below into Lovable as ONE message.

```
The Admin dashboard (frontend/src/pages/admin/AdminDashboard.tsx) currently repeats the Customers page: the same 4 KPI cards (Total Customers, Total Receivables, Overdue Accounts, Cleared Accounts) and a full-width Customers & Store Accounts table, plus a sneaker promo banner, Quick Actions and Recent Activity. Redesign the dashboard into ONE overview of the whole business, so the user sees the key information from every section without opening each section, and every item links to its full page.

RULES
- Keep the current design system (PageHeader, KpiCard with icon bubble, Panel, Table, Tag/StatusBadge, Button, EmptyState, icons from src/lib/icons.ts), light font weights, light + dark mode, and mobile support.
- All numbers are REAL data from Supabase (services + react-query hooks / views). No hard-coded values; if data is missing show "—" or an empty state.
- Remove from the dashboard: the full Customers & Store Accounts table and the duplicate customer KPI row (they stay on the Customers page). Remove the promo banner. Keep Quick Actions and Recent Activity (restyled as widgets below).
- Every widget has: section icon + title, a "View all →" link to that section's page, max 5 rows/items, loading skeleton, empty state, and error state with Retry. Every row/number is clickable and opens the exact record or a filtered list.
- Admin sees everything; the Salesman dashboard gets the same approach scoped to their own data (RLS) — see Part C.

PART A — DATA
- Create hooks/useDashboardOverview.ts that returns everything below in as few requests as possible. Preferred: one Postgres function get_dashboard_overview(p_from date, p_to date) (SECURITY INVOKER so RLS applies) in a new migration, returning JSON for all widgets. Otherwise, parallel react-query calls to existing views (v_client_financials, v_receivables, v_salesman_performance, v_design_performance, v_manufacturer_performance, v_discount_request_stats, v_salesman_collections).
- Period selector in the header: Today · This week · This month (default) · This quarter · Custom. Stored in the URL (?period=month). All period-based numbers follow it and show "vs previous period" change (green = good, red = bad; hide if no history).
- Realtime: subscribe to orders, payments, customers, follow_ups, field_visits, discount_requests, notifications → invalidate the overview query so the dashboard updates live.

PART B — ADMIN DASHBOARD LAYOUT (top to bottom)

1. Header: "Dashboard", greeting line with date, period selector, primary "New order", secondary "Record payment".

2. Needs attention (alert strip — only show items with count > 0; each is a clickable chip → filtered page):
   - Orders awaiting approval → /admin/orders?status=under_review
   - Discount requests pending → Reports approvals panel
   - Overdue accounts (count + ₹) → /admin/customers/insights/overdue
   - Cheques pending clearance → /admin/payments?status=pending_clearance
   - Orders delayed at manufacturer (expected delivery passed, not dispatched) → /admin/orders?filter=delayed
   - Follow-ups overdue → /admin/follow-ups?filter=overdue (or sales team view)
   - Low-stock / archived design used in open orders (if data exists)

3. Business KPIs row (6 cards, each links to its detail page):
   - Sales (order value this period) → Orders/Reports
   - Collections received this period → Payments
   - Total receivables (outstanding) → Receivables insight
   - Open orders (count + value) → Orders
   - Active customers → Customers insight
   - Pairs booked this period → Reports

4. Widget grid (2 columns on desktop, 1 on mobile):

   a) Orders pipeline → /admin/orders
      - Count per stage as a horizontal bar/funnel: Draft · Submitted · Under Review · Approved · In Production · Ready · Dispatched · Delivered (each stage clickable → orders filtered by status)
      - Latest 5 orders: ID, customer, amount, status pill → order detail/Inspect

   b) Collections & receivables → /admin/payments
      - Collected this period, cheques in transit, overdue ₹
      - Ageing mini-bar 0–30 / 31–60 / 61–90 / 90+ (each clickable)
      - Last 5 payments: receipt no., customer, amount, method, time → receipt

   c) Customers → /admin/customers
      - New this period, active, overdue, cleared (small numbers, each → insight page)
      - Top 5 customers by business this period: name, city, business ₹, outstanding ₹ → customer detail

   d) Production & manufacturers → /admin/manufacturers
      - Orders in production by manufacturer (name, active orders, load %, on-time %)
      - Delayed orders list (up to 5) → order detail

   e) Design catalogue → /admin/designs
      - Total active designs, new this period, most shared, best selling (thumbnail, code, pairs) → design detail
      - Shares this period → views → orders (conversion)

   f) Sales team → /admin/sales-team
      - Each salesman: booked vs target (progress bar), collections, visits today → salesman page
      - Highlight inactive salesmen (no activity in 3 days)

   g) Today's follow-ups & visits → Follow-ups / Visits pages
      - Due today and overdue follow-ups (customer, type, salesman, time) → follow-up/customer
      - Visits planned vs completed today

   h) Approvals → Reports approvals panel
      - Pending discount requests (customer, order, requested %, concession ₹) with Approve/Reject shortcuts (same RPCs as the approvals panel)
      - Orders awaiting approval with Approve shortcut

   i) Quick actions (kept): New order, Record payment, Add customer, Add design, Share designs, Add follow-up — role-aware.

   j) Recent activity (kept): last 10 activity_events across the business with actor, action, time → the related record.

PART C — SALESMAN DASHBOARD (frontend/src/pages/sales/SalesDashboard.tsx)
Same pattern, scoped to own data, keeping existing sections (KPI row, Today's Route & Store Stops, Follow-ups & Client Requests) and adding:
- Needs attention: my follow-ups overdue, my customers overdue, my discount requests pending, my orders awaiting approval
- My orders pipeline (counts per stage) → /sales/orders
- My collections: collected this period vs due, cheques in transit → /sales/collections
- My top customers & customers not ordered in 60 days (re-order opportunities) → customer detail
- Designs recently shared by me: viewed / ordered status → designs
- Remove any hard-coded numbers (e.g. monthly target, commission) — compute from data.

PART D — NAVIGATION RULES
- "View all →" goes to the section's main page; clicking a number/chip goes to that page with the matching filter applied (filters in the URL so they show as active on arrival); clicking a row opens the exact record.
- Back from any page returns to the dashboard with the same period selected and scroll position kept.
- Build all links with the existing route helpers/prefixes (/admin/... or /sales/...) based on role.

PART E — VERIFY
- The dashboard no longer duplicates the Customers page.
- Every widget shows real numbers that match the numbers on its section page for the same period.
- Every "View all", number, chip and row navigates to the correct page/filter/record (check each once and list results).
- Record a payment / create an order in another tab → dashboard updates without refresh.
- Salesman sees only own data. Light/dark and 375px mobile look correct. No console errors. List files changed.
```

---

## Quick check after Lovable finishes

- [ ] Dashboard shows Orders, Collections, Customers, Production, Designs, Sales team, Follow-ups, Approvals, Activity — not the customer table
- [ ] "Needs attention" strip at the top shows what to act on today
- [ ] Every "View all →" opens that section; every number and row opens the exact filtered list or record
- [ ] Changing the period (Today / Week / Month) updates the numbers
- [ ] Salesman dashboard shows only their own data
