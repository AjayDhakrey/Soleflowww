import { supabase } from '../lib/supabase';
import { ShoeDesign, DesignShareRecord } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_DESIGNS, MOCK_DESIGN_SHARES } from '../data/mockData';

export type DesignRow = Database['public']['Tables']['designs']['Row'];

export function mapDesignRowToShoeDesign(row: DesignRow): ShoeDesign {
  return {
    id: row.id,
    articleCode: row.article_code,
    name: row.name,
    category: row.category as ShoeDesign['category'],
    price: Number(row.wholesale_price),
    moqPairs: row.moq_pairs,
    moqCartons: row.moq_cartons,
    sizes: row.sizes || [],
    colors: row.colors || [],
    status: (row.status || 'Available') as ShoeDesign['status'],
    tags: row.tags || [],
    subline: `ART: ${row.article_code} (${row.upper_material || 'Injection Mold'})`,
    image: row.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    soleType: row.sole_type || 'Molded TPR Outsole',
    pairsPerCarton: row.pairs_per_carton,
    upperMaterial: row.upper_material || 'Premium Material',
    marginBadge: row.margin_badge || undefined,
    velocityBadge: row.velocity_badge || undefined,
  };
}

export const designsService = {
  async fetchDesigns(filters?: { category?: string; status?: string; search?: string }): Promise<ShoeDesign[]> {
    if (!supabase) return MOCK_DESIGNS;

    try {
      let query = supabase
        .from('designs')
        .select('*')
        .eq('is_active', true)
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,article_code.ilike.%${filters.search}%`);
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

  async createDesign(data: Partial<DesignRow>): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase) {
      return { success: true, data: { id: `sf-${Date.now()}`, ...data } };
    }

    try {
      const { data: res, error } = await supabase.rpc('create_design', {
        p_design: data as any,
      });

      if (error) throw parseSupabaseError(error);
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create design' };
    }
  },

  async updateDesign(id: string, updates: Partial<DesignRow>): Promise<{ success: boolean; error?: string }> {
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
        .update({ archived_at: new Date().toISOString(), is_active: false })
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
      const { data, error } = await supabase.rpc('share_designs', {
        p_design_ids: params.designIds,
        p_client_id: params.clientId || null,
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
