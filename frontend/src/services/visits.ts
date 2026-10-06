import { supabase, isDemoModeActive } from '../lib/supabase';
import { FieldVisitItem } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_FIELD_VISITS } from '../data/mockData';

export type FieldVisitRow = Database['public']['Tables']['field_visits']['Row'];

export function mapFieldVisitRow(row: any): FieldVisitItem {
  let purpose = row.purpose || 'Store Visit';
  let location = row.location || '';
  if (!location && purpose.includes('[') && purpose.endsWith(']')) {
    const startIdx = purpose.lastIndexOf('[');
    location = purpose.substring(startIdx + 1, purpose.length - 1);
    purpose = purpose.substring(0, startIdx).trim();
  }

  const custName = row.customers?.businessName || row.customerName || row.customer_name || 'Client Store';
  const custLoc = row.customers?.city ? `${row.customers.city}, ${row.customers.state || 'UP'}` : (location || 'Agra Marketplace');

  return {
    id: String(row.id),
    customerId: row.client_id,
    customerName: custName,
    location: custLoc,
    time: row.visit_time || (row.visit_date ? new Date(row.visit_date).toLocaleDateString('en-IN') : 'Today'),
    purpose: purpose,
    status: (row.status === 'completed' ? 'completed' : 'today') as FieldVisitItem['status'],
    outcome: (row.outcome as FieldVisitItem['outcome']) || undefined,
    notes: row.notes || undefined,
  };
}

export function sanitizeVisitStatus(rawStatus?: string): 'planned' | 'completed' | 'missed' {
  const s = (rawStatus || '').toLowerCase();
  if (s === 'completed') return 'completed';
  if (s === 'missed') return 'missed';
  return 'planned';
}

export const visitsService = {
  async fetchVisits(filters?: { status?: string; salespersonId?: string }): Promise<FieldVisitItem[]> {
    if (!supabase) return MOCK_FIELD_VISITS;

    try {
      let query = (supabase as any)
        .from('field_visits')
        .select('*, customers(businessName, city, state)')
        .order('visit_date', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        const dbStatus = sanitizeVisitStatus(filters.status);
        query = query.eq('status', dbStatus);
      }
      if (filters?.salespersonId) {
        query = query.eq('salesperson_id', filters.salespersonId);
      }

      const { data, error } = await query;
      if (error) {
        // Fallback to simple select if join fails
        const fallbackRes = await (supabase as any)
          .from('field_visits')
          .select('*')
          .order('visit_date', { ascending: false });
        if (!fallbackRes.error && fallbackRes.data && fallbackRes.data.length > 0) {
          return fallbackRes.data.map(mapFieldVisitRow);
        }
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
      const rawPurpose = data.purpose || 'Store Visit';
      const rawLocation = data.location ? ` [${data.location}]` : '';
      const finalPurpose = `${rawPurpose}${rawLocation}`;

      const payload: any = {
        client_id: data.client_id || data.customerId,
        salesperson_id: data.salesperson_id || data.salespersonId || null,
        salesperson_name: data.salesperson_name || data.salespersonName || 'Sales Rep',
        visit_date: data.visit_date || new Date().toISOString().split('T')[0],
        purpose: finalPurpose,
        outcome: data.outcome || null,
        notes: data.notes || null,
        status: sanitizeVisitStatus(data.status),
      };

      const updateFields: any = {
        purpose: payload.purpose,
        outcome: payload.outcome,
        notes: payload.notes,
        status: payload.status,
        salesperson_name: payload.salesperson_name,
      };

      // 1. Proactively check if a visit already exists for this client today to avoid 409 Conflict
      try {
        const { data: existingVisits } = await (supabase as any)
          .from('field_visits')
          .select('id')
          .eq('client_id', payload.client_id)
          .eq('visit_date', payload.visit_date)
          .limit(1);

        if (existingVisits && existingVisits.length > 0) {
          const existingId = existingVisits[0].id;
          const { data: updatedVisit, error: updateErr } = await (supabase as any)
            .from('field_visits')
            .update(updateFields)
            .eq('id', existingId)
            .select()
            .single();

          if (!updateErr && updatedVisit) {
            return { success: true, data: updatedVisit };
          }
          if (updateErr) {
            console.warn('Field visit pre-check update error:', updateErr);
          }
        }
      } catch (checkErr) {
        console.warn('Field visit pre-check ignored:', checkErr);
      }

      // 2. Insert new field visit if none exists
      let { data: res, error } = await (supabase as any)
        .from('field_visits')
        .insert([payload])
        .select()
        .single();

      // If foreign key fails on salesperson_id, retry with null
      if (error && (error.message?.includes('sales_team') || error.message?.includes('violates foreign key') || error.code === '23503')) {
        const fallbackPayload = { ...payload, salesperson_id: null };
        const retry = await (supabase as any)
          .from('field_visits')
          .insert([fallbackPayload])
          .select()
          .single();
        if (!retry.error) {
          return { success: true, data: retry.data };
        }
        error = retry.error;
      }

      // Fallback: If 409 Conflict still encountered, update existing visit record
      if (error && (error.code === '23505' || (error as any).status === 409 || error.message?.includes('duplicate') || error.message?.includes('unique') || error.message?.includes('Conflict') || error.message?.includes('conflict'))) {
        const updateRes = await (supabase as any)
          .from('field_visits')
          .update(updateFields)
          .eq('client_id', payload.client_id)
          .eq('visit_date', payload.visit_date)
          .select()
          .maybeSingle();

        if (!updateRes.error && updateRes.data) {
          return { success: true, data: updateRes.data };
        }
        if (updateRes.error) {
          error = updateRes.error;
        }
      }

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
