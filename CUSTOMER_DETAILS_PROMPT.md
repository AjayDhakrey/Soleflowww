# Master Prompt — Customer "Details" Button Opens Full Customer Information (ShoeConnect)

Paste the box below into Lovable as ONE message.

```
In ShoeConnect, clicking the "Details" button (Eye icon) on a customer row must open that customer's complete information page. Fix and complete this everywhere the button appears.

CURRENT STATE (verified in the code)
1. frontend/src/pages/customers/CustomersPage.tsx — "Details" calls handleSelectCustomer(c), which switches an in-page viewMode to 'detail'. There is no URL, so refresh/back/share loses it. Detail tabs exist for 'ledger', 'orders', 'notes' (a 'models' tab is declared in state but not shown). The "⋯" (MoreVertical) button next to Details only calls showToast.
2. frontend/src/pages/admin/AdminDashboard.tsx — the accounts table is a HARD-CODED array (storeName 'ABC Footwear', 'Regal Footwear Hub', 'Delhi Walkways Hub', 'Kanpur Leather Mart', 'ABC Footwear Hub' with string creditLimit/balanceDue). Its "Details" button calls onNavigate('/admin/customers') — the generic list, not the clicked customer. Its "⋯" button only shows a toast.

RULES
- Keep existing layout, text, styling (current design system, font weights, light + dark mode) and existing tabs' content. Only add and fix.
- Data comes from real customers/orders/payments (AppContext / Supabase). Salesmen can only open their assigned customers (RLS); opening someone else's customer shows the Access Denied / not-found state. Mock data only as demo fallback.

STEP 1 — Make "Details" open the right customer, with a real URL
- Route: /admin/customers/:customerId and /sales/customers/:customerId (use the app's existing prefixes). Optional ?tab=overview|ledger|orders|payments|designs|models|followups|notes|activity.
- CustomersPage: "Details" and a click anywhere on the row navigate to that route. The page reads customerId from the URL and loads the customer by ID (works on refresh, new tab, shared link). Keep the existing viewMode logic working by syncing it from the URL.
- AdminDashboard: replace the hard-coded accounts array with real customers (same columns and look; keep the old array only as demo fallback). "Details" navigates to /admin/customers/<that customer's id>.
- Back button / breadcrumb returns to where the user came from (Dashboard or Customers list, keeping filters and scroll).
- Unknown or forbidden ID → friendly "Customer not found or you don't have access" state with a Back button.

STEP 2 — Customer detail page content
Header (sticky on scroll):
- Avatar initials, business name, proprietor/contact person, customer ID (mono), status badge, tier tag.
- Meta line with icons: City, State · Phone (tel: link) · WhatsApp (wa.me link) · Email · GSTIN · Assigned salesman (link, admin only).
- Actions (only those the role is allowed): New order (opens existing CreateOrderWizardModal pre-filled with this customer), Record payment (existing RecordPaymentModal pre-filled), Share designs (existing share flow pre-selected), Edit, and a "⋯" menu (Assign salesman — admin, Change credit limit — admin, Archive — admin, Copy customer ID).

Summary cards (from the shared customer metrics, real values):
- Total orders · Total business · Total paid · Outstanding (red if overdue) · Credit limit usage (progress bar; amber > 80%, red > 100%) · Last order date · Last payment (amount + date) · Avg order value.

Tabs (URL-synced; keep existing Ledger / Orders / Notes content and add the rest):
1. Overview — contact & business details card, payment terms, credit limit, preferences, top 3 selling models with images, next scheduled follow-up, last 5 activity events.
2. Ledger (existing) — running debit/credit ledger with balance; date-range filter; Export CSV / Print.
3. Orders (existing) — table: Order ID, Date, Items/pairs, Amount, Paid, Due, Status, Manufacturer; row click opens the order (or the Order Inspect drawer if it exists).
4. Payments — table: Receipt no., Date, Amount, Method, Reference/UTR, Allocated order(s), Collected by, Status; row click opens payment details.
5. Designs shared — designs shared with this customer (thumbnail, code, name, date, shared by, viewed?, ordered?).
6. Top models (the existing 'models' state) — best-selling designs for this customer with image, pairs ordered, last ordered date.
7. Follow-ups & visits — upcoming and past follow-ups/visits with outcome; "Add follow-up" button.
8. Notes (existing) — notes list with author and time; add note box.
9. Activity — full timeline (created, assigned, designs shared, orders, approvals, payments, notes) with icons and actor names.
Each tab: loading skeleton, empty state with one line + the relevant action button, and pagination for long lists.

STEP 3 — Make the "⋯" row menu real (Customers page and Dashboard)
Replace the toast with a dropdown menu: View details, New order, Record payment, Share designs, Call, WhatsApp, Add follow-up, Edit, Assign salesman (admin), Archive (admin, with confirm dialog). Keyboard accessible, closes on outside click/Esc.

STEP 4 — Live updates
- After creating an order, recording a payment, adding a note/follow-up, or sharing designs from this page, the header numbers, summary cards and relevant tab refresh immediately (and the Customers list / Dashboard values too).

STEP 5 — Mobile
- Header actions collapse into a primary "New order" + "⋯" menu; summary cards 2 per row; tabs become a horizontal scroll chip bar; tables become stacked rows.

STEP 6 — Verify
- Click Details on at least 3 different customers from the Customers page AND from the Dashboard → each opens the correct customer.
- Refresh on the detail page → same customer and tab still shown. Back returns to the list with filters kept.
- Numbers on the detail page match the row values and the KPI cards.
- Salesman can open only assigned customers.
- No hard-coded customer names left in AdminDashboard (except demo fallback).
- Light/dark mode and 375px mobile look correct. List the files changed.
```

---

## Quick check after Lovable finishes

- [ ] "Details" opens the exact customer you clicked — from both Customers page and Dashboard
- [ ] Page has its own address; refresh keeps you there
- [ ] Header with contact info + New order / Record payment / Share designs actions
- [ ] Summary numbers + tabs: Overview, Ledger, Orders, Payments, Designs shared, Top models, Follow-ups, Notes, Activity
- [ ] "⋯" menu works (no more toast)
- [ ] Dashboard table shows real customers
