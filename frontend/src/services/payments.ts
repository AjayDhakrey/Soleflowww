import {supabase, isDemoModeActive} from '../lib/supabase';
import { PaymentReceipt } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';

export type PaymentRow = Database['public']['Tables']['payments']['Row'];
export type ReceivableRow = Database['public']['Views']['v_receivables']['Row'];

export interface RecordPaymentParams {
  clientId: string;
  amount: number;
  method?: 'UPI' | 'Cash' | 'NEFT/RTGS' | 'Cheque';
  reference?: string;
  paymentDate?: string;
  allocations?: { orderId: string; amount: number }[];
  notes?: string;
  chequeNo?: string;
  chequeBank?: string;
  chequeDate?: string;
  idempotencyKey?: string;
}

export interface SalesmanCollectionsSummary {
  salesman_id: string;
  salesman_name: string;
  collected_this_month: number;
  cheques_in_transit: number;
  total_pending_client_balance: number;
  pending_accounts_count: number;
}

export const paymentsService = {
  async fetchPayments(filters?: { clientId?: string; salesmanName?: string; status?: string; orgId?: string }): Promise<PaymentReceipt[]> {
    if (!supabase || isDemoModeActive) return [];

    try {
      let query = supabase
        .from('payments')
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (filters?.orgId) {
        query = query.eq('org_id', filters.orgId);
      }
      if (filters?.clientId) {
        query = query.eq('customerId', filters.clientId);
      }
      if (filters?.salesmanName) {
        query = query.eq('collectedBy', filters.salesmanName);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw parseSupabaseError(error);

      if (!data || data.length === 0) return [];

      return data.map((p: any): PaymentReceipt => ({
        id: p.id,
        receiptNumber: p.receiptNumber || '',
        customerId: p.customerId || '',
        customerName: p.customerName || '',
        customerCity: p.customerCity || '',
        orderId: p.orderId || undefined,
        orderNumber: p.orderNumber || undefined,
        amountDueBefore: Number(p.amountDueBefore ?? 0),
        paymentAmount: Number(p.paymentAmount ?? 0),
        amountDueAfter: Number(p.amountDueAfter ?? 0),
        paymentDate: p.paymentDate || '',
        paymentMethod: (p.paymentMethod === 'NEFT' ? 'NEFT/RTGS' : p.paymentMethod) as PaymentReceipt['paymentMethod'],
        utrRef: p.utrRef || '',
        collectedBy: p.collectedBy || '',
        notes: p.notes || '',
        sentSms: Boolean(p.sentSms),
        status: p.status || 'verified',
        chequeNo: p.cheque_no || undefined,
        chequeBank: p.cheque_bank || undefined,
        chequeDate: p.cheque_date || undefined,
        bounceReason: p.bounce_reason || undefined,
        reversalReason: p.reversal_reason || undefined,
      }));
    } catch (err) {
      console.warn('Error fetching payments from Supabase:', err);
      return [];
    }
  },

  async recordPayment(params: RecordPaymentParams): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase || isDemoModeActive) {
      return { success: false, error: 'Payment service is not configured.' };
    }

    try {
      const { data, error } = await supabase.rpc('record_payment', {
        p_client_id: params.clientId,
        p_amount: params.amount,
        p_method: params.method || 'UPI',
        p_reference: params.reference || '',
        p_payment_date: params.paymentDate ? new Date(params.paymentDate).toISOString() : new Date().toISOString(),
        p_allocations: (params.allocations || []) as any,
        p_notes: params.notes || '',
        p_cheque_no: params.chequeNo || null,
        p_cheque_bank: params.chequeBank || null,
        p_cheque_date: params.chequeDate || null,
        p_idempotency_key: params.idempotencyKey || null,
      });

      if (error) throw parseSupabaseError(error);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to record payment' };
    }
  },

  async clearCheque(paymentId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase || isDemoModeActive) return { success: true };
    try {
      const { data, error } = await supabase.rpc('clear_cheque', {
        p_payment_id: paymentId,
      });
      if (error) throw parseSupabaseError(error);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to clear cheque' };
    }
  },

  async bounceCheque(paymentId: string, reason?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase || isDemoModeActive) return { success: true };
    try {
      const { data, error } = await supabase.rpc('bounce_cheque', {
        p_payment_id: paymentId,
        p_reason: reason || 'Cheque dishonoured by bank',
      });
      if (error) throw parseSupabaseError(error);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to bounce cheque' };
    }
  },

  async verifyPayment(paymentId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase || isDemoModeActive) return { success: true };
    try {
      const { data, error } = await supabase.rpc('verify_payment', {
        p_payment_id: paymentId,
      });
      if (error) throw parseSupabaseError(error);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to verify payment' };
    }
  },

  async reversePayment(paymentId: string, reason?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase || isDemoModeActive) return { success: true };
    try {
      const { data, error } = await supabase.rpc('reverse_payment', {
        p_payment_id: paymentId,
        p_reason: reason || 'Manual payment reversal',
      });
      if (error) throw parseSupabaseError(error);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to reverse payment' };
    }
  },

  async fetchSalesmanCollections(orgId?: string): Promise<SalesmanCollectionsSummary[]> {
    if (!supabase || isDemoModeActive) return [];

    try {
      let query = supabase
        .from('v_salesman_collections')
        .select('*');

      if (orgId) {
        query = query.eq('org_id', orgId);
      }

      const { data, error } = await query;
      if (error) throw parseSupabaseError(error);
      return data || [];
    } catch (err) {
      console.warn('Error fetching salesman collections view:', err);
      return [];
    }
  },

  async fetchReceivables(orgId?: string): Promise<ReceivableRow[]> {
    if (!supabase || isDemoModeActive) return [];

    try {
      let query = supabase
        .from('v_receivables')
        .select('*')
        .order('amount_due', { ascending: false });

      if (orgId) {
        query = query.eq('org_id', orgId);
      }

      const { data, error } = await query;
      if (error) throw parseSupabaseError(error);
      return data || [];
    } catch (err) {
      console.warn('Error fetching receivables view:', err);
      return [];
    }
  },
};
