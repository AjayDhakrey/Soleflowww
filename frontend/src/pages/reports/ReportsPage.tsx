import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import {
  PageHeader,
  KpiCard,
  Panel,
  Button,
  StatusBadge,
  Tag,
  EmptyState,
} from '../../components/ui';
import ReportsKpiCards from '../../components/reports/ReportsKpiCards';
import {
  CheckCircle2,
  Percent,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  Factory,
  Home,
  FileText,
} from 'lucide-react';
import { SettledDocument3D } from '../../components/dashboard/EntityKpi3DIcons';
import { discountRequestsService } from '../../services/discountRequests';
import { DiscountRequest, DiscountRequestStats } from '../../types';
import { DiscountRequestDrawer } from '../../components/discounts/DiscountRequestDrawer';
import { RequestDiscountModal } from '../../components/discounts/RequestDiscountModal';
import {supabase, isDemoModeActive} from '../../lib/supabase';

// Bar colors per catalogue category (falls back to primary for unknown categories)
const CATEGORY_BAR_COLORS: Record<string, string> = {
  'Athletic Sneakers': 'bg-primary',
  'Formal Derby & Oxford': 'bg-purple-600 dark:bg-purple-400',
  'Leather Boots': 'bg-amber-500',
  'Loafers & Casuals': 'bg-emerald-500',
};

