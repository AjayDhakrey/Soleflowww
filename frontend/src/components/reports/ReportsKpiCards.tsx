import React from 'react';
import {
  TurnoverChart3D,
  GrossMarginPercent3D,
  Storefront3D,
  PendingClock3D,
} from '../dashboard/EntityKpi3DIcons';

interface ReportsKpiCardsProps {
  totalRevenue: string;
  revenueCaption?: string;
  avgMargin: string;
  marginCaption?: string;
  activeOutlets: string;
  outletsCaption?: string;
  pendingRequests: string;
  requestsCaption?: string;
  onRequestsClick?: () => void;
}

export const ReportsKpiCards: React.FC<ReportsKpiCardsProps> = ({
  totalRevenue,
  revenueCaption = 'Turnover',
  avgMargin,
  marginCaption = 'Markup',
  activeOutlets,
  outletsCaption = 'Stores',
  pendingRequests,
  requestsCaption = 'Approval',
  onRequestsClick,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4.5">
      {/* 1. Booked Turnover */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 transition-all duration-200 bg-white dark:bg-card border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <TurnoverChart3D className="w-13 h-13 sm:w-14 sm:h-14 shrink-0" />
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 truncate">
              Booked Turnover
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
            <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400 font-display truncate">
              {totalRevenue}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {revenueCaption}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100/80 dark:border-blue-900/40 shrink-0">
              MTD
            </span>
          </div>
        </div>
      </div>

      {/* 2. Blended Gross Margin */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 transition-all duration-200 bg-white dark:bg-card border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <GrossMarginPercent3D className="w-13 h-13 sm:w-14 sm:h-14 shrink-0" />
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 truncate">
              Gross Margin
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
            <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 font-display truncate">
              {avgMargin}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {marginCaption}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-100/80 dark:border-emerald-900/40 shrink-0">
              Profit
            </span>
          </div>
        </div>
      </div>

      {/* 3. Active Retail Outlets */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 transition-all duration-200 bg-white dark:bg-card border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <Storefront3D className="w-13 h-13 sm:w-14 sm:h-14 shrink-0" />
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 truncate">
              Retail Outlets
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
            <span className="text-xl sm:text-2xl font-black tracking-tight text-purple-600 dark:text-purple-400 font-display truncate">
              {activeOutlets}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {outletsCaption}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-100/80 dark:border-purple-900/40 shrink-0">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* 4. Requests */}
      <div
        role={onRequestsClick ? 'button' : undefined}
        tabIndex={onRequestsClick ? 0 : undefined}
        onClick={onRequestsClick}
        className={`group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 transition-all duration-200 bg-white dark:bg-card border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0 ${
          onRequestsClick ? 'cursor-pointer active:scale-[0.98]' : ''
        }`}
      >
        <PendingClock3D className="w-13 h-13 sm:w-14 sm:h-14 shrink-0" />
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 truncate">
              Requests
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
              {pendingRequests}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {requestsCaption}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-100/80 dark:border-amber-900/40 shrink-0">
              Review
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsKpiCards;
