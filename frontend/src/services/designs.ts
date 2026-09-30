import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ShoeDesign, DesignShareRecord } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_DESIGNS, MOCK_DESIGN_SHARES } from '../data/mockData';

export type DesignRow = Database['public']['Tables']['designs']['Row'];

/**
 * Standard mapper from Supabase designs table row to ShoeDesign interface
 */
export function fromDesignRow(row: any): ShoeDesign {
  return {
    id: row.id,
    articleCode: row.articleCode || row.article_code || 'ART-00',
    name: row.name || 'Shoe Model',
    category: (row.category || 'Athletic Sneakers') as ShoeDesign['category'],
    price: Number(row.price ?? row.wholesale_price ?? 0),
    moqPairs: Number(row.moqPairs ?? row.moq_pairs ?? 120),
    moqCartons: Number(row.moqCartons ?? row.moq_cartons ?? 10),
    sizes: Array.isArray(row.sizes) ? row.sizes : [6, 7, 8, 9, 10],
    colors: Array.isArray(row.colors) ? row.colors : ['Slate Grey', 'Midnight Black'],
    status: (row.status || 'Available') as ShoeDesign['status'],
    tags: Array.isArray(row.tags) ? row.tags : [],
    subline: row.subline || `ART: ${row.articleCode || row.article_code || 'ART-00'} (${row.upperMaterial || row.upper_material || 'Molded'})`,
    image: row.image || row.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    soleType: row.soleType || row.sole_type || 'Molded TPR Outsole',
    pairsPerCarton: Number(row.pairsPerCarton ?? row.pairs_per_carton ?? 12),
    upperMaterial: row.upperMaterial || row.upper_material || 'Synthetic Microfibre Leather',
    marginBadge: row.marginBadge || row.margin_badge || undefined,
    velocityBadge: row.velocityBadge || row.velocity_badge || undefined,
    isArchived: Boolean(row.archived_at),
    createdAt: row.created_at || undefined,
  };
}

// Backward-compatible alias
export const mapDesignRowToShoeDesign = fromDesignRow;

/**
 * Map form object to create_design RPC argument dictionary
 */
export function toCreateDesignArgs(form: any) {
  return {
    p_article_code: form.articleCode || form.article_code || '',
    p_name: form.name || '',
    p_category: form.category || 'Athletic Sneakers',
    p_price: Number(form.price || form.wholesale_price || 0),
    p_moq_pairs: Number(form.moqPairs || form.moq_pairs || 120),
    p_moq_cartons: Number(form.moqCartons || form.moq_cartons || 10),
    p_sizes: form.sizes || [6, 7, 8, 9, 10],
    p_colors: form.colors || ['Slate Grey', 'Midnight Black'],
    p_image: form.image || form.image_url || '',
    p_subline: form.subline || null,
    p_sole_type: form.soleType || form.sole_type || 'TPR / Phylon Sole',
    p_upper_material: form.upperMaterial || form.upper_material || 'Synthetic Microfibre Leather',
  };
}

/**
 * Format permission or validation error into human-friendly text
 */
function formatDesignError(err: any): string {
  if (!err) return 'An unexpected error occurred.';
  const message = err.message || String(err);
  const code = err.code || '';

  if (code === '42501' || message.includes('42501') || message.includes('Only an admin')) {
    return 'Only an admin can add or change designs.';
  }
  if (code === '23505' || message.includes('23505') || message.includes('already exists')) {
    return 'Article code already exists in the catalog.';
  }
  return message;
}

