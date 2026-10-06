import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {supabase, isDemoModeActive} from '../lib/supabase';
import { useEffectiveOrgId } from '../context/ViewModeContext';

export function useRealtimeSubscriptions(userId?: string | null, onNotification?: (msg: string) => void) {
  const queryClient = useQueryClient();
  const effectiveOrgId = useEffectiveOrgId();

  useEffect(() => {
    if (!supabase || isDemoModeActive) return;

    const filterClause = effectiveOrgId ? `org_id=eq.${effectiveOrgId}` : undefined;

    // Listen to orders table changes scoped to effective org
    const ordersChannel = supabase
      .channel(`orders-realtime-${effectiveOrgId || 'global'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          ...(filterClause ? { filter: filterClause } : {}),
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['receivables'] });
          queryClient.invalidateQueries({ queryKey: ['clients'] });
          if (onNotification) {
            onNotification(`Order status updated: ${(payload.new as any)?.id || ''}`);
          }
        }
      )
      .subscribe();

    // Listen to notifications table
    const notificationsChannel = supabase
      .channel(`notifications-realtime-${effectiveOrgId || 'global'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          ...(filterClause ? { filter: filterClause } : {}),
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          if (onNotification) {
            onNotification(`New notification: ${(payload.new as any)?.title || ''}`);
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(ordersChannel);
        supabase.removeChannel(notificationsChannel);
      }
    };
  }, [queryClient, userId, effectiveOrgId, onNotification]);
}
