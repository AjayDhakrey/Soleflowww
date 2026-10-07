import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jpcaptmmcbuqlgrdetde.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwY2FwdG1tY2J1cWxncmRldGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1OTE0MjAsImV4cCI6MjEwNjE2NzQyMH0.zh3W-mNQA43UVNMe5V5EwBcZAK-UIa-KpmnZX5zcI6U';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDiscountFlow() {
  console.log('Testing Discount Request Flow for ORD-0145...');

  const orderSnapshot = {
    id: 'ORD-0145',
    customerId: 'cust-1',
    customerName: 'ABC Footwear Hub',
    customerCity: 'Agra',
    pairsCount: 320,
    subtotal: 576000,
    tradeDiscountPercent: 5.0,
    salespersonId: 'sales-1',
    salespersonName: 'Vikram Malhotra',
  };

  const requestedPercent = 9.5;
  const reason = 'High volume bulk booking discount override';
  const defaultPct = Number(orderSnapshot.tradeDiscountPercent || 8.0);
  const subtotal = Number(orderSnapshot.subtotal || 0);
  const concession = subtotal > 0 && requestedPercent > defaultPct ? ((requestedPercent - defaultPct) * subtotal) / 100 : 0;
  const pairs = Number(orderSnapshot.pairsCount || 0);
  const prodSummary = `${pairs} Pairs • Footwear Consignment`;
  const projectedMargin = Math.max(5.0, Math.round((26.0 - (requestedPercent - defaultPct)) * 10) / 10);

  const fallbackRequest = {
    id: `DR-${Math.floor(10000 + Math.random() * 90000)}`,
    orderId: orderSnapshot.id,
    clientId: orderSnapshot.customerId,
    clientName: orderSnapshot.customerName,
    clientCity: orderSnapshot.customerCity,
    requestedBy: orderSnapshot.salespersonId,
    salesmanId: orderSnapshot.salespersonId,
    salesmanName: orderSnapshot.salespersonName,
    defaultPercent: defaultPct,
    requestedPercent: requestedPercent,
    approvedPercent: null,
    orderSubtotal: subtotal,
    pairs: pairs,
    productSummary: prodSummary,
    marginConcession: concession,
    projectedMarginPercent: projectedMargin,
    reason: reason.trim(),
    status: 'pending',
    decidedBy: null,
    decidedAt: null,
    decisionNote: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  console.log('✅ Generated Discount Request:');
  console.log(fallbackRequest);
}

testDiscountFlow();
