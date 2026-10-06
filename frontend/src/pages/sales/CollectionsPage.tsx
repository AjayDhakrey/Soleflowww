import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useSalesmanCollections, useClearCheque, useBounceCheque } from '../../hooks/usePayments';
import { Icons } from '../../lib/icons';
import {
  PageHeader,
  KpiCard,
  Panel,
  FilterBar,
  SearchInput,
  Button,
  StatusBadge,
  Tag,
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
import { CollectionsKpiCards } from '../../components/sales/CollectionsKpiCards';
import { PaymentReceipt } from '../../types';
import {
  ReceiptPreviewModal,
  mapPaymentStatusToReceiptStatus,
} from '../../components/payments/ReceiptTemplate';

export const CollectionsPage: React.FC = () => {
  const { customers, payments, setIsPaymentModalOpen, setSelectedCustomer, currentUser, showToast } = useApp();
  const { data: serverCollections } = useSalesmanCollections();
  const clearChequeMutation = useClearCheque();
  const bounceChequeMutation = useBounceCheque();

  const [activeTab, setActiveTab] = useState<'pending' | 'cheques' | 'history'>('pending');
  const [search, setSearch] = useState('');
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentReceipt | null>(null);

  const isAdmin = currentUser.role === 'admin';

  // Assigned customers
  const assignedCusts = useMemo(() => {
    if (isAdmin) return customers;
    return customers.filter(
      (c) =>
        c.salespersonId === currentUser.id ||
        (c.salespersonName && c.salespersonName.toLowerCase().includes(currentUser.name.toLowerCase()))
    );
  }, [customers, currentUser, isAdmin]);

  const overdueOnly = useMemo(() => assignedCusts.filter((c) => (c.amountDue || 0) > 0), [assignedCusts]);
  const totalAssignedDue = useMemo(() => overdueOnly.reduce((acc, c) => acc + Number(c.amountDue || 0), 0), [overdueOnly]);

  // Real payment calculations for this month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const relevantPayments = useMemo(() => {
    if (isAdmin) return payments;
    return payments.filter(
      (p) =>
        p.collectedBy?.toLowerCase().includes(currentUser.name.toLowerCase()) ||
        assignedCusts.some((c) => c.id === p.customerId)
    );
  }, [payments, currentUser, assignedCusts, isAdmin]);

  const collectedThisMonth = useMemo(() => {
    return relevantPayments
      .filter((p) => {
        if (p.status === 'bounced' || p.status === 'reversed') return false;
        const pDate = new Date(p.paymentDate);
        return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + Number(p.paymentAmount || 0), 0);
  }, [relevantPayments, currentMonth, currentYear]);

  const pendingCheques = useMemo(() => {
    return relevantPayments.filter((p) => p.paymentMethod === 'Cheque' && (p.status === 'pending_clearance' || !p.status));
  }, [relevantPayments]);

  const chequesInClearingAmount = useMemo(() => {
    return pendingCheques.reduce((sum, p) => sum + Number(p.paymentAmount || 0), 0);
  }, [pendingCheques]);

  const filtered = useMemo(() => {
    return overdueOnly.filter(
      (c) =>
        c.businessName.toLowerCase().includes(search.toLowerCase()) ||
        c.city.toLowerCase().includes(search.toLowerCase()) ||
        c.propName.toLowerCase().includes(search.toLowerCase())
    );
  }, [overdueOnly, search]);

  const handleClearCheque = async (paymentId: string) => {
    try {
      await clearChequeMutation.mutateAsync(paymentId);
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
      showToast('Cheque marked as bounced. Alert dispatched.');
    } catch (err: any) {
      showToast(err?.message || 'Failed to bounce cheque');
    }
  };

  const handleShareWhatsApp = (p: typeof payments[0]) => {
    const cust = customers.find((c) => c.id === p.customerId);
    const phone = (cust?.phone || '').replace(/[^0-9]/g, '');
    if (!phone) {
      showToast('No phone number on file for this store.');
      return;
    }
    const phoneWithCode = phone.length === 10 ? `91${phone}` : phone;
    const msg = `*Payment Receipt — SoleFlow Footwear*\n\n` +
      `Receipt No: *${p.receiptNumber}*\n` +
      `Amount: *₹${Number(p.paymentAmount || 0).toLocaleString('en-IN')}*\n` +
      `Mode: *${p.paymentMethod}*\n` +
      `Date: ${p.paymentDate}\n` +
      `Remaining Due: *₹${Number(p.amountDueAfter || 0).toLocaleString('en-IN')}*\n\n` +
      `Thank you for your timely settlement!`;

    window.open(`https://wa.me/${phoneWithCode}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-12 animate-in fade-in duration-150">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: isAdmin ? '/admin/dashboard' : '/sales/dashboard' },
          { label: 'Collections' },
        ]}
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

      {/* 2. KPI Summary Row (3D Claymorphic Redesign) */}
      <CollectionsKpiCards
        totalAssignedDue={totalAssignedDue}
        pendingStoresCount={overdueOnly.length}
        collectedThisMonth={collectedThisMonth}
        chequesInClearingAmount={chequesInClearingAmount}
        pendingChequesCount={pendingCheques.length}
        onNavigatePending={() => setActiveTab('pending')}
        onNavigateOverdue={() => setActiveTab('pending')}
        onNavigateCollected={() => setActiveTab('history')}
        onNavigateCheques={() => setActiveTab('cheques')}
      />

      {/* 3. Tab Navigation & Content */}
      <Panel noPadding>
        <div className="p-4 md:p-6 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b sm:border-b-0 border-border pb-2 sm:pb-0">
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'pending'
                    ? 'bg-primary text-white shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span>Pending Balances</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-mono">
                  {filtered.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cheques')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'cheques'
                    ? 'bg-primary text-white shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span>Cheques in Clearing</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-mono">
                  {pendingCheques.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-primary text-white shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span>Realized Receipts</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-mono">
                  {relevantPayments.length}
                </span>
              </button>
            </div>

            {/* Date Tag */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
              <Icons.Calendar size={14} className="text-muted-foreground" />
              Today: {new Date().toISOString().split('T')[0]}
            </span>
          </div>

          {activeTab === 'pending' && (
            <FilterBar>
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                placeholder="Search store name, proprietor, city..."
                containerClassName="max-w-md"
              />
            </FilterBar>
          )}
        </div>

        {/* Tab 1: Pending Accounts */}
        {activeTab === 'pending' && (
          filtered.length === 0 ? (
            <EmptyState
              icon={Icons.Approved}
              title="All Territory Accounts Settled"
              description="No pending balances or overdue collections for your territory."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store &amp; Proprietor</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Overdue</TableHead>
                  <TableHead>Terms &amp; History</TableHead>
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
                    <TableCell className="font-mono text-muted-foreground">
                      {cust.phone}
                    </TableCell>
                    <TableCell>
                      {(cust.overdueDays || 0) > 0 ? (
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                          {cust.overdueDays} Days
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
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
                          className="p-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl inline-flex items-center transition-colors"
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
          )
        )}

        {/* Tab 2: Cheques in Clearing */}
        {activeTab === 'cheques' && (
          pendingCheques.length === 0 ? (
            <EmptyState
              icon={Icons.Collections}
              title="No Cheques in Transit"
              description="All submitted cheques have been cleared or realized."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Customer Store</TableHead>
                  <TableHead>Cheque Details</TableHead>
                  <TableHead>Realization Date</TableHead>
                  <TableHead className="text-right">Cheque Amount</TableHead>
                  <TableHead className="text-right">Clearing Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingCheques.map((chq) => (
                  <TableRow key={chq.id}>
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {chq.receiptNumber}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground block">{chq.customerName}</span>
                      <span className="text-xs text-muted-foreground">{chq.customerCity}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <span className="font-mono font-bold text-foreground">
                          {chq.chequeNo ? `#${chq.chequeNo}` : chq.utrRef}
                        </span>
                        <span className="text-muted-foreground block">
                          {chq.chequeBank || 'Bank Instrument'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {chq.paymentDate}
                    </TableCell>
                    <TableCell className="text-right">
                      <TableMoneyCell
                        amount={chq.paymentAmount}
                        isBold
                        className="text-amber-600 dark:text-amber-400"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Icons.Check}
                          onClick={() => handleClearCheque(chq.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Clear
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleBounceCheque(chq.id)}
                          className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          Bounce
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        )}

        {/* Tab 3: Realized Collections History */}
        {activeTab === 'history' && (
          relevantPayments.length === 0 ? (
            <EmptyState
              icon={Icons.Payments}
              title="No Payment History"
              description="No payments have been recorded for your territory yet."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Mode &amp; Ref</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relevantPayments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {p.receiptNumber}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground block">{p.customerName}</span>
                      <span className="text-xs text-muted-foreground">{p.customerCity}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <span className="font-bold text-foreground">{p.paymentMethod}</span>
                        <span className="text-muted-foreground block font-mono text-[11px] truncate max-w-[150px]">
                          {p.utrRef || p.chequeNo || 'Realized'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {p.paymentDate}
                    </TableCell>
                    <TableCell>
                      <StatusBadge variant={p.status === 'bounced' ? 'danger' : p.status === 'pending_clearance' ? 'warning' : 'success'}>
                        {p.status === 'pending_clearance' ? 'In Clearing' : p.status === 'bounced' ? 'Bounced' : 'Realized'}
                      </StatusBadge>
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
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptPayment(p)}
                          className="px-2 py-1 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-semibold border border-blue-200 dark:border-blue-900/40"
                          title="View Official Digital Receipt"
                        >
                          <Icons.FileText size={13} />
                          <span className="hidden sm:inline">Receipt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShareWhatsApp(p)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                          title="Send WhatsApp Receipt"
                        >
                          <Icons.Share size={15} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        )}
      </Panel>

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
              address: cust.address ? `${cust.address}, ${cust.city}, ${cust.state}` : `${cust.city || '—'}, Uttar Pradesh`,
            };
          })()}
          status={mapPaymentStatusToReceiptStatus(selectedReceiptPayment.status)}
        />
      )}
    </div>
  );
};
