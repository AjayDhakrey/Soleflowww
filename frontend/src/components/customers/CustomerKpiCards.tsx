import React from 'react';
import { Users, Wallet, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CustomerKpiCardsProps {
  totalCustomers: number | string;
  totalCustomersGrowth?: number;
  totalReceivables: string;
  totalReceivablesGrowth?: number;
  overdueAccounts: number | string;
  overdueGrowth?: number;
  clearedAccounts: number | string;
  clearedGrowth?: number;
  onNavigateTotal: () => void;
  onNavigateReceivables: () => void;
  onNavigateOverdue: () => void;
  onNavigateCleared: () => void;
}

export const CustomerKpiCards: React.FC<CustomerKpiCardsProps> = ({
  totalCustomers,
  totalCustomersGrowth = 30,
  totalReceivables,
  totalReceivablesGrowth = 0,
  overdueAccounts,
  overdueGrowth = 0,
  clearedAccounts,
  clearedGrowth = 12,
  onNavigateTotal,
  onNavigateReceivables,
  onNavigateOverdue,
  onNavigateCleared,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
      {/* 1. Total Customers */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateTotal}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigateTotal?.();
          }
        }}
        className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] select-none overflow-hidden min-w-0"
      >
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Total Customers
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 font-display truncate">
              {typeof totalCustomers === 'number' ? totalCustomers.toLocaleString('en-IN') : totalCustomers}
            </span>
            <span className="text-xs sm:text-base font-semibold text-blue-600 dark:text-blue-400 hidden xs:inline">
              Clients
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Active accounts
            </span>
            {totalCustomersGrowth !== undefined && totalCustomersGrowth > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] sm:text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                ↑ {totalCustomersGrowth}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Total Receivables */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateReceivables}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigateReceivables?.();
          }
        }}
        className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] select-none overflow-hidden min-w-0"
      >
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
          <Wallet className="w-5 h-5 sm:w-7 sm:h-7 text-rose-500 dark:text-rose-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Total Receivables
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display truncate">
              {totalReceivables}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Ledger standing
            </span>
            {totalReceivablesGrowth !== undefined && totalReceivablesGrowth > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] sm:text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
                {totalReceivablesGrowth}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Overdue Accounts */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateOverdue}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigateOverdue?.();
          }
        }}
        className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] select-none overflow-hidden min-w-0"
      >
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 sm:w-7 sm:h-7 text-amber-500 dark:text-amber-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Overdue Accounts
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-amber-500 dark:text-amber-400 font-display truncate">
              {typeof overdueAccounts === 'number' ? overdueAccounts.toLocaleString('en-IN') : overdueAccounts}
            </span>
            <span className="text-xs sm:text-base font-semibold text-amber-500 dark:text-amber-400 hidden xs:inline">
              Stores
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Exceeded terms
            </span>
            {overdueGrowth !== undefined && overdueGrowth > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] sm:text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                Action needed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Cleared Accounts */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateCleared}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigateCleared?.();
          }
        }}
        className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] select-none overflow-hidden min-w-0"
      >
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600 dark:text-emerald-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Cleared Accounts
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-display truncate">
              {typeof clearedAccounts === 'number' ? clearedAccounts.toLocaleString('en-IN') : clearedAccounts}
            </span>
            <span className="text-xs sm:text-base font-semibold text-emerald-600 dark:text-emerald-400 hidden xs:inline">
              Settled
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Zero balance
            </span>
            {clearedGrowth !== undefined && clearedGrowth > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] sm:text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                ↑ {clearedGrowth}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerKpiCards;
