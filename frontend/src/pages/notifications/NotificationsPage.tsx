import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import { PaymentReceipt } from '../../types';
import {
  ReceiptPreviewModal,
  mapPaymentStatusToReceiptStatus,
} from '../../components/payments/ReceiptTemplate';
import {
  PageHeader,
  KpiCard,
  Panel,
  Button,
  EmptyState,
} from '../../components/ui';
import { NotificationKpiCards } from '../../components/notifications/NotificationKpiCards';
import { Home, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { notifications, payments, customers, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentReceipt | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const criticalCount = notifications.filter((n) => !n.read && n.category === 'alert').length;

  const handleNotificationClick = (n: any) => {
    markNotificationAsRead(n.id);
    // If notification relates to payment, find matching payment
    if (n.title.toLowerCase().includes('payment') || n.desc.toLowerCase().includes('payment') || n.desc.toLowerCase().includes('receipt')) {
      const matched = payments.find(
        (p) =>
          n.desc.includes(p.receiptNumber) ||
          n.desc.includes(p.customerName) ||
          (p.utrRef && n.desc.includes(p.utrRef))
      ) || payments[0];
      if (matched) {
        setSelectedReceiptPayment(matched);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto pb-24 md:pb-12">
      {/* 1. Standardized Header with Breadcrumbs & Action Buttons */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link
            to="/sales/dashboard"
            className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-blue-600" />
            <span>Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Notifications</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Notifications & Trade Alerts
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                {unreadCount} Unread
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time notifications for factory dispatch delays, overdue receivables, and payment receipts.
            </p>
          </div>

          {unreadCount > 0 && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => markAllNotificationsAsRead()}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                Mark All as Read
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. KPI Summary Row (3D Claymorphic Redesign) */}
      <NotificationKpiCards
        totalCount={notifications.length}
        unreadCount={unreadCount}
        criticalCount={criticalCount}
      />

      {/* 3. Notifications List Panel */}
      <Panel
        title="All System Alerts"
        subtitle="Click any notification to acknowledge; payment alerts open digital receipt slips"
        headerAction={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAllNotificationsAsRead()}
              className="text-xs text-primary font-semibold hover:underline cursor-pointer"
            >
              Mark all read
            </button>
          ) : undefined
        }
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
            {notifications.map((n) => {
              const isPaymentNotification =
                n.title.toLowerCase().includes('payment') ||
                n.desc.toLowerCase().includes('payment') ||
                n.desc.toLowerCase().includes('receipt') ||
                n.desc.toLowerCase().includes('cheque');

              const isDesignNotification =
                n.title.toLowerCase().includes('design') ||
                n.desc.toLowerCase().includes('design') ||
                n.category === 'design';

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-5 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                    !n.read ? 'bg-zinc-100/60 dark:bg-zinc-800/40' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isPaymentNotification
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600'
                        : isDesignNotification
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600'
                        : n.category === 'alert'
                        ? 'bg-red-50 dark:bg-red-950/50 text-red-600'
                        : n.category === 'factory'
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {isPaymentNotification ? (
                      <Icons.Payments size={20} strokeWidth={1.75} />
                    ) : isDesignNotification ? (
                      <Icons.Designs size={20} strokeWidth={1.75} />
                    ) : n.category === 'alert' ? (
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
                    {isPaymentNotification && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        <Icons.FileText size={13} />
                        <span>Click to view official receipt</span>
                      </div>
                    )}
                    {isDesignNotification && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                        <Icons.Designs size={13} />
                        <span>Available in wholesale catalog</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Standalone Receipt Preview Modal */}
      {selectedReceiptPayment && (
        <ReceiptPreviewModal
          open={Boolean(selectedReceiptPayment)}
          onClose={() => setSelectedReceiptPayment(null)}
          receipt={selectedReceiptPayment}
          customer={(() => {
            const cust = customers.find((c) => c.id === selectedReceiptPayment.customerId);
            if (!cust) return undefined;
            return {
              customerCode: cust.id,
              gstin: cust.gstin,
              phone: cust.phone,
              address: cust.address ? `${cust.address}, ${cust.city}, ${cust.state}` : `${cust.city || 'Agra'}, Uttar Pradesh`,
            };
          })()}
          status={mapPaymentStatusToReceiptStatus(selectedReceiptPayment.status)}
        />
      )}
    </div>
  );
};

export default NotificationsPage;
