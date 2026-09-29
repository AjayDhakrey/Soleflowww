import { supabase } from '../lib/supabase';
import { FollowUpItem } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_FOLLOWUPS } from '../data/mockData';

export type FollowUpRow = Database['public']['Tables']['follow_ups']['Row'];

export function mapFollowUpRow(row: FollowUpRow): FollowUpItem {
  return {
    id: row.id,
    customerId: row.client_id,
    customerName: 'Client Store',
    customerCity: 'Agra',
    phone: '+91 98000 00000',
    reason: row.reason,
    date: row.due_date,
    time: row.due_time || '11:00 AM',
    relatedOrder: row.order_id || undefined,
    amountDue: row.amount_due ? Number(row.amount_due) : undefined,
    notes: row.notes || '',
    status: (row.status || 'today') as FollowUpItem['status'],
  };
}

export const followUpsService = {
  async fetchFollowUps(filters?: { status?: string; salespersonId?: string }): Promise<FollowUpItem[]> {
    if (!supabase) return MOCK_FOLLOWUPS;

    try {
      let query = supabase
        .from('follow_ups')
        .select('*')
        .order('due_date', { ascending: true });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.salespersonId) {
        query = query.eq('salesperson_id', filters.salespersonId);
      }

      const { data, error } = await query;
      if (error) throw parseSupabaseError(error);

      if (!data || data.length === 0) return MOCK_FOLLOWUPS;
      return data.map(mapFollowUpRow);
    } catch (err) {
      console.warn('Error fetching follow-ups from Supabase:', err);
      return MOCK_FOLLOWUPS;
    }
  },

  async createFollowUp(data: Partial<FollowUpRow>): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase) return { success: true };

    try {
      const { data: res, error } = await supabase
        .from('follow_ups')
        .insert([data as any])
        .select()
        .single();

      if (error) throw parseSupabaseError(error);
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create follow-up' };
    }
  },

  async completeFollowUp(id: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase
        .from('follow_ups')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw parseSupabaseError(error);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to complete follow-up' };
    }
  },
};
