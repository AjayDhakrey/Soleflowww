import { supabase, isDemoModeActive } from '../lib/supabase';
import { Customer, CustomerActivity } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError, AppError } from './apiError';
import { MOCK_CUSTOMERS } from '../data/mockData';

// DEPRECATED: ClientRow reference maintained for backward compatibility
export type ClientRow = any;
export type CustomerRow = Database['public']['Tables']['customers']['Row'];
export type ClientFinancialRow = Database['public']['Views']['v_client_financials']['Row'];

/**
 * Mapper: converts arbitrary input object (camelCase, snake_case, etc.) into
 * the exact column schema used by public.customers in Supabase.
 */
export function toCustomerRow(input: any): Partial<CustomerRow> {
  if (!input) return {};
  const row: any = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.businessName !== undefined || input.name !== undefined || input.business_name !== undefined) {
    row.businessName = input.businessName ?? input.name ?? input.business_name;
  }
  if (input.propName !== undefined || input.contact_person !== undefined || input.prop_name !== undefined) {
    row.propName = input.propName ?? input.contact_person ?? input.prop_name;
  }
  if (input.phone !== undefined) row.phone = input.phone;
  if (input.whatsapp !== undefined) row.whatsapp = input.whatsapp;
  if (input.email !== undefined) row.email = input.email;
  if (input.city !== undefined) row.city = input.city;
  if (input.state !== undefined) row.state = input.state;
  if (input.cluster !== undefined) row.cluster = input.cluster;
  if (input.address !== undefined) row.address = input.address;
  if (input.gstin !== undefined) row.gstin = input.gstin;
  if (input.salespersonId !== undefined || input.salesperson_id !== undefined || input.salesman_id !== undefined) {
    row.salespersonId = input.salespersonId ?? input.salesperson_id ?? input.salesman_id;
  }
  if (input.salespersonName !== undefined || input.salesperson_name !== undefined || input.salesman_name !== undefined) {
    row.salespersonName = input.salespersonName ?? input.salesperson_name ?? input.salesman_name;
  }
  if (input.paymentTerms !== undefined || input.payment_terms !== undefined) {
    row.paymentTerms = input.paymentTerms ?? input.payment_terms;
  }
  if (input.creditLimit !== undefined || input.credit_limit !== undefined) {
    row.creditLimit = Number(input.creditLimit ?? input.credit_limit);
  }
  if (input.totalBusiness !== undefined || input.total_business !== undefined) {
    row.totalBusiness = Number(input.totalBusiness ?? input.total_business);
  }
  if (input.totalPaid !== undefined || input.total_paid !== undefined) {
    row.totalPaid = Number(input.totalPaid ?? input.total_paid);
  }
  if (input.amountDue !== undefined || input.amount_due !== undefined || input.outstanding !== undefined) {
    row.amountDue = Number(input.amountDue ?? input.amount_due ?? input.outstanding);
  }
  if (input.status !== undefined || input.client_status !== undefined || input.calculated_status !== undefined) {
    row.status = input.status ?? input.client_status ?? input.calculated_status;
  }
  if (input.ordersCount !== undefined || input.orders_count !== undefined) {
    row.ordersCount = Number(input.ordersCount ?? input.orders_count);
  }
  if (input.tier !== undefined) row.tier = input.tier;
  if (input.notes !== undefined) row.notes = input.notes;
  if (input.archived_at !== undefined) row.archived_at = input.archived_at;
  return row;
}

export function mapClientFinancialToCustomer(row: any, rawClient?: any): Customer {
  return {
    id: row.client_id || row.id,
    businessName: row.business_name || row.name || rawClient?.businessName || '',
    propName: row.prop_name || row.contact_person || rawClient?.propName || '',
    phone: row.phone || rawClient?.phone || '',
    whatsapp: rawClient?.whatsapp || row.whatsapp || row.phone || '',
    email: rawClient?.email || row.email || '',
    city: row.city || rawClient?.city || '',
    state: row.state || rawClient?.state || '',
    cluster: row.cluster || rawClient?.cluster || '',
    address: rawClient?.address || row.address || '',
    gstin: rawClient?.gstin || row.gstin || '',
    salespersonId: row.salesman_id || row.salesperson_id || rawClient?.salespersonId || '',
    salespersonName: row.salesman_name || row.salesperson_name || rawClient?.salespersonName || '',
    paymentTerms: row.payment_terms || rawClient?.paymentTerms || '',
    creditLimit: Number(row.credit_limit ?? rawClient?.creditLimit ?? 0),
    totalBusiness: Number(row.total_business ?? rawClient?.totalBusiness ?? 0),
    totalPaid: Number(row.total_paid ?? rawClient?.totalPaid ?? 0),
    amountDue: Number(row.outstanding ?? row.amount_due ?? rawClient?.amountDue ?? 0),
    overdueDays: 0,
    status: (row.client_status || row.calculated_status || rawClient?.status || 'active') as Customer['status'],
    ordersCount: Number(row.orders_count ?? rawClient?.ordersCount ?? 0),
    lastOrderDate: row.last_order_at ? new Date(row.last_order_at).toLocaleDateString('en-IN') : (rawClient?.lastOrderDate || 'None'),
    lastPaymentDate: row.last_payment_at ? new Date(row.last_payment_at).toLocaleDateString('en-IN') : (rawClient?.lastPaymentDate || 'None'),
    lastPaymentAmount: Number(row.last_payment_amount ?? rawClient?.lastPaymentAmount ?? 0),
    tier: (row.tier || rawClient?.tier || '') as Customer['tier'],
    activityHistory: [],
    notes: rawClient?.notes || undefined,
  };
}

