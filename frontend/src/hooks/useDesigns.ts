import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { designsService } from '../services/designs';

export const DESIGNS_QUERY_KEY = ['designs'];

export function useDesigns(filters?: { category?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: [...DESIGNS_QUERY_KEY, filters],
    queryFn: () => designsService.fetchDesigns(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDesign(id: string | null | undefined) {
  return useQuery({
    queryKey: [...DESIGNS_QUERY_KEY, 'detail', id],
    queryFn: () => (id ? designsService.fetchDesignById(id) : null),
    enabled: Boolean(id),
  });
}

export function useCreateDesign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => designsService.createDesign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESIGNS_QUERY_KEY });
    },
  });
}

export function useShareDesigns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { designIds: string[]; clientId?: string; channel?: string }) =>
      designsService.shareDesigns(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design_shares'] });
    },
  });
}
