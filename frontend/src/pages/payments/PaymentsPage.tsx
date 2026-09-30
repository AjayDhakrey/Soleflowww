import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useReceivables } from '../../hooks/usePayments';
import { Icons } from '../../lib/icons';
import { PaymentReceipt } from '../../types';
import {
  ReceiptPreviewModal,
  mapPaymentStatusToReceiptStatus,
} from '../../components/payments/ReceiptTemplate';
import PaymentsKpiCards from '../../components/payments/PaymentsKpiCards';
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
  const [activeTab, setActiveTab] = useState<'receivables' | 'payments'>('receivables');
  const [search, setSearch] = useState('');
  const [agingFilter, setAgingFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  
  // Selected receipt for preview modal
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentReceipt | null>(null);

  const totalOutstanding = useMemo(() => {
    if (receivablesList && receivablesList.length > 0) {
      return receivablesList.reduce((sum, r: any) => sum + Number(r.amount_due || r.total_outstanding || 0), 0);
    }
    return customers.reduce((sum, c) => sum + Number(c.amountDue || 0), 0);
  }, [receivablesList, customers]);

  const overdueCustomers = useMemo(() => customers.filter((c) => Number(c.amountDue || 0) > 0), [customers]);

  const criticalAmount = useMemo(() => {
    return overdueCustomers
      .filter((c) => (c.overdueDays || 0) > 30)
      .reduce((sum, c) => sum + Number(c.amountDue || 0), 0);
  }, [overdueCustomers]);

  const dueThisWeekAmount = useMemo(() => {
    return overdueCustomers
      .filter((c) => (c.overdueDays || 0) <= 7)
      .reduce((sum, c) => sum + Number(c.amountDue || 0), 0);
  }, [overdueCustomers]);

  const now = new Date();
  const collectedThisMonth = useMemo(() => {
    return payments
      .filter((p) => {
        if (p.status === 'bounced' || p.status === 'reversed') return false;
        const d = new Date(p.paymentDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p) => sum + Number(p.paymentAmount || 0), 0);
  }, [payments, now]);

  const filteredOverdue = useMemo(() => {
    return overdueCustomers.filter((c) => {
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
  }, [overdueCustomers, search, agingFilter]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        p.customerName.toLowerCase().includes(q) ||
        (p.receiptNumber && p.receiptNumber.toLowerCase().includes(q)) ||
        (p.utrRef && p.utrRef.toLowerCase().includes(q)) ||
        (p.customerCity && p.customerCity.toLowerCase().includes(q));

      const matchesMethod =
        paymentMethodFilter === 'all' || p.paymentMethod === paymentMethodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [payments, search, paymentMethodFilter]);

  const handleExportCSV = () => {
    const headers = ['Customer ID', 'Store Name', 'Proprietor', 'City', 'Phone', 'Credit Limit', 'Overdue Days', 'Outstanding Due (INR)'];
    const rows = filteredOverdue.map((c) => [
      c.id,
      `"${c.businessName}"`,
      `"${c.propName}"`,
      c.city,
      c.phone,
      c.creditLimit,
      c.overdueDays || 0,
      c.amountDue,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `soleflow_receivables_aging_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Receivables Aging Report exported to CSV!');
  };

  const handleCopyReceiptLink = (paymentId: string) => {
    const url = `${window.location.origin}/receipts/${paymentId}`;
    navigator.clipboard.writeText(url);
    showToast('Receipt link copied to clipboard!');
  };

  // Find matching customer for selected receipt
  const selectedReceiptCustomer = useMemo(() => {
    if (!selectedReceiptPayment) return undefined;
    const cust = customers.find((c) => c.id === selectedReceiptPayment.customerId);
    if (!cust) return undefined;
    return {
      customerCode: cust.id,
      gstin: cust.gstin,
      phone: cust.phone,
      address: cust.address ? `${cust.address}, ${cust.city}, ${cust.state}` : `${cust.city || 'Agra'}, Uttar Pradesh`,
    };
  }, [selectedReceiptPayment, customers]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-12 animate-in fade-in duration-150">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Finance & Payments' }]}
        title="Commercial Payments & Receivables"
        subtitle="Ledger settlements, overdue aging buckets, and digital payment receipts."
        actions={
          <>
            <Button
              variant="secondary"
              icon={Icons.Export}
              onClick={handleExportCSV}
            >
              Export Aging CSV
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
      <PaymentsKpiCards
        totalReceivables={`₹${(totalOutstanding / 100000).toFixed(2)}L`}
        receivablesCaption={`Across ${overdueCustomers.length} active wholesale stores`}
        dueThisWeek={`₹${(dueThisWeekAmount / 100000).toFixed(2)}L`}
        dueThisWeekCaption="Current billing cycle commitments"
        criticalAmount={`₹${(criticalAmount / 100000).toFixed(2)}L`}
        criticalCaption="Priority collection reminder queue"
        collectedThisMonth={`₹${(collectedThisMonth / 100000).toFixed(2)}L`}
        collectedCaption="MTD bank verified realizations"
      />

      {/* Tab Switcher */}
      <div className="flex items-center gap-3 border-b border-border/80 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('receivables')}
          className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'receivables'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 shadow-2xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Icons.Receivables size={17} className={activeTab === 'receivables' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'} />
          <span>Outstanding Accounts ({overdueCustomers.length})</span>
          {activeTab === 'receivables' && (
            <span className="absolute -bottom-1 left-3 right-3 h-[2px] bg-emerald-600 dark:bg-emerald-400 rounded-full" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 shadow-2xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Icons.Payments size={17} className={activeTab === 'payments' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'} />
          <span>Payment Receipts Ledger ({payments.length})</span>
          {activeTab === 'payments' && (
            <span className="absolute -bottom-1 left-3 right-3 h-[2px] bg-emerald-600 dark:bg-emerald-400 rounded-full" />
          )}
        </button>
      </div>

      {/* 3. TAB 1: Outstanding Accounts Table Panel */}
      {activeTab === 'receivables' && (
        <Panel
          title="Outstanding Accounts Requiring Settlement"
          subtitle="Retailers with pending commercial balances exceeding agreed credit cycle"
          headerAction={
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
              <Icons.Calendar size={14} className="text-muted-foreground" />
              Fiscal Cycle: {now.getFullYear()}–{now.getFullYear() + 1}
            </span>
          }
          noPadding
        >
          <div className="p-4 md:p-6 border-b border-border">
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
              title="All Buyer Accounts in Good Standing"
              description="No stores currently match the selected aging criteria or search filters."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store &amp; Proprietor</TableHead>
                  <TableHead>Phone / Contact</TableHead>
                  <TableHead>Overdue Aging</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Balance Due</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOverdue.map((cust) => (
                  <TableRow
                    key={cust.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => onNavigate(`/admin/customers/${cust.id}`)}
                  >
                    <TableCell>
                      <TableAvatarCell
                        name={cust.businessName}
                        subtext={`${cust.city}, ${cust.state} • ${cust.propName}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {cust.phone}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          (cust.overdueDays || 0) > 30
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                        }`}
                      >
                        {cust.overdueDays || 12} Days
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {cust.paymentTerms}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={(cust.overdueDays || 0) > 30 ? 'critical' : 'overdue'}>
                        {(cust.overdueDays || 0) > 30 ? 'Legal Queue' : 'Follow-up'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <TableMoneyCell
                        amount={cust.amountDue}
                        isBold
                        className="text-rose-600 dark:text-rose-400"
                      />
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Icons.Eye}
                          onClick={() => onNavigate(`/admin/customers/${cust.id}`)}
                        >
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>
      )}

      {/* 4. TAB 2: Payment Receipts Ledger Panel */}
      {activeTab === 'payments' && (
        <Panel
          title="Digital Payment Receipts &amp; Realizations"
          subtitle="Real-time collection log with official printable receipt slips"
          noPadding
        >
          <div className="p-4 md:p-6 border-b border-border">
            <FilterBar>
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                placeholder="Search receipt no, customer, UTR..."
                containerClassName="max-w-md"
              />
              <Select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                options={[
                  { label: 'All Payment Methods', value: 'all' },
                  { label: 'UPI / QR', value: 'UPI' },
                  { label: 'NEFT / RTGS', value: 'NEFT/RTGS' },
                  { label: 'Bank Cheque', value: 'Cheque' },
                  { label: 'Cash Handover', value: 'Cash' },
                ]}
              />
            </FilterBar>
          </div>

          {filteredPayments.length === 0 ? (
            <EmptyState
              icon={Icons.Payments}
              title="No Payment Records Found"
              description="No payments match your active filter criteria. Record a new payment to generate digital receipts."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Store &amp; City</TableHead>
                  <TableHead>Mode &amp; Reference</TableHead>
                  <TableHead>Collected By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount Realized</TableHead>
                  <TableHead className="text-right">Receipt Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((p) => {
                  const receiptStatus = mapPaymentStatusToReceiptStatus(p.status);
                  return (
                    <TableRow key={p.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono font-bold text-xs text-primary">
                        {p.receiptNumber || `SF-REC-${p.id.slice(-5)}`}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {p.paymentDate}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground text-xs">{p.customerName}</div>
                        <div className="text-[11px] text-muted-foreground">{p.customerCity || 'Agra'}</div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground text-xs block">{p.paymentMethod}</span>
                        <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[140px] block">
                          {p.utrRef || p.chequeNo || 'Direct'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {p.collectedBy || 'Sales Rep'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            receiptStatus === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : receiptStatus === 'Cheque Pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                              : receiptStatus === 'Reversed'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                              : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                          }`}
                        >
                          {receiptStatus}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <TableMoneyCell
                          amount={p.paymentAmount}
                          isBold
                          className="text-emerald-600 dark:text-emerald-400"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Icons.FileText}
                            onClick={() => setSelectedReceiptPayment(p)}
                            title="View official digital receipt"
                            className="text-xs"
                          >
                            Receipt
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Icons.Share}
                            onClick={() => handleCopyReceiptLink(p.id)}
                            title="Copy link to receipt"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Panel>
      )}

      {/* Standalone Receipt Preview Modal */}
      {selectedReceiptPayment && (
        <ReceiptPreviewModal
          open={Boolean(selectedReceiptPayment)}
          onClose={() => setSelectedReceiptPayment(null)}
          receipt={selectedReceiptPayment}
          customer={selectedReceiptCustomer}
          status={mapPaymentStatusToReceiptStatus(selectedReceiptPayment.status)}
        />
      )}
    </div>
  );
};
