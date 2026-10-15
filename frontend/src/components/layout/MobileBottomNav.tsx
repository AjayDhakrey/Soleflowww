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
  const { currentUser, isMobileSidebarOpen, orders } = useApp();
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

  return (
    <div
      className="md:hidden fixed bottom-2.5 sm:bottom-3 inset-x-2 sm:inset-x-4 max-w-md mx-auto z-40 pointer-events-none"
      style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}
    >
      <nav
        className="pointer-events-auto bg-white/92 dark:bg-slate-900/92 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-[26px] p-1.5 shadow-[0_12px_36px_rgba(15,23,42,0.10),0_2px_8px_rgba(15,23,42,0.05)] ring-1 ring-slate-900/[0.03] dark:ring-white/[0.06] flex items-center justify-between select-none transition-all duration-200"
        aria-label="Mobile Bottom Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.path);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.path)}
              className={`flex-1 relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 select-none cursor-pointer group active:scale-95 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50'
              }`}
            >
              {/* Icon Container with micro-bounce on active */}
              <div
                className={`relative p-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'scale-110 -translate-y-0.5 text-blue-600 dark:text-blue-400'
                    : 'group-hover:scale-105 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />

                {/* Micro-badge for active orders counter */}
                {item.badge !== null && (
                  <span className="absolute -top-1 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[9.5px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs animate-in zoom-in-75 duration-150">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Responsive Micro-label */}
              <span
                className={`text-[10px] mt-0.5 tracking-tight transition-all duration-200 ${
                  isActive
                    ? 'font-bold text-blue-600 dark:text-blue-400 scale-105'
                    : 'font-medium text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.label}
              </span>

              {/* Glowing Active Micro-Dot */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.7)] mt-0.5 animate-in zoom-in duration-200" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
