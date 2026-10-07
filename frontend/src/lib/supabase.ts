import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import {
  Customer,
  ShoeDesign,
  Order,
  Manufacturer,
  Salesperson,
  PaymentReceipt,
  AuditEvent,
  DesignShareRecord,
  FollowUpItem,
  FieldVisitItem,
  NotificationItem,
} from '../types';

/**
 * @deprecated Use environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY instead.
 * Retained strictly for offline/demo mode backwards-compatibility.
 */
export const FALLBACK_SUPABASE_URL = 'https://jpcaptmmcbuqlgrdetde.supabase.co';

/**
 * @deprecated Use environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY instead.
 * Retained strictly for offline/demo mode backwards-compatibility.
 */
export const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwY2FwdG1tY2J1cWxncmRldGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1OTE0MjAsImV4cCI6MjEwNjE2NzQyMH0.zh3W-mNQA43UVNMe5V5EwBcZAK-UIa-KpmnZX5zcI6U';

const rawUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

const rawAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isDemoModeActive = import.meta.env.VITE_DEMO_MODE === 'true';

const supabaseUrl = rawUrl || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = rawAnonKey || FALLBACK_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// =========================================================================
// SUPABASE DATA API SERVICE HELPERS
// =========================================================================

export const supabaseApi = {
  // Test & Diagnostics
  async testLiveConnection(): Promise<{ success: boolean; message: string; customerCount?: number; latencyMs?: number }> {
    if (!supabase) return { success: false, message: 'Supabase client is not configured' };
    const startTime = performance.now();
    try {
      const { data, error, count } = await (supabase as any)
        .from('customers')
        .select('*', { count: 'exact' });
      const latencyMs = Math.round(performance.now() - startTime);

      if (error) {
        console.error('Supabase test connection error:', error);
        return { success: false, message: error.message, latencyMs };
      }
      return {
        success: true,
        message: `Connected to Supabase successfully (${latencyMs}ms)`,
        customerCount: count ?? data?.length ?? 0,
        latencyMs,
      };
    } catch (err: any) {
      console.error('Supabase network error during test:', err);
      return { success: false, message: err?.message || 'Network connection failed' };
    }
  },

  // 1. Customers / Clients
  async getCustomers(orgId?: string): Promise<Customer[] | null> {
    if (!supabase) return null;
    let query = (supabase as any)
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (orgId) query = query.eq('org_id', orgId);
    const { data, error } = await query;
    if (error) {
      console.error('Supabase getCustomers error:', error);
      return null;
    }
    return data as Customer[];
  },

  async insertCustomer(customer: Customer): Promise<boolean> {
    if (!supabase) {
      console.warn('Supabase not configured, skipping cloud insert');
      return false;
    }
    try {
      const { error } = await (supabase as any).from('customers').insert([customer]);
      if (error) {
        console.error('❌ Supabase insertCustomer error:', error);
        return false;
      }
      console.log('✅ Supabase insertCustomer success:', customer.id);
      return true;
    } catch (err) {
      console.error('❌ Supabase insertCustomer exception:', err);
      return false;
    }
  },

  async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await (supabase as any)
      .from('customers')
      .update(updates)
      .eq('id', customerId);
    if (error) {
      console.warn('Supabase updateCustomer error:', error);
      return false;
    }
    return true;
  },

  // 2. Orders
  async getOrders(orgId?: string): Promise<Order[] | null> {
    if (!supabase) return null;
    let query = (supabase as any)
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (orgId) query = query.eq('org_id', orgId);
    const { data, error } = await query;
    if (error) {
      console.warn('Supabase getOrders error:', error);
      return null;
    }
    return data as Order[];
  },

  async insertOrder(order: Order): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await (supabase as any).from('orders').insert([order]);
    if (error) {
      console.warn('Supabase insertOrder error:', error);
      return false;
    }
    return true;
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await (supabase as any)
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    if (error) {
      console.warn('Supabase updateOrderStatus error:', error);
      return false;
    }
    return true;
  },

  async assignOrderManufacturer(orderId: string, manufacturerId: string): Promise<boolean> {
    if (!supabase) return false;
    const { data: manufacturer, error: lookupError } = await supabase.from('manufacturers').select('companyName, hubLocation').eq('id', manufacturerId).single();
    if (lookupError || !manufacturer) return false;
    const { data, error } = await supabase.from('orders').update({ manufacturerId, manufacturerName: manufacturer.companyName, manufacturerPlant: manufacturer.hubLocation }).eq('id', orderId).select('id').single();
    return !error && Boolean(data);
  },

  // 3. Shoe Designs
  async getDesigns(): Promise<ShoeDesign[] | null> {
    if (!supabase) return null;
    const { data, error } = await (supabase as any)
      .from('designs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase getDesigns error:', error);
      return null;
    }
    return data as ShoeDesign[];
  },

  // 4. Payments
  async getPayments(orgId?: string): Promise<PaymentReceipt[] | null> {
    if (!supabase) return null;
    let query = (supabase as any)
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    if (orgId) query = query.eq('org_id', orgId);
    const { data, error } = await query;
    if (error) {
      console.warn('Supabase getPayments error:', error);
      return null;
    }
    return (data || []).map((row: any) => ({ ...row, chequeNo: row.cheque_no, chequeBank: row.cheque_bank, chequeDate: row.cheque_date, chequeClearedAt: row.cheque_cleared_at, chequeBounceReason: row.cheque_bounce_reason })) as PaymentReceipt[];
  },

  async insertPayment(payment: PaymentReceipt): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await (supabase as any).from('payments').insert([payment]);
    if (error) {
      console.warn('Supabase insertPayment error:', error);
      return false;
    }
    return true;
  },

  // 5. Audit Logs
  async getAuditLogs(orgId?: string): Promise<AuditEvent[] | null> {
    if (!supabase) return null;
    let query = (supabase as any)
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (orgId) query = query.eq('org_id', orgId);
    const { data, error } = await query;
    if (error) {
      console.warn('Supabase getAuditLogs error:', error);
      return null;
    }
    return data as AuditEvent[];
  },

  async insertAuditLog(event: AuditEvent): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await (supabase as any).from('audit_logs').insert([event]);
    if (error) {
      console.warn('Supabase insertAuditLog error:', error);
      return false;
    }
    return true;
  },

  // 6. Design Shares
  async getDesignShares(orgId?: string): Promise<DesignShareRecord[] | null> {
    if (!supabase) return null;
    let query = (supabase as any)
      .from('design_shares')
      .select('*')
      .order('created_at', { ascending: false });
    if (orgId) query = query.eq('org_id', orgId);
    const { data, error } = await query;
    if (error) {
      console.warn('Supabase getDesignShares error:', error);
      return null;
    }
    return data as DesignShareRecord[];
  },

  async insertDesignShare(share: DesignShareRecord): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await (supabase as any).from('design_shares').insert([share]);
    if (error) {
      console.warn('Supabase insertDesignShare error:', error);
      return false;
    }
    return true;
  },

  // 7. Manufacturers
  async getManufacturers(orgId?: string): Promise<Manufacturer[] | null> {
    if (!supabase) return null;
    let query = (supabase as any).from('manufacturers').select('*');
    if (orgId) query = query.eq('org_id', orgId);
    const { data, error } = await query;
    if (error) {
      console.warn('Supabase getManufacturers error:', error);
      return null;
    }
    return data as Manufacturer[];
  },

  // 8. Sales Team
  async getSalesTeam(orgId?: string): Promise<Salesperson[] | null> {
    if (!supabase) return null;
    let query = (supabase as any).from('sales_team').select('*');
    if (orgId) query = query.eq('org_id', orgId);
    const { data, error } = await query;
    if (error) {
      console.warn('Supabase getSalesTeam error:', error);
      return null;
    }
    return data as Salesperson[];
  },
};
