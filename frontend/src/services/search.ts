import {supabase, isDemoModeActive} from '../lib/supabase';
import { parseSupabaseError } from './apiError';

export interface SearchResultItem {
  id: string;
  type: 'client' | 'order' | 'design' | 'payment';
  title: string;
  subtitle: string;
  badge?: string;
  path: string;
}

export const searchService = {
  async globalSearch(query: string): Promise<SearchResultItem[]> {
    if (!query || query.trim().length === 0) return [];
    if (!supabase || isDemoModeActive) return [];

    try {
      const { data, error } = await supabase.rpc('global_search', {
        q: query.trim(),
      });

      if (error) throw parseSupabaseError(error);
      if (!data) return [];

      let rawItems: any[] = [];
      if (Array.isArray(data)) {
        rawItems = data;
      } else if (typeof data === 'object') {
        const obj = data as any;
        rawItems = [
          ...(obj.clients || []),
          ...(obj.orders || []),
          ...(obj.designs || []),
          ...(obj.payments || []),
        ];
      }

      return rawItems.map((item: any) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        subtitle: item.subtitle,
        badge: item.badge || item.city || item.status || (item.price ? `₹${item.price}` : undefined),
        path: item.path || (
          item.type === 'client' ? `/admin/customers/${item.id}` :
          item.type === 'order' ? `/admin/orders` :
          item.type === 'payment' ? `/admin/payments` :
          `/admin/designs`
        ),
      }));
    } catch (err) {
      console.warn('Global search RPC failed:', err);
      return [];
    }
  },
};

