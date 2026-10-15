import React from 'react';
import { Bell, Clock, AlertTriangle } from 'lucide-react';

interface NotificationKpiCardsProps {
  totalCount: number;
  unreadCount: number;
  criticalCount?: number | string;
}

export const NotificationKpiCards: React.FC<NotificationKpiCardsProps> = ({
  totalCount,
  unreadCount,
  criticalCount = 0,
}) => {
  const criticalDisplay = typeof criticalCount === 'number' ? `${criticalCount} Critical` : criticalCount;

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-5">
      {/* 1. Total Notifications */}
      <div className="group relative rounded-2xl p-2.5 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none min-w-0 overflow-hidden">
        <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[10px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Total
          </span>
          <div className="text-base sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 mt-0.5 font-display truncate">
            {totalCount}
          </div>
          <p className="text-[9px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate hidden xs:block">
            System logs
          </p>
        </div>
      </div>

      {/* 2. Unread Alerts */}
      <div className="group relative rounded-2xl p-2.5 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none min-w-0 overflow-hidden">
        <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4 sm:w-7 sm:h-7 text-amber-600 dark:text-amber-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[10px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Unread
          </span>
          <div className="text-base sm:text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 mt-0.5 font-display truncate">
            {unreadCount}
          </div>
          <p className="text-[9px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate hidden xs:block">
            {unreadCount > 0 ? 'Pending' : 'Clear'}
          </p>
        </div>
      </div>

      {/* 3. Urgent Action Required */}
      <div className="group relative rounded-2xl p-2.5 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none min-w-0 overflow-hidden">
        <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 sm:w-7 sm:h-7 text-rose-600 dark:text-rose-400" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[10px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Urgent
          </span>
          <div className="text-base sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 mt-0.5 font-display truncate">
            {criticalDisplay}
          </div>
          <p className="text-[9px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate hidden xs:block">
            Priority
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationKpiCards;