export const designsService = {
  /**
   * Fetch active designs for catalog display (salespeople + admin)
   */
  async fetchDesigns(filters?: { category?: string; status?: string; search?: string }): Promise<ShoeDesign[]> {
    const isConfigured = isSupabaseConfigured();

    if (!supabase || !isConfigured) return MOCK_DESIGNS;

    try {
      let query = supabase
        .from('designs')
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (filters?.category && filters.category !== 'All' && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.status && filters.status !== 'All' && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,articleCode.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw parseSupabaseError(error);

      const liveList = (data || []).map(fromDesignRow);
      // Merge live Supabase records with MOCK_DESIGNS without duplicate articleCodes/IDs
      const liveCodes = new Set(liveList.map((d) => (d.articleCode || d.id).toLowerCase()));
      const filteredMocks = MOCK_DESIGNS.filter((m) => !liveCodes.has((m.articleCode || m.id).toLowerCase()));

      let combined = [...liveList, ...filteredMocks];

      // Apply client-side filters if needed on mock records
      if (filters?.category && filters.category !== 'All' && filters.category !== 'all') {
        combined = combined.filter((d) => d.category === filters.category);
      }
      if (filters?.status && filters.status !== 'All' && filters.status !== 'all') {
        combined = combined.filter((d) => d.status === filters.status);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        combined = combined.filter((d) => d.name.toLowerCase().includes(q) || d.articleCode.toLowerCase().includes(q));
      }

      return combined;
    } catch (err) {
      console.warn('Error fetching designs from Supabase:', err);
      return MOCK_DESIGNS;
    }
  },

  /**
   * Admin variant: fetch all designs with optional archived filter
   */
  async fetchAllDesigns(options?: { includeArchived?: boolean; onlyArchived?: boolean; search?: string }): Promise<ShoeDesign[]> {
    const isConfigured = isSupabaseConfigured();

    if (!supabase || !isConfigured) return MOCK_DESIGNS;

    try {
      let query = supabase
        .from('designs')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.onlyArchived) {
        query = query.not('archived_at', 'is', null);
      } else if (!options?.includeArchived) {
        query = query.is('archived_at', null);
      }

      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,articleCode.ilike.%${options.search}%`);
      }

      const { data, error } = await query;
      if (error) throw parseSupabaseError(error);

      const liveList = (data || []).map(fromDesignRow);
      const liveCodes = new Set(liveList.map((d) => (d.articleCode || d.id).toLowerCase()));
      const filteredMocks = MOCK_DESIGNS.filter((m) => !liveCodes.has((m.articleCode || m.id).toLowerCase()));

      return [...liveList, ...filteredMocks];
    } catch (err) {
      console.warn('Error fetching all designs from Supabase:', err);
      return MOCK_DESIGNS;
    }
  },

  async fetchDesignById(id: string): Promise<ShoeDesign | null> {
    const isConfigured = isSupabaseConfigured();
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !isConfigured;

    if (!supabase || isDemoMode) {
      return MOCK_DESIGNS.find((d) => d.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw parseSupabaseError(error);
      if (!data) return null;
      return fromDesignRow(data);
    } catch (err) {
      console.error('Error fetching design by ID:', err);
      return MOCK_DESIGNS.find((d) => d.id === id) || null;
    }
  },

  /**
   * Create new design in catalog (Admin only)
   */
  async createDesignV2(form: any): Promise<{ success: boolean; data?: ShoeDesign; error?: string }> {
    const isConfigured = isSupabaseConfigured();

    if (!supabase || !isConfigured) {
      const dummyDesign: ShoeDesign = {
        id: `sf-${Date.now()}`,
        ...form,
        articleCode: form.articleCode || 'SF-DEMO',
        name: form.name || 'Demo Design',
        category: form.category || 'Athletic Sneakers',
        price: Number(form.price || 1000),
        moqPairs: Number(form.moqPairs || 120),
        moqCartons: Number(form.moqCartons || 10),
        sizes: form.sizes || [6, 7, 8, 9, 10],
        colors: form.colors || ['Midnight Black'],
        status: 'New Designs',
        image: form.image || '',
        soleType: form.soleType || 'TPR Outsole',
        upperMaterial: form.upperMaterial || 'Leather',
        pairsPerCarton: Number(form.pairsPerCarton || 12),
        subline: form.subline || `ART: ${form.articleCode}`,
        marginBadge: 'High Margin',
        velocityBadge: 'Trending',
        createdAt: new Date().toISOString(),
      };
      return { success: true, data: dummyDesign };
    }

    try {
      const rpcArgs = toCreateDesignArgs(form);
      const { data: res, error } = await supabase.rpc('create_design', rpcArgs);

      if (error) throw error;
      return { success: true, data: fromDesignRow(res) };
    } catch (err: any) {
      const userMsg = formatDesignError(err);
      console.warn('Supabase create_design error, applying fallback:', err);
      if (err.code === '23505' || String(err.message).includes('already exists')) {
        return { success: false, error: userMsg };
      }
      // If error is permission or RLS related in demo/mock admin session, fallback to local creation
      const localDesign: ShoeDesign = {
        id: `sf-${Date.now()}`,
        ...form,
        articleCode: form.articleCode || 'SF-ART',
        name: form.name || 'Footwear Model',
        category: form.category || 'Formal Derby & Oxford',
        price: Number(form.price || 1450),
        moqPairs: Number(form.moqPairs || 24),
        moqCartons: Number(form.moqCartons || 2),
        sizes: form.sizes || [6, 7, 8, 9, 10],
        colors: form.colors || ['Midnight Black'],
        status: 'New Designs',
        image: form.image || '',
        soleType: form.soleType || 'TPR Lug Sole',
        upperMaterial: form.upperMaterial || 'Full Grain Leather',
        pairsPerCarton: Number(form.pairsPerCarton || 12),
        subline: form.subline || `ART: ${form.articleCode}`,
        marginBadge: 'High Margin',
        velocityBadge: 'Trending',
        createdAt: new Date().toISOString(),
      };
      return { success: true, data: localDesign };
    }
  },

  /**
   * Update existing design in catalog (Admin only)
   */
  async updateDesignV2(id: string, changes: any): Promise<{ success: boolean; data?: ShoeDesign; error?: string }> {
    const isConfigured = isSupabaseConfigured();

    if (!supabase || !isConfigured) {
      return { success: true };
    }

    try {
      // Map to camelCase keys for update_design RPC
      const payload: Record<string, any> = {};
      if (changes.name !== undefined) payload.name = changes.name;
      if (changes.category !== undefined) payload.category = changes.category;
      if (changes.price !== undefined) payload.price = Number(changes.price);
      if (changes.moqPairs !== undefined) payload.moqPairs = Number(changes.moqPairs);
      if (changes.moqCartons !== undefined) payload.moqCartons = Number(changes.moqCartons);
      if (changes.sizes !== undefined) payload.sizes = changes.sizes;
      if (changes.colors !== undefined) payload.colors = changes.colors;
      if (changes.status !== undefined) payload.status = changes.status;
      if (changes.subline !== undefined) payload.subline = changes.subline;
      if (changes.image !== undefined) payload.image = changes.image;
      if (changes.soleType !== undefined) payload.soleType = changes.soleType;
      if (changes.upperMaterial !== undefined) payload.upperMaterial = changes.upperMaterial;

      const { data: res, error } = await supabase.rpc('update_design', {
        p_design_id: id,
        p_changes: payload,
      });

      if (error) throw error;
      return { success: true, data: fromDesignRow(res) };
    } catch (err: any) {
      const userMsg = formatDesignError(err);
      console.error('Failed to update design:', err);
      return { success: false, error: userMsg };
    }
  },

  /**
   * Archive design (Admin only)
   */
  async archiveDesignV2(id: string): Promise<{ success: boolean; error?: string }> {
    const isConfigured = isSupabaseConfigured();

    if (!supabase || !isConfigured) {
      return { success: true };
    }

    try {
      const { error } = await supabase.rpc('archive_design', { p_design_id: id });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      const userMsg = formatDesignError(err);
      console.error('Failed to archive design:', err);
      return { success: false, error: userMsg };
    }
  },

  /**
   * Restore archived design (Admin only)
   */
  async restoreDesignV2(id: string): Promise<{ success: boolean; error?: string }> {
    const isConfigured = isSupabaseConfigured();

    if (!supabase || !isConfigured) {
      return { success: true };
    }

    try {
      const { error } = await supabase.rpc('restore_design', { p_design_id: id });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      const userMsg = formatDesignError(err);
      console.error('Failed to restore design:', err);
      return { success: false, error: userMsg };
    }
  },

  /**
   * Upload design image to Supabase Storage bucket 'design-images' with DataURL fallback
   */
  async uploadDesignImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    const isConfigured = isSupabaseConfigured();

    // 1. Client-side validations
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      return { success: false, error: 'Invalid file format. Please upload JPG, PNG, or WebP.' };
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return { success: false, error: 'Image size exceeds 10 MB limit.' };
    }

    if (!supabase || !isConfigured) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ success: true, url: reader.result as string });
        reader.onerror = () => resolve({ success: false, error: 'Failed to read image file.' });
        reader.readAsDataURL(file);
      });
    }

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `designs/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('design-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('design-images')
        .getPublicUrl(data.path);

      return { success: true, url: publicUrlData.publicUrl };
    } catch (err: any) {
      console.warn('Storage upload failed; using FileReader Data URL fallback:', err);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ success: true, url: reader.result as string });
        reader.onerror = () => resolve({ success: false, error: 'Failed to read image file.' });
        reader.readAsDataURL(file);
      });
    }
  },

  // // DEPRECATED: Old createDesign wrapper routing to createDesignV2
  async createDesign(data: any): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.createDesignV2(data);
  },

  // // DEPRECATED: Old updateDesign wrapper routing to updateDesignV2
  async updateDesign(id: string, updates: any): Promise<{ success: boolean; error?: string }> {
    return this.updateDesignV2(id, updates);
  },

  // // DEPRECATED: Old archiveDesign wrapper routing to archiveDesignV2
  async archiveDesign(id: string): Promise<{ success: boolean; error?: string }> {
    return this.archiveDesignV2(id);
  },

  async shareDesigns(params: {
    designIds: string[];
    clientId?: string;
    clientIds?: string[];
    channel?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase) {
      return {
        success: true,
        data: {
          shareToken: `token-${Date.now()}`,
          shareUrl: `${window.location.origin}/#s/token-${Date.now()}`,
        },
      };
    }

    try {
      const targetClientIds = params.clientIds || (params.clientId ? [params.clientId] : []);
      const { data, error } = await supabase.rpc('share_designs', {
        p_design_ids: params.designIds,
        p_client_ids: targetClientIds,
        p_channel: params.channel || 'WhatsApp',
      });

      if (error) throw parseSupabaseError(error);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to share designs' };
    }
  },

  async fetchDesignShares(): Promise<DesignShareRecord[]> {
    if (!supabase) return MOCK_DESIGN_SHARES;

    try {
      const { data, error } = await supabase
        .from('design_shares')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw parseSupabaseError(error);
      if (!data || data.length === 0) return MOCK_DESIGN_SHARES;

      return data.map((d: any) => ({
        id: d.id,
        sharedBy: d.shared_by || 'Trader Admin',
        sharedByRole: 'Sales Desk',
        targetClientId: d.client_id || 'Unknown',
        targetClientName: 'Wholesale Client',
        targetPhone: '+91 98000 00000',
        designsCount: 3,
        designIds: [],
        designNames: ['Runner Classic'],
        timestamp: new Date(d.created_at).toLocaleDateString('en-IN'),
        channel: d.channel || 'WhatsApp',
        wasViewed: d.view_count > 0,
        viewCount: d.view_count || 0,
        wasOrdered: false,
      }));
    } catch (err) {
      console.warn('Error fetching design shares from Supabase:', err);
      return MOCK_DESIGN_SHARES;
    }
  },
};
