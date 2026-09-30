import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import { Button } from '../ui/Button';

export const RecordPaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    customers,
    selectedCustomer,
    recordPayment,
    showToast,
  } = useApp();

  const [selectedCustId, setSelectedCustId] = useState(
    selectedCustomer ? selectedCustomer.id : customers[0]?.id || ''
  );

  React.useEffect(() => {
    if (selectedCustomer) {
      setSelectedCustId(selectedCustomer.id);
      setPaymentAmount(Math.min(selectedCustomer.amountDue || 100000, 100000) || 50000);
    }
  }, [selectedCustomer, isPaymentModalOpen]);

  const [targetOrder, setTargetOrder] = useState('ORD-0148 (Summer Derby Lot - Still Due ₹1,60,000)');
  const [paymentAmount, setPaymentAmount] = useState(100000);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'NEFT/RTGS' | 'Cheque'>('UPI');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [utrRef, setUtrRef] = useState('428901239841');
  const [sendSms, setSendSms] = useState(true);

  if (!isPaymentModalOpen) return null;

  const currentCust = customers.find((c) => c.id === selectedCustId) || customers[0];
  const beforeDue = currentCust ? currentCust.amountDue : 230000;
  const afterDue = Math.max(0, beforeDue - (paymentAmount || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCust) return;

    recordPayment({
      customerId: currentCust.id,
      customerName: currentCust.businessName,
      customerCity: currentCust.city,
      orderNumber: 'ORD-0148',
      amountDueBefore: beforeDue,
      paymentAmount: Number(paymentAmount),
      amountDueAfter: afterDue,
      paymentDate: paymentDate,
      paymentMethod: paymentMethod,
      utrRef: utrRef || 'UPI/428901239841',
      notes: `Target: ${targetOrder}`,
      sentSms: sendSms,
    });

    showToast(`Payment of ₹${Number(paymentAmount).toLocaleString('en-IN')} recorded for ${currentCust.businessName}!`);
    setIsPaymentModalOpen(false);
  };

  return (
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
                Record Customer Payment
              </h3>
              <p className="text-xs text-muted-foreground">
                Cheque, UPI, or NEFT bank realization entry
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Select Retailer */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              1. Retailer Store Account
            </label>
            <select
              value={selectedCustId}
              onChange={(e) => setSelectedCustId(e.target.value)}
              className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} • {c.city} (Due: ₹{c.amountDue.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Target Order */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              2. Target Invoice / Consignment
            </label>
            <select
              value={targetOrder}
              onChange={(e) => setTargetOrder(e.target.value)}
              className="w-full h-12 px-4 text-sm bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <option value="ORD-0148">ORD-0148 (Summer Derby Lot - Due ₹1,60,000)</option>
              <option value="ORD-0145">ORD-0145 (Verona Derby & Runners - Due ₹2,30,000)</option>
              <option value="General On-Account">General On-Account Advance Settlement</option>
            </select>
          </div>

          {/* Step 3: Amount Received */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">
                3. Amount Received (₹)
              </label>
              <button
                type="button"
                onClick={() => setPaymentAmount(beforeDue > 0 ? beforeDue : 100000)}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Set Full ₹{beforeDue.toLocaleString('en-IN')}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                ₹
              </span>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                required
                className="w-full h-12 pl-9 pr-4 text-base font-bold text-foreground bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
              />
            </div>
          </div>

          {/* Step 4: Mode and Date */}
          <div className="grid grid-cols-2 gap-4">
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

          {/* Step 5: Reference / UTR */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Bank Reference / UTR / Cheque #
            </label>
            <input
              type="text"
              value={utrRef}
              onChange={(e) => setUtrRef(e.target.value)}
              placeholder="e.g. UTR-49102914801"
              className="w-full h-12 px-4 text-sm font-mono bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Live Impact Preview */}
          <div className="p-4 rounded-xl border border-border bg-muted/50 flex items-center justify-between text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Ledger Balance Before</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">₹{beforeDue.toLocaleString('en-IN')}</span>
            </div>
            <Icons.ChevronRight size={18} className="text-muted-foreground" />
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Remaining Due After</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{afterDue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* SMS Toggle */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="sendSms"
              checked={sendSms}
              onChange={(e) => setSendSms(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
            />
            <label htmlFor="sendSms" className="text-xs text-muted-foreground cursor-pointer">
              Send instant WhatsApp receipt &amp; SMS confirmation to proprietor
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Icons.Check}
            >
              Save Payment Entry
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
