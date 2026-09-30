import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import { Avatar } from '../ui/Avatar';
import projectLogo from '../../assets/images/project_logo.png';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

interface NavItemDef {
  name: string;
  path: string;
  icon: keyof typeof Icons;
  badge?: number;
}

interface NavGroupDef {
  label: string;
  items: NavItemDef[];
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

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadAlerts =
    notifications.filter(
      (n) => !n.read && (n.category === 'alert' || n.category === 'order')
    ).length || 4;

  const adminNavGroups: NavGroupDef[] = [
    {
      label: 'Overview',
      items: [{ name: 'Dashboard', path: '/admin/dashboard', icon: 'Dashboard' }],
    },
    {
      label: 'Sales & Clients',
      items: [
        { name: 'Customers', path: '/admin/customers', icon: 'Clients' },
        { name: 'Sales Team', path: '/admin/sales-team', icon: 'SalesTeam' },
      ],
    },
    {
      label: 'Catalogue & Orders',
      items: [
        { name: 'Designs', path: '/admin/designs', icon: 'Designs' },
        { name: 'Orders', path: '/admin/orders', icon: 'Orders' },
        { name: 'Manufacturers', path: '/admin/manufacturers', icon: 'Manufacturers' },
      ],
    },
    {
      label: 'Finance',
      items: [
        { name: 'Payments & Amount Due', path: '/admin/payments', icon: 'Payments' },
      ],
    },
    {
      label: 'Administration',
      items: [
        { name: 'Reports & Alerts', path: '/admin/reports', icon: 'Reports', badge: unreadAlerts },
        { name: 'Audit Log', path: '/admin/audit-log', icon: 'AuditLog' },
        { name: 'Settings', path: '/admin/settings', icon: 'Settings' },
      ],
    },
  ];

  const salesNavGroups: NavGroupDef[] = [
    {
      label: 'Overview',
      items: [{ name: 'Dashboard', path: '/sales/dashboard', icon: 'Dashboard' }],
    },
    {
      label: 'Sales & Visits',
      items: [
        { name: 'My Customers', path: '/sales/customers', icon: 'Clients' },
        { name: 'Follow-ups', path: '/sales/follow-ups', icon: 'FollowUps' },
        { name: 'My Visits', path: '/sales/visits', icon: 'Visits' },
      ],
    },
    {
      label: 'Catalogue & Orders',
      items: [
        { name: 'Design Catalogue', path: '/sales/designs', icon: 'Designs' },
        { name: 'My Orders', path: '/sales/orders', icon: 'Orders' },
      ],
    },
    {
      label: 'Finance',
      items: [
        { name: 'Collections', path: '/sales/collections', icon: 'Collections' },
      ],
    },
    {
      label: 'Account',
      items: [
        { name: 'Notifications', path: '/sales/notifications', icon: 'Notifications', badge: 2 },
        { name: 'Profile', path: '/sales/profile', icon: 'SalesTeam' },
      ],
    },
  ];

  const navGroups = currentUser.role === 'admin' ? adminNavGroups : salesNavGroups;

