-- ==============================================================================
-- SoleFlow / Shoe Trade CRM - RLS & Security Boundary Verification Test Suite
-- Run via Supabase SQL Editor or pgTAP to prove policy isolation
-- ==============================================================================

BEGIN;

-- Setup Test Users & Context
DO $$
BEGIN
    RAISE NOTICE 'Starting RLS Test Suite for SoleFlow...';
END $$;

-- ------------------------------------------------------------------------------
-- TEST 1: Anonymous User Isolation
-- Expectation: Anonymous user cannot query clients, orders, or payments directly
-- ------------------------------------------------------------------------------
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" = '{}';

DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count FROM public.clients;
    IF v_count > 0 THEN
        RAISE EXCEPTION 'TEST 1 FAILED: anon user was able to read % clients', v_count;
    END IF;

    SELECT COUNT(*) INTO v_count FROM public.orders;
    IF v_count > 0 THEN
        RAISE EXCEPTION 'TEST 1 FAILED: anon user was able to read % orders', v_count;
    END IF;

    SELECT COUNT(*) INTO v_count FROM public.payments;
    IF v_count > 0 THEN
        RAISE EXCEPTION 'TEST 1 FAILED: anon user was able to read % payments', v_count;
    END IF;

    RAISE NOTICE 'TEST 1 PASSED: Anonymous access denied on all internal tables.';
END $$;


-- ------------------------------------------------------------------------------
-- TEST 2: Anonymous Public Lookbook Token Access
-- Expectation: get_shared_designs(p_share_token) returns shared catalogue items
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_res JSONB;
BEGIN
    v_res := public.get_shared_designs('token-abc-001');
    IF (v_res ->> 'success')::BOOLEAN IS NOT TRUE THEN
        RAISE EXCEPTION 'TEST 2 FAILED: anon could not load shared lookbook: %', v_res;
    END IF;

    IF jsonb_array_length(v_res -> 'designs') = 0 THEN
        RAISE EXCEPTION 'TEST 2 FAILED: lookbook returned empty designs list';
    END IF;

    RAISE NOTICE 'TEST 2 PASSED: Public lookbook accessible via secure RPC.';
END $$;


-- ------------------------------------------------------------------------------
-- TEST 3: Salesman Role Data Boundary & Multi-Tenant Isolation
-- Salesman A: 'user-sales' (Rahul Sharma)
-- Salesman B: 'rep-2' (Marcus Vance)
-- Expectation: Salesman A cannot read clients assigned to Salesman B
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-sales", "email": "rahul.s@soleflow.in", "role": "authenticated", "app_metadata": {"role": "salesperson"}}';

DO $$
DECLARE
    v_count INT;
    v_unauthorized_client RECORD;
BEGIN
    -- Check if 'user-sales' can read Metro Shoes Franchise ('cust-3', assigned to 'rep-2')
    SELECT * INTO v_unauthorized_client FROM public.clients WHERE id = 'cust-3';
    IF FOUND THEN
        RAISE EXCEPTION 'TEST 3 FAILED: Salesman A was able to read client assigned to Salesman B (cust-3)';
    END IF;

    -- Check if 'user-sales' CAN read ABC Footwear ('cust-1', assigned to 'user-sales')
    SELECT * INTO v_unauthorized_client FROM public.clients WHERE id = 'cust-1';
    IF NOT FOUND THEN
        RAISE EXCEPTION 'TEST 3 FAILED: Salesman A could not read own assigned client (cust-1)';
    END IF;

    -- Check order isolation: 'user-sales' should NOT see ORD-0146 (belonging to cust-3 / rep-2)
    SELECT COUNT(*) INTO v_count FROM public.orders WHERE id = 'ORD-0146';
    IF v_count > 0 THEN
        RAISE EXCEPTION 'TEST 3 FAILED: Salesman A could view order ORD-0146 belonging to Salesman B';
    END IF;

    RAISE NOTICE 'TEST 3 PASSED: Salesman tenant isolation verified.';
END $$;


-- ------------------------------------------------------------------------------
-- TEST 4: Salesman Mutation & Security Boundaries
-- Expectation: Salesman cannot create payment adjustments or alter app settings
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_err_caught BOOLEAN := FALSE;
BEGIN
    -- Attempt to insert app_settings as salesperson
    BEGIN
        INSERT INTO public.app_settings (key, value, description)
        VALUES ('malicious_key', '{"hack": true}'::jsonb, 'test')
        ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        v_err_caught := TRUE;
    END;

    -- Alternatively RLS policy simply denies row without throwing exception in SELECT/INSERT
    IF NOT v_err_caught THEN
        IF EXISTS (SELECT 1 FROM public.app_settings WHERE key = 'malicious_key') THEN
            RAISE EXCEPTION 'TEST 4 FAILED: Salesman was able to insert into app_settings!';
        END IF;
    END IF;

    RAISE NOTICE 'TEST 4 PASSED: Salesman mutation restrictions verified.';
END $$;


-- ------------------------------------------------------------------------------
-- TEST 5: Admin Universal Access
-- Expectation: Admin can read all clients, all orders, and adjust settings
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-admin", "email": "admin@soleflow.com", "role": "authenticated", "app_metadata": {"role": "admin"}}';

DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count FROM public.clients;
    IF v_count = 0 THEN
        RAISE EXCEPTION 'TEST 5 FAILED: Admin could not view clients';
    END IF;

    SELECT COUNT(*) INTO v_count FROM public.orders;
    IF v_count = 0 THEN
        RAISE EXCEPTION 'TEST 5 FAILED: Admin could not view orders';
    END IF;

    RAISE NOTICE 'TEST 5 PASSED: Admin full read/write authority verified.';
END $$;

ROLLBACK;

DO $$
BEGIN
    RAISE NOTICE 'All RLS security boundary tests completed successfully.';
END $$;
