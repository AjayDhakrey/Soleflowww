import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Layers,
  ShoppingBag,
  UserCheck,
  Factory,
  CreditCard,
  BarChart3,
  Settings,
  CalendarCheck,
  MapPin,
  Bell,
  Briefcase,
  User,
  LogOut,
  ArrowLeftRight,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
    setIsSidebarCollapsed,
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

  const unreadAlerts =
    notifications.filter(
      (n) => !n.read && (n.category === 'alert' || n.category === 'order')
    ).length || 4;

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Designs', path: '/admin/designs', icon: Layers },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Sales Team', path: '/admin/sales-team', icon: UserCheck },
    { name: 'Manufacturers', path: '/admin/manufacturers', icon: Factory },
    { name: 'Payments & Amount Due', path: '/admin/payments', icon: CreditCard },
    { name: 'Reports & Alerts', path: '/admin/reports', icon: BarChart3, badge: unreadAlerts },
    { name: 'Public Landing Page', path: '/landing', icon: Sparkles },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const salesNav = [
    { name: 'Dashboard', path: '/sales/dashboard', icon: LayoutDashboard },
    { name: 'My Customers', path: '/sales/customers', icon: Users },
    { name: 'Design Catalogue', path: '/sales/designs', icon: Layers },
    { name: 'My Orders', path: '/sales/orders', icon: ShoppingBag },
    { name: 'Collections', path: '/sales/collections', icon: CreditCard },
    { name: 'Follow-ups', path: '/sales/follow-ups', icon: CalendarCheck },
    { name: 'My Visits', path: '/sales/visits', icon: MapPin },
    { name: 'Notifications', path: '/sales/notifications', icon: Bell, badge: 2 },
    { name: 'My Activity', path: '/sales/activity', icon: Briefcase },
    { name: 'Public Landing Page', path: '/landing', icon: Sparkles },
    { name: 'Profile', path: '/sales/profile', icon: User },
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
      {/* ========================================================================= */}
      {/* 1. DEDICATED PHONE NAVIGATION DRAWER (Mobile-only < md)                   */}
      {/* ========================================================================= */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          {/* Full-screen Dark Frosted Touch-Dismiss Backdrop */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            aria-hidden="true"
          />

          {/* Phone Drawer Panel */}
          <div className="relative w-[86vw] max-w-[320px] bg-white h-full shadow-2xl flex flex-col z-[101] animate-in slide-in-from-left duration-200">
            {/* Phone Header with Large Close Button */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => {
                  handleNavClick(
                    currentUser.role === 'admin'
                      ? '/admin/dashboard'
                      : '/sales/dashboard'
                  );
                }}
              >
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 14.5L7 12l3 2.5 3-2.5 3 2.5 4-3.5v5c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-3.5z" />
                    <path d="M4 9c0-1.1.9-2 2-2h4l4 4h4a2 2 0 0 1 2 2v1.5" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
                    SoleFlow
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    {currentUser.role === 'admin'
                      ? 'Trader / Admin'
                      : 'Sales Representative'}
                  </span>
                </div>
              </div>

              {/* Close Button on Phone */}
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Phone Role Switcher */}
            <div className="p-3 bg-slate-50 border-b border-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 px-1">
                Portal Mode
              </div>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                <button
                  onClick={() => switchRole('admin')}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all text-center ${
                    currentUser.role === 'admin'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Trader Admin
                </button>
                <button
                  onClick={() => switchRole('salesperson')}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all text-center ${
                    currentUser.role === 'salesperson'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sales Rep
                </button>
              </div>
            </div>

            {/* Phone Navigation Links */}
            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
              {currentNav.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentPath === item.path ||
                  (item.path !== '/admin/dashboard' &&
                    item.path !== '/sales/dashboard' &&
                    currentPath.startsWith(item.path));

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full min-h-[46px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/70'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 shrink-0 ${
                          isActive ? 'text-blue-600' : 'text-slate-500'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-600 border border-rose-200">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Phone User Profile Card with Sign Out */}
            <div className="p-3.5 border-t border-slate-100 bg-white">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-300 shrink-0">
                    {currentUser.initials}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
                      {currentUser.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {currentUser.roleLabel}
                    </p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 shrink-0 border border-rose-200/70 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DESKTOP PERMANENT SIDEBAR (Desktop-only md:flex)                       */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex bg-white border-r border-slate-200/90 flex-col shrink-0 min-h-screen select-none transition-all duration-300 ease-in-out relative ${
          isSidebarCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {/* Desktop Brand Header - Strictly h-16 to align seamlessly with navbar */}
        <div className="h-16 px-3.5 border-b border-slate-200/90 flex items-center justify-between box-border">
          {isSidebarCollapsed ? (
            <div className="w-full flex items-center justify-center">
              <button
                onClick={toggleSidebar}
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-white shadow-xs group transition-all"
                title="Expand sidebar (Ctrl+B)"
                aria-label="Expand sidebar"
              >
                <svg
                  className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 14.5L7 12l3 2.5 3-2.5 3 2.5 4-3.5v5c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-3.5z" />
                  <path d="M4 9c0-1.1.9-2 2-2h4l4 4h4a2 2 0 0 1 2 2v1.5" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <div
                className="flex items-center gap-3 overflow-hidden cursor-pointer"
                onClick={() =>
                  onNavigate(
                    currentUser.role === 'admin'
                      ? '/admin/dashboard'
                      : '/sales/dashboard'
                  )
                }
              >
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 14.5L7 12l3 2.5 3-2.5 3 2.5 4-3.5v5c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-3.5z" />
                    <path d="M4 9c0-1.1.9-2 2-2h4l4 4h4a2 2 0 0 1 2 2v1.5" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight text-slate-900 truncate">
                      SoleFlow
                    </span>
                  </div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 truncate">
                    {currentUser.role === 'admin'
                      ? 'B2B FOOTWEAR'
                      : 'FOOTWEAR TRADE • REP'}
                  </p>
                </div>
              </div>

              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Collapse Sidebar (Ctrl+B)"
                aria-label="Collapse Sidebar"
              >
                <PanelLeftClose className="w-4 h-4 text-slate-500 hover:text-slate-800" />
              </button>
            </>
          )}
        </div>

        {/* Desktop Role Indicator */}
        <div className="px-3 pt-3">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200/70 text-[11px]">
              <span className="text-slate-700 font-medium">Mode:</span>
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    currentUser.role === 'admin'
                      ? 'bg-blue-600'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="font-bold text-slate-900 truncate">
                  {currentUser.role === 'admin' ? 'Trader / Admin' : 'Sales Rep'}
                </span>
              </div>
              <button
                onClick={() =>
                  switchRole(
                    currentUser.role === 'admin' ? 'salesperson' : 'admin'
                  )
                }
                title="Switch User Role"
                className="p-1 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition-colors shrink-0 cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() =>
                  switchRole(
                    currentUser.role === 'admin' ? 'salesperson' : 'admin'
                  )
                }
                title={`Role: ${
                  currentUser.role === 'admin' ? 'Trader' : 'Sales Rep'
                }. Click to switch.`}
                className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    currentUser.role === 'admin'
                      ? 'bg-blue-600'
                      : 'bg-emerald-500'
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
          {currentNav.map((item) => {
            const Icon = item.icon;
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
                  isSidebarCollapsed
                    ? 'justify-center p-2.5 relative'
                    : 'justify-between px-3 py-2.5'
                } rounded-xl text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100/90 text-blue-900 font-semibold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div
                  className={`flex items-center ${
                    isSidebarCollapsed ? 'justify-center' : 'gap-3'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-blue-700' : 'text-slate-500'
                    }`}
                  />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </div>

                {item.badge !== undefined &&
                  (!isSidebarCollapsed ? (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-rose-100 text-rose-600 border border-rose-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                  ))}
              </button>
            );
          })}
        </nav>

        {/* Desktop Collapse Action Bar (Ctrl+B) */}
        <div className="px-2.5 py-2 border-t border-slate-100">
          {!isSidebarCollapsed ? (
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
              title="Collapse sidebar to maximize workspace (Ctrl+B)"
            >
              <span className="text-[11px] font-medium flex items-center gap-2">
                <PanelLeftClose className="w-4 h-4 text-slate-500" />
                <span>Collapse Sidebar</span>
              </span>
              <kbd className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                ⌘B
              </kbd>
            </button>
          ) : (
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Expand sidebar (Ctrl+B)"
            >
              <PanelLeftOpen className="w-4 h-4 text-slate-600" />
            </button>
          )}
        </div>

        {/* Desktop User Profile Section */}
        <div className="p-3 border-t border-slate-100">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-100/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-300 shrink-0">
                  {currentUser.initials}
                </div>
                <div className="text-left truncate">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                    {currentUser.name}
                  </h4>
                  <p className="text-[10px] text-slate-600 truncate">
                    {currentUser.roleLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-300 cursor-pointer"
                title={`${currentUser.name} (${currentUser.roleLabel})`}
              >
                {currentUser.initials}
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