  const handleNavClick = (path: string) => {
    onNavigate(path);
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  const renderNavGroup = (group: NavGroupDef) => (
    <div key={group.label} className="mb-4">
      {!isSidebarCollapsed && (
        <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-subtle-foreground select-none">
          {group.label}
        </div>
      )}
      <div className="space-y-1 mt-1">
        {group.items.map((item) => {
          const IconComp = Icons[item.icon] || Icons.Dashboard;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              title={isSidebarCollapsed ? item.name : undefined}
              className={`w-full flex items-center h-11 rounded-xl transition-colors duration-150 group relative select-none cursor-pointer ${
                isSidebarCollapsed ? 'justify-center px-0' : 'px-3.5 gap-3.5'
              } ${
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
              }`}
            >
              <div
                className={`shrink-0 ${
                  isActive ? 'text-primary-foreground' : 'text-subtle-foreground group-hover:text-foreground'
                }`}
              >
                <IconComp size={19} strokeWidth={1.75} />
              </div>

              {!isSidebarCollapsed && (
                <span className="text-[14px] truncate flex-1 text-left">
                  {item.name}
                </span>
              )}

              {!isSidebarCollapsed && item.badge && item.badge > 0 && (
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30'
                    : 'bg-muted text-foreground border-border'
                }`}>
                  {item.badge}
                </span>
              )}

              {isSidebarCollapsed && item.badge && item.badge > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface">
      {/* Brand Block */}
      <div className={`h-[72px] px-4 sm:px-5 border-b border-border flex items-center shrink-0 ${isSidebarCollapsed ? 'justify-center' : 'gap-3.5'}`}>
        <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden group">
          <img
            src={projectLogo}
            alt="ShoeConnect Logo"
            className="w-full h-full object-contain rounded-lg transition-transform group-hover:scale-105"
          />
        </div>
        {!isSidebarCollapsed && (
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-foreground tracking-tight leading-tight truncate">
              ShoeConnect
            </h2>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              Step Towards Better Tomorrow
            </p>
            <p className="text-[10px] text-muted-foreground/80 truncate">
              {currentUser.role === 'admin' ? 'Admin Workspace' : 'Sales Portal'} • 2026-2027
            </p>
          </div>
        )}
      </div>

      {/* Navigation Groups Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {navGroups.map(renderNavGroup)}
      </div>

      {/* Sidebar Promo Card (from screenshot) */}
      {!isSidebarCollapsed && (
        <div className="px-3 pb-3">
          <div className="p-3 rounded-2xl bg-surface hover:bg-muted/60 border border-border flex items-center justify-between gap-3 shadow-2xs transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                <Icons.Designs size={18} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-foreground leading-tight truncate">
                  Better Footwear
                </div>
                <div className="text-[11px] font-semibold text-muted-foreground truncate">
                  Bigger Opportunities
                </div>
                <div className="text-[10px] text-muted-foreground/80 truncate">
                  Wholesale • Supply Chain • Growth
                </div>
              </div>
            </div>
            <Icons.ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </div>
      )}

      {/* Bottom User Card */}
      <div className="p-3 border-t border-border relative" ref={userMenuRef}>
        <div
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className={`rounded-2xl border border-border p-2.5 flex items-center gap-3 bg-surface hover:bg-muted cursor-pointer transition-colors ${
            isSidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <Avatar name={currentUser.name} size="md" />

          {!isSidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">
                {currentUser.name}
              </p>
              <p className="text-xs text-muted-foreground capitalize truncate mt-0.5">
                {currentUser.role === 'admin' ? 'Trader / Admin' : 'Sales Executive'}
              </p>
            </div>
          )}

          {!isSidebarCollapsed && (
            <div className="text-subtle-foreground hover:text-foreground">
              <Icons.More size={18} strokeWidth={1.75} />
            </div>
          )}
        </div>

        {/* User Popup Menu */}
        {isUserMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-surface border border-border rounded-2xl shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 border-b border-border text-xs text-muted-foreground">
              Signed in as <span className="font-semibold text-foreground">{currentUser.email || currentUser.name}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                switchRole();
                setIsUserMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
            >
              <Icons.Refresh size={16} strokeWidth={1.75} className="text-foreground" />
              Switch to {currentUser.role === 'admin' ? 'Salesman View' : 'Admin View'}
            </button>

            <button
              type="button"
              onClick={() => {
                handleNavClick(currentUser.role === 'admin' ? '/admin/settings' : '/sales/profile');
                setIsUserMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
            >
              <Icons.Settings size={16} strokeWidth={1.75} />
              Settings & Preferences
            </button>

            <div className="my-1 border-t border-border" />

            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
            >
              <Icons.Logout size={16} strokeWidth={1.75} />
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />
          <div className="relative w-[280px] bg-surface h-full shadow-2xl flex flex-col z-[101]">
            <div className="absolute top-4 right-3">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <Icons.Close size={20} strokeWidth={1.75} />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-surface border-r border-border shrink-0 h-screen sticky top-0 transition-all duration-200 z-30 ${
          isSidebarCollapsed ? 'w-20' : 'w-[280px]'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
