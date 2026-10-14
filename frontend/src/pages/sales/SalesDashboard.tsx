import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useDashboardOverview, DashboardPeriod } from '../../hooks/useDashboardOverview';
import { Icons } from '../../lib/icons';
import { PaymentReceipt, Order } from '../../types';
import {
  ReceiptPreviewModal,
  mapPaymentStatusToReceiptStatus,
} from '../../components/payments/ReceiptTemplate';
import { OverviewKpiCards } from '../../components/dashboard/OverviewKpiCards';
import { QuickShortcutsGrid } from '../../components/dashboard/QuickShortcutsGrid';
import {
  Panel,
  Button,
  StatusBadge,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableAvatarCell,
  TableMoneyCell,
  EmptyState,
} from '../../components/ui';

interface SalesDashboardProps {
  onNavigate: (path: string) => void;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    customers,
    salesTeam,
    followUps,
    setIsPaymentModalOpen,
    setIsCreateOrderModalOpen,
    setIsAddCustomerModalOpen,
    setIsShareModalOpen,
    toggleSalesTask,
    completeFollowUp,
    showToast,
  } = useApp();

  const {
    period,
    setPeriod,
    needsAttention,
    kpis,
    ordersPipeline,
    collectionsData,
    customersSummary,
    designsSummary,
    followUpsAndVisits,
  } = useDashboardOverview();

  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentReceipt | null>(null);

  const formatLakh = (amount: number) => `₹${(amount / 100000).toFixed(2)}L`;
  const formatINR = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const currentRep = salesTeam.find((r) => r.id === currentUser.id || r.name.toLowerCase().includes(currentUser.name.toLowerCase())) || salesTeam[0] || {
    id: currentUser.id,
    name: currentUser.name,
    monthlyTarget: 1800000,
    bookedThisMonth: kpis.sales.value || 1620000,
    commissionAccrued: 64800,
    commissionRate: 4,
    todayVisitsDone: followUpsAndVisits.visitsCompleted || 4,
    todayVisitsTotal: followUpsAndVisits.visitsPlanned || 6,
    collectionDue: kpis.receivables.value || 340000,
    tasksChecklist: [],
  };

  const repTarget = currentRep.monthlyTarget || 1800000;
  const repBooked = kpis.sales.value || currentRep.bookedThisMonth || 0;
  const targetPct = repTarget > 0
    ? Math.min(100, Math.round((repBooked / repTarget) * 100))
    : 0;
  const repCommission = currentRep.commissionAccrued || Math.round(repBooked * ((currentRep.commissionRate || 4) / 100));
  const visitsDone = currentRep.todayVisitsDone ?? followUpsAndVisits.visitsCompleted ?? 0;
  const visitsTotal = currentRep.todayVisitsTotal || Math.max(visitsDone, 6);
  const routeDues = currentRep.collectionDue ?? kpis.receivables.value;

  const todayDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return { text: 'Good morning', icon: '👞' };
    if (hr < 17) return { text: 'Good afternoon', icon: '👟' };
    return { text: 'Good evening', icon: '👞' };
  };
  const greeting = getGreeting();

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-[1700px] w-full mx-auto pb-24 md:pb-12 bg-background text-foreground animate-in fade-in duration-150">
      {/* 1. Header & Live Territory Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border/70">
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl select-none shrink-0">{greeting.icon}</span>
            <h1 className="text-base sm:text-2xl font-bold tracking-tight text-foreground truncate">
              {greeting.text}, {currentUser.name}
            </h1>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse shrink-0" />
            <span>Field Territory Mode</span>
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
          {todayDateFormatted} • Territory Performance &amp; Client Visits
        </p>
      </div>

      {/* 2. Sales Representative Territory Quota & Incentive Card */}
      <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/70 via-surface to-indigo-50/40 dark:from-slate-900 dark:via-slate-850 dark:to-blue-950/40 p-3.5 sm:p-5 shadow-xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
          {/* Milestone 1: Monthly Target Progress */}
          <div className="space-y-2 min-w-0 pr-0 sm:pr-3">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10.5px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 truncate">
                <Icons.Target size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Monthly Quota</span>
              </span>
              <span className={`text-[9.5px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border shrink-0 ${
                targetPct >= 80
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80'
              }`}>
                {targetPct}% Achieved
              </span>
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-base sm:text-2xl font-bold tracking-tight text-foreground font-display truncate">
                  {formatLakh(repBooked)}
                </span>
                <span className="text-[11px] sm:text-xs text-muted-foreground font-semibold shrink-0">
                  / {formatLakh(repTarget)}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-blue-100 dark:bg-blue-950/80 rounded-full h-2 mt-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${targetPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Milestone 2: Accrued Commission */}
          <div className="space-y-1.5 min-w-0 pt-3 sm:pt-0 pl-0 sm:pl-4">
            <span className="text-[10.5px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 truncate">
              <Icons.TrendingUp size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Accrued Commission</span>
            </span>
            <p className="text-base sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-display truncate">
              {formatINR(repCommission)}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px] sm:text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {currentRep.commissionRate || 4}% Field Incentive Rate
              </span>
            </div>
          </div>

          {/* Milestone 3: Field Store Visits */}
          <div className="space-y-1.5 min-w-0 pt-3 sm:pt-0 pl-0 sm:pl-4">
            <span className="text-[10.5px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 truncate">
              <Icons.Visits size={13} className="text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Today's Field Visits</span>
            </span>
            <div className="flex items-baseline justify-between gap-1">
              <p className="text-base sm:text-2xl font-bold tracking-tight text-foreground font-display">
                {visitsDone} <span className="text-xs text-muted-foreground font-normal">/ {visitsTotal} Stores</span>
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/sales/visits')}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Full Route</span>
                <Icons.ChevronRight size={11} />
              </button>
            </div>
            <div className="w-full bg-purple-100 dark:bg-purple-950/80 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((visitsDone / (visitsTotal || 1)) * 100))}%` }}
              />
            </div>
          </div>

          {/* Milestone 4: Route Collections Outstanding */}
          <div className="space-y-1.5 min-w-0 pt-3 sm:pt-0 pl-0 sm:pl-4">
            <span className="text-[10.5px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 truncate">
              <Icons.Payments size={13} className="text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Territory Dues</span>
            </span>
            <div className="flex items-baseline justify-between gap-1">
              <p className="text-base sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 font-display truncate">
                {formatLakh(routeDues)}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/sales/collections')}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
              >
                <span>Ledger</span>
                <Icons.ChevronRight size={11} />
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
              Pending cheque &amp; credit clearing
            </p>
          </div>
        </div>
      </div>

      {/* 3. Field Sales Period Filter Strip & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-1 sm:pt-2 border-t border-border">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="hidden sm:inline-block text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">
            Period:
          </span>
          {/* iOS/Stitch Style 4-Segmented Control */}
          <div className="grid grid-cols-4 w-full sm:flex sm:w-auto p-1 bg-muted/80 dark:bg-muted/40 rounded-2xl border border-border/80 shadow-2xs gap-0.5">
            {(
              [
                { label: 'Today', shortLabel: 'Today', value: 'today' },
                { label: 'This Week', shortLabel: 'Week', value: 'week' },
                { label: 'This Month', shortLabel: 'Month', value: 'month' },
                { label: 'This Quarter', shortLabel: 'Quarter', value: 'quarter' },
              ] as { label: string; shortLabel: string; value: DashboardPeriod }[]
            ).map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setPeriod(tab.value)}
                className={`py-1.5 px-2 sm:px-3 text-xs font-semibold rounded-xl transition-all duration-150 cursor-pointer whitespace-nowrap text-center select-none active:scale-95 ${
                  period === tab.value
                    ? 'bg-primary text-white dark:bg-primary dark:text-white shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Action Buttons (Responsive on both desktop and mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="secondary"
            size="sm"
            icon={Icons.Visits}
            onClick={() => onNavigate('/sales/visits')}
            className="flex-1 sm:flex-initial text-[11px] sm:text-xs py-1.5 px-2.5 sm:px-3 h-8 sm:h-9"
          >
            Log Visit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Icons.Payments}
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex-1 sm:flex-initial text-[11px] sm:text-xs py-1.5 px-2.5 sm:px-3 h-8 sm:h-9"
          >
            Record Payment
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Icons.Add}
            onClick={() => setIsCreateOrderModalOpen(true)}
            className="flex-1 sm:flex-initial text-[11px] sm:text-xs py-1.5 px-2.5 sm:px-3 h-8 sm:h-9 font-semibold"
          >
            New Order
          </Button>
        </div>
      </div>

      {/* 4. Salesman Key Territory Metrics */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Icons.TrendingUp size={14} className="text-primary" />
            <span>Key Territory Metrics</span>
          </h2>
        </div>
        <OverviewKpiCards
          salesValue={formatLakh(repBooked)}
          salesGrowth={kpis.sales.comparison.changePercent || 0}
          collectionsValue={formatLakh(kpis.collections.value)}
          collectionsGrowth={kpis.collections.comparison.changePercent || 0}
          receivablesValue={formatLakh(kpis.receivables.value)}
          receivablesAccountsCount={kpis.receivables.customerCount}
          openOrdersCount={kpis.openOrders.count}
          openOrdersValue={formatLakh(kpis.openOrders.value)}
          activeStoresCount={customersSummary.active}
          totalRegisteredBuyers={customers.length}
          pairsBookedValue={kpis.pairsBooked.value}
          pairsBookedGrowth={kpis.pairsBooked.comparison.changePercent || 0}
          onNavigate={onNavigate}
          isSalesperson={true}
        />
      </div>

      {/* 5. Quick Field Operations (6-Item Shortcuts Grid) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Icons.Dashboard size={14} className="text-primary" />
            <span>Quick Field Operations</span>
          </h2>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            <span>1-Tap Actions</span>
          </span>
        </div>
        <QuickShortcutsGrid
          onBookOrder={() => setIsCreateOrderModalOpen(true)}
          onRecordPayment={() => setIsPaymentModalOpen(true)}
          onAddCustomer={() => setIsAddCustomerModalOpen(true)}
          onNewDesign={() => onNavigate('/sales/designs')}
          onShareLookbook={() => setIsShareModalOpen(true)}
          onGstLedger={() => onNavigate('/sales/collections')}
        />
      </div>

      {/* 6. Urgent Field Action Items */}
      {needsAttention && needsAttention.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <Icons.AlertCircle size={14} className="animate-pulse" />
              <span>Urgent Field Action Items ({needsAttention.length})</span>
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <span>Action Required</span>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
            {needsAttention.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate(item.route)}
                className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 select-none active:scale-[0.98] ${
                  item.badgeVariant === 'rose'
                    ? 'bg-rose-50/80 dark:bg-rose-950/40 border-l-[3.5px] border-l-rose-500 border-rose-200 dark:border-rose-900/60 hover:bg-rose-100/70 shadow-2xs'
                    : item.badgeVariant === 'amber'
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-l-[3.5px] border-l-amber-500 border-amber-200 dark:border-amber-900/60 hover:bg-amber-100/70 shadow-2xs'
                    : item.badgeVariant === 'purple'
                    ? 'bg-purple-50/80 dark:bg-purple-950/40 border-l-[3.5px] border-l-purple-500 border-purple-200 dark:border-purple-900/60 hover:bg-purple-100/70 shadow-2xs'
                    : 'bg-blue-50/80 dark:bg-blue-950/40 border-l-[3.5px] border-l-blue-500 border-blue-200 dark:border-blue-900/60 hover:bg-blue-100/70 shadow-2xs'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        item.badgeVariant === 'rose'
                          ? 'bg-rose-500 animate-ping'
                          : item.badgeVariant === 'amber'
                          ? 'bg-amber-500'
                          : item.badgeVariant === 'purple'
                          ? 'bg-purple-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <span className="text-xs font-bold text-foreground truncate">{item.title}</span>
                  </div>
                  {item.amount !== undefined && item.amount > 0 && (
                    <p className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                      Total Due: ₹{item.amount.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface/90 dark:bg-card/90 border border-border/80 shadow-2xs text-xs font-bold text-primary active:scale-95 transition-transform">
                  <span>Open</span>
                  <Icons.ChevronRight size={13} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Main 2-Column Business Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Orders Pipeline & Collections (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Widget 1: My Orders Pipeline & Latest Orders */}
          <Panel
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <Icons.Orders size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h3 title="My Orders Pipeline" className="text-lg font-bold text-foreground tracking-tight truncate">
                    My Orders Pipeline
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {ordersPipeline.totalActive} active retail bookings across production & dispatch
                  </p>
                </div>
              </div>
            }
            headerAction={
              <Button
                variant="ghost"
                size="sm"
                icon={Icons.ChevronRight}
                iconPosition="right"
                onClick={() => onNavigate('/sales/orders')}
                className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-xl px-3 py-1.5"
              >
                View all orders
              </Button>
            }
            noPadding
          >
            {/* Funnel Stage Cards */}
            <div className="p-3 sm:p-4 border-b border-border bg-muted/15">
              <div className="flex items-stretch gap-1.5 sm:gap-2 overflow-x-auto pb-1 hide-scrollbar scroll-smooth">
                {ordersPipeline.stages.map((st) => {
                  const isActive = st.count > 0;
                  return (
                    <div
                      key={st.name}
                      onClick={() => onNavigate(`/sales/orders?status=${st.key.toLowerCase()}`)}
                      className={`relative p-2 sm:p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group min-w-[95px] sm:min-w-[105px] flex-1 shrink-0 overflow-hidden ${
                        isActive
                          ? 'bg-surface border-primary/50 shadow-xs ring-1 ring-primary/20 hover:border-primary hover:shadow-sm'
                          : 'bg-surface/80 border-border/80 hover:border-border hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 min-h-[28px] min-w-0">
                        <span
                          title={st.name}
                          className={`text-[10px] font-bold uppercase tracking-wide leading-tight line-clamp-2 break-words ${
                            isActive ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {st.name}
                        </span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0 mt-0.5" />
                        )}
                      </div>
                      <div className="mt-2 pt-1 border-t border-border/40 flex items-baseline justify-between gap-1 min-w-0">
                        <span
                          className={`text-base sm:text-lg font-bold font-display tracking-tight tabular-nums shrink-0 ${
                            isActive ? 'text-foreground' : 'text-muted-foreground/80'
                          }`}
                        >
                          {st.count}
                        </span>
                        <span
                          className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground tabular-nums truncate text-right"
                          title={`₹${st.value.toLocaleString('en-IN')}`}
                        >
                          {formatLakh(st.value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Latest Orders Table */}
            {ordersPipeline.latestOrders.length === 0 ? (
              <EmptyState
                icon={Icons.Orders}
                title="No orders booked yet"
                description="Tap 'New Order' above to create a booking for a retail account."
                action={
                  <Button size="sm" icon={Icons.Add} onClick={() => setIsCreateOrderModalOpen(true)}>
                    Create Order
                  </Button>
                }
              />
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table className="min-w-[480px]">
                    <TableHeader>
                      <TableRow className="border-b border-border bg-muted/20">
                        <TableHead className="py-2.5 px-3 text-xs font-semibold">Order #</TableHead>
                        <TableHead className="py-2.5 px-3 text-xs font-semibold">Retail Store</TableHead>
                        <TableHead className="py-2.5 px-3 text-xs font-semibold">Pairs</TableHead>
                        <TableHead className="py-2.5 px-3 text-xs font-semibold">Status</TableHead>
                        <TableHead className="py-2.5 px-3 pr-4 text-xs font-semibold text-right whitespace-nowrap">Net Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersPipeline.latestOrders.map((order: Order) => (
                        <TableRow
                          key={order.id}
                          onClick={() => onNavigate(`/sales/orders?search=${order.id}`)}
                          className="cursor-pointer hover:bg-muted/40 transition-colors"
                        >
                          <TableCell className="py-2.5 px-3 font-mono font-bold text-xs text-primary whitespace-nowrap">
                            {order.id}
                          </TableCell>
                          <TableCell className="py-2.5 px-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-muted/60 border border-border flex items-center justify-center text-muted-foreground shrink-0">
                                <Icons.Store size={14} />
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-foreground text-xs block truncate max-w-[120px] sm:max-w-[140px]" title={order.customerName}>
                                  {order.customerName}
                                </span>
                                <span className="text-[11px] text-muted-foreground block truncate">{order.customerCity || '—'}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 font-mono text-xs whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                              <Icons.Designs size={12} className="text-muted-foreground" />
                              {order.pairsCount || 0} Pairs
                            </span>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 whitespace-nowrap">
                            <StatusBadge
                              variant={
                                order.status === 'Delivered'
                                  ? 'success'
                                  : order.status === 'Dispatched'
                                  ? 'info'
                                  : order.status === 'In Production' || order.status === 'Ready QC'
                                  ? 'active'
                                  : order.status === 'Approved'
                                  ? 'purple'
                                  : 'pending'
                              }
                            >
                              {order.status}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 pr-4 text-right whitespace-nowrap">
                            <TableMoneyCell
                              amount={Number(order.netPayable || order.subtotal || 0)}
                              className="text-right font-bold text-xs"
                              isBold
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card List View */}
                <div className="md:hidden divide-y divide-border">
                  {ordersPipeline.latestOrders.map((order: Order) => (
                    <div
                      key={order.id}
                      onClick={() => onNavigate(`/sales/orders?search=${order.id}`)}
                      className="p-3 hover:bg-muted/30 transition-colors cursor-pointer space-y-2 active:bg-muted/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono font-bold text-xs text-primary">{order.id}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-xs font-semibold text-foreground truncate">{order.customerName}</span>
                        </div>
                        <StatusBadge
                          variant={
                            order.status === 'Delivered'
                              ? 'success'
                              : order.status === 'Dispatched'
                              ? 'info'
                              : order.status === 'In Production' || order.status === 'Ready QC'
                              ? 'active'
                              : order.status === 'Approved'
                              ? 'purple'
                              : 'pending'
                          }
                        >
                          {order.status}
                        </StatusBadge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                        <span className="inline-flex items-center gap-1">
                          <Icons.Designs size={12} className="text-muted-foreground" />
                          <span className="font-medium">{order.pairsCount || 0} Pairs</span>
                          <span className="text-muted-foreground/70">({order.customerCity || '—'})</span>
                        </span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-foreground text-xs">
                            ₹{Number(order.netPayable || order.subtotal || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Panel>

          {/* Widget 2: My Collections & Pending Cheques */}
          <Panel
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Icons.Payments size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h3 title="Collections & Aging Balances" className="text-lg font-bold text-foreground tracking-tight truncate">
                    Collections & Aging Balances
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    Inflow: {formatLakh(collectionsData.collectedThisPeriod)} • Cheques in clearing: {formatLakh(collectionsData.chequesInTransit)}
                  </p>
                </div>
              </div>
            }
            headerAction={
              <Button
                variant="ghost"
                size="sm"
                icon={Icons.ChevronRight}
                iconPosition="right"
                onClick={() => onNavigate('/sales/collections')}
                className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-xl px-3 py-1.5"
              >
                View ledger
              </Button>
            }
            noPadding
          >
            {/* Aging Buckets Bar */}
            <div className="p-4 border-b border-border bg-muted/15">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {collectionsData.agingBuckets.map((b) => {
                  const isCritical = b.range === '90+' && b.amount > 0;
                  const isOverdue = b.range === '61-90' && b.amount > 0;
                  const isAmber = b.range === '31-60' && b.amount > 0;
                  return (
                    <div
                      key={b.label}
                      onClick={() => onNavigate(`/sales/collections?range=${b.range}`)}
                      className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between text-left ${
                        isCritical
                          ? 'bg-rose-50/70 border-rose-300 dark:bg-rose-950/40 dark:border-rose-900/60 shadow-xs'
                          : isOverdue
                          ? 'bg-orange-50/70 border-orange-300 dark:bg-orange-950/40 dark:border-orange-900/60'
                          : isAmber
                          ? 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/40 dark:border-amber-900/60'
                          : 'bg-surface/90 border-border/90 hover:border-border hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-semibold text-muted-foreground tracking-tight block truncate">
                          {b.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          ({b.count})
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className={`text-base sm:text-lg font-bold font-display tracking-tight tabular-nums block ${isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
                          {formatLakh(b.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Payments Received */}
            {collectionsData.latestPayments.length === 0 ? (
              <EmptyState
                icon={Icons.Payments}
                title="No payments recorded"
                description="Recorded payments and cheque deposits will appear here."
                action={
                  <Button size="sm" icon={Icons.Payments} onClick={() => setIsPaymentModalOpen(true)}>
                    Record Payment
                  </Button>
                }
              />
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Receipt #</TableHead>
                        <TableHead>Retail Store</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collectionsData.latestPayments.map((pmt: PaymentReceipt) => (
                        <TableRow key={pmt.id} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="font-mono font-bold text-xs text-primary">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span>{pmt.receiptNumber || `SF-REC-${pmt.id.slice(-5)}`}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-muted/60 border border-border flex items-center justify-center text-muted-foreground shrink-0">
                                <Icons.Store size={14} />
                              </div>
                              <div>
                                <span className="font-semibold text-foreground text-xs block truncate max-w-[150px]">
                                  {pmt.customerName}
                                </span>
                                <span className="text-[11px] text-muted-foreground">{pmt.customerCity || '—'}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-muted/80 text-foreground border border-border">
                              {pmt.paymentMethod}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <TableMoneyCell
                              amount={Number(pmt.paymentAmount || 0)}
                              className="text-right font-bold text-emerald-600 dark:text-emerald-400 text-xs"
                              isBold
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReceiptPayment(pmt);
                              }}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer inline-flex items-center justify-center"
                              title="View & Print Official Receipt"
                            >
                              <Icons.FileText size={16} />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card List View */}
                <div className="md:hidden divide-y divide-border">
                  {collectionsData.latestPayments.map((pmt: PaymentReceipt) => (
                    <div
                      key={pmt.id}
                      className="p-3 hover:bg-muted/30 transition-colors flex items-center justify-between gap-2.5 active:bg-muted/40"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="font-mono font-bold text-xs text-primary truncate">
                            {pmt.receiptNumber || `SF-REC-${pmt.id.slice(-5)}`}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-muted text-foreground border border-border shrink-0">
                            {pmt.paymentMethod}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 truncate">
                          <span className="font-semibold text-foreground truncate">{pmt.customerName}</span>
                          <span>•</span>
                          <span className="text-[11px] font-mono">{pmt.paymentDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 block">
                            ₹{Number(pmt.paymentAmount || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReceiptPayment(pmt);
                          }}
                          className="w-8 h-8 rounded-lg bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center border border-border cursor-pointer active:scale-95"
                          title="View Receipt"
                        >
                          <Icons.FileText size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Panel>

          {/* Widget 3: Re-Order Opportunities (Inactive / Cleared Clients) */}
          <Panel
            title="Re-Order Opportunities"
            subtitle="Store accounts with zero balance or ready for seasonal restock"
            headerAction={
              <Button
                variant="ghost"
                size="sm"
                icon={Icons.ChevronRight}
                iconPosition="right"
                onClick={() => onNavigate('/sales/customers')}
              >
                View all
              </Button>
            }
          >
            {customersSummary.reorderOpportunities.length === 0 ? (
              <EmptyState
                icon={Icons.Clients}
                title="No re-order opportunities"
                description="Retail accounts with cleared balances will appear here for seasonal restock."
              />
            ) : (
              <div className="space-y-3">
                {customersSummary.reorderOpportunities.map((cust) => (
                  <div
                    key={cust.id}
                    className="p-3.5 rounded-xl border border-border bg-card hover:border-zinc-400 dark:hover:border-zinc-500 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{cust.businessName || cust.propName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {cust.city || cust.address} • {cust.ordersCount || 0} lifetime orders • {formatLakh(Number(cust.totalBusiness || 0))} business
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {cust.phone && (
                        <a
                          href={`tel:${cust.phone}`}
                          className="p-2 rounded-lg bg-muted text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                          title={`Call ${cust.phone}`}
                        >
                          <Icons.Phone size={14} />
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Icons.Add}
                        onClick={() => setIsCreateOrderModalOpen(true)}
                      >
                        Book Order
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* RIGHT COLUMN: Field Route Stops, Follow-ups, Top Designs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Widget 4: Today's Route Stops & Store Checklist */}
          <Panel
            title="Today's Field Route Stops"
            subtitle="Mark visits done as you complete store calls"
            headerAction={
              <Button
                variant="ghost"
                size="sm"
                icon={Icons.ChevronRight}
                iconPosition="right"
                onClick={() => onNavigate('/sales/visits')}
              >
                Full Route
              </Button>
            }
          >
            <div className="space-y-2.5">
              {(currentRep.tasksChecklist || []).length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 text-center space-y-2">
                  <p className="text-xs text-muted-foreground">No route stops scheduled today</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Icons.Visits}
                    onClick={() => onNavigate('/sales/visits')}
                  >
                    Schedule Route Visit
                  </Button>
                </div>
              ) : (
                (currentRep.tasksChecklist || []).map((task: any) => (
                  <div
                    key={task.id}
                    onClick={() => toggleSalesTask(currentRep.id, task.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      task.completed
                        ? 'bg-muted/40 border-border opacity-60'
                        : 'bg-card border-border hover:border-zinc-400 dark:hover:border-zinc-500'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                          task.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-border'
                        }`}
                      >
                        {task.completed && <Icons.Check size={14} strokeWidth={2.5} />}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${
                            task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {task.title || task.task}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {task.description || (task.time ? `${task.time} • Priority Store Stop` : 'Scheduled Visit')}
                        </p>
                        {task.badge && (
                          <span className="inline-block mt-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                            {task.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    <StatusBadge variant={task.completed ? 'success' : 'pending'}>
                      {task.completed ? 'Done' : 'Pending'}
                    </StatusBadge>
                  </div>
                ))
              )}

              <Button
                variant="secondary"
                size="sm"
                icon={Icons.Visits}
                className="w-full mt-2"
                onClick={() => onNavigate('/sales/visits')}
              >
                Log New Store Visit
              </Button>
            </div>
          </Panel>

          {/* Widget 5: Follow-ups & Reminders */}
          <Panel
            title="Scheduled Follow-ups"
            subtitle="Client callbacks & sample reviews"
            headerAction={
              <Button
                variant="ghost"
                size="sm"
                icon={Icons.ChevronRight}
                iconPosition="right"
                onClick={() => onNavigate('/sales/follow-ups')}
              >
                All ({followUps.length})
              </Button>
            }
          >
            {followUps.length === 0 ? (
              <EmptyState
                icon={Icons.FollowUps}
                title="All follow-ups complete"
                description="Client callbacks and sample reviews will appear here."
              />
            ) : (
              <div className="space-y-3">
                {followUps.slice(0, 4).map((f) => (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-xl border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground truncate">
                        {f.customerName}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {f.date}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {f.notes}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-mono font-medium text-muted-foreground">
                        {f.phone}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {f.phone && (
                          <a
                            href={`tel:${f.phone}`}
                            className="p-1.5 rounded-lg bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground transition-all"
                          >
                            <Icons.Phone size={13} />
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Icons.Check}
                          onClick={async () => {
                            if (await completeFollowUp(f.id)) showToast(`Follow-up with ${f.customerName} marked complete!`);
                          }}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Widget 6: Fast Moving Designs / Best Sellers (Redesigned Modern Showcase) */}
          <Panel
            title={
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <Icons.Catalogue size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 title="Trending & Best Selling Designs" className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
                      Trending & Best Selling Designs
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      ★ Hot Sellers
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                    Top articles to showcase and pitch during retailer visits
                  </p>
                </div>
              </div>
            }
            headerAction={
              <Button
                variant="ghost"
                size="sm"
                icon={Icons.ChevronRight}
                iconPosition="right"
                onClick={() => onNavigate('/sales/catalogue')}
                className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-xl px-2.5 sm:px-3 py-1.5"
              >
                Catalogue
              </Button>
            }
            noPadding
          >
            <div className="p-3 sm:p-4">
              {designsSummary.topDesigns.length === 0 ? (
                <EmptyState
                  icon={Icons.Catalogue}
                  title="No footwear designs available"
                  description="Articles added to the wholesale catalogue will appear here."
                />
              ) : (
                <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-2 gap-3 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar snap-x">
                  {designsSummary.topDesigns.slice(0, 4).map((d, idx) => {
                    const rankColor =
                      idx === 0
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                        : idx === 1
                        ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
                        : idx === 2
                        ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
                    const rankLabel =
                      idx === 0
                        ? '#1 Bestseller'
                        : idx === 1
                        ? '#2 Trending'
                        : idx === 2
                        ? '#3 Popular'
                        : '#4 Fast Moving';

                    return (
                      <div
                        key={d.id}
                        className="min-w-[210px] sm:min-w-0 flex-1 shrink-0 snap-start bg-surface dark:bg-card/90 rounded-2xl border border-border/80 shadow-2xs hover:shadow-xs p-3 flex flex-col justify-between transition-all duration-150 active:scale-[0.98] select-none group"
                      >
                        <div>
                          {/* Top Rank Badge & Price */}
                          <div className="flex items-center justify-between gap-1.5">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${rankColor}`}>
                              {rankLabel}
                            </span>
                            <span className="font-mono text-xs font-bold text-foreground">
                              ₹{(d.price || 0).toLocaleString('en-IN')}<span className="text-[10px] text-muted-foreground font-normal">/pr</span>
                            </span>
                          </div>

                          {/* Shoe Image */}
                          <div
                            onClick={() => onNavigate('/sales/catalogue')}
                            className="h-24 sm:h-28 w-full bg-muted/50 rounded-xl overflow-hidden border border-border/50 my-2.5 relative flex items-center justify-center cursor-pointer"
                          >
                            {d.image ? (
                              <img
                                src={d.image}
                                alt={d.name || d.articleCode}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <Icons.Catalogue size={28} className="text-muted-foreground opacity-40" />
                            )}
                            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[9px] font-mono font-semibold text-white">
                              {d.articleCode}
                            </span>
                          </div>

                          {/* Footwear Details */}
                          <h5
                            onClick={() => onNavigate('/sales/catalogue')}
                            className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors cursor-pointer"
                            title={d.name || d.articleCode}
                          >
                            {d.name || d.articleCode}
                          </h5>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {d.category}
                          </p>
                        </div>

                        {/* Footer Actions: Booked Volume & Share Button */}
                        <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 truncate">
                            <Icons.TrendingUp size={11} className="shrink-0" />
                            <span>{Number(d.orderedPairs || 0).toLocaleString('en-IN')} prs</span>
                          </span>
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={Icons.Share}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsShareModalOpen(true);
                            }}
                            className="text-[11px] h-7 px-2.5 rounded-lg shrink-0"
                          >
                            Share
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      {/* 5. Receipt Preview Modal */}
      {selectedReceiptPayment && (
        <ReceiptPreviewModal
          open={Boolean(selectedReceiptPayment)}
          onClose={() => setSelectedReceiptPayment(null)}
          receipt={selectedReceiptPayment}
          customer={{
            customerCode: selectedReceiptPayment.customerId,
            phone: '',
            address: '',
          }}
          status={mapPaymentStatusToReceiptStatus(selectedReceiptPayment.status)}
        />
      )}
    </div>
  );
};
