import { createClient } from '@supabase/supabase-js';
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

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

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
  // 1. Customers / Clients
  async getCustomers(): Promise<Customer[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase getCustomers error:', error);
      return null;
    }
    return data as Customer[];
  },

  async insertCustomer(customer: Customer): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('customers').insert([customer]);
    if (error) {
      console.warn('Supabase insertCustomer error:', error);
      return false;
    }
    return true;
  },

  async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
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
  async getOrders(): Promise<Order[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase getOrders error:', error);
      return null;
    }
    return data as Order[];
  },

  async insertOrder(order: Order): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('orders').insert([order]);
    if (error) {
      console.warn('Supabase insertOrder error:', error);
      return false;
    }
    return true;
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    if (error) {
      console.warn('Supabase updateOrderStatus error:', error);
      return false;
    }
    return true;
  },

  // 3. Shoe Designs
  async getDesigns(): Promise<ShoeDesign[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
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
  async getPayments(): Promise<PaymentReceipt[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase getPayments error:', error);
      return null;
    }
    return data as PaymentReceipt[];
  },

  async insertPayment(payment: PaymentReceipt): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('payments').insert([payment]);
    if (error) {
      console.warn('Supabase insertPayment error:', error);
      return false;
    }
    return true;
  },

  // 5. Audit Logs
  async getAuditLogs(): Promise<AuditEvent[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase getAuditLogs error:', error);
      return null;
    }
    return data as AuditEvent[];
  },

  async insertAuditLog(event: AuditEvent): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('audit_logs').insert([event]);
    if (error) {
      console.warn('Supabase insertAuditLog error:', error);
      return false;
    }
    return true;
  },

  // 6. Design Shares
  async getDesignShares(): Promise<DesignShareRecord[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('design_shares')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase getDesignShares error:', error);
      return null;
    }
    return data as DesignShareRecord[];
  },

  async insertDesignShare(share: DesignShareRecord): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('design_shares').insert([share]);
    if (error) {
      console.warn('Supabase insertDesignShare error:', error);
      return false;
    }
    return true;
  },

  // 7. Manufacturers
  async getManufacturers(): Promise<Manufacturer[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('manufacturers').select('*');
    if (error) {
      console.warn('Supabase getManufacturers error:', error);
      return null;
    }
    return data as Manufacturer[];
  },

  // 8. Sales Team
  async getSalesTeam(): Promise<Salesperson[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('sales_team').select('*');
    if (error) {
      console.warn('Supabase getSalesTeam error:', error);
      return null;
    }
    return data as Salesperson[];
  },
};
