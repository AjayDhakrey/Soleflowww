import { supabase } from '../lib/supabase';
import { Customer, CustomerActivity } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError, AppError } from './apiError';
import { MOCK_CUSTOMERS } from '../data/mockData';

export type ClientRow = Database['public']['Tables']['clients']['Row'];
export type ClientFinancialRow = Database['public']['Views']['v_client_financials']['Row'];

export function mapClientFinancialToCustomer(row: ClientFinancialRow, rawClient?: ClientRow): Customer {
  return {
    id: row.client_id,
    businessName: row.name,
    propName: row.contact_person || '',
    phone: row.phone,
    whatsapp: rawClient?.whatsapp || row.phone,
    email: rawClient?.email || '',
    city: row.city,
    state: row.state,
    cluster: row.cluster || '',
    address: rawClient?.address || '',
    gstin: rawClient?.gstin || '',
    salespersonId: row.salesperson_id || '',
    salespersonName: row.salesperson_name || 'Unassigned',
    paymentTerms: row.payment_terms,
    creditLimit: Number(row.credit_limit || 0),
    totalBusiness: Number(row.total_business || 0),
    totalPaid: Number(row.total_paid || 0),
    amountDue: Number(row.amount_due || 0),
    overdueDays: 0,
    status: (row.calculated_status || 'active') as Customer['status'],
    ordersCount: Number(row.orders_count || 0),
    lastOrderDate: row.last_order_date || 'None',
    lastPaymentDate: row.last_payment_date || 'None',
    lastPaymentAmount: Number(row.last_payment_amount || 0),
    tier: (row.tier || 'Standard Retail') as Customer['tier'],
    activityHistory: [],
    notes: rawClient?.notes || undefined,
  };
}

export function mapClientRowToCustomer(row: ClientRow): Customer {
  return {
    id: row.id,
    businessName: row.name,
    propName: row.contact_person || '',
    phone: row.phone,
    whatsapp: row.whatsapp || row.phone,
    email: row.email || '',
    city: row.city,
    state: row.state,
    cluster: row.cluster || '',
    address: row.address || '',
    gstin: row.gstin || '',
    salespersonId: row.salesperson_id || '',
    salespersonName: 'Assigned Rep',
    paymentTerms: row.payment_terms,
    creditLimit: Number(row.credit_limit || 0),
    totalBusiness: 0,
    totalPaid: 0,
    amountDue: 0,
    overdueDays: 0,
    status: (row.status || 'active') as Customer['status'],
    ordersCount: 0,
    lastOrderDate: 'None',
    lastPaymentDate: 'None',
    lastPaymentAmount: 0,
    tier: (row.tier || 'Standard Retail') as Customer['tier'],
    activityHistory: [],
    notes: row.notes || undefined,
  };
}

export const clientsService = {
  async fetchClients(filters?: { search?: string; status?: string; tier?: string; salespersonId?: string }): Promise<Customer[]> {
    if (!supabase) return MOCK_CUSTOMERS;

    try {
      let query = supabase.from('v_client_financials').select('*');

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('calculated_status', filters.status);
      }
      if (filters?.tier && filters.tier !== 'all') {
        query = query.eq('tier', filters.tier);
      }
      if (filters?.salespersonId) {
        query = query.eq('salesperson_id', filters.salespersonId);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw parseSupabaseError(error);

      if (!data || data.length === 0) return [];
      return data.map((d) => mapClientFinancialToCustomer(d));
    } catch (err: any) {
      console.warn('Error fetching clients from Supabase; returning mock data:', err);
      return MOCK_CUSTOMERS;
    }
  },

  async fetchClientById(clientId: string): Promise<Customer | null> {
    if (!supabase) {
      return MOCK_CUSTOMERS.find((c) => c.id === clientId) || null;
    }

    try {
      const { data: finData, error: finError } = await supabase
        .from('v_client_financials')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();

      if (finError) throw parseSupabaseError(finError);

      const { data: rawClient } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();

      if (finData) {
        return mapClientFinancialToCustomer(finData, rawClient || undefined);
      }
      if (rawClient) {
        return mapClientRowToCustomer(rawClient);
      }
      return null;
    } catch (err) {
      console.error('Error fetching client by ID:', err);
      return MOCK_CUSTOMERS.find((c) => c.id === clientId) || null;
    }
  },

  async createClient(clientData: Partial<ClientRow>): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase) {
      return { success: true, data: { id: `cust-${Date.now()}`, ...clientData } };
    }

    try {
      const { data, error } = await supabase.rpc('create_client', {
        p_client: clientData as any,
      });

      if (error) throw parseSupabaseError(error);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create client' };
    }
  },

  async updateClient(clientId: string, updates: Partial<ClientRow>): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId);

      if (error) throw parseSupabaseError(error);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update client' };
    }
  },

  async archiveClient(clientId: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.rpc('archive_client', {
        p_client_id: clientId,
      });

      if (error) throw parseSupabaseError(error);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to archive client' };
    }
  },

  async assignSalesman(clientId: string, salespersonId: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.rpc('assign_salesman', {
        p_client_id: clientId,
        p_salesperson_id: salespersonId,
      });

      if (error) throw parseSupabaseError(error);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to assign salesman' };
    }
  },

  async fetchClientNotes(clientId: string): Promise<any[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('client_notes')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw parseSupabaseError(error);
      return data || [];
    } catch (err) {
      console.error('Error fetching client notes:', err);
      return [];
    }
  },

  async addClientNote(clientId: string, note: string): Promise<boolean> {
    if (!supabase) return true;

    try {
      const { error } = await supabase.from('client_notes').insert([
        {
          client_id: clientId,
          note,
        },
      ]);
      if (error) throw parseSupabaseError(error);
      return true;
    } catch (err) {
      console.error('Error adding client note:', err);
      return false;
    }
  },
};
