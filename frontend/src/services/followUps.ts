import { supabase, isDemoModeActive } from '../lib/supabase';
import { FollowUpItem } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_FOLLOWUPS } from '../data/mockData';

export type FollowUpRow = Database['public']['Tables']['follow_ups']['Row'];

export function mapFollowUpRow(row: any): FollowUpItem {
  const dueDate = row.due_at ? new Date(row.due_at) : new Date();
  return {
    id: row.id,
    customerId: row.client_id,
    customerName: row.customerName || row.customer_name || '',
    customerCity: row.customerCity || row.customer_city || '',
    phone: row.phone || '',
    reason: row.type || row.reason || '',
    date: row.due_date || dueDate.toLocaleDateString('en-IN'),
    time: row.due_time || dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    relatedOrder: row.order_id || undefined,
    amountDue: row.amount_due ? Number(row.amount_due) : undefined,
    notes: row.notes || row.outcome || '',
    status: (row.status || 'today') as FollowUpItem['status'],
  };
}

export const followUpsService = {
  async fetchFollowUps(filters?: { status?: string; salespersonId?: string }): Promise<FollowUpItem[]> {
    if (!supabase) return MOCK_FOLLOWUPS;

    try {
      let query = (supabase as any)
        .from('follow_ups')
        .select('*')
        .order('due_at', { ascending: true });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.salespersonId) {
        query = query.eq('owner_id', filters.salespersonId);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase fetchFollowUps warning:', error);
        return MOCK_FOLLOWUPS;
      }

      if (!data || data.length === 0) return MOCK_FOLLOWUPS;
      return data.map(mapFollowUpRow);
    } catch (err) {
      console.warn('Error fetching follow-ups from Supabase:', err);
      return MOCK_FOLLOWUPS;
    }
  },

  async createFollowUp(data: any): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase) return { success: true };

    try {
      const payload = {
        client_id: data.client_id || data.customerId,
        due_at: data.due_at || (data.date ? new Date(`${data.date}T${data.time || '11:00:00'}`).toISOString() : new Date().toISOString()),
        owner_name: data.owner_name || data.ownerName || 'Field Rep',
        type: data.type || data.reason || 'Follow-up',
        status: data.status || 'today',
        outcome: data.outcome || data.notes || null,
        priority: data.priority || 'normal',
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
    if (!supabase) return { success: true };

    try {
      const { error } = await (supabase as any)
        .from('follow_ups')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', id);

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
