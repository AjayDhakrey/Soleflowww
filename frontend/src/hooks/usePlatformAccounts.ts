import { useQuery } from '@tanstack/react-query';
import {supabase, isDemoModeActive} from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';

export interface PlatformAccount {
  org_id: string;
  name: string;
  status: 'active' | 'suspended';
  is_demo: boolean;
  created_at: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  admin_count: number;
  sales_rep_count: number;
  pending_invites: number;
  customers_count: number;
  designs_count: number;
  orders_count: number;
  orders_last_30d: number;
  payments_count: number;
  total_order_value: number;
  total_collected: number;
  total_outstanding: number;
  last_activity_at: string;
  days_since_last_activity: number;
  setup_steps_done: number;
  setup_percent: number;
  health: 'active' | 'slowing' | 'inactive' | 'new';
}

export interface TimelineEvent {
  id: string;
  event_type: string;
  title: string;
  description: string;
  actor_name: string;
  created_at: string;
}

export const PLATFORM_ACCOUNTS_QUERY_KEY = ['platform_accounts'];

export function usePlatformAccounts() {
  const { isSuperAdmin, isDemoAccount } = useAuth();

  return useQuery<PlatformAccount[]>({
    queryKey: [...PLATFORM_ACCOUNTS_QUERY_KEY, isDemoAccount],
    queryFn: async () => {
      if (!supabase || isDemoModeActive) {
        return [];
      }

      // 1. Primary source: the platform_accounts_overview RPC
      try {
        const { data, error } = await supabase.rpc('platform_accounts_overview');
        if (!error && data) {
          return data as PlatformAccount[];
        }
      } catch {
        // Fall through to the organizations query below
      }

      // 2. Fallback: list organizations with honest (empty) metrics — never
      // fabricate usage numbers for real orgs.
      let query = supabase.from('organizations').select('*').order('created_at', { ascending: false });
      if (isDemoAccount) {
        query = query.eq('is_demo', true);
      }

      const { data: orgs, error: orgsErr } = await query;
      if (orgsErr) {
        throw orgsErr;
      }
      return (orgs || []).map((o: any) => ({
        org_id: o.id,
        name: o.name,
        status: o.status || 'active',
        is_demo: Boolean(o.is_demo),
        created_at: o.created_at || new Date().toISOString(),
        owner_name: '',
        owner_email: o.phone || '',
        owner_phone: o.phone || '',
        admin_count: 0,
        sales_rep_count: 0,
        pending_invites: 0,
        customers_count: 0,
        designs_count: 0,
        orders_count: 0,
        orders_last_30d: 0,
        payments_count: 0,
        total_order_value: 0,
        total_collected: 0,
        total_outstanding: 0,
        last_activity_at: o.updated_at || o.created_at || new Date().toISOString(),
        days_since_last_activity: 0,
        setup_steps_done: 0,
        setup_percent: 0,
        health: 'new',
      })) as PlatformAccount[];
    },
    enabled: isSuperAdmin,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePlatformAccountTimeline(orgId: string | null) {
  return useQuery<TimelineEvent[]>({
    queryKey: ['platform_account_timeline', orgId],
    queryFn: async () => {
      if (!orgId) return [];

      if (!supabase || isDemoModeActive) {
        return [];
      }

      try {
        const { data, error } = await supabase.rpc('platform_account_timeline', {
          p_org: orgId,
          p_limit: 50,
        });

        if (!error && data) {
          return data as TimelineEvent[];
        }
      } catch {
        // Fall through to the activity_events query below
      }

      try {
        const { data: actEvents, error: actErr } = await supabase
          .from('activity_events')
          .select('*')
          .eq('org_id', orgId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!actErr && actEvents && actEvents.length > 0) {
          return actEvents.map((a: any) => ({
            id: a.id,
            event_type: a.category || 'activity',
            title: a.title,
            description: a.description || '',
            actor_name: a.actor_name || 'Team Member',
            created_at: a.created_at,
          }));
        }
      } catch {
        // Fall through to the empty result below
      }

      return [];
    },
    enabled: Boolean(orgId),
    staleTime: 1000 * 60,
  });
}
