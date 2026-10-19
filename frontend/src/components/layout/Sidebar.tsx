import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import { Avatar } from '../ui/Avatar';
import projectLogo from '../../assets/images/project_logo.png';
import blueSneakerLogo from '../../assets/images/login/clean_shoe_athletic_blue.png';

import {
  NavBrandLogo3D,
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

  const { org, isDemoAccount } = useAuth();

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
        { name: 'Notifications', path: '/admin/notifications', icon3D: 'Reports', badge: unreadSalesNotifications > 0 ? unreadSalesNotifications : undefined },
        { name: 'Reports & Alerts', path: '/admin/reports', icon3D: 'Dashboard' },
        { name: 'Settings', path: '/admin/settings', icon3D: 'Settings' },
      ],
    },
  ];

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

  const handleNavClick = (path: string) => {
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

  const renderNavGroup = (group: NavGroupDef, isMobile = false) => {
    const isCollapsed = isMobile ? false : isSidebarCollapsed;
    return (
      <div key={group.label} className="mb-3">
        {!isCollapsed && (
          <div className="px-3.5 pt-3 pb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#94A3B8] dark:text-slate-400 select-none">
            {group.label}
          </div>
        )}
        <div className="space-y-1 mt-0.5">
          {group.items.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/admin/dashboard' && item.path !== '/sales/dashboard' && currentPath.startsWith(item.path));

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                title={isCollapsed ? item.name : undefined}
                className={`w-full flex items-center h-[50px] rounded-2xl transition-all duration-150 group relative select-none cursor-pointer ${
                  isCollapsed ? 'justify-center px-0' : 'px-3 gap-3.5'
                } ${
                  isActive
                    ? 'bg-[#EEF5FF] dark:bg-blue-950/40 border border-[#DBEAFE] dark:border-blue-800/60 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 font-medium'
                }`}
              >
                <div className="shrink-0 transition-transform group-hover:scale-105">
                  {render3DIcon(item.icon3D)}
                </div>

                {!isCollapsed && (
                  <span title={item.name} className={`text-[15px] truncate flex-1 text-left ${isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                    {item.name}
                  </span>
                )}

                {!isCollapsed && item.badge && item.badge > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center text-xs font-medium tabular-nums rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shrink-0">
                    {item.badge}
                  </span>
                )}

                {!isCollapsed && isActive && (
                  <Icons.ChevronRight size={17} className="text-blue-600 dark:text-blue-400 shrink-0" strokeWidth={2.4} />
                )}

                {isCollapsed && item.badge && item.badge > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSidebarContent = (isMobile = false) => {
    const isCollapsed = isMobile ? false : isSidebarCollapsed;
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900">
        {/* Brand Header */}
        <div
          className={`h-[74px] px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 ${
            isCollapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <div
            onClick={() => {
              if (isMobile) setIsMobileSidebarOpen(false);
              onNavigate(currentUser.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard');
            }}
            title="ShoeConnect Dashboard"
            className={`flex items-center cursor-pointer select-none ${
              isCollapsed ? 'justify-center' : 'gap-3 flex-1 min-w-0'
            }`}
          >
            <div className="w-[48px] h-[48px] flex items-center justify-center shrink-0">
              <NavBrandLogo3D className="w-[48px] h-[48px]" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline min-w-0 truncate text-[16px] leading-tight">
                  <span className="font-bold text-slate-900 dark:text-white">Shoe</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Connect</span>
                  <span className="font-bold text-slate-900 dark:text-white">&nbsp;(default)</span>
                </div>
                <p className="text-[12px] text-slate-400 dark:text-slate-500 truncate mt-1 font-normal">
                  Agra • Footwear Workspace
                </p>
              </div>
            )}
          </div>

          {/* Close button for mobile drawer */}
          {isMobile && (
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              aria-label="Close sidebar"
            >
              <Icons.Close size={18} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Navigation Groups Scroll Area */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navGroups.map((grp) => renderNavGroup(grp, isMobile))}
        </div>

        {/* Bottom Profile Card */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 relative" ref={userMenuRef}>
          <div
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`rounded-2xl border border-slate-100/90 dark:border-slate-800 p-2.5 sm:p-3 flex items-center gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] select-none ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#EBF3FF] dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-300 font-bold text-sm flex items-center justify-center shrink-0">
              SM
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold leading-tight text-slate-900 dark:text-white truncate">
                  {currentUser.role === 'admin' ? 'SoleFlow Master Admin' : currentUser.name}
                </p>
                <p className="text-[11px] leading-tight font-normal text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {currentUser.role === 'admin' ? 'Admin' : 'Sales Executive'}
                </p>
              </div>
            )}

            {!isCollapsed && (
              <div className="text-blue-600 dark:text-blue-400 shrink-0">
                <Icons.ChevronRight size={16} strokeWidth={2.2} />
              </div>
            )}
          </div>

          {/* User Popup Menu */}
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-surface border border-border rounded-2xl shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-border text-xs text-muted-foreground">
                Signed in as <span className="font-semibold text-foreground">{currentUser.email || currentUser.name}</span>
              </div>

              {isDemoAccount && (
                <button
                  type="button"
                  onClick={() => {
                    const nextRole = currentUser.role === 'admin' ? 'salesperson' : 'admin';
                    switchRole(nextRole);
                    if (isMobile) setIsMobileSidebarOpen(false);
                    onNavigate(nextRole === 'admin' ? '/admin/dashboard' : '/sales/dashboard');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
                >
                  <Icons.Refresh size={16} strokeWidth={1.75} className="text-foreground" />
                  Switch to {currentUser.role === 'admin' ? 'Salesman View' : 'Admin View'}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (isMobile) setIsMobileSidebarOpen(false);
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
                  if (isMobile) setIsMobileSidebarOpen(false);
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
  };

  return (
    <>
      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex animate-in fade-in duration-200">
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />
          <div className="relative w-[300px] sm:w-[320px] max-w-[85vw] bg-surface h-full shadow-2xl flex flex-col z-[101] animate-in slide-in-from-left duration-250">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-surface border-r border-border shrink-0 h-screen sticky top-0 transition-all duration-200 z-30 ${
          isSidebarCollapsed ? 'w-20' : 'w-[280px]'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>
    </>
  );
};
