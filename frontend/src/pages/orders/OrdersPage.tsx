import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { OrderInspectDrawer } from '../../components/orders/OrderInspectDrawer';
import {
  ShoppingBag,
  Factory,
  Truck,
  IndianRupee,
  Plus,
  Search,
  Eye,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Package,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface OrdersPageProps {
  onNavigate?: (path: string) => void;
}

interface OrderDisplayItem {
  id: string;
  initials: string;
  initialsColor: string;
  customerStore: string;
  proprietorAndCity: string;
  date: string;
  articles: string;
  volumePairs: string;
  volumeCartons: string;
  factoryName: string;
  factoryPlant: string;
  status: 'In Production' | 'Ready to Dispatch' | 'Delivered' | 'Under Review';
  statusType: 'in_production' | 'ready_dispatch' | 'delivered' | 'under_review';
  netPayable: string;
  balanceDueText: string;
  rawOrder?: Order;
}

const DEFAULT_ORDERS_DISPLAY: OrderDisplayItem[] = [
  {
    id: 'ORD-0148',
    initials: 'AF',
    initialsColor: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/50',
    customerStore: 'ABC Footwear',
    proprietorAndCity: 'Agra • Ramesh & Sunil Agarwal',
    date: '—',
    articles: 'Runner Classic',
    volumePairs: '200 Pairs',
    volumeCartons: '(16 Ctns)',
    factoryName: 'Apex Footwear Works',
    factoryPlant: 'Agra Unit 2 (Sikandra Area)',
    status: 'In Production',
    statusType: 'in_production',
    netPayable: '₹2,66,000',
    balanceDueText: '₹1,66,000 Bal',
  },
  {
    id: 'ORD-0147',
    initials: 'KL',
    initialsColor: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900/50',
    customerStore: 'Kanpur Leather Mart',
    proprietorAndCity: 'Kanpur • Deepak Soni',
    date: '—',
    articles: 'Verona Crust Leather D...',
    volumePairs: '306 Pairs',
    volumeCartons: '(18 Ctns)',
    factoryName: 'Taj Heritage Craft',
    factoryPlant: 'Agra Unit 1',
    status: 'Ready to Dispatch',
    statusType: 'ready_dispatch',
    netPayable: '₹9,28,972',
    balanceDueText: '₹6,28,972 Bal',
  },
  {
    id: 'ORD-0146',
    initials: 'DW',
    initialsColor: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/50',
    customerStore: 'Delhi Walkways Hub',
    proprietorAndCity: 'New Delhi • Harpreet Singh',
    date: '—',
    articles: 'AeroGlide Knit Runner',
    volumePairs: '120 Pairs',
    volumeCartons: '(10 Ctns)',
    factoryName: 'Apex Footwear Works',
    factoryPlant: 'Agra Unit 3',
    status: 'Delivered',
    statusType: 'delivered',
    netPayable: '₹1,47,840',
    balanceDueText: 'Cleared',
  },
  {
    id: 'ORD-0145',
    initials: 'AF',
    initialsColor: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/50',
    customerStore: 'ABC Footwear Hub',
    proprietorAndCity: 'Agra • Sunil Agarwal',
    date: '—',
    articles: 'Verona Derby & Runners',
    volumePairs: '320 Pairs',
    volumeCartons: '(26 Ctns)',
    factoryName: 'Apex Footwear Works',
    factoryPlant: 'Agra Unit 2',
    status: 'Under Review',
    statusType: 'under_review',
    netPayable: '₹6,12,864',
    balanceDueText: '₹2,30,000 Bal',
  },
];

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  const {
    orders,
    setIsCreateOrderModalOpen,
    setIsPaymentModalOpen,
    updateOrderStatus,
    showToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // Inspect Drawer State
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);
  const [isInspectOpen, setIsInspectOpen] = useState<boolean>(false);

  // Auto-open inspect drawer if ?inspect=<id> in URL on mount/update
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const inspectId = params.get('inspect');
    if (inspectId) {
      const found = orders.find((o) => o.id === inspectId);
      if (found) {
        setInspectOrder(found);
        setIsInspectOpen(true);
      }
    }
  }, [orders]);

  // Dynamic order display list mapped from orders in context, with fallback to DEFAULT_ORDERS_DISPLAY
  const displayOrders: OrderDisplayItem[] = useMemo(() => {
    if (orders && orders.length > 0) {
      return orders.map((o) => {
        const initials = (o.customerName || 'CU')
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        const colorClasses = [
          'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/50',
          'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900/50',
          'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/50',
          'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900/50',
        ];
        const colorIdx = Math.abs(o.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colorClasses.length;

        const articlesStr = o.items && o.items.length > 0
          ? o.items.map((it) => it.designName || it.articleCode).join(', ')
          : '—';

        const statusMap: Record<string, { status: OrderDisplayItem['status']; statusType: OrderDisplayItem['statusType'] }> = {
          'In Production': { status: 'In Production', statusType: 'in_production' },
          'Ready to Dispatch': { status: 'Ready to Dispatch', statusType: 'ready_dispatch' },
          'Ready QC': { status: 'Ready to Dispatch', statusType: 'ready_dispatch' },
          'Dispatched': { status: 'Ready to Dispatch', statusType: 'ready_dispatch' },
          'Delivered': { status: 'Delivered', statusType: 'delivered' },
          'Approved': { status: 'In Production', statusType: 'in_production' },
          'Under Review': { status: 'Under Review', statusType: 'under_review' },
          'Draft': { status: 'Under Review', statusType: 'under_review' },
          'Submitted': { status: 'Under Review', statusType: 'under_review' },
        };

        const mappedStatus = statusMap[o.status] || {
          status: 'Under Review' as const,
          statusType: 'under_review' as const,
        };

        return {
          id: o.id,
          initials: initials || 'OR',
          initialsColor: colorClasses[colorIdx],
          customerStore: o.customerName || 'Customer Store',
          proprietorAndCity: `${o.customerCity || 'Agra'} • ${o.propName || 'Proprietor'}`,
          date: o.orderDate || '—',
          articles: articlesStr,
          volumePairs: `${o.pairsCount || o.items?.reduce((s, it) => s + (it.totalPairs || 0), 0) || 0} Pairs`,
          volumeCartons: `(${o.cartonsCount || o.items?.reduce((s, it) => s + (it.totalCartons || 0), 0) || 0} Ctns)`,
          factoryName: o.manufacturerName || 'Apex Footwear Works',
          factoryPlant: o.manufacturerPlant || 'Agra Unit',
          status: mappedStatus.status,
          statusType: mappedStatus.statusType,
          netPayable: `₹${(o.netPayable || 0).toLocaleString('en-IN')}`,
          balanceDueText: (o.balanceDue || 0) > 0 ? `₹${(o.balanceDue || 0).toLocaleString('en-IN')} Bal` : 'Cleared',
          rawOrder: o,
        };
      });
    }
    return DEFAULT_ORDERS_DISPLAY;
  }, [orders]);

  const filteredOrders = displayOrders.filter((ord) => {
    const q = search.toLowerCase();
    const matchesSearch =
      ord.id.toLowerCase().includes(q) ||
      ord.customerStore.toLowerCase().includes(q) ||
      ord.proprietorAndCity.toLowerCase().includes(q) ||
      ord.articles.toLowerCase().includes(q) ||
      ord.factoryName.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'All' || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (statusType: string, label: string) => {
    switch (statusType) {
      case 'in_production':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>{label}</span>
          </span>
        );
      case 'ready_dispatch':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            <span>{label}</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{label}</span>
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Discount Pending Approval</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>{label}</span>
          </span>
        );
    }
  };

  const handleInspect = (orderItem: OrderDisplayItem) => {
    const found = orderItem.rawOrder || orders.find((o) => o.id === orderItem.id);
    if (found) {
      setInspectOrder(found);
      setIsInspectOpen(true);
    } else {
      const fallback = orders[0];
      if (fallback) {
        setInspectOrder(fallback);
        setIsInspectOpen(true);
      } else {
        showToast('Order details not found');
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto pb-24 md:pb-12 bg-background text-foreground">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
        <button
          type="button"
          onClick={() => onNavigate?.('/admin/dashboard')}
          className="hover:underline cursor-pointer"
        >
          Dashboard
        </button>
        <ChevronRight size={13} className="text-muted-foreground/60" />
        <span className="text-blue-600 dark:text-blue-400 font-bold">
          {viewMode === 'detail' && selectedOrder ? selectedOrder.id : 'Orders'}
        </span>
      </div>

      {/* 2. Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Wholesale Consignments &amp; Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track production batches, factory allocations, dispatch bilty, and invoice balances.
          </p>
        </div>

        {viewMode === 'list' ? (
          <button
            type="button"
            onClick={() => setIsCreateOrderModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>New Wholesale Order</span>
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-muted text-foreground text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Back to Orders</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Record Payment</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. 4 KPI Summary Cards Row */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Total Orders */}
          <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:shadow-sm hover:border-border/80 transition-all flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ShoppingBag size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground truncate">Total Orders</p>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mt-0.5 tracking-tight leading-tight truncate">
                {orders.length > 0 ? orders.length : 4} Batches
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                All active consignments
              </p>
            </div>
          </div>

          {/* Card 2: In Production */}
          <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:shadow-sm hover:border-border/80 transition-all flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Factory size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground truncate">In Production</p>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mt-0.5 tracking-tight leading-tight truncate">
                {orders.length > 0
                  ? orders.filter((o) => o.status === 'In Production' || o.status === 'Approved').length
                  : 1} Batches
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                Active on factory lines
              </p>
            </div>
          </div>

          {/* Card 3: Ready to Dispatch */}
          <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:shadow-sm hover:border-border/80 transition-all flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Truck size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground truncate">Ready to Dispatch</p>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mt-0.5 tracking-tight leading-tight truncate">
                {orders.length > 0
                  ? orders.filter((o) => o.status === 'Ready to Dispatch' || o.status === 'Ready QC' || o.status === 'Dispatched').length
                  : 1} Batches
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                Awaiting transport loading
              </p>
            </div>
          </div>

          {/* Card 4: Total Consignment Value */}
          <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:shadow-sm hover:border-border/80 transition-all flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <IndianRupee size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground truncate">Total Consignment Value</p>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mt-0.5 tracking-tight leading-tight truncate">
                {orders.length > 0
                  ? `₹${(orders.reduce((sum, o) => sum + (o.netPayable || 0), 0) / 100000).toFixed(2)}L`
                  : '₹19.56L'}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                Gross wholesale value
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Table / Main Panel */}
      {viewMode === 'list' ? (
        <div className="bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 md:px-6 bg-surface border-b border-border flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order ID (ORD-0148), customer, articles..."
                className="w-full h-10 pl-10 pr-4 bg-muted/40 hover:bg-muted/70 focus:bg-surface border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="w-full sm:w-48 shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 bg-muted/40 hover:bg-muted/70 focus:bg-surface border border-border rounded-xl text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="In Production">In Production</option>
                <option value="Ready to Dispatch">Ready to Dispatch</option>
                <option value="Delivered">Delivered</option>
                <option value="Under Review">Under Review</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold uppercase text-[11px] tracking-wider bg-muted/25">
                  <th className="py-3.5 px-4 md:px-6">Order ID</th>
                  <th className="py-3.5 px-4">Customer Store</th>
                  <th className="py-3.5 px-4 text-center">Date</th>
                  <th className="py-3.5 px-4">Articles &amp; SKU</th>
                  <th className="py-3.5 px-4">Volume</th>
                  <th className="py-3.5 px-4">Factory Plant</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Net Payable</th>
                  <th className="py-3.5 px-4 md:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => handleInspect(ord)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    {/* Order ID */}
                    <td className="py-3.5 px-4 md:px-6 font-bold font-mono text-foreground text-xs sm:text-sm whitespace-nowrap">
                      {ord.id}
                    </td>

                    {/* Customer Store */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${ord.initialsColor}`}>
                          {ord.initials}
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-xs sm:text-sm leading-tight">
                            {ord.customerStore}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {ord.proprietorAndCity}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-center text-muted-foreground">
                      {ord.date}
                    </td>

                    {/* Articles & SKU */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-foreground text-xs sm:text-sm">
                        {ord.articles}
                      </span>
                    </td>

                    {/* Volume */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground text-xs sm:text-sm leading-tight">
                        {ord.volumePairs}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {ord.volumeCartons}
                      </div>
                    </td>

                    {/* Factory Plant */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-foreground text-xs sm:text-sm leading-tight">
                        {ord.factoryName}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {ord.factoryPlant}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(ord.statusType, ord.status)}
                    </td>

                    {/* Net Payable */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-bold font-mono text-foreground text-xs sm:text-sm leading-tight">
                        {ord.netPayable}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        {ord.balanceDueText}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 md:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleInspect(ord)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>Inspect</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast(`Actions for ${ord.id}`)}
                          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedOrder ? (
        /* Order Detail View */
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-foreground">Consignment {selectedOrder.id}</h2>
                  {getStatusBadge(selectedOrder.status.toLowerCase().replace(/ /g, '_'), selectedOrder.status)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Customer: {selectedOrder.customerName} ({selectedOrder.customerCity}) • Booked on {selectedOrder.orderDate || selectedOrder.timeline?.[0]?.date || '—'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedOrder.status === 'In Production') {
                      updateOrderStatus(selectedOrder.id, 'Ready to Dispatch');
                      showToast(`${selectedOrder.id} marked as Ready to Dispatch!`);
                    } else if (selectedOrder.status === 'Ready to Dispatch') {
                      updateOrderStatus(selectedOrder.id, 'Delivered');
                      showToast(`${selectedOrder.id} marked as Delivered!`);
                    } else {
                      showToast(`Consignment ${selectedOrder.id} is already completed.`);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Advance Stage →
                </button>
              </div>
            </div>

            {/* Articles List */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3">Order Articles &amp; Breakdown</h3>
              <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <p className="font-bold text-foreground">{item.designName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Article: {item.articleCode} • {item.totalCartons} Cartons ({item.totalPairs} Pairs)</p>
                    </div>
                    <div className="text-right font-mono font-bold text-foreground">
                      ₹{item.itemSubtotal?.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Inspect Drawer Component */}
      <OrderInspectDrawer
        order={inspectOrder}
        open={isInspectOpen}
        onClose={() => setIsInspectOpen(false)}
        onOpenFullDetail={(ord) => {
          setSelectedOrder(ord);
          setViewMode('detail');
          setIsInspectOpen(false);
        }}
      />
    </div>
  );
};
