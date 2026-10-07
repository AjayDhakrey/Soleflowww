import { useQuery } from '@tanstack/react-query';
import { designsService } from '../services/designs';
import { useEffectiveOrgId } from '../context/ViewModeContext';
import { ShoeDesign } from '../types';

export function useDesignCatalog(filters?: { category?: string; status?: string; search?: string; includeArchived?: boolean }) {
  const orgId = useEffectiveOrgId();
  return useQuery<ShoeDesign[]>({
    queryKey: ['designs', orgId, filters],
    queryFn: async () => {
      if (filters?.includeArchived) {
        return designsService.fetchAllDesigns({
          orgId: orgId || undefined,
          includeArchived: true,
          search: filters.search,
        });
      }
      return designsService.fetchDesigns({ ...filters, orgId: orgId || undefined });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache (realtime handles immediate updates)
    refetchOnWindowFocus: false,
  });
}
