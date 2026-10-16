import React from 'react';
import {
  FactoryFoundry3D,
  CapacityBoxes3D,
  OnTimeClock3D,
  QcShield3D,
} from '../dashboard/EntityKpi3DIcons';

interface ManufacturersKpiCardsProps {
  totalUnitsCount?: number | string;
  cumulativeCapacity?: string;
  onTimeRate?: string;
  qcPassRate?: string;
}

export const ManufacturersKpiCards: React.FC<ManufacturersKpiCardsProps> = ({
  totalUnitsCount = 4,
  cumulativeCapacity = '70,000 Prs/...',
  onTimeRate = '95.8%',
  qcPassRate = '98.3%',
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4.5">
      {/* 1. Partner Foundries */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 transition-all duration-200 bg-white dark:bg-card border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <FactoryFoundry3D className="w-13 h-13 sm:w-14 sm:h-14 shrink-0" />
        <div className="flex-1 min-w-0 w-full">
          <span className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Foundries
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400 font-display truncate">
              {totalUnitsCount}
            </span>
            <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
              Plants
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Lines
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100/80 dark:border-blue-900/40 shrink-0">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* 2. Cumulative Capacity */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 transition-all duration-200 bg-white dark:bg-card border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <CapacityBoxes3D className="w-13 h-13 sm:w-14 sm:h-14 shrink-0" />
        <div className="flex-1 min-w-0 w-full">
          <span className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Capacity
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-purple-600 dark:text-purple-400 font-display truncate">
              {cumulativeCapacity}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Monthly
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-100/80 dark:border-purple-900/40 shrink-0">
              Scale
            </span>
          </div>
        </div>
      </div>

      {/* 3. On-Time Rate */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 transition-all duration-200 bg-white dark:bg-card border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <OnTimeClock3D className="w-13 h-13 sm:w-14 sm:h-14 shrink-0" />
        <div className="flex-1 min-w-0 w-full">
          <span className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            On-Time
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 font-display truncate">
              {onTimeRate}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Compliance
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-100/80 dark:border-emerald-900/40 shrink-0">
              Reliable
            </span>
          </div>
        </div>
      </div>

      {/* 4. QC Pass Rate */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 transition-all duration-200 bg-white dark:bg-card border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <QcShield3D className="w-13 h-13 sm:w-14 sm:h-14 shrink-0" />
        <div className="flex-1 min-w-0 w-full">
          <span className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            QC Pass Rate
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-teal-600 dark:text-teal-400 font-display truncate">
              {qcPassRate}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Defect limit
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 border border-teal-100/80 dark:border-teal-900/40 shrink-0">
              Certified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturersKpiCards;
