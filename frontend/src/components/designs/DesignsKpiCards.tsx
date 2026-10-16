import React from 'react';
import {
  CatalogLayers3D,
  FastMovingBars3D,
  HighMarginCrown3D,
  LookbookOpen3D,
} from '../dashboard/EntityKpi3DIcons';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      {/* 1. Active Footwear */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none min-w-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 flex items-center justify-center shrink-0 border border-blue-100/60 dark:border-blue-900/40">
          <CatalogLayers3D className="w-12 h-12" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Active Footwear
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest text-xs">•••</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-display">
              {totalActiveModels}
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Articles
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Catalog
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 shrink-0">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* 2. Fast-Moving */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none min-w-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 flex items-center justify-center shrink-0 border border-emerald-100/60 dark:border-emerald-900/40">
          <FastMovingBars3D className="w-12 h-12" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Fast-Moving
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest text-xs">•••</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display">
              {popularStylesCount}
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              High Vol
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Top repeat
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
              Top Sellers
            </span>
          </div>
        </div>
      </div>

      {/* 3. High Margin */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none min-w-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/40 flex items-center justify-center shrink-0 border border-purple-100/60 dark:border-purple-900/40">
          <HighMarginCrown3D className="w-12 h-12" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              High Margin
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest text-xs">•••</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-display">
              {highMarginCount}
            </span>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
              Premium
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Retailer margin
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40 shrink-0">
              High ROI
            </span>
          </div>
        </div>
      </div>

      {/* 4. Lookbook */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none min-w-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 flex items-center justify-center shrink-0 border border-blue-100/60 dark:border-blue-900/40">
          <LookbookOpen3D className="w-12 h-12" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Lookbook
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest text-xs">•••</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-display">
              {selectedCount}
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Selected
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              1-tap share
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 shrink-0">
              {selectedCount > 0 ? 'Curated' : 'None'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignsKpiCards;
