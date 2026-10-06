import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import { Avatar } from '../ui/Avatar';
import projectLogo from '../../assets/images/project_logo.png';

import {
  NavDashboard3D,
  NavCustomers3D,
  NavSalesTeam3D,
  NavOrders3D,
  NavDesigns3D,
  NavManufacturers3D,
  NavPayments3D,
  NavReports3D,
  NavSettings3D,
  NavFollowUps3D,
  NavVisits3D,
  NavUserAvatar3D,
} from './Sidebar3DIcons';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

type Nav3DIconKey =
  | 'Dashboard'
  | 'Customers'
  | 'SalesTeam'
  | 'Orders'
  | 'Designs'
  | 'Manufacturers'
  | 'Payments'
  | 'Reports'
  | 'Settings'
  | 'FollowUps'
  | 'Visits';

interface NavItemDef {
  name: string;
  path: string;
  icon3D: Nav3DIconKey;
  badge?: number;
}

interface NavGroupDef {
  label: string;
  items: NavItemDef[];
}

import { useAuth } from '../../auth/AuthProvider';
import { useViewMode } from '../../context/ViewModeContext';

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

  const { org, isSuperAdmin, isDemoAccount } = useAuth();

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
    ).length;

  const unreadSalesNotifications = notifications.filter((n) => !n.read).length;

  const adminNavGroups: NavGroupDef[] = [
    {
      label: 'OVERVIEW',
      items: [{ name: 'Dashboard', path: '/admin/dashboard', icon3D: 'Dashboard' }],
    },
    {
      label: 'SALES & CLIENTS',
      items: [
        { name: 'Customers', path: '/admin/customers', icon3D: 'Customers' },
        { name: 'Sales Team', path: '/admin/sales-team', icon3D: 'SalesTeam' },
      ],
    },
    {
      label: 'CATALOGUE & ORDERS',
      items: [
        { name: 'Orders', path: '/admin/orders', icon3D: 'Orders' },
        { name: 'Designs', path: '/admin/designs', icon3D: 'Designs' },
        { name: 'Manufacturers', path: '/admin/manufacturers', icon3D: 'Manufacturers' },
      ],
    },
    {
      label: 'FINANCE',
      items: [
        { name: 'Payments & Amount Due', path: '/admin/payments', icon3D: 'Payments' },
      ],
    },
    {
      label: 'ADMINISTRATION',
      items: [
        { name: 'Reports & Alerts', path: '/admin/reports', icon3D: 'Reports', badge: unreadAlerts > 0 ? unreadAlerts : undefined },
        { name: 'Settings', path: '/admin/settings', icon3D: 'Settings' },
      ],
    },
  ];

  const { isReadOnly, exitViewMode } = useViewMode();

  if (isReadOnly) {
    adminNavGroups.unshift({
      label: 'VIEW MODE',
      items: [
        { name: '← Back to Accounts', path: '/platform/accounts', icon3D: 'Dashboard' },
      ],
    });
  } else if (isSuperAdmin) {
    adminNavGroups.unshift({
      label: 'PLATFORM OWNER',
      items: [
        { name: 'Accounts', path: '/platform/accounts', icon3D: 'Dashboard' },
        { name: 'Platform Admin', path: '/platform', icon3D: 'Dashboard' },
      ],
    });
  }


  const salesNavGroups: NavGroupDef[] = [
    {
      label: 'OVERVIEW',
      items: [{ name: 'Dashboard', path: '/sales/dashboard', icon3D: 'Dashboard' }],
    },
    {
      label: 'SALES & CLIENTS',
      items: [
        { name: 'My Customers', path: '/sales/customers', icon3D: 'Customers' },
        { name: 'Follow-ups', path: '/sales/follow-ups', icon3D: 'FollowUps' },
        { name: 'My Visits', path: '/sales/visits', icon3D: 'Visits' },
      ],
    },
    {
      label: 'CATALOGUE & ORDERS',
      items: [
        { name: 'My Orders', path: '/sales/orders', icon3D: 'Orders' },
        { name: 'Designs', path: '/sales/designs', icon3D: 'Designs' },
      ],
    },
    {
      label: 'FINANCE',
      items: [
        { name: 'Collections', path: '/sales/collections', icon3D: 'Payments' },
      ],
    },
    {
      label: 'ACCOUNT',
      items: [
        { name: 'Notifications', path: '/sales/notifications', icon3D: 'Reports', badge: unreadSalesNotifications > 0 ? unreadSalesNotifications : undefined },
        { name: 'Profile', path: '/sales/profile', icon3D: 'SalesTeam' },
      ],
    },
  ];

  const navGroups = currentUser.role === 'admin' ? adminNavGroups : salesNavGroups;

  const handleNavClick = async (path: string) => {
    if (path === '/platform/accounts' && isReadOnly) {
      await exitViewMode();
    }
    onNavigate(path);
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  const render3DIcon = (key: Nav3DIconKey) => {
    switch (key) {
      case 'Dashboard':
        return <NavDashboard3D className="w-9 h-9" />;
      case 'Customers':
        return <NavCustomers3D className="w-9 h-9" />;
      case 'SalesTeam':
        return <NavSalesTeam3D className="w-9 h-9" />;
      case 'Orders':
        return <NavOrders3D className="w-9 h-9" />;
      case 'Designs':
        return <NavDesigns3D className="w-9 h-9" />;
      case 'Manufacturers':
        return <NavManufacturers3D className="w-9 h-9" />;
      case 'Payments':
        return <NavPayments3D className="w-9 h-9" />;
      case 'Reports':
        return <NavReports3D className="w-9 h-9" />;
      case 'Settings':
        return <NavSettings3D className="w-9 h-9" />;
      case 'FollowUps':
        return <NavFollowUps3D className="w-9 h-9" />;
      case 'Visits':
        return <NavVisits3D className="w-9 h-9" />;
      default:
        return <NavDashboard3D className="w-9 h-9" />;
    }
  };

  const renderNavGroup = (group: NavGroupDef) => (
    <div key={group.label} className="mb-4">
      {!isSidebarCollapsed && (
        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400/45 dark:text-slate-500/45 select-none">
          {group.label}
        </div>
      )}
      <div className="space-y-1 mt-1">
        {group.items.map((item) => {
          const isActive = currentPath === item.path || (item.path !== '/admin/dashboard' && item.path !== '/sales/dashboard' && currentPath.startsWith(item.path));

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              title={isSidebarCollapsed ? item.name : undefined}
              className={`w-full flex items-center h-12 rounded-2xl transition-all duration-150 group relative select-none cursor-pointer ${
                isSidebarCollapsed ? 'justify-center px-0' : 'px-2.5 gap-3'
              } ${
                isActive
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-semibold shadow-2xs'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 font-medium'
              }`}
            >
              <div className="shrink-0 transition-transform group-hover:scale-105">
                {render3DIcon(item.icon3D)}
              </div>

              {!isSidebarCollapsed && (
                <span title={item.name} className={`text-[13px] font-medium truncate flex-1 text-left ${isActive ? 'text-emerald-700 dark:text-emerald-300 font-semibold' : 'text-slate-700 dark:text-slate-200'}`}>
                  {item.name}
                </span>
              )}

              {!isSidebarCollapsed && item.badge && item.badge > 0 && (
                <span className="w-5 h-5 flex items-center justify-center text-xs font-medium tabular-nums rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 shrink-0">
                  {item.badge}
                </span>
              )}

              {!isSidebarCollapsed && isActive && (
                <Icons.ChevronRight size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}

              {isSidebarCollapsed && item.badge && item.badge > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Brand Header */}
      <div
        onClick={() => {
          onNavigate(currentUser.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard');
        }}
        title="SoleFlow Dashboard"
        className={`h-[68px] px-4 sm:px-5 border-b border-slate-100 dark:border-slate-800 flex items-center shrink-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors ${
          isSidebarCollapsed ? 'justify-center' : 'gap-3'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden group">
          <img
            src={projectLogo}
            alt="SoleFlow Logo"
            className="w-full h-full object-contain rounded-lg transition-transform group-hover:scale-105"
          />
        </div>
        {!isSidebarCollapsed && (
          <div className="min-w-0 flex-1">
            {/* zoom-proof: truncate is inert on a flex container; the h2 keeps truncate */}
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <h2 title={org?.name || 'SoleFlow'} className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                {org?.name || 'SoleFlow'}
              </h2>
              {isDemoAccount && (
                <span className="text-[11px] px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold shrink-0">
                  DEMO
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400/55 dark:text-slate-500/55 truncate">
              {org?.city ? `${org.city} • Footwear Workspace` : 'Step Towards Better Tomorrow'}
            </p>
          </div>
        )}

      </div>

      {/* Navigation Groups Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navGroups.map(renderNavGroup)}
      </div>

      {/* Bottom Profile Card */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 relative" ref={userMenuRef}>
        <div
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className={`rounded-2xl border border-slate-200/80 dark:border-slate-800 p-2.5 flex items-center gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-all shadow-2xs select-none ${
            isSidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <NavUserAvatar3D className="w-10 h-10 shrink-0" />

          {!isSidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold leading-tight text-slate-900 dark:text-white truncate">
                {currentUser.name}
              </p>
              <p className="text-[11px] leading-tight text-muted-foreground capitalize truncate mt-0.5">
                {currentUser.role === 'admin' ? 'Trader / Admin' : 'Sales Executive'}
              </p>
            </div>
          )}

          {!isSidebarCollapsed && (
            <div className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 shrink-0">
              <Icons.ChevronDown size={17} strokeWidth={2} />
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
                const nextRole = currentUser.role === 'admin' ? 'salesperson' : 'admin';
                switchRole(nextRole);
                onNavigate(nextRole === 'admin' ? '/admin/dashboard' : '/sales/dashboard');
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
