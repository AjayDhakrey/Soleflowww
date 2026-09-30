import { useQuery } from '@tanstack/react-query';
import { designsService } from '../services/designs';
import { ShoeDesign } from '../types';

export function useDesignCatalog(filters?: { category?: string; status?: string; search?: string; includeArchived?: boolean }) {
  return useQuery<ShoeDesign[]>({
    queryKey: ['designs', filters],
    queryFn: async () => {
      if (filters?.includeArchived) {
        return designsService.fetchAllDesigns({
          includeArchived: true,
          search: filters.search,
        });
      }
      return designsService.fetchDesigns(filters);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache (realtime handles immediate updates)
    refetchOnWindowFocus: false,
  });
}
