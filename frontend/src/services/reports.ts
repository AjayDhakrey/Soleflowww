import {supabase, isDemoModeActive} from '../lib/supabase';
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

// app_settings keys that may hold the monthly booking target (checked like fetchAppSettings)
const MONTHLY_TARGET_KEYS = ['monthly_revenue_target', 'monthly_booking_target', 'monthly_target'];

export const reportsService = {
  async fetchAdminMetrics(): Promise<DashboardMetrics | null> {
    if (!supabase || isDemoModeActive) return null;

    try {
      const { data: recData, error: recError } = await supabase.from('v_receivables').select('total_outstanding, status');
      if (recError) throw parseSupabaseError(recError);
      const totalReceivables = (recData || []).reduce((acc, r: any) => acc + Number(r.total_outstanding || 0), 0);
      const overdueClientsCount = (recData || []).filter((r: any) => r.status === 'overdue').length;

      const { data: ordData, error: ordError } = await supabase.from('v_order_financials').select('net_payable, total_pairs, status, order_date_at');
      if (ordError) throw parseSupabaseError(ordError);
      const totalRevenue = (ordData || []).reduce((acc, o: any) => acc + Number(o.net_payable || 0), 0);
      const activeOrdersCount = (ordData || []).filter((o: any) => ['Approved', 'In Production', 'Ready QC', 'Ready to Dispatch'].includes(o.status)).length;
      const pairsInProduction = (ordData || []).filter((o: any) => o.status === 'In Production').reduce((acc, o: any) => acc + Number(o.total_pairs || 0), 0);

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const bookedThisMonth = (ordData || [])
        .filter((o: any) => o.order_date_at && new Date(o.order_date_at) >= monthStart)
        .reduce((acc, o: any) => acc + Number(o.net_payable || 0), 0);

      // Monthly target from app_settings (key/value), 0 when not configured
      let monthlyTarget = 0;
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', MONTHLY_TARGET_KEYS);
      (settingsData || []).forEach((setting) => {
        const val = typeof setting.value === 'number' ? setting.value : parseFloat(String(setting.value).replace(/[^0-9.]/g, ''));
        if (!isNaN(val) && val > 0) monthlyTarget = val;
      });

      return {
        totalRevenue,
        totalReceivables,
        activeOrdersCount,
        pairsInProduction,
        overdueClientsCount,
        monthlyTarget,
        bookedThisMonth,
      };
    } catch (err) {
      console.error('Error computing dashboard metrics from Supabase:', err);
      return null;
    }
  },

  async fetchDesignPerformance(): Promise<any[]> {
    if (!supabase || isDemoModeActive) return [];
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
