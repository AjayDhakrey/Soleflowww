import { supabase, isDemoModeActive, toValidOrgId } from '../lib/supabase';
import { PaymentReceipt } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';

export type PaymentRow = Database['public']['Tables']['payments']['Row'];
export type ReceivableRow = Database['public']['Views']['v_receivables']['Row'];

export interface RecordPaymentParams {
  clientId: string;
  amount: number;
  customerName?: string;
  customerCity?: string;
  amountDueBefore?: number;
  amountDueAfter?: number;
  collectedBy?: string;
  orderId?: string;
  orderNumber?: string;
  method?: 'UPI' | 'Cash' | 'NEFT/RTGS' | 'Cheque';
  reference?: string;
  paymentDate?: string;
  allocations?: { orderId: string; amount: number }[];
  notes?: string;
  chequeNo?: string;
  chequeBank?: string;
  chequeDate?: string;
  idempotencyKey?: string;
  orgId?: string;
  receiptNumber?: string;
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
        query = query.eq('org_id', toValidOrgId(filters.orgId));
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
    if (!supabase) {
      return { success: false, error: 'Payment service is not configured.' };
    }

    const paymentDateIso = (() => {
      try {
        const d = params.paymentDate ? new Date(params.paymentDate) : new Date();
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
      } catch {
        return new Date().toISOString();
      }
    })();

    const effectiveOrgId = toValidOrgId(params.orgId);

    // 1. First attempt the multi-tenant record_payment RPC with exact signature matching (including p_org_id)
    try {
      const { data, error } = await (supabase as any).rpc('record_payment', {
        p_client_id: params.clientId,
        p_amount: Number(params.amount),
        p_method: params.method || 'UPI',
        p_reference: params.reference || '',
        p_payment_date: paymentDateIso,
        p_allocations: (params.allocations || []) as any,
        p_notes: params.notes || '',
        p_cheque_no: params.chequeNo || null,
        p_cheque_bank: params.chequeBank || null,
        p_cheque_date: params.chequeDate || null,
        p_idempotency_key: params.idempotencyKey || null,
        p_org_id: effectiveOrgId,
      });

      if (!error && data) {
        return { success: true, data };
      }
      if (error) {
        console.warn('record_payment RPC error, falling back to direct table insert:', error);
      }
    } catch (err: any) {
      console.warn('record_payment RPC exception, falling back to direct table insert:', err);
    }

    // 2. Direct Supabase Table Fallback
    try {
      const paymentId = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const receiptNumber = `SF-REC-${Math.floor(10000 + Math.random() * 90000)}`;

      const paymentRow = {
        id: paymentId,
        org_id: effectiveOrgId,
        receiptNumber: params.receiptNumber || receiptNumber,
        customerId: params.clientId,
        customerName: params.customerName || 'Valued Customer',
        customerCity: params.customerCity || 'Agra',
        orderId: params.orderId || null,
        orderNumber: params.orderNumber || null,
        amountDueBefore: params.amountDueBefore ?? Number(params.amount),
        paymentAmount: Number(params.amount),
        amountDueAfter: params.amountDueAfter ?? Math.max(0, (params.amountDueBefore ?? Number(params.amount)) - Number(params.amount)),
        paymentDate: params.paymentDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        paymentMethod: params.method || 'UPI',
        utrRef: params.reference || 'Direct',
        collectedBy: params.collectedBy || 'Sales Representative',
        notes: params.notes || '',
        sentSms: true,
        status: params.method === 'Cheque' ? 'pending_clearance' : 'verified',
        cheque_no: params.chequeNo || null,
        cheque_bank: params.chequeBank || null,
        cheque_date: params.chequeDate || null,
        idempotency_key: params.idempotencyKey || crypto.randomUUID(),
        payment_date_at: paymentDateIso,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: inserted, error: insertError } = await (supabase as any)
        .from('payments')
        .insert([paymentRow])
        .select()
        .single();

      if (insertError) {
        console.error('Direct payments insert error:', insertError);
        throw parseSupabaseError(insertError);
      }

      // Update customer balance in Supabase
      if (params.clientId && paymentRow.status !== 'pending_clearance') {
        const { data: custData } = await (supabase as any)
          .from('customers')
          .select('amountDue, totalPaid')
          .eq('id', params.clientId)
          .maybeSingle();

        if (custData) {
          await (supabase as any)
            .from('customers')
            .update({
              amountDue: Math.max(0, Number(custData.amountDue || 0) - Number(params.amount)),
              totalPaid: Number(custData.totalPaid || 0) + Number(params.amount),
              lastPaymentDate: 'Today',
              lastPaymentAmount: Number(params.amount),
              last_payment_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', params.clientId);
        }
      }

      return { success: true, data: inserted || paymentRow };
    } catch (fallbackErr: any) {
      console.error('Payments fallback execution error:', fallbackErr);
      return { success: false, error: fallbackErr?.message || 'Failed to record payment' };
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
        query = query.eq('org_id', toValidOrgId(orgId));
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
        query = query.eq('org_id', toValidOrgId(orgId));
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
