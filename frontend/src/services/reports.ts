import { supabase } from '../lib/supabase';
import { parseSupabaseError } from './apiError';

export interface DashboardMetrics {
  totalRevenue: number;
  totalReceivables: number;
  activeOrdersCount: number;
  pairsInProduction: number;
  overdueClientsCount: number;
  monthlyTarget: number;
  bookedThisMonth: number;
}

export const reportsService = {
  async fetchAdminMetrics(): Promise<DashboardMetrics> {
    if (!supabase) {
      return {
        totalRevenue: 8640000,
        totalReceivables: 685000,
        activeOrdersCount: 14,
        pairsInProduction: 4200,
        overdueClientsCount: 2,
        monthlyTarget: 5000000,
        bookedThisMonth: 3840000,
      };
    }

    try {
      const { data: recData } = await supabase.from('v_receivables').select('total_outstanding, status');
      const totalReceivables = (recData || []).reduce((acc, r: any) => acc + Number(r.total_outstanding || 0), 0);
      const overdueClientsCount = (recData || []).filter((r: any) => r.status === 'overdue').length;

      const { data: ordData } = await supabase.from('v_order_financials').select('net_payable, total_pairs, status');
      const totalRevenue = (ordData || []).reduce((acc, o: any) => acc + Number(o.net_payable || 0), 0);
      const activeOrdersCount = (ordData || []).filter((o: any) => ['Approved', 'In Production', 'Ready QC', 'Ready to Dispatch'].includes(o.status)).length;
      const pairsInProduction = (ordData || []).filter((o: any) => o.status === 'In Production').reduce((acc, o: any) => acc + Number(o.total_pairs || 0), 0);

      return {
        totalRevenue,
        totalReceivables,
        activeOrdersCount,
        pairsInProduction,
        overdueClientsCount,
        monthlyTarget: 5000000,
        bookedThisMonth: totalRevenue,
      };
    } catch (err) {
      console.warn('Error computing dashboard metrics from Supabase:', err);
      return {
        totalRevenue: 8640000,
        totalReceivables: 685000,
        activeOrdersCount: 14,
        pairsInProduction: 4200,
        overdueClientsCount: 2,
        monthlyTarget: 5000000,
        bookedThisMonth: 3840000,
      };
    }
  },

  async fetchDesignPerformance(): Promise<any[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase.from('v_design_performance').select('*').limit(10);
      if (error) throw parseSupabaseError(error);
      return data || [];
    } catch (err) {
      console.warn('Error fetching design performance:', err);
      return [];
    }
  },
};
