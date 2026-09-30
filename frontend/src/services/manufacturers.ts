import { supabase } from '../lib/supabase';
import { Manufacturer } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_MANUFACTURERS } from '../data/mockData';

export type ManufacturerRow = Database['public']['Tables']['manufacturers']['Row'];

export function mapManufacturerRow(row: any): Manufacturer {
  return {
    id: row.id,
    companyName: row.companyName || row.name || 'Footwear Manufacturer',
    hubLocation: row.hubLocation || row.location || 'Agra Hub',
    estYear: Number(row.estYear ?? row.est_year ?? 2011),
    primarySpecialization: row.primarySpecialization || row.primary_specialization || 'Footwear Assembly',
    monthlyCapacityPairs: Number(row.monthlyCapacityPairs ?? row.monthly_capacity_pairs ?? 50000),
    runningBatchesCount: Number(row.runningBatchesCount ?? row.active_batches_count ?? 0),
    onTimeDeliveryRate: Number(row.onTimeDeliveryRate ?? row.on_time_delivery_rate ?? 95),
    qcPassRatio: Number(row.qcPassRatio ?? row.qc_pass_ratio ?? 98),
    generalManager: row.generalManager || row.general_manager || 'Satish Gupta',
    phone: row.phone || '+91 98290 11223',
    loadPercentage: Number(row.loadPercentage ?? row.load_percentage ?? 50),
    status: (row.status || 'Active Plants') as Manufacturer['status'],
    toolingLeadTimeDays: Number(row.toolingLeadTimeDays ?? row.tooling_lead_time_days ?? 5),
    moldsActiveCount: Number(row.moldsActiveCount ?? row.molds_active_count ?? 12),
  };
}

export const manufacturersService = {
  async fetchManufacturers(): Promise<Manufacturer[]> {
    if (!supabase) return MOCK_MANUFACTURERS;

    try {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (error) throw parseSupabaseError(error);
      if (!data || data.length === 0) return MOCK_MANUFACTURERS;
      return data.map(mapManufacturerRow);
    } catch (err) {
      console.warn('Error fetching manufacturers from Supabase; using mock data:', err);
      return MOCK_MANUFACTURERS;
    }
  },

  async createManufacturer(data: Partial<ManufacturerRow>): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase) return { success: true };

    try {
      const { data: res, error } = await supabase
        .from('manufacturers')
        .insert([data as any])
        .select()
        .single();

      if (error) throw parseSupabaseError(error);
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create manufacturer' };
    }
  },

  async updateManufacturer(id: string, updates: Partial<ManufacturerRow>): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase
        .from('manufacturers')
        .update(updates)
        .eq('id', id);

      if (error) throw parseSupabaseError(error);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update manufacturer' };
    }
  },
};
