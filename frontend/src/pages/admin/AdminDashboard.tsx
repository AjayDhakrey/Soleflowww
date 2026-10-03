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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1720px] w-full mx-auto pb-24 md:pb-12 bg-background text-foreground animate-in fade-in duration-200">
      {/* 1. Header with Greeting, Period Filter, and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
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
        salesValue={formatLakh(kpis.sales.value || 1956000)}
        salesGrowth={kpis.sales.comparison.changePercent || 14}
        collectionsValue={formatLakh(kpis.collections.value)}
        collectionsGrowth={kpis.collections.comparison.changePercent || 8}
        receivablesValue={formatLakh(kpis.receivables.value || 750000)}
        receivablesAccountsCount={kpis.receivables.customerCount || 5}
        openOrdersCount={kpis.openOrders.count || 3}
        openOrdersValue={formatLakh(kpis.openOrders.value || 1025000)}
        activeStoresCount={kpis.activeCustomers.count || 7}
        totalRegisteredBuyers={kpis.activeCustomers.total || 7}
        pairsBookedValue={kpis.pairsBooked.value || 1000}
        pairsBookedGrowth={kpis.pairsBooked.comparison.changePercent || 12}
        onNavigate={onNavigate}
        isSalesperson={false}
      />

      {/* 4. Main 2-Column Business Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* WIDGET A: Orders Pipeline & Funnel */}
        <Panel
          title="Orders Pipeline & Funnel"
          subtitle="Real-time order progression from booking to dispatch"
          headerAction={
            <Button
              variant="ghost"
              size="sm"
              icon={Icons.ChevronRight}
              iconPosition="right"
              onClick={() => onNavigate('/admin/orders')}
            >
              View all orders
            </Button>
          }
          noPadding
        >
          {/* Segmented Funnel Stepper */}
          <div className="p-4 border-b border-border bg-muted/15">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {ordersPipeline.stages.map((st) => (
                <div
                  key={st.name}
                  onClick={() => onNavigate(`/admin/orders?status=${encodeURIComponent(st.name)}`)}
                  className="p-2.5 rounded-xl border border-border bg-surface hover:border-zinc-400 dark:hover:border-zinc-500 transition-all cursor-pointer text-center"
                >
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
                    {st.name}
                  </span>
                  <span className="text-base font-bold text-foreground block font-mono mt-1">
                    {st.count}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono block">
                    {formatLakh(st.value)}
                  </span>
                </div>
              ))}
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
                      <span className="font-semibold text-foreground text-xs block truncate max-w-[150px]">
                        {ord.customerName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{ord.customerCity || 'Agra'}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {ord.pairsCount || 0} Pairs
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

        {/* WIDGET B: Collections & Ageing Breakdown */}
        <Panel
          title="Collections & Receivables Ageing"
          subtitle="Realized payments and overdue commercial aging brackets"
          headerAction={
            <Button
              variant="ghost"
              size="sm"
              icon={Icons.ChevronRight}
              iconPosition="right"
              onClick={() => onNavigate('/admin/payments')}
            >
              View ledger
            </Button>
          }
          noPadding
        >
          {/* Ageing Summary Bar */}
          <div className="p-4 border-b border-border bg-muted/15">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
              Outstanding Balances by Aging Bracket
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {collectionsData.agingBuckets.map((b) => (
                <div
                  key={b.label}
                  onClick={() => onNavigate(`/admin/payments?aging=${b.range}`)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    b.range === '90+' && b.amount > 0
                      ? 'bg-rose-50/70 border-rose-300 dark:bg-rose-950/40 dark:border-rose-900/60'
                      : 'bg-surface border-border hover:border-zinc-400 dark:hover:border-zinc-500'
                  }`}
                >
                  <span className="text-[11px] font-semibold text-muted-foreground block truncate">{b.label}</span>
                  <span className="text-xs font-bold text-foreground block font-mono mt-1">
                    {formatLakh(b.amount)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">({b.count} Stores)</span>
                </div>
              ))}
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
                      {p.receiptNumber || `SF-REC-${p.id.slice(-5)}`}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground text-xs block truncate max-w-[130px]">
                        {p.customerName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{p.customerCity || 'Agra'}</span>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {p.paymentMethod}
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
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        title="View & Print Official Receipt"
                      >
                        <Icons.FileText size={15} />
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
                    {d.orderedPairs || 240} Pairs
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    ₹{(d.price || 1250).toLocaleString('en-IN')}/pr
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
                      Target: {formatLakh(rep.monthlyTarget || 1200000)} ({rep.targetPct}%)
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
              icon={Icons.Approved}
              title="All Approvals Cleared"
              description="No pending trade discounts or orders awaiting review."
            />
          ) : (
            <div className="divide-y divide-border">
              {/* 1. Pending Discount Requests */}
              {approvalsSummary.pendingDiscounts.map((d) => (
                <div key={d.id} className="p-4 space-y-2.5 hover:bg-muted/30 transition-colors">
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
                <div key={ord.id} className="p-4 flex items-center justify-between gap-2 hover:bg-muted/30 transition-colors">
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
