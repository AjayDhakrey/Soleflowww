# Master Prompt — Dynamic Discount (Margin Override) Requests & Approvals (SoleFlow)

Paste the box below into Lovable as ONE message.

```
The "Pending Volume Margin Authorizations" panel in frontend/src/pages/reports/ReportsPage.tsx is hard-coded (Metro Shoes Delhi, PO-8820, 9.5% vs 8.0%, ₹28,400, 21.4%). Its Approve/Reject buttons only call showToast and save nothing. The "Special Margin Requests — 1 Pending" KpiCard is also hard-coded. Replace this with a fully working, database-backed feature: salesmen can raise special-discount requests, the trader can open, approve or reject them, every decision is stored in Supabase, and every related number in the app updates live.

RULES
- Keep the existing look (Panel, KpiCard, Tag, Button, current typography/colors, light + dark mode). Keep the Panel title and subtitle.
- Do not delete other features or content. Keep the old hard-coded card only as a demo fallback when VITE_DEMO_MODE=true.
- All writes go through Supabase RPC functions (transactional, permission-checked). The browser never updates discount/amount/status columns directly.
- Money in NUMERIC(14,2); show ₹ with Indian grouping.
- Follow existing conventions: migrations live in supabase/migrations/ (0001–0007 exist), helpers public.is_admin() and public.current_salesman_id() exist, orders use camelCase quoted columns ("tradeDiscountPercent", "netPayable", etc.), tables app_settings, notifications, activity_events, order_status_history, audit_logs exist.

PART 1 — DATABASE (new migration supabase/migrations/0008_discount_requests.sql)
1. app_settings rows (insert if missing):
   default_trade_discount_percent = 8
   max_trade_discount_percent = 15
   min_margin_percent = 15   (warn below this)
2. designs: ADD COLUMN IF NOT EXISTS cost_per_pair NUMERIC(14,2) NULL (used for profitability; optional).
3. Table public.discount_requests:
   id TEXT PK (generated like DR-00001 via sequence)
   order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT
   client_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT
   requested_by UUID NOT NULL (auth user), salesman_id TEXT
   default_percent NUMERIC(5,2) NOT NULL
   requested_percent NUMERIC(5,2) NOT NULL CHECK (requested_percent > 0)
   approved_percent NUMERIC(5,2) NULL (allows a counter-offer)
   order_subtotal NUMERIC(14,2) NOT NULL
   pairs INT NOT NULL, product_summary TEXT (e.g. "900 Pairs Runner Classic")
   margin_concession NUMERIC(14,2) NOT NULL  -- (requested - default)% × subtotal
   projected_margin_percent NUMERIC(5,2) NULL -- only if cost_per_pair known for all items
   reason TEXT NOT NULL (salesman's justification)
   status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled','expired'))
   decided_by UUID NULL, decided_at TIMESTAMPTZ NULL, decision_note TEXT NULL
   created_at, updated_at TIMESTAMPTZ DEFAULT now()
   UNIQUE partial index: only ONE pending request per order.
4. RPC functions (SECURITY DEFINER, SET search_path = public, each writes activity_events + audit_logs + notifications in the same transaction):
   a) request_discount(p_order_id, p_requested_percent, p_reason) → discount_requests row
      - caller must be the order's salesman or admin; order must be Draft/Submitted/Under Review
      - requested_percent must be > default and ≤ max, else RAISE a readable error
      - computes concession and projected margin server-side
      - sets order status to 'Under Review' and adds an order timeline/status-history entry "Special discount requested (x%)"
      - notifies all admins
   b) approve_discount_request(p_request_id, p_approved_percent DEFAULT NULL, p_note DEFAULT NULL)
      - admin only; SELECT ... FOR UPDATE; must still be 'pending' (prevents double approval)
      - final % = p_approved_percent or requested_percent (must be ≤ max)
      - updates the order: "tradeDiscountPercent", "tradeDiscountAmount", "taxableSubtotal", "gstAmount", "netPayable", "balanceDue" recomputed from subtotal, GST% and advance
      - order status → 'Approved' (or the existing next status in the app's flow); timeline entry "Special discount 9.5% approved by <name>"
      - notifies the salesman
   c) reject_discount_request(p_request_id, p_note) — note REQUIRED
      - admin only; must be 'pending'
      - order keeps/reverts to default_percent and amounts are recomputed; timeline entry "Special discount rejected — reset to 8.0%"
      - notifies the salesman with the reason
   d) cancel_discount_request(p_request_id) — requester or admin, only while pending
5. RLS on discount_requests: admin all; salesman SELECT own/assigned-client rows only; no direct INSERT/UPDATE/DELETE for anyone (RPC only).
6. View v_discount_request_stats: pending_count, pending_concession_total, approved_this_month, rejected_this_month.
7. Seed: convert the current Metro Shoes Delhi / PO-8820 example into a real pending row in supabase/seed.sql (only if that client/order exists in seed data).
8. Regenerate TypeScript types.

PART 2 — SERVICE LAYER (frontend)
- src/services/discountRequests.ts: listDiscountRequests({status, clientId, orderId}), getDiscountRequest(id), requestDiscount(), approveDiscountRequest(), rejectDiscountRequest(), cancelDiscountRequest(), getDiscountStats(). Map snake_case → camelCase types added to types/index.ts (DiscountRequest).
- Errors from RPCs shown as toasts with the database's readable message; optimistic updates roll back on failure.
- Supabase Realtime subscription on discount_requests and orders: any change refreshes the list, KPI counts, order data and notification bell instantly for all logged-in users.
- Read default/max discount from app_settings (cache it) instead of hard-coded numbers.

PART 3 — UI
A) ReportsPage — "Pending Volume Margin Authorizations" panel (dynamic)
   - Header tag shows the real count: "{n} Pending Authorization(s)".
   - Tabs inside the panel: Pending (default) · Approved · Rejected — with counts.
   - One row per request using the SAME visual layout as today:
       line 1: "{Client name} ({order id})" + purple Tag "+{requested − default}% Volume Override"
       line 2: "{product_summary} • Requested {requested}% bulk discount instead of default {default}%."
       line 3: "Impact: ₹{margin_concession} margin concession • Profitability {healthy/low} at {projected_margin}%" (omit the profitability part if unknown; show it amber if below min_margin_percent)
       plus a small muted line: "Requested by {salesman} • {relative time}"
       right side: Reject (secondary) and "Approve {requested}%" (primary) — admin only.
   - Clicking anywhere on the row (not the buttons) opens the Request Detail drawer.
   - Empty state: "No pending authorizations." with a CheckCircle icon.
   - Loading skeleton while fetching.
B) KpiCard "Special Margin Requests": value = live pending count ("{n} Pending"), caption = "Awaiting trader sign-off" or "All caught up" when 0; clicking it scrolls to/opens the panel.
C) Request Detail drawer (new component src/components/discounts/DiscountRequestDrawer.tsx), right side, 520px, mobile full-screen, Esc/X/backdrop close, focus trapped:
   - Client, order id (link to the order / Inspect panel), salesman, created date, status badge
   - Product lines with thumbnails (from order items images)
   - Comparison block: Default {x}% vs Requested {y}% → discount amount, taxable, GST, net payable before vs after (computed client-side for preview only; server recomputes on approval)
   - Margin concession and projected profitability with a warning if below minimum
   - Salesman's reason
   - Client context: outstanding balance, credit limit, last 3 orders (from existing data)
   - History timeline of this request (created, approved/rejected, notes)
   - Admin actions (only when pending):
       "Approve {requested}%" primary
       "Approve different %" → small number input (default < value ≤ max) + optional note
       "Reject" → opens confirm dialog with REQUIRED reason textarea
     Buttons disabled while the request is in-flight; after success the drawer shows the new status and the list/KPIs update.
D) Raising a request (the "add" section)
   - In CreateOrderWizardModal, the trade discount field's default comes from app_settings (not hard-coded 5). If the user enters a discount above the default, show an inline notice "Needs trader approval" and a required "Reason" textarea; on submit the order is saved and request_discount() is called automatically.
   - In the order detail page and the Order Inspect drawer, add a "Request special discount" button (salesman on own orders, admin anywhere) that opens a small modal: current discount, requested % (validated default < x ≤ max), live preview of concession and new net payable, reason (required), Submit.
   - Also add a "+ New request" button in the panel header on ReportsPage that opens the same modal with an order picker (only orders the user can access and that are Draft/Submitted/Under Review).
E) Everywhere else that must reflect the decision dynamically:
   - Order list / detail / Inspect drawer: show a "Discount pending approval" amber badge while pending; show the approved % after approval; amounts reflect the new values.
   - Notifications page + bell: new request (admins), approved/rejected (salesman), click opens the request drawer.
   - Salesman dashboard: "My discount requests" small list with statuses.
   - Admin dashboard: pending count appears in alerts.
   - Client detail Activity tab and Audit Log page: entries appear automatically (from activity_events / audit_logs).
   - Remove the corresponding hard-coded notification in data/mockData.ts from live mode (keep it for demo mode only).

PART 4 — HARD-CODED DATA SWEEP (so the app changes as users work)
- Search ReportsPage, AdminDashboard, SalesDashboard, and other pages for hard-coded business numbers and names (e.g. "1 Pending", "₹28,400", "21.4%", fixed client names, fixed KPI values). List them in docs/HARDCODED_DATA.md with the table/view each should come from.
- Wire every item on that list that the existing tables/views can supply; for the rest, note what's missing. Keep the hard-coded values only as demo fallback.

PART 5 — VERIFY
- As salesman: create an order with 9.5% discount → request appears for admin within seconds without refresh; salesman sees "pending".
- As admin: approve → order discount becomes 9.5%, net payable/balance recalculated, salesman notified, KPI count drops, row moves to Approved tab, timeline and audit log updated. Refresh the page — everything persists.
- Reject with reason → order back to default %, amounts recomputed, reason visible to salesman.
- Try: approving twice, approving as salesman, requesting above max, requesting on a Delivered order, empty reject reason → each shows a clear error and changes nothing.
- Light and dark mode, 375px mobile.
- List files and migrations created/changed.
```

---

## Quick check after Lovable finishes

- [ ] Panel shows real requests from the database, with a live count
- [ ] Clicking a request opens full details (client, products with images, before/after amounts, reason)
- [ ] Approve / Approve different % / Reject (with reason) all save to Supabase
- [ ] Order totals change after approval; stay changed after refresh
- [ ] Salesman gets a notification; admin gets one when a request is raised
- [ ] Salesman can raise a request from the order wizard, order page, or "+ New request"
- [ ] Salesman cannot approve; double approval is blocked
