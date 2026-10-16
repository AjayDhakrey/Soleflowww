import React from 'react';
import {
  FieldForce3D,
  TrendingArrow3D,
  IncentivesWallet3D,
  VisitsPin3D,
} from '../dashboard/EntityKpi3DIcons';

interface SalesTeamKpiCardsProps {
  totalReps: number;
  repsCaption?: string;
  repsGrowth?: string;
  totalBooked: number;
  targetAmount: number;
  bookedGrowth?: string;
  commissionAccrued: number;
  commissionCaption?: string;
  commissionGrowth?: string;
  visitsDone: number;
  visitsGoal: number;
  visitsCompletionPct: number;
}

export const SalesTeamKpiCards: React.FC<SalesTeamKpiCardsProps> = ({
  totalReps,
  totalBooked,
  targetAmount,
  commissionAccrued,
  visitsDone,
  visitsGoal,
  visitsCompletionPct,
}) => {
  const formatLakh = (val: number) => `₹${(val / 100000).toFixed(2)}L`;
  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;
  const targetPct = targetAmount > 0 ? Math.min(100, Math.round((totalBooked / targetAmount) * 100)) : 46;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      {/* 1. Field Force */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none min-w-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 flex items-center justify-center shrink-0 border border-blue-100/60 dark:border-blue-900/40">
          <FieldForce3D className="w-12 h-12" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Field Force
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest text-xs">•••</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-display">
              {totalReps}
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Reps
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Territory
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* 2. Booked MTD */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none min-w-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 flex items-center justify-center shrink-0 border border-emerald-100/60 dark:border-emerald-900/40">
          <TrendingArrow3D className="w-12 h-12" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Booked MTD
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest text-xs">•••</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1 truncate">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-display truncate">
              {formatLakh(totalBooked || 2150000)}
            </span>
            <span className="text-xs text-slate-400 font-medium shrink-0">
              / {formatLakh(targetAmount || 4700000)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Quota
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
              {targetPct}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. Field Incentives */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none min-w-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/40 flex items-center justify-center shrink-0 border border-purple-100/60 dark:border-purple-900/40">
          <IncentivesWallet3D className="w-12 h-12" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Field Incentives
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest text-xs">•••</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-display">
              {formatINR(commissionAccrued || 54110)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Commission
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40 shrink-0">
              Accrued
            </span>
          </div>
        </div>
      </div>

      {/* 4. Visits Today */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none min-w-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/40 flex items-center justify-center shrink-0 border border-blue-100/60 dark:border-blue-900/40">
          <VisitsPin3D className="w-12 h-12" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Visits Today
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest text-xs">•••</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-display">
              {visitsDone} <span className="text-sm font-normal text-slate-400">/{visitsGoal}</span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Store coverage
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 shrink-0">
              {visitsCompletionPct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesTeamKpiCards;
