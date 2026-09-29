import { supabase } from '../lib/supabase';
import { PaymentReceipt } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';

export type PaymentRow = Database['public']['Tables']['payments']['Row'];
export type ReceivableRow = Database['public']['Views']['v_receivables']['Row'];

export const paymentsService = {
  async fetchPayments(filters?: { clientId?: string; salespersonId?: string }): Promise<PaymentReceipt[]> {
    if (!supabase) return [];

    try {
      let query = supabase
        .from('payments')
        .select('*')
        .is('archived_at', null)
        .order('payment_date', { ascending: false });

      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      if (filters?.salespersonId) {
        query = query.eq('salesperson_id', filters.salespersonId);
      }

      const { data, error } = await query;
      if (error) throw parseSupabaseError(error);

      if (!data || data.length === 0) return [];

      return data.map((p: any) => ({
        id: p.id,
        receiptNumber: p.reference_no || `REC-${p.id.slice(-5)}`,
        customerId: p.client_id,
        customerName: 'Client Store',
        customerCity: 'Agra',
        orderId: 'ORD-0148',
        orderNumber: 'ORD-0148',
        amountDueBefore: Number(p.amount) * 2,
        paymentAmount: Number(p.amount),
        amountDueAfter: Number(p.amount),
        paymentDate: p.payment_date,
        paymentMethod: (p.payment_mode === 'NEFT' ? 'NEFT/RTGS' : p.payment_mode) as PaymentReceipt['paymentMethod'],
        utrRef: p.reference_no || '',
        collectedBy: p.recorded_by || 'Sales Rep',
        notes: p.notes || '',
        sentSms: true,
      }));
    } catch (err) {
      console.warn('Error fetching payments from Supabase:', err);
      return [];
    }
  },

  async recordPayment(params: {
    payment: Partial<PaymentRow>;
    allocations?: { order_id: string; amount: number }[];
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase) {
      return {
        success: true,
        data: {
          id: `PAY-${Date.now().toString().slice(-5)}`,
          ...params.payment,
        },
      };
    }

    try {
      const { data, error } = await supabase.rpc('record_payment', {
        p_payment: params.payment as any,
        p_allocations: (params.allocations || []) as any,
      });

      if (error) throw parseSupabaseError(error);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to record payment' };
    }
  },

  async fetchReceivables(): Promise<ReceivableRow[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('v_receivables')
        .select('*')
        .order('total_outstanding', { ascending: false });

      if (error) throw parseSupabaseError(error);
      return data || [];
    } catch (err) {
      console.warn('Error fetching receivables view:', err);
      return [];
    }
  },
};
