import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import {
  PageHeader,
  KpiCard,
  Panel,
  FilterBar,
  SearchInput,
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

export const CollectionsPage: React.FC = () => {
  const { customers, setIsPaymentModalOpen, setSelectedCustomer, currentUser } = useApp();

  const [search, setSearch] = useState('');

  const assignedCusts = customers.filter(
    (c) => c.salespersonId === currentUser.id || c.salespersonName.includes(currentUser.name)
  );
  const overdueOnly = assignedCusts.filter((c) => c.amountDue > 0);
  const totalAssignedDue = overdueOnly.reduce((acc, c) => acc + c.amountDue, 0);

  const filtered = overdueOnly.filter(
    (c) =>
      c.businessName.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.propName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-12">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/sales/dashboard' }, { label: 'Collections' }]}
        title="Territory Collections & Cheques"
        subtitle="Manage assigned retailer outstanding dues, collect cheques, and record realizations."
        actions={
          <Button
            variant="primary"
            icon={Icons.Payments}
            onClick={() => setIsPaymentModalOpen(true)}
          >
            Record Cheque / Payment
          </Button>
        }
      />

      {/* 2. KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KpiCard
          label="Total Assigned Receivables"
          value={`₹${(totalAssignedDue / 100000).toFixed(2)}L`}
          icon={Icons.Receivables}
          bubbleColor="red"
          caption="Pending balance across stores"
        />
        <KpiCard
          label="Overdue Stores"
          value={`${overdueOnly.length} Accounts`}
          icon={Icons.Overdue}
          bubbleColor="amber"
          caption="Need field collection visits"
        />
        <KpiCard
          label="Collected This Month"
          value="₹8.40L"
          icon={Icons.Approved}
          bubbleColor="green"
          caption="Realized in bank"
        />
        <KpiCard
          label="Cheques in Clearing"
          value="₹1.50L"
          icon={Icons.Collections}
          bubbleColor="zinc"
          caption="Expected credit 24-48 hrs"
        />
      </div>

      {/* 3. Assigned Accounts Table Panel */}
      <Panel
        title="Accounts with Pending Balance"
        subtitle={`Showing ${filtered.length} client stores with outstanding balance`}
        headerAction={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Icons.Calendar size={14} className="text-slate-500" />
            Today: {new Date().toISOString().split('T')[0]}
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
              placeholder="Search assigned store name, proprietor, city..."
              containerClassName="max-w-md"
            />
          </FilterBar>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Icons.Approved}
            title="All Territory Accounts Settled"
            description="No pending balances or overdue collections for your territory."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store & Proprietor</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Overdue</TableHead>
                <TableHead>Terms & History</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Balance Due</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cust) => (
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
                      {cust.overdueDays || 12} Days
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">
                    {cust.paymentTerms}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="overdue">
                      Pending
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
                    <div className="flex items-center justify-end gap-2">
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
                      <a
                        href={`tel:${cust.phone}`}
                        className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl inline-flex items-center"
                        title="Call Proprietor"
                      >
                        <Icons.Phone size={15} />
                      </a>
                    </div>
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
