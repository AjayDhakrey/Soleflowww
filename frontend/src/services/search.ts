import { supabase } from '../lib/supabase';
import { parseSupabaseError } from './apiError';

export interface SearchResultItem {
  id: string;
  type: 'client' | 'order' | 'design';
  title: string;
  subtitle: string;
  badge?: string;
  path: string;
}

export const searchService = {
  async globalSearch(query: string): Promise<SearchResultItem[]> {
    if (!query || query.trim().length === 0) return [];
    if (!supabase) return [];

    try {
      const { data, error } = await supabase.rpc('global_search', {
        p_query: query.trim(),
      });

      if (error) throw parseSupabaseError(error);
      if (!data || !Array.isArray(data)) return [];

      return data.map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        subtitle: item.subtitle,
        badge: item.badge,
        path: item.path || (item.type === 'client' ? `/admin/customers/${item.id}` : item.type === 'order' ? `/admin/orders/${item.id}` : `/admin/designs`),
      }));
    } catch (err) {
      console.warn('Global search RPC failed:', err);
      return [];
    }
  },
};
