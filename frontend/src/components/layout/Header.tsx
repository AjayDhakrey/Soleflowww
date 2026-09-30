import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface HeaderProps {
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const {
    currentUser,
    switchRole,
    customers,
    orders,
    designs,
    notifications,
    markNotificationAsRead,
    setIsPaymentModalOpen,
    setIsCreateOrderModalOpen,
    setIsAddCustomerModalOpen,
    setIsShareModalOpen,
    toggleMobileSidebar,
    logout,
    isDarkMode,
    toggleDarkMode,
  } = useApp();

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
    <header className="h-[72px] bg-surface border-b border-border px-4 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
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
            className="w-full h-11 md:h-12 pl-11 pr-20 bg-muted hover:bg-muted/80 focus:bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                            onNavigate(currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers');
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
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground">
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
                            onNavigate(currentUser.role === 'admin' ? '/admin/orders' : '/sales/orders');
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground">
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
          <Button
            variant="primary"
            size="md"
            icon={Icons.Add}
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
          >
            New
          </Button>

          {isNewMenuOpen && (
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
                    onNavigate('/designs');
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
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-surface">
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
                <span className="text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer">
                  Mark all read
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border mt-1">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className={`p-3 rounded-xl hover:bg-muted cursor-pointer transition-colors ${
                      !n.read ? 'bg-muted/70' : ''
                    }`}
                  >
                    <p className="text-xs font-semibold text-foreground">
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {n.desc}
                    </p>
                  </div>
                ))}
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
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-foreground leading-tight">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-muted-foreground capitalize">
                {currentUser.role === 'admin' ? 'Admin' : 'Salesman'}
              </p>
            </div>
            <Icons.ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
          </div>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-semibold text-foreground">
                  {currentUser.name}
                </p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
              <button
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
              </button>

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
  );
};
