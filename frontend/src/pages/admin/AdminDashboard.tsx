import React from 'react';
import { useApp } from '../../context/AppContext';
import { Icons, Icon } from '../../lib/icons';
import { PageHeader, KpiCard, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, StatusDot } from '../../components/ui';
import { formatINR, formatLakhs, formatDate } from '../../utils/formatters';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    customers,
    orders,
    payments,
    setIsPaymentModalOpen,
    setIsCreateOrderModalOpen,
    setSelectedCustomer,
  } = useApp();

  const totalOutstanding = customers.reduce((sum, c) => sum + (c.amountDue || 0), 0);
  const overdueClients = customers.filter((c) => (c.amountDue || 0) > 0 && (c.overdueDays || 0) > 30);
  const totalOverdue = overdueClients.reduce((sum, c) => sum + (c.amountDue || 0), 0);
  const openOrders = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const totalOrderValue = orders.reduce((sum, o) => sum + (o.netPayable || 0), 0);
  const todayCollections = payments
    .filter((p) => p.paymentDate === 'Today' || p.paymentDate?.includes('2026'))
    .reduce((sum, p) => sum + (p.paymentAmount || 0), 0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* 1. Page Header */}
      <PageHeader
        title="Dashboard"
        secondaryAction={{
          label: 'Record payment',
          icon: Icons.Payments,
          onClick: () => setIsPaymentModalOpen(true),
        }}
        primaryAction={{
          label: 'New order',
          icon: Icons.Add,
          onClick: () => setIsCreateOrderModalOpen(true),
        }}
      />

      {/* 2. KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          label="Active clients"
          value={customers.length}
          icon={Icons.Clients}
          onClick={() => onNavigate('/admin/customers')}
        />
        <KpiCard
          label="Open orders"
          value={openOrders.length}
          icon={Icons.Orders}
          onClick={() => onNavigate('/admin/orders')}
        />
        <KpiCard
          label="Order value"
          value={formatLakhs(totalOrderValue)}
          icon={Icons.Meta.Amount}
          onClick={() => onNavigate('/admin/orders')}
        />
        <KpiCard
          label="Outstanding"
          value={formatLakhs(totalOutstanding)}
          icon={Icons.Receivables}
          onClick={() => onNavigate('/admin/payments')}
        />
        <KpiCard
          label="Overdue"
          value={formatLakhs(totalOverdue)}
          icon={Icons.Status.Overdue}
          changeType="negative"
          onClick={() => onNavigate('/admin/payments')}
        />
        <KpiCard
          label="Collections today"
          value={formatINR(todayCollections)}
          icon={Icons.Collections}
          changeType="positive"
          onClick={() => onNavigate('/admin/payments')}
        />
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Orders Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Recent orders
            </h2>
            <button
              onClick={() => onNavigate('/admin/orders')}
              className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              View all
            </button>
          </div>

          <Table>
            <TableHeader>
              <tr>
                <TableHead>Order</TableHead>
                <TableHead>Client</TableHead>
                <TableHead align="right">Pairs</TableHead>
                <TableHead align="right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {orders.slice(0, 6).map((order) => {
                const isPaid = order.status === 'Delivered' || order.balanceDue === 0;
                const isProd = order.status === 'In Production';
                return (
                  <TableRow
                    key={order.id}
                    onClick={() => onNavigate('/admin/orders')}
                  >
                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                      {order.id}
                    </TableCell>
                    <TableCell>
                      <div className="truncate max-w-[160px] font-medium text-zinc-900 dark:text-zinc-100">
                        {order.customerName}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        {order.customerCity}
                      </div>
                    </TableCell>
                    <TableCell align="right">{order.pairsCount}</TableCell>
                    <TableCell align="right">{formatINR(order.netPayable)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          isPaid ? 'success' : isProd ? 'info' : order.status === 'Cancelled' ? 'danger' : 'neutral'
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Right 1 Col: Overdue Clients */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Overdue clients
            </h2>
            <button
              onClick={() => onNavigate('/admin/customers')}
              className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              View all
            </button>
          </div>

          <Card className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {overdueClients.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400">
                No overdue accounts
              </div>
            ) : (
              overdueClients.slice(0, 5).map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => {
                    setSelectedCustomer(cust);
                    onNavigate('/admin/customers');
                  }}
                  className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {cust.businessName}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {cust.city} · {cust.overdueDays}d overdue
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold text-red-600 dark:text-red-400 tabular-nums">
                      {formatINR(cust.amountDue)}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Limit {formatLakhs(cust.creditLimit)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>

      {/* 4. Recent Payments Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Recent payments
          </h2>
          <button
            onClick={() => onNavigate('/admin/payments')}
            className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            View all
          </button>
        </div>

        <Table>
          <TableHeader>
            <tr>
              <TableHead>Receipt</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead align="right">Amount</TableHead>
              <TableHead>Date</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {payments.slice(0, 5).map((pay) => (
              <TableRow
                key={pay.id}
                onClick={() => onNavigate('/admin/payments')}
              >
                <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                  {pay.receiptNumber}
                </TableCell>
                <TableCell>{pay.customerName}</TableCell>
                <TableCell>{pay.paymentMethod}</TableCell>
                <TableCell className="text-zinc-500">{pay.utrRef || '—'}</TableCell>
                <TableCell align="right" className="font-medium text-emerald-600 dark:text-emerald-400">
                  {formatINR(pay.paymentAmount)}
                </TableCell>
                <TableCell className="text-zinc-500">{pay.paymentDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
