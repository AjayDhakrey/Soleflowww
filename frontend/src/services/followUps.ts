import { supabase, isDemoModeActive, toValidOrgId } from '../lib/supabase';
import { FollowUpItem } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_FOLLOWUPS } from '../data/mockData';

export type FollowUpRow = Database['public']['Tables']['follow_ups']['Row'];

export function sanitizeFollowUpType(rawType?: string): 'call' | 'visit' | 'collection' | 'design_followup' {
  const t = (rawType || '').toLowerCase();
  if (t.includes('visit') || t.includes('store') || t.includes('shop') || t.includes('market') || t.includes('in-person')) {
    return 'visit';
  }
  if (t.includes('payment') || t.includes('collection') || t.includes('balance') || t.includes('cheque') || t.includes('due') || t.includes('overdue')) {
    return 'collection';
  }
  if (t.includes('design') || t.includes('catalog') || t.includes('shoe') || t.includes('sample') || t.includes('model') || t.includes('article')) {
    return 'design_followup';
  }
  return 'call';
}

export function sanitizeFollowUpStatus(rawStatus?: string): 'pending' | 'completed' | 'cancelled' {
  const s = (rawStatus || '').toLowerCase();
  if (s === 'completed') return 'completed';
  if (s === 'cancelled' || s === 'canceled') return 'cancelled';
  return 'pending';
}

export function sanitizeFollowUpPriority(rawPriority?: string): 'low' | 'normal' | 'high' | 'urgent' {
  const p = (rawPriority || '').toLowerCase();
  if (p === 'low' || p === 'high' || p === 'urgent') return p;
  return 'normal';
}

export function mapFollowUpRow(row: any): FollowUpItem {
  const dueDate = row.due_at ? new Date(row.due_at) : new Date();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dueMidnight = new Date(dueDate);
  dueMidnight.setHours(0, 0, 0, 0);

  let mappedStatus: FollowUpItem['status'] = 'today';
  if (row.status === 'completed') {
    mappedStatus = 'completed';
  } else if (dueMidnight.getTime() < now.getTime()) {
    mappedStatus = 'overdue';
  } else if (dueMidnight.getTime() > now.getTime()) {
    mappedStatus = 'upcoming';
  } else {
    mappedStatus = 'today';
  }

  let customReason = row.type || 'Follow-up';
  let notes = row.outcome || row.notes || '';
  if (notes.startsWith('[')) {
    const endBracket = notes.indexOf(']');
    if (endBracket !== -1) {
      customReason = notes.substring(1, endBracket);
      notes = notes.substring(endBracket + 1).trim();
    }
  }

  return {
    id: String(row.id),
    customerId: row.client_id,
    customerName: row.customers?.businessName || row.customerName || row.customer_name || 'Client Store',
    customerCity: row.customers?.city || row.customerCity || row.customer_city || 'Agra',
    phone: row.customers?.phone || row.phone || '',
    reason: customReason,
    date: row.due_date || dueDate.toISOString().split('T')[0],
    time: row.due_time || dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    relatedOrder: row.order_id || undefined,
    amountDue: row.amount_due ? Number(row.amount_due) : undefined,
    notes: notes,
    status: mappedStatus,
  };
}

export function parseIsoDueAt(dateStr?: string, timeStr?: string): string {
  if (!dateStr) return new Date().toISOString();
  try {
    if (dateStr.includes('T') && dateStr.endsWith('Z')) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d.toISOString();
    }

    let hours = 11;
    let minutes = 0;
    if (timeStr) {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const meridian = match[3]?.toUpperCase();
        if (meridian === 'PM' && hours < 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;
      }
    }

    const dateParts = dateStr.split('-');
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);
      const d = new Date(year, month, day, hours, minutes, 0);
      if (!isNaN(d.getTime())) return d.toISOString();
    }

    const fallbackDate = new Date(dateStr);
    if (!isNaN(fallbackDate.getTime())) {
      fallbackDate.setHours(hours, minutes, 0, 0);
      return fallbackDate.toISOString();
    }
  } catch (err) {
    console.warn('parseIsoDueAt error:', err);
  }
  return new Date().toISOString();
}

export const followUpsService = {
  async fetchFollowUps(filters?: { status?: string; salespersonId?: string; orgId?: string }): Promise<FollowUpItem[]> {
    if (!supabase) return [];

    try {
      let query = (supabase as any)
        .from('follow_ups')
        .select('*, customers(businessName, city, phone)')
        .order('due_at', { ascending: true });

      if (filters?.orgId) query = query.eq('org_id', toValidOrgId(filters.orgId));
      if (filters?.status && filters.status !== 'all') {
        const dbStatus = sanitizeFollowUpStatus(filters.status);
        query = query.eq('status', dbStatus);
      }
      if (filters?.salespersonId) {
        query = query.eq('owner_id', filters.salespersonId);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase fetchFollowUps warning:', error);
        return [];
      }

      if (!data || data.length === 0) return [];
      return data.map(mapFollowUpRow);
    } catch (err) {
      console.warn('Error fetching follow-ups from Supabase:', err);
      return [];
    }
  },

  async createFollowUp(data: any): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase) return { success: false, error: 'Database service is not configured.' };

    try {
      const rawReason = data.reason || data.type || 'Follow-up';
      const rawNotes = data.notes || data.outcome || '';
      const combinedOutcome = rawNotes
        ? `${rawReason !== 'call' && rawReason !== 'collection' && rawReason !== 'visit' && rawReason !== 'design_followup' ? `[${rawReason}] ` : ''}${rawNotes}`
        : rawReason;

      const payload = {
        client_id: data.client_id || data.customerId,
        due_at: parseIsoDueAt(data.due_at || data.date, data.time),
        owner_id: data.owner_id || null,
        owner_name: data.owner_name || data.ownerName || 'Field Rep',
        type: sanitizeFollowUpType(rawReason),
        status: sanitizeFollowUpStatus(data.status),
        outcome: combinedOutcome || null,
        priority: sanitizeFollowUpPriority(data.priority),
      };

      const { data: res, error } = await (supabase as any)
        .from('follow_ups')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.warn('Supabase createFollowUp warning:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data: res };
    } catch (err: any) {
      console.warn('Supabase createFollowUp exception:', err);
      return { success: false, error: err?.message || 'Failed to create follow-up' };
    }
  },

  async completeFollowUp(id: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: false, error: 'Database service is not configured.' };

    try {
      const { error } = await (supabase as any)
        .from('follow_ups')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', id).select('id').single();

      if (error) {
        console.warn('Supabase completeFollowUp warning:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase completeFollowUp exception:', err);
      return { success: false, error: err?.message || 'Failed to complete follow-up' };
    }
  },
};
