import { supabase, isDemoModeActive } from '../lib/supabase';
import { FieldVisitItem } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_FIELD_VISITS } from '../data/mockData';

export type FieldVisitRow = Database['public']['Tables']['field_visits']['Row'];

export function mapFieldVisitRow(row: any): FieldVisitItem {
  return {
    id: row.id,
    customerId: row.client_id,
    customerName: row.customerName || row.customer_name || '',
    location: row.location || '',
    time: row.visit_time || (row.visit_date ? new Date(row.visit_date).toLocaleDateString('en-IN') : ''),
    purpose: row.purpose || '',
    status: (row.status || 'today') as FieldVisitItem['status'],
    outcome: (row.outcome as FieldVisitItem['outcome']) || undefined,
    notes: row.notes || undefined,
  };
}

export const visitsService = {
  async fetchVisits(filters?: { status?: string; salespersonId?: string }): Promise<FieldVisitItem[]> {
    if (!supabase) return MOCK_FIELD_VISITS;

    try {
      let query = (supabase as any)
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
      if (error) {
        console.warn('Supabase fetchVisits warning:', error);
        return MOCK_FIELD_VISITS;
      }

      if (!data || data.length === 0) return MOCK_FIELD_VISITS;
      return data.map(mapFieldVisitRow);
    } catch (err) {
      console.warn('Error fetching field visits from Supabase:', err);
      return MOCK_FIELD_VISITS;
    }
  },

  async createVisit(data: any): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase) return { success: true };

    try {
      const payload = {
        client_id: data.client_id || data.customerId,
        salesperson_id: data.salesperson_id || data.salespersonId || null,
        salesperson_name: data.salesperson_name || data.salespersonName || 'Sales Rep',
        visit_date: data.visit_date || new Date().toISOString().split('T')[0],
        location: data.location || '',
        purpose: data.purpose || 'Store Visit',
        outcome: data.outcome || null,
        notes: data.notes || null,
        status: data.status || 'today',
      };

      const { data: res, error } = await (supabase as any)
        .from('field_visits')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.warn('Supabase createVisit warning:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data: res };
    } catch (err: any) {
      console.warn('Supabase createVisit exception:', err);
      return { success: false, error: err?.message || 'Failed to record field visit' };
    }
  },

  async completeVisit(
    id: string,
    outcome: FieldVisitItem['outcome'] = 'Interested',
    notes: string = ''
  ): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: true };

    try {
      const { error } = await (supabase as any)
        .from('field_visits')
        .update({
          status: 'completed',
          outcome: outcome || 'Interested',
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.warn('Supabase completeVisit warning:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase completeVisit exception:', err);
      return { success: false, error: err?.message || 'Failed to complete field visit' };
    }
  },
};
