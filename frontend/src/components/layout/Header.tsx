import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface HeaderProps {
  onNavigate: (path: string) => void;
}

import { useAuth } from '../../auth/AuthProvider';
import { useViewMode, useReadOnly } from '../../context/ViewModeContext';
import { usePlatformAccounts } from '../../hooks/usePlatformAccounts';
import { ViewModeBanner } from '../common/ViewModeBanner';
import { Shield, Building2, ChevronDown, Check, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Organization } from '../../types';

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const {
    currentUser,
    switchRole,
    customers,
    selectedCustomer,
    setSelectedCustomer,
    orders,
    designs,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setIsPaymentModalOpen,
    setIsCreateOrderModalOpen,
    setIsAddCustomerModalOpen,
    setIsShareModalOpen,
    toggleMobileSidebar,
    logout,
    isDarkMode,
    toggleDarkMode,
  } = useApp();

  const { org, isSuperAdmin, isDemoAccount, activeOrgId, setActiveOrgId } = useAuth();
  const { isReadOnly, viewOrgId, viewOrgName, enterViewMode, exitViewMode } = useViewMode();
  const { data: platformAccounts = [] } = usePlatformAccounts();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const orgDropdownRef = useRef<HTMLDivElement>(null);

  const activeDisplayOrgName = viewOrgName || (platformAccounts.find((o) => o.org_id === activeOrgId)?.name) || org?.name || 'My Workspace';

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const newMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Global Keyboard shortcuts: Cmd+K / Ctrl+K to search, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNewMenuOpen(false);
        setIsNotifDropdownOpen(false);
        setIsProfileMenuOpen(false);
        setIsOrgDropdownOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
      if (newMenuRef.current && !newMenuRef.current.contains(target)) {
        setIsNewMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(target)) {
        setIsOrgDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const q = searchQuery.toLowerCase().trim();
  const matchedCustomers = q
    ? customers.filter(
        (c) =>
          c.businessName.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.phone.includes(q)
      )
    : [];

  const matchedOrders = q
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q)
      )
    : [];

  const matchedDesigns = q
    ? designs.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.articleCode.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)
      )
    : [];

  const hasSearchResults =
    matchedCustomers.length > 0 || matchedOrders.length > 0 || matchedDesigns.length > 0;

  return (
    <div className="sticky top-0 z-20">
      {isDemoAccount && <div role="status" className="bg-amber-50 text-amber-900 border-b border-amber-200 px-4 py-2 text-sm">Demo workspace — sample data only. Sign in with your own account to save business records.</div>}
      {/* Super Admin Read-Only View Mode Sticky Amber Banner */}
      <ViewModeBanner onExitNavigate={() => onNavigate('/platform/accounts')} />

      <header className="h-[72px] bg-surface border-b border-border px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile Drawer Trigger + Search Bar in one line */}
        <div className="flex items-center gap-3 flex-1 max-w-[640px]">
          <button
            type="button"
            onClick={toggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 cursor-pointer"
            aria-label="Toggle navigation menu"
          >

          <Icons.Dashboard size={20} strokeWidth={1.75} />
        </button>

        {/* Global Search */}
        <div className="flex-1 relative" ref={searchRef}>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-subtle-foreground">
            <Icons.Search size={18} strokeWidth={1.75} />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search customers, orders, designs, invoices..."
            className="w-full h-11 md:h-12 pl-11 pr-20 bg-muted hover:bg-muted/80 focus:bg-surface border border-border rounded-xl text-base md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground bg-surface border border-border rounded shadow-2xs">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Global Search Results Dropdown */}
        {isSearchOpen && searchQuery && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-surface border border-border rounded-2xl shadow-xl p-3 max-h-[380px] overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100">
            {!hasSearchResults ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No matching clients, designs, or orders found for "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-4">
                {matchedCustomers.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-subtle-foreground px-2 mb-1.5">
                      Clients
                    </p>
                    <div className="space-y-1">
                      {matchedCustomers.slice(0, 3).map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedCustomer(c);
                            const basePath = currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers';
                            onNavigate(`${basePath}/${c.id}`);
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted cursor-pointer"
                        >
                          <Avatar name={c.businessName} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {c.businessName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {c.city} • {c.phone}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {matchedDesigns.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-subtle-foreground px-2 mb-1.5">
                      Designs
                    </p>
                    <div className="space-y-1">
                      {matchedDesigns.slice(0, 3).map((d) => (
                        <div
                          key={d.id}
                          onClick={() => {
                            onNavigate(currentUser.role === 'admin' ? '/admin/designs' : '/sales/designs');
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground shrink-0">
                            <Icons.Designs size={16} strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {d.name}
                            </p>
                            <p className="text-xs font-mono text-muted-foreground">
                              {d.articleCode} • ₹{d.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {matchedOrders.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-subtle-foreground px-2 mb-1.5">
                      Orders
                    </p>
                    <div className="space-y-1">
                      {matchedOrders.slice(0, 3).map((o) => (
                        <div
                          key={o.id}
                          onClick={() => {
                            const basePath = currentUser.role === 'admin' ? '/admin/orders' : '/sales/orders';
                            onNavigate(`${basePath}?inspect=${encodeURIComponent(o.id)}`);
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground shrink-0">
                            <Icons.Orders size={16} strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {o.id} — {o.customerName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ₹{(o.netPayable || o.subtotal || 0).toLocaleString('en-IN')} • {o.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: + New, Notification Bell (44px round), User Chip */}
      <div className="flex items-center gap-3 shrink-0">
        {/* + New Action Menu */}
        <div className="relative hidden lg:block" ref={newMenuRef}>
          {isReadOnly ? (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-muted text-muted-foreground text-xs font-semibold rounded-xl border border-border cursor-not-allowed opacity-75"
              title="Actions disabled in Read-Only View Mode"
            >
              <Lock size={14} className="text-amber-500" />
              <span>Read-Only</span>
            </div>
          ) : (
            <Button
              variant="primary"
              size="md"
              icon={Icons.Add}
              onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            >
              New
            </Button>
          )}

          {isNewMenuOpen && !isReadOnly && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  setIsCreateOrderModalOpen(true);
                  setIsNewMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl cursor-pointer"
              >
                <Icons.Orders size={16} strokeWidth={1.75} className="text-primary" />
                Create New Order
              </button>
              {currentUser.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsNewMenuOpen(false);
                    onNavigate(currentUser.role === 'admin' ? '/admin/designs' : '/sales/designs');
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('open-add-design-modal'));
                    }, 50);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl cursor-pointer"
                >
                  <Icons.Designs size={16} strokeWidth={1.75} className="text-indigo-600 dark:text-indigo-400" />
                  Add Footwear Design
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsPaymentModalOpen(true);
                  setIsNewMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl cursor-pointer"
              >
                <Icons.Payments size={16} strokeWidth={1.75} className="text-emerald-600 dark:text-emerald-400" />
                Record Payment
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddCustomerModalOpen(true);
                  setIsNewMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl cursor-pointer"
              >
                <Icons.Clients size={16} strokeWidth={1.75} className="text-primary" />
                Add New Client
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsShareModalOpen(true);
                  setIsNewMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl cursor-pointer"
              >
                <Icons.Share size={16} strokeWidth={1.75} className="text-purple-600 dark:text-purple-400" />
                Share Catalogue
              </button>
            </div>
          )}
        </div>

        {/* Super Admin Business Switcher */}
        {isSuperAdmin && (
          <div className="relative" ref={orgDropdownRef}>
            <button
              type="button"
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className={`h-11 px-3 rounded-full border flex items-center gap-2 transition-colors cursor-pointer text-xs font-semibold ${
                isReadOnly || activeOrgId
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
                  : 'border-border bg-surface hover:bg-muted text-foreground'
              }`}
              title="Platform Business Switcher"
            >
              <Building2 size={15} className={`shrink-0 ${isReadOnly || activeOrgId ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}`} />
              <span title={activeDisplayOrgName} className="max-w-[130px] truncate">
                {activeDisplayOrgName}
              </span>
              <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
            </button>

            {isOrgDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Switch Active Business
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-border/50 mt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      await exitViewMode();
                      setIsOrgDropdownOpen(false);
                      onNavigate('/platform/accounts');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted cursor-pointer transition-colors ${
                      !isReadOnly ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-primary" />
                      <span>My workspace (Platform)</span>
                    </div>
                    {!isReadOnly && <Check size={14} />}
                  </button>

                  {platformAccounts.map((o) => (
                    <button
                      key={o.org_id}
                      type="button"
                      onClick={async () => {
                        await enterViewMode(o.org_id, o.name);
                        setIsOrgDropdownOpen(false);
                        onNavigate('/admin/dashboard');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl hover:bg-muted cursor-pointer transition-colors ${
                        viewOrgId === o.org_id ? 'bg-amber-100/70 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 font-bold' : 'text-foreground'
                      }`}
                    >
                      {/* zoom-proof: truncate is inert on a flex container; the name span keeps truncate */}
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <Building2 size={14} className="text-muted-foreground shrink-0" />
                        <span title={o.name} className="truncate">{o.name}</span>
                        {o.is_demo && (
                          <span className="whitespace-nowrap text-[8px] px-1 py-0.2 bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded font-bold">DEMO</span>
                        )}
                      </div>
                      {viewOrgId === o.org_id && <Check size={14} className="text-amber-800 dark:text-amber-300 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 44px Round Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            className="w-11 h-11 rounded-full border border-border bg-surface hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Icons.Notifications size={20} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-surface">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface border border-border rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllNotificationsAsRead()}
                    className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border mt-1">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3 rounded-xl hover:bg-muted cursor-pointer transition-colors ${
                        !n.read ? 'bg-muted/70 font-semibold' : 'opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p title={n.title} className="text-xs font-semibold text-foreground truncate">
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.desc}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Chip: Avatar + Name + Role */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="rounded-full border border-border px-3 py-1.5 bg-surface hover:bg-muted flex items-center gap-2.5 cursor-pointer transition-colors select-none"
          >
            <Avatar name={currentUser.name} size="sm" />
            <div className="hidden sm:block text-left min-w-0">
              <p title={currentUser.name} className="text-xs font-semibold text-foreground leading-tight truncate">
                {currentUser.name}
              </p>
              <p className="text-[11px] leading-tight text-muted-foreground capitalize truncate">
                {currentUser.role === 'admin' ? 'Admin' : 'Salesman'}
              </p>
            </div>
            <Icons.ChevronDown size={14} className="shrink-0 text-muted-foreground hidden sm:block" />
          </div>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-semibold text-foreground">
                  {currentUser.name}
                </p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
{isDemoAccount && (              <button
                type="button"
                onClick={() => {
                  const nextRole = currentUser.role === 'admin' ? 'salesperson' : 'admin';
                  switchRole(nextRole);
                  onNavigate(nextRole === 'admin' ? '/admin/dashboard' : '/sales/dashboard');
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl cursor-pointer mt-1"
              >
                <Icons.Refresh size={14} className="text-foreground" />
                Switch to {currentUser.role === 'admin' ? 'Sales View' : 'Admin View'}
              </button>)}

              {/* Quick Dark Mode Toggle */}
              <div
                onClick={() => toggleDarkMode()}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl cursor-pointer select-none transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Icons.Moon size={14} className="text-muted-foreground" />
                  <span>Dark Mode</span>
                </div>
                <div
                  className={`w-8 h-4.5 rounded-full transition-colors relative flex items-center p-0.5 ${
                    isDarkMode ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                      isDarkMode ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onNavigate(currentUser.role === 'admin' ? '/admin/settings' : '/sales/profile');
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl cursor-pointer"
              >
                <Icons.Settings size={14} />
                Profile & Settings
              </button>
              <div className="my-1 border-t border-border" />
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl cursor-pointer"
              >
                <Icons.Logout size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  </div>
  );
};


