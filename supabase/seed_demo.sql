-- ==============================================================================
-- DEMO SEED DATA — FENCED MULTI-TENANT DEMO ORGANIZATIONS
-- Creates sample demo organizations and marks is_demo = true.
-- ==============================================================================

DO $$
DECLARE
    v_demo_org1 UUID;
    v_demo_org2 UUID;
BEGIN
    -- 1. Demo Business 1: Demo Footwear Traders
    SELECT id INTO v_demo_org1 FROM public.organizations WHERE name = 'Demo Footwear Traders' LIMIT 1;
    IF v_demo_org1 IS NULL THEN
        INSERT INTO public.organizations (name, phone, city, state, gstin, is_demo, status)
        VALUES ('Demo Footwear Traders', '+91 98765 43210', 'Agra', 'Uttar Pradesh', '09DEMO0000A1Z1', true, 'active')
        RETURNING id INTO v_demo_org1;
    ELSE
        UPDATE public.organizations SET is_demo = true WHERE id = v_demo_org1;
    END IF;

    -- 2. Demo Business 2: Demo Shoe Mart
    SELECT id INTO v_demo_org2 FROM public.organizations WHERE name = 'Demo Shoe Mart' LIMIT 1;
    IF v_demo_org2 IS NULL THEN
        INSERT INTO public.organizations (name, phone, city, state, gstin, is_demo, status)
        VALUES ('Demo Shoe Mart', '+91 98765 12345', 'Kanpur', 'Uttar Pradesh', '09DEMO0000A1Z2', true, 'active')
        RETURNING id INTO v_demo_org2;
    ELSE
        UPDATE public.organizations SET is_demo = true WHERE id = v_demo_org2;
    END IF;

    -- Seed sample demo designs for Demo Footwear Traders if empty
    IF NOT EXISTS (SELECT 1 FROM public.designs WHERE org_id = v_demo_org1) THEN
        INSERT INTO public.designs (id, org_id, "articleCode", name, category, price, "moqPairs", "moqCartons", sizes, colors, status, image, "soleType", "upperMaterial")
        VALUES 
            ('DES-DEMO-01', v_demo_org1, 'ART-DEMO-101', 'Air Glide Runner', 'Sneakers', 580, 120, 10, '[7,8,9,10]'::jsonb, '["Black","Navy"]'::jsonb, 'Available', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'Phylon', 'Mesh'),
            ('DES-DEMO-02', v_demo_org1, 'ART-DEMO-102', 'Classic Formal Derby', 'Formal', 750, 60, 5, '[7,8,9,10,11]'::jsonb, '["Tan","Black"]'::jsonb, 'Available', 'https://images.unsplash.com/photo-1614252369475-531eba835eb1', 'TPR', 'Synthetic Leather');
    END IF;

    -- Seed sample demo customer for Demo Footwear Traders
    IF NOT EXISTS (SELECT 1 FROM public.customers WHERE org_id = v_demo_org1) THEN
        INSERT INTO public.customers (id, org_id, "businessName", "propName", phone, city, state, "paymentTerms", "creditLimit", "totalBusiness", "totalPaid", "amountDue")
        VALUES 
            ('CLI-DEMO-01', v_demo_org1, 'Agra Retail Hub', 'Rajesh Sharma', '+91 98111 22233', 'Agra', 'Uttar Pradesh', '30% Advance + 70% Bilty', 500000, 150000, 100000, 50000);
    END IF;

END $$;
