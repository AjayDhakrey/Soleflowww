import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useDashboardOverview, DashboardPeriod } from '../../hooks/useDashboardOverview';
import { Icons } from '../../lib/icons';
import { PaymentReceipt } from '../../types';
import {
  ReceiptPreviewModal,
  mapPaymentStatusToReceiptStatus,
} from '../../components/payments/ReceiptTemplate';
import { OverviewKpiCards } from '../../components/dashboard/OverviewKpiCards';
import { QuickShortcutsGrid } from '../../components/dashboard/QuickShortcutsGrid';
import shoe1Img from '../../assets/images/login/shoe1_crisp.png';
import shoe2Img from '../../assets/images/login/shoe2_crisp.png';
import shoe3Img from '../../assets/images/login/shoe3_crisp.png';
import shoe4Img from '../../assets/images/login/shoe4_crisp.png';
import { Panel } from '../../components/ui';

// 3D Trophy Cup Icon for Top Selling Footwear
const Trophy3D = () => (
  <svg viewBox="0 0 36 36" className="w-8 h-8 drop-shadow-sm select-none" fill="none">
    <circle cx="18" cy="18" r="17" fill="url(#trophyGlowGrad)" />
    <path d="M11 10H25V17C25 20.8 21.8 24 18 24C14.2 24 11 20.8 11 17V10Z" fill="url(#trophyCupGrad)" stroke="#D97706" strokeWidth="1" />
    <path d="M11 12H8C6.9 12 6 12.9 6 14V15C6 17.2 7.8 19 10 19H11" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M25 12H28C29.1 12 30 12.9 30 14V15C30 17.2 28.2 19 26 19H25" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M16 24V27H20V24" fill="#D97706" />
    <path d="M13 27H23V29C23 29.6 22.6 30 22 30H14C13.4 30 13 29.6 13 29V27Z" fill="url(#trophyBaseGrad)" stroke="#B45309" strokeWidth="1" />
    <path d="M18 13.5L18.8 15.2L20.6 15.3L19.2 16.5L19.7 18.2L18 17.2L16.3 18.2L16.8 16.5L15.4 15.3L17.2 15.2Z" fill="#FFFFFF" />
    <defs>
      <linearGradient id="trophyGlowGrad" x1="1" y1="1" x2="35" y2="35" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEF3C7" />
        <stop offset="1" stopColor="#FDE68A" />
      </linearGradient>
      <linearGradient id="trophyCupGrad" x1="11" y1="10" x2="25" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A" />
        <stop offset="0.5" stopColor="#FBBF24" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="trophyBaseGrad" x1="13" y1="27" x2="23" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" />
        <stop offset="1" stopColor="#B45309" />
      </linearGradient>
    </defs>
  </svg>
);

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    customers,
    notifications,
    setIsPaymentModalOpen,
    setIsCreateOrderModalOpen,
    setIsAddCustomerModalOpen,
    setIsShareModalOpen,
  } = useApp();

  const {
    period,
    setPeriod,
    kpis,
  } = useDashboardOverview();

  const unreadAlertsCount = notifications?.filter((n) => !n.read).length || 0;

  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentReceipt | null>(null);

  const formatLakh = (amount: number) => `₹${(amount / 100000).toFixed(2)}L`;

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return { text: 'Good morning', icon: '☀️' };
    if (hr < 17) return { text: 'Good afternoon', icon: '🌤️' };
    return { text: 'Good evening', icon: '🌙' };
  };
  const greeting = getGreeting();

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 max-w-[1440px] w-full mx-auto pb-28 md:pb-12 bg-background text-foreground overflow-x-hidden animate-in fade-in duration-200">
      {/* 1. Mobile Greeting Bar (Visible on phone only) */}
      <div className="sm:hidden flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Hi {currentUser.name.split(' ')[0]}!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {greeting.text}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/admin/notifications')}
          className="relative w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          title="Notifications & Alerts"
          aria-label="Notifications & Alerts"
        >
          <Icons.Notifications size={16} />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
              {unreadAlertsCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. Commercial Period Selector & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 hidden sm:inline">
            PERIOD:
          </span>
          <div className="grid grid-cols-4 gap-1 sm:flex sm:items-center sm:gap-1.5 w-full sm:w-auto">
            {(
              [
                { label: 'Today', value: 'today' },
                { label: 'This Week', value: 'week' },
                { label: 'This Month', value: 'month' },
                { label: 'This Quarter', value: 'quarter' },
              ] as { label: string; value: DashboardPeriod }[]
            ).map((tab) => {
              const isSelected = period === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setPeriod(tab.value)}
                  className={`px-3 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold rounded-full transition-all duration-150 cursor-pointer select-none text-center active:scale-95 truncate ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'bg-white dark:bg-card border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons on Right of Period Bar */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-card text-slate-800 dark:text-slate-200 hover:bg-slate-50 font-bold text-xs shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <span className="font-bold text-slate-700 dark:text-slate-300">₹</span>
            <span>Record Payment</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCreateOrderModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Icons.Add size={14} strokeWidth={2.5} />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* 3. Key Business Performance (Ongoing Projects style section with View all) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ongoing Operations
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('/admin/orders')}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View all</span>
            <span className="text-sm leading-none">→</span>
          </button>
        </div>
        <OverviewKpiCards
          salesValue={formatLakh(kpis.sales.value)}
          salesGrowth={kpis.sales.comparison.changePercent || 0}
          collectionsValue={formatLakh(kpis.collections.value)}
          collectionsGrowth={kpis.collections.comparison.changePercent || 0}
          receivablesValue={formatLakh(kpis.receivables.value)}
          receivablesAccountsCount={kpis.receivables.customerCount}
          openOrdersCount={kpis.openOrders.count}
          openOrdersValue={formatLakh(kpis.openOrders.value)}
          activeStoresCount={kpis.activeCustomers.count}
          totalRegisteredBuyers={kpis.activeCustomers.total}
          pairsBookedValue={kpis.pairsBooked.value}
          pairsBookedGrowth={kpis.pairsBooked.comparison.changePercent || 0}
          onNavigate={onNavigate}
          isSalesperson={false}
        />
      </div>

      {/* 4. Quick Operational Shortcuts (6-Item Single Row Grid) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Icons.Dashboard size={14} className="text-primary" />
            <span>Quick Operational Shortcuts</span>
          </h2>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            <span>1-Tap Actions</span>
          </span>
        </div>
        <QuickShortcutsGrid
          onBookOrder={() => setIsCreateOrderModalOpen(true)}
          onRecordPayment={() => setIsPaymentModalOpen(true)}
          onAddCustomer={() => setIsAddCustomerModalOpen(true)}
          onNewDesign={() => {
            onNavigate('/admin/designs');
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('open-add-design-modal'));
            }, 100);
          }}
          onShareLookbook={() => setIsShareModalOpen(true)}
          onGstLedger={() => onNavigate('/admin/reports')}
        />
      </div>

      {/* 5. Top Selling Products (4-Item Horizontal Grid Matching Screenshot) */}
      <Panel
        title={
          <div className="flex items-center gap-2.5">
            <Trophy3D />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 title="Top Selling Footwear" className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
                  Top Selling Footwear
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  ★ Bestsellers
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                Highest volume articles booked across retail dealer accounts
              </p>
            </div>
          </div>
        }
        headerAction={
          <button
            type="button"
            onClick={() => onNavigate('/admin/designs')}
            className="text-xs font-semibold text-primary hover:text-blue-700 dark:hover:text-blue-400 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View catalogue</span>
            <span className="text-sm leading-none">&gt;</span>
          </button>
        }
        noPadding
      >
        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                rank: '#1',
                name: 'Running Shoes',
                pairs: '12,480 pairs',
                growth: '↑ 18%',
                image: shoe1Img,
              },
              {
                rank: '#2',
                name: 'Casual Sneakers',
                pairs: '9,320 pairs',
                growth: '↑ 12%',
                image: shoe2Img,
              },
              {
                rank: '#3',
                name: 'Sports Shoes',
                pairs: '7,860 pairs',
                growth: '↑ 10%',
                image: shoe3Img,
              },
              {
                rank: '#4',
                name: 'Canvas Shoes',
                pairs: '6,240 pairs',
                growth: '↑ 8%',
                image: shoe4Img,
              },
            ].map((item) => (
              <div
                key={item.rank}
                onClick={() => onNavigate('/admin/designs')}
                className="bg-white dark:bg-card rounded-[20px] border border-slate-200/80 dark:border-slate-800 p-3 sm:p-3.5 shadow-2xs hover:shadow-xs flex items-center gap-3 transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-100 dark:bg-slate-800/80 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shrink-0">
                      {item.rank}
                    </span>
                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.name}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs sm:text-[13px] font-extrabold text-slate-800 dark:text-slate-200">
                      {item.pairs}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                      {item.growth}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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

export default AdminDashboard;
