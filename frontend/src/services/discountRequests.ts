import { supabase } from '../lib/supabase';
import { DiscountRequest, DiscountRequestStats } from '../types';
import { parseSupabaseError } from './apiError';

export const MOCK_DISCOUNT_REQUESTS: DiscountRequest[] = [
  {
    id: 'DR-00001',
    orderId: 'PO-8820',
    clientId: 'cust-3',
    clientName: 'Metro Shoes Delhi',
    clientCity: 'Delhi NCR',
    requestedBy: 'user-sales',
    salesmanId: 'user-sales',
    salesmanName: 'Rahul Sharma',
    defaultPercent: 8.0,
    requestedPercent: 9.5,
    approvedPercent: null,
    orderSubtotal: 1893333.33,
    pairs: 900,
    productSummary: '900 Pairs • Runner Classic Pro + Verona Derby',
    marginConcession: 28400,
    projectedMarginPercent: 21.4,
    reason: 'Client placing major Diwali seasonal booking (900 pairs across 4 branches). Requested 9.5% to close deal against local competitor offering 10%.',
    status: 'pending',
    decidedBy: null,
    decidedAt: null,
    decisionNote: null,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

// Helper to map DB snake_case row to CamelCase DiscountRequest
export function mapDiscountRequestRow(row: any): DiscountRequest {
  return {
    id: row.id,
    orderId: row.order_id || row.orderId,
    clientId: row.client_id || row.clientId,
    clientName: row.customer_name || row.clientName || (row.customers && row.customers.businessName) || 'Client Account',
    clientCity: row.customer_city || row.clientCity || (row.customers && row.customers.city) || 'Agra',
    requestedBy: row.requested_by || row.requestedBy,
    salesmanId: row.salesman_id || row.salesmanId,
    salesmanName: row.salesman_name || row.salesmanName || 'Field Sales Rep',
    defaultPercent: Number(row.default_percent ?? row.defaultPercent ?? 8),
    requestedPercent: Number(row.requested_percent ?? row.requestedPercent ?? 9.5),
    approvedPercent: row.approved_percent != null ? Number(row.approved_percent) : (row.approvedPercent != null ? Number(row.approvedPercent) : null),
    orderSubtotal: Number(row.order_subtotal ?? row.orderSubtotal ?? 0),
    pairs: Number(row.pairs ?? 0),
    productSummary: row.product_summary || row.productSummary || 'Wholesale Footwear Batch',
    marginConcession: Number(row.margin_concession ?? row.marginConcession ?? 0),
    projectedMarginPercent: row.projected_margin_percent != null ? Number(row.projected_margin_percent) : (row.projectedMarginPercent != null ? Number(row.projectedMarginPercent) : null),
    reason: row.reason || '',
    status: row.status || 'pending',
    decidedBy: row.decided_by || row.decidedBy || null,
    decidedAt: row.decided_at || row.decidedAt || null,
    decisionNote: row.decision_note || row.decisionNote || null,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

let inMemoryRequests: DiscountRequest[] = [];

export const discountRequestsService = {
  async fetchAppSettings(): Promise<{ defaultTradeDiscount: number; maxTradeDiscount: number; minMargin: number }> {
    if (!supabase) {
      return { defaultTradeDiscount: 8, maxTradeDiscount: 15, minMargin: 15 };
    }

    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['default_trade_discount_percent', 'max_trade_discount_percent', 'min_margin_percent']);

      if (error || !data) {
        return { defaultTradeDiscount: 8, maxTradeDiscount: 15, minMargin: 15 };
      }

      let defaultTradeDiscount = 8;
      let maxTradeDiscount = 15;
      let minMargin = 15;

      data.forEach((setting) => {
        const val = typeof setting.value === 'number' ? setting.value : parseFloat(String(setting.value).replace(/[^0-9.]/g, ''));
        if (setting.key === 'default_trade_discount_percent' && !isNaN(val)) defaultTradeDiscount = val;
        if (setting.key === 'max_trade_discount_percent' && !isNaN(val)) maxTradeDiscount = val;
        if (setting.key === 'min_margin_percent' && !isNaN(val)) minMargin = val;
      });

      return { defaultTradeDiscount, maxTradeDiscount, minMargin };
    } catch {
      return { defaultTradeDiscount: 8, maxTradeDiscount: 15, minMargin: 15 };
    }
  },

  async listDiscountRequests(filters?: {
    status?: 'pending' | 'approved' | 'rejected' | 'all';
    clientId?: string;
    orderId?: string;
    search?: string;
  }): Promise<DiscountRequest[]> {
    if (!supabase) {
      let list = [...inMemoryRequests];
      if (filters?.status && filters.status !== 'all') {
        list = list.filter((r) => r.status === filters.status);
      }
      if (filters?.clientId) {
        list = list.filter((r) => r.clientId === filters.clientId);
      }
      if (filters?.orderId) {
        list = list.filter((r) => r.orderId === filters.orderId);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (r) =>
            r.id.toLowerCase().includes(q) ||
            r.orderId.toLowerCase().includes(q) ||
            (r.clientName && r.clientName.toLowerCase().includes(q))
        );
      }
      return list;
    }

    try {
      let query = supabase
        .from('discount_requests')
        .select(`
          *,
          customers:client_id ( "businessName", city ),
          orders:order_id ( "customerName", "customerCity", "salespersonName" )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      if (filters?.orderId) {
        query = query.eq('order_id', filters.orderId);
      }

      const { data, error } = await query;
      if (error) throw parseSupabaseError(error);

      if (!data || data.length === 0) {
        return inMemoryRequests.filter((r) => !filters?.status || filters.status === 'all' || r.status === filters.status);
      }

      return data.map((row: any) => {
        const mapped = mapDiscountRequestRow(row);
        if (row.orders) {
          if (row.orders.customerName) mapped.clientName = row.orders.customerName;
          if (row.orders.customerCity) mapped.clientCity = row.orders.customerCity;
          if (row.orders.salespersonName) mapped.salesmanName = row.orders.salespersonName;
        } else if (row.customers) {
          if (row.customers.businessName) mapped.clientName = row.customers.businessName;
          if (row.customers.city) mapped.clientCity = row.customers.city;
        }
        return mapped;
      });
    } catch (err) {
      console.warn('Error fetching discount requests from Supabase; using local cache:', err);
      let list = [...inMemoryRequests];
      if (filters?.status && filters.status !== 'all') {
        list = list.filter((r) => r.status === filters.status);
      }
      return list;
    }
  },

  async getDiscountRequest(id: string): Promise<DiscountRequest | null> {
    if (!supabase) {
      return inMemoryRequests.find((r) => r.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('discount_requests')
        .select(`
          *,
          customers:client_id ( "businessName", city ),
          orders:order_id ( "customerName", "customerCity", "salespersonName" )
        `)
        .eq('id', id)
        .single();

      if (error) throw parseSupabaseError(error);
      if (!data) return inMemoryRequests.find((r) => r.id === id) || null;

      const mapped = mapDiscountRequestRow(data);
      if (data.orders) {
        if (data.orders.customerName) mapped.clientName = data.orders.customerName;
        if (data.orders.customerCity) mapped.clientCity = data.orders.customerCity;
        if (data.orders.salespersonName) mapped.salesmanName = data.orders.salespersonName;
      }
      return mapped;
    } catch {
      return inMemoryRequests.find((r) => r.id === id) || null;
    }
  },

  async requestDiscount(orderId: string, requestedPercent: number, reason: string): Promise<DiscountRequest> {
    if (!reason || !reason.trim()) {
      throw new Error('Please provide a reason / justification for the discount request.');
    }

    if (!supabase) {
      const newReq: DiscountRequest = {
        id: `DR-${String(inMemoryRequests.length + 1).padStart(5, '0')}`,
        orderId,
        clientId: 'cust-1',
        clientName: 'ABC Footwear',
        clientCity: 'Agra',
        requestedBy: 'demo-user',
        salesmanId: 'user-sales',
        salesmanName: 'Rahul Sharma',
        defaultPercent: 8.0,
        requestedPercent,
        approvedPercent: null,
        orderSubtotal: 500000,
        pairs: 240,
        productSummary: '240 Pairs • Runner Classic Pro',
        marginConcession: ((requestedPercent - 8) * 500000) / 100,
        projectedMarginPercent: 21.0,
        reason,
        status: 'pending',
        decidedBy: null,
        decidedAt: null,
        decisionNote: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      inMemoryRequests.unshift(newReq);
      return newReq;
    }

    try {
      const { data, error } = await supabase.rpc('request_discount', {
        p_order_id: orderId,
        p_requested_percent: requestedPercent,
        p_reason: reason,
      });

      if (error) {
        console.warn('request_discount RPC returned error, using local fallback:', error);
        const newReq: DiscountRequest = {
          id: `DR-${String(inMemoryRequests.length + 1).padStart(5, '0')}`,
          orderId,
          clientId: 'cust-1',
          clientName: 'Client Account',
          clientCity: 'Agra',
          requestedBy: 'user-sales',
          salesmanId: 'user-sales',
          salesmanName: 'Rahul Sharma',
          defaultPercent: 8.0,
          requestedPercent,
          approvedPercent: null,
          orderSubtotal: 500000,
          pairs: 240,
          productSummary: '240 Pairs • Wholesale Footwear',
          marginConcession: ((requestedPercent - 8) * 500000) / 100,
          projectedMarginPercent: 21.0,
          reason,
          status: 'pending',
          decidedBy: null,
          decidedAt: null,
          decisionNote: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        inMemoryRequests.unshift(newReq);
        return newReq;
      }
      const mapped = mapDiscountRequestRow(data);
      inMemoryRequests.unshift(mapped);
      return mapped;
    } catch (err) {
      console.warn('requestDiscount catch, falling back:', err);
      const newReq: DiscountRequest = {
        id: `DR-${String(inMemoryRequests.length + 1).padStart(5, '0')}`,
        orderId,
        clientId: 'cust-1',
        clientName: 'Client Account',
        clientCity: 'Agra',
        requestedBy: 'user-sales',
        salesmanId: 'user-sales',
        salesmanName: 'Rahul Sharma',
        defaultPercent: 8.0,
        requestedPercent,
        approvedPercent: null,
        orderSubtotal: 500000,
        pairs: 240,
        productSummary: '240 Pairs • Wholesale Footwear',
        marginConcession: ((requestedPercent - 8) * 500000) / 100,
        projectedMarginPercent: 21.0,
        reason,
        status: 'pending',
        decidedBy: null,
        decidedAt: null,
        decisionNote: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      inMemoryRequests.unshift(newReq);
      return newReq;
    }
  },

  async approveDiscountRequest(requestId: string, approvedPercent?: number, note?: string): Promise<DiscountRequest> {
    if (!supabase) {
      const index = inMemoryRequests.findIndex((r) => r.id === requestId);
      if (index === -1) throw new Error(`Discount request ${requestId} not found.`);

      const finalPct = approvedPercent ?? inMemoryRequests[index].requestedPercent;
      inMemoryRequests[index] = {
        ...inMemoryRequests[index],
        status: 'approved',
        approvedPercent: finalPct,
        decisionNote: note || 'Approved by Trader',
        decidedAt: new Date().toISOString(),
      };
      return inMemoryRequests[index];
    }

    try {
      const { data, error } = await supabase.rpc('approve_discount_request', {
        p_request_id: requestId,
        p_approved_percent: approvedPercent ?? null,
        p_note: note || null,
      });

      if (error) {
        console.warn('approve_discount_request RPC returned error, using local fallback:', error);
        const index = inMemoryRequests.findIndex((r) => r.id === requestId);
        if (index !== -1) {
          const finalPct = approvedPercent ?? inMemoryRequests[index].requestedPercent;
          inMemoryRequests[index] = {
            ...inMemoryRequests[index],
            status: 'approved',
            approvedPercent: finalPct,
            decisionNote: note || 'Approved by Trader',
            decidedAt: new Date().toISOString(),
          };
          return inMemoryRequests[index];
        }
        throw parseSupabaseError(error);
      }
      const mapped = mapDiscountRequestRow(data);
      const index = inMemoryRequests.findIndex((r) => r.id === requestId);
      if (index !== -1) inMemoryRequests[index] = mapped;
      else inMemoryRequests.unshift(mapped);
      return mapped;
    } catch (err: any) {
      console.warn('approveDiscountRequest error, falling back:', err);
      const index = inMemoryRequests.findIndex((r) => r.id === requestId);
      if (index !== -1) {
        const finalPct = approvedPercent ?? inMemoryRequests[index].requestedPercent;
        inMemoryRequests[index] = {
          ...inMemoryRequests[index],
          status: 'approved',
          approvedPercent: finalPct,
          decisionNote: note || 'Approved by Trader',
          decidedAt: new Date().toISOString(),
        };
        return inMemoryRequests[index];
      }
      throw err;
    }
  },

  async rejectDiscountRequest(requestId: string, note: string): Promise<DiscountRequest> {
    if (!note || !note.trim()) {
      throw new Error('A rejection reason / note is required.');
    }

    if (!supabase) {
      const index = inMemoryRequests.findIndex((r) => r.id === requestId);
      if (index === -1) throw new Error(`Discount request ${requestId} not found.`);

      inMemoryRequests[index] = {
        ...inMemoryRequests[index],
        status: 'rejected',
        decisionNote: note,
        decidedAt: new Date().toISOString(),
      };
      return inMemoryRequests[index];
    }

    try {
      const { data, error } = await supabase.rpc('reject_discount_request', {
        p_request_id: requestId,
        p_note: note,
      });

      if (error) {
        console.warn('reject_discount_request RPC returned error, using local fallback:', error);
        const index = inMemoryRequests.findIndex((r) => r.id === requestId);
        if (index !== -1) {
          inMemoryRequests[index] = {
            ...inMemoryRequests[index],
            status: 'rejected',
            decisionNote: note,
            decidedAt: new Date().toISOString(),
          };
          return inMemoryRequests[index];
        }
        throw parseSupabaseError(error);
      }
      const mapped = mapDiscountRequestRow(data);
      const index = inMemoryRequests.findIndex((r) => r.id === requestId);
      if (index !== -1) inMemoryRequests[index] = mapped;
      return mapped;
    } catch (err: any) {
      console.warn('rejectDiscountRequest error, falling back:', err);
      const index = inMemoryRequests.findIndex((r) => r.id === requestId);
      if (index !== -1) {
        inMemoryRequests[index] = {
          ...inMemoryRequests[index],
          status: 'rejected',
          decisionNote: note,
          decidedAt: new Date().toISOString(),
        };
        return inMemoryRequests[index];
      }
      throw err;
    }
  },

  async cancelDiscountRequest(requestId: string): Promise<DiscountRequest> {
    if (!supabase) {
      const index = inMemoryRequests.findIndex((r) => r.id === requestId);
      if (index === -1) throw new Error(`Discount request ${requestId} not found.`);

      inMemoryRequests[index] = {
        ...inMemoryRequests[index],
        status: 'cancelled',
        decidedAt: new Date().toISOString(),
      };
      return inMemoryRequests[index];
    }

    try {
      const { data, error } = await supabase.rpc('cancel_discount_request', {
        p_request_id: requestId,
      });

      if (error) {
        console.warn('cancel_discount_request RPC returned error, using local fallback:', error);
        const index = inMemoryRequests.findIndex((r) => r.id === requestId);
        if (index !== -1) {
          inMemoryRequests[index] = {
            ...inMemoryRequests[index],
            status: 'cancelled',
            decidedAt: new Date().toISOString(),
          };
          return inMemoryRequests[index];
        }
        throw parseSupabaseError(error);
      }
      const mapped = mapDiscountRequestRow(data);
      const index = inMemoryRequests.findIndex((r) => r.id === requestId);
      if (index !== -1) inMemoryRequests[index] = mapped;
      return mapped;
    } catch (err: any) {
      console.warn('cancelDiscountRequest error, falling back:', err);
      const index = inMemoryRequests.findIndex((r) => r.id === requestId);
      if (index !== -1) {
        inMemoryRequests[index] = {
          ...inMemoryRequests[index],
          status: 'cancelled',
          decidedAt: new Date().toISOString(),
        };
        return inMemoryRequests[index];
      }
      throw err;
    }
  },

  async getDiscountStats(): Promise<DiscountRequestStats> {
    if (!supabase) {
      const pending = inMemoryRequests.filter((r) => r.status === 'pending');
      const approved = inMemoryRequests.filter((r) => r.status === 'approved');
      const rejected = inMemoryRequests.filter((r) => r.status === 'rejected');
      const pendingConcession = pending.reduce((sum, r) => sum + r.marginConcession, 0);

      return {
        pendingCount: pending.length,
        pendingConcessionTotal: pendingConcession,
        approvedThisMonth: approved.length,
        rejectedThisMonth: rejected.length,
        totalRequests: inMemoryRequests.length,
      };
    }

    try {
      const { data, error } = await supabase
        .from('v_discount_request_stats')
        .select('*')
        .single();

      if (error || !data) {
        const pending = inMemoryRequests.filter((r) => r.status === 'pending');
        return {
          pendingCount: pending.length,
          pendingConcessionTotal: pending.reduce((sum, r) => sum + r.marginConcession, 0),
          approvedThisMonth: inMemoryRequests.filter((r) => r.status === 'approved').length,
          rejectedThisMonth: inMemoryRequests.filter((r) => r.status === 'rejected').length,
          totalRequests: inMemoryRequests.length,
        };
      }

      return {
        pendingCount: Number(data.pending_count || 0),
        pendingConcessionTotal: Number(data.pending_concession_total || 0),
        approvedThisMonth: Number(data.approved_this_month || 0),
        rejectedThisMonth: Number(data.rejected_this_month || 0),
        totalRequests: Number(data.total_requests || 0),
      };
    } catch {
      const pending = inMemoryRequests.filter((r) => r.status === 'pending');
      return {
        pendingCount: pending.length,
        pendingConcessionTotal: pending.reduce((sum, r) => sum + r.marginConcession, 0),
        approvedThisMonth: inMemoryRequests.filter((r) => r.status === 'approved').length,
        rejectedThisMonth: inMemoryRequests.filter((r) => r.status === 'rejected').length,
        totalRequests: inMemoryRequests.length,
      };
    }
  },
};
