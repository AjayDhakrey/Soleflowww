import React from 'react';
import { Wallet, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface CollectionsKpiCardsProps {
  totalAssignedDue: number;
  pendingStoresCount: number;
  collectedThisMonth: number;
  chequesInClearingAmount: number;
  pendingChequesCount: number;
  onNavigatePending?: () => void;
  onNavigateOverdue?: () => void;
  onNavigateCollected?: () => void;
  onNavigateCheques?: () => void;
}

export const CollectionsKpiCards: React.FC<CollectionsKpiCardsProps> = ({
  totalAssignedDue,
  pendingStoresCount,
  collectedThisMonth,
  chequesInClearingAmount,
  pendingChequesCount,
  onNavigatePending,
  onNavigateOverdue,
  onNavigateCollected,
  onNavigateCheques,
}) => {
  const formatLakh = (val: number) => `₹${(val / 100000).toFixed(2)}L`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
      {/* 1. Total Assigned Receivables */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigatePending}
        className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] select-none overflow-hidden min-w-0"
      >
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
          <Wallet className="w-5 h-5 sm:w-7 sm:h-7 text-rose-500 dark:text-rose-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Assigned Receivables
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display truncate">
              {formatLakh(totalAssignedDue)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Pending
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
              Outstanding
            </span>
          </div>
        </div>
      </div>

      {/* 2. Overdue Stores */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateOverdue}
        className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] select-none overflow-hidden min-w-0"
      >
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 sm:w-7 sm:h-7 text-amber-500 dark:text-amber-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Overdue Stores
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-amber-500 dark:text-amber-400 font-display truncate">
              {pendingStoresCount}
            </span>
            <span className="text-xs sm:text-base font-semibold text-amber-500 dark:text-amber-400 hidden xs:inline">
              Stores
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Credit terms
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
              Action
            </span>
          </div>
        </div>
      </div>

      {/* 3. Realized Collections MTD */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateCollected}
        className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] select-none overflow-hidden min-w-0"
      >
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600 dark:text-emerald-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Realized Collections
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-display truncate">
              {formatLakh(collectedThisMonth)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Bank cleared
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              MTD
            </span>
          </div>
        </div>
      </div>

      {/* 4. Cheques in Clearing */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateCheques}
        className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] select-none overflow-hidden min-w-0"
      >
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Cheques in Clearing
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400 font-display truncate">
              {formatLakh(chequesInClearingAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              {pendingChequesCount} in transit
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
              Clearing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionsKpiCards;
