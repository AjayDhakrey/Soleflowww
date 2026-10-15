import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useReceivables, useClearCheque, useBounceCheque } from '../../hooks/usePayments';
import { Icons } from '../../lib/icons';
import { Home } from 'lucide-react';
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
  initialAging?: string;
  initialTab?: 'receivables' | 'payments';
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({
  onNavigate,
  initialAging,
  initialTab,
}) => {
  const {
    customers,
    payments,
    setPayments,
    setIsPaymentModalOpen,
    setSelectedCustomer,
    salesTeam,
    currentUser,
    showToast,
  } = useApp();

  const { data: receivablesList } = useReceivables();
  const clearChequeMutation = useClearCheque();
  const bounceChequeMutation = useBounceCheque();

  const [activeTab, setActiveTab] = useState<'receivables' | 'payments'>(initialTab || 'receivables');
  const [search, setSearch] = useState('');
  const [salespersonFilter, setSalespersonFilter] = useState<string>('all');
  const [agingFilter, setAgingFilter] = useState<string>(() => {
    if (initialAging) {
      if (initialAging === '0-30') return '0-30';
      if (initialAging === '31-60') return '31-60';
      if (initialAging === '61-90') return '61-90';
      if (initialAging === '90+') return '90+';
      return initialAging;
    }
    return 'all';
  });
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  
  // Selected receipt for preview modal
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentReceipt | null>(null);

  // Sync initialAging or initialTab if passed dynamically
  React.useEffect(() => {
    if (initialAging) {
      setAgingFilter(initialAging);
      setActiveTab('receivables');
    }
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialAging, initialTab]);

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
    return customers
      .filter(
        (c) =>
          Number(c.amountDue || 0) > 0 &&
          (c.status === 'due_soon' || ((c.overdueDays || 0) >= 1 && (c.overdueDays || 0) <= 7))
      )
      .reduce((sum, c) => sum + Number(c.amountDue || 0), 0);
  }, [customers]);

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
        (c.businessName || '').toLowerCase().includes(q) ||
        (c.city || '').toLowerCase().includes(q) ||
        (c.propName || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.whatsapp || '').includes(q);

      const days = c.overdueDays || 0;
      const matchesAging =
        agingFilter === 'all'
          ? true
          : agingFilter === '0-30'
          ? days <= 30
          : agingFilter === '31-60'
          ? days > 30 && days <= 60
          : agingFilter === '61-90'
          ? days > 60 && days <= 90
          : agingFilter === '90+'
          ? days > 90
          : agingFilter === 'critical'
          ? days > 30
          : agingFilter === 'overdue'
          ? days > 15 && days <= 30
          : agingFilter === 'current'
          ? days <= 15
          : true;

      return matchesSearch && matchesAging;
    });
  }, [overdueCustomers, search, agingFilter]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        (p.customerName || '').toLowerCase().includes(q) ||
        (p.receiptNumber && p.receiptNumber.toLowerCase().includes(q)) ||
        (p.utrRef && p.utrRef.toLowerCase().includes(q)) ||
        (p.chequeNo && p.chequeNo.toLowerCase().includes(q)) ||
        (p.collectedBy && p.collectedBy.toLowerCase().includes(q)) ||
        (p.customerCity && p.customerCity.toLowerCase().includes(q)) ||
        p.id.toLowerCase().includes(q);

      const matchesMethod =
        paymentMethodFilter === 'all' || p.paymentMethod === paymentMethodFilter;

      const matchesSalesperson =
        salespersonFilter === 'all' ||
        (p.collectedBy && p.collectedBy.toLowerCase().includes(salespersonFilter.toLowerCase()));

      return matchesSearch && matchesMethod && matchesSalesperson;
    });
  }, [payments, search, paymentMethodFilter, salespersonFilter]);

  const handleClearCheque = async (paymentId: string) => {
    try {
      await clearChequeMutation.mutateAsync(paymentId);
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: 'verified' } : p))
      );
      showToast('Cheque payment cleared and ledger balance credited!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to clear cheque');
    }
  };

  const handleBounceCheque = async (paymentId: string) => {
    const reason = window.prompt('Reason for cheque dishonour:', 'Insufficient funds');
    if (reason === null) return;
    try {
      await bounceChequeMutation.mutateAsync({ paymentId, reason });
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId ? { ...p, status: 'bounced', notes: `${p.notes || ''} [Bounced: ${reason}]` } : p
        )
      );
      showToast('Cheque marked as bounced. Alert dispatched.');
    } catch (err: any) {
      showToast(err?.message || 'Failed to bounce cheque');
    }
  };

  const handleSendReminderWhatsApp = (cust: typeof customers[0]) => {
    const phone = (cust.whatsapp || cust.phone || '').replace(/[^0-9]/g, '');
    if (!phone) {
      showToast('No phone number on file for this retailer.');
      return;
    }
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const dueStr = Number(cust.amountDue || 0).toLocaleString('en-IN');
    const overdueDays = cust.overdueDays || 0;
    const msg = `*Payment Reminder — SoleFlow Footwear Wholesale*\n\n` +
      `Dear ${cust.propName || cust.businessName},\n` +
      `Greetings from SoleFlow. A friendly reminder regarding your outstanding commercial balance of *₹${dueStr}*` +
      (overdueDays > 0 ? ` (Overdue: ${overdueDays} days)` : '') + `.\n\n` +
      `Kindly settle the pending ledger balance or share the UTR / Cheque confirmation once transferred.\n\n` +
      `Thank you,\nAccounts Desk\nSoleFlow Wholesale ERP`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleExportCSV = () => {
    const headers = ['Customer ID', 'Store Name', 'Proprietor', 'City', 'Phone', 'Credit Limit', 'Overdue Days', 'Outstanding Due (INR)'];
    const rows = filteredOverdue.map((c) => [
      `"${c.id}"`,
      `"${(c.businessName || '').replace(/"/g, '""')}"`,
      `"${(c.propName || '').replace(/"/g, '""')}"`,
      `"${(c.city || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      c.creditLimit || 0,
      c.overdueDays || 0,
      c.amountDue || 0,
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
    <div className="p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 w-full pb-24 md:pb-12 animate-in fade-in duration-150">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium">
        <button
          type="button"
          onClick={() => onNavigate?.('/admin/dashboard')}
          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1.5"
        >
          <Home size={14} className="text-blue-600 dark:text-blue-400" />
          <span>Dashboard</span>
        </button>
        <span className="text-slate-400">/</span>
        <span className="text-slate-400 dark:text-slate-500 font-medium">
          Payments &amp; Receivables
        </span>
      </div>

      {/* 2. Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Payments &amp; Receivables</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-800">
              {activeTab === 'receivables' ? overdueCustomers.length : payments.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 mt-1 font-normal">
            Ledger settlements, overdue aging buckets, and digital payment receipts.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="justify-center px-3 sm:px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            <Icons.Export size={15} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="justify-center px-3 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span className="font-bold text-sm">₹</span>
            <span>Record Payment</span>
          </button>
        </div>
      </div>

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
      <div className="flex items-center gap-2 sm:gap-3 border-b border-border/80 pb-1 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('receivables')}
          className={`relative px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
            activeTab === 'receivables'
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300 font-bold border border-blue-100 dark:border-blue-900 shadow-2xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Icons.Receivables size={16} className={activeTab === 'receivables' ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'} />
          <span>Outstanding Accounts ({overdueCustomers.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`relative px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
            activeTab === 'payments'
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300 font-bold border border-blue-100 dark:border-blue-900 shadow-2xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Icons.Payments size={16} className={activeTab === 'payments' ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'} />
          <span>Payment Receipts ({payments.length})</span>
        </button>
      </div>

      {/* 3. TAB 1: Outstanding Accounts Table Panel */}
      {activeTab === 'receivables' && (
        <Panel
          title="Outstanding Accounts Requiring Settlement"
          subtitle="Retailers with pending commercial balances exceeding agreed credit cycle"
          headerAction={
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60">
                {filteredOverdue.length} Stores Overdue • ₹{(filteredOverdue.reduce((s, c) => s + Number(c.amountDue || 0), 0) / 100000).toFixed(2)}L
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                <Icons.Calendar size={14} className="text-muted-foreground" />
                Fiscal Cycle: {now.getFullYear()}–{now.getFullYear() + 1}
              </span>
            </div>
          }
          noPadding
          className="w-full shadow-sm"
        >
          <div className="p-3 sm:p-4 md:p-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/30">
            <FilterBar>
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                placeholder="Search store name, proprietor, city, phone..."
                containerClassName="w-full sm:flex-1 sm:max-w-lg"
              />
              <Select
                value={agingFilter}
                onChange={(e) => setAgingFilter(e.target.value)}
                options={[
                  { label: 'All Aging Buckets', value: 'all' },
                  { label: '0–30 Days (Current Cycle)', value: '0-30' },
                  { label: '31–60 Days (Aging)', value: '31-60' },
                  { label: '61–90 Days (Overdue)', value: '61-90' },
                  { label: '90+ Days (Critical)', value: '90+' },
                  { label: 'Due Soon / Current (≤ 15 Days)', value: 'current' },
                  { label: 'Moderate Overdue (16–30 Days)', value: 'overdue' },
                  { label: 'Critical Overdue (> 30 Days)', value: 'critical' },
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
            <>
              {/* MOBILE VIEW: Touch-friendly Outstanding Account Cards (md:hidden) */}
              <div className="md:hidden divide-y divide-border/60">
                {filteredOverdue.map((cust) => {
                  const isCritical = (cust.overdueDays || 0) > 30;
                  return (
                    <div
                      key={cust.id}
                      onClick={() => onNavigate(`/admin/customers/${cust.id}`)}
                      className="p-3.5 space-y-2.5 hover:bg-slate-50/75 dark:hover:bg-slate-800/40 active:bg-slate-100 dark:active:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {/* Top: Store Name + Overdue Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0 border border-border/80">
                            {cust.businessName ? cust.businessName.slice(0, 2).toUpperCase() : 'ST'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-foreground truncate leading-tight">
                              {cust.businessName}
                            </h4>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {cust.propName} • {cust.city}, {cust.state}
                            </p>
                          </div>
                        </div>
                        {(cust.overdueDays || 0) > 0 ? (
                          <span
                            className={`shrink-0 inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                              isCritical
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                            {cust.overdueDays}d overdue
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Current</span>
                        )}
                      </div>

                      {/* Row 2: Balance Due & Terms Info */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/60 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground block tracking-wider">
                            Balance Due
                          </span>
                          <span className="text-base font-extrabold text-rose-600 dark:text-rose-400 tabular-nums block font-display">
                            ₹{Number(cust.amountDue || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground block tracking-wider">
                            Credit Terms
                          </span>
                          <span className="text-xs font-semibold text-foreground truncate block mt-0.5">
                            {cust.paymentTerms || 'Net 30'}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono block">
                            Limit: ₹{((cust.creditLimit || 0) / 1000).toFixed(0)}k
                          </span>
                        </div>
                      </div>

                      {/* Row 3: Contact & Direct Action Buttons */}
                      <div className="flex items-center justify-between gap-2 pt-0.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-mono text-muted-foreground font-medium truncate">
                            {cust.phone}
                          </span>
                          {cust.whatsapp && (
                            <button
                              type="button"
                              onClick={() => handleSendReminderWhatsApp(cust)}
                              className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                              title="Send WhatsApp Payment Reminder"
                            >
                              <Icons.WhatsApp size={16} />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Icons.Payments}
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setIsPaymentModalOpen(true);
                            }}
                            className="py-1.5 px-3 text-xs shadow-xs"
                          >
                            Collect
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Icons.Eye}
                            onClick={() => onNavigate(`/admin/customers/${cust.id}`)}
                            className="py-1.5 px-2.5 text-xs"
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Mobile Summary Footer */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-border flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div>{filteredOverdue.length} stores</div>
                  <div className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    Total: ₹{filteredOverdue.reduce((sum, c) => sum + Number(c.amountDue || 0), 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* DESKTOP VIEW: Full Data Table (hidden md:block) */}
              <div className="hidden md:block w-full overflow-x-auto">
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
                                    handleSendReminderWhatsApp(cust);
                                  }}
                                  className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                                  title="Send WhatsApp Payment Reminder"
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
            </>
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
          <div className="p-3 sm:p-4 md:p-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/30">
            <FilterBar>
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                placeholder="Search receipt no, customer, UTR..."
                containerClassName="w-full sm:flex-1 sm:max-w-md"
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
              <Select
                value={salespersonFilter}
                onChange={(e) => setSalespersonFilter(e.target.value)}
                options={[
                  { label: 'All Collectors & Reps', value: 'all' },
                  ...salesTeam.map((s) => ({ label: `By: ${s.name}`, value: s.name })),
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
            <>
              {/* MOBILE VIEW: Touch-friendly Payment Receipt Cards (md:hidden) */}
              <div className="md:hidden divide-y divide-border/60">
                {filteredPayments.map((p) => {
                  const receiptStatus = mapPaymentStatusToReceiptStatus(p.status);
                  return (
                    <div
                      key={p.id}
                      className="p-3.5 space-y-2.5 hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Top: Receipt # + Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                              {p.receiptNumber || `SF-REC-${p.id.slice(-5)}`}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {p.paymentDate}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-foreground truncate mt-1">
                            {p.customerName}
                          </h4>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {p.customerCity || '—'} {p.collectedBy ? `• By ${p.collectedBy}` : ''}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
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
                      </div>

                      {/* Row 2: Method & Realized Amount */}
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-border/60">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground block tracking-wider">
                            Payment Method
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {p.paymentMethod}
                          </span>
                          {(p.utrRef || p.chequeNo) && (
                            <span className="text-[10px] text-muted-foreground font-mono block truncate max-w-[150px]">
                              {p.utrRef || p.chequeNo}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground block tracking-wider">
                            Realized
                          </span>
                          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-display tabular-nums block">
                            ₹{Number(p.paymentAmount || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Row 3: Action Buttons */}
                      <div className="flex items-center justify-end gap-1.5 pt-0.5 flex-wrap">
                        {p.status === 'pending_clearance' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleClearCheque(p.id)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition-colors inline-flex items-center gap-1"
                              title="Clear cheque into ledger"
                            >
                              <Icons.Check size={13} />
                              <span>Clear</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBounceCheque(p.id)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 rounded-lg text-xs font-semibold cursor-pointer border border-rose-200 dark:border-rose-900/40 transition-colors"
                              title="Mark cheque as bounced"
                            >
                              Bounce
                            </button>
                          </>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Icons.Share}
                          onClick={() => handleCopyReceiptLink(p.id)}
                          className="py-1.5 px-2.5 text-xs"
                          title="Copy receipt link"
                        >
                          Share
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Icons.FileText}
                          onClick={() => setSelectedReceiptPayment(p)}
                          className="py-1.5 px-3 text-xs"
                        >
                          View Receipt
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Mobile Summary Footer */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-border flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div>{filteredPayments.length} entries</div>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Total: ₹{filteredPayments.reduce((sum, p) => sum + Number(p.paymentAmount || 0), 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* DESKTOP VIEW: Full Data Table (hidden md:block) */}
              <div className="hidden md:block w-full overflow-x-auto">
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
                              {p.status === 'pending_clearance' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleClearCheque(p.id)}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition-colors inline-flex items-center gap-1"
                                    title="Clear cheque into ledger balance"
                                  >
                                    <Icons.Check size={12} />
                                    <span>Clear</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleBounceCheque(p.id)}
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-rose-200 dark:border-rose-900/40"
                                    title="Mark cheque as bounced"
                                  >
                                    Bounce
                                  </button>
                                </>
                              )}
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
            </>
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
