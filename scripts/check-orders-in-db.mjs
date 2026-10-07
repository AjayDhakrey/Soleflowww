import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jpcaptmmcbuqlgrdetde.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwY2FwdG1tY2J1cWxncmRldGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1OTE0MjAsImV4cCI6MjEwNjE2NzQyMH0.zh3W-mNQA43UVNMe5V5EwBcZAK-UIa-KpmnZX5zcI6U';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkOrders() {
  console.log('Checking orders in Supabase...');
  const { data, error } = await supabase.from('orders').select('id, customerId, status, subtotal');
  console.log('Orders response:', { data, error });

  console.log('Checking discount_requests in Supabase...');
  const { data: drData, error: drError } = await supabase.from('discount_requests').select('*');
  console.log('Discount requests response:', { drData, drError });
}

checkOrders();
