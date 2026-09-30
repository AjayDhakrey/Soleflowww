import React from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import {
  PageHeader,
  KpiCard,
  Panel,
  Button,
  EmptyState,
} from '../../components/ui';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto pb-24 md:pb-12">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/sales/dashboard' }, { label: 'Notifications' }]}
        title="Notifications & Trade Alerts"
        subtitle="Real-time notifications for factory dispatch delays, overdue receivables, and order approvals."
      />

      {/* 2. KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <KpiCard
          label="Total Notifications"
          value={`${notifications.length}`}
          icon={Icons.Notifications}
          bubbleColor="zinc"
          caption="System & trade logs"
        />
        <KpiCard
          label="Unread Alerts"
          value={`${unreadCount}`}
          icon={Icons.Pending}
          bubbleColor="amber"
          caption="Pending review"
        />
        <KpiCard
          label="Urgent Action Required"
          value="1 Critical"
          icon={Icons.Overdue}
          bubbleColor="red"
          caption="Overdue ledger alert"
        />
      </div>

      {/* 3. Notifications List Panel */}
      <Panel
        title="All System Alerts"
        subtitle="Click any notification to acknowledge and mark as read"
        noPadding
      >
        {notifications.length === 0 ? (
          <EmptyState
            icon={Icons.Notifications}
            title="No Notifications"
            description="You have no notifications or pending system alerts at this time."
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-5 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                  !n.read ? 'bg-zinc-100/60 dark:bg-zinc-800/40' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    n.category === 'alert'
                      ? 'bg-red-50 dark:bg-red-950/50 text-red-600'
                      : n.category === 'factory'
                      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  {n.category === 'alert' ? (
                    <Icons.Overdue size={20} strokeWidth={1.75} />
                  ) : n.category === 'factory' ? (
                    <Icons.Manufacturers size={20} strokeWidth={1.75} />
                  ) : (
                    <Icons.Orders size={20} strokeWidth={1.75} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {n.title}
                    </h4>
                    <span className="text-xs font-mono text-slate-400 shrink-0">
                      {n.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {n.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};
