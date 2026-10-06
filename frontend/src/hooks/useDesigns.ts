import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { designsService } from '../services/designs';
import { useEffectiveOrgId, useReadOnly } from '../context/ViewModeContext';

export const DESIGNS_QUERY_KEY = ['designs'];

export function useDesigns(filters?: { category?: string; status?: string; search?: string }) {
  const orgId = useEffectiveOrgId();

  return useQuery({
    queryKey: [...DESIGNS_QUERY_KEY, orgId, filters],
    queryFn: () => designsService.fetchDesigns({ ...filters, orgId: orgId ?? undefined }),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDesign(id: string | null | undefined) {
  const orgId = useEffectiveOrgId();

  return useQuery({
    queryKey: [...DESIGNS_QUERY_KEY, orgId, 'detail', id],
    queryFn: () => (id ? designsService.fetchDesignById(id) : null),
    enabled: Boolean(id),
  });
}

export function useCreateDesign() {
  const queryClient = useQueryClient();
  const isReadOnly = useReadOnly();

  return useMutation({
    mutationFn: (data: any) => {
      if (isReadOnly) {
        throw new Error('Read-only view mode');
      }
      return designsService.createDesign(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESIGNS_QUERY_KEY });
    },
  });
}

export function useShareDesigns() {
  const queryClient = useQueryClient();
  const isReadOnly = useReadOnly();

  return useMutation({
    mutationFn: (params: { designIds: string[]; clientId?: string; channel?: string }) => {
      if (isReadOnly) {
        throw new Error('Read-only view mode');
      }
      return designsService.shareDesigns(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design_shares'] });
    },
  });
}
