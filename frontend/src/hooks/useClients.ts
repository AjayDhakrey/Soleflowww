import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '../services/clients';
import { Customer } from '../types';
import { useEffectiveOrgId, useReadOnly } from '../context/ViewModeContext';

export const CLIENTS_QUERY_KEY = ['clients'];

export function useClients(filters?: { search?: string; status?: string; tier?: string; salespersonId?: string }) {
  const orgId = useEffectiveOrgId();

  return useQuery({
    queryKey: [...CLIENTS_QUERY_KEY, orgId, filters],
    queryFn: () => clientsService.fetchClients({ ...filters, orgId: orgId ?? undefined }),
    staleTime: 1000 * 60 * 2, // 2 mins
  });
}

export function useClient(clientId: string | null | undefined) {
  const orgId = useEffectiveOrgId();

  return useQuery({
    queryKey: [...CLIENTS_QUERY_KEY, orgId, 'detail', clientId],
    queryFn: () => (clientId ? clientsService.fetchClientById(clientId) : null),
    enabled: Boolean(clientId),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const isReadOnly = useReadOnly();

  return useMutation({
    mutationFn: (clientData: any) => {
      if (isReadOnly) {
        throw new Error('Read-only view mode');
      }
      return clientsService.createClient(clientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const isReadOnly = useReadOnly();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => {
      if (isReadOnly) {
        throw new Error('Read-only view mode');
      }
      return clientsService.updateClient(id, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...CLIENTS_QUERY_KEY, 'detail', variables.id] });
    },
  });
}

export function useArchiveClient() {
  const queryClient = useQueryClient();
  const isReadOnly = useReadOnly();

  return useMutation({
    mutationFn: (clientId: string) => {
      if (isReadOnly) {
        throw new Error('Read-only view mode');
      }
      return clientsService.archiveClient(clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
    },
  });
}
