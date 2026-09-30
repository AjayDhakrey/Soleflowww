import { supabase } from '../lib/supabase';
import { FieldVisitItem } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_FIELD_VISITS } from '../data/mockData';

export type FieldVisitRow = Database['public']['Tables']['field_visits']['Row'];

export function mapFieldVisitRow(row: any): FieldVisitItem {
  return {
    id: row.id,
    customerId: row.client_id,
    customerName: row.customerName || 'Client Store',
    location: row.location || 'Agra Footwear Market',
    time: row.visit_time || (row.visit_date ? new Date(row.visit_date).toLocaleDateString('en-IN') : '10:30 AM'),
    purpose: row.purpose || 'Routine Relationship Visit',
    status: (row.status || 'today') as FieldVisitItem['status'],
    outcome: (row.outcome as FieldVisitItem['outcome']) || undefined,
    notes: row.notes || undefined,
  };
}

export const visitsService = {
  async fetchVisits(filters?: { status?: string; salespersonId?: string }): Promise<FieldVisitItem[]> {
    if (!supabase) return MOCK_FIELD_VISITS;

    try {
      let query = supabase
        .from('field_visits')
        .select('*')
        .order('visit_date', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.salespersonId) {
        query = query.eq('salesperson_id', filters.salespersonId);
      }

      const { data, error } = await query;
      if (error) throw parseSupabaseError(error);

      if (!data || data.length === 0) return MOCK_FIELD_VISITS;
      return data.map(mapFieldVisitRow);
    } catch (err) {
      console.warn('Error fetching field visits from Supabase:', err);
      return MOCK_FIELD_VISITS;
    }
  },

  async createVisit(data: Partial<FieldVisitRow>): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase) return { success: true };

    try {
      const { data: res, error } = await supabase
        .from('field_visits')
        .insert([data as any])
        .select()
        .single();

      if (error) throw parseSupabaseError(error);
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to record field visit' };
    }
  },

  async completeVisit(
    id: string,
    outcome?: FieldVisitItem['outcome'],
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase
        .from('field_visits')
        .update({
          status: 'completed',
          outcome: outcome || 'Interested',
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw parseSupabaseError(error);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to complete field visit' };
    }
  },
};
