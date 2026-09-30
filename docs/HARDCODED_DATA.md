# Hardcoded Data & Real Database Mapping Audit (SoleFlow)

This document tracks all hard-coded values, legacy mock samples, and their corresponding live Supabase tables, views, and RPC sources.

---

## 1. Discount Requests & Margin Authorizations

| Location | Hardcoded Value (Legacy) | Live Table / View Source | Status / Wire State |
| :--- | :--- | :--- | :--- |
| `ReportsPage.tsx` (Queue Panel) | "Metro Shoes Delhi (PO-8820), 9.5% vs 8.0%, ₹28,400 concession, 21.4% margin" | `public.discount_requests` + `public.v_discount_request_stats` | **Wired Live** via `discountRequestsService` & Realtime |
| `ReportsPage.tsx` (KPI Card) | "1 Pending" | `public.v_discount_request_stats.pending_count` | **Wired Live** with real-time sync |
| `ReportsPage.tsx` (Panel Header Tag) | "1 Pending Authorization" | `COUNT(discount_requests WHERE status='pending')` | **Wired Live** |
| `CreateOrderWizardModal.tsx` | Hardcoded `5%` trade discount default | `public.app_settings` (`default_trade_discount_percent: 8%`) | **Wired Live** with dynamic override workflow |
| `OrderInspectDrawer.tsx` | Static discount display without actions | `public.discount_requests` via `RequestDiscountModal` | **Wired Live** with order review status |

---

## 2. Orders & Financial KPIs

| Location | Legacy Hardcoded Value | Live Source Table / View |
| :--- | :--- | :--- |
| `AdminDashboard.tsx` (Total Customers) | Fixed `7` | `public.customers` (`COUNT(*)`) |
| `AdminDashboard.tsx` (Total Receivables) | Fixed `₹7.50L` | `public.v_order_financials` (`SUM(outstanding)`) |
| `AdminDashboard.tsx` (Overdue Accounts) | Fixed `2 Accounts` | `public.customers` (`WHERE status='overdue'`) |
| `OrdersPage.tsx` (Batch count) | Fixed `4 Batches` | `public.orders` (`COUNT(*)`) |
| `OrdersPage.tsx` (Status badges) | Static status list | `public.orders.status` + `order_status_history` |

---

## 3. App Configuration Settings (Supabase `public.app_settings`)

| Key | Value | Description |
| :--- | :--- | :--- |
| `default_trade_discount_percent` | `8` | Default wholesale standard discount percentage |
| `max_trade_discount_percent` | `15` | Ceiling threshold percentage for special requests |
| `min_margin_percent` | `15` | Target profitability floor percentage before warning |
| `default_gst_percent` | `12` | Footwear GST rate percentage |
| `overdue_after_days` | `30` | Number of days before unpaid balance is flagged Overdue |

---

## 4. Fallback Strategy
When `VITE_DEMO_MODE=true` or Supabase network is unavailable, all services gracefully fall back to in-memory reactive state (`inMemoryRequests`, `MOCK_ORDERS`, `MOCK_CUSTOMERS`) ensuring zero breaking downtime for demo walkthroughs.
