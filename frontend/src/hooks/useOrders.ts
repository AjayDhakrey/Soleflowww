import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '../services/orders';

export const ORDERS_QUERY_KEY = ['orders'];

export function useOrders(filters?: {
  status?: string;
  clientId?: string;
  salespersonId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, filters],
    queryFn: () => ordersService.fetchOrders(filters),
    staleTime: 1000 * 60,
  });
}

export function useOrder(orderId: string | null | undefined) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, 'detail', orderId],
    queryFn: () => (orderId ? ordersService.fetchOrderById(orderId) : null),
    enabled: Boolean(orderId),
  });
}

export function useCreateOrderDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { order: any; items: any[] }) => ordersService.createOrderDraft(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useAdvanceOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { orderId: string; newStatus: string; note?: string; manufacturerId?: string }) =>
      ordersService.advanceOrderStatus(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ORDERS_QUERY_KEY, 'detail', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
    },
  });
}
