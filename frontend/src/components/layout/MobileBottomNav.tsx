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

  // Symmetrical 2+2 curved royal blue wave bottom bar with center action button
  // Matching reference image 2 and 3: Dark royal blue curved dock with center circular cutout
  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 pointer-events-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="relative max-w-md mx-auto">
        {/* Center Floating Action Button (Cyan / Light Blue circular button like in reference image 2/3) */}
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
            className="w-13 h-13 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_8px_20px_rgba(34,211,238,0.4)] border-4 border-slate-900 active:scale-90 transition-transform cursor-pointer"
            aria-label="Create new order"
            title="Create New Order"
          >
            {/* Filter / Funnel / Quick Order Action Icon matching reference */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-slate-950">
              <path d="M4.5 4h15a.5.5 0 0 1 .37.834L14 11.5v7a.5.5 0 0 1-.724.447l-3-1.5A.5.5 0 0 1 10 17v-5.5L4.13 4.834A.5.5 0 0 1 4.5 4z" />
            </svg>
          </button>
        </div>

        {/* Royal Blue Curved Bottom Bar Dock (Matching Reference Image 2 & 3) */}
        <nav
          className="pointer-events-auto bg-blue-900 text-white rounded-t-[32px] h-16 px-6 shadow-2xl flex items-center justify-between select-none relative overflow-hidden"
          aria-label="Mobile Bottom Navigation"
        >
          {/* Subtle curved background wave shape cutout */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-7 bg-transparent border-b-[8px] border-blue-900 rounded-b-full pointer-events-none" />

          {/* 1. Left Nav Action: Mail / Notifications / Orders */}
          <button
            type="button"
            onClick={() => handleTabClick(isAdmin ? '/admin/orders' : '/sales/orders')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              isItemActive(isAdmin ? '/admin/orders' : '/sales/orders')
                ? 'text-cyan-300 font-bold'
                : 'text-blue-200/80 hover:text-white'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span className="text-[9px] mt-0.5 tracking-tight">Orders</span>
          </button>

          {/* Spacer for center cutout button */}
          <div className="w-16 shrink-0" aria-hidden="true" />

          {/* 2. Right Nav Action: User / Account / Clients */}
          <button
            type="button"
            onClick={() => handleTabClick(isAdmin ? '/admin/customers' : '/sales/customers')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              isItemActive(isAdmin ? '/admin/customers' : '/sales/customers')
                ? 'text-cyan-300 font-bold'
                : 'text-blue-200/80 hover:text-white'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-[9px] mt-0.5 tracking-tight">Clients</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
