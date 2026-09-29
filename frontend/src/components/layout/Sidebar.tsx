import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons, Icon } from '../../lib/icons';
import { ChevronLeft, ChevronRight, PanelLeftClose, LogOut, ArrowLeftRight } from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const {
    currentUser,
    switchRole,
    logout,
    notifications,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useApp();

  // Keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const unreadAlerts = notifications.filter((n) => !n.read).length || 0;

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: Icons.Dashboard },
    { name: 'Clients', path: '/admin/customers', icon: Icons.Clients },
    { name: 'Designs', path: '/admin/designs', icon: Icons.Designs },
    { name: 'Orders', path: '/admin/orders', icon: Icons.Orders },
    { name: 'Salesmen', path: '/admin/sales-team', icon: Icons.Salesmen },
    { name: 'Manufacturers', path: '/admin/manufacturers', icon: Icons.Manufacturers },
    { name: 'Payments', path: '/admin/payments', icon: Icons.Payments },
    { name: 'Reports', path: '/admin/reports', icon: Icons.Reports, badge: unreadAlerts > 0 ? unreadAlerts : undefined },
    { name: 'Audit log', path: '/admin/audit-log', icon: Icons.AuditLog },
    { name: 'Settings', path: '/admin/settings', icon: Icons.Settings },
  ];

  const salesNav = [
    { name: 'Today', path: '/sales/dashboard', icon: Icons.Dashboard },
    { name: 'Clients', path: '/sales/customers', icon: Icons.Clients },
    { name: 'Designs', path: '/sales/designs', icon: Icons.Designs },
    { name: 'Orders', path: '/sales/orders', icon: Icons.Orders },
    { name: 'Collections', path: '/sales/collections', icon: Icons.Collections },
    { name: 'Follow-ups', path: '/sales/follow-ups', icon: Icons.FollowUps },
    { name: 'Visits', path: '/sales/visits', icon: Icons.Visits },
    { name: 'Notifications', path: '/sales/notifications', icon: Icons.Notifications, badge: 2 },
    { name: 'Activity', path: '/sales/activity', icon: Icons.Meta.Activity },
  ];

  const currentNav = currentUser.role === 'admin' ? adminNav : salesNav;

  const handleNavClick = (path: string) => {
    onNavigate(path);
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <>
      {/* 1. Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 transition-opacity"
            aria-hidden="true"
          />

          <div className="relative w-64 max-w-[80vw] bg-white dark:bg-zinc-900 h-full border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-50">
            {/* Header */}
            <div className="h-14 px-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                SoleFlow
              </span>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <Icon icon={Icons.Close} size={18} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
              {currentNav.map((item) => {
                const isActive =
                  currentPath === item.path ||
                  (item.path !== '/admin/dashboard' &&
                    item.path !== '/sales/dashboard' &&
                    currentPath.startsWith(item.path));

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        icon={item.icon}
                        size={18}
                        className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="px-1.5 py-0.2 rounded-full text-[11px] font-medium bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Role Switcher & User */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <button
                onClick={() =>
                  switchRole(currentUser.role === 'admin' ? 'salesperson' : 'admin')
                }
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-[6px] hover:bg-zinc-100"
              >
                <span>Role: {currentUser.role === 'admin' ? 'Trader' : 'Salesman'}</span>
                <Icon icon={ArrowLeftRight} size={14} />
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-[6px]"
              >
                <span>Sign out</span>
                <Icon icon={LogOut} size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Desktop Permanent Sidebar */}
      <aside
        className={`hidden md:flex bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex-col shrink-0 min-h-screen select-none transition-all duration-150 ease-out ${
          isSidebarCollapsed ? 'w-16' : 'w-[240px]'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          {!isSidebarCollapsed ? (
            <>
              <div
                onClick={() =>
                  onNavigate(
                    currentUser.role === 'admin'
                      ? '/admin/dashboard'
                      : '/sales/dashboard'
                  )
                }
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-[6px] bg-blue-600 flex items-center justify-center text-white">
                  <Icon icon={Icons.Designs} size={14} className="text-white" />
                </div>
                <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                  SoleFlow
                </span>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Collapse (⌘B)"
                aria-label="Collapse sidebar"
              >
                <Icon icon={PanelLeftClose} size={16} />
              </button>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <button
                onClick={toggleSidebar}
                className="w-8 h-8 rounded-[6px] bg-blue-600 flex items-center justify-center text-white"
                title="Expand (⌘B)"
                aria-label="Expand sidebar"
              >
                <Icon icon={Icons.Designs} size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {currentNav.map((item) => {
            const isActive =
              currentPath === item.path ||
              (item.path !== '/admin/dashboard' &&
                item.path !== '/sales/dashboard' &&
                currentPath.startsWith(item.path));

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                title={isSidebarCollapsed ? item.name : undefined}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
                } rounded-[6px] text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    icon={item.icon}
                    size={18}
                    className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'}
                  />
                  {!isSidebarCollapsed && <span>{item.name}</span>}
                </div>

                {!isSidebarCollapsed && item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[11px] font-medium bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Role Switcher & User Profile */}
        <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
          {!isSidebarCollapsed ? (
            <>
              <button
                onClick={() =>
                  switchRole(currentUser.role === 'admin' ? 'salesperson' : 'admin')
                }
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 rounded-[6px] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Switch role"
              >
                <span>{currentUser.role === 'admin' ? 'Trader' : 'Salesman'}</span>
                <Icon icon={ArrowLeftRight} size={13} className="text-zinc-400" />
              </button>
              <div className="flex items-center justify-between px-2 py-1.5">
                <div className="truncate">
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">
                    {currentUser.email || 'user@soleflow.in'}
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  aria-label="Sign out"
                  className="p-1 rounded text-zinc-400 hover:text-red-600 transition-colors"
                >
                  <Icon icon={LogOut} size={15} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <button
                onClick={() =>
                  switchRole(currentUser.role === 'admin' ? 'salesperson' : 'admin')
                }
                title={`Role: ${currentUser.role === 'admin' ? 'Trader' : 'Salesman'}`}
                className="p-1.5 rounded text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Icon icon={ArrowLeftRight} size={15} />
              </button>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 rounded text-zinc-400 hover:text-red-600"
              >
                <Icon icon={LogOut} size={15} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
