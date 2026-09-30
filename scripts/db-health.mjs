import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Helper to load .env file
function loadEnv() {
  const envPaths = [
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

const rawUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function mask(str, visibleChars = 6) {
  if (!str) return '(not set)';
  if (str.length <= visibleChars * 2) return '***';
  return str.slice(0, visibleChars) + '...' + str.slice(-visibleChars);
}

console.log('='.repeat(70));
console.log('SoleFlow Database & Schema Health Audit');
console.log('='.repeat(70));
console.log(`VITE_SUPABASE_URL:      ${mask(rawUrl, 12)}`);
console.log(`VITE_SUPABASE_ANON_KEY: ${mask(rawAnonKey, 10)}`);
console.log('-'.repeat(70));

if (!rawUrl || !rawAnonKey) {
  console.error('❌ Supabase credentials missing from environment!');
  process.exit(1);
}

const supabase = createClient(rawUrl, rawAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function runAudit() {
  // Step 2: Auth test
  const auditEmail = process.env.AUDIT_EMAIL;
  const auditPassword = process.env.AUDIT_PASSWORD;

  if (auditEmail && auditPassword) {
    console.log(`\n🔑 Authenticating with audit user: ${auditEmail}`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: auditEmail,
      password: auditPassword,
    });
    if (authError) {
      console.log(`⚠️ Auth sign-in failed (${authError.message}). Running with anonymous client.`);
    } else {
      console.log(`✅ Authenticated successfully as ${authData.user?.email} (${authData.user?.id})`);
    }
  } else {
    console.log('\nℹ️ No AUDIT_EMAIL / AUDIT_PASSWORD set. Testing with anonymous role (RLS may restrict certain reads).');
  }

  // Step 3: Tables & Views audit
  const tables = [
    'customers',
    'sales_team',
    'designs',
    'orders',
    'order_items',
    'order_status_history',
    'payments',
    'payment_allocations',
    'payment_adjustments',
    'manufacturers',
    'field_visits',
    'follow_ups',
    'discount_requests',
    'notifications',
    'activity_events',
    'audit_logs',
    'client_notes',
    'design_shares',
    'design_share_items',
    'design_images',
    'profiles',
    'app_settings',
  ];

  const views = [
    'v_order_financials',
    'v_client_financials',
    'v_receivables',
    'v_salesman_performance',
    'v_design_performance',
    'v_manufacturer_performance',
    'v_discount_request_stats',
    'v_salesman_collections',
  ];

  console.log('\n--- 1. TABLES AUDIT ---');
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`  ❌ ${table.padEnd(25)} ERROR: ${error.message} (${error.code || ''})`);
      } else {
        console.log(`  ✅ ${table.padEnd(25)} EXISTS (rows: ${count ?? 'N/A'})`);
      }
    } catch (err) {
      console.log(`  ❌ ${table.padEnd(25)} EXCEPTION: ${err.message}`);
    }
  }

  console.log('\n--- 2. VIEWS AUDIT ---');
  for (const view of views) {
    try {
      const { data, error, count } = await supabase
        .from(view)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`  ❌ ${view.padEnd(30)} ERROR: ${error.message} (${error.code || ''})`);
      } else {
        console.log(`  ✅ ${view.padEnd(30)} EXISTS (rows: ${count ?? 'N/A'})`);
      }
    } catch (err) {
      console.log(`  ❌ ${view.padEnd(30)} EXCEPTION: ${err.message}`);
    }
  }

  // Step 4: RPCs Audit
  const rpcs = [
    { name: 'create_client', args: { p_business_name: '__DUMMY__', p_prop_name: '__DUMMY__', p_phone: '9999999999' } },
    { name: 'archive_client', args: { p_client_id: '__DUMMY__' } },
    { name: 'assign_salesman', args: { p_client_id: '__DUMMY__', p_salesman_id: '__DUMMY__' } },
    { name: 'create_design', args: { p_article_code: '__DUMMY__', p_name: 'Test', p_category: 'Men', p_price: 500 } },
    { name: 'share_designs', args: { p_design_ids: ['__DUMMY__'], p_client_ids: ['__DUMMY__'] } },
    { name: 'create_order_draft', args: { p_client_id: '__DUMMY__', p_items: [] } },
    { name: 'advance_order_status', args: { p_order_id: '__DUMMY__', p_to_status: 'Submitted' } },
    { name: 'record_payment', args: { p_client_id: '__DUMMY__', p_amount: 100 } },
    { name: 'global_search', args: { q: 'test' } },
    { name: 'request_discount', args: { p_order_id: '__DUMMY__', p_requested_percent: 10, p_reason: 'test' } },
    { name: 'approve_discount_request', args: { p_request_id: '__DUMMY__' } },
    { name: 'reject_discount_request', args: { p_request_id: '__DUMMY__', p_note: 'test' } },
    { name: 'cancel_discount_request', args: { p_request_id: '__DUMMY__' } },
    { name: 'clear_cheque', args: { p_payment_id: '__DUMMY__' } },
    { name: 'bounce_cheque', args: { p_payment_id: '__DUMMY__' } },
    { name: 'verify_payment', args: { p_payment_id: '__DUMMY__' } },
    { name: 'reverse_payment', args: { p_payment_id: '__DUMMY__' } },
    { name: 'get_shared_designs', args: { p_share_token: '00000000-0000-0000-0000-000000000000' } },
  ];

  console.log('\n--- 3. RPC FUNCTIONS AUDIT ---');
  for (const rpc of rpcs) {
    try {
      const { data, error } = await supabase.rpc(rpc.name, rpc.args);
      if (error) {
        // PGRST202: Could not find the function in schema
        // 42883: function does not exist
        if (error.code === 'PGRST202' || error.message?.includes('Could not find') || error.message?.includes('does not exist')) {
          console.log(`  ❌ ${rpc.name.padEnd(28)} MISSING: ${error.message}`);
        } else {
          // Function exists and responded with business/validation error
          console.log(`  ✅ ${rpc.name.padEnd(28)} EXISTS (Validation response: ${error.message?.slice(0, 45)}...)`);
        }
      } else {
        console.log(`  ✅ ${rpc.name.padEnd(28)} EXISTS (Returned success result)`);
      }
    } catch (err) {
      console.log(`  ❌ ${rpc.name.padEnd(28)} EXCEPTION: ${err.message}`);
    }
  }

  // Step 5: Storage Buckets
  console.log('\n--- 4. STORAGE BUCKETS AUDIT ---');
  const bucketsToCheck = ['design-images', 'payment-receipts'];
  try {
    const { data: buckets, error: bError } = await supabase.storage.listBuckets();
    if (bError) {
      console.log(`  ⚠️ listBuckets error: ${bError.message}. Testing direct access...`);
      for (const b of bucketsToCheck) {
        const { data: fData, error: fError } = await supabase.storage.from(b).list('', { limit: 1 });
        if (fError && (fError.message?.includes('not found') || fError.message?.includes('Bucket not found'))) {
          console.log(`  ❌ Bucket '${b}' MISSING: ${fError.message}`);
        } else if (fError) {
          console.log(`  ✅ Bucket '${b}' EXISTS (Access policy check: ${fError.message})`);
        } else {
          console.log(`  ✅ Bucket '${b}' EXISTS (${fData.length} items visible)`);
        }
      }
    } else {
      const bucketNames = (buckets || []).map((b) => b.name);
      for (const b of bucketsToCheck) {
        if (bucketNames.includes(b)) {
          console.log(`  ✅ Bucket '${b}' EXISTS`);
        } else {
          console.log(`  ❌ Bucket '${b}' MISSING from listBuckets`);
        }
      }
    }
  } catch (err) {
    console.log(`  ⚠️ Storage audit exception: ${err.message}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('Audit run completed.');
  console.log('='.repeat(70));
}

runAudit().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
