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
    monthlyTarget: 0,
    bookedThisMonth: kpis.sales.value || 0,
    commissionAccrued: 0,
    todayVisitsDone: followUpsAndVisits.visitsCompleted,
    todayVisitsTotal: followUpsAndVisits.visitsPlanned,
    collectionDue: kpis.receivables.value,
    tasksChecklist: [],
  };

  const repBooked = kpis.sales.value || currentRep.bookedThisMonth || 0;
  const targetPct = (currentRep.monthlyTarget || 0) > 0
    ? Math.min(100, Math.round((repBooked / (currentRep.monthlyTarget || 0)) * 100))
    : 0;

  const todayDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1700px] w-full mx-auto pb-24 md:pb-12 bg-background text-foreground animate-in fade-in duration-150">
      {/* 1. Header with Greeting, Period Selector, and Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">👞</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Good morning, {currentUser.name}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {todayDateFormatted} • Field Sales & Store Route Portal (Territory Performance)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Period Selector */}
          <div className="flex items-center bg-muted p-1 rounded-xl border border-border">
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
                    ? 'bg-surface text-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            icon={Icons.Visits}
            onClick={() => onNavigate('/sales/visits')}
          >
            Log Visit
          </Button>

          <Button
            variant="secondary"
            icon={Icons.Share}
            onClick={() => setIsShareModalOpen(true)}
          >
            Share Catalogue
          </Button>

          <Button
            variant="secondary"
            icon={Icons.Payments}
            onClick={() => setIsPaymentModalOpen(true)}
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


      {/* 3. Salesman Key Metrics (3D Claymorphic Masterpiece Design) */}
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
            <div className="p-4 border-b border-border bg-muted/15">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,6rem),1fr))] gap-2">
                {ordersPipeline.stages.map((st) => {
                  const isActive = st.count > 0;
                  return (
                    <div
                      key={st.name}
                      onClick={() => onNavigate(`/sales/orders?status=${st.key.toLowerCase()}`)}
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Retail Store</TableHead>
                    <TableHead>Pairs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Net Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersPipeline.latestOrders.map((order: Order) => (
                    <TableRow
                      key={order.id}
                      onClick={() => onNavigate(`/sales/orders?search=${order.id}`)}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      <TableCell className="font-mono font-bold text-xs text-primary">
                        {order.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-muted/60 border border-border flex items-center justify-center text-muted-foreground shrink-0">
                            <Icons.Store size={14} />
                          </div>
                          <div>
                            <span className="font-semibold text-foreground text-xs block truncate max-w-[150px]">
                              {order.customerName}
                            </span>
                            <span className="text-[11px] text-muted-foreground">{order.customerCity || '—'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                          <Icons.Designs size={12} className="text-muted-foreground" />
                          {order.pairsCount || 0} Pairs
                        </span>
                      </TableCell>
                      <TableCell>
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
                      <TableCell className="text-right">
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
              {(currentRep.tasksChecklist || []).length === 0 && (
                <p className="p-4 rounded-xl border border-dashed border-border bg-muted/20 text-center text-xs text-muted-foreground">
                  No route stops scheduled today
                </p>
              )}
              {(currentRep.tasksChecklist || []).map((task: any) => (
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
                        {task.task}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {task.time} • Priority Store Stop
                      </p>
                    </div>
                  </div>

                  <StatusBadge variant={task.completed ? 'success' : 'pending'}>
                    {task.completed ? 'Done' : 'Pending'}
                  </StatusBadge>
                </div>
              ))}

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
                        onClick={() => {
                          completeFollowUp(f.id);
                          showToast(`Follow-up with ${f.customerName} marked complete!`);
                        }}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Widget 6: Fast Moving Designs / Best Sellers */}
          <Panel
            title="Trending & Best Selling Designs"
            subtitle="Top articles to showcase during store calls"
            headerAction={
              <Button
                variant="ghost"
                size="sm"
                icon={Icons.ChevronRight}
                iconPosition="right"
                onClick={() => onNavigate('/sales/catalogue')}
              >
                Catalogue
              </Button>
            }
          >
            <div className="space-y-3">
              {designsSummary.topDesigns.slice(0, 4).map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl border border-border bg-card hover:border-zinc-400 dark:hover:border-zinc-500 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-muted overflow-hidden shrink-0 border border-border flex items-center justify-center">
                      {d.image ? (
                        <img
                          src={d.image}
                          alt={d.name || d.articleCode}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icons.Catalogue size={20} className="text-muted-foreground opacity-50" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{d.name || d.articleCode}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {d.category} • Wholesale ₹{d.price}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Icons.Share}
                    onClick={() => setIsShareModalOpen(true)}
                  >
                    Share
                  </Button>
                </div>
              ))}
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
