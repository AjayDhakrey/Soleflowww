import { supabase, isDemoModeActive, toValidOrgId } from '../lib/supabase';
import { Order, OrderItem, OrderTimelineEvent } from '../types';
import { Database } from '../types/database.types';
import { parseSupabaseError } from './apiError';
import { MOCK_ORDERS } from '../data/mockData';

export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type OrderFinancialRow = Database['public']['Views']['v_order_financials']['Row'];

export function mapOrderFinancialToOrder(
  fin: any,
  rawOrder?: any,
  items?: OrderItem[],
  history?: OrderTimelineEvent[]
): Order {
  const status = (fin.order_status || fin.status || rawOrder?.status || 'Draft') as Order['status'];
  const orderDate = fin.order_date_at ? new Date(fin.order_date_at).toLocaleDateString('en-IN') : (rawOrder?.orderDate || fin.order_date || '');

  return {
    id: fin.order_id || rawOrder?.id,
    customerId: fin.client_id || rawOrder?.customerId,
    customerName: fin.client_name || rawOrder?.customerName || '',
    propName: rawOrder?.propName || '',
    customerCity: rawOrder?.customerCity || '',
    customerState: rawOrder?.customerState || '',
    salespersonId: fin.salesman_id || fin.salesperson_id || rawOrder?.salespersonId || '',
    salespersonName: fin.salesman_name || fin.salesperson_name || rawOrder?.salespersonName || '',
    items: items || rawOrder?.items || [],
    pairsCount: Number(rawOrder?.pairsCount ?? fin.total_pairs ?? 0),
    cartonsCount: Number(rawOrder?.cartonsCount ?? fin.total_cartons ?? 0),
    wholesaleRate: Number(rawOrder?.wholesaleRate ?? 0),
    subtotal: Number(rawOrder?.subtotal ?? fin.subtotal ?? 0),
    tradeDiscountPercent: Number(rawOrder?.tradeDiscountPercent ?? fin.trade_discount_percent ?? 0),
    tradeDiscountAmount: Number(rawOrder?.tradeDiscountAmount ?? fin.trade_discount_amount ?? 0),
    taxableSubtotal: Number(rawOrder?.taxableSubtotal ?? fin.taxable_subtotal ?? 0),
    gstPercent: Number(rawOrder?.gstPercent ?? fin.gst_percent ?? 0),
    gstAmount: Number(rawOrder?.gstAmount ?? fin.gst_amount ?? 0),
    netPayable: Number(fin.net_payable ?? rawOrder?.netPayable ?? 0),
    advanceDeposited: Number(fin.paid_verified ?? fin.total_paid ?? rawOrder?.advanceDeposited ?? 0),
    balanceDue: Number(fin.outstanding ?? fin.balance_due ?? rawOrder?.balanceDue ?? 0),
    manufacturerId: rawOrder?.manufacturerId || fin.manufacturer_id || '',
    manufacturerName: rawOrder?.manufacturerName || '',
    manufacturerPlant: rawOrder?.manufacturerPlant || '',
    expectedDelivery: rawOrder?.expectedDelivery || fin.expected_delivery || 'TBD',
    paymentStatus: (fin.payment_status || rawOrder?.paymentStatus || 'Payment Pending') as Order['paymentStatus'],
    status,
    orderDate,
    batchNumber: rawOrder?.batchNumber || rawOrder?.batch_number || undefined,
    timeline: history || [
      { step: 'Created', date: orderDate, completed: true },
      { step: 'Approved', date: 'Pending', completed: status !== 'Draft' },
      { step: 'In Production', date: 'Pending', completed: ['In Production', 'Ready QC', 'Ready to Dispatch', 'Dispatched', 'Delivered'].includes(status) },
      { step: 'Dispatched', date: 'Pending', completed: ['Dispatched', 'Delivered'].includes(status) },
      { step: 'Delivered', date: 'Pending', completed: status === 'Delivered' },
    ],
  };
}

export const ordersService = {
  async fetchOrders(filters?: {
    status?: string;
    clientId?: string;
    salespersonId?: string;
    search?: string;
    orgId?: string;
  }): Promise<Order[]> {
    if (!supabase || isDemoModeActive) return isDemoModeActive ? MOCK_ORDERS : [];

    try {
      let query = supabase.from('v_order_financials').select('*');

      if (filters?.orgId) {
        query = query.eq('org_id', toValidOrgId(filters.orgId));
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('order_status', filters.status);
      }
      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      if (filters?.salespersonId) {
        query = query.eq('salesman_id', filters.salespersonId);
      }
      if (filters?.search) {
        query = query.ilike('order_id', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw parseSupabaseError(error);

      if (!data || data.length === 0) return [];

      return data.map((d) => mapOrderFinancialToOrder(d));
    } catch (err) {
      console.error('Error fetching orders from Supabase:', err);
      return [];
    }
  },

  async fetchOrderById(orderId: string): Promise<Order | null> {
    if (!supabase || isDemoModeActive) {
      return null;
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
        designId: item.design_id || '',
        designName: item.design_name_snapshot || item.design_name || '',
        articleCode: item.design_code_snapshot || item.article_code || '',
        image: '',
        ratePerPair: Number(item.rate || item.rate_per_pair || 0),
        sizeBreakdown: Array.isArray(item.size_matrix) ? item.size_matrix : (Array.isArray(item.size_breakdown) ? item.size_breakdown : []),
        totalPairs: Number(item.qty_pairs || item.total_pairs || 0),
        totalCartons: Number(item.cartons || item.total_cartons || 0),
        loosePairs: Number(item.loose_pairs || 0),
        itemSubtotal: Number(item.line_total || item.item_subtotal || 0),
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
      return null;
    }
  },

  async createOrderDraft(params: {
    order?: Partial<OrderRow> | any;
    items: any[];
    clientId?: string;
    tradeDiscountPercent?: number;
    gstPercent?: number;
    advanceDeposited?: number;
    expectedDelivery?: string;
    notes?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase || isDemoModeActive) {
      return {
        success: true,
        data: {
          id: `ORD-${Date.now().toString().slice(-4)}`,
          ...(params.order || params),
        },
      };
    }

    try {
      const order = params.order || params;
      const { data, error } = await supabase.rpc('create_order_draft', {
        p_client_id: order.customerId || order.client_id || params.clientId,
        p_items: (params.items || order.items || []) as any,
        p_trade_discount_percent: Number(order.tradeDiscountPercent ?? order.trade_discount_percent ?? params.tradeDiscountPercent ?? 5),
        p_gst_percent: Number(order.gstPercent ?? order.gst_percent ?? params.gstPercent ?? 12),
        p_advance_deposited: Number(order.advanceDeposited ?? order.advance_deposited ?? params.advanceDeposited ?? 0),
        p_expected_delivery: order.expectedDelivery || order.expected_delivery || params.expectedDelivery || null,
        p_notes: order.notes || params.notes || null,
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
    if (!supabase || isDemoModeActive) return { success: true };

    try {
      const { data, error } = await supabase.rpc('advance_order_status', {
        p_order_id: params.orderId,
        p_to_status: params.newStatus,
        p_note: params.note || '',
      });

      if (error) throw parseSupabaseError(error);

      if (params.manufacturerId) {
        await supabase
          .from('orders')
          .update({ manufacturerId: params.manufacturerId })
          .eq('id', params.orderId);
      }

      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to advance order status' };
    }
  },
};