export function mapClientRowToCustomer(row: any): Customer {
  return {
    id: row.id,
    businessName: row.businessName || row.name || '',
    propName: row.propName || row.contact_person || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || row.phone || '',
    email: row.email || '',
    city: row.city || '',
    state: row.state || '',
    cluster: row.cluster || '',
    address: row.address || '',
    gstin: row.gstin || '',
    salespersonId: row.salespersonId || row.salesperson_id || '',
    salespersonName: row.salespersonName || row.salesperson_name || '',
    paymentTerms: row.paymentTerms || row.payment_terms || '',
    creditLimit: Number(row.creditLimit ?? row.credit_limit ?? 0),
    totalBusiness: Number(row.totalBusiness ?? 0),
    totalPaid: Number(row.totalPaid ?? 0),
    amountDue: Number(row.amountDue ?? 0),
    overdueDays: 0,
    status: (row.status || 'active') as Customer['status'],
    ordersCount: Number(row.ordersCount ?? 0),
    lastOrderDate: row.lastOrderDate || 'None',
    lastPaymentDate: row.lastPaymentDate || 'None',
    lastPaymentAmount: Number(row.lastPaymentAmount ?? 0),
    tier: (row.tier || '') as Customer['tier'],
    activityHistory: [],
    notes: row.notes || undefined,
  };
}

export const clientsService = {
  async fetchClients(filters?: { search?: string; status?: string; tier?: string; salespersonId?: string; orgId?: string }): Promise<Customer[]> {
    if (!supabase || isDemoModeActive) return isDemoModeActive ? MOCK_CUSTOMERS : [];

    try {
      let query = supabase.from('v_client_financials').select('*');

      if (filters?.orgId) {
        query = query.eq('org_id', filters.orgId);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('client_status', filters.status);
      }
      if (filters?.tier && filters.tier !== 'all') {
        query = query.eq('tier', filters.tier);
      }
      if (filters?.salespersonId) {
        query = query.eq('salesman_id', filters.salespersonId);
      }
      if (filters?.search) {
        query = query.ilike('business_name', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw parseSupabaseError(error);

      if (!data || data.length === 0) return [];
      return data.map((d) => mapClientFinancialToCustomer(d));
    } catch (err: any) {
      console.error('Error fetching clients from Supabase:', err);
      return [];
    }
  },

  async fetchClientById(clientId: string): Promise<Customer | null> {
    if (!supabase || isDemoModeActive) {
      return isDemoModeActive ? (MOCK_CUSTOMERS.find((c) => c.id === clientId) || null) : null;
    }

    try {
      const { data: finData, error: finError } = await supabase
        .from('v_client_financials')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();

      if (finError) throw parseSupabaseError(finError);

      const { data: rawClient } = await supabase
        .from('customers')
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
      return null;
    }
  },

  async createClient(clientData: any): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase || isDemoModeActive) {
      return { success: true, data: { id: `cust-${Date.now()}`, ...clientData } };
    }

    try {
      // Use transactional create_client RPC with explicit named arguments
      const { data, error } = await supabase.rpc('create_client', {
        p_business_name: clientData.businessName || clientData.name || clientData.business_name,
        p_prop_name: clientData.propName || clientData.contact_person || clientData.prop_name || '',
        p_phone: clientData.phone,
        p_whatsapp: clientData.whatsapp || clientData.phone,
        p_email: clientData.email || null,
        p_city: clientData.city || '',
        p_state: clientData.state || '',
        p_cluster: clientData.cluster || '',
        p_address: clientData.address || null,
        p_gstin: clientData.gstin || null,
        p_salesperson_id: clientData.salespersonId || clientData.salesperson_id || clientData.salesman_id || null,
        p_credit_limit: Number(clientData.creditLimit || clientData.credit_limit || 0),
        p_payment_terms: clientData.paymentTerms || clientData.payment_terms || '',
      });

      if (error) throw parseSupabaseError(error);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create client' };
    }
  },

  async updateClient(clientId: string, updates: any): Promise<{ success: boolean; error?: string }> {
    if (!supabase || isDemoModeActive) return { success: true };

    try {
      const rowUpdates = toCustomerRow(updates);
      const { error } = await supabase
        .from('customers')
        .update(rowUpdates)
        .eq('id', clientId);

      if (error) throw parseSupabaseError(error);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update client' };
    }
  },

  async archiveClient(clientId: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase || isDemoModeActive) return { success: true };

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
    if (!supabase || isDemoModeActive) return { success: true };

    try {
      const { error } = await supabase.rpc('assign_salesman', {
        p_client_id: clientId,
        p_salesman_id: salespersonId,
      });

      if (error) throw parseSupabaseError(error);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to assign salesman' };
    }
  },

  async fetchClientNotes(clientId: string): Promise<any[]> {
    if (!supabase || isDemoModeActive) return [];

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
    if (!supabase || isDemoModeActive) return true;

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

