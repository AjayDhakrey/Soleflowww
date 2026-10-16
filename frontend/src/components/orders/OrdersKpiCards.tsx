import React from 'react';
import {
  TotalOrders3D,
  FactoryPlant3D,
  DispatchTruck3D,
  RupeePipeline3D,
} from '../dashboard/EntityKpi3DIcons';

interface OrdersKpiCardsProps {
  totalOrdersCount: number;
  inProductionCount: number;
  readyDispatchCount: number;
  totalConsignmentValue: number | string;
  onNavigateAll?: () => void;
  onNavigateProduction?: () => void;
  onNavigateDispatch?: () => void;
  onNavigateValue?: () => void;
}

export const OrdersKpiCards: React.FC<OrdersKpiCardsProps> = ({
  totalOrdersCount,
  inProductionCount,
  readyDispatchCount,
  totalConsignmentValue,
  onNavigateAll,
  onNavigateProduction,
  onNavigateDispatch,
  onNavigateValue,
}) => {
  const formatINR = (val: number | string) => {
    if (typeof val === 'string') return val.startsWith('₹') ? val : `₹${val}`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      {/* 1. Total Orders */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateAll}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigateAll?.();
          }
        }}
        className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] select-none min-w-0"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 flex items-center justify-center shrink-0 border border-blue-100/60 dark:border-blue-900/40">
          <TotalOrders3D className="w-12 h-12" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Total Orders
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest text-xs">•••</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-display">
              {totalOrdersCount}
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Orders
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Wholesale bookings
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 shrink-0">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* 2. In Production */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateProduction}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigateProduction?.();
          }
        }}
        className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] select-none min-w-0"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/40 flex items-center justify-center shrink-0 border border-purple-100/60 dark:border-purple-900/40">
          <FactoryPlant3D className="w-12 h-12" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              In Production
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest text-xs">•••</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-display">
              {inProductionCount}
            </span>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
              Batches
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Factory floor
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40 shrink-0">
              In Plant
            </span>
          </div>
        </div>
      </div>

      {/* 3. Ready to Dispatch */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateDispatch}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigateDispatch?.();
          }
        }}
        className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] select-none min-w-0"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 flex items-center justify-center shrink-0 border border-amber-100/60 dark:border-amber-900/40">
          <DispatchTruck3D className="w-12 h-12" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Ready to Dispatch
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest text-xs">•••</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-amber-500 dark:text-amber-400 font-display">
              {readyDispatchCount}
            </span>
            <span className="text-sm font-bold text-amber-500 dark:text-amber-400">
              Consignments
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              QC checked
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 shrink-0">
              Ready
            </span>
          </div>
        </div>
      </div>

      {/* 4. Consignment Value */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigateValue?.();
          }
        }}
        className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] select-none min-w-0"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 flex items-center justify-center shrink-0 border border-emerald-100/60 dark:border-emerald-900/40">
          <RupeePipeline3D className="w-12 h-12" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              Consignment Value
            </span>
            <span className="text-slate-300 dark:text-slate-600 font-bold tracking-widest text-xs">•••</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-display">
              {formatINR(totalConsignmentValue)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 text-xs">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Net pipeline
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
              Wholesale
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersKpiCards;
