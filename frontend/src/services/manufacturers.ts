import { supabase, isDemoModeActive } from '../lib/supabase';
import { Manufacturer } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_MANUFACTURERS } from '../data/mockData';

export type ManufacturerRow = Database['public']['Tables']['manufacturers']['Row'];

export function mapManufacturerRow(row: any): Manufacturer {
  return {
    id: row.id,
    companyName: row.companyName || row.name || '',
    hubLocation: row.hubLocation || row.location || '',
    estYear: Number(row.estYear ?? row.est_year ?? 0),
    primarySpecialization: row.primarySpecialization || row.primary_specialization || '',
    monthlyCapacityPairs: Number(row.monthlyCapacityPairs ?? row.monthly_capacity_pairs ?? 0),
    runningBatchesCount: Number(row.runningBatchesCount ?? row.active_batches_count ?? 0),
    onTimeDeliveryRate: Number(row.onTimeDeliveryRate ?? row.on_time_delivery_rate ?? 0),
    qcPassRatio: Number(row.qcPassRatio ?? row.qc_pass_ratio ?? 0),
    generalManager: row.generalManager || row.general_manager || '',
    phone: row.phone || '',
    loadPercentage: Number(row.loadPercentage ?? row.load_percentage ?? 0),
    status: (row.status || 'Active Plants') as Manufacturer['status'],
    toolingLeadTimeDays: Number(row.toolingLeadTimeDays ?? row.tooling_lead_time_days ?? 0),
    moldsActiveCount: Number(row.moldsActiveCount ?? row.molds_active_count ?? 0),
  };
}

export const manufacturersService = {
  async fetchManufacturers(): Promise<Manufacturer[]> {
    if (!supabase || isDemoModeActive) return isDemoModeActive ? MOCK_MANUFACTURERS : [];

    try {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (error) throw parseSupabaseError(error);
      if (!data || data.length === 0) return [];
      return data.map(mapManufacturerRow);
    } catch (err) {
      console.error('Error fetching manufacturers from Supabase:', err);
      return [];
    }
  },

  async createManufacturer(data: Partial<ManufacturerRow>): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase || isDemoModeActive) return { success: true };

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
    if (!supabase || isDemoModeActive) return { success: true };

    try {
      const { error } = await supabase
        .from('manufacturers')
        .update(updates)
        .eq('id', id).select('id').single();

      if (error) throw parseSupabaseError(error);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update manufacturer' };
    }
  },
};
