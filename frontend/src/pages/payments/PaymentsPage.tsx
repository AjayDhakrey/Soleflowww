import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

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

  const [search, setSearch] = useState('');

  const totalOutstanding = customers.reduce((sum, c) => sum + (c.amountDue || 0), 0);
  const overdueCustomers = customers.filter((c) => c.amountDue > 0);

  const filteredOverdue = overdueCustomers.filter(
    (c) =>
      c.businessName.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.propName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto select-none pb-20 md:pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 inline-block">
            Commercial Ledger
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Payments &amp; Amount Due Ledger
          </h1>
        </div>

        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <CreditCard className="w-4 h-4" />
          <span>Record Customer Payment</span>
        </button>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-rose-50/70 p-4 rounded-3xl border border-rose-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
            TOTAL RECEIVABLES DUE
          </span>
          <span className="text-2xl font-black text-rose-700 font-display block mt-1">
            ₹{(totalOutstanding / 100000).toFixed(2)} Lakhs
          </span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            OVERDUE (&gt; 14 DAYS)
          </span>
          <span className="text-2xl font-black text-slate-900 font-display block mt-1">
            ₹3.45 Lakhs
          </span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            COLLECTED THIS MONTH
          </span>
          <span className="text-2xl font-black text-emerald-700 font-display block mt-1">
            ₹21.40 Lakhs
          </span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            PAYMENTS TODAY
          </span>
          <span className="text-2xl font-black text-blue-700 font-display block mt-1">
            ₹1.45 Lakhs
          </span>
        </div>
      </div>

      {/* 3. Overdue Accounts Action Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="p-5 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-extrabold text-slate-900">
            Outstanding Accounts Requiring Settlement
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search store name..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-5">Customer Account</th>
                <th className="py-3 px-4">Market / City</th>
                <th className="py-3 px-4">Credit Terms</th>
                <th className="py-3 px-4">Overdue Days</th>
                <th className="py-3 px-4">Amount Due</th>
                <th className="py-3 px-4">Last Payment</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOverdue.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5">
                    <span className="font-bold text-slate-900 block">
                      {cust.businessName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Prop: {cust.propName} • {cust.phone}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {cust.city}, {cust.state}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {cust.paymentTerms}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cust.overdueDays > 10
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {cust.overdueDays} Days
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-rose-700">
                    ₹{cust.amountDue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">
                    ₹{(cust.lastPaymentAmount / 100000).toFixed(1)}L ({cust.lastPaymentDate})
                  </td>
                  <td className="py-3.5 px-5 text-right space-x-1.5">
                    <button
                      onClick={() => {
                        setSelectedCustomer(cust);
                        setIsPaymentModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs"
                    >
                      Record Payment
                    </button>
                    <button
                      onClick={() => {
                        showToast(`WhatsApp payment reminder dispatched to ${cust.phone}`);
                      }}
                      className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg inline-flex items-center"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Recent Recorded Receipts Log */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">
            Recent Payment Receipts Log ({payments.length > 0 ? payments.length : 3})
          </h3>
        </div>

        <div className="space-y-2">
          {payments.length > 0 ? (
            payments.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">
                      {p.receiptNumber}
                    </span>
                    <span className="font-bold text-slate-800">
                      {p.customerName} ({p.customerCity})
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                      {p.paymentMethod}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    Ref: {p.utrRef} • Collected by {p.collectedBy}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-emerald-700 font-mono block">
                    +₹{p.paymentAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {p.paymentDate}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
              Latest: ₹1,00,000 received from ABC Footwear via HDFC Bank Transfer (Ref: HDFC99823614) on 28 Sep.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
