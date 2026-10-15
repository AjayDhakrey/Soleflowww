import React from 'react';
import { Layers, Sparkles, TrendingUp, Check } from 'lucide-react';

interface DesignsKpiCardsProps {
  totalActiveModels: number;
  popularStylesCount: number;
  highMarginCount: number;
  selectedCount: number;
}

export const DesignsKpiCards: React.FC<DesignsKpiCardsProps> = ({
  totalActiveModels,
  popularStylesCount,
  highMarginCount,
  selectedCount,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
      {/* 1. Active Footwear Lines */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
          <Layers className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Active Footwear
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 font-display truncate">
              {totalActiveModels}
            </span>
            <span className="text-xs sm:text-base font-semibold text-blue-600 dark:text-blue-400 hidden xs:inline">
              Articles
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Catalog
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* 2. Fast-Moving Articles */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600 dark:text-emerald-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Fast-Moving
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-display truncate">
              {popularStylesCount}
            </span>
            <span className="text-xs sm:text-base font-semibold text-emerald-600 dark:text-emerald-400 hidden xs:inline">
              High Vol
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Top repeat
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              Top Sellers
            </span>
          </div>
        </div>
      </div>

      {/* 3. High Margin Styles */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            High Margin
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400 font-display truncate">
              {highMarginCount}
            </span>
            <span className="text-xs sm:text-base font-semibold text-purple-600 dark:text-purple-400 hidden xs:inline">
              Premium
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Retailer margin
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
              High ROI
            </span>
          </div>
        </div>
      </div>

      {/* 4. Lookbook Selection */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
          <Check className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600 dark:text-indigo-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Lookbook
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 font-display truncate">
              {selectedCount}
            </span>
            <span className="text-xs sm:text-base font-semibold text-indigo-600 dark:text-indigo-400 hidden xs:inline">
              Selected
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              1-tap share
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              {selectedCount > 0 ? 'Curated' : 'None'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignsKpiCards;
