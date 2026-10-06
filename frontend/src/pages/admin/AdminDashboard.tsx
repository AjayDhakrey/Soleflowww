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
    productionSummary,
    designsSummary,
    salesTeamSummary,
    approvalsSummary,
    recentActivities,
    actions,
  } = useDashboardOverview();

  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentReceipt | null>(null);

  const formatLakh = (amount: number) => `₹${(amount / 100000).toFixed(2)}L`;
  const formatINR = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const todayDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 max-w-[1720px] w-full mx-auto pb-20 md:pb-10 bg-background text-foreground animate-in fade-in duration-200">
      {/* 1. Header with Greeting, Period Filter, and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl select-none">☀️</span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Good morning, {currentUser.name}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Live Operations
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {todayDateFormatted} • Consolidated commercial overview across orders, collections, production, and accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Period Selector Tabs */}
          <div className="flex items-center bg-muted/70 p-1 rounded-xl border border-border">
            {(
              [
                { label: 'Today', value: 'today' },
                { label: 'This Week', value: 'week' },
                { label: 'This Month', value: 'month' },
                { label: 'This Quarter', value: 'quarter' },
              ] as { label: string; value: DashboardPeriod }[]
            ).map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setPeriod(tab.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  period === tab.value
                    ? 'bg-surface text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            icon={Icons.Payments}
            onClick={() => setIsPaymentModalOpen(true)}
            className="hover:border-emerald-500/40"
          >
            Record Payment
          </Button>

          <Button
            variant="primary"
            icon={Icons.Add}
            onClick={() => setIsCreateOrderModalOpen(true)}
          >
            New Order
          </Button>
        </div>
      </div>


      {/* 3. 6 Key Business KPI Cards (3D Claymorphic Masterpiece Design) */}
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

      {/* 4. Main 2-Column Business Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch">
        {/* WIDGET A: Orders Pipeline & Funnel */}
        <Panel
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <Icons.Orders size={20} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 title="Orders Pipeline & Funnel" className="text-lg font-bold text-foreground tracking-tight truncate">
                  Orders Pipeline & Funnel
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  Real-time order progression from booking to dispatch
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
              onClick={() => onNavigate('/admin/orders')}
              className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-xl px-3 py-1.5"
            >
              View all orders
            </Button>
          }
          noPadding
        >
          {/* Segmented Funnel Stepper */}
          <div className="p-4 border-b border-border bg-muted/15">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,6rem),1fr))] gap-2">
              {ordersPipeline.stages.map((st) => {
                const isActive = st.count > 0;
                return (
                  <div
                    key={st.name}
                    onClick={() => onNavigate(`/admin/orders?status=${encodeURIComponent(st.name)}`)}
                    className={`relative p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group min-w-0 overflow-hidden ${
                      isActive
                        ? 'bg-surface border-primary/40 shadow-xs ring-1 ring-primary/20 hover:border-primary'
                        : 'bg-surface/80 border-border/80 hover:border-border hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                      <span title={st.name} className={`text-[11px] font-bold uppercase tracking-wider truncate ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {st.name}
                      </span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-1.5 gap-y-0.5">
                      <span className={`text-lg font-bold font-display tracking-tight tabular-nums whitespace-nowrap ${isActive ? 'text-foreground' : 'text-muted-foreground/80'}`}>
                        {st.count}
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground tabular-nums whitespace-nowrap" title={`₹${st.value.toLocaleString('en-IN')}`}>
                        {formatLakh(st.value)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Latest 5 Orders Table */}
          {ordersPipeline.latestOrders.length === 0 ? (
            <EmptyState
              icon={Icons.Orders}
              title="No Orders Logged"
              description="Wholesale bookings will appear here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Retail Store</TableHead>
                  <TableHead>Pairs</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Net Payable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersPipeline.latestOrders.map((ord: Order) => (
                  <TableRow
                    key={ord.id}
                    onClick={() => onNavigate(`/admin/orders?inspect=${ord.id}`)}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      {ord.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-muted/60 border border-border flex items-center justify-center text-muted-foreground shrink-0">
                          <Icons.Store size={14} />
                        </div>
                        <div>
                          <span className="font-semibold text-foreground text-xs block truncate max-w-[150px]">
                            {ord.customerName}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{ord.customerCity || 'Agra'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        <Icons.Designs size={12} className="text-muted-foreground" />
                        {ord.pairsCount || 0} Pairs
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        variant={
                          ord.status === 'Delivered'
                            ? 'success'
                            : ord.status === 'Dispatched'
                            ? 'info'
                            : ord.status === 'In Production' || ord.status === 'Ready QC'
                            ? 'active'
                            : ord.status === 'Approved'
                            ? 'purple'
                            : 'pending'
                        }
                      >
                        {ord.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <TableMoneyCell amount={ord.netPayable || ord.subtotal || 0} isBold />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>

        {/* WIDGET B: Collections & Receivables Ageing */}
        <Panel
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Icons.Payments size={20} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 title="Collections & Receivables Ageing" className="text-lg font-bold text-foreground tracking-tight truncate">
                  Collections & Receivables Ageing
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
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
              className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-xl px-3 py-1.5"
            >
              View ledger
            </Button>
          }
          noPadding
        >
          {/* Ageing Summary Bar */}
          <div className="p-4 border-b border-border bg-muted/15">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,8.5rem),1fr))] gap-2.5">
              {collectionsData.agingBuckets.map((b) => {
                const isCritical = b.range === '90+' && b.amount > 0;
                const isOverdue = b.range === '61-90' && b.amount > 0;
                const isAmber = b.range === '31-60' && b.amount > 0;
                return (
                  <div
                    key={b.label}
                    onClick={() => onNavigate(`/admin/payments?aging=${b.range}`)}
                    className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between text-left min-w-0 overflow-hidden ${
                      isCritical
                        ? 'bg-rose-50/70 border-rose-300 dark:bg-rose-950/40 dark:border-rose-900/60 shadow-xs'
                        : isOverdue
                        ? 'bg-orange-50/70 border-orange-300 dark:bg-orange-950/40 dark:border-orange-900/60'
                        : isAmber
                        ? 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/40 dark:border-amber-900/60'
                        : 'bg-surface/90 border-border/90 hover:border-border hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-x-1.5 gap-y-0.5 min-w-0">
                      <span title={b.label} className="text-[11px] font-semibold text-muted-foreground tracking-tight block truncate min-w-0">
                        {b.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
                        {b.count} Stores
                      </span>
                    </div>
                    <div className="mt-2">
                      <span title={`₹${b.amount.toLocaleString('en-IN')}`} className={`text-base sm:text-lg font-bold font-display tracking-tight tabular-nums block whitespace-nowrap ${isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
                        {formatLakh(b.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Latest 5 Payments with Direct Receipt Modal Action */}
          {collectionsData.latestPayments.length === 0 ? (
            <EmptyState
              icon={Icons.Payments}
              title="No Payments Recorded"
              description="Record collections to track ledger cashflow."
            />
          ) : (
            <Table>
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
                  <TableRow
                    key={p.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
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
          )}
        </Panel>

        {/* WIDGET C: Customers & Key Wholesale Accounts */}
        <Panel
          title="Customers & Key Wholesale Accounts"
          subtitle="Top buyers by volume and account credit health"
          headerAction={
            <Button
              variant="ghost"
              size="sm"
              icon={Icons.ChevronRight}
              iconPosition="right"
              onClick={() => onNavigate('/admin/customers')}
            >
              View all customers
            </Button>
          }
          noPadding
        >
          {/* Health Status Filter Strip */}
          <div className="p-3.5 border-b border-border bg-muted/15 flex items-center justify-between text-xs font-semibold gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigate('/admin/customers/insights/total')}
              className="text-foreground hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Active: {customersSummary.active}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/admin/customers/insights/overdue')}
              className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Overdue: {customersSummary.overdue}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/admin/customers/insights/cleared')}
              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Cleared: {customersSummary.cleared}</span>
            </button>
          </div>

          <Table>
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
        </Panel>

        {/* WIDGET D: Production & Manufacturing Plants */}
        <Panel
          title="Production & Manufacturing Plants"
          subtitle="Consignment load, active footwear lines, and plant dispatch rates"
          headerAction={
            <Button
              variant="ghost"
              size="sm"
              icon={Icons.ChevronRight}
              iconPosition="right"
              onClick={() => onNavigate('/admin/manufacturers')}
            >
              View plants
            </Button>
          }
          noPadding
        >
          <div className="divide-y divide-border">
            {productionSummary.manufacturers.map((m) => (
              <div
                key={m.id}
                onClick={() => onNavigate('/admin/manufacturers')}
                className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Icons.Manufacturers size={15} className="text-blue-600" />
                    <span>{m.name}</span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{m.plant}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-foreground block">
                    {m.activeOrdersCount} Active Batches • {m.onTimeRate}% On-Time
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {Number(m.pairsInProduction || 0).toLocaleString('en-IN')} Pairs in Production
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Delayed Production Alert Banner */}
          {productionSummary.delayedOrders.length > 0 && (
            <div className="p-3.5 bg-rose-50/80 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-semibold">
                <Icons.Overdue size={15} />
                <span>{productionSummary.delayedOrders.length} Order(s) past promised delivery date</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/admin/orders?filter=delayed')}
                className="text-rose-700 dark:text-rose-300 underline font-bold cursor-pointer"
              >
                Inspect Delayed
              </button>
            </div>
          )}
        </Panel>

        {/* WIDGET E: Design Catalogue & Bestsellers */}
        <Panel
          title="Design Catalogue & Bestselling Models"
          subtitle="Top customer favorites and volume demand by article"
          headerAction={
            <Button
              variant="ghost"
              size="sm"
              icon={Icons.ChevronRight}
              iconPosition="right"
              onClick={() => onNavigate('/admin/designs')}
            >
              View catalogue
            </Button>
          }
          noPadding
        >
          <div className="divide-y divide-border">
            {designsSummary.topDesigns.map((d) => (
              <div
                key={d.id}
                onClick={() => onNavigate('/admin/designs')}
                className="p-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0 border border-border flex items-center justify-center">
                    {d.image ? (
                      <img
                        src={d.image}
                        alt={d.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icons.Designs size={18} className="text-muted-foreground opacity-50" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-foreground truncate max-w-[160px] sm:max-w-xs">
                      {d.name}
                    </h5>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {d.articleCode} • {d.category}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold font-mono text-xs text-foreground block">
                    {d.orderedPairs || 0} Pairs
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    ₹{(d.price || 0).toLocaleString('en-IN')}/pr
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* WIDGET F: Sales Force Performance Leaderboard */}
        <Panel
          title="Sales Force & Field Team"
          subtitle="Monthly targets, collection achievements, and active reps"
          headerAction={
            <Button
              variant="ghost"
              size="sm"
              icon={Icons.ChevronRight}
              iconPosition="right"
              onClick={() => onNavigate('/admin/sales-team')}
            >
              View team
            </Button>
          }
          noPadding
        >
          <div className="divide-y divide-border">
            {salesTeamSummary.map((rep) => (
              <div
                key={rep.id}
                onClick={() => onNavigate('/admin/sales-team')}
                className="p-4 space-y-2 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <TableAvatarCell name={rep.name} subtext={rep.cluster || rep.zone} />
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-foreground">
                      {formatLakh(rep.bookedThisMonth)}
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      Target: {formatLakh(rep.monthlyTarget || 0)} ({rep.targetPct}%)
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    style={{ width: `${Math.min(rep.targetPct, 100)}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      rep.targetPct >= 80 ? 'bg-emerald-500' : rep.targetPct >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* WIDGET G: Pending Approvals & Authorizations */}
        <Panel
          title="Pending Approvals & Margin Overrides"
          subtitle="Trade discount requests and orders requiring trader authorization"
          headerAction={
            <Button
              variant="ghost"
              size="sm"
              icon={Icons.ChevronRight}
              iconPosition="right"
              onClick={() => onNavigate('/admin/reports')}
            >
              Approvals center
            </Button>
          }
          noPadding
        >
          {approvalsSummary.totalPendingCount === 0 ? (
            <EmptyState
              compact
              icon={Icons.Approved}
              title="All Approvals Cleared"
              description="No pending trade discounts or orders awaiting review."
            />
          ) : (
            <div className="divide-y divide-border">
              {/* 1. Pending Discount Requests */}
              {approvalsSummary.pendingDiscounts.map((d) => (
                <div key={d.id} className="p-3.5 space-y-2 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground">{d.clientName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300">
                          {d.requestedPercent}% Discount Requested
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Order #{d.orderId} • Rep: {d.salesmanName} • Concession: ₹{Number(d.marginConcession || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
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

              {/* 2. Orders Awaiting Approval */}
              {approvalsSummary.ordersAwaitingReview.map((ord) => (
                <div key={ord.id} className="p-3.5 flex items-center justify-between gap-2 hover:bg-muted/30 transition-colors">
                  <div>
                    <span className="font-bold text-xs text-foreground block">
                      Order #{ord.id} — {ord.customerName}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {ord.pairsCount} Pairs • Value: ₹{(ord.netPayable || ord.subtotal || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
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
          )}
        </Panel>

        {/* WIDGET H: Recent Commercial Activity & Operational Feed */}
        <Panel
          title="Recent Activity & Audit Trail"
          subtitle="Real-time log of orders, collections, dispatch events, and system updates"
          headerAction={
            <Button
              variant="ghost"
              size="sm"
              icon={Icons.ChevronRight}
              iconPosition="right"
              onClick={() => onNavigate('/admin/reports')}
            >
              Full audit log
            </Button>
          }
          noPadding
        >
          {recentActivities && recentActivities.length > 0 ? (
            <div className="divide-y divide-border">
              {recentActivities.slice(0, 5).map((act) => (
                <div key={act.id} className="p-3.5 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-muted/70 border border-border flex items-center justify-center text-muted-foreground shrink-0">
                      <Icons.Activity size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {act.action}: <span className="font-normal text-muted-foreground">{act.recordTitle || act.recordType}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        By {act.actor} ({act.actorRole})
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-muted-foreground block">
                      {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                    <span className="text-[10px] font-semibold text-primary">
                      {act.recordType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              icon={Icons.Activity}
              title="No Recent Activity"
              description="System activities and operational actions will appear here."
            />
          )}
        </Panel>
      </div>

      {/* 5. Quick Operational Shortcuts Dock (3D Claymorphic Masterpiece Style) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 px-1">
          <Icons.Dashboard size={15} />
          <span>Quick Operational Shortcuts</span>
        </h3>
        <QuickShortcutsGrid
          onBookOrder={() => setIsCreateOrderModalOpen(true)}
          onRecordPayment={() => setIsPaymentModalOpen(true)}
          onAddCustomer={() => setIsAddCustomerModalOpen(true)}
          onNewDesign={() => onNavigate('/admin/designs')}
          onShareLookbook={() => setIsShareModalOpen(true)}
          onGstLedger={() => onNavigate('/admin/reports')}
        />
      </div>

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
