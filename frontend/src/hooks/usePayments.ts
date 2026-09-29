import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '../services/payments';

export const PAYMENTS_QUERY_KEY = ['payments'];
export const RECEIVABLES_QUERY_KEY = ['receivables'];

export function usePayments(filters?: { clientId?: string; salespersonId?: string }) {
  return useQuery({
    queryKey: [...PAYMENTS_QUERY_KEY, filters],
    queryFn: () => paymentsService.fetchPayments(filters),
    staleTime: 1000 * 60,
  });
}

export function useReceivables() {
  return useQuery({
    queryKey: RECEIVABLES_QUERY_KEY,
    queryFn: () => paymentsService.fetchReceivables(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { payment: any; allocations?: any[] }) =>
      paymentsService.recordPayment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RECEIVABLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
