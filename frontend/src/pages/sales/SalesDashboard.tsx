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
    monthlyTarget: 1200000,
    bookedThisMonth: kpis.sales.value || 0,
    commissionAccrued: Math.round((kpis.collections.value || 0) * 0.02),
    todayVisitsDone: followUpsAndVisits.visitsCompleted,
    todayVisitsTotal: followUpsAndVisits.visitsPlanned,
    collectionDue: kpis.receivables.value,
    tasksChecklist: [
      { id: 't1', task: 'Visit Aggarwal Boot House (Payment collection)', time: '11:00 AM', completed: false },
      { id: 't2', task: 'Present Summer catalogue at Modern Footwear', time: '02:30 PM', completed: false },
      { id: 't3', task: 'Follow-up with Royal Shoes for bulk order', time: '04:45 PM', completed: true },
    ],
  };

  const repBooked = kpis.sales.value || currentRep.bookedThisMonth || 0;
  const targetPct = Math.min(100, Math.round((repBooked / (currentRep.monthlyTarget || 1200000)) * 100));

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

      {/* 2. Needs Attention Alert Strip */}
      {needsAttention.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/25 dark:border-amber-500/20 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-2.5">
            <Icons.Pending size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
              Needs Immediate Attention ({needsAttention.reduce((sum, i) => sum + i.count, 0)} Items In Your Accounts)
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {needsAttention.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.route)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${
                  item.badgeVariant === 'rose'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/50'
                    : item.badgeVariant === 'purple'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900/50'
                    : item.badgeVariant === 'blue'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/50'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/50'
                }`}
              >
                <span>{item.title}</span>
                {item.amount != null && item.amount > 0 && (
                  <span className="font-mono font-bold">({formatLakh(item.amount)})</span>
                )}
                <Icons.ChevronRight size={14} className="opacity-60" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Salesman Key Metrics (3D Claymorphic Masterpiece Design) */}
      <OverviewKpiCards
        salesValue={formatLakh(repBooked || 1956000)}
        salesGrowth={kpis.sales.comparison.changePercent || 14}
        collectionsValue={formatLakh(kpis.collections.value)}
        collectionsGrowth={kpis.collections.comparison.changePercent || 8}
        receivablesValue={formatLakh(kpis.receivables.value || 750000)}
        receivablesAccountsCount={kpis.receivables.customerCount || 5}
        openOrdersCount={kpis.openOrders.count || 3}
        openOrdersValue={formatLakh(kpis.openOrders.value || 1025000)}
        activeStoresCount={customersSummary.active || 7}
        totalRegisteredBuyers={customers.length || 7}
        pairsBookedValue={kpis.pairsBooked.value || 1000}
        pairsBookedGrowth={kpis.pairsBooked.comparison.changePercent || 12}
        onNavigate={onNavigate}
        isSalesperson={true}
      />

      {/* 4. Main 2-Column Business Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Orders Pipeline & Collections (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Widget 1: My Orders Pipeline & Latest Orders */}
          <Panel
            title="My Orders Pipeline"
            subtitle={`${ordersPipeline.totalActive} active retail bookings across production & dispatch`}
            headerAction={
              <Button
                variant="ghost"
                size="sm"
                icon={Icons.ChevronRight}
                iconPosition="right"
                onClick={() => onNavigate('/sales/orders')}
              >
                View all
              </Button>
            }
          >
            <div className="space-y-4">
              {/* Funnel Stage Badges */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1 pb-2">
                {ordersPipeline.stages.map((st) => (
                  <div
                    key={st.name}
                    onClick={() => onNavigate(`/sales/orders?status=${st.key.toLowerCase()}`)}
                    className="p-2.5 rounded-xl border border-border bg-muted/40 hover:bg-muted/80 transition-all cursor-pointer text-center"
                  >
                    <p className="text-[11px] font-medium text-muted-foreground truncate">{st.name}</p>
                    <p className="text-base font-bold text-foreground mt-0.5">{st.count}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{formatLakh(st.value)}</p>
                  </div>
                ))}
              </div>

              {/* Latest Orders Table */}
              <div className="border-t border-border pt-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Recent Retail Bookings
                </p>
                {ordersPipeline.latestOrders.length === 0 ? (
                  <EmptyState
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
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Pairs</TableHead>
                        <TableHead className="text-right">Net Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersPipeline.latestOrders.map((order: Order) => (
                        <TableRow
                          key={order.id}
                          onClick={() => onNavigate(`/sales/orders?search=${order.id}`)}
                          className="cursor-pointer hover:bg-muted/50"
                        >
                          <TableCell className="font-mono font-bold text-xs">
                            {order.id}
                          </TableCell>
                          <TableCell className="font-semibold text-sm">
                            {order.customerName}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {order.pairsCount || 0} prs
                          </TableCell>
                          <TableMoneyCell
                            amount={Number(order.netPayable || order.subtotal || 0)}
                            className="text-right font-bold text-xs"
                          />
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </Panel>

          {/* Widget 2: My Collections & Pending Cheques */}
          <Panel
            title="Collections & Aging Balances"
            subtitle={`Inflow: ${formatLakh(collectionsData.collectedThisPeriod)} • Cheques in clearing: ${formatLakh(collectionsData.chequesInTransit)}`}
            headerAction={
              <Button
                variant="ghost"
                size="sm"
                icon={Icons.ChevronRight}
                iconPosition="right"
                onClick={() => onNavigate('/sales/collections')}
              >
                View all
              </Button>
            }
          >
            <div className="space-y-4">
              {/* Aging Buckets Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {collectionsData.agingBuckets.map((b) => (
                  <div
                    key={b.label}
                    onClick={() => onNavigate(`/sales/collections?range=${b.range}`)}
                    className="p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/70 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                      <span>{b.label}</span>
                      <span className="font-bold text-foreground">({b.count})</span>
                    </div>
                    <p className="text-sm font-bold text-foreground mt-1">{formatLakh(b.amount)}</p>
                  </div>
                ))}
              </div>

              {/* Recent Payments Received */}
              <div className="border-t border-border pt-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Recent Collected Payments
                </p>
                {collectionsData.latestPayments.length === 0 ? (
                  <EmptyState
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
                        <TableHead>Customer</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collectionsData.latestPayments.map((pmt: PaymentReceipt) => (
                        <TableRow key={pmt.id} className="hover:bg-muted/40">
                          <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                            {pmt.receiptNumber || `SF-REC-${pmt.id}`}
                          </TableCell>
                          <TableCell className="font-semibold text-sm">
                            {pmt.customerName}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {pmt.paymentMethod} {pmt.utrRef ? `(${pmt.utrRef})` : ''}
                          </TableCell>
                          <TableMoneyCell
                            amount={Number(pmt.paymentAmount || 0)}
                            className="text-right font-bold text-emerald-600 dark:text-emerald-400 text-xs"
                          />
                          <TableCell className="text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReceiptPayment(pmt);
                              }}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                              title="View & Print Receipt"
                            >
                              <Icons.FileText size={16} />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
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
