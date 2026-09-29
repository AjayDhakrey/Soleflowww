import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '../services/clients';
import { Customer } from '../types';

export const CLIENTS_QUERY_KEY = ['clients'];

export function useClients(filters?: { search?: string; status?: string; tier?: string; salespersonId?: string }) {
  return useQuery({
    queryKey: [...CLIENTS_QUERY_KEY, filters],
    queryFn: () => clientsService.fetchClients(filters),
    staleTime: 1000 * 60 * 2, // 2 mins
  });
}

export function useClient(clientId: string | null | undefined) {
  return useQuery({
    queryKey: [...CLIENTS_QUERY_KEY, 'detail', clientId],
    queryFn: () => (clientId ? clientsService.fetchClientById(clientId) : null),
    enabled: Boolean(clientId),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientData: any) => clientsService.createClient(clientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      clientsService.updateClient(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...CLIENTS_QUERY_KEY, 'detail', variables.id] });
    },
  });
}

export function useArchiveClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => clientsService.archiveClient(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
    },
  });
}
