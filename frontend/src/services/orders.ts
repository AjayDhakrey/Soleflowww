import { supabase } from '../lib/supabase';
import { Order, OrderItem, OrderTimelineEvent } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_ORDERS } from '../data/mockData';

export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type OrderFinancialRow = Database['public']['Views']['v_order_financials']['Row'];

export function mapOrderFinancialToOrder(
  fin: OrderFinancialRow,
  rawOrder?: OrderRow,
  items?: OrderItem[],
  history?: OrderTimelineEvent[]
): Order {
  return {
    id: fin.order_id,
    customerId: fin.client_id,
    customerName: 'Client Store',
    propName: 'Store Owner',
    customerCity: 'Agra',
    customerState: 'Uttar Pradesh',
    salespersonId: fin.salesperson_id || '',
    salespersonName: 'Field Rep',
    items: items || [],
    pairsCount: fin.total_pairs || 0,
    cartonsCount: fin.total_cartons || 0,
    wholesaleRate: fin.total_pairs > 0 ? Math.round(Number(fin.subtotal) / fin.total_pairs) : 0,
    subtotal: Number(fin.subtotal || 0),
    tradeDiscountPercent: Number(fin.trade_discount_percent || 0),
    tradeDiscountAmount: Number(fin.trade_discount_amount || 0),
    taxableSubtotal: Number(fin.taxable_subtotal || 0),
    gstPercent: Number(fin.gst_percent || 12),
    gstAmount: Number(fin.gst_amount || 0),
    netPayable: Number(fin.net_payable || 0),
    advanceDeposited: Number(fin.total_paid || 0),
    balanceDue: Number(fin.balance_due || 0),
    manufacturerId: fin.manufacturer_id || 'mfg-1',
    manufacturerName: 'Apex Footwear Works',
    manufacturerPlant: 'Agra Unit 2',
    expectedDelivery: fin.expected_delivery || 'TBD',
    paymentStatus: (fin.payment_status || 'Advance Deposited') as Order['paymentStatus'],
    status: (fin.status || 'Draft') as Order['status'],
    orderDate: fin.order_date || new Date().toISOString().split('T')[0],
    batchNumber: rawOrder?.batch_number || undefined,
    timeline: history || [
      { step: 'Created', date: fin.order_date, completed: true },
      { step: 'Approved', date: 'Pending', completed: fin.status !== 'Draft' },
      { step: 'In Production', date: 'Pending', completed: ['In Production', 'Ready QC', 'Ready to Dispatch', 'Dispatched', 'Delivered'].includes(fin.status) },
      { step: 'Dispatched', date: 'Pending', completed: ['Dispatched', 'Delivered'].includes(fin.status) },
      { step: 'Delivered', date: 'Pending', completed: fin.status === 'Delivered' },
    ],
  };
}

export const ordersService = {
  async fetchOrders(filters?: {
    status?: string;
    clientId?: string;
    salespersonId?: string;
    search?: string;
  }): Promise<Order[]> {
    if (!supabase) return MOCK_ORDERS;

    try {
      let query = supabase.from('v_order_financials').select('*');

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      if (filters?.salespersonId) {
        query = query.eq('salesperson_id', filters.salespersonId);
      }
      if (filters?.search) {
        query = query.ilike('order_id', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw parseSupabaseError(error);

      if (!data || data.length === 0) return MOCK_ORDERS;

      return data.map((d) => mapOrderFinancialToOrder(d));
    } catch (err) {
      console.warn('Error fetching orders from Supabase; returning mock orders:', err);
      return MOCK_ORDERS;
    }
  },

  async fetchOrderById(orderId: string): Promise<Order | null> {
    if (!supabase) {
      return MOCK_ORDERS.find((o) => o.id === orderId) || null;
    }

    try {
      const { data: finData, error: finError } = await supabase
        .from('v_order_financials')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (finError) throw parseSupabaseError(finError);
      if (!finData) return null;

      // Fetch items
      const { data: rawItems } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      const items: OrderItem[] = (rawItems || []).map((item: any) => ({
        designId: item.design_id || 'sf-1024',
        designName: item.design_name,
        articleCode: item.article_code,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
        ratePerPair: Number(item.rate_per_pair),
        sizeBreakdown: Array.isArray(item.size_breakdown) ? item.size_breakdown : [],
        totalPairs: item.total_pairs,
        totalCartons: item.total_cartons,
        loosePairs: item.loose_pairs,
        itemSubtotal: Number(item.item_subtotal),
      }));

      // Fetch status history
      const { data: rawHistory } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      const history: OrderTimelineEvent[] = (rawHistory || []).map((h: any) => ({
        step: h.to_status,
        date: new Date(h.created_at).toLocaleDateString('en-IN'),
        completed: true,
        notes: h.note || undefined,
      }));

      return mapOrderFinancialToOrder(finData, undefined, items, history);
    } catch (err) {
      console.error('Error fetching order by ID:', err);
      return MOCK_ORDERS.find((o) => o.id === orderId) || null;
    }
  },

  async createOrderDraft(params: {
    order: Partial<OrderRow>;
    items: any[];
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase) {
      return {
        success: true,
        data: {
          id: `ORD-${Date.now().toString().slice(-4)}`,
          ...params.order,
        },
      };
    }

    try {
      const { data, error } = await supabase.rpc('create_order_draft', {
        p_order: params.order as any,
        p_items: params.items as any,
      });

      if (error) throw parseSupabaseError(error);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create order' };
    }
  },

  async advanceOrderStatus(params: {
    orderId: string;
    newStatus: string;
    note?: string;
    manufacturerId?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase) return { success: true };

    try {
      const { data, error } = await supabase.rpc('advance_order_status', {
        p_order_id: params.orderId,
        p_new_status: params.newStatus,
        p_note: params.note || null,
        p_manufacturer_id: params.manufacturerId || null,
      });

      if (error) throw parseSupabaseError(error);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to advance order status' };
    }
  },
};
