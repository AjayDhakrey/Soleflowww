import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://jpcaptmmcbuqlgrdetde.supabase.co';
const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const supabase = createClient(rawUrl, apiKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TEST_PREFIX = '__AUDIT_TEST__';
const RUN_ID = Math.floor(1000 + Math.random() * 9000);

test.describe('Database Round-Trip Integration Suite', () => {
  let createdClientId: string;
  let createdDesignId: string;
  let createdOrderId: string;
  let createdPaymentId: string;
  let shareToken: string;

  test('Test A: Client Lifecycle (Create, Assign, Update)', async () => {
    // 1. Create client
    const { data: client, error: clientErr } = await supabase.rpc('create_client', {
      p_business_name: `${TEST_PREFIX} E2E Client ${RUN_ID}`,
      p_prop_name: 'E2E Proprietor',
      p_phone: `99111${RUN_ID}`,
      p_whatsapp: `99111${RUN_ID}`,
      p_email: `e2e_${RUN_ID}@soleflow.test`,
      p_city: 'Agra',
      p_state: 'Uttar Pradesh',
      p_cluster: 'Sanjay Place',
      p_address: 'B-14 Commercial Complex',
      p_gstin: `07BBBBB${RUN_ID}B1Z5`,
      p_credit_limit: 300000,
      p_payment_terms: '30 Days Net',
      p_notes: `${TEST_PREFIX} Playwright E2E`,
    });
    expect(clientErr).toBeNull();
    expect(client?.id).toBeTruthy();
    createdClientId = client.id;

    // 2. Assign Salesman
    const { data: assignRes, error: assignErr } = await supabase.rpc('assign_salesman', {
      p_client_id: createdClientId,
      p_salesman_id: 'sales-1',
    });
    expect(assignErr).toBeNull();
    expect(assignRes === true || assignRes?.success).toBeTruthy();

    // 3. Update credit limit
    const { error: updateErr } = await supabase
      .from('customers')
      .update({ "creditLimit": 400000 })
      .eq('id', createdClientId);
    expect(updateErr).toBeNull();
  });

  test('Test B: Design Lifecycle (Create, Share, Retrieve)', async () => {
    // 1. Create design
    const designCode = `SF-E2E-${RUN_ID}`;
    const { data: design, error: designErr } = await supabase.rpc('create_design', {
      p_article_code: designCode,
      p_name: `${TEST_PREFIX} Oxford Classic ${RUN_ID}`,
      p_category: 'Formal Derby & Oxford',
      p_price: 1650,
      p_moq_pairs: 24,
      p_moq_cartons: 2,
      p_sizes: [7, 8, 9, 10],
      p_colors: ['Black', 'Brown'],
      p_upper_material: 'Italian Crust Leather',
      p_sole_type: 'Handcrafted Sheet Sole',
      p_subline: 'Heritage Collection',
      p_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    });
    expect(designErr).toBeNull();
    expect(design?.id).toBeTruthy();
    createdDesignId = design.id;

    // 2. Share designs
    const { data: shareRes, error: shareErr } = await supabase.rpc('share_designs', {
      p_design_ids: [createdDesignId],
      p_client_ids: [createdClientId],
      p_channel: 'WhatsApp',
    });
    expect(shareErr).toBeNull();
    const shareObj = Array.isArray(shareRes) ? shareRes[0] : shareRes;
    shareToken = shareObj?.token || shareObj?.share_token;
    expect(shareToken).toBeTruthy();

    // 3. Retrieve shared designs
    const { data: sharedItems, error: getErr } = await supabase.rpc('get_shared_designs', {
      p_share_token: shareToken,
    });
    expect(getErr).toBeNull();
    expect(sharedItems && (sharedItems.designs || Array.isArray(sharedItems))).toBeTruthy();
  });

  test('Test C: Order Lifecycle (Draft, Discount, Advance Status)', async () => {
    // 1. Create Draft
    const { data: orderDraft, error: draftErr } = await supabase.rpc('create_order_draft', {
      p_client_id: createdClientId,
      p_items: [
        {
          designId: createdDesignId,
          qtyPairs: 24,
          cartons: 2,
          rate: 1650,
          discount: 0,
          sizeMatrix: [{ size: 8, pairs: 24, cartons: 2, loose: 0 }],
        },
      ],
      p_trade_discount_percent: 5,
      p_gst_percent: 12,
      p_advance_deposited: 10000,
      p_expected_delivery: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
      p_notes: `${TEST_PREFIX} E2E order draft`,
    });
    expect(draftErr).toBeNull();
    expect(orderDraft?.id).toBeTruthy();
    createdOrderId = orderDraft.id;

    // 2. Request Discount
    const { data: discount, error: discErr } = await supabase.rpc('request_discount', {
      p_order_id: createdOrderId,
      p_requested_percent: 10,
      p_reason: `${TEST_PREFIX} E2E bulk discount request`,
    });
    expect(discErr).toBeNull();
    expect(discount?.id).toBeTruthy();

    // 3. Approve Discount
    const { data: approveRes, error: appErr } = await supabase.rpc('approve_discount_request', {
      p_request_id: discount.id,
      p_approved_percent: 8.5,
      p_note: `${TEST_PREFIX} E2E approved 8.5%`,
    });
    expect(appErr).toBeNull();
    expect(approveRes?.status).toBe('approved');

    // 4. Advance through lifecycle
    for (const status of ['In Production', 'Ready', 'Dispatched', 'Delivered']) {
      const { data: advRes, error: advErr } = await supabase.rpc('advance_order_status', {
        p_order_id: createdOrderId,
        p_to_status: status,
        p_note: `${TEST_PREFIX} Status advanced to ${status}`,
      });
      expect(advErr).toBeNull();
      expect(advRes?.toStatus).toBe(status);
    }
  });

  test('Test D: Payment Lifecycle (Cheque, Bounce, RTGS, Verify)', async () => {
    // 1. Record cheque payment
    const chequeNo = `CHQ-E2E-${RUN_ID}`;
    const { data: payRes, error: payErr } = await supabase.rpc('record_payment', {
      p_client_id: createdClientId,
      p_amount: 15000,
      p_method: 'Cheque',
      p_reference: chequeNo,
      p_payment_date: new Date().toISOString(),
      p_allocations: [{ orderId: createdOrderId, amount: 15000 }],
      p_notes: `${TEST_PREFIX} E2E cheque`,
      p_cheque_no: chequeNo,
      p_cheque_bank: 'ICICI Bank',
      p_cheque_date: new Date().toISOString().slice(0, 10),
    });
    expect(payErr).toBeNull();
    expect(payRes?.id).toBeTruthy();
    createdPaymentId = payRes.id;

    // 2. Bounce cheque
    const { data: bounceRes, error: bncErr } = await supabase.rpc('bounce_cheque', {
      p_payment_id: createdPaymentId,
      p_reason: `${TEST_PREFIX} E2E cheque bounced`,
    });
    expect(bncErr).toBeNull();
    expect(bounceRes?.id || bounceRes?.success || bounceRes?.status === 'bounced').toBeTruthy();

    // 3. Record RTGS replacement
    const { data: rtgsRes, error: rtgsErr } = await supabase.rpc('record_payment', {
      p_client_id: createdClientId,
      p_amount: 25000,
      p_method: 'NEFT/RTGS',
      p_reference: `UTR-E2E-${RUN_ID}`,
      p_payment_date: new Date().toISOString(),
      p_allocations: [{ orderId: createdOrderId, amount: 25000 }],
      p_notes: `${TEST_PREFIX} E2E RTGS`,
    });
    expect(rtgsErr).toBeNull();
    expect(rtgsRes?.id).toBeTruthy();

    // 4. Verify payment
    const { data: verRes, error: verErr } = await supabase.rpc('verify_payment', {
      p_payment_id: rtgsRes.id,
    });
    expect(verErr).toBeNull();
    expect(verRes?.status === 'verified' || verRes?.id === rtgsRes.id).toBeTruthy();
  });

  test('Test E: Financials Views Consistency & Client Archive', async () => {
    const { data: orderFin, error: orderFinErr } = await supabase
      .from('v_order_financials')
      .select('*')
      .eq('order_id', createdOrderId)
      .maybeSingle();
    expect(orderFinErr).toBeNull();
    expect(orderFin?.order_id).toBe(createdOrderId);

    const { data: clientFin, error: clientFinErr } = await supabase
      .from('v_client_financials')
      .select('*')
      .eq('client_id', createdClientId)
      .maybeSingle();
    expect(clientFinErr).toBeNull();
    expect(clientFin?.client_id).toBe(createdClientId);

    // Archive client
    const { data: archiveRes, error: archiveErr } = await supabase.rpc('archive_client', {
      p_client_id: createdClientId,
      p_reason: `${TEST_PREFIX} E2E archive`,
    });
    expect(archiveErr).toBeNull();
    expect(archiveRes === true || archiveRes?.success).toBeTruthy();
  });

  test('Test F: Global Search RPC', async () => {
    const { data: searchRes, error: searchErr } = await supabase.rpc('global_search', {
      q: TEST_PREFIX,
    });
    expect(searchErr).toBeNull();
    const totalMatches = (searchRes?.clients?.length || 0) + 
                         (searchRes?.orders?.length || 0) + 
                         (searchRes?.designs?.length || 0) + 
                         (searchRes?.payments?.length || 0);
    expect(totalMatches).toBeGreaterThan(0);
  });

  test.afterAll(async () => {
    // Purge test records
    if (createdOrderId) {
      await supabase.from('payment_allocations').delete().eq('order_id', createdOrderId);
      await supabase.from('discount_requests').delete().eq('order_id', createdOrderId);
      await supabase.from('order_status_history').delete().eq('order_id', createdOrderId);
      await supabase.from('order_items').delete().eq('order_id', createdOrderId);
      await supabase.from('orders').delete().eq('id', createdOrderId);
    }
    if (createdPaymentId) {
      await supabase.from('payment_allocations').delete().eq('payment_id', createdPaymentId);
      await supabase.from('payments').delete().eq('id', createdPaymentId);
    }
    await supabase.from('payments').delete().like('notes', `%${TEST_PREFIX}%`);
    if (shareToken) {
      await supabase.from('design_share_items').delete().like('share_id', 'SHR-%');
      await supabase.from('design_shares').delete().eq('token', shareToken);
    }
    if (createdDesignId) {
      await supabase.from('designs').delete().eq('id', createdDesignId);
    }
    if (createdClientId) {
      await supabase.from('activity_events').delete().eq('record_id', createdClientId);
      await supabase.from('client_notes').delete().eq('client_id', createdClientId);
      await supabase.from('customers').delete().eq('id', createdClientId);
    }
  });
});
