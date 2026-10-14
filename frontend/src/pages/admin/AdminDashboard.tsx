import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useDashboardOverview, DashboardPeriod } from '../../hooks/useDashboardOverview';
import { Icons } from '../../lib/icons';
import { PaymentReceipt } from '../../types';
import {
  ReceiptPreviewModal,
  mapPaymentStatusToReceiptStatus,
} from '../../components/payments/ReceiptTemplate';
import { OverviewKpiCards } from '../../components/dashboard/OverviewKpiCards';
import { QuickShortcutsGrid } from '../../components/dashboard/QuickShortcutsGrid';
import heroShoeImg from '../../assets/images/hero-3d-sneaker-crisp.png';
import veronaOxfordImg from '../../assets/images/verona-crust-oxford.jpg';
import runnerClassicImg from '../../assets/images/runner-classic-red.jpg';
import aeroglideKnitImg from '../../assets/images/aeroglide-knit-sport.jpg';
import {
  Panel,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableAvatarCell,
  TableMoneyCell,
} from '../../components/ui';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    customers,
    setIsPaymentModalOpen,
    setIsCreateOrderModalOpen,
    setIsAddCustomerModalOpen,
    setIsShareModalOpen,
  } = useApp();

  const {
    period,
    setPeriod,
    needsAttention,
    kpis,
    collectionsData,
    customersSummary,
    approvalsSummary,
    actions,
  } = useDashboardOverview();

  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentReceipt | null>(null);

  const formatLakh = (amount: number) => `₹${(amount / 100000).toFixed(2)}L`;

  const todayDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return { text: 'Good morning', icon: '☀️' };
    if (hr < 17) return { text: 'Good afternoon', icon: '🌤️' };
    return { text: 'Good evening', icon: '🌙' };
  };
  const greeting = getGreeting();

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 max-w-[1440px] w-full mx-auto pb-28 md:pb-12 bg-background text-foreground overflow-x-hidden animate-in fade-in duration-200">
      {/* 1. Welcome Banner (Compact, Sleek & High-Density for Mobile & Desktop) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-blue-50/60 to-blue-100/40 dark:from-card dark:via-blue-950/20 dark:to-card border border-blue-100/80 dark:border-blue-900/40 p-3 sm:p-4 shadow-2xs">
        {/* Subtle Ambient Glow */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          {/* Left: Greeting & Compact Subtitle */}
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground">
                {greeting.text},
              </span>
              <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-1">
                <span>{currentUser.name}</span>
                <span className="inline-block text-sm">👋</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground font-medium flex-wrap">
              <span className="flex items-center gap-1 text-primary/80 shrink-0">
                <Icons.Calendar size={12} className="shrink-0" />
                <span>{todayDateFormatted}</span>
              </span>
              <span className="text-muted-foreground/40 hidden xs:inline">•</span>
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold shrink-0">
                <Icons.Building size={12} className="shrink-0" />
                <span>Wholesale Operations</span>
              </span>
            </div>
          </div>

          {/* Right: Compact 3D Sneaker Asset with Integrated Growth Chip */}
          <div className="relative shrink-0 flex items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Icons.TrendingUp size={11} className="shrink-0" />
                <span>+100% Sales</span>
              </span>
              <span className="text-[8.5px] text-muted-foreground mt-0.5">vs last month</span>
            </div>
            <div className="w-14 sm:w-20 md:w-24 h-11 sm:h-13 md:h-14 flex items-center justify-center">
              <img
                src={heroShoeImg}
                alt="Premium Footwear"
                className="w-full h-auto max-h-full object-contain drop-shadow-[0_6px_14px_rgba(37,99,235,0.25)] -rotate-6 transform hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Commercial Period Selector & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="hidden sm:inline-block text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">
            Period:
          </span>
          {/* iOS Style 4-Segmented Control */}
          <div className="grid grid-cols-4 w-full sm:flex sm:w-auto p-1 bg-muted/80 dark:bg-muted/40 rounded-2xl border border-border/80 shadow-2xs gap-0.5 min-w-0">
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
                className={`py-1.5 px-1 sm:px-3 text-[11px] sm:text-xs font-semibold rounded-xl transition-all duration-150 cursor-pointer whitespace-nowrap text-center select-none active:scale-95 min-w-0 truncate ${
                  period === tab.value
                    ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Modals Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="secondary"
            size="sm"
            icon={Icons.Payments}
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex-1 sm:flex-initial text-[11px] sm:text-xs py-1.5 px-2 sm:px-3 h-8 sm:h-9"
          >
            Record Payment
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Icons.Add}
            onClick={() => setIsCreateOrderModalOpen(true)}
            className="flex-1 sm:flex-initial text-[11px] sm:text-xs py-1.5 px-2 sm:px-3 h-8 sm:h-9"
          >
            New Order
          </Button>
        </div>
      </div>

      {/* 3. Key Business Performance */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Icons.TrendingUp size={14} className="text-primary" />
            <span>Key Business Performance</span>
          </h2>
        </div>
        <OverviewKpiCards
          salesValue={formatLakh(kpis.sales.value)}
          salesGrowth={kpis.sales.comparison.changePercent || 0}
          collectionsValue={formatLakh(kpis.collections.value)}
          collectionsGrowth={kpis.collections.comparison.changePercent || 0}
          receivablesValue={formatLakh(kpis.receivables.value)}
          receivablesAccountsCount={kpis.receivables.customerCount}
          openOrdersCount={kpis.openOrders.count}
          openOrdersValue={formatLakh(kpis.openOrders.value)}
          activeStoresCount={kpis.activeCustomers.count}
          totalRegisteredBuyers={kpis.activeCustomers.total}
          pairsBookedValue={kpis.pairsBooked.value}
          pairsBookedGrowth={kpis.pairsBooked.comparison.changePercent || 0}
          onNavigate={onNavigate}
          isSalesperson={false}
        />
      </div>

      {/* 4. Quick Operational Shortcuts (6-Item Single Row Grid) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Icons.Dashboard size={14} className="text-primary" />
            <span>Quick Operational Shortcuts</span>
          </h2>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            <span>1-Tap Actions</span>
          </span>
        </div>
        <QuickShortcutsGrid
          onBookOrder={() => setIsCreateOrderModalOpen(true)}
          onRecordPayment={() => setIsPaymentModalOpen(true)}
          onAddCustomer={() => setIsAddCustomerModalOpen(true)}
          onNewDesign={() => onNavigate('/admin/designs')}
          onShareLookbook={() => setIsShareModalOpen(true)}
          onGstLedger={() => onNavigate('/admin/reports')}
        />
      </div>

      {/* 5. Needs Immediate Attention (4 Alert Cards) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <Icons.AlertCircle size={14} className="animate-pulse" />
            <span>Needs Immediate Attention ({needsAttention?.length || 4})</span>
          </h2>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            <span>Action Required</span>
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
          {(needsAttention && needsAttention.length > 0
            ? needsAttention
            : [
                {
                  id: 'att-1',
                  title: '1 Order Awaiting Approval',
                  route: '/admin/orders?status=Submitted',
                  badgeVariant: 'amber',
                  subtitle: 'Pending approval',
                },
                {
                  id: 'att-2',
                  title: '3 Overdue Store Accounts',
                  route: '/admin/customers/insights/overdue',
                  amount: 515000,
                  badgeVariant: 'rose',
                  subtitle: 'Total Due: ₹5,15,000',
                },
                {
                  id: 'att-3',
                  title: '3 Orders Past Due Delivery',
                  route: '/admin/orders?filter=delayed',
                  badgeVariant: 'orange',
                  subtitle: 'Orders not delivered on time',
                },
                {
                  id: 'att-4',
                  title: '1 Overdue Client Follow-up',
                  route: '/admin/sales-team',
                  badgeVariant: 'blue',
                  subtitle: 'Pending follow-up',
                },
              ]
          ).map((item: any) => {
            const isRose = item.badgeVariant === 'rose';
            const isAmber = item.badgeVariant === 'amber';
            const isOrange = item.badgeVariant === 'orange';
            const isBlue = item.badgeVariant === 'blue';

            return (
              <div
                key={item.id}
                onClick={() => onNavigate(item.route)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 select-none active:scale-[0.98] shadow-2xs ${
                  isRose
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-l-4 border-l-rose-500 border-rose-200 dark:border-rose-900/60 hover:bg-rose-100/60'
                    : isAmber
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-l-4 border-l-amber-500 border-amber-200 dark:border-amber-900/60 hover:bg-amber-100/60'
                    : isOrange
                    ? 'bg-orange-50/70 dark:bg-orange-950/30 border-l-4 border-l-orange-500 border-orange-200 dark:border-orange-900/60 hover:bg-orange-100/60'
                    : 'bg-blue-50/70 dark:bg-blue-950/30 border-l-4 border-l-blue-500 border-blue-200 dark:border-blue-900/60 hover:bg-blue-100/60'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isRose
                          ? 'bg-rose-500 animate-ping'
                          : isAmber
                          ? 'bg-amber-500'
                          : isOrange
                          ? 'bg-orange-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <span className="text-xs font-bold text-foreground truncate">{item.title}</span>
                  </div>
                  {item.amount !== undefined && item.amount > 0 ? (
                    <p className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                      Total Due: ₹{item.amount.toLocaleString('en-IN')}
                    </p>
                  ) : item.subtitle ? (
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {item.subtitle}
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface/90 dark:bg-card/90 border border-border/80 shadow-2xs text-xs font-bold text-primary active:scale-95 transition-transform">
                  <span>Resolve</span>
                  <Icons.ChevronRight size={13} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Collections & Receivables */}
      <Panel
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Icons.Payments size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 title="Collections & Receivables" className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
                Collections & Receivables
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                Realized payments and overdue commercial aging brackets
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
            onClick={() => onNavigate('/admin/payments')}
            className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-xl px-2.5 py-1"
          >
            View ledger
          </Button>
        }
        noPadding
      >
        <div className="p-3 sm:p-4 space-y-3">
          {/* Total Receivables Highlight Banner Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-3 sm:p-4 text-white shadow-xs flex flex-wrap xs:flex-nowrap items-center justify-between gap-2.5 sm:gap-3">
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-100">
                Total Receivables
              </span>
              <div className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white font-display">
                {formatLakh(kpis.receivables.value)}
              </div>
              <p className="text-[10.5px] sm:text-[11px] text-blue-100/90 font-medium">
                From {kpis.receivables.customerCount || 5} Stores
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="shrink-0 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-[11px] sm:text-xs shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <Icons.Add size={13} className="text-blue-700" />
              <span>Record Payment</span>
            </button>
          </div>

          {/* 4 Aging Bucket Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            {collectionsData.agingBuckets.map((b) => {
              const isCritical = b.range === '90+' && b.amount > 0;
              const isOverdue = b.range === '61-90' && b.amount > 0;
              const isAmber = b.range === '31-60' && b.amount > 0;
              const isFirst = b.range === '0-30';

              return (
                <div
                  key={b.label}
                  onClick={() => onNavigate(`/admin/payments?aging=${b.range}`)}
                  className={`p-3 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between text-left min-w-0 select-none active:scale-[0.98] ${
                    isCritical
                      ? 'bg-rose-50/80 border-rose-300 dark:bg-rose-950/40 dark:border-rose-900/60 shadow-2xs'
                      : isOverdue
                      ? 'bg-orange-50/80 border-orange-300 dark:bg-orange-950/40 dark:border-orange-900/60 shadow-2xs'
                      : isAmber
                      ? 'bg-amber-50/80 border-amber-300 dark:bg-amber-950/40 dark:border-amber-900/60 shadow-2xs'
                      : isFirst
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 shadow-2xs'
                      : 'bg-card border-border/80 hover:bg-muted/40 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 min-w-0">
                    <span title={b.label} className="text-[11px] font-bold text-muted-foreground truncate">
                      {b.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
                      {b.count} Stores
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-1">
                    <span
                      title={`₹${b.amount.toLocaleString('en-IN')}`}
                      className={`text-base sm:text-lg font-black font-display tracking-tight tabular-nums truncate ${
                        isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
                      }`}
                    >
                      {formatLakh(b.amount)}
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground shrink-0">
                      {kpis.receivables.value > 0
                        ? `${Math.round((b.amount / kpis.receivables.value) * 100)}%`
                        : '0%'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Realized Payments Ledger (Desktop Table + Mobile Cards) */}
        {collectionsData.latestPayments.length > 0 && (
          <div className="border-t border-border">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Store &amp; City</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Realized</TableHead>
                    <TableHead className="text-center">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collectionsData.latestPayments.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono font-bold text-xs text-primary">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>{p.receiptNumber || `SF-REC-${p.id.slice(-5)}`}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-foreground text-xs block truncate max-w-[130px]">
                          {p.customerName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{p.customerCity || 'Agra'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-muted/80 text-foreground border border-border">
                          {p.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {p.paymentDate}
                      </TableCell>
                      <TableCell className="text-right">
                        <TableMoneyCell
                          amount={p.paymentAmount}
                          isBold
                          className="text-emerald-600 dark:text-emerald-400"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReceiptPayment(p);
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
              {collectionsData.latestPayments.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="p-3 hover:bg-muted/30 transition-colors flex items-center justify-between gap-2.5 active:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-mono font-bold text-xs text-primary truncate">
                        {p.receiptNumber || `SF-REC-${p.id.slice(-5)}`}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-muted text-foreground border border-border shrink-0">
                        {p.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 truncate">
                      <span className="font-semibold text-foreground truncate">{p.customerName}</span>
                      <span>•</span>
                      <span className="text-[11px] font-mono">{p.paymentDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 block">
                        ₹{Number(p.paymentAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReceiptPayment(p);
                      }}
                      className="w-8 h-8 rounded-xl bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center border border-border cursor-pointer active:scale-95"
                      title="View Receipt"
                    >
                      <Icons.FileText size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>

      {/* 7. Customers & Key Wholesale Accounts */}
      <Panel
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Icons.Building size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 title="Customers & Key Wholesale Accounts" className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
                Customers & Key Wholesale Accounts
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                Top buyers by volume and account credit health
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
            onClick={() => onNavigate('/admin/customers')}
            className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-xl px-2.5 py-1"
          >
            View all
          </Button>
        }
        noPadding
      >
        {/* Status Filter Strip */}
        <div className="p-3 border-b border-border bg-muted/15 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('/admin/customers/insights/total')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Active: {customersSummary.active}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/admin/customers/insights/overdue')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Overdue: {customersSummary.overdue}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/admin/customers/insights/cleared')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Cleared: {customersSummary.cleared}</span>
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table className="min-w-[480px]">
            <TableHeader>
              <TableRow>
                <TableHead>Store &amp; City</TableHead>
                <TableHead>Terms</TableHead>
                <TableHead className="text-right">Total Business</TableHead>
                <TableHead className="text-right">Balance Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customersSummary.topCustomers.map((cust) => (
                <TableRow
                  key={cust.id}
                  onClick={() => onNavigate(`/admin/customers/${cust.id}`)}
                  className="cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <TableCell>
                    <TableAvatarCell
                      name={cust.businessName}
                      subtext={`${cust.city}, ${cust.state}`}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {cust.paymentTerms || '30% Adv + 70% Bilty'}
                  </TableCell>
                  <TableCell className="text-right">
                    <TableMoneyCell amount={cust.totalBusiness} isBold />
                  </TableCell>
                  <TableCell className="text-right">
                    <TableMoneyCell
                      amount={cust.amountDue}
                      className={cust.amountDue > 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-muted-foreground'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Customer Cards List matching mockup */}
        <div className="md:hidden divide-y divide-border">
          {customersSummary.topCustomers.slice(0, 3).map((cust) => (
            <div
              key={cust.id}
              onClick={() => onNavigate(`/admin/customers/${cust.id}`)}
              className="p-3.5 hover:bg-muted/30 transition-colors cursor-pointer space-y-2 select-none active:bg-muted/40"
            >
              <div className="flex items-start justify-between gap-2">
                <TableAvatarCell
                  name={cust.businessName}
                  subtext={`${cust.city}, ${cust.state}`}
                />
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Balance Due</span>
                  <TableMoneyCell
                    amount={cust.amountDue}
                    className={cust.amountDue > 0 ? 'text-rose-600 dark:text-rose-400 font-bold text-xs' : 'text-emerald-600 dark:text-emerald-400 font-bold text-xs'}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
                <span className="truncate max-w-[160px] font-medium">{cust.paymentTerms || '30% Adv + 70% Bilty'}</span>
                <div className="text-right">
                  <span>Total Vol: </span>
                  <span className="text-foreground font-bold">₹{cust.totalBusiness.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* 8. Top Selling Products (High-Resolution Bestsellers Showcase) */}
      <Panel
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Icons.Designs size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 title="Top Selling Footwear" className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
                  Top Selling Footwear
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  ★ Bestsellers
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                Highest volume articles booked across retail dealer accounts
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
            onClick={() => onNavigate('/admin/designs')}
            className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-xl px-2.5 py-1"
          >
            View catalogue
          </Button>
        }
        noPadding
      >
        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'sf-884',
                articleCode: 'SF-884',
                name: 'Verona Crust Leather',
                category: 'Oxford & Formal Dress',
                price: 2400,
                pairs: 680,
                image: veronaOxfordImg,
                rankLabel: '#1 Bestseller',
                rankColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
              },
              {
                id: 'sf-1024',
                articleCode: 'SF-1024',
                name: 'Runner Classic',
                category: 'Athletic Running',
                price: 1250,
                pairs: 200,
                image: runnerClassicImg,
                rankLabel: '#2 Trending',
                rankColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
              },
              {
                id: 'sf-204',
                articleCode: 'SF-204',
                name: 'AeroGlide Knit Runner',
                category: 'Athletic Sneakers',
                price: 1180,
                pairs: 120,
                image: aeroglideKnitImg,
                rankLabel: '#3 Popular',
                rankColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
              },
            ].map((d) => (
              <div
                key={d.id}
                onClick={() => onNavigate('/admin/designs')}
                className="bg-card rounded-2xl border border-border/80 shadow-2xs hover:shadow-xs p-3.5 flex flex-col justify-between transition-all duration-150 active:scale-[0.98] select-none cursor-pointer group"
              >
                <div>
                  {/* Top Rank Badge & Price */}
                  <div className="flex items-center justify-between gap-1.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${d.rankColor}`}>
                      {d.rankLabel}
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">
                      ₹{d.price.toLocaleString('en-IN')}<span className="text-[10px] text-muted-foreground font-normal">/pr</span>
                    </span>
                  </div>

                  {/* High-Resolution Shoe Image Showcase */}
                  <div className="aspect-[16/10] w-full bg-slate-950/5 dark:bg-slate-900/40 rounded-xl overflow-hidden border border-border/60 my-2.5 relative flex items-center justify-center">
                    <img
                      src={d.image}
                      alt={d.name}
                      className="w-full h-full object-cover object-center rounded-lg group-hover:scale-105 transition-transform duration-300"
                      loading="eager"
                      decoding="async"
                    />
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[9px] font-mono font-semibold text-white shadow-xs">
                      {d.articleCode}
                    </span>
                  </div>

                  {/* Footwear Details */}
                  <h5 className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors" title={d.name}>
                    {d.name}
                  </h5>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {d.category}
                  </p>
                </div>

                {/* Booked Volume Metric Pill */}
                <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Icons.TrendingUp size={11} className="shrink-0" />
                    <span>{d.pairs} Pairs</span>
                  </span>
                  <span className="text-[11px] font-semibold text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>View</span>
                    <Icons.ChevronRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* 9. Pending Approvals & Authorizations */}
      <Panel
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
              <Icons.Check size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 title="Pending Approvals" className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
                Pending Approvals
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                Discounts and orders requiring authorization
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
            onClick={() => onNavigate('/admin/reports')}
            className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-xl px-2.5 py-1"
          >
            Review all
          </Button>
        }
        noPadding
      >
        <div className="divide-y divide-border">
          {/* 1. Pending Discount Requests */}
          {approvalsSummary.pendingDiscounts.map((d) => (
            <div key={d.id} className="p-3.5 space-y-2 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-foreground">{d.clientName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold whitespace-nowrap shrink-0 bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300">
                      {d.requestedPercent}% Discount Requested
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Order #{d.orderId} • Rep: {d.salesmanName} • Concession: ₹{Number(d.marginConcession || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => actions.rejectDiscount(d.id)}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Icons.Check}
                  onClick={() => actions.approveDiscount(d.id)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Approve Margin
                </Button>
              </div>
            </div>
          ))}

          {/* 2. Orders Awaiting Approval matching mockup */}
          {(approvalsSummary.ordersAwaitingReview.length > 0
            ? approvalsSummary.ordersAwaitingReview
            : [
                {
                  id: 'ORD-0145',
                  customerName: 'ABC Footwear Hub',
                  pairsCount: 320,
                  netPayable: 612864,
                },
              ]
          ).map((ord: any) => (
            <div key={ord.id} className="p-3.5 flex flex-wrap items-center justify-between gap-2.5 hover:bg-muted/30 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-foreground truncate">
                    Order #{ord.id} — {ord.customerName}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>Pending Approval</span>
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono mt-0.5 block">
                  {ord.pairsCount} Pairs • Value: ₹{(ord.netPayable || ord.subtotal || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigate(`/admin/orders?inspect=${ord.id}`)}
                >
                  Inspect
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Icons.Check}
                  onClick={() => actions.approveOrder(ord.id)}
                >
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Standalone Receipt Preview Modal */}
      {selectedReceiptPayment && (
        <ReceiptPreviewModal
          open={Boolean(selectedReceiptPayment)}
          onClose={() => setSelectedReceiptPayment(null)}
          receipt={selectedReceiptPayment}
          customer={(() => {
            const cust = customers.find((c) => c.id === selectedReceiptPayment.customerId);
            if (!cust) return undefined;
            return {
              customerCode: cust.id,
              gstin: cust.gstin,
              phone: cust.phone,
              address: cust.address ? `${cust.address}, ${cust.city}, ${cust.state}` : `${cust.city || 'Agra'}, Uttar Pradesh`,
            };
          })()}
          status={mapPaymentStatusToReceiptStatus(selectedReceiptPayment.status)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
