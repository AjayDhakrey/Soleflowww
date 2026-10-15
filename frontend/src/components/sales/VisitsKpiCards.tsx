import React from 'react';
import { MapPin, CheckCircle2, Clock, IndianRupee } from 'lucide-react';

interface VisitsKpiCardsProps {
  totalStopsCount: number;
  completedVisitsCount: number;
  pendingStopsCount: number;
  ordersBookedAmount: number | string;
}

export const VisitsKpiCards: React.FC<VisitsKpiCardsProps> = ({
  totalStopsCount,
  completedVisitsCount,
  pendingStopsCount,
  ordersBookedAmount,
}) => {
  const formatAmount = (val: number | string) => {
    if (typeof val === 'string') return val.startsWith('₹') ? val : `₹${val}`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
      {/* 1. Scheduled Stops */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Scheduled Stops
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 font-display truncate">
              {totalStopsCount}
            </span>
            <span className="text-xs sm:text-base font-semibold text-blue-600 dark:text-blue-400 hidden xs:inline">
              Stores
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Route plan
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
              Assigned
            </span>
          </div>
        </div>
      </div>

      {/* 2. Visits Completed */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600 dark:text-emerald-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Completed
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-display truncate">
              {completedVisitsCount}
            </span>
            <span className="text-xs sm:text-base font-semibold text-emerald-600 dark:text-emerald-400 hidden xs:inline">
              Visited
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Logged
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* 3. Pending Stops */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 sm:w-7 sm:h-7 text-amber-500 dark:text-amber-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Pending Stops
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-amber-500 dark:text-amber-400 font-display truncate">
              {pendingStopsCount}
            </span>
            <span className="text-xs sm:text-base font-semibold text-amber-500 dark:text-amber-400 hidden xs:inline">
              Left
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Awaiting
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
              Pending
            </span>
          </div>
        </div>
      </div>

      {/* 4. Spot Bookings */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center shrink-0">
          <IndianRupee className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Spot Bookings
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400 font-display truncate">
              {formatAmount(ordersBookedAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Order value
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
              Converted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitsKpiCards;
