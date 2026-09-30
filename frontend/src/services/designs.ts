import { supabase } from '../lib/supabase';
import { ShoeDesign, DesignShareRecord } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_DESIGNS, MOCK_DESIGN_SHARES } from '../data/mockData';

export type DesignRow = Database['public']['Tables']['designs']['Row'];

export function mapDesignRowToShoeDesign(row: any): ShoeDesign {
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
  };
}

export const designsService = {
  async fetchDesigns(filters?: { category?: string; status?: string; search?: string }): Promise<ShoeDesign[]> {
    if (!supabase) return MOCK_DESIGNS;

    try {
      let query = supabase
        .from('designs')
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,articleCode.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw parseSupabaseError(error);

      if (!data || data.length === 0) return MOCK_DESIGNS;
      return data.map(mapDesignRowToShoeDesign);
    } catch (err) {
      console.warn('Error fetching designs from Supabase; returning mock data:', err);
      return MOCK_DESIGNS;
    }
  },

  async fetchDesignById(id: string): Promise<ShoeDesign | null> {
    if (!supabase) {
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
      return mapDesignRowToShoeDesign(data);
    } catch (err) {
      console.error('Error fetching design by ID:', err);
      return MOCK_DESIGNS.find((d) => d.id === id) || null;
    }
  },

  async createDesign(data: any): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase) {
      return { success: true, data: { id: `sf-${Date.now()}`, ...data } };
    }

    try {
      const { data: res, error } = await supabase.rpc('create_design', {
        p_article_code: data.articleCode || data.article_code,
        p_name: data.name,
        p_category: data.category || 'Men',
        p_price: Number(data.price || data.wholesale_price || 500),
        p_moq_pairs: Number(data.moqPairs || data.moq_pairs || 120),
        p_moq_cartons: Number(data.moqCartons || data.moq_cartons || 10),
        p_sizes: data.sizes || [6, 7, 8, 9, 10],
        p_colors: data.colors || ['Slate Grey', 'Midnight Black'],
        p_image: data.image || data.image_url || '',
        p_subline: data.subline || null,
        p_sole_type: data.soleType || data.sole_type || 'TPR / Phylon Sole',
        p_upper_material: data.upperMaterial || data.upper_material || 'Synthetic Microfibre Leather',
      });

      if (error) throw parseSupabaseError(error);
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create design' };
    }
  },

  async updateDesign(id: string, updates: any): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase
        .from('designs')
        .update(updates)
        .eq('id', id);

      if (error) throw parseSupabaseError(error);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update design' };
    }
  },

  async archiveDesign(id: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase
        .from('designs')
        .update({ archived_at: new Date().toISOString(), status: 'Archived' })
        .eq('id', id);

      if (error) throw parseSupabaseError(error);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to archive design' };
    }
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
