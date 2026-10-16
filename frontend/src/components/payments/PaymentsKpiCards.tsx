import React from 'react';
import {
  ReceivablesWallet3D,
  DueCalendar3D,
  OverdueWarning3D,
  CollectedCash3D,
} from '../dashboard/EntityKpi3DIcons';

interface PaymentsKpiCardsProps {
  totalReceivables: string;
  receivablesCaption?: string;
  dueThisWeek: string;
  dueThisWeekCaption?: string;
  criticalAmount: string;
  criticalCaption?: string;
  collectedThisMonth: string;
  collectedCaption?: string;
}

export const PaymentsKpiCards: React.FC<PaymentsKpiCardsProps> = ({
  totalReceivables,
  receivablesCaption = 'Wholesale s...',
  dueThisWeek,
  dueThisWeekCaption = 'Commitments',
  criticalAmount,
  criticalCaption = 'Queue',
  collectedThisMonth,
  collectedCaption = 'Realized',
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4.5">
      {/* 1. Total Receivables */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 transition-all duration-200 bg-white dark:bg-card border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <ReceivablesWallet3D className="w-13 h-13 sm:w-14 sm:h-14 shrink-0" />
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 truncate">
              Total Receivables
            </span>
            <button
              type="button"
              className="text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 p-0.5 rounded transition-colors"
              title="More options"
            >
              <span className="text-sm font-black tracking-widest leading-none">•••</span>
            </button>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-display truncate">
              {totalReceivables}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {receivablesCaption}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-100/80 dark:border-rose-900/40 shrink-0">
              Outstanding
            </span>
          </div>
        </div>
      </div>

      {/* 2. Due This Week */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 transition-all duration-200 bg-white dark:bg-card border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <DueCalendar3D className="w-13 h-13 sm:w-14 sm:h-14 shrink-0" />
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 truncate">
              Due This Week
            </span>
            <button
              type="button"
              className="text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 p-0.5 rounded transition-colors"
              title="More options"
            >
              <span className="text-sm font-black tracking-widest leading-none">•••</span>
            </button>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-amber-500 dark:text-amber-400 font-display truncate">
              {dueThisWeek}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {dueThisWeekCaption}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-100/80 dark:border-amber-900/40 shrink-0">
              Upcoming
            </span>
          </div>
        </div>
      </div>

      {/* 3. Critical Overdue */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 transition-all duration-200 bg-white dark:bg-card border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <OverdueWarning3D className="w-13 h-13 sm:w-14 sm:h-14 shrink-0" />
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 truncate">
              Critical Overdue
            </span>
            <button
              type="button"
              className="text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 p-0.5 rounded transition-colors"
              title="More options"
            >
              <span className="text-sm font-black tracking-widest leading-none">•••</span>
            </button>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-red-600 dark:text-red-400 font-display truncate">
              {criticalAmount}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {criticalCaption}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border border-red-100/80 dark:border-red-900/40 shrink-0">
              &gt;30 Days
            </span>
          </div>
        </div>
      </div>

      {/* 4. Collected This Month */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 transition-all duration-200 bg-white dark:bg-card border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <CollectedCash3D className="w-13 h-13 sm:w-14 sm:h-14 shrink-0" />
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 truncate">
              Collected This Month
            </span>
            <button
              type="button"
              className="text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 p-0.5 rounded transition-colors"
              title="More options"
            >
              <span className="text-sm font-black tracking-widest leading-none">•••</span>
            </button>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-display truncate">
              {collectedThisMonth}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {collectedCaption}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-100/80 dark:border-emerald-900/40 shrink-0">
              MTD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsKpiCards;
