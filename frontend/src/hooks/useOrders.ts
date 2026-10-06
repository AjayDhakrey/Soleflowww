import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '../services/orders';
import { useEffectiveOrgId, useReadOnly } from '../context/ViewModeContext';

export const ORDERS_QUERY_KEY = ['orders'];

export function useOrders(filters?: {
  status?: string;
  clientId?: string;
  salespersonId?: string;
  search?: string;
}) {
  const orgId = useEffectiveOrgId();

  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, orgId, filters],
    queryFn: () => ordersService.fetchOrders({ ...filters, orgId: orgId ?? undefined }),
    staleTime: 1000 * 60,
  });
}

export function useOrder(orderId: string | null | undefined) {
  const orgId = useEffectiveOrgId();

  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, orgId, 'detail', orderId],
    queryFn: () => (orderId ? ordersService.fetchOrderById(orderId) : null),
    enabled: Boolean(orderId),
  });
}

export function useCreateOrderDraft() {
  const queryClient = useQueryClient();
  const isReadOnly = useReadOnly();

  return useMutation({
    mutationFn: (params: { order: any; items: any[] }) => {
      if (isReadOnly) {
        throw new Error('Read-only view mode');
      }
      return ordersService.createOrderDraft(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useAdvanceOrderStatus() {
  const queryClient = useQueryClient();
  const isReadOnly = useReadOnly();

  return useMutation({
    mutationFn: (params: { orderId: string; newStatus: string; note?: string; manufacturerId?: string }) => {
      if (isReadOnly) {
        throw new Error('Read-only view mode');
      }
      return ordersService.advanceOrderStatus(params);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ORDERS_QUERY_KEY, 'detail', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
    },
  });
}
