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

export interface NotificationsPageProps {
  onNavigate?: (path: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { currentUser, notifications, payments, customers, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentReceipt | null>(null);

  const navigateTo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

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
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-5xl mx-auto pb-24 md:pb-12 font-sans overflow-x-hidden">
      {/* 1. Standardized Header with Breadcrumbs & Action Buttons */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <button
            type="button"
            onClick={() => navigateTo(currentUser?.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard')}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-blue-600" />
            <span>Dashboard</span>
          </button>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">Notifications</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                Notifications & Trade Alerts
              </h1>
              <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900 shrink-0">
                {unreadCount} Unread
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
              Real-time factory dispatch delays, overdue accounts, and payment receipts.
            </p>
          </div>

          {unreadCount > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => markAllNotificationsAsRead()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs transition-colors cursor-pointer active:scale-95"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Mark All as Read</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. KPI Summary Row (Compact claymorphic cards) */}
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
                  className={`p-3.5 sm:p-5 flex items-start gap-3 sm:gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors active:bg-slate-100/70 dark:active:bg-slate-800/90 ${
                    !n.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isPaymentNotification
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                        : isDesignNotification
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                        : n.category === 'alert'
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                        : n.category === 'factory'
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isPaymentNotification ? (
                      <Icons.Payments size={18} strokeWidth={1.8} />
                    ) : isDesignNotification ? (
                      <Icons.Designs size={18} strokeWidth={1.8} />
                    ) : n.category === 'alert' ? (
                      <Icons.Overdue size={18} strokeWidth={1.8} />
                    ) : n.category === 'factory' ? (
                      <Icons.Manufacturers size={18} strokeWidth={1.8} />
                    ) : (
                      <Icons.Orders size={18} strokeWidth={1.8} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                        )}
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {n.title}
                        </h4>
                      </div>
                      <span className="text-[10px] sm:text-xs font-mono text-slate-400 shrink-0">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-0.5 sm:mt-1 leading-relaxed">
                      {n.desc}
                    </p>
                    {isPaymentNotification && (
                      <div className="mt-1.5 sm:mt-2 flex items-center gap-1 text-[11px] sm:text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        <Icons.FileText size={12} />
                        <span>View official receipt</span>
                      </div>
                    )}
                    {isDesignNotification && (
                      <div className="mt-1.5 sm:mt-2 flex items-center gap-1 text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                        <Icons.Designs size={12} />
                        <span>Wholesale catalog</span>
                      </div>
                    )}
                    {(n.category === 'alert' || n.linkTab === 'orders' || n.title.toLowerCase().includes('past due') || n.desc.toLowerCase().includes('past due')) && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationAsRead(n.id);
                            navigateTo(currentUser?.role === 'admin' ? '/admin/orders?filter=delayed' : '/sales/orders');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-900 transition-colors cursor-pointer"
                        >
                          <Icons.Orders size={13} />
                          <span>Resolve in Orders →</span>
                        </button>
                      </div>
                    )}
                    {n.linkTab === 'payments' && !isPaymentNotification && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationAsRead(n.id);
                            navigateTo(currentUser?.role === 'admin' ? '/admin/payments' : '/sales/collections');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 transition-colors cursor-pointer"
                        >
                          <Icons.Payments size={13} />
                          <span>Inspect Overdue Ledger →</span>
                        </button>
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
