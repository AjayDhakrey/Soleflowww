import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useRealtimeSubscriptions(userId?: string | null, onNotification?: (msg: string) => void) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase) return;

    // Listen to orders table changes
    const ordersChannel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
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
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
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
  }, [queryClient, userId, onNotification]);
}
