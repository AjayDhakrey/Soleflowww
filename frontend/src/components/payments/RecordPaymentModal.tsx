import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import { Button } from '../ui/Button';
import { PaymentReceipt } from '../../types';
import { ReceiptPreviewModal, mapPaymentStatusToReceiptStatus } from './ReceiptTemplate';

export const RecordPaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    customers,
    selectedCustomer,
    orders,
    currentUser,
    recordPayment,
    showToast,
  } = useApp();

  const [selectedCustId, setSelectedCustId] = useState('');
  const [targetOrderId, setTargetOrderId] = useState<string>('auto_fifo');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'NEFT/RTGS' | 'Cheque'>('UPI');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [utrRef, setUtrRef] = useState('');
  const [chequeNo, setChequeNo] = useState('');
  const [chequeBank, setChequeBank] = useState('');
  const [chequeDate, setChequeDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [sendSms, setSendSms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Receipt State
  const [createdPayment, setCreatedPayment] = useState<PaymentReceipt | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Sync selected customer & reset fields on modal open
  useEffect(() => {
    if (isPaymentModalOpen) {
      setCreatedPayment(null);
      setIsPreviewModalOpen(false);
      const initialCust = selectedCustomer || customers.find((c) => c.amountDue > 0) || customers[0];
      if (initialCust) {
        setSelectedCustId(initialCust.id);
        const due = initialCust.amountDue || 0;
        setPaymentAmount(due > 0 ? due : 0);
      } else {
        setSelectedCustId('');
        setPaymentAmount(0);
      }
      setPaymentMethod('UPI');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setUtrRef('');
      setChequeNo('');
      setChequeBank('');
      setChequeDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setTargetOrderId('auto_fifo');
      setIsSubmitting(false);
    }
  }, [isPaymentModalOpen, selectedCustomer, customers]);

  if (!isPaymentModalOpen) return null;

  const currentCust = customers.find((c) => c.id === selectedCustId) || customers[0];
  const beforeDue = currentCust ? Number(currentCust.amountDue || 0) : 0;
  const payAmt = Number(paymentAmount) || 0;
  const afterDue = Math.max(0, beforeDue - payAmt);

  // Open orders for this customer
  const clientOrders = orders.filter(
    (o) => o.customerId === selectedCustId && (o.balanceDue || 0) > 0 && o.status !== 'Cancelled'
  );

  const handleSetQuickAmount = (type: 'full' | 'half' | number) => {
    if (type === 'full') {
      setPaymentAmount(beforeDue);
    } else if (type === 'half') {
      setPaymentAmount(Math.round(beforeDue / 2));
    } else {
      setPaymentAmount(type);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCust) return;

    if (payAmt <= 0) {
      showToast('Please enter a valid payment amount greater than zero.');
      return;
    }

    if (paymentMethod === 'Cheque') {
      if (!chequeNo.trim()) {
        showToast('Please enter the Cheque Number.');
        return;
      }
      if (!chequeBank.trim()) {
        showToast('Please enter the Cheque Bank Name.');
        return;
      }
    }

    if ((paymentMethod === 'UPI' || paymentMethod === 'NEFT/RTGS') && !utrRef.trim()) {
      showToast('Please provide a bank transaction reference or UTR.');
      return;
    }

    setIsSubmitting(true);

    try {
      const refString = paymentMethod === 'Cheque' ? `CHQ-${chequeNo} (${chequeBank})` : utrRef || 'Direct Transfer';

      // Receipt number & payment id are owned by the server (record_payment RPC
      // generates the receipt number) — send only the real collection fields.
      const newPayment: Partial<PaymentReceipt> = {
        customerId: currentCust.id,
        customerName: currentCust.businessName,
        customerCity: currentCust.city,
        orderId: targetOrderId !== 'auto_fifo' ? targetOrderId : undefined,
        amountDueBefore: beforeDue,
        paymentAmount: payAmt,
        amountDueAfter: afterDue,
        paymentDate: paymentDate,
        paymentMethod: paymentMethod,
        utrRef: refString,
        collectedBy: currentUser?.name || '',
        notes: notes ? `${notes} (Target: ${targetOrderId})` : `Settlement: ${targetOrderId}`,
        sentSms: sendSms,
        chequeNo: paymentMethod === 'Cheque' ? chequeNo : undefined,
        chequeBank: paymentMethod === 'Cheque' ? chequeBank : undefined,
        chequeDate: paymentMethod === 'Cheque' ? chequeDate : undefined,
        status: paymentMethod === 'Cheque' ? 'pending_clearance' : 'verified',
      };

      await recordPayment(newPayment);
      // Display snapshot: identifiers stay empty until the server assigns them.
      setCreatedPayment({ id: '', receiptNumber: '', ...newPayment } as PaymentReceipt);
    } catch (err: any) {
      showToast(err?.message || 'Failed to record payment entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!createdPayment || !currentCust) return;
    const phone = (currentCust.phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const receiptLink = `${window.location.origin}/receipts/${createdPayment.id}`;

    const msg = `*Payment Receipt — ShoeConnect*\n\n` +
      `Dear ${createdPayment.customerName},\n` +
      `We have received your payment of *₹${createdPayment.paymentAmount.toLocaleString('en-IN')}* via *${createdPayment.paymentMethod}* on ${createdPayment.paymentDate}.\n` +
      `Receipt No: *${createdPayment.receiptNumber}*\n` +
      `Ref / Instrument: ${createdPayment.utrRef || createdPayment.chequeNo || 'Realized'}\n` +
      `Remaining Outstanding Balance: *₹${createdPayment.amountDueAfter.toLocaleString('en-IN')}*\n\n` +
      `View official digital receipt:\n${receiptLink}\n\n` +
      `Thank you for your business!`;

    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const handlePrint = () => {
    if (!createdPayment) return;
    setIsPreviewModalOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150">
        <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-xl border border-border overflow-hidden">
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Icons.Payments size={20} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground tracking-tight">
                  {createdPayment ? 'Payment Realization Receipt' : 'Record Customer Payment'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {createdPayment ? 'Transaction completed and ledger balance adjusted' : 'Cheque, UPI, or NEFT bank realization entry'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
            >
              <Icons.Close size={18} strokeWidth={1.75} />
            </button>
          </div>

          {/* If Receipt Mode */}
          {createdPayment ? (
            <div className="p-6 space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/30 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Icons.Check size={24} strokeWidth={2.5} />
                </div>
                <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                  Payment Recorded Successfully
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Receipt #{createdPayment.receiptNumber || '—'} generated for {createdPayment.customerName}
                </p>
              </div>

              <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Realized:</span>
                  <span className="font-bold text-foreground text-sm font-display tabular-nums">₹{createdPayment.paymentAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="text-foreground">{createdPayment.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference / Instrument:</span>
                  <span className="text-foreground">{createdPayment.utrRef || createdPayment.chequeNo || 'Direct'}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-muted-foreground">Remaining Ledger Due:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">₹{createdPayment.amountDueAfter.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons: View Receipt, Print, Send on WhatsApp, Done */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Button
                    type="button"
                    variant="primary"
                    icon={Icons.FileText}
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    View Receipt
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    icon={Icons.Payments}
                    onClick={handlePrint}
                    className="w-full justify-center"
                  >
                    Print / PDF
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Button
                    type="button"
                    variant="secondary"
                    icon={Icons.Share}
                    onClick={handleShareWhatsApp}
                    className="w-full justify-center text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                  >
                    Send on WhatsApp
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="w-full justify-center"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Payment Form */
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Step 1: Select Retailer */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  1. Retailer Store Account
                </label>
                <select
                  value={selectedCustId}
                  onChange={(e) => {
                    setSelectedCustId(e.target.value);
                    const cust = customers.find((c) => c.id === e.target.value);
                    if (cust) {
                      setPaymentAmount(cust.amountDue || 0);
                    }
                  }}
                  className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.businessName} • {c.city} (Due: ₹{Number(c.amountDue || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Target Order / Allocation Mode */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  2. Target Invoice Allocation
                </label>
                <select
                  value={targetOrderId}
                  onChange={(e) => setTargetOrderId(e.target.value)}
                  className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer font-mono"
                >
                  <option value="auto_fifo">Auto-Allocate (FIFO across oldest unpaid orders)</option>
                  {clientOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} — Due: ₹{Number(o.balanceDue || 0).toLocaleString('en-IN')} ({o.status})
                    </option>
                  ))}
                  <option value="general_on_account">General On-Account Advance Settlement</option>
                </select>
              </div>

              {/* Step 3: Amount Received & Quick Presets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-foreground">
                    3. Amount Received (₹)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSetQuickAmount('full')}
                      className="text-xs px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-primary font-semibold cursor-pointer"
                    >
                      Full ₹{beforeDue.toLocaleString('en-IN')}
                    </button>
                    {beforeDue > 10000 && (
                      <button
                        type="button"
                        onClick={() => handleSetQuickAmount('half')}
                        className="text-xs px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground font-semibold cursor-pointer"
                      >
                        50%
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={paymentAmount || ''}
                    onChange={(e) => setPaymentAmount(Math.max(0, Number(e.target.value)))}
                    placeholder="Enter collection amount"
                    required
                    className="w-full h-12 pl-9 pr-4 text-base font-bold text-foreground bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                  />
                </div>
              </div>

              {/* Step 4: Mode and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="NEFT/RTGS">NEFT / RTGS Bank Transfer</option>
                    <option value="Cheque">Bank Clearing Cheque</option>
                    <option value="Cash">Cash Handover</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Realization Date
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                  />
                </div>
              </div>

              {/* Step 5: Method-Specific Fields */}
              {paymentMethod === 'Cheque' ? (
                <div className="space-y-3 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Icons.Collections size={14} />
                    <span>Cheque Clearing Details</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Cheque Number *</label>
                      <input
                        type="text"
                        required
                        value={chequeNo}
                        onChange={(e) => setChequeNo(e.target.value)}
                        placeholder="e.g. 004821"
                        className="w-full h-10 px-3 text-xs font-mono bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Bank Name *</label>
                      <input
                        type="text"
                        required
                        value={chequeBank}
                        onChange={(e) => setChequeBank(e.target.value)}
                        placeholder="e.g. HDFC Bank, Agra"
                        className="w-full h-10 px-3 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Cheque Maturity Date</label>
                    <input
                      type="date"
                      value={chequeDate}
                      onChange={(e) => setChequeDate(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-mono bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              ) : paymentMethod === 'Cash' ? (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Cash Handover Note / Field Collector
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Received by Rahul Sharma at shop"
                    className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Bank Reference / UTR Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={utrRef}
                    onChange={(e) => setUtrRef(e.target.value)}
                    placeholder="e.g. UTR-49102914801 / UPI-Ref-98214"
                    className="w-full h-12 px-4 text-base md:text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              )}

              {/* Live Impact Preview */}
              <div className="p-4 rounded-xl border border-border bg-muted/50 flex items-center justify-between text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Ledger Balance Before</span>
                  <span className="tabular-nums font-bold text-rose-600 dark:text-rose-400">₹{beforeDue.toLocaleString('en-IN')}</span>
                </div>
                <Icons.ChevronRight size={18} className="text-muted-foreground" />
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Remaining Due After</span>
                  <span className="tabular-nums font-bold text-emerald-600 dark:text-emerald-400">₹{afterDue.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* SMS / WhatsApp Toggle */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="sendSms"
                  checked={sendSms}
                  onChange={(e) => setSendSms(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                />
                <label htmlFor="sendSms" className="text-xs text-muted-foreground cursor-pointer">
                  Prepare instant digital receipt &amp; update live accounting ledgers
                </label>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsPaymentModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={Icons.Check}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Recording...' : 'Save Payment Entry'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Standalone Receipt Preview Modal */}
      {createdPayment && (
        <ReceiptPreviewModal
          open={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          receipt={createdPayment}
          customer={{
            customerCode: currentCust?.id,
            gstin: currentCust?.gstin,
            phone: currentCust?.phone,
            address: [currentCust?.address, currentCust?.city, currentCust?.state].filter(Boolean).join(', ') || undefined,
          }}
          status={mapPaymentStatusToReceiptStatus(createdPayment.status)}
        />
      )}
    </>
  );
};
