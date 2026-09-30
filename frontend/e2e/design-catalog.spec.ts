import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.VITE_SUPABASE_URL || 'https://jpcaptmmcbuqlgrdetde.supabase.co';
const rawAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const RUN_ID = Math.floor(1000 + Math.random() * 9000);
const TEST_ARTICLE = `AUDIT-E2E-${RUN_ID}`;

test.describe('Admin-Only Design Catalog & Live Sync Integration', () => {
  let adminClient: any;
  let salesClient: any;
  let createdDesignId: string;

  test.beforeAll(async () => {
    adminClient = createClient(rawUrl, rawAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    salesClient = createClient(rawUrl, rawAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Authenticate Admin
    const { error: adminErr } = await adminClient.auth.signInWithPassword({
      email: process.env.AUDIT_ADMIN_EMAIL || 'soleflow.admin@gmail.com',
      password: process.env.AUDIT_ADMIN_PASSWORD || 'Password123!',
    });
    expect(adminErr).toBeNull();

    // Authenticate Salesperson
    const { error: salesErr } = await salesClient.auth.signInWithPassword({
      email: process.env.AUDIT_SALES_EMAIL || 'soleflow.sales@gmail.com',
      password: process.env.AUDIT_SALES_PASSWORD || 'Password123!',
    });
    expect(salesErr).toBeNull();
  });

  test('1. Admin creates a new design with full specs', async () => {
    const { data: design, error } = await adminClient.rpc('create_design', {
      p_article_code: TEST_ARTICLE,
      p_name: `E2E Italian Derby ${RUN_ID}`,
      p_category: 'Formal Derby & Oxford',
      p_price: 1750,
      p_moq_pairs: 24,
      p_moq_cartons: 2,
      p_sizes: [7, 8, 9, 10],
      p_colors: ['Black', 'Tan'],
      p_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      p_subline: 'E2E Master Series',
      p_sole_type: 'TPR Lug Sole',
      p_upper_material: 'Full Grain Leather',
    });

    expect(error).toBeNull();
    expect(design).toBeTruthy();
    expect(design.id).toBeTruthy();
    createdDesignId = design.id;
  });

  test('2. Salesperson can view the newly added design', async () => {
    const { data: shoe, error } = await salesClient
      .from('designs')
      .select('*')
      .eq('id', createdDesignId)
      .single();

    expect(error).toBeNull();
    expect(shoe).toBeTruthy();
    expect(shoe.articleCode).toBe(TEST_ARTICLE);
    expect(Number(shoe.price)).toBe(1750);
  });

  test('3. Salesperson is strictly blocked from creating or modifying designs', async () => {
    // Attempt Create
    const { error: createErr } = await salesClient.rpc('create_design', {
      p_article_code: `FORBIDDEN-${RUN_ID}`,
      p_name: 'Forbidden Model',
      p_category: 'Athletic Sneakers',
      p_price: 1000,
    });
    expect(createErr).toBeTruthy();
    expect(createErr?.code).toBe('42501');

    // Attempt Update
    const { error: updateErr } = await salesClient.rpc('update_design', {
      p_design_id: createdDesignId,
      p_changes: { price: 500 },
    });
    expect(updateErr).toBeTruthy();
    expect(updateErr?.code).toBe('42501');

    // Attempt Archive
    const { error: archiveErr } = await salesClient.rpc('archive_design', {
      p_design_id: createdDesignId,
    });
    expect(archiveErr).toBeTruthy();
    expect(archiveErr?.code).toBe('42501');
  });

  test('4. Admin can update and archive design, which removes it from salesperson active view', async () => {
    // Admin update
    const { data: updated, error: updateErr } = await adminClient.rpc('update_design', {
      p_design_id: createdDesignId,
      p_changes: { price: 1899 },
    });
    expect(updateErr).toBeNull();
    expect(Number(updated.price)).toBe(1899);

    // Admin archive
    const { error: archiveErr } = await adminClient.rpc('archive_design', {
      p_design_id: createdDesignId,
    });
    expect(archiveErr).toBeNull();

    // Salesperson read (should return null because archived_at is set)
    const { data: activeList } = await salesClient
      .from('designs')
      .select('*')
      .eq('id', createdDesignId);

    expect(activeList.length).toBe(0);
  });

  test.afterAll(async () => {
    if (createdDesignId && adminClient) {
      await adminClient.from('notifications').delete().eq('record_id', createdDesignId);
      await adminClient.from('designs').delete().eq('id', createdDesignId);
    }
  });
});
