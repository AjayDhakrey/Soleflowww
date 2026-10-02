import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { OrderInspectDrawer } from '../../components/orders/OrderInspectDrawer';
import { OrdersKpiCards } from '../../components/orders/OrdersKpiCards';
import { InvoicePreviewModal } from '../../components/orders/OrderInvoiceTemplate';
import {
  ShoppingBag,
  Factory,
  Truck,
  IndianRupee,
  Plus,
  Search,
  Eye,
  Printer,
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
    customers,
    setIsCreateOrderModalOpen,
    setIsPaymentModalOpen,
    updateOrderStatus,
    showToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

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
          .replace(/__AUDIT_TEST__/g, '')
          .trim()
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'CU';

        const colorClasses = [
          'bg-blue-50 text-blue-600 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/50',
          'bg-purple-50 text-purple-600 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900/50',
          'bg-emerald-50 text-emerald-600 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/50',
          'bg-amber-50 text-amber-600 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900/50',
        ];
        const colorIdx = Math.abs(o.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colorClasses.length;

        const totalItemsCount = o.items?.length || 0;
        const firstItem = o.items?.[0];
        const articlesStr = totalItemsCount > 0
          ? `${firstItem?.designName || firstItem?.articleCode || 'Footwear Model'}${totalItemsCount > 1 ? ` (+${totalItemsCount - 1} more)` : ''}`
          : `Batch Article (${Number(o.pairsCount || 24)} Pairs)`;

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

        const totalPairs = Number(o.pairsCount || o.items?.reduce((s, it) => s + (it.totalPairs || 0), 0) || 0);
        const totalCartons = Number(o.cartonsCount || o.items?.reduce((s, it) => s + (it.totalCartons || 0), 0) || Math.ceil(totalPairs / 12));

        return {
          id: o.id,
          initials: initials || 'OR',
          initialsColor: colorClasses[colorIdx],
          customerStore: o.customerName || 'Customer Store',
          proprietorAndCity: `${o.customerCity || 'Agra'} • ${o.propName || 'Store Owner'}`,
          date: o.orderDate || '—',
          articles: articlesStr,
          volumePairs: `${totalPairs.toLocaleString('en-IN')} Pairs`,
          volumeCartons: `${totalCartons} Cartons`,
          factoryName: o.manufacturerName || 'Apex Footwear Works',
          factoryPlant: o.manufacturerPlant || 'Agra Unit 2',
          status: mappedStatus.status,
          statusType: mappedStatus.statusType,
          netPayable: `₹${Number(o.netPayable || 0).toLocaleString('en-IN')}`,
          balanceDueText: Number(o.balanceDue || 0) > 0 ? `₹${Number(o.balanceDue).toLocaleString('en-IN')} Bal` : 'Cleared',
          rawOrder: o,
        };
      });
    }
    return DEFAULT_ORDERS_DISPLAY;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return displayOrders.filter((ord) => {
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
  }, [displayOrders, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const total = displayOrders.length;
    const inProd = displayOrders.filter((o) => o.status === 'In Production').length;
    const readyDispatch = displayOrders.filter((o) => o.status === 'Ready to Dispatch').length;
    const delivered = displayOrders.filter((o) => o.status === 'Delivered').length;
    const underReview = displayOrders.filter((o) => o.status === 'Under Review').length;
    return { total, inProd, readyDispatch, delivered, underReview };
  }, [displayOrders]);

  const getStatusBadge = (statusType: string, label: string) => {
    switch (statusType) {
      case 'in_production':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>{label}</span>
          </span>
        );
      case 'ready_dispatch':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            <span>{label}</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{label}</span>
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Discount Review</span>
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
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md self-start sm:self-auto hover:-translate-y-0.5"
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
              onClick={() => setIsInvoiceModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-muted text-foreground text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer size={15} />
              <span>Print Invoice</span>
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
        <OrdersKpiCards
          totalOrdersCount={orders.length > 0 ? orders.length : 4}
          inProductionCount={
            orders.length > 0
              ? orders.filter((o) => o.status === 'In Production' || o.status === 'Approved').length
              : 1
          }
          readyDispatchCount={
            orders.length > 0
              ? orders.filter(
                  (o) =>
                    o.status === 'Ready to Dispatch' ||
                    o.status === 'Ready QC' ||
                    o.status === 'Dispatched'
                ).length
              : 1
          }
          totalConsignmentValue={
            orders.length > 0
              ? orders.reduce((sum, o) => sum + (o.netPayable || 0), 0)
              : '₹19.56L'
          }
          onNavigateAll={() => setStatusFilter('All')}
          onNavigateProduction={() => setStatusFilter('In Production')}
          onNavigateDispatch={() => setStatusFilter('Ready to Dispatch')}
          onNavigateValue={() => setStatusFilter('All')}
        />
      )}

      {/* 4. Table / Main Panel */}
      {viewMode === 'list' ? (
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Top Filter & Segmented Tabs Bar */}
          <div className="p-4 md:p-5 bg-surface border-b border-border space-y-3.5">
            {/* Horizontal Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {[
                { id: 'All', label: 'All Consignments', count: statusCounts.total },
                { id: 'In Production', label: 'In Production', count: statusCounts.inProd },
                { id: 'Ready to Dispatch', label: 'Ready Dispatch', count: statusCounts.readyDispatch },
                { id: 'Delivered', label: 'Delivered', count: statusCounts.delivered },
                { id: 'Under Review', label: 'Discount Review', count: statusCounts.underReview },
              ].map((tab) => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer inline-flex items-center gap-2 border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70 border-border/80'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-muted text-muted-foreground border border-border/50'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input and Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by order ID (ORD-0148), customer name, city, article..."
                  className="w-full h-10 pl-10 pr-9 bg-muted/30 hover:bg-muted/50 focus:bg-surface border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                <span className="text-xs text-muted-foreground font-medium hidden sm:inline-block">
                  Showing <strong className="text-foreground">{filteredOrders.length}</strong> of {displayOrders.length} orders
                </span>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-bold uppercase text-[10px] tracking-wider bg-muted/30">
                  <th className="py-3 px-4 md:px-5">Order ID</th>
                  <th className="py-3 px-4">Customer Store</th>
                  <th className="py-3 px-4 text-center">Booked Date</th>
                  <th className="py-3 px-4">Article &amp; Line</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Factory Allocation</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Net Payable / Due</th>
                  <th className="py-3 px-4 md:px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package size={28} className="text-muted-foreground/40" />
                        <p className="font-semibold text-foreground text-sm">No wholesale orders found</p>
                        <p className="text-xs text-muted-foreground">Try adjusting your search terms or filters.</p>
                        {search && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearch('');
                              setStatusFilter('All');
                            }}
                            className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      onClick={() => handleInspect(ord)}
                      className="hover:bg-muted/40 transition-colors cursor-pointer group"
                    >
                      {/* Order ID */}
                      <td className="py-3.5 px-4 md:px-5 whitespace-nowrap">
                        <span className="font-mono font-bold text-foreground text-xs sm:text-sm bg-muted/60 px-2.5 py-1 rounded-lg border border-border/70 group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-colors">
                          {ord.id}
                        </span>
                      </td>

                      {/* Customer Store */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border shadow-2xs ${ord.initialsColor}`}>
                            {ord.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-foreground text-xs sm:text-sm leading-tight truncate max-w-[200px]" title={ord.customerStore}>
                              {ord.customerStore}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[200px]" title={ord.proprietorAndCity}>
                              {ord.proprietorAndCity}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-center text-xs text-muted-foreground whitespace-nowrap font-medium">
                        {ord.date}
                      </td>

                      {/* Articles & SKU */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-foreground text-xs leading-snug line-clamp-1" title={ord.articles}>
                          {ord.articles}
                        </span>
                      </td>

                      {/* Volume */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-foreground text-xs leading-tight">
                          {ord.volumePairs}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {ord.volumeCartons}
                        </div>
                      </td>

                      {/* Factory Plant */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground text-xs leading-tight truncate max-w-[170px]" title={ord.factoryName}>
                          {ord.factoryName}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[170px]" title={ord.factoryPlant}>
                          {ord.factoryPlant}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(ord.statusType, ord.status)}
                      </td>

                      {/* Net Payable */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-bold font-mono text-foreground text-xs sm:text-sm leading-tight">
                          {ord.netPayable}
                        </div>
                        <div className="mt-0.5">
                          {ord.balanceDueText.includes('Bal') ? (
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
                              {ord.balanceDueText}
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                              Cleared
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 md:px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleInspect(ord)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/70 dark:border-blue-900/50 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Eye size={13} />
                            <span>Inspect</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast(`Consignment ${ord.id} ready for dispatch action`)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                            title="More actions"
                          >
                            <MoreVertical size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredOrders.length > 0 && (
            <div className="p-3.5 md:px-5 border-t border-border bg-muted/15 flex items-center justify-between text-xs text-muted-foreground">
              <span>Showing {filteredOrders.length} wholesale orders</span>
              <span className="font-mono text-[11px]">SoleFlow Order Engine • Live</span>
            </div>
          )}
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

      {/* Standalone Wholesale Order Invoice Preview Modal */}
      {isInvoiceModalOpen && selectedOrder && (
        <InvoicePreviewModal
          open={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          order={selectedOrder}
          customer={(() => {
            const cust = customers.find((c) => c.id === selectedOrder.customerId);
            if (!cust) return undefined;
            return {
              customerCode: cust.id,
              gstin: cust.gstin,
              phone: cust.phone,
              address: cust.address ? `${cust.address}, ${cust.city}, ${cust.state}` : `${cust.city || 'Agra'}, Uttar Pradesh`,
            };
          })()}
        />
      )}
    </div>
  );
};
