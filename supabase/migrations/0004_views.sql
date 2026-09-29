-- =========================================================================
-- MIGRATION 0004: COMPUTED FINANCIAL & ANALYTICAL VIEWS
-- Provides single source of truth for financial balances, receivables,
-- ageing buckets, and operational performance metrics.
-- =========================================================================

-- 1. ORDER FINANCIALS VIEW
CREATE OR REPLACE VIEW public.v_order_financials AS
WITH verified_payments AS (
    SELECT 
        pa.order_id,
        COALESCE(SUM(pa.amount), 0) AS paid_verified
    FROM public.payment_allocations pa
    JOIN public.payments p ON p.id = pa.payment_id
    WHERE p.status = 'verified' AND p.archived_at IS NULL
    GROUP BY pa.order_id
),
direct_order_payments AS (
    SELECT
        p."orderId" AS order_id,
        COALESCE(SUM(p."paymentAmount"), 0) AS paid_direct
    FROM public.payments p
    WHERE p."orderId" IS NOT NULL AND p.status = 'verified' AND p.archived_at IS NULL
      AND NOT EXISTS (SELECT 1 FROM public.payment_allocations pa WHERE pa.payment_id = p.id)
    GROUP BY p."orderId"
),
order_adjustments AS (
    SELECT 
        adj.order_id,
        COALESCE(SUM(adj.amount), 0) AS total_adjustments
    FROM public.payment_adjustments adj
    WHERE adj.order_id IS NOT NULL
    GROUP BY adj.order_id
)
SELECT 
    o.id AS order_id,
    o."customerId" AS client_id,
    o."customerName" AS client_name,
    o."salespersonId" AS salesman_id,
    o."salespersonName" AS salesman_name,
    o.status AS order_status,
    o."netPayable"::NUMERIC(14,2) AS net_payable,
    (COALESCE(vp.paid_verified, 0) + COALESCE(dop.paid_direct, 0))::NUMERIC(14,2) AS paid_verified,
    COALESCE(oa.total_adjustments, 0)::NUMERIC(14,2) AS adjustments,
    GREATEST(0, o."netPayable" - (COALESCE(vp.paid_verified, 0) + COALESCE(dop.paid_direct, 0)) - COALESCE(oa.total_adjustments, 0))::NUMERIC(14,2) AS outstanding,
    CASE 
        WHEN (COALESCE(vp.paid_verified, 0) + COALESCE(dop.paid_direct, 0)) >= o."netPayable" THEN 'Paid'
        WHEN (COALESCE(vp.paid_verified, 0) + COALESCE(dop.paid_direct, 0)) > 0 THEN 'Partially Paid'
        ELSE 'Unpaid'
    END AS payment_status,
    GREATEST(0, EXTRACT(DAY FROM (NOW() - COALESCE(o.order_date_at, o.created_at))))::INT AS age_days,
    CASE
        WHEN GREATEST(0, o."netPayable" - (COALESCE(vp.paid_verified, 0) + COALESCE(dop.paid_direct, 0)) - COALESCE(oa.total_adjustments, 0)) > 0
             AND EXTRACT(DAY FROM (NOW() - COALESCE(o.order_date_at, o.created_at))) > 30 THEN true
        ELSE false
    END AS is_overdue,
    o.order_date_at,
    o.expected_delivery_at,
    o.created_at
FROM public.orders o
LEFT JOIN verified_payments vp ON vp.order_id = o.id
LEFT JOIN direct_order_payments dop ON dop.order_id = o.id
LEFT JOIN order_adjustments oa ON oa.order_id = o.id
WHERE o.archived_at IS NULL;

-- 2. CLIENT FINANCIALS VIEW
CREATE OR REPLACE VIEW public.v_client_financials AS
WITH client_orders AS (
    SELECT 
        vof.client_id,
        COUNT(vof.order_id) AS orders_count,
        COALESCE(SUM(vof.net_payable), 0) AS total_business,
        COALESCE(SUM(vof.paid_verified), 0) AS total_paid,
        COALESCE(SUM(vof.outstanding), 0) AS outstanding,
        COALESCE(SUM(CASE WHEN vof.is_overdue THEN vof.outstanding ELSE 0 END), 0) AS overdue_amount,
        MAX(vof.created_at) AS last_order_at,
        AVG(vof.net_payable) AS avg_order_value
    FROM public.v_order_financials vof
    GROUP BY vof.client_id
),
client_last_payment AS (
    SELECT DISTINCT ON (p."customerId")
        p."customerId" AS client_id,
        p."paymentAmount" AS last_payment_amount,
        COALESCE(p.payment_date_at, p.created_at) AS last_payment_at
    FROM public.payments p
    WHERE p.status = 'verified' AND p.archived_at IS NULL
    ORDER BY p."customerId", COALESCE(p.payment_date_at, p.created_at) DESC
)
SELECT 
    c.id AS client_id,
    c."businessName" AS business_name,
    c."propName" AS prop_name,
    c.phone,
    c.city,
    c.state,
    c."salespersonId" AS salesman_id,
    c."salespersonName" AS salesman_name,
    c.status AS client_status,
    c."creditLimit"::NUMERIC(14,2) AS credit_limit,
    c."paymentTerms" AS payment_terms,
    COALESCE(co.orders_count, 0)::INT AS orders_count,
    COALESCE(co.total_business, 0)::NUMERIC(14,2) AS total_business,
    COALESCE(co.total_paid, 0)::NUMERIC(14,2) AS total_paid,
    COALESCE(co.outstanding, 0)::NUMERIC(14,2) AS outstanding,
    COALESCE(co.overdue_amount, 0)::NUMERIC(14,2) AS overdue_amount,
    COALESCE(co.avg_order_value, 0)::NUMERIC(14,2) AS avg_order_value,
    co.last_order_at,
    clp.last_payment_at,
    COALESCE(clp.last_payment_amount, 0)::NUMERIC(14,2) AS last_payment_amount
