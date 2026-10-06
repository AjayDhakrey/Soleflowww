import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService, RecordPaymentParams } from '../services/payments';
import { useEffectiveOrgId, useReadOnly } from '../context/ViewModeContext';

export const PAYMENTS_QUERY_KEY = ['payments'];
export const RECEIVABLES_QUERY_KEY = ['receivables'];
export const SALESMAN_COLLECTIONS_QUERY_KEY = ['salesman-collections'];

export function usePayments(filters?: { clientId?: string; salesmanName?: string; status?: string }) {
  const orgId = useEffectiveOrgId();

  return useQuery({
    queryKey: [...PAYMENTS_QUERY_KEY, orgId, filters],
    queryFn: () => paymentsService.fetchPayments({ ...filters, orgId: orgId ?? undefined }),
    staleTime: 1000 * 30,
  });
}

export function useReceivables() {
  const orgId = useEffectiveOrgId();

  return useQuery({
    queryKey: [...RECEIVABLES_QUERY_KEY, orgId],
    queryFn: () => paymentsService.fetchReceivables(orgId ?? undefined),
    staleTime: 1000 * 60,
  });
}

export function useSalesmanCollections() {
  const orgId = useEffectiveOrgId();

  return useQuery({
    queryKey: [...SALESMAN_COLLECTIONS_QUERY_KEY, orgId],
    queryFn: () => paymentsService.fetchSalesmanCollections(orgId ?? undefined),
    staleTime: 1000 * 30,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  const isReadOnly = useReadOnly();

  return useMutation({
    mutationFn: (params: RecordPaymentParams) => {
      if (isReadOnly) {
        throw new Error('Read-only view mode');
      }
      return paymentsService.recordPayment(params);
    },
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
  const isReadOnly = useReadOnly();

  return useMutation({
    mutationFn: (paymentId: string) => {
      if (isReadOnly) {
        throw new Error('Read-only view mode');
      }
      return paymentsService.clearCheque(paymentId);
    },
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
  const isReadOnly = useReadOnly();

  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason?: string }) => {
      if (isReadOnly) {
        throw new Error('Read-only view mode');
      }
      return paymentsService.bounceCheque(paymentId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SALESMAN_COLLECTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  const isReadOnly = useReadOnly();

  return useMutation({
    mutationFn: (paymentId: string) => {
      if (isReadOnly) {
        throw new Error('Read-only view mode');
      }
      return paymentsService.verifyPayment(paymentId);
    },
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
  const isReadOnly = useReadOnly();

  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason?: string }) => {
      if (isReadOnly) {
        throw new Error('Read-only view mode');
      }
      return paymentsService.reversePayment(paymentId, reason);
    },
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
