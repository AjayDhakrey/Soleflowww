import React from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';

interface MobileBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPath,
  onNavigate,
}) => {
  const { currentUser, isMobileSidebarOpen, orders, setIsCreateOrderModalOpen } = useApp();
  const isAdmin = currentUser.role === 'admin';

  if (isMobileSidebarOpen) {
    return null;
  }

  // Robust sub-route and parameter-aware path matching
  const isItemActive = (targetPath: string) => {
    if (currentPath === targetPath) return true;
    const basePath = targetPath.split('?')[0];
    if (
      basePath !== '/admin/dashboard' &&
      basePath !== '/sales/dashboard' &&
      currentPath.startsWith(basePath)
    ) {
      return true;
    }
    return false;
  };

  // Live badge for active / pending wholesale orders
  const pendingOrdersCount = (orders || []).filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
  ).length;

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      path: isAdmin ? '/admin/dashboard' : '/sales/dashboard',
      icon: Icons.Dashboard,
      badge: null,
    },
    {
      id: 'catalogue',
      label: 'Catalogue',
      path: isAdmin ? '/admin/designs' : '/sales/designs',
      icon: Icons.Designs,
      badge: null,
    },
    {
      id: 'orders',
      label: 'Orders',
      path: isAdmin ? '/admin/orders' : '/sales/orders',
      icon: Icons.Orders,
      badge: pendingOrdersCount > 0 ? (pendingOrdersCount > 99 ? '99+' : pendingOrdersCount) : null,
    },
    {
      id: 'customers',
      label: 'Clients',
      path: isAdmin ? '/admin/customers' : '/sales/customers',
      icon: Icons.Clients,
      badge: null,
    },
    {
      id: 'finance',
      label: isAdmin ? 'Payments' : 'Collections',
      path: isAdmin ? '/admin/payments' : '/sales/collections',
      icon: isAdmin ? Icons.Payments : Icons.Collections,
      badge: null,
    },
  ];

  const handleTabClick = (path: string) => {
    if (isItemActive(path)) {
      // Smoothly scroll to top if already active on this tab
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    onNavigate(path);
  };

  // Direct 4-tab + 1 center FAB matching reference image
  // Home | Orders/Tasks | (+) NEW ACTION | Payments | Clients/Profile
  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 pointer-events-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="relative max-w-lg mx-auto px-4 pb-2">
        {/* Raised Circular Center Action Button (+) */}
        <div className="absolute left-1/2 -top-5 -translate-x-1/2 z-50 pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              if (isAdmin) {
                setIsCreateOrderModalOpen(true);
              } else {
                setIsCreateOrderModalOpen(true);
              }
            }}
            className="w-13 h-13 rounded-full bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center shadow-[0_8px_20px_rgba(15,23,42,0.35)] dark:shadow-[0_8px_20px_rgba(37,99,235,0.4)] border-4 border-slate-50 dark:border-slate-950 active:scale-90 transition-transform cursor-pointer"
            aria-label="Create new order"
            title="Create New Order"
          >
            <Icons.Add size={24} strokeWidth={2.75} />
          </button>
        </div>

        {/* Floating Nav Bar Container */}
        <nav
          className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 rounded-3xl h-16 px-3 shadow-[0_12px_32px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] flex items-center justify-between select-none"
          aria-label="Mobile Bottom Navigation"
        >
          {/* 1. Home */}
          <button
            type="button"
            onClick={() => handleTabClick(isAdmin ? '/admin/dashboard' : '/sales/dashboard')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              isItemActive(isAdmin ? '/admin/dashboard' : '/sales/dashboard')
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
            }`}
          >
            <Icons.Dashboard size={20} strokeWidth={isItemActive(isAdmin ? '/admin/dashboard' : '/sales/dashboard') ? 2.4 : 1.8} />
            <span className="text-[10px] mt-1 tracking-tight">Home</span>
          </button>

          {/* 2. Tasks / Orders */}
          <button
            type="button"
            onClick={() => handleTabClick(isAdmin ? '/admin/orders' : '/sales/orders')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer relative ${
              isItemActive(isAdmin ? '/admin/orders' : '/sales/orders')
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
            }`}
          >
            <div className="relative">
              <Icons.Orders size={20} strokeWidth={isItemActive(isAdmin ? '/admin/orders' : '/sales/orders') ? 2.4 : 1.8} />
              {pendingOrdersCount > 0 && (
                <span className="absolute -top-1 -right-2.5 min-w-3.5 h-3.5 px-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  {pendingOrdersCount > 9 ? '9+' : pendingOrdersCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Orders</span>
          </button>

          {/* Spacer for center (+) button */}
          <div className="w-14 shrink-0" aria-hidden="true" />

          {/* 3. Payments */}
          <button
            type="button"
            onClick={() => handleTabClick(isAdmin ? '/admin/payments' : '/sales/collections')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              isItemActive(isAdmin ? '/admin/payments' : '/sales/collections')
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
            }`}
          >
            <Icons.Payments size={20} strokeWidth={isItemActive(isAdmin ? '/admin/payments' : '/sales/collections') ? 2.4 : 1.8} />
            <span className="text-[10px] mt-1 tracking-tight">Payments</span>
          </button>

          {/* 4. Profile / Clients */}
          <button
            type="button"
            onClick={() => handleTabClick(isAdmin ? '/admin/customers' : '/sales/customers')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              isItemActive(isAdmin ? '/admin/customers' : '/sales/customers')
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
            }`}
          >
            <Icons.Clients size={20} strokeWidth={isItemActive(isAdmin ? '/admin/customers' : '/sales/customers') ? 2.4 : 1.8} />
            <span className="text-[10px] mt-1 tracking-tight">Clients</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
