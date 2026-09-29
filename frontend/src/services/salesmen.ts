import { supabase } from '../lib/supabase';
import { Salesperson } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_SALES_TEAM } from '../data/mockData';

export type SalesmanRow = Database['public']['Tables']['salesmen']['Row'];
export type SalesmanPerformanceRow = Database['public']['Views']['v_salesman_performance']['Row'];

export function mapSalesmanRow(row: SalesmanRow, perf?: SalesmanPerformanceRow): Salesperson {
  return {
    id: row.id,
    name: row.name,
    roleTitle: 'Senior Rep',
    photo: row.photo_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    zone: row.zone || 'North Zone',
    cluster: row.cluster || 'Agra & Kanpur Clusters',
    phone: row.phone,
    email: row.email || '',
    empId: row.emp_id || 'SF-REP-01',
    monthlyTarget: Number(row.monthly_target || 1500000),
    bookedThisMonth: perf ? Number(perf.total_sales_value || 0) : Number(row.booked_this_month || 0),
    commissionRate: Number(row.commission_rate || 4),
    commissionAccrued: perf ? Number(perf.total_commission_accrued || 0) : 60000,
    collectionDue: perf ? Number(perf.total_outstanding || 0) : Number(row.collection_due || 0),
    assignedAccountsCount: perf ? Number(perf.assigned_clients_count || 0) : 30,
    todayVisitsDone: perf ? Number(perf.today_visits_done || 0) : 4,
    todayVisitsTotal: perf ? Number(perf.today_visits_total || 0) : 6,
    chequesTodayAmount: 100000,
    status: (row.status || 'In Market') as Salesperson['status'],
    assignedKit: row.assigned_kit || 'AW24 Sample Kit',
    kitVerifiedDate: row.kit_verified_date || 'Today',
    tasksChecklist: [],
  };
}

export const salesmenService = {
  async fetchSalesTeam(): Promise<Salesperson[]> {
    if (!supabase) return MOCK_SALES_TEAM;

    try {
      const { data, error } = await supabase
        .from('salesmen')
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (error) throw parseSupabaseError(error);
      if (!data || data.length === 0) return MOCK_SALES_TEAM;

      // Fetch performance view
      const { data: perfList } = await supabase.from('v_salesman_performance').select('*');

      return data.map((s) => {
        const perf = (perfList || []).find((p) => p.salesperson_id === s.id);
        return mapSalesmanRow(s, perf);
      });
    } catch (err) {
      console.warn('Error fetching salesmen from Supabase:', err);
      return MOCK_SALES_TEAM;
    }
  },

  async updateSalesman(id: string, updates: Partial<SalesmanRow>): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase
        .from('salesmen')
        .update(updates)
        .eq('id', id);

      if (error) throw parseSupabaseError(error);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update salesman' };
    }
  },
};
