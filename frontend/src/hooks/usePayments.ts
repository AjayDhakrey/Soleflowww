import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService, RecordPaymentParams } from '../services/payments';

export const PAYMENTS_QUERY_KEY = ['payments'];
export const RECEIVABLES_QUERY_KEY = ['receivables'];
export const SALESMAN_COLLECTIONS_QUERY_KEY = ['salesman-collections'];

export function usePayments(filters?: { clientId?: string; salesmanName?: string; status?: string }) {
  return useQuery({
    queryKey: [...PAYMENTS_QUERY_KEY, filters],
    queryFn: () => paymentsService.fetchPayments(filters),
    staleTime: 1000 * 30,
  });
}

export function useReceivables() {
  return useQuery({
    queryKey: RECEIVABLES_QUERY_KEY,
    queryFn: () => paymentsService.fetchReceivables(),
    staleTime: 1000 * 60,
  });
}

export function useSalesmanCollections() {
  return useQuery({
    queryKey: SALESMAN_COLLECTIONS_QUERY_KEY,
    queryFn: () => paymentsService.fetchSalesmanCollections(),
    staleTime: 1000 * 30,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: RecordPaymentParams) =>
      paymentsService.recordPayment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RECEIVABLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SALESMAN_COLLECTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['customer-metrics'] });
    },
  });
}

export function useClearCheque() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => paymentsService.clearCheque(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RECEIVABLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SALESMAN_COLLECTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['customer-metrics'] });
    },
  });
}

export function useBounceCheque() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason?: string }) =>
      paymentsService.bounceCheque(paymentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SALESMAN_COLLECTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => paymentsService.verifyPayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RECEIVABLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SALESMAN_COLLECTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useReversePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason?: string }) =>
      paymentsService.reversePayment(paymentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RECEIVABLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SALESMAN_COLLECTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['customer-metrics'] });
    },
  });
}
