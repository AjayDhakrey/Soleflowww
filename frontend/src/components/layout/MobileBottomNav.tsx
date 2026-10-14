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
        className="pointer-events-auto bg-surface/85 dark:bg-card/85 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[26px] p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] dark:ring-white/[0.06] flex items-center justify-between select-none transition-all duration-200"
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
                  ? 'text-primary font-bold bg-gradient-to-b from-primary/15 via-primary/8 to-primary/0 dark:from-primary/25 dark:via-primary/10 border border-primary/20 shadow-2xs'
                  : 'text-muted-foreground/75 hover:text-foreground hover:bg-muted/40'
              }`}
            >
              {/* Icon Container with micro-bounce on active */}
              <div
                className={`relative p-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'scale-110 -translate-y-0.5 text-primary'
                    : 'group-hover:scale-105'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />

                {/* Micro-badge for active orders counter */}
                {item.badge !== null && (
                  <span className="absolute -top-1 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9.5px] font-bold flex items-center justify-center ring-2 ring-surface shadow-xs animate-in zoom-in-75 duration-150">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Responsive Micro-label */}
              <span
                className={`text-[10px] mt-0.5 tracking-tight transition-all duration-200 ${
                  isActive
                    ? 'font-bold text-primary scale-105'
                    : 'font-medium text-muted-foreground'
                }`}
              >
                {item.label}
              </span>

              {/* Glowing Active Micro-Dot */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.9)] mt-0.5 animate-in zoom-in duration-200" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
