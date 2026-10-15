import React from 'react';
import { ShoppingBag, CheckCircle2, AlertTriangle, CreditCard } from 'lucide-react';

interface CustomerProfileKpiCardsProps {
  lifetimeBusiness: string;
  lifetimeCaption?: string;
  totalPaid: string;
  paidCaption?: string;
  outstandingDue: string;
  isOverdue?: boolean;
  isCleared?: boolean;
  dueCaption?: string;
  creditLimit: string;
  limitUsage: number;
  paymentTerms?: string;
}

export const CustomerProfileKpiCards: React.FC<CustomerProfileKpiCardsProps> = ({
  lifetimeBusiness,
  lifetimeCaption = 'Wholesale consignments',
  totalPaid,
  paidCaption = 'Cheques & bank deposits',
  outstandingDue,
  isOverdue = false,
  isCleared = false,
  dueCaption = 'Ledger standing',
  creditLimit,
  limitUsage,
  paymentTerms = 'Not set',
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
      {/* 1. Lifetime Business */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
          <ShoppingBag className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate" title="Lifetime Business">
            Lifetime Business
          </span>
          <div className="text-lg sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 mt-0.5 font-display truncate" title={lifetimeBusiness}>
            {lifetimeBusiness}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title={lifetimeCaption}>
            {lifetimeCaption}
          </p>
        </div>
      </div>

      {/* 2. Total Realized */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600 dark:text-emerald-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate" title="Total Realized">
            Total Realized
          </span>
          <div className="text-lg sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 font-display truncate" title={totalPaid}>
            {totalPaid}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title={paidCaption}>
            {paidCaption}
          </p>
        </div>
      </div>

      {/* 3. Outstanding Due */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <div className={`w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
          isOverdue 
            ? 'bg-rose-50 dark:bg-rose-950/60' 
            : isCleared 
            ? 'bg-emerald-50 dark:bg-emerald-950/60' 
            : 'bg-amber-50 dark:bg-amber-950/60'
        }`}>
          <AlertTriangle className={`w-5 h-5 sm:w-7 sm:h-7 ${
            isOverdue 
              ? 'text-rose-600 dark:text-rose-400' 
              : isCleared 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-amber-600 dark:text-amber-400'
          }`} strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate" title="Outstanding Due">
            Outstanding Due
          </span>
          <div
            className={`text-lg sm:text-2xl font-bold tracking-tight mt-0.5 font-display truncate ${
              isOverdue
                ? 'text-rose-600 dark:text-rose-400'
                : isCleared
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
            title={outstandingDue}
          >
            {outstandingDue}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title={dueCaption}>
            {dueCaption}
          </p>
        </div>
      </div>

      {/* 4. Credit Limit Usage */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center shrink-0">
          <CreditCard className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate" title="Credit Limit Usage">
              Credit Usage
            </span>
            <span className={`text-[9px] sm:text-xs font-bold font-mono px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded-md shrink-0 ${
              limitUsage > 100
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                : limitUsage >= 80
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
            }`}>
              {limitUsage}%
            </span>
          </div>
          <div className="w-full h-1 sm:h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden my-0.5 sm:my-1.5">
            <div
              style={{ width: `${Math.min(limitUsage, 100)}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                limitUsage > 100 ? 'bg-rose-500' : limitUsage >= 80 ? 'bg-amber-500' : 'bg-purple-500'
              }`}
            />
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal truncate" title={`Limit: ${creditLimit} • ${paymentTerms}`}>
            Limit: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{creditLimit}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileKpiCards;
