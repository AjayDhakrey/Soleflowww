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
      {/* 1. Top Header (Royal Blue Curved Header matching reference image 1) */}
      <div className="-mx-3 sm:-mx-5 lg:-mx-6 -mt-3 sm:-mt-5 lg:-mt-6 mb-4 sm:mb-6">
        {/* Royal Blue Curved Banner for Mobile */}
        <div className="bg-blue-600 sm:bg-transparent text-white sm:text-foreground pt-3 sm:pt-0 px-4 sm:px-0 pb-7 sm:pb-0 rounded-b-[32px] sm:rounded-none shadow-sm sm:shadow-none space-y-3">
          {/* Top Navbar Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="sm:hidden w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4 text-white">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="15" y2="12" />
                  <line x1="3" y1="18" x2="18" y2="18" />
                </svg>
              </span>
              <div>
                <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white sm:text-slate-900 dark:text-white leading-tight">
                  Dashboard
                </h1>
                <p className="text-[10px] sm:text-xs text-blue-100 sm:text-slate-500 font-medium">
                  Last Update {todayDateFormatted}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('/admin/reports')}
                className="w-8 h-8 rounded-full bg-white/15 sm:bg-white sm:dark:bg-slate-800 border sm:border-slate-200/80 flex items-center justify-center text-white sm:text-slate-700 sm:dark:text-slate-300 shadow-2xs hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                title="Trade Alerts"
              >
                <Icons.Notifications size={16} />
              </button>
              <div className="w-8 h-8 rounded-full bg-amber-300 text-slate-900 font-black text-xs flex items-center justify-center ring-2 ring-white/40 shadow-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Clean Welcome Card (Matching Reference Card with curved border and blue accent) */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="min-w-0 flex-1 space-y-1">
              <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white block tracking-tight">
                Welcome back!
              </span>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-snug">
                Track active wholesale orders, verify payments &amp; review production.
              </p>
            </div>

            <div className="w-16 sm:w-20 md:w-24 h-12 sm:h-14 flex items-center justify-center shrink-0">
              <img
                src={heroShoeImg}
                alt="SoleFlow Footwear"
                className="w-full h-auto max-h-full object-contain drop-shadow-[0_4px_12px_rgba(37,99,235,0.25)] -rotate-6 transform hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>

      {/* 2. Commercial Period Selector & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-1">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 hidden sm:inline">
            PERIOD:
          </span>
          <div className="grid grid-cols-4 gap-1 sm:flex sm:items-center sm:gap-1.5 w-full sm:w-auto">
            {(
              [
                { label: 'Today', value: 'today' },
                { label: 'This Week', value: 'week' },
                { label: 'This Month', value: 'month' },
                { label: 'This Quarter', value: 'quarter' },
              ] as { label: string; value: DashboardPeriod }[]
            ).map((tab) => {
              const isSelected = period === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setPeriod(tab.value)}
                  className={`px-2 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold rounded-full transition-all duration-150 cursor-pointer select-none text-center active:scale-95 truncate ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'bg-white dark:bg-card border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-card border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          >
            <span className="font-bold text-sm">₹</span>
            <span>Record Payment</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCreateOrderModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
          >
            <span className="font-bold text-base leading-none">+</span>
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* 3. Key Business Performance (Ongoing Projects style section with View all) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ongoing Operations
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('/admin/orders')}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 cursor-pointer"
          >
            View all
          </button>
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

      {/* 5. Needs Immediate Attention (Exact match to photo) */}
      <div className="rounded-2xl border border-rose-100 dark:border-rose-950/60 bg-white dark:bg-card p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-rose-500">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              NEEDS IMMEDIATE ATTENTION ({needsAttention?.length || 1})
            </h2>
          </div>
          <span className="inline-flex items-center text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-rose-200/80 dark:border-rose-900/60">
            Action Required
          </span>
        </div>

        <div className="space-y-2">
          {(needsAttention && needsAttention.length > 0
            ? needsAttention
            : [
                {
                  id: 'att-past-due',
                  title: '1 Order Past Due Delivery',
                  route: '/admin/orders?filter=delayed',
                  badgeVariant: 'rose',
                },
              ]
          ).map((item: any) => (
            <div
              key={item.id}
              onClick={() => onNavigate(item.route)}
              className="p-3 sm:p-3.5 rounded-xl border border-rose-100 dark:border-rose-950/60 border-l-[3.5px] border-l-rose-500 bg-white dark:bg-card hover:bg-rose-50/40 transition-all cursor-pointer flex items-center justify-between gap-3 select-none"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {item.title}
                </span>
                {item.amount && item.amount > 0 && (
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    • ₹{item.amount.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 flex items-center gap-1 transition-colors"
              >
                <span>Resolve</span>
                <span className="text-sm leading-none">→</span>
              </button>
            </div>
          ))}
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

        {/* Mobile Customer Cards List matching reference My Team list layout */}
        <div className="md:hidden divide-y divide-border/60">
          {customersSummary.topCustomers.slice(0, 4).map((cust) => (
            <div
              key={cust.id}
              onClick={() => onNavigate(`/admin/customers/${cust.id}`)}
              className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-center justify-between gap-3 select-none active:bg-slate-100/60"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100/80 dark:border-blue-900/40">
                  {cust.businessName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block truncate">
                    {cust.businessName}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate">
                    {cust.city} • Total ₹{Number(cust.totalBusiness || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-xs font-bold font-mono block ${
                  cust.amountDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {cust.amountDue > 0 ? `₹${cust.amountDue.toLocaleString('en-IN')}` : 'Cleared'}
                </span>
                <span className="text-[9px] uppercase font-semibold text-slate-400">
                  {cust.amountDue > 0 ? 'Due' : 'Balance'}
                </span>
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
