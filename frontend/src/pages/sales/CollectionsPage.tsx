import React from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, Phone, MessageCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CollectionsPage: React.FC = () => {
  const { customers, setIsPaymentModalOpen, setSelectedCustomer, showToast, currentUser } = useApp();

  const assignedCusts = customers.filter(
    (c) => c.salespersonId === currentUser.id || c.salespersonName.includes(currentUser.name)
  );
  const overdueOnly = assignedCusts.filter((c) => c.amountDue > 0);
  const totalAssignedDue = overdueOnly.reduce((acc, c) => acc + c.amountDue, 0);

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto select-none pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200 inline-block">
            Territory Receivables
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            My Territory Collections &amp; Cheques
          </h1>
        </div>

        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <CreditCard className="w-4 h-4" />
          <span>Record Cheque / Payment</span>
        </button>
      </div>

      {/* Accounts List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900">
            Accounts with Pending Balance ({overdueOnly.length})
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {overdueOnly.map((cust) => (
            <div
              key={cust.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {cust.businessName}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                    {cust.overdueDays} Days Overdue
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prop: {cust.propName} • {cust.city}, {cust.state} • Phone: {cust.phone}
                </p>
                <p className="text-xs text-slate-600 mt-1.5 font-medium">
                  Terms: {cust.paymentTerms} • Last payment: ₹{(cust.lastPaymentAmount / 100000).toFixed(1)}L ({cust.lastPaymentDate})
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Amount Due
                  </span>
                  <span className="text-base font-black text-rose-700 font-mono">
                    ₹{cust.amountDue.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedCustomer(cust);
                      setIsPaymentModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    Collect Cheque
                  </button>
                  <a
                    href={`tel:${cust.phone}`}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
