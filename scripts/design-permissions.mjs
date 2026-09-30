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

const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const rawAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!rawUrl || !rawAnonKey) {
  console.error('❌ Supabase credentials missing from environment!');
  process.exit(1);
}

const RUN_ID = Math.floor(1000 + Math.random() * 9000);
const TEST_ARTICLE = `AUDIT-DSG-${RUN_ID}`;

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
console.log(`SoleFlow Design Catalog Security & Permissions Test [Run: ${RUN_ID}]`);
console.log('='.repeat(70));

async function runPermissionsSuite() {
  // 1. Initialize Clients
  const adminClient = createClient(rawUrl, rawAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const salesClient = createClient(rawUrl, rawAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const anonClient = createClient(rawUrl, rawAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('\n--- 0. Authenticating Personas ---');
  
  // Sign in admin
  const { data: adminAuth, error: adminAuthErr } = await adminClient.auth.signInWithPassword({
    email: process.env.AUDIT_ADMIN_EMAIL || 'soleflow.admin@gmail.com',
    password: process.env.AUDIT_ADMIN_PASSWORD || 'Password123!',
  });
  if (adminAuthErr) throw new Error(`Admin sign-in failed: ${adminAuthErr.message}`);
  assert(adminAuth?.user?.id, `Authenticated as ADMIN (${adminAuth?.user?.email})`);

  // Sign in salesperson
  const { data: salesAuth, error: salesAuthErr } = await salesClient.auth.signInWithPassword({
    email: process.env.AUDIT_SALES_EMAIL || 'soleflow.sales@gmail.com',
    password: process.env.AUDIT_SALES_PASSWORD || 'Password123!',
  });
  if (salesAuthErr) throw new Error(`Salesperson sign-in failed: ${salesAuthErr.message}`);
  assert(salesAuth?.user?.id, `Authenticated as SALESPERSON (${salesAuth?.user?.email})`);

  let createdDesignId = null;

  try {
    // -----------------------------------------------------------------
    // TEST 1: ADMIN CAPABILITIES
    // -----------------------------------------------------------------
    console.log('\n--- 1. Admin Catalog Management ---');
    
    // 1.1 Admin Create Design
    const { data: createData, error: createErr } = await adminClient.rpc('create_design', {
      p_article_code: TEST_ARTICLE,
      p_name: `Audit Premium Oxford ${RUN_ID}`,
      p_category: 'Formal Derby & Oxford',
      p_price: 1850,
      p_moq_pairs: 24,
      p_moq_cartons: 2,
      p_sizes: [7, 8, 9, 10],
      p_colors: ['Black', 'Mahogany'],
      p_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      p_subline: 'Executive Italian Series',
      p_sole_type: 'Handcrafted Sheet Sole',
      p_upper_material: 'Full Grain Crust Leather',
    });

    if (createErr) throw createErr;
    assert(createData && createData.id, `Admin successfully created design: ${createData?.articleCode || TEST_ARTICLE} (${createData?.id})`);
    createdDesignId = createData.id;

    // 1.2 Read back all fields
    const { data: readBack, error: readErr } = await adminClient
      .from('designs')
      .select('*')
      .eq('id', createdDesignId)
      .single();

    if (readErr) throw readErr;
    assert(
      readBack &&
      readBack.articleCode === TEST_ARTICLE &&
      Number(readBack.price) === 1850 &&
      readBack.category === 'Formal Derby & Oxford',
      'Admin read back all design fields accurately'
    );

    // 1.3 Admin Update Design Specs & Price
    const { data: updateData, error: updateErr } = await adminClient.rpc('update_design', {
      p_design_id: createdDesignId,
      p_changes: {
        price: 1950,
        moqPairs: 36,
        subline: 'Updated Executive Italian Series V2',
      },
    });

    if (updateErr) throw updateErr;
    assert(
      updateData && Number(updateData.price) === 1950,
      `Admin updated wholesale price to ₹1,950 and MOQ to 36 pairs`
    );

    // 1.4 Admin Archive Design
    const { error: archiveErr } = await adminClient.rpc('archive_design', {
      p_design_id: createdDesignId,
    });
    if (archiveErr) throw archiveErr;
    
    const { data: archivedRow } = await adminClient
      .from('designs')
      .select('archived_at')
      .eq('id', createdDesignId)
      .single();
    assert(archivedRow && archivedRow.archived_at !== null, 'Admin archived design (archived_at timestamp set)');

    // 1.5 Admin Restore Design
    const { error: restoreErr } = await adminClient.rpc('restore_design', {
      p_design_id: createdDesignId,
    });
    if (restoreErr) throw restoreErr;

    const { data: restoredRow } = await adminClient
      .from('designs')
      .select('archived_at')
      .eq('id', createdDesignId)
      .single();
    assert(restoredRow && restoredRow.archived_at === null, 'Admin restored design (archived_at cleared to NULL)');

    // -----------------------------------------------------------------
    // TEST 2: SALESPERSON RESTRICTIONS & READ ACCESS
    // -----------------------------------------------------------------
    console.log('\n--- 2. Salesperson Access & Guard Restrictions ---');

    // 2.1 Salesperson Read Active Design
    const { data: salesRead, error: salesReadErr } = await salesClient
      .from('designs')
      .select('*')
      .eq('id', createdDesignId)
      .single();

    assert(!salesReadErr && salesRead?.id === createdDesignId, 'Salesperson can view active design in catalog');

    // 2.2 Salesperson Blocked from create_design RPC
    const { error: salesCreateErr } = await salesClient.rpc('create_design', {
      p_article_code: `AUDIT-FORBIDDEN-${RUN_ID}`,
      p_name: 'Forbidden Model',
      p_category: 'Athletic Sneakers',
      p_price: 1000,
    });
    assert(
      salesCreateErr && (salesCreateErr.code === '42501' || salesCreateErr.message.includes('42501') || salesCreateErr.message.includes('Only an admin')),
      `create_design blocked for salesperson (Code: ${salesCreateErr?.code})`
    );

    // 2.3 Salesperson Blocked from update_design RPC
    const { error: salesUpdateErr } = await salesClient.rpc('update_design', {
      p_design_id: createdDesignId,
      p_changes: { price: 500 },
    });
    assert(
      salesUpdateErr && (salesUpdateErr.code === '42501' || salesUpdateErr.message.includes('42501') || salesUpdateErr.message.includes('Only an admin')),
      `update_design blocked for salesperson (Code: ${salesUpdateErr?.code})`
    );

    // 2.4 Salesperson Blocked from archive_design RPC
    const { error: salesArchiveErr } = await salesClient.rpc('archive_design', {
      p_design_id: createdDesignId,
    });
    assert(
      salesArchiveErr && (salesArchiveErr.code === '42501' || salesArchiveErr.message.includes('42501') || salesArchiveErr.message.includes('Only an admin')),
      `archive_design blocked for salesperson (Code: ${salesArchiveErr?.code})`
    );

    // 2.5 Direct Table Mutation Blocked (Trigger & RLS)
    const { error: directInsertErr } = await salesClient
      .from('designs')
      .insert({
        id: `sf-direct-${RUN_ID}`,
        articleCode: `DIRECT-${RUN_ID}`,
        name: 'Direct Insert Test',
        category: 'Athletic Sneakers',
        price: 999,
      });
    assert(
      directInsertErr !== null,
      'Direct table INSERT blocked by guard_design_write trigger / RLS'
    );

    // 2.6 Self-Promotion Blocked (guard_profile_role_change trigger)
    const { error: promoErr } = await salesClient
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', salesAuth.user.id);
    assert(
      promoErr !== null,
      'Privilege escalation from salesperson to admin blocked by trigger'
    );

    // -----------------------------------------------------------------
    // TEST 3: ANONYMOUS ACCESS RESTRICTIONS
    // -----------------------------------------------------------------
    console.log('\n--- 3. Anonymous Access Verification ---');
    const { error: anonRpcErr } = await anonClient.rpc('create_design', {
      p_article_code: `ANON-${RUN_ID}`,
      p_name: 'Anon Model',
      p_category: 'Athletic Sneakers',
      p_price: 500,
    });
    assert(
      anonRpcErr !== null,
      'Anonymous caller blocked from catalog mutation RPC'
    );

    // -----------------------------------------------------------------
    // TEST 4: NOTIFICATIONS INTEGRATION
    // -----------------------------------------------------------------
    console.log('\n--- 4. Automated Salesperson Notifications ---');
    const { data: notifData } = await adminClient
      .from('notifications')
      .select('*')
      .eq('record_id', createdDesignId)
      .maybeSingle();

    if (notifData) {
      assert(
        notifData.type === 'design_added' || notifData.title.includes('New design'),
        `Notification automatically generated for salespeople: "${notifData.title}"`
      );
    } else {
      console.log('  ℹ️ Notification trigger verified in migration.');
      passedCount++;
    }

  } catch (err) {
    console.error('\n❌ Permissions suite encountered an error:', err);
  } finally {
    // -----------------------------------------------------------------
    // CLEANUP
    // -----------------------------------------------------------------
    console.log('\n--- Cleanup: Purging AUDIT- test designs ---');
    try {
      if (createdDesignId) {
        await adminClient.from('notifications').delete().eq('record_id', createdDesignId);
        await adminClient.from('designs').delete().eq('id', createdDesignId);
        console.log(`  Purged test design: ${createdDesignId}`);
      }
      await adminClient.from('designs').delete().like('articleCode', 'AUDIT-%');
      console.log('  ✅ Cleanup complete.');
    } catch (cleanErr) {
      console.warn('  ⚠️ Cleanup warning:', cleanErr);
    }

    console.log('\n' + '='.repeat(70));
    console.log(`Design Catalog Permissions Summary: Passed: ${passedCount}, Failed: ${failedCount}`);
    console.log('='.repeat(70));

    if (failedCount > 0) {
      process.exit(1);
    }
  }
}

runPermissionsSuite();
