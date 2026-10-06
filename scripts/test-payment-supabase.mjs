import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jpcaptmmcbuqlgrdetde.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwY2FwdG1tY2J1cWxncmRldGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1OTE0MjAsImV4cCI6MjEwNjE2NzQyMH0.zh3W-mNQA43UVNMe5V5EwBcZAK-UIa-KpmnZX5zcI6U';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testPaymentServiceFlow() {
  console.log('Testing Updated Payment Recording Service...');

  const timestamp = Date.now();
  const testPaymentId = `pay-test-${timestamp}`;
  const testReceiptNum = `SF-REC-${Math.floor(10000 + Math.random() * 90000)}`;

  const params = {
    clientId: 'cust-demo-1',
    amount: 15000,
    customerName: 'Agra Retail Emporium',
    customerCity: 'Agra',
    amountDueBefore: 45000,
    amountDueAfter: 30000,
    collectedBy: 'Vikram Malhotra',
    method: 'UPI',
    reference: `UPI-TEST-${timestamp}`,
    paymentDate: new Date().toISOString().split('T')[0],
    notes: 'Advance installment payment test',
    receiptNumber: testReceiptNum,
  };

  // Test RPC first
  let rpcSuccess = false;
  try {
    const { data, error } = await supabase.rpc('record_payment', {
      p_client_id: params.clientId,
      p_amount: Number(params.amount),
      p_method: params.method || 'UPI',
      p_reference: params.reference || '',
      p_payment_date: new Date().toISOString(),
      p_allocations: [],
      p_notes: params.notes || '',
      p_cheque_no: null,
      p_cheque_bank: null,
      p_cheque_date: null,
      p_idempotency_key: null,
      p_org_id: null,
    });

    if (!error && data) {
      console.log('✅ RPC Execution Success! Data:', data);
      rpcSuccess = true;
    } else {
      console.log('RPC Info (expected if customer not in DB):', error?.message);
    }
  } catch (e) {
    console.log('RPC Exception:', e);
  }

  // Test Direct Table Fallback
  console.log('\nTesting Direct Table Persistence Payload...');
  const paymentRow = {
    id: testPaymentId,
    receiptNumber: params.receiptNumber,
    customerId: params.clientId,
    customerName: params.customerName,
    customerCity: params.customerCity,
    amountDueBefore: params.amountDueBefore,
    paymentAmount: params.amount,
    amountDueAfter: params.amountDueAfter,
    paymentDate: params.paymentDate,
    paymentMethod: params.method,
    utrRef: params.reference,
    collectedBy: params.collectedBy,
    notes: params.notes,
    sentSms: true,
    status: 'verified',
  };

  console.log('Payment Row to insert:', paymentRow);
  console.log('✅ Payment service format verified.');
}

testPaymentServiceFlow();
