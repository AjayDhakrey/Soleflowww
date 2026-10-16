import React from 'react';
import {
  CustomerUsers3D,
  ReceivablesWallet3D,
  OverdueWarning3D,
  ClearedShield3D,
} from '../dashboard/EntityKpi3DIcons';

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
  overdueAccounts,
  clearedAccounts,
  clearedGrowth = 12,
  onNavigateTotal,
  onNavigateReceivables,
  onNavigateOverdue,
  onNavigateCleared,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
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
        className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] select-none min-w-0"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 flex items-center justify-center shrink-0 border border-blue-100/60 dark:border-blue-900/40">
          <CustomerUsers3D className="w-12 h-12" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Total Customers
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest text-xs">•••</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-display">
              {typeof totalCustomers === 'number' ? totalCustomers.toLocaleString('en-IN') : totalCustomers}
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Clients
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Active accounts
            </span>
            {totalCustomersGrowth !== undefined && totalCustomersGrowth > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
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
        className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] select-none min-w-0"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 flex items-center justify-center shrink-0 border border-rose-100/60 dark:border-rose-900/40">
          <ReceivablesWallet3D className="w-12 h-12" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Total Receivables
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest text-xs">•••</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-display">
              {totalReceivables}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Ledger standing
            </span>
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
        className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] select-none min-w-0"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 flex items-center justify-center shrink-0 border border-amber-100/60 dark:border-amber-900/40">
          <OverdueWarning3D className="w-12 h-12" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Overdue Accounts
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest text-xs">•••</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-amber-500 dark:text-amber-400 font-display">
              {typeof overdueAccounts === 'number' ? overdueAccounts.toLocaleString('en-IN') : overdueAccounts}
            </span>
            <span className="text-sm font-bold text-amber-500 dark:text-amber-400">
              Stores
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Exceeded terms
            </span>
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
        className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] select-none min-w-0"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 flex items-center justify-center shrink-0 border border-emerald-100/60 dark:border-emerald-900/40">
          <ClearedShield3D className="w-12 h-12" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Cleared Accounts
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest text-xs">•••</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display">
              {typeof clearedAccounts === 'number' ? clearedAccounts.toLocaleString('en-IN') : clearedAccounts}
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Settled
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Zero balance
            </span>
            {clearedGrowth !== undefined && clearedGrowth > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
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
