import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { fromDesignRow } from '../services/designs';
import { ShoeDesign } from '../types';

interface UseDesignsRealtimeOptions {
  isSalesperson?: boolean;
  onNewDesign?: (name: string, articleCode: string) => void;
}

export function useDesignsRealtime(options?: UseDesignsRealtimeOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase) return;

    const channelName = `designs-realtime-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const designsChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'designs' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newDesign = fromDesignRow(payload.new);
            queryClient.setQueriesData<ShoeDesign[]>({ queryKey: ['designs'] }, (old) => {
              if (!old) return [newDesign];
              if (
                old.some(
                  (d) =>
                    d.id === newDesign.id ||
                    (d.articleCode && d.articleCode.toLowerCase() === newDesign.articleCode.toLowerCase())
                )
              ) {
                return old.map((d) =>
                  d.id === newDesign.id ||
                  (d.articleCode && d.articleCode.toLowerCase() === newDesign.articleCode.toLowerCase())
                    ? newDesign
                    : d
                );
              }
              return [newDesign, ...old];
            });

            if (options?.isSalesperson && options?.onNewDesign) {
              const name = newDesign.name || newDesign.articleCode || 'New Footwear Design';
              const articleCode = newDesign.articleCode || '';
              options.onNewDesign(name, articleCode);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedDesign = fromDesignRow(payload.new);
            queryClient.setQueriesData<ShoeDesign[]>({ queryKey: ['designs'] }, (old) => {
              if (!old) return [updatedDesign];
              return old.map((d) => (d.id === updatedDesign.id ? updatedDesign : d));
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              queryClient.setQueriesData<ShoeDesign[]>({ queryKey: ['designs'] }, (old) => {
                if (!old) return [];
                return old.filter((d) => d.id !== deletedId);
              });
            }
          }

          // Invalidate to guarantee full sync with DB state
          queryClient.invalidateQueries({ queryKey: ['designs'] });
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(designsChannel);
      }
    };
  }, [queryClient, options?.isSalesperson, options?.onNewDesign]);
}
