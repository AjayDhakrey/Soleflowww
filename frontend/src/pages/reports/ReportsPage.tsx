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
} from 'lucide-react';
import { discountRequestsService } from '../../services/discountRequests';
import { DiscountRequest, DiscountRequestStats } from '../../types';
import { DiscountRequestDrawer } from '../../components/discounts/DiscountRequestDrawer';
import { RequestDiscountModal } from '../../components/discounts/RequestDiscountModal';
import { supabase } from '../../lib/supabase';

export const ReportsPage: React.FC = () => {
  const { customers, orders, currentUser, showToast } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  const [requests, setRequests] = useState<DiscountRequest[]>([]);
  const [stats, setStats] = useState<DiscountRequestStats>({
    pendingCount: 1,
    pendingConcessionTotal: 28400,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    totalRequests: 1,
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
    if (supabase) {
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

  const totalDiscountGiven = useMemo(() => {
    return orders.reduce((sum, o) => sum + Number(o.tradeDiscountAmount || 0), 0);
  }, [orders]);

  const totalSubtotal = useMemo(() => {
    return orders.reduce((sum, o) => sum + Number(o.subtotal || 0), 0);
  }, [orders]);

  const avgMarginPercent = useMemo(() => {
    if (totalSubtotal <= 0) return 22.5;
    return Math.max(15, Number((((totalSubtotal - totalDiscountGiven) / totalSubtotal) * 24.8).toFixed(1)));
  }, [totalSubtotal, totalDiscountGiven]);

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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-12 bg-background text-foreground animate-in fade-in duration-150">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Reports & Analytics' }]}
        title="Reports, Margins & Trade Alerts"
        subtitle="Executive analytics, wholesale turnover breakdowns, margin overrides, and factory punctuality."
        actions={
          <Button
            variant="secondary"
            icon={Icons.Export}
            onClick={handleExportLedger}
          >
            Export Ledger CSV
          </Button>
        }
      />

      {/* 2. KPI Summary Row */}
      <ReportsKpiCards
        totalRevenue={`₹${(totalRevenue / 100000).toFixed(2)}L`}
        revenueCaption={`Across ${orders.length} booked wholesale orders`}
        avgMargin={`${avgMarginPercent}%`}
        marginCaption="Healthy distributor spread"
        activeOutlets={`${customers.length} Stores`}
        outletsCaption="Consistent repeat billing"
        pendingRequests={`${pendingCount} Pending`}
        requestsCaption={pendingCount > 0 ? 'Awaiting trader sign-off' : 'All caught up'}
        onRequestsClick={scrollToPanel}
      />

      {/* 3. Margin Approvals Queue Panel */}
      <div ref={panelRef}>
        <Panel
          title="Pending Volume Margin Authorizations"
          subtitle="Special wholesale pricing override requests submitted by field representatives"
          headerAction={
            <div className="flex items-center gap-2">
              <Tag variant={pendingCount > 0 ? 'purple' : 'slate'}>
                {pendingCount} Pending Authorization{pendingCount === 1 ? '' : 's'}
              </Tag>
              <Button
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => setIsNewRequestModalOpen(true)}
              >
                New Request
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Tabs for Pending / Approved / Rejected */}
            <div className="flex items-center gap-2 border-b border-border pb-3 text-xs font-semibold">
              <button
                onClick={() => setSelectedTab('pending')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTab === 'pending'
                    ? 'bg-primary text-white shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span>Pending</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-mono font-bold">
                  {pendingCount}
                </span>
              </button>

              <button
                onClick={() => setSelectedTab('approved')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTab === 'approved'
                    ? 'bg-primary text-white shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span>Approved</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-mono font-bold">
                  {approvedCount}
                </span>
              </button>

              <button
                onClick={() => setSelectedTab('rejected')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTab === 'rejected'
                    ? 'bg-primary text-white shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span>Rejected</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-mono font-bold">
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
              <div className="p-8 text-center bg-muted/20 rounded-xl border border-border space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
                <p className="text-sm font-semibold text-foreground">
                  No {selectedTab} authorizations.
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedTab === 'pending'
                    ? 'All special volume margin requests are currently processed and clear.'
                    : `No discount requests in ${selectedTab} state.`}
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
                      className="p-4 bg-muted/30 hover:bg-muted/60 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-150 cursor-pointer group shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
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

                        <p className="text-xs text-muted-foreground">
                          {req.productSummary} • Requested {req.requestedPercent}% bulk discount instead of default {req.defaultPercent}%.
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Impact: ₹{req.marginConcession.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} margin concession
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
                            ' • Profitability remains healthy at 21.4%'
                          )}
                          .
                        </p>

                        <p className="text-[11px] text-muted-foreground/80 pt-0.5">
                          Requested by <strong>{req.salesmanName}</strong> • {new Date(req.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>

                      {req.status === 'pending' && isAdmin && (
                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => handleQuickReject(req, e)}
                          >
                            Reject
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Icons.Approved}
                            onClick={(e) => handleQuickApprove(req, e)}
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
          <div className="space-y-4 pt-1 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="font-semibold text-foreground">Athletic Sneakers (Phylon &amp; EVA)</span>
                <span className="font-mono font-bold text-foreground">₹14.2L (57%)</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '57%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="font-semibold text-foreground">Formal Derby &amp; Crust Oxford</span>
                <span className="font-mono font-bold text-foreground">₹6.4L (26%)</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 dark:bg-purple-400 rounded-full" style={{ width: '26%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="font-semibold text-foreground">Leather Boots &amp; Chelsea</span>
                <span className="font-mono font-bold text-foreground">₹4.2L (17%)</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '17%' }} />
              </div>
            </div>
          </div>
        </Panel>

        {/* Manufacturing Punctuality */}
        <Panel
          title="Agra &amp; Kanpur Hub Dispatch Punctuality"
          subtitle="Contractor batch commitments vs actual warehouse receipt"
        >
          <div className="space-y-3 pt-1 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
              <div>
                <span className="font-bold text-foreground block">Apex Footwear Works</span>
                <span className="text-muted-foreground text-[11px]">Agra Hub • 5 Batches</span>
              </div>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                96.4% On-Time
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
              <div>
                <span className="font-bold text-foreground block">Metro Leather Crafts</span>
                <span className="text-muted-foreground text-[11px]">Kanpur Industrial Zone • 4 Batches</span>
              </div>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                94.1% On-Time
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
              <div>
                <span className="font-bold text-foreground block">Taj Heritage Craft</span>
                <span className="text-muted-foreground text-[11px]">Agra Unit 1 • 3 Batches</span>
              </div>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                92.8% On-Time
              </span>
            </div>
          </div>
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
