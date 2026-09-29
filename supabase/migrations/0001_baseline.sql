-- =========================================================================
-- MIGRATION 0001: BASELINE SCHEMA
-- Baseline snapshot of original v0 database structure
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CUSTOMERS / CLIENTS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    "businessName" TEXT NOT NULL,
    "propName" TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    cluster TEXT,
    address TEXT,
    gstin TEXT,
    "salespersonId" TEXT,
    "salespersonName" TEXT,
    "paymentTerms" TEXT DEFAULT '30% Advance + 70% Bilty',
    "creditLimit" NUMERIC DEFAULT 500000,
    "totalBusiness" NUMERIC DEFAULT 0,
    "totalPaid" NUMERIC DEFAULT 0,
    "amountDue" NUMERIC DEFAULT 0,
    "overdueDays" INT DEFAULT 0,
    status TEXT DEFAULT 'active',
    "ordersCount" INT DEFAULT 0,
    "lastOrderDate" TEXT DEFAULT 'Never',
    "lastPaymentDate" TEXT DEFAULT 'None',
    "lastPaymentAmount" NUMERIC DEFAULT 0,
    tier TEXT DEFAULT 'Standard Retail',
    "topSellingModels" JSONB DEFAULT '[]'::jsonb,
    "activityHistory" JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SHOE DESIGNS / CATALOGUE TABLE
CREATE TABLE IF NOT EXISTS public.designs (
    id TEXT PRIMARY KEY,
    "articleCode" TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    "moqPairs" INT DEFAULT 120,
    "moqCartons" INT DEFAULT 10,
    sizes JSONB DEFAULT '[6, 7, 8, 9, 10]'::jsonb,
    colors JSONB DEFAULT '["Slate Grey", "Midnight Black"]'::jsonb,
    status TEXT DEFAULT 'Available',
    tags JSONB DEFAULT '[]'::jsonb,
    subline TEXT,
    image TEXT NOT NULL,
    "soleType" TEXT,
    "pairsPerCarton" INT DEFAULT 12,
    "upperMaterial" TEXT,
    "marginBadge" TEXT,
    "velocityBadge" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    "customerId" TEXT REFERENCES public.customers(id) ON DELETE CASCADE,
    "customerName" TEXT NOT NULL,
    "propName" TEXT,
    "customerCity" TEXT,
    "customerState" TEXT,
    "salespersonId" TEXT,
    "salespersonName" TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    "pairsCount" INT NOT NULL DEFAULT 0,
    "cartonsCount" INT NOT NULL DEFAULT 0,
    "wholesaleRate" NUMERIC NOT NULL DEFAULT 0,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    "tradeDiscountPercent" NUMERIC DEFAULT 0,
    "tradeDiscountAmount" NUMERIC DEFAULT 0,
    "taxableSubtotal" NUMERIC NOT NULL DEFAULT 0,
    "gstPercent" NUMERIC DEFAULT 12,
    "gstAmount" NUMERIC DEFAULT 0,
    "netPayable" NUMERIC NOT NULL DEFAULT 0,
    "advanceDeposited" NUMERIC DEFAULT 0,
    "balanceDue" NUMERIC DEFAULT 0,
    "manufacturerId" TEXT,
    "manufacturerName" TEXT,
    "manufacturerPlant" TEXT,
    "expectedDelivery" TEXT,
    "paymentStatus" TEXT DEFAULT 'Payment Pending',
    status TEXT DEFAULT 'Draft',
    "orderDate" TEXT DEFAULT 'Today',
    "batchNumber" TEXT,
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PAYMENT RECEIPTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    "receiptNumber" TEXT NOT NULL UNIQUE,
    "customerId" TEXT REFERENCES public.customers(id) ON DELETE CASCADE,
    "customerName" TEXT NOT NULL,
    "customerCity" TEXT,
    "orderId" TEXT,
    "orderNumber" TEXT,
    "amountDueBefore" NUMERIC NOT NULL DEFAULT 0,
    "paymentAmount" NUMERIC NOT NULL,
    "amountDueAfter" NUMERIC NOT NULL DEFAULT 0,
    "paymentDate" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "utrRef" TEXT NOT NULL,
    "collectedBy" TEXT,
    notes TEXT,
    "sentSms" BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    actor TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    action TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "recordTitle" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    source TEXT DEFAULT 'Web App',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DESIGN SHARES LOG TABLE
CREATE TABLE IF NOT EXISTS public.design_shares (
    id TEXT PRIMARY KEY,
    "sharedBy" TEXT NOT NULL,
    "sharedByRole" TEXT NOT NULL,
    "targetClientId" TEXT REFERENCES public.customers(id) ON DELETE CASCADE,
    "targetClientName" TEXT NOT NULL,
    "targetPhone" TEXT NOT NULL,
    "designsCount" INT DEFAULT 1,
    "designIds" JSONB DEFAULT '[]'::jsonb,
    "designNames" JSONB DEFAULT '[]'::jsonb,
    timestamp TEXT NOT NULL,
    channel TEXT DEFAULT 'WhatsApp',
    "wasViewed" BOOLEAN DEFAULT false,
    "viewCount" INT DEFAULT 0,
    "wasOrdered" BOOLEAN DEFAULT false,
    "orderId" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MANUFACTURERS TABLE
CREATE TABLE IF NOT EXISTS public.manufacturers (
    id TEXT PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "hubLocation" TEXT NOT NULL,
    "estYear" INT,
    "primarySpecialization" TEXT,
    "monthlyCapacityPairs" INT,
    "runningBatchesCount" INT DEFAULT 0,
    "onTimeDeliveryRate" NUMERIC DEFAULT 95,
    "qcPassRatio" NUMERIC DEFAULT 98,
    "generalManager" TEXT,
    phone TEXT,
    "loadPercentage" INT DEFAULT 50,
    status TEXT DEFAULT 'Active Plants',
    "toolingLeadTimeDays" INT DEFAULT 5,
    "activeOrdersList" JSONB DEFAULT '[]'::jsonb,
    "moldsActiveCount" INT DEFAULT 12,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SALES TEAM TABLE
CREATE TABLE IF NOT EXISTS public.sales_team (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    photo TEXT,
    zone TEXT,
    cluster TEXT,
    phone TEXT,
    email TEXT,
    "empId" TEXT,
    "monthlyTarget" NUMERIC,
    "bookedThisMonth" NUMERIC,
    "commissionRate" NUMERIC,
    "commissionAccrued" NUMERIC,
    "collectionDue" NUMERIC,
    "assignedAccountsCount" INT,
    "todayVisitsDone" INT DEFAULT 0,
    "todayVisitsTotal" INT DEFAULT 0,
    "chequesTodayAmount" NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'In Market',
    "assignedKit" TEXT,
    "kitVerifiedDate" TEXT,
    "tasksChecklist" JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
