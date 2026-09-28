import React, { useState } from 'react';
import { X, Check, CreditCard, Send, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RecordPaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    customers,
    selectedCustomer,
    recordPayment,
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
  const [paymentDate, setPaymentDate] = useState('2024-10-24');
  const [utrRef, setUtrRef] = useState('428901239841');
  const [sendSms, setSendSms] = useState(true);

  if (!isPaymentModalOpen) return null;

  const currentCust = customers.find((c) => c.id === selectedCustId) || customers[0];
  const beforeDue = currentCust ? currentCust.amountDue : 230000;
  const afterDue = Math.max(0, beforeDue - (paymentAmount || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  Record Customer Payment
                </h3>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsPaymentModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Step 1: Select Retailer */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              1. Select Retailer / Customer Shop
            </label>
            <select
              value={selectedCustId}
              onChange={(e) => setSelectedCustId(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} • {c.city} (₹{(c.amountDue / 100000).toFixed(2)}L Due)
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Target Invoice */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              2. Target Invoice / Consignment
            </label>
            <select
              value={targetOrder}
              onChange={(e) => setTargetOrder(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none"
            >
              <option value="ORD-0148">ORD-0148 (Summer Derby Lot - Still Due ₹1,60,000)</option>
              <option value="ORD-0145">ORD-0145 (Verona Derby & Runners - Overdue ₹2,30,000)</option>
              <option value="General On-Account">General On-Account Advance Settlement</option>
            </select>
          </div>

          {/* Step 3: Amount Received */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                3. Amount Received (₹)
              </label>
              <button
                type="button"
                onClick={() => setPaymentAmount(beforeDue > 0 ? beforeDue : 160000)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
              >
                Set Full ₹{beforeDue.toLocaleString('en-IN')}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                required
                className="w-full h-10 pl-8 pr-3 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Step 4: Payment Method */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              4. Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['UPI', 'Cash', 'NEFT/RTGS', 'Cheque'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    paymentMethod === method
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Step 5a & 5b: Date and UTR Ref */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                5a. Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                5b. UTR / Receipt Ref
              </label>
              <input
                type="text"
                value={utrRef}
                onChange={(e) => setUtrRef(e.target.value)}
                placeholder="e.g. 428901239841"
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Blue Callout: Instant Ledger Impact Preview */}
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-1">
              Instant Ledger Impact Preview
            </span>
            <div className="flex items-center justify-between text-xs font-bold text-blue-950">
              <span>Before: ₹{beforeDue.toLocaleString('en-IN')} due</span>
              <span>→</span>
              <span className={afterDue === 0 ? 'text-emerald-700' : 'text-blue-900'}>
                After: ₹{afterDue.toLocaleString('en-IN')} due
              </span>
            </div>
          </div>

          {/* Checkbox: Send SMS & WhatsApp */}
          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={sendSms}
              onChange={(e) => setSendSms(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="text-xs text-slate-700 leading-snug">
              Send Instant SMS &amp; WhatsApp Receipt to Registered Trader (
              <span className="font-mono font-semibold">{currentCust.phone}</span>)
            </span>
          </label>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Save Payment &amp; Send SMS Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
