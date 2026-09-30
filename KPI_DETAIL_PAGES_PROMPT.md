# Master Prompt — KPI Cards Open Detail Pages (Customers & Receivables)

Paste the box below into Lovable as ONE message.

```
The four KPI cards "Total Customers", "Total Receivables", "Overdue Accounts" and "Cleared Accounts" appear in frontend/src/pages/admin/AdminDashboard.tsx and frontend/src/pages/customers/CustomersPage.tsx. On the dashboard they only navigate to the generic /admin/customers or /admin/payments page; on the Customers page they don't open anything. Their trend lines (↑ +12%, ↑ +8%, ↑ +1, ↑ +100%) are hard-coded.

Make each card open its OWN detail page full of real, useful content, and make the numbers and trends real.

RULES
- Keep the card design exactly as it is (icon bubble, label, value, trend line, caption, chevron). Only make it work and make the numbers real.
- Use the app's current design system (PageHeader, KpiCard, Panel, Table, Tag/StatusBadge, Button, EmptyState, tokens bg-surface / text-foreground / text-muted-foreground / border-border), current font weights, and support light + dark mode and mobile.
- Data comes from real data (AppContext / Supabase; use the existing view v_client_financials if available). Salesmen automatically see only their assigned clients (RLS). Keep mock data only as demo fallback.
- Do not remove any existing content or features.

STEP 1 — One shared metrics source (so card and page always match)
Create src/hooks/useCustomerMetrics.ts (or a service) that returns, from the same data:
  totalCustomers   = clients not archived
  activeCustomers  = clients with ≥1 order in last 90 days
  totalReceivables = Σ outstanding (amountDue) across clients
  overdueAccounts  = clients with outstanding > 0 AND past their payment terms (overdueDays > 0)
  overdueAmount    = Σ outstanding of those clients
  clearedAccounts  = clients with ≥1 order AND outstanding = 0
Plus real trends:
  Total Customers  → % change of customers added this month vs last month (from created_at)
  Total Receivables→ % change vs 30 days ago (outstanding as of that date = orders up to that date − payments up to that date)
  Overdue Accounts → number of accounts that became overdue in the last 7 days
  Cleared Accounts → accounts cleared this month vs last month
- Green arrow = good direction, red = bad (receivables/overdue going UP is red; customers/cleared going UP is green).
- If there isn't enough history to compute a trend, hide the trend line — never show a made-up number.
- Both AdminDashboard and CustomersPage cards must use this hook.

STEP 2 — Routes & click behavior
- Routes: /customers/insights/total, /customers/insights/receivables, /customers/insights/overdue, /customers/insights/cleared (under the admin and sales prefixes the app already uses, e.g. /admin/customers/insights/overdue and /sales/customers/insights/overdue).
- The whole card is clickable (cursor-pointer, hover border, focus ring, Enter/Space work, aria-label "Open Overdue Accounts details") and navigates to its page, passing where it came from so "Back" returns to the dashboard or customers page.
- Each detail page: breadcrumb (Dashboard or Customers / <Card name>), title = card label, the same number shown big at the top, a date-range filter (This month, Last 30 days, Last 90 days, This year, Custom), and a CSV export button. Filters are stored in the URL.

STEP 3 — Content of each page

A) Total Customers
- Summary row: Total · Active (90d) · New this month · Inactive/Archived.
- Chart: new customers per month (last 6–12 months).
- Breakdowns (small bar lists): by city/state, by salesman (admin only), by tier.
- Table of all customers: Client (avatar initials + business name + contact person), City, Salesman, Orders, Total business, Outstanding, Last order, Status. Search + filters (city, salesman, status, tier). Sort by any column. Row click → client detail page.

B) Total Receivables
- Summary row: Total outstanding · Due this week · Overdue · Collected this month.
- Ageing chart: 0–30 · 31–60 · 61–90 · 90+ days (bars; each bar clickable to filter the table).
- By salesman (admin only) and Top 10 debtors list.
- Table per client: Client, Salesman, Total business, Paid, Outstanding, Oldest due (days), Last payment (date + amount), Credit limit usage (small progress bar: outstanding / credit limit, amber > 80%, red > 100%).
- Row actions: Record payment (opens existing RecordPaymentModal prefilled with the client), Create follow-up, WhatsApp reminder (wa.me link with a polite pre-filled message including the outstanding amount), Open client.

C) Overdue Accounts
- Summary row: Overdue accounts · Overdue amount · Avg days overdue · New this week.
- Chart: overdue amount by days-overdue bucket.
- Table: Client, Salesman, Overdue amount, Days overdue (red badge ≥ 60, amber 1–59), Payment terms, Last payment, Last follow-up (date + outcome), Next step.
- Row actions: Call (tel: link), WhatsApp reminder, Schedule collection follow-up, Record payment, Open client.
- Highlight clients over their credit limit.
- Empty state: "No overdue accounts." with a CheckCircle icon.

D) Cleared Accounts
- Summary row: Cleared accounts · Total business from them · Avg days to pay · Cleared this month.
- Chart: cleared vs outstanding accounts over time.
- Table: Client, Salesman, Orders, Total business, Last payment date, Avg days to pay, Last order date.
- "Re-order opportunity" tag on cleared clients with no order in the last 60 days, with action "Create follow-up" and "Share designs" (opens existing share flow).
- Empty state: "No fully cleared accounts yet."

STEP 4 — Shared behaviour on all four pages
- Loading skeletons; error state with Retry; empty states as above.
- Numbers use ₹ with Indian grouping (compact ₹7.50L only in the summary, full ₹7,50,000 in tables), tabular-nums, right-aligned money.
- Mobile: summary cards 2 per row, table becomes stacked rows, actions in a "⋯" menu.
- Data updates live: after recording a payment or completing a follow-up, the page and the cards refresh (invalidate/refresh the shared metrics).
- Every client name links to the client detail page; every salesman name links to the salesman page (admin only).

STEP 5 — Verify
- Card value on the dashboard, on the Customers page, and on its detail page are always identical.
- Trends are computed (or hidden), never hard-coded; search the code to confirm "+12%", "+8%", "+1", "+100%" literals are gone (except demo fallback).
- Record a payment that clears a client → Total Receivables goes down, Overdue may go down, Cleared goes up, everywhere, without refresh.
- Salesman sees only their clients on all four pages.
- Light/dark mode and 375px mobile look correct.
- List the files changed.
```

---

## Quick check after Lovable finishes

- [ ] Each of the 4 cards opens its own page, from both the Dashboard and the Customers page
- [ ] The big number on the page matches the card
- [ ] Trends are real (or hidden), not +12% / +8% / +1 / +100%
- [ ] Receivables shows ageing + debtors; Overdue shows who to chase with Call / WhatsApp / Record payment
- [ ] Cleared shows re-order opportunities
- [ ] Recording a payment updates all cards instantly
