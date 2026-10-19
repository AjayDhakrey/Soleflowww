import { supabase, isDemoModeActive, toValidOrgId } from '../lib/supabase';
import { FieldVisitItem } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_FIELD_VISITS } from '../data/mockData';

export type FieldVisitRow = Database['public']['Tables']['field_visits']['Row'];

export function mapFieldVisitRow(row: any): FieldVisitItem {
  let purpose = row.purpose || 'Store Visit';
  let location = row.location || '';
  let time = row.visit_time || row.time || '';

  if (purpose.includes('[Time:') && purpose.endsWith(']')) {
    const timeIdx = purpose.lastIndexOf('[Time:');
    time = purpose.substring(timeIdx + 6, purpose.length - 1).trim();
    purpose = purpose.substring(0, timeIdx).trim();
  }

  if (!location && purpose.includes('[') && purpose.endsWith(']')) {
    const startIdx = purpose.lastIndexOf('[');
    location = purpose.substring(startIdx + 1, purpose.length - 1);
    purpose = purpose.substring(0, startIdx).trim();
  }

  if (!time) {
    time = row.visit_date ? new Date(row.visit_date).toLocaleDateString('en-IN') : 'Today';
  }

  const custName = row.customers?.businessName || row.customerName || row.customer_name || 'Client Store';
  const custLoc = row.customers?.city ? `${row.customers.city}, ${row.customers.state || 'UP'}` : (location || 'Agra Marketplace');

  return {
    id: String(row.id),
    customerId: row.client_id,
    customerName: custName,
    location: custLoc,
    time: time,
    purpose: purpose,
    status: (row.status === 'completed' ? 'completed' : 'today') as FieldVisitItem['status'],
    outcome: (row.outcome as FieldVisitItem['outcome']) || undefined,
    notes: row.notes || undefined,
    salesperson_id: row.salesperson_id || undefined,
    salesperson_name: row.salesperson_name || undefined,
    org_id: row.org_id || undefined,
  };
}

export function sanitizeVisitStatus(rawStatus?: string): 'planned' | 'completed' | 'missed' {
  const s = (rawStatus || '').toLowerCase();
  if (s === 'completed') return 'completed';
  if (s === 'missed') return 'missed';
  return 'planned';
}

export const visitsService = {
  async fetchVisits(filters?: { status?: string; salespersonId?: string; orgId?: string }): Promise<FieldVisitItem[]> {
    if (!supabase) return [];

    try {
      let query = (supabase as any)
        .from('field_visits')
        .select('*, customers(businessName, city, state)')
        .order('visit_date', { ascending: false });

      if (filters?.salespersonId && filters?.orgId) {
        query = query.or(`salesperson_id.eq.${filters.salespersonId},org_id.eq.${toValidOrgId(filters.orgId)}`);
      } else if (filters?.salespersonId) {
        query = query.eq('salesperson_id', filters.salespersonId);
      } else if (filters?.orgId) {
        query = query.eq('org_id', toValidOrgId(filters.orgId));
      }

      if (filters?.status && filters.status !== 'all') {
        const dbStatus = sanitizeVisitStatus(filters.status);
        query = query.eq('status', dbStatus);
      }

      const { data, error } = await query;
      if (error) throw parseSupabaseError(error);
      if (!data) return [];
      return data.map(mapFieldVisitRow);
    } catch (err) {
      console.warn('Error fetching field visits from Supabase:', err);
      return [];
    }
  },

  async createVisit(data: any): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase) return { success: false, error: 'Database service is not configured.' };

    try {
      const rawPurpose = data.purpose || 'Store Visit';
      const rawLocation = data.location ? ` [${data.location}]` : '';
      const rawTime = data.time ? ` [Time: ${data.time}]` : '';
      const finalPurpose = `${rawPurpose}${rawLocation}${rawTime}`;

      const clientId = data.client_id || data.customerId;

      // Ensure org_id matches the client's org_id to satisfy the Postgres database trigger
      let resolvedOrgId = data.org_id || data.orgId;
      if (clientId && supabase) {
        try {
          const { data: clientRow } = await (supabase as any)
            .from('customers')
            .select('org_id')
            .eq('id', clientId)
            .maybeSingle();
          if (clientRow?.org_id) {
            resolvedOrgId = clientRow.org_id;
          }
        } catch {
          // fallback
        }
      }
      if (!resolvedOrgId) {
        resolvedOrgId = toValidOrgId(data.org_id || data.orgId);
      }

      const payload: any = {
        client_id: clientId,
        salesperson_id: data.salesperson_id || data.salespersonId || null,
        salesperson_name: data.salesperson_name || data.salespersonName || 'Sales Rep',
        visit_date: data.visit_date || new Date().toISOString().split('T')[0],
        purpose: finalPurpose,
        outcome: data.outcome || null,
        notes: data.notes || null,
        status: sanitizeVisitStatus(data.status),
        org_id: resolvedOrgId,
      };

      const updateFields: any = {
        purpose: payload.purpose,
        outcome: payload.outcome,
        notes: payload.notes,
        status: payload.status,
        salesperson_name: payload.salesperson_name,
        salesperson_id: payload.salesperson_id,
        org_id: payload.org_id,
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
    if (!supabase) return { success: false, error: 'Database service is not configured.' };

    try {
      const { error } = await (supabase as any)
        .from('field_visits')
        .update({
          status: 'completed',
          outcome: outcome || 'Interested',
          notes: notes || null,
        })
        .eq('id', id).select('id').single();

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
