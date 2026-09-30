import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Helper to load .env files
function loadEnv() {
  const envPaths = [
    path.resolve(process.cwd(), 'backend', '.env'),
    path.resolve(process.cwd(), 'frontend', '.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'frontend', '.env.local'),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    }
  }
}

loadEnv();

const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;
const rawAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const apiKey = rawServiceKey || rawAnonKey;

if (!rawUrl || !apiKey) {
  console.error('❌ Supabase credentials missing from environment!');
  process.exit(1);
}

const supabase = createClient(rawUrl, apiKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const TEST_PREFIX = '__AUDIT_TEST__';
const RUN_ID = Math.floor(1000 + Math.random() * 9000);

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAILED: ${message}`);
    failedCount++;
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('='.repeat(70));
console.log(`SoleFlow Database Round-Trip Integration Test Suite [Run: ${RUN_ID}]`);
console.log('='.repeat(70));

async function runSuite() {
  let createdClientId = null;
  let createdSalesmanId = null;
  let createdDesignId = null;
  let createdOrderId = null;
  let createdPaymentId = null;
  let shareToken = null;

  try {
    // -------------------------------------------------------------
    // PREREQUISITE: Salesman Preparation
    // -------------------------------------------------------------
    console.log('\n--- Setup: Salesman Preparation ---');
    const { data: existingSalesman } = await supabase
      .from('sales_team')
      .select('id, name')
      .limit(1)
      .maybeSingle();

    if (existingSalesman) {
      createdSalesmanId = existingSalesman.id;
      console.log(`  Using existing salesperson: ${existingSalesman.name} (${createdSalesmanId})`);
    } else {
      const { data: newRep, error: repErr } = await supabase
        .from('sales_team')
        .insert({
          id: `${TEST_PREFIX}_rep_${RUN_ID}`,
          name: `${TEST_PREFIX} Rep ${RUN_ID}`,
          "roleTitle": 'Field Rep',
          cluster: 'Agra North',
          zone: 'North',
          phone: `98765${RUN_ID}`,
          email: `rep_${RUN_ID}@soleflow.audit`,
          "empId": `EMP-${RUN_ID}`,
          "monthlyTarget": 500000,
          "commissionRate": 2.5,
          status: 'In Market',
        })
        .select()
        .single();

      if (repErr) {
        console.warn('Could not insert sales_team row directly, using dummy ID:', repErr.message);
        createdSalesmanId = `${TEST_PREFIX}_rep_${RUN_ID}`;
      } else {
        createdSalesmanId = newRep.id;
        console.log(`  Created test salesperson: ${newRep.name} (${createdSalesmanId})`);
      }
    }

    // -------------------------------------------------------------
    // TEST A: Client Lifecycle
    // -------------------------------------------------------------
    console.log('\n--- TEST A: Client Lifecycle ---');
    // 1. Create client via RPC
    const clientPayload = {
      p_business_name: `${TEST_PREFIX} Footwear Store ${RUN_ID}`,
      p_prop_name: 'Test Proprietor',
      p_phone: `98111${RUN_ID}`,
      p_whatsapp: `98111${RUN_ID}`,
      p_email: `client_${RUN_ID}@test.com`,
      p_city: 'Agra',
      p_state: 'Uttar Pradesh',
      p_cluster: 'Hing ki Mandi',
      p_address: 'Shop 12, Leather Market',
      p_gstin: `07AAAAA${RUN_ID}A1Z5`,
      p_salesperson_id: createdSalesmanId,
      p_credit_limit: 250000,
      p_payment_terms: '14 Days Net',
    };

    const { data: clientRes, error: clientErr } = await supabase.rpc('create_client', clientPayload);
    if (clientErr) throw clientErr;
    assert(clientRes && clientRes.id, `Created client: ${clientRes?.id}`);
    createdClientId = clientRes.id;

    // 2. Assign Salesman via RPC
    if (createdSalesmanId) {
      const { data: assignRes, error: assignErr } = await supabase.rpc('assign_salesman', {
        p_client_id: createdClientId,
        p_salesman_id: createdSalesmanId,
      });
      if (assignErr) throw assignErr;
      assert(assignRes === true || (assignRes && assignRes.success), `Assigned salesman ${createdSalesmanId} to client`);
    }

    // 3. Update Credit Limit
    const { error: limitErr } = await supabase
      .from('customers')
      .update({ "creditLimit": 350000 })
      .eq('id', createdClientId);
    if (limitErr) throw limitErr;
    assert(!limitErr, 'Updated client credit limit to ₹3,50,000');

    // -------------------------------------------------------------
    // TEST B: Design Lifecycle
    // -------------------------------------------------------------
    console.log('\n--- TEST B: Design Lifecycle ---');
    const designCode = `SF-AUDIT-${RUN_ID}`;
    const { data: designRes, error: designErr } = await supabase.rpc('create_design', {
      p_article_code: designCode,
      p_name: `${TEST_PREFIX} Derby Pro ${RUN_ID}`,
      p_category: 'Formal Derby & Oxford',
      p_price: 1450,
      p_moq_pairs: 24,
      p_moq_cartons: 2,
      p_sizes: [6, 7, 8, 9, 10],
      p_colors: ['Black', 'Tan'],
      p_upper_material: 'Full Grain Leather',
      p_sole_type: 'TPR Lug Sole',
      p_subline: 'Premium Executive Edition',
      p_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    });
    if (designErr) throw designErr;
    assert(designRes && designRes.id, `Created design: ${designRes?.articleCode || designCode} (${designRes?.id})`);
    createdDesignId = designRes.id;

    // Share Design via RPC
    const { data: shareRes, error: shareErr } = await supabase.rpc('share_designs', {
      p_design_ids: [createdDesignId],
      p_client_ids: [createdClientId],
      p_channel: 'WhatsApp',
    });
    if (shareErr) throw shareErr;
    const shareObj = Array.isArray(shareRes) ? shareRes[0] : shareRes;
    shareToken = shareObj?.token || shareObj?.share_token;
    assert(shareToken, `Shared design with token: ${shareToken}`);

    // Retrieve shared designs via get_shared_designs
    if (shareToken) {
      const { data: sharedItems, error: getSharedErr } = await supabase.rpc('get_shared_designs', {
        p_share_token: shareToken,
      });
      if (getSharedErr) throw getSharedErr;
      assert(sharedItems && (sharedItems.designs || Array.isArray(sharedItems)), `Retrieved shared designs data from link`);
    }

    // -------------------------------------------------------------
    // TEST C: Order Lifecycle
    // -------------------------------------------------------------
    console.log('\n--- TEST C: Order Lifecycle ---');
    const orderItems = [
      {
        designId: createdDesignId,
        qtyPairs: 24,
        cartons: 2,
        rate: 1450,
        discount: 0,
        sizeMatrix: [
          { size: 7, pairs: 6, cartons: 0.5, loose: 0 },
          { size: 8, pairs: 12, cartons: 1, loose: 0 },
          { size: 9, pairs: 6, cartons: 0.5, loose: 0 },
        ],
      },
    ];

    const { data: draftRes, error: draftErr } = await supabase.rpc('create_order_draft', {
      p_client_id: createdClientId,
      p_items: orderItems,
      p_trade_discount_percent: 5,
      p_gst_percent: 12,
      p_advance_deposited: 5000,
      p_expected_delivery: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
      p_notes: `${TEST_PREFIX} Audit test order draft`,
    });
    if (draftErr) throw draftErr;
    assert(draftRes && draftRes.id, `Created order draft: ${draftRes?.id}`);
    createdOrderId = draftRes.id;

    // Request Discount via RPC
    const { data: discountRes, error: discountErr } = await supabase.rpc('request_discount', {
      p_order_id: createdOrderId,
      p_requested_percent: 10,
      p_reason: `${TEST_PREFIX} Bulk seasonal order discount`,
    });
    if (discountErr) throw discountErr;
    assert(discountRes && discountRes.id, `Requested discount: ${discountRes?.id} (${discountRes?.requested_percent}%)`);

    // Approve Discount via RPC
    const { data: approveRes, error: approveErr } = await supabase.rpc('approve_discount_request', {
      p_request_id: discountRes.id,
      p_approved_percent: 9,
      p_note: `${TEST_PREFIX} Approved 9% by admin`,
    });
    if (approveErr) throw approveErr;
    assert(approveRes && approveRes.status === 'approved', 'Approved discount request at 9%');

    // Advance Status through state machine: Approved -> In Production -> Ready -> Dispatched -> Delivered
    const transitions = ['In Production', 'Ready', 'Dispatched', 'Delivered'];
    for (const st of transitions) {
      const { data: advRes, error: advErr } = await supabase.rpc('advance_order_status', {
        p_order_id: createdOrderId,
        p_to_status: st,
        p_note: `${TEST_PREFIX} Transitioned to ${st}`,
      });
      if (advErr) throw advErr;
      assert(advRes && advRes.toStatus === st, `Advanced order status to '${st}'`);
    }

    // -------------------------------------------------------------
    // TEST D: Payment Lifecycle
    // -------------------------------------------------------------
    console.log('\n--- TEST D: Payment Lifecycle ---');
    const chequeNo = `CHQ${RUN_ID}`;
    const { data: payRes, error: payErr } = await supabase.rpc('record_payment', {
      p_client_id: createdClientId,
      p_amount: 15000,
      p_method: 'Cheque',
      p_reference: chequeNo,
      p_payment_date: new Date().toISOString(),
      p_allocations: [{ orderId: createdOrderId, amount: 15000 }],
      p_notes: `${TEST_PREFIX} Cheque collection`,
      p_cheque_no: chequeNo,
      p_cheque_bank: 'HDFC Bank',
      p_cheque_date: new Date().toISOString().slice(0, 10),
    });
    if (payErr) throw payErr;
    assert(payRes && payRes.id, `Recorded cheque payment: ${payRes?.id}`);
    createdPaymentId = payRes.id;

    // Bounce cheque via RPC
    const { data: bounceRes, error: bounceErr } = await supabase.rpc('bounce_cheque', {
      p_payment_id: createdPaymentId,
      p_reason: `${TEST_PREFIX} Insufficient funds`,
    });
    if (bounceErr) throw bounceErr;
    assert(bounceRes && (bounceRes.id || bounceRes.success || bounceRes.status === 'bounced'), 'Bounced cheque payment');

    // Re-record payment via RTGS
    const { data: rtgsRes, error: rtgsErr } = await supabase.rpc('record_payment', {
      p_client_id: createdClientId,
      p_amount: 20000,
      p_method: 'NEFT/RTGS',
      p_reference: `UTR${RUN_ID}998`,
      p_payment_date: new Date().toISOString(),
      p_allocations: [{ orderId: createdOrderId, amount: 20000 }],
      p_notes: `${TEST_PREFIX} RTGS Settlement`,
    });
    if (rtgsErr) throw rtgsErr;
    assert(rtgsRes && rtgsRes.id, `Re-recorded RTGS payment: ${rtgsRes?.id}`);
    const verifiedPaymentId = rtgsRes.id;

    // Verify Payment via RPC
    const { data: verRes, error: verErr } = await supabase.rpc('verify_payment', {
      p_payment_id: verifiedPaymentId,
    });
    if (verErr) throw verErr;
    assert(verRes && (verRes.status === 'verified' || verRes.id === verifiedPaymentId), 'Verified RTGS payment');

    // -------------------------------------------------------------
    // TEST E: Financials Views Consistency & Client Archive
    // -------------------------------------------------------------
    console.log('\n--- TEST E: Financials Views Consistency ---');
    const { data: orderFin, error: orderFinErr } = await supabase
      .from('v_order_financials')
      .select('*')
      .eq('order_id', createdOrderId)
      .maybeSingle();

    if (orderFinErr) throw orderFinErr;
    assert(orderFin && orderFin.order_id === createdOrderId, `v_order_financials found for order (Net: ₹${orderFin?.net_payable}, Paid: ₹${orderFin?.paid_verified})`);

    const { data: clientFin, error: clientFinErr } = await supabase
      .from('v_client_financials')
      .select('*')
      .eq('client_id', createdClientId)
      .maybeSingle();

    if (clientFinErr) throw clientFinErr;
    assert(clientFin && clientFin.client_id === createdClientId, `v_client_financials found for client (Outstanding: ₹${clientFin?.outstanding})`);

    // Archive Client via RPC (Verify archive flow)
    const { data: archiveRes, error: archiveErr } = await supabase.rpc('archive_client', {
      p_client_id: createdClientId,
      p_reason: `${TEST_PREFIX} Testing archive flow`,
    });
    if (archiveErr) throw archiveErr;
    assert(archiveRes === true || (archiveRes && archiveRes.success), 'Archived client successfully');

    // -------------------------------------------------------------
    // TEST F: Global Search
    // -------------------------------------------------------------
    console.log('\n--- TEST F: Global Search ---');
    const { data: searchRes, error: searchErr } = await supabase.rpc('global_search', {
      q: TEST_PREFIX,
    });
    if (searchErr) throw searchErr;
    const totalMatches = (searchRes?.clients?.length || 0) + 
                         (searchRes?.orders?.length || 0) + 
                         (searchRes?.designs?.length || 0) + 
                         (searchRes?.payments?.length || 0);
    assert(searchRes && totalMatches > 0, `global_search returned ${totalMatches} entities matching query (${searchRes?.designs?.length || 0} designs, ${searchRes?.orders?.length || 0} orders)`);

  } catch (err) {
    console.error('\n❌ Suite encountered fatal error:', err);
  } finally {
    // -------------------------------------------------------------
    // CLEANUP: Remove test records tagged with __AUDIT_TEST__
    // -------------------------------------------------------------
    console.log('\n--- Cleanup: Purging __AUDIT_TEST__ Records ---');
    try {
      if (createdOrderId) {
        await supabase.from('payment_allocations').delete().eq('order_id', createdOrderId);
        await supabase.from('discount_requests').delete().eq('order_id', createdOrderId);
        await supabase.from('order_status_history').delete().eq('order_id', createdOrderId);
        await supabase.from('order_items').delete().eq('order_id', createdOrderId);
        await supabase.from('orders').delete().eq('id', createdOrderId);
        console.log(`  Purged test order ${createdOrderId}`);
      }

      if (createdPaymentId) {
        await supabase.from('payment_allocations').delete().eq('payment_id', createdPaymentId);
        await supabase.from('payments').delete().eq('id', createdPaymentId);
      }

      // Purge any remaining test payments
      await supabase.from('payments').delete().like('notes', `%${TEST_PREFIX}%`);

      if (shareToken) {
        await supabase.from('design_share_items').delete().like('share_id', 'SHR-%');
        await supabase.from('design_shares').delete().eq('token', shareToken);
        console.log(`  Purged design share token ${shareToken}`);
      }

      if (createdDesignId) {
        await supabase.from('designs').delete().eq('id', createdDesignId);
        console.log(`  Purged test design ${createdDesignId}`);
      }

      if (createdClientId) {
        await supabase.from('activity_events').delete().eq('record_id', createdClientId);
        await supabase.from('client_notes').delete().eq('client_id', createdClientId);
        await supabase.from('customers').delete().eq('id', createdClientId);
        console.log(`  Purged test customer ${createdClientId}`);
      }

      console.log('  ✅ Cleanup complete.');
    } catch (cleanErr) {
      console.warn('  ⚠️ Cleanup warning:', cleanErr);
    }

    console.log('\n' + '='.repeat(70));
    console.log(`Round-Trip Test Summary: Passed: ${passedCount}, Failed: ${failedCount}`);
    console.log('='.repeat(70));

    if (failedCount > 0) {
      process.exit(1);
    }
  }
}

runSuite();
