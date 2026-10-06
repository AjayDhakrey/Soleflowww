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
      address: cust.address ? `${cust.address}, ${cust.city}, ${cust.state}` : `${cust.city || '—'}, Uttar Pradesh`,
    };
  }, [selectedReceiptPayment, customers]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 w-full pb-24 md:pb-12 animate-in fade-in duration-150">
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
          className={`relative px-4 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'receivables'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 shadow-2xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Icons.Receivables size={18} className={activeTab === 'receivables' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'} />
          <span>Outstanding Accounts ({overdueCustomers.length})</span>
          {activeTab === 'receivables' && (
            <span className="absolute -bottom-1 left-3 right-3 h-[2px] bg-emerald-600 dark:bg-emerald-400 rounded-full" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`relative px-4 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 shadow-2xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Icons.Payments size={18} className={activeTab === 'payments' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'} />
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
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60">
                {filteredOverdue.length} Stores Overdue • ₹{(filteredOverdue.reduce((s, c) => s + Number(c.amountDue || 0), 0) / 100000).toFixed(2)}L
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                <Icons.Calendar size={14} className="text-muted-foreground" />
                Fiscal Cycle: {now.getFullYear()}–{now.getFullYear() + 1}
              </span>
            </div>
          }
          noPadding
          className="w-full shadow-sm"
        >
          <div className="p-4 md:p-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/30">
            <FilterBar>
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                placeholder="Search store name, proprietor, city, phone..."
                containerClassName="flex-1 max-w-lg"
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
            <div className="w-full overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-slate-100/60 dark:bg-slate-800/60">
                    <TableHead className="min-w-[280px] pl-6">Buyer Store &amp; Proprietor</TableHead>
                    <TableHead className="min-w-[180px]">Contact &amp; WhatsApp</TableHead>
                    <TableHead className="min-w-[150px]">Aging Period</TableHead>
                    <TableHead className="min-w-[190px]">Terms &amp; Credit Limit</TableHead>
                    <TableHead className="min-w-[140px]">Recovery Status</TableHead>
                    <TableHead className="min-w-[160px] text-right">Balance Due</TableHead>
                    <TableHead className="min-w-[200px] text-right pr-6">Direct Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOverdue.map((cust) => {
                    const isCritical = (cust.overdueDays || 0) > 30;
                    return (
                      <TableRow
                        key={cust.id}
                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                        onClick={() => onNavigate(`/admin/customers/${cust.id}`)}
                      >
                        <TableCell className="pl-6 py-4">
                          <TableAvatarCell
                            name={cust.businessName}
                            subtext={
                              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                <span>{cust.propName}</span>
                                <span>•</span>
                                <span className="font-medium text-slate-600 dark:text-slate-300">{cust.city}, {cust.state}</span>
                              </span>
                            }
                          />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-700 dark:text-slate-300 font-medium">
                              {cust.phone}
                            </span>
                            {cust.whatsapp && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`https://wa.me/${cust.whatsapp?.replace(/[^0-9]/g, '')}`, '_blank');
                                }}
                                className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                                title="Chat on WhatsApp"
                              >
                                <Icons.WhatsApp size={15} />
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          {(cust.overdueDays || 0) > 0 ? (
                            <span
                              className={`inline-flex items-center gap-1.5 font-mono font-bold text-xs px-2.5 py-1 rounded-lg ${
                                isCritical
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                              {cust.overdueDays} Days Overdue
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground font-mono">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                            {cust.paymentTerms}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Credit Limit: ₹{(cust.creditLimit || 0).toLocaleString('en-IN')}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <StatusBadge status={isCritical ? 'critical' : 'overdue'}>
                            {isCritical ? 'Legal Queue' : 'Follow-up'}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <div className="text-base font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                            ₹{(cust.amountDue || 0).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Total Billed: ₹{((cust.totalBusiness || 0) / 100000).toFixed(1)}L
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              icon={Icons.Payments}
                              onClick={() => {
                                setSelectedCustomer(cust);
                                setIsPaymentModalOpen(true);
                              }}
                              className="shadow-xs"
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
                    );
                  })}
                </TableBody>
              </Table>
              {/* Table Summary Footer */}
              <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-border flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div>
                  Showing <strong>{filteredOverdue.length}</strong> outstanding retail buyer accounts
                </div>
                <div className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
                  Total Outstanding: ₹{filteredOverdue.reduce((sum, c) => sum + Number(c.amountDue || 0), 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
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
            <div className="w-full overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-slate-100/60 dark:bg-slate-800/60">
                    <TableHead className="min-w-[160px] pl-6">Receipt #</TableHead>
                    <TableHead className="min-w-[130px]">Realization Date</TableHead>
                    <TableHead className="min-w-[240px]">Buyer Store &amp; City</TableHead>
                    <TableHead className="min-w-[190px]">Payment Mode &amp; Ref</TableHead>
                    <TableHead className="min-w-[150px]">Collected By</TableHead>
                    <TableHead className="min-w-[140px]">Settlement Status</TableHead>
                    <TableHead className="min-w-[160px] text-right">Amount Realized</TableHead>
                    <TableHead className="min-w-[160px] text-right pr-6">Receipt Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((p) => {
                    const receiptStatus = mapPaymentStatusToReceiptStatus(p.status);
                    return (
                      <TableRow key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <TableCell className="font-mono font-bold text-xs text-primary pl-6 py-4">
                          {p.receiptNumber || `SF-REC-${p.id.slice(-5)}`}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono py-4">
                          {p.paymentDate}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="font-semibold text-foreground text-sm">{p.customerName}</div>
                          <div className="text-xs text-muted-foreground">{p.customerCity || '—'}</div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="font-medium text-foreground text-xs block">{p.paymentMethod}</span>
                          <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[160px] block">
                            {p.utrRef || p.chequeNo || ''}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground py-4">
                          {p.collectedBy || '—'}
                        </TableCell>
                        <TableCell className="py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
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
                        <TableCell className="text-right py-4">
                          <TableMoneyCell
                            amount={p.paymentAmount}
                            isBold
                            className="text-emerald-600 dark:text-emerald-400 text-base"
                          />
                        </TableCell>
                        <TableCell className="text-right pr-6 py-4">
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
              {/* Table Summary Footer */}
              <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-border flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div>
                  Showing <strong>{filteredPayments.length}</strong> verified digital payment ledger entries
                </div>
                <div className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  Total Realized: ₹{filteredPayments.reduce((sum, p) => sum + Number(p.paymentAmount || 0), 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
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