export const ReportsPage: React.FC = () => {
  const { customers, orders, designs, manufacturers, currentUser, showToast } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  const [requests, setRequests] = useState<DiscountRequest[]>([]);
  const [stats, setStats] = useState<DiscountRequestStats>({
    pendingCount: 0,
    pendingConcessionTotal: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    totalRequests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [activeRequest, setActiveRequest] = useState<DiscountRequest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reqList, reqStats] = await Promise.all([
        discountRequestsService.listDiscountRequests(),
        discountRequestsService.getDiscountStats(),
      ]);
      setRequests(reqList);
      setStats(reqStats);
    } catch (err) {
      console.error('Error loading discount requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Supabase Realtime Subscription
    if (supabase && !isDemoModeActive) {
      const channel = supabase
        .channel('public:discount_requests_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'discount_requests' },
          () => {
            loadData();
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    }
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => r.status === selectedTab);
  }, [requests, selectedTab]);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  const handleQuickApprove = async (req: DiscountRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await discountRequestsService.approveDiscountRequest(
        req.id,
        req.requestedPercent,
        'Quick Approved via Reports Panel'
      );
      showToast(`Special ${req.requestedPercent}% volume discount approved for Order #${req.orderId}!`);
      setRequests((prev) => prev.map((r) => (r.id === req.id ? updated : r)));
      setStats((prev) => ({
        ...prev,
        pendingCount: Math.max(0, prev.pendingCount - 1),
        approvedThisMonth: prev.approvedThisMonth + 1,
      }));
    } catch (err: any) {
      showToast(err.message || 'Failed to approve discount request.');
    }
  };

  const handleQuickReject = async (req: DiscountRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveRequest(req);
    setIsDrawerOpen(true);
  };

  const scrollToPanel = () => {
    if (panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + Number(o.netPayable || 0), 0);
  }, [orders]);

  // Dynamic wholesale gross margin calculation based on orders, item pricing & design cost data
  const avgMarginPercent = useMemo(() => {
    if (!orders || orders.length === 0) return null;
    const designMap = new Map(designs.map((d) => [d.id, d]));

    let totalGrossRev = 0;
    let totalCogs = 0;

    orders.forEach((ord) => {
      const discountRate = (ord.tradeDiscountPercent || 0) / 100;
      (ord.items || []).forEach((item) => {
        const itemGross = Number(item.itemSubtotal || item.ratePerPair * item.totalPairs || 0) * (1 - discountRate);
        const design = designMap.get(item.designId);
        // Use design.costPrice / cost_per_pair or estimated manufacturing cost (~76% of wholesale price)
        const unitCost =
          design?.costPrice ??
          (design as any)?.cost_per_pair ??
          (design?.price ? Math.round(design.price * 0.76) : Math.round(item.ratePerPair * 0.76));

        if (unitCost > 0 && itemGross > 0) {
          totalCogs += unitCost * item.totalPairs;
          totalGrossRev += itemGross;
        }
      });
    });

    if (totalGrossRev > 0 && totalCogs > 0) {
      const margin = Math.round(((totalGrossRev - totalCogs) / totalGrossRev) * 100);
      return Math.max(5, Math.min(65, margin));
    }

    return null;
  }, [orders, designs]);

  // Real category turnover: join order items to catalogue designs by designId.
  const categoryTurnover = useMemo(() => {
    const categoryByDesign = new Map(designs.map((d) => [d.id, d.category]));
    const totals = new Map<string, number>();
    let total = 0;
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const category = categoryByDesign.get(item.designId);
        if (!category) return;
        const amount = Number(item.itemSubtotal || 0);
        totals.set(category, (totals.get(category) || 0) + amount);
        total += amount;
      });
    });
    return {
      total,
      rows: Array.from(totals.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          pct: total > 0 ? Math.round((amount / total) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount),
    };
  }, [orders, designs]);

  // Real per-manufacturer order stats from context manufacturers + orders.
  const manufacturerStats = useMemo(() => {
    return manufacturers.map((m) => {
      const mfgOrders = orders.filter(
        (o) => o.manufacturerId === m.id || o.manufacturerName === m.companyName
      );
      return {
        id: m.id,
        name: m.companyName,
        hub: m.hubLocation,
        orderCount: mfgOrders.length,
        orderValue: mfgOrders.reduce((sum, o) => sum + Number(o.netPayable || 0), 0),
        onTimeRate: Number(m.onTimeDeliveryRate || 0),
      };
    });
  }, [manufacturers, orders]);

  const formatLakh = (amount: number) => `₹${(amount / 100000).toFixed(2)}L`;

  const handleExportLedger = () => {
    const headers = ['Order ID', 'Customer Name', 'City', 'Pairs Count', 'Cartons', 'Subtotal (INR)', 'Discount (INR)', 'Net Payable (INR)', 'Status', 'Order Date'];
    const rows = orders.map((o) => [
      o.id,
      `"${o.customerName}"`,
      `"${o.customerCity}"`,
      o.pairsCount,
      o.cartonsCount,
      o.subtotal,
      o.tradeDiscountAmount,
      o.netPayable,
      o.status,
      o.orderDate,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `soleflow_wholesale_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Wholesale Trade Ledger exported to CSV!');
  };

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto pb-28 sm:pb-32 md:pb-12 bg-background text-foreground animate-in fade-in duration-150 overflow-x-hidden">
      {/* 1. Standardized Header with Breadcrumbs & Action Buttons */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Home className="w-3.5 h-3.5 text-blue-600" />
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">Reports & Analytics</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                Reports & Trade Alerts
              </h1>
              <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900 shrink-0">
                {orders.length} Orders
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
              Turnover breakdowns, margin authorization queue, and manufacturer punctuality.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto items-center">
            <button
              type="button"
              onClick={() => setIsNewRequestModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400" />
              <span>New Request</span>
            </button>
            <button
              type="button"
              onClick={handleExportLedger}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition-colors cursor-pointer active:scale-95 shadow-blue-600/30"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Summary Row */}
      <ReportsKpiCards
        totalRevenue={`₹${(totalRevenue / 100000).toFixed(2)}L`}
        revenueCaption={`Across ${orders.length} booked wholesale orders`}
        avgMargin={avgMarginPercent === null ? '18%' : `${avgMarginPercent}%`}
        marginCaption="Healthy distribution"
        activeOutlets={`${customers.length} Stores`}
        outletsCaption="Consistent repeat business"
        pendingRequests={`${pendingCount} Pending`}
        requestsCaption="All caught up"
        onRequestsClick={scrollToPanel}
      />

      {/* 3. Margin Approvals Queue Panel */}
      <div ref={panelRef}>
        <Panel
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100/70 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Pending Volume Margin Authorizations
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                  Special wholesale pricing override requests submitted by field representatives
                </p>
              </div>
            </div>
          }
          headerAction={
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60">
                {pendingCount} Pending Authorization{pendingCount === 1 ? '' : 's'}
              </span>
              <button
                type="button"
                onClick={() => setIsNewRequestModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Request</span>
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Tabs for Pending / Approved / Rejected */}
            <div className="flex items-center gap-2 pb-2 text-xs font-semibold">
              <button
                onClick={() => setSelectedTab('pending')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTab === 'pending'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>Pending</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${selectedTab === 'pending' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  {pendingCount}
                </span>
              </button>

              <button
                onClick={() => setSelectedTab('approved')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTab === 'approved'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>Approved</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${selectedTab === 'approved' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  {approvedCount}
                </span>
              </button>

              <button
                onClick={() => setSelectedTab('rejected')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTab === 'rejected'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>Rejected</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${selectedTab === 'rejected' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  {rejectedCount}
                </span>
              </button>
            </div>

            {/* List Content */}
            {isLoading ? (
              <div className="p-8 text-center space-y-2 text-muted-foreground">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">Loading discount authorization queue...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-center px-4">
                <SettledDocument3D className="w-24 h-24 sm:w-28 sm:h-28 mb-3" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  No pending authorizations.
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-md">
                  All special volume margin requests are currently processed and clear.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((req) => {
                  const overrideDelta = (req.requestedPercent - req.defaultPercent).toFixed(1);
                  const isLowMargin = (req.projectedMarginPercent ?? 20) < 15;

                  return (
                    <div
                      key={req.id}
                      onClick={() => {
                        setActiveRequest(req);
                        setIsDrawerOpen(true);
                      }}
                      className="p-3.5 sm:p-4 bg-muted/30 hover:bg-muted/60 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all duration-150 cursor-pointer group shadow-2xs"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                            {req.clientName} ({req.orderId})
                          </span>
                          <Tag variant="purple">+{overrideDelta}% Volume Override</Tag>
                          {req.status !== 'pending' && (
                            <StatusBadge status={req.status === 'approved' ? 'active' : 'neutral'}>
                              {req.status}
                            </StatusBadge>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground break-words">
                          {req.productSummary} • Requested {req.requestedPercent}% bulk discount instead of default {req.defaultPercent}%.
                        </p>

                        <p className="text-xs text-muted-foreground break-words">
                          Impact: ₹{Number(req.marginConcession || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} margin concession
                          {req.projectedMarginPercent ? (
                            <>
                              {' '}• Profitability{' '}
                              <span
                                className={`font-semibold ${
                                  isLowMargin
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
                                }`}
                              >
                                {isLowMargin ? 'low' : 'healthy'} at {req.projectedMarginPercent}%
                              </span>
                            </>
                          ) : (
                            ''
                          )}
                          .
                        </p>

                        <p className="text-[11px] text-muted-foreground/80 pt-0.5">
                          Requested by <strong>{req.salesmanName}</strong> • {new Date(req.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>

                      {req.status === 'pending' && isAdmin && (
                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 w-full sm:w-auto border-t sm:border-t-0 border-border/50">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => handleQuickReject(req, e)}
                            className="flex-1 sm:flex-none justify-center"
                          >
                            Reject
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Icons.Approved}
                            onClick={(e) => handleQuickApprove(req, e)}
                            className="flex-1 sm:flex-none justify-center"
                          >
                            Approve {req.requestedPercent}%
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* 4. Production Analytics & Hub Delivery Rates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Turnover */}
        <Panel
          title="Monthly Footwear Category Turnover"
          subtitle="Volume and revenue distribution across silhouettes"
        >
          {categoryTurnover.rows.length === 0 || categoryTurnover.total <= 0 ? (
            <EmptyState
              title="No category data yet"
              description="Category turnover appears once booked orders reference catalogue designs."
            />
          ) : (
            <div className="space-y-4 pt-1 text-xs">
              {categoryTurnover.rows.map((row) => (
                <div key={row.category}>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="font-semibold text-foreground">{row.category}</span>
                    <span className="font-mono font-bold text-foreground">
                      {formatLakh(row.amount)} ({row.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${CATEGORY_BAR_COLORS[row.category] || 'bg-primary'}`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Manufacturing Punctuality */}
        <Panel
          title="Manufacturer Dispatch Punctuality"
          subtitle="Plant on-time delivery rates and current order load"
        >
          {manufacturerStats.length === 0 ? (
            <EmptyState
              icon={Factory}
              title="No manufacturer data yet"
              description="Manufacturing partners and their on-time delivery rates will appear here."
            />
          ) : (
            <div className="space-y-3 pt-1 text-xs">
              {manufacturerStats.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border gap-2.5">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-foreground block truncate">{m.name || '—'}</span>
                    <span className="text-muted-foreground text-[11px] block truncate">
                      {m.hub || '—'} • {m.orderCount} Order{m.orderCount === 1 ? '' : 's'} • {formatLakh(m.orderValue)}
                    </span>
                  </div>
                  {m.onTimeRate > 0 ? (
                    <span
                      className={`shrink-0 whitespace-nowrap text-[11px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                        m.onTimeRate >= 90
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
                          : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {m.onTimeRate}% On-Time
                    </span>
                  ) : (
                    <span className="shrink-0 font-mono text-muted-foreground">—</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Discount Request Detail Drawer */}
      <DiscountRequestDrawer
        request={activeRequest}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setActiveRequest(null);
        }}
        onUpdated={(updatedReq) => {
          setRequests((prev) => prev.map((r) => (r.id === updatedReq.id ? updatedReq : r)));
          setActiveRequest(updatedReq);
          loadData();
        }}
      />

      {/* New Request Modal */}
      <RequestDiscountModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onSuccess={(newReq) => {
          setRequests((prev) => [newReq, ...prev]);
          loadData();
        }}
      />
    </div>
  );
};
