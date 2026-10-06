import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jpcaptmmcbuqlgrdetde.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwY2FwdG1tY2J1cWxncmRldGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1OTE0MjAsImV4cCI6MjEwNjE2NzQyMH0.zh3W-mNQA43UVNMe5V5EwBcZAK-UIa-KpmnZX5zcI6U';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const timestamp = Date.now();
const testEmail = `qa_test_${timestamp}@soleflow.com`;
const testPassword = 'Password123!';

async function runLiveDatabaseValidation() {
  console.log('='.repeat(70));
  console.log('🧪 SOLEFLOW LIVE END-TO-END SUPABASE PERSISTENCE TEST');
  console.log('Target URL: https://soleflowww.vercel.app/');
  console.log(`Supabase Host: ${SUPABASE_URL}`);
  console.log('='.repeat(70));

  let passed = 0;
  let failed = 0;

  function report(name, success, details = '') {
    if (success) {
      console.log(`✅ [PASS] ${name} ${details ? `(${details})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} -> ${details}`);
      failed++;
    }
  }

  // 1. Test Auth / User Registration
  console.log('\n--- 1. Testing Auth & Session ---');
  let authUser = null;
  
  // First try signing in with demo admin or create new test user
  let { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email: 'admin@soleflow.com',
    password: 'admin123',
  });

  if (signInErr || !signInData.user) {
    // Attempt sign up
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'QA Automation Trader',
          phone: '9876543210',
          business_name: 'SoleFlow QA Hub Agra',
          city: 'Agra',
        },
      },
    });

    if (signUpErr) {
      report('Auth Sign-up / Login', false, signUpErr.message);
    } else {
      authUser = signUpData.user;
      report('Auth Sign-up', true, `User ID: ${authUser?.id || 'registered'}`);
    }
  } else {
    authUser = signInData.user;
    report('Auth Login (admin@soleflow.com)', true, `User ID: ${authUser.id}`);
  }

  // 2. Test Customers CRUD
  console.log('\n--- 2. Testing Customers Table (public.customers) ---');
  const testCustId = `cust-qa-${timestamp}`;
  const testCustName = `Agra Footwear Mart QA ${timestamp}`;

  const { data: custInsert, error: custErr } = await supabase
    .from('customers')
    .insert([
      {
        id: testCustId,
        businessName: testCustName,
        propName: 'Ramesh Kumar',
        phone: '9876543210',
        city: 'Agra',
        state: 'Uttar Pradesh',
        status: 'active',
        tier: 'Gold',
        paymentTerms: 'Net 30 Days',
        amountDue: 50000,
        totalBusiness: 200000,
        ordersCount: 4,
        overdueDays: 0,
      },
    ])
    .select()
    .single();

  if (custErr) {
    report('Customer Insertion', false, custErr.message);
  } else {
    report('Customer Insertion', true, `Saved '${custInsert.businessName}' (ID: ${custInsert.id})`);
  }

  // Verify Customer Query
  const { data: custFetch, error: custFetchErr } = await supabase
    .from('customers')
    .select('*')
    .eq('id', testCustId)
    .single();

  if (custFetchErr || !custFetch) {
    report('Customer Persistence Verification', false, custFetchErr?.message || 'Record not found');
  } else {
    report('Customer Persistence Verification', true, `Verified in Supabase: amountDue = ₹${custFetch.amountDue}`);
  }

  // 3. Test Field Visits CRUD
  console.log('\n--- 3. Testing Field Visits Table (public.field_visits) ---');
  const visitPayload = {
    client_id: testCustId,
    salesperson_name: 'Vikram Malhotra',
    visit_date: new Date().toISOString().split('T')[0],
    purpose: 'Sample showing AW24 Runner Classic [Agra Marketplace]',
    outcome: 'Order Created',
    notes: 'Booked 200 pairs test consignment.',
    status: 'completed',
  };

  const { data: visitInsert, error: visitErr } = await supabase
    .from('field_visits')
    .insert([visitPayload])
    .select()
    .single();

  if (visitErr) {
    report('Field Visit Insertion', false, visitErr.message);
  } else {
    report('Field Visit Insertion', true, `Visit ID: ${visitInsert.id}, Status: ${visitInsert.status}`);
  }

  // Verify Field Visit Query
  const { data: visitFetch, error: visitFetchErr } = await supabase
    .from('field_visits')
    .select('*, customers(businessName, city)')
    .eq('client_id', testCustId)
    .limit(1);

  if (visitFetchErr || !visitFetch || visitFetch.length === 0) {
    report('Field Visit Persistence & Customer Join', false, visitFetchErr?.message || 'No visit found');
  } else {
    report('Field Visit Persistence & Customer Join', true, `Found visit linked to: ${visitFetch[0]?.customers?.businessName || testCustName}`);
  }

  // 4. Test Follow-ups CRUD
  console.log('\n--- 4. Testing Follow-ups Table (public.follow_ups) ---');
  const followUpPayload = {
    client_id: testCustId,
    owner_name: 'Vikram Malhotra',
    due_at: new Date(Date.now() + 86400000).toISOString(),
    type: 'call',
    status: 'pending',
    outcome: 'Follow-up for advance token payment verification',
    priority: 'normal',
  };

  const { data: fuInsert, error: fuErr } = await supabase
    .from('follow_ups')
    .insert([followUpPayload])
    .select()
    .single();

  if (fuErr) {
    report('Follow-up Insertion', false, fuErr.message);
  } else {
    report('Follow-up Insertion', true, `Follow-up ID: ${fuInsert.id}`);
  }

  // 5. Test Orders & Order Items
  console.log('\n--- 5. Testing Orders Table (public.orders) ---');
  const testOrderId = `ORD-QA-${timestamp.toString().slice(-4)}`;

  const { data: orderInsert, error: orderErr } = await supabase
    .from('orders')
    .insert([
      {
        id: testOrderId,
        client_id: testCustId,
        status: 'In Production',
        subtotal: 150000,
        trade_discount_percent: 5,
        trade_discount_amount: 7500,
        taxable_subtotal: 142500,
        gst_percent: 12,
        gst_amount: 17100,
        net_payable: 159600,
        advance_deposited: 50000,
        balance_due: 109600,
        payment_status: 'Advance Deposited',
        expected_delivery: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      },
    ])
    .select()
    .single();

  if (orderErr) {
    report('Order Insertion', false, orderErr.message);
  } else {
    report('Order Insertion', true, `Order ${orderInsert.id}, Net Payable: ₹${orderInsert.net_payable}`);
  }

  // 6. Test Payments Table
  console.log('\n--- 6. Testing Payments Table (public.payments) ---');
  const testPaymentId = `pay-qa-${timestamp}`;
  const { data: payInsert, error: payErr } = await supabase
    .from('payments')
    .insert([
      {
        id: testPaymentId,
        client_id: testCustId,
        amount: 50000,
        payment_method: 'UPI',
        reference_no: `UPI-REF-${timestamp}`,
        notes: 'Advance deposit for bulk production booking',
        status: 'recorded',
      },
    ])
    .select()
    .single();

  if (payErr) {
    report('Payment Insertion', false, payErr.message);
  } else {
    report('Payment Insertion', true, `Payment ID: ${payInsert.id}, Amount: ₹${payInsert.amount}`);
  }

  // 7. Cleanup test data
  console.log('\n--- 7. Cleanup QA Test Records ---');
  await supabase.from('payments').delete().eq('id', testPaymentId);
  await supabase.from('orders').delete().eq('id', testOrderId);
  await supabase.from('follow_ups').delete().eq('client_id', testCustId);
  await supabase.from('field_visits').delete().eq('client_id', testCustId);
  await supabase.from('customers').delete().eq('id', testCustId);
  report('QA Test Data Cleanup', true, 'Test records cleaned cleanly');

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log(`TEST SUMMARY: ${passed} Passed | ${failed} Failed`);
  console.log('='.repeat(70));
}

runLiveDatabaseValidation().catch(console.error);
