import React from 'react';
import { useApp } from '../../context/AppContext';
import { Icons, Icon } from '../../lib/icons';
import { PageHeader, KpiCard, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from '../../components/ui';
import { formatINR, formatLakhs } from '../../utils/formatters';

interface SalesDashboardProps {
  onNavigate: (path: string) => void;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({ onNavigate }) => {
  const {
    customers,
    orders,
    followUps,
    setIsCreateOrderModalOpen,
    setIsPaymentModalOpen,
    setIsShareModalOpen,
    completeFollowUp,
  } = useApp();

  const myClients = customers;
  const myOpenOrders = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const dueFollowUps = followUps.filter((f) => f.status === 'today' || f.status === 'overdue');
  const totalToCollect = customers.reduce((sum, c) => sum + (c.amountDue || 0), 0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* 1. Page Header */}
      <PageHeader
        title="Today"
        secondaryAction={{
          label: 'Share lookbook',
          icon: Icons.Share,
          onClick: () => setIsShareModalOpen(true),
        }}
        primaryAction={{
          label: 'New order',
          icon: Icons.Add,
          onClick: () => setIsCreateOrderModalOpen(true),
        }}
      />

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="My clients"
          value={myClients.length}
          icon={Icons.Clients}
          onClick={() => onNavigate('/sales/customers')}
        />
        <KpiCard
          label="Open orders"
          value={myOpenOrders.length}
          icon={Icons.Orders}
          onClick={() => onNavigate('/sales/orders')}
        />
        <KpiCard
          label="Follow-ups due"
          value={dueFollowUps.length}
          icon={Icons.FollowUps}
          changeType={dueFollowUps.length > 0 ? 'negative' : 'neutral'}
          onClick={() => onNavigate('/sales/follow-ups')}
        />
        <KpiCard
          label="To collect"
          value={formatLakhs(totalToCollect)}
          icon={Icons.Collections}
          changeType="negative"
          onClick={() => onNavigate('/sales/collections')}
        />
      </div>

      {/* 3. Follow-ups Due Today */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Follow-ups due today
          </h2>
          <button
            onClick={() => onNavigate('/sales/follow-ups')}
            className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            View all
          </button>
        </div>

        <Card className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {dueFollowUps.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400">
              No follow-ups due today
            </div>
          ) : (
            dueFollowUps.map((item) => (
              <div
                key={item.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.customerName}
                    </span>
                    <Badge variant={item.status === 'overdue' ? 'danger' : 'warning'}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {item.reason} · {item.time} ({item.customerCity})
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Icons.WhatsApp}
                    onClick={() => {
                      const text = encodeURIComponent(`Namaste ${item.customerName}, following up regarding your balance.`);
                      window.open(`https://wa.me/91${item.phone}?text=${text}`, '_blank');
                    }}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Icons.Check}
                    onClick={() => completeFollowUp(item.id)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* 4. My Recent Orders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            My recent orders
          </h2>
          <button
            onClick={() => onNavigate('/sales/orders')}
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
            {orders.slice(0, 5).map((order) => (
              <TableRow
                key={order.id}
                onClick={() => onNavigate('/sales/orders')}
              >
                <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                  {order.id}
                </TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell align="right">{order.pairsCount}</TableCell>
                <TableCell align="right">{formatINR(order.netPayable)}</TableCell>
                <TableCell>
                  <Badge variant={order.status === 'Delivered' ? 'success' : 'neutral'}>
                    {order.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
