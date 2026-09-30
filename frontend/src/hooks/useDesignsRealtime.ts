import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { fromDesignRow } from '../services/designs';

interface UseDesignsRealtimeOptions {
  isSalesperson?: boolean;
  onNewDesign?: (name: string, articleCode: string) => void;
}

export function useDesignsRealtime(options?: UseDesignsRealtimeOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase) return;

    const designsChannel = supabase
      .channel('designs-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'designs' },
        (payload) => {
          // Immediately invalidate all designs queries to pull freshest data
          queryClient.invalidateQueries({ queryKey: ['designs'] });

          if (payload.eventType === 'INSERT') {
            const newRow = payload.new;
            if (options?.isSalesperson && options?.onNewDesign) {
              const name = newRow.name || newRow.articleCode || 'New Design';
              const articleCode = newRow.articleCode || '';
              options.onNewDesign(name, articleCode);
            }
          }
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
