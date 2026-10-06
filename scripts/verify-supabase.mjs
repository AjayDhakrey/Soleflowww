import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jpcaptmmcbuqlgrdetde.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwY2FwdG1tY2J1cWxncmRldGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1OTE0MjAsImV4cCI6MjEwNjE2NzQyMH0.zh3W-mNQA43UVNMe5V5EwBcZAK-UIa-KpmnZX5zcI6U';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log('Testing Supabase Connection & Schema...');
  
  // Test views and tables
  const tables = [
    'customers',
    'field_visits',
    'follow_ups',
    'orders',
    'payments',
    'design_catalog',
    'manufacturers',
    'sales_team',
    'notifications',
    'discount_requests',
  ];

  for (const table of tables) {
    const res = await supabase.from(table).select('*').limit(1);
    if (res.error) {
      console.log(`[${table}] Error:`, JSON.stringify(res.error));
    } else {
      console.log(`[${table}] OK! Rows count:`, res.data?.length);
    }
  }
}

main();
