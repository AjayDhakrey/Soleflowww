import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useReceivables } from '../../hooks/usePayments';
import { Icons } from '../../lib/icons';
import {
  PageHeader,
  KpiCard,
  Panel,
  FilterBar,
  SearchInput,
  Select,
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

interface PaymentsPageProps {
  onNavigate: (path: string) => void;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({ onNavigate }) => {
  const {
    customers,
    payments,
    setIsPaymentModalOpen,
    setSelectedCustomer,
    showToast,
  } = useApp();

  const { data: receivablesList } = useReceivables();
  const [search, setSearch] = useState('');
  const [agingFilter, setAgingFilter] = useState<string>('all');

  const dbOutstanding = (receivablesList || []).reduce((sum, r: any) => sum + Number(r.total_outstanding || 0), 0);
  const totalOutstanding = dbOutstanding > 0 ? dbOutstanding : customers.reduce((sum, c) => sum + (c.amountDue || 0), 0);
  const overdueCustomers = customers.filter((c) => c.amountDue > 0);

  const filteredOverdue = overdueCustomers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.businessName.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.propName.toLowerCase().includes(q);

    const matchesAging =
      agingFilter === 'all'
        ? true
        : agingFilter === 'critical'
        ? (c.overdueDays || 0) > 30
        : agingFilter === 'overdue'
        ? (c.overdueDays || 0) > 15
        : true;

    return matchesSearch && matchesAging;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-12">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Finance & Payments' }]}
        title="Commercial Payments & Receivables"
        subtitle="Ledger settlements, overdue aging buckets, and cheque collections."
        actions={
          <>
            <Button
              variant="secondary"
              icon={Icons.Export}
              onClick={() => showToast('Outstanding aging balance sheet exported as PDF!')}
            >
              Export PDF
            </Button>
            <Button
              variant="primary"
              icon={Icons.Payments}
              onClick={() => setIsPaymentModalOpen(true)}
            >
              Record Payment
            </Button>
          </>
        }
      />

      {/* 2. KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KpiCard
          label="Total Receivables"
          value={`₹${(totalOutstanding / 100000).toFixed(2)}L`}
          icon={Icons.Receivables}
          bubbleColor="red"
          caption={`Across ${overdueCustomers.length} active wholesale stores`}
        />
        <KpiCard
          label="Due This Week"
          value="₹4.20L"
          icon={Icons.Pending}
          bubbleColor="amber"
          caption="3 buyers promised settlement"
        />
        <KpiCard
          label="Critical (> 30 Days)"
          value="₹0.80L"
          icon={Icons.Overdue}
          bubbleColor="violet"
          caption="Priority legal reminder queue"
        />
        <KpiCard
          label="Collected (This Month)"
          value="₹21.40L"
          icon={Icons.Approved}
          bubbleColor="green"
          caption="92% on-time realization rate"
        />
      </div>

      {/* 3. Outstanding Accounts Table Panel */}
      <Panel
        title="Outstanding Accounts Requiring Settlement"
        subtitle="Retailers with pending commercial balances exceeding agreed credit cycle"
        headerAction={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Icons.Calendar size={14} className="text-slate-500" />
            Fiscal Cycle: 2026–2027
          </span>
        }
        noPadding
      >
        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800">
          <FilterBar>
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search store name, proprietor, city..."
              containerClassName="max-w-md"
            />
            <Select
              value={agingFilter}
              onChange={(e) => setAgingFilter(e.target.value)}
              options={[
                { label: 'All Aging Buckets', value: 'all' },
                { label: 'Overdue > 15 Days', value: 'overdue' },
                { label: 'Critical > 30 Days', value: 'critical' },
              ]}
            />
          </FilterBar>
        </div>

        {filteredOverdue.length === 0 ? (
          <EmptyState
            icon={Icons.Approved}
            title="All Retailer Accounts Cleared"
            description="There are currently no overdue accounts matching your filter."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store & Proprietor</TableHead>
                <TableHead>Phone / WhatsApp</TableHead>
                <TableHead>Overdue Aging</TableHead>
                <TableHead>Wholesale Terms</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount Due</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOverdue.map((cust) => (
                <TableRow key={cust.id}>
                  <TableCell>
                    <TableAvatarCell
                      name={cust.businessName}
                      subtext={`${cust.city}, ${cust.state} • ${cust.propName}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-slate-600 dark:text-slate-300">
                    {cust.phone}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                      {cust.overdueDays || 18} Days Overdue
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-300 max-w-[180px] truncate">
                    {cust.paymentTerms || '30% Adv + 70% Bilty'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="overdue">
                      Overdue
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <TableMoneyCell
                      amount={cust.amountDue}
                      isBold
                      className="text-rose-600 dark:text-rose-400"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Icons.Payments}
                      onClick={() => {
                        setSelectedCustomer(cust);
                        setIsPaymentModalOpen(true);
                      }}
                    >
                      Collect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>
    </div>
  );
};
