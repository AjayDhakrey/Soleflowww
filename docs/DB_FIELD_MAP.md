# Database Field Map & UI Data Destination Audit (SoleFlow)

This document provides a comprehensive mapping of every menu, page, modal, drawer, and input in SoleFlow to its corresponding Supabase database table, column, view, or RPC function.

---

## 1. UI Input to Database Mapping Matrix

| Menu | Component | Field / Action | Service Function | Table.column or RPC(arg) | Column Type & Constraint | Status |
|---|---|---|---|---|---|---|
| **Customers** | `AddCustomerModal` | Store / Business Name | `clientsService.createClient` | `customers.businessName` via `create_client(p_business_name)` | `TEXT NOT NULL` | ✅ saves correctly |
| **Customers** | `AddCustomerModal` | Proprietor Name | `clientsService.createClient` | `customers.propName` via `create_client(p_prop_name)` | `TEXT NOT NULL` | ✅ saves correctly |
| **Customers** | `AddCustomerModal` | Phone Number | `clientsService.createClient` | `customers.phone` via `create_client(p_phone)` | `TEXT NOT NULL` | ✅ saves correctly |
| **Customers** | `AddCustomerModal` | City & State | `clientsService.createClient` | `customers.city, state` via `create_client(p_city, p_state)` | `TEXT NOT NULL` | ✅ saves correctly |
| **Customers** | `AddCustomerModal` | Address | `clientsService.createClient` | `customers.address` via `create_client(p_address)` | `TEXT` | ✅ saves correctly |
| **Customers** | `AddCustomerModal` | GSTIN Number | `clientsService.createClient` | `customers.gstin` via `create_client(p_gstin)` | `TEXT` | ✅ saves correctly |
| **Customers** | `AddCustomerModal` | Credit Limit | `clientsService.createClient` | `customers.creditLimit` via `create_client(p_credit_limit)` | `NUMERIC DEFAULT 500000` | ✅ saves correctly |
| **Customers** | `AddCustomerModal` | Payment Terms | `clientsService.createClient` | `customers.paymentTerms` via `create_client(p_payment_terms)` | `TEXT DEFAULT '30% Adv...'` | ✅ saves correctly |
| **Customers** | `CustomerDetailPage` | Archive Customer | `clientsService.archiveClient` | `customers.archived_at` via `archive_client(p_client_id, p_reason)` | `TIMESTAMPTZ` | ✅ saves correctly |
| **Customers** | `CustomerDetailPage` | Reassign Salesperson | `clientsService.assignSalesman` | `customers.salespersonId` via `assign_salesman(p_client_id, p_salesman_id)` | `TEXT REFERENCES sales_team(id)` | ✅ saves correctly |
| **Customers** | `CustomerDetailPage` | Add Client Note | `clientsService.addClientNote` | `client_notes(client_id, note)` | `TEXT NOT NULL` | ✅ saves correctly |
| **Customers** | `CustomersPage` | Client Feed & Table | `clientsService.fetchClients` | `v_client_financials` | `VIEW` | ✅ reads correctly |
| **Designs** | `DesignsPage` | Add Design Modal | `designsService.createDesign` | `designs.*` via `create_design(p_article_code, p_name, ...)` | `TEXT, NUMERIC, JSONB` | ✅ saves correctly |
| **Designs** | `DesignsPage` | Archive Design | `designsService.archiveDesign` | `designs.archived_at, status` | `TIMESTAMPTZ, TEXT` | ✅ saves correctly |
| **Designs** | `DesignsPage` | Design Image Upload | `storageService.uploadDesignImage` | `storage.objects` (bucket: `design-images`) | `Storage Object (Public Read)` | ✅ saves correctly |
| **Designs** | `ShareLookbookModal` | Share Designs Link | `designsService.shareDesigns` | `design_shares.*` via `share_designs(p_design_ids, p_client_ids, p_channel)` | `TEXT[], JSONB, UUID token` | ✅ saves correctly |
| **Designs** | `DesignsPage` | Catalogue Feed | `designsService.fetchDesigns` | `designs` (`WHERE archived_at IS NULL`) | `TABLE` | ✅ reads correctly |
| **Orders** | `CreateOrderWizardModal` | Customer Select | `ordersService.createOrderDraft` | `orders.customerId` via `create_order_draft(p_client_id)` | `TEXT NOT NULL REFERENCES customers(id)` | ✅ saves correctly |
| **Orders** | `CreateOrderWizardModal` | Order Line Items (Cartons/Pairs) | `ordersService.createOrderDraft` | `orders.items, order_items` via `create_order_draft(p_items)` | `JSONB NOT NULL` | ✅ saves correctly |
| **Orders** | `CreateOrderWizardModal` | Trade Discount % | `ordersService.createOrderDraft` | `orders.tradeDiscountPercent` via `create_order_draft(p_trade_discount_percent)` | `NUMERIC DEFAULT 5` | ✅ saves correctly |
| **Orders** | `CreateOrderWizardModal` | Advance Amount | `ordersService.createOrderDraft` | `orders.advanceDeposited` via `create_order_draft(p_advance_deposited)` | `NUMERIC DEFAULT 0` | ✅ saves correctly |
| **Orders** | `CreateOrderWizardModal` | Expected Delivery Date | `ordersService.createOrderDraft` | `orders.expectedDelivery` via `create_order_draft(p_expected_delivery)` | `TEXT / TIMESTAMPTZ` | ✅ saves correctly |
| **Orders** | `OrderInspectDrawer` | Advance Status | `ordersService.advanceOrderStatus` | `orders.status, order_status_history` via `advance_order_status(p_order_id, p_to_status, p_note)` | `TEXT NOT NULL` | ✅ saves correctly |
| **Orders** | `OrdersPage` | Orders Feed & Table | `ordersService.fetchOrders` | `v_order_financials` | `VIEW` | ✅ reads correctly |
| **Payments** | `RecordPaymentModal` | Customer Select | `paymentsService.recordPayment` | `payments.customerId` via `record_payment(p_client_id)` | `TEXT NOT NULL REFERENCES customers(id)` | ✅ saves correctly |
| **Payments** | `RecordPaymentModal` | Payment Amount | `paymentsService.recordPayment` | `payments.paymentAmount` via `record_payment(p_amount)` | `NUMERIC NOT NULL (>0)` | ✅ saves correctly |
| **Payments** | `RecordPaymentModal` | Payment Method | `paymentsService.recordPayment` | `payments.paymentMethod` via `record_payment(p_method)` | `TEXT ('UPI', 'Cash', 'NEFT/RTGS', 'Cheque')` | ✅ saves correctly |
| **Payments** | `RecordPaymentModal` | Reference / UTR | `paymentsService.recordPayment` | `payments.utrRef` via `record_payment(p_reference)` | `TEXT` | ✅ saves correctly |
| **Payments** | `RecordPaymentModal` | Cheque No & Bank | `paymentsService.recordPayment` | `payments.cheque_no, cheque_bank, cheque_date` via `record_payment` | `TEXT, DATE` | ✅ saves correctly |
| **Payments** | `RecordPaymentModal` | Receipt File Upload | `storageService.uploadPaymentReceipt` | `storage.objects` (bucket: `payment-receipts`) | `Storage Object (Private)` | ✅ saves correctly |
| **Payments** | `PaymentsPage` | Clear Cheque Action | `paymentsService.clearCheque` | `payments.status = 'verified'` via `clear_cheque(p_payment_id)` | `TEXT` | ✅ saves correctly |
| **Payments** | `PaymentsPage` | Bounce Cheque Action | `paymentsService.bounceCheque` | `payments.status = 'bounced'` via `bounce_cheque(p_payment_id, p_reason)` | `TEXT` | ✅ saves correctly |
| **Payments** | `PaymentsPage` | Reverse Payment Action | `paymentsService.reversePayment` | `payments.status = 'reversed', payment_adjustments` via `reverse_payment(p_payment_id, p_reason)` | `TEXT, NUMERIC` | ✅ saves correctly |
| **Payments** | `PaymentsPage` | Payments Feed | `paymentsService.fetchPayments` | `payments` (`WHERE archived_at IS NULL`) | `TABLE` | ✅ reads correctly |
| **Collections** | `CollectionsPage` | Aging Breakdown & Overdue Feed | `paymentsService.fetchReceivables` | `v_receivables` | `VIEW` | ✅ reads correctly |
| **Collections** | `CollectionsPage` | Rep Monthly Collection Summary | `paymentsService.fetchSalesmanCollections` | `v_salesman_collections` | `VIEW` | ✅ reads correctly |
| **Sales Team** | `SalesTeamPage` | Rep Profiles & Targets | `salesmenService.fetchSalesTeam` | `sales_team` + `v_salesman_performance` | `TABLE + VIEW` | ✅ reads correctly |
| **Sales Team** | `SalesTeamPage` | Update Salesman Details | `salesmenService.updateSalesman` | `sales_team` | `TABLE` | ✅ saves correctly |
| **Visits** | `VisitsPage` | Record Field Visit | `visitsService.createVisit` | `field_visits` (`client_id, visit_date, purpose, notes`) | `TABLE` | ✅ saves correctly |
| **Visits** | `VisitsPage` | Complete Field Visit | `visitsService.completeVisit` | `field_visits.status = 'completed', outcome, updated_at` | `TABLE` | ✅ saves correctly |
| **Visits** | `VisitsPage` | Visits Feed | `visitsService.fetchVisits` | `field_visits` | `TABLE` | ✅ reads correctly |
| **Follow-ups** | `FollowUpsPage` | Create Follow-up | `followUpsService.createFollowUp` | `follow_ups` (`client_id, due_at, type, priority, notes`) | `TABLE` | ✅ saves correctly |
| **Follow-ups** | `FollowUpsPage` | Complete Follow-up | `followUpsService.completeFollowUp` | `follow_ups.status = 'completed'` | `TABLE` | ✅ saves correctly |
| **Follow-ups** | `FollowUpsPage` | Follow-ups Feed | `followUpsService.fetchFollowUps` | `follow_ups` | `TABLE` | ✅ reads correctly |
| **Discounts** | `RequestDiscountModal` | Submit Discount Request | `discountRequestsService.requestDiscount` | `discount_requests.*` via `request_discount(p_order_id, p_requested_percent, p_reason)` | `NUMERIC, TEXT` | ✅ saves correctly |
| **Discounts** | `DiscountRequestDrawer` | Approve Concession | `discountRequestsService.approveDiscount` | `discount_requests.status = 'approved', orders.tradeDiscountPercent` via `approve_discount_request(p_request_id, p_approved_percent, p_note)` | `TEXT, NUMERIC` | ✅ saves correctly |
| **Discounts** | `DiscountRequestDrawer` | Reject Concession | `discountRequestsService.rejectDiscount` | `discount_requests.status = 'rejected'` via `reject_discount_request(p_request_id, p_note)` | `TEXT` | ✅ saves correctly |
| **Discounts** | `ReportsPage` / Drawer | Pending Queue Feed | `discountRequestsService.fetchPendingRequests` | `discount_requests` + `v_discount_request_stats` | `TABLE + VIEW` | ✅ reads correctly |
| **Notifications** | `NotificationsPage` | Notifications List | `notificationsService.fetchNotifications` | `notifications` | `TABLE` | ✅ reads correctly |
| **Notifications** | `NotificationsPage` | Mark as Read | `notificationsService.markAsRead` | `notifications.read_at = NOW()` | `TIMESTAMPTZ` | ✅ saves correctly |
| **Notifications** | `NotificationsPage` | Mark All as Read | `notificationsService.markAllAsRead` | `notifications.read_at = NOW()` (`WHERE read_at IS NULL`) | `TIMESTAMPTZ` | ✅ saves correctly |
| **Manufacturers** | `ManufacturersPage` | Plant Directory Feed | `manufacturersService.fetchManufacturers` | `manufacturers` + `v_manufacturer_performance` | `TABLE + VIEW` | ✅ reads correctly |
| **Manufacturers** | `ManufacturersPage` | Create Manufacturer | `manufacturersService.createManufacturer` | `manufacturers` | `TABLE` | ✅ saves correctly |
| **Audit Log** | `AuditLogPage` | Audit Events Feed | `activityService.fetchActivityEvents` | `activity_events` + `audit_logs` | `TABLE` | ✅ reads correctly |
| **Search** | `Header` Global Search | Search Query `q` | `searchService.globalSearch` | `global_search(q)` | `pg_trgm Search RPC` | ✅ reads correctly |
| **Lookbook** | `PublicLookbookPage` | Token Lookbook View | `supabase.rpc('get_shared_designs')` | `get_shared_designs(p_share_token)` | `SECURITY DEFINER RPC` | ✅ reads correctly |

---

## 2. Hardcoded / Mock Fallback Audit & Policy
- In active production environments (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured), **all feeds and writes connect directly to Supabase**.
- In offline / sandbox demo walkthrough mode (`VITE_DEMO_MODE=true`), fallback mocks are available to ensure seamless demonstration without network requirements.
- Silent fake-saves have been eliminated: in non-demo mode, if Supabase is unavailable or returns an error, the error is immediately surfaced via toast notifications and rejected Promises.
