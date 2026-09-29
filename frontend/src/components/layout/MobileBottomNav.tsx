import React from 'react';
import { useApp } from '../../context/AppContext';

interface MobileBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPath,
  onNavigate,
}) => {
  const { currentUser, toggleMobileSidebar, isMobileSidebarOpen } = useApp();
  const isAdmin = currentUser.role === 'admin';

  if (isMobileSidebarOpen) {
    return null;
  }

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      path: isAdmin ? '/admin/dashboard' : '/sales/dashboard',
      icon: (isActive: boolean) => (
        <svg
          className={`w-5 h-5 transition-transform ${
            isActive ? 'text-blue-600 scale-105' : 'text-slate-900'
          }`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          {/* iOS Find My style "Me" navigation arrow */}
          <path d="M3.5 11.5l17-8-8 17-2.5-6.5-6.5-2.5z" />
        </svg>
      ),
    },
    {
      id: 'catalogue',
      label: 'Catalogue',
      path: isAdmin ? '/admin/designs' : '/sales/designs',
      icon: (isActive: boolean) => (
        <svg
          className={`w-5 h-5 transition-transform ${
            isActive ? 'text-blue-600 scale-105' : 'text-slate-900'
          }`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          {/* iOS Find My style "Items" 4-circles grid */}
          <circle cx="7" cy="7" r="3.2" />
          <circle cx="17" cy="7" r="3.2" />
          <circle cx="7" cy="17" r="3.2" />
          <circle cx="17" cy="17" r="3.2" />
        </svg>
      ),
    },
    {
      id: 'orders',
      label: 'Orders',
      path: isAdmin ? '/admin/orders' : '/sales/orders',
      icon: (isActive: boolean) => (
        <svg
          className={`w-5 h-5 transition-transform ${
            isActive ? 'text-blue-600 scale-105 stroke-blue-600' : 'text-slate-900 stroke-slate-900'
          }`}
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Wholesale shopping bag */}
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      id: 'customers',
      label: 'Customers',
      path: isAdmin ? '/admin/customers' : '/sales/customers',
      icon: (isActive: boolean) => (
        <svg
          className={`w-5 h-5 transition-transform ${
            isActive ? 'text-blue-600 scale-105' : 'text-slate-900'
          }`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          {/* iOS Find My style "People" dual silhouette */}
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          <path
            d="M18 10c1.66 0 3-1.34 3-3s-1.34-3-3-3c-.35 0-.68.06-.98.17 1.2 1.09 1.98 2.65 1.98 4.33 0 1.68-.78 3.24-1.98 4.33.3.11.63.17.98.17zm2 4.08c-.73-.25-1.57-.43-2.5-.55 1.52.88 2.5 2.38 2.5 4.47v2h4v-2c0-1.71-2.43-3.23-4-3.92z"
            opacity="0.9"
          />
        </svg>
      ),
    },
    {
      id: 'menu',
      label: 'Menu',
      action: toggleMobileSidebar,
      icon: () => (
        <svg
          className="w-5 h-5 text-slate-900 stroke-slate-900"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="md:hidden fixed bottom-3 inset-x-3 z-40 max-w-sm xs:max-w-md mx-auto pointer-events-none select-none"
      style={{
        bottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* iOS Find My Style Floating Frosted Glass Capsule */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="pointer-events-auto flex items-center justify-between p-1.5 rounded-[28px] sm:rounded-[32px] bg-white/80 backdrop-blur-2xl border border-white/70 shadow-[0_14px_36px_-6px_rgba(15,23,42,0.18),0_0_1px_1px_rgba(255,255,255,0.9)_inset] transition-all"
      >
        {navItems.map((item) => {
          const isActive =
            item.path &&
            (currentPath === item.path ||
              (item.path !== '/admin/dashboard' &&
                item.path !== '/sales/dashboard' &&
                currentPath.startsWith(item.path)));

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else if (item.path) {
                  onNavigate(item.path);
                }
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-[20px] sm:rounded-[22px] transition-all duration-200 min-h-[50px] ${
                isActive
                  ? 'bg-white/95 shadow-[0_2px_10px_rgba(0,0,0,0.08),0_0_1px_1px_rgba(255,255,255,0.9)_inset] border border-white/80'
                  : 'hover:bg-white/40 active:scale-95'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {item.icon(Boolean(isActive))}
              </div>
              <span
                className={`text-[10.5px] mt-0.5 tracking-tight leading-none transition-colors ${
                  isActive
                    ? 'font-bold text-blue-600'
                    : 'font-semibold text-slate-800'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
