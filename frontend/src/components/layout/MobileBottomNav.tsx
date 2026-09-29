import React from 'react';
import { useApp } from '../../context/AppContext';
import { Icons, Icon } from '../../lib/icons';
import { Menu } from 'lucide-react';

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
      id: 'dashboard',
      label: isAdmin ? 'Dashboard' : 'Today',
      path: isAdmin ? '/admin/dashboard' : '/sales/dashboard',
      icon: Icons.Dashboard,
    },
    {
      id: 'clients',
      label: 'Clients',
      path: isAdmin ? '/admin/customers' : '/sales/customers',
      icon: Icons.Clients,
    },
    {
      id: 'designs',
      label: 'Designs',
      path: isAdmin ? '/admin/designs' : '/sales/designs',
      icon: Icons.Designs,
    },
    {
      id: 'orders',
      label: 'Orders',
      path: isAdmin ? '/admin/orders' : '/sales/orders',
      icon: Icons.Orders,
    },
    {
      id: 'menu',
      label: 'Menu',
      action: toggleMobileSidebar,
      icon: Menu,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
      <nav aria-label="Mobile Navigation" className="flex items-center justify-around h-14 px-1">
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
              className={`flex-1 flex flex-col items-center justify-center py-1 select-none transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon
                icon={item.icon}
                size={18}
                className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500'}
              />
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