FROM public.customers c
LEFT JOIN client_orders co ON co.client_id = c.id
LEFT JOIN client_last_payment clp ON clp.client_id = c.id
WHERE c.archived_at IS NULL;

-- 3. RECEIVABLES & AGEING BUCKETS VIEW
CREATE OR REPLACE VIEW public.v_receivables AS
SELECT 
    vof.client_id,
    vof.client_name,
    vof.salesman_id,
    vof.salesman_name,
    SUM(vof.net_payable)::NUMERIC(14,2) AS total_invoiced,
    SUM(vof.paid_verified)::NUMERIC(14,2) AS total_paid,
    SUM(vof.outstanding)::NUMERIC(14,2) AS amount_due,
    SUM(CASE WHEN vof.age_days <= 30 THEN vof.outstanding ELSE 0 END)::NUMERIC(14,2) AS bucket_0_30,
    SUM(CASE WHEN vof.age_days BETWEEN 31 AND 60 THEN vof.outstanding ELSE 0 END)::NUMERIC(14,2) AS bucket_31_60,
    SUM(CASE WHEN vof.age_days BETWEEN 61 AND 90 THEN vof.outstanding ELSE 0 END)::NUMERIC(14,2) AS bucket_61_90,
    SUM(CASE WHEN vof.age_days > 90 THEN vof.outstanding ELSE 0 END)::NUMERIC(14,2) AS bucket_90_plus,
    MAX(vof.age_days) AS max_age_days
FROM public.v_order_financials vof
WHERE vof.outstanding > 0
GROUP BY vof.client_id, vof.client_name, vof.salesman_id, vof.salesman_name;

-- 4. SALESMAN PERFORMANCE VIEW
CREATE OR REPLACE VIEW public.v_salesman_performance AS
SELECT 
    st.id AS salesman_id,
    st.name AS salesman_name,
    st.zone,
    st.cluster,
    st."monthlyTarget"::NUMERIC(14,2) AS monthly_target,
    COUNT(DISTINCT c.id) AS assigned_clients_count,
    COUNT(DISTINCT o.id) AS orders_count,
    COALESCE(SUM(o."netPayable"), 0)::NUMERIC(14,2) AS total_booked_value,
    COALESCE(SUM(p."paymentAmount"), 0)::NUMERIC(14,2) AS total_collections,
    COUNT(DISTINCT fu.id) FILTER (WHERE fu.status = 'pending') AS pending_followups_count
FROM public.sales_team st
LEFT JOIN public.customers c ON c."salespersonId" = st.id AND c.archived_at IS NULL
LEFT JOIN public.orders o ON o."salespersonId" = st.id AND o.archived_at IS NULL
LEFT JOIN public.payments p ON p."collectedBy" = st.name AND p.status = 'verified' AND p.archived_at IS NULL
LEFT JOIN public.follow_ups fu ON fu.owner_name = st.name AND fu.status = 'pending'
WHERE st.archived_at IS NULL
GROUP BY st.id, st.name, st.zone, st.cluster, st."monthlyTarget";

-- 5. DESIGN PERFORMANCE VIEW
CREATE OR REPLACE VIEW public.v_design_performance AS
SELECT 
    d.id AS design_id,
    d."articleCode" AS article_code,
    d.name AS design_name,
    d.category,
    d.price::NUMERIC(14,2) AS price,
    d.status,
    COUNT(DISTINCT dsi.share_id) AS total_shares_count,
    COALESCE(SUM(ds."viewCount"), 0) AS total_views_count,
    COUNT(DISTINCT oi.order_id) AS total_orders_count,
    COALESCE(SUM(oi.qty_pairs), 0) AS total_pairs_ordered,
    COALESCE(SUM(oi.line_total), 0)::NUMERIC(14,2) AS total_revenue_generated
FROM public.designs d
LEFT JOIN public.design_share_items dsi ON dsi.design_id = d.id
LEFT JOIN public.design_shares ds ON ds.id = dsi.share_id
LEFT JOIN public.order_items oi ON oi.design_id = d.id
WHERE d.archived_at IS NULL
GROUP BY d.id, d."articleCode", d.name, d.category, d.price, d.status;

-- 6. MANUFACTURER PERFORMANCE VIEW
CREATE OR REPLACE VIEW public.v_manufacturer_performance AS
SELECT 
    m.id AS manufacturer_id,
    m."companyName" AS company_name,
    m."hubLocation" AS hub_location,
    m."monthlyCapacityPairs" AS monthly_capacity_pairs,
    m."onTimeDeliveryRate" AS on_time_rate,
    m."qcPassRatio" AS qc_pass_ratio,
    m.status,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status IN ('In Production', 'Pending Manufacturer', 'Ready')) AS active_orders_count,
    COALESCE(SUM(o."pairsCount") FILTER (WHERE o.status IN ('In Production', 'Pending Manufacturer', 'Ready')), 0) AS active_pairs_count
FROM public.manufacturers m
LEFT JOIN public.orders o ON o."manufacturerId" = m.id AND o.archived_at IS NULL
WHERE m.archived_at IS NULL
GROUP BY m.id, m."companyName", m."hubLocation", m."monthlyCapacityPairs", m."onTimeDeliveryRate", m."qcPassRatio", m.status;
