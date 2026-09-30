import { supabase } from '../lib/supabase';
import { Salesperson } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_SALES_TEAM } from '../data/mockData';

// DEPRECATED: SalesmanRow reference maintained for backward compatibility
export type SalesmanRow = any;
export type SalesTeamRow = Database['public']['Tables']['sales_team']['Row'];
export type SalesmanPerformanceRow = Database['public']['Views']['v_salesman_performance']['Row'];

export function mapSalesmanRow(row: any, perf?: any): Salesperson {
  return {
    id: row.id,
    name: row.name,
    roleTitle: row.roleTitle || 'Senior Rep',
    photo: row.photo || row.photo_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    zone: row.zone || 'North Zone',
    cluster: row.cluster || 'Agra & Kanpur Clusters',
    phone: row.phone || '',
    email: row.email || '',
    empId: row.empId || row.emp_id || 'SF-REP-01',
    monthlyTarget: Number(row.monthlyTarget ?? row.monthly_target ?? 1500000),
    bookedThisMonth: perf ? Number(perf.total_booked_value ?? perf.total_sales_value ?? 0) : Number(row.bookedThisMonth ?? row.booked_this_month ?? 0),
    commissionRate: Number(row.commissionRate ?? row.commission_rate ?? 4),
    commissionAccrued: Number(row.commissionAccrued ?? 60000),
    collectionDue: perf ? Number(perf.total_collections ?? perf.total_outstanding ?? 0) : Number(row.collectionDue ?? row.collection_due ?? 0),
    assignedAccountsCount: perf ? Number(perf.assigned_clients_count ?? 30) : (row.assignedAccountsCount ?? 30),
    todayVisitsDone: Number(row.todayVisitsDone ?? 4),
    todayVisitsTotal: Number(row.todayVisitsTotal ?? 6),
    chequesTodayAmount: Number(row.chequesTodayAmount ?? 100000),
    status: (row.status || 'In Market') as Salesperson['status'],
    assignedKit: row.assignedKit || row.assigned_kit || 'AW24 Sample Kit',
    kitVerifiedDate: row.kitVerifiedDate || row.kit_verified_date || 'Today',
    tasksChecklist: row.tasksChecklist || [],
  };
}

export const salesmenService = {
  async fetchSalesTeam(): Promise<Salesperson[]> {
    if (!supabase) return MOCK_SALES_TEAM;

    try {
      const { data, error } = await supabase
        .from('sales_team')
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (error) throw parseSupabaseError(error);
      if (!data || data.length === 0) return MOCK_SALES_TEAM;

      // Fetch performance view
      const { data: perfList } = await supabase.from('v_salesman_performance').select('*');

      return data.map((s) => {
        const perf = (perfList || []).find((p: any) => p.salesman_id === s.id || p.salesperson_id === s.id);
        return mapSalesmanRow(s, perf);
      });
    } catch (err) {
      console.warn('Error fetching sales team from Supabase:', err);
      return MOCK_SALES_TEAM;
    }
  },

  async updateSalesman(id: string, updates: any): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase
        .from('sales_team')
        .update(updates)
        .eq('id', id);

      if (error) throw parseSupabaseError(error);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update salesman' };
    }
  },
};

