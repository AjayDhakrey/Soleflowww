import { supabase, isDemoModeActive } from '../lib/supabase';
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
    roleTitle: (row.roleTitle || row.role_title || '') as Salesperson['roleTitle'],
    photo: row.photo || row.photo_url || '',
    zone: row.zone || '',
    cluster: row.cluster || '',
    phone: row.phone || '',
    email: row.email || '',
    empId: row.empId || row.emp_id || '',
    monthlyTarget: Number(row.monthlyTarget ?? row.monthly_target ?? 0),
    bookedThisMonth: perf ? Number(perf.total_booked_value ?? perf.total_sales_value ?? 0) : Number(row.bookedThisMonth ?? row.booked_this_month ?? 0),
    commissionRate: Number(row.commissionRate ?? row.commission_rate ?? 0),
    commissionAccrued: Number(row.commissionAccrued ?? row.commission_accrued ?? 0),
    collectionDue: perf ? Number(perf.total_collections ?? perf.total_outstanding ?? 0) : Number(row.collectionDue ?? row.collection_due ?? 0),
    assignedAccountsCount: perf ? Number(perf.assigned_clients_count ?? 0) : Number(row.assignedAccountsCount ?? row.assigned_accounts_count ?? 0),
    todayVisitsDone: Number(row.todayVisitsDone ?? row.today_visits_done ?? 0),
    todayVisitsTotal: Number(row.todayVisitsTotal ?? row.today_visits_total ?? 0),
    chequesTodayAmount: Number(row.chequesTodayAmount ?? row.cheques_today_amount ?? 0),
    status: (row.status || 'In Market') as Salesperson['status'],
    assignedKit: row.assignedKit || row.assigned_kit || '',
    kitVerifiedDate: row.kitVerifiedDate || row.kit_verified_date || '',
    tasksChecklist: row.tasksChecklist || [],
  };
}

export const salesmenService = {
  async fetchSalesTeam(): Promise<Salesperson[]> {
    if (!supabase || isDemoModeActive) return isDemoModeActive ? MOCK_SALES_TEAM : [];

    try {
      const { data, error } = await supabase
        .from('sales_team')
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (error) throw parseSupabaseError(error);
      if (!data || data.length === 0) return [];

      // Fetch performance view
      const { data: perfList } = await supabase.from('v_salesman_performance').select('*');

      return data.map((s) => {
        const perf = (perfList || []).find((p: any) => p.salesman_id === s.id || p.salesperson_id === s.id);
        return mapSalesmanRow(s, perf);
      });
    } catch (err) {
      console.error('Error fetching sales team from Supabase:', err);
      return [];
    }
  },

  async updateSalesman(id: string, updates: any): Promise<{ success: boolean; error?: string }> {
    if (!supabase || isDemoModeActive) return { success: true };

    try {
      const { error } = updates.tasksChecklist
        ? await supabase.rpc('set_sales_tasks', { p_salesman_id: id, p_tasks: updates.tasksChecklist })
        : await supabase.from('sales_team').update(updates).eq('id', id).select('id').single();

      if (error) throw parseSupabaseError(error);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update salesman' };
    }
  },
};

