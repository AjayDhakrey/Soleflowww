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
  EmptyState,
} from '../../components/ui';
import { NotificationKpiCards } from '../../components/notifications/NotificationKpiCards';

export const NotificationsPage: React.FC = () => {
  const { notifications, payments, customers, markNotificationAsRead } = useApp();
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentReceipt | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

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
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/sales/dashboard' }, { label: 'Notifications' }]}
        title="Notifications & Trade Alerts"
        subtitle="Real-time notifications for factory dispatch delays, overdue receivables, and payment receipts."
      />

      {/* 2. KPI Summary Row (3D Claymorphic Redesign) */}
      <NotificationKpiCards
        totalCount={notifications.length}
        unreadCount={unreadCount}
        criticalCount="1 Critical"
      />

      {/* 3. Notifications List Panel */}
      <Panel
        title="All System Alerts"
        subtitle="Click any notification to acknowledge; payment alerts open digital receipt slips"
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
                        : n.category === 'alert'
                        ? 'bg-red-50 dark:bg-red-950/50 text-red-600'
                        : n.category === 'factory'
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {isPaymentNotification ? (
                      <Icons.Payments size={20} strokeWidth={1.75} />
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
