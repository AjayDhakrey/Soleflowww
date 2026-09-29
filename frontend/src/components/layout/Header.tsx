import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons, Icon } from '../../lib/icons';
import { Menu, Plus, Bell, ChevronDown, Check, LogOut, ArrowLeftRight } from 'lucide-react';

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
    setSelectedCustomer,
    toggleMobileSidebar,
    logout,
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
          d.articleCode.toLowerCase().includes(q)
      )
    : [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* Mobile Menu & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-1.5 rounded-[6px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Open menu"
        >
          <Icon icon={Menu} size={18} />
        </button>
        <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 md:hidden">
          SoleFlow
        </span>
      </div>

      {/* Global Search Bar (⌘K) */}
      <div ref={searchRef} className="flex-1 max-w-md relative">
        <div
          onClick={() => {
            setIsSearchOpen(true);
            searchInputRef.current?.focus();
          }}
          className="h-8 px-2.5 rounded-[6px] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-text transition-colors"
        >
          <div className="flex items-center gap-2">
            <Icon icon={Icons.Search} size={14} className="text-zinc-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search clients, orders, designs..."
              className="bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none w-48 sm:w-64"
            />
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-700 text-zinc-500 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-600 rounded">
            ⌘K
          </kbd>
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && (matchedCustomers.length > 0 || matchedOrders.length > 0 || matchedDesigns.length > 0) && (
          <div className="absolute top-full mt-1.5 left-0 w-full max-h-80 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[8px] shadow-lg py-1.5 z-50">
            {matchedCustomers.length > 0 && (
              <div className="p-1">
                <div className="px-2 py-1 text-[11px] font-medium text-zinc-400">Clients</div>
                {matchedCustomers.slice(0, 3).map((cust) => (
                  <button
                    key={cust.id}
                    onClick={() => {
                      setSelectedCustomer(cust);
                      onNavigate(currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers');
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-[6px] hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{cust.businessName}</span>
                    <span className="text-zinc-400">{cust.city}</span>
                  </button>
                ))}
              </div>
            )}
            {matchedOrders.length > 0 && (
              <div className="p-1 border-t border-zinc-100 dark:border-zinc-800">
                <div className="px-2 py-1 text-[11px] font-medium text-zinc-400">Orders</div>
                {matchedOrders.slice(0, 3).map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => {
                      onNavigate(currentUser.role === 'admin' ? '/admin/orders' : '/sales/orders');
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-[6px] hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{ord.id}</span>
                    <span className="text-zinc-400">{ord.customerName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions: + New, Notifications, Avatar */}
      <div className="flex items-center gap-2">
        {/* + New Dropdown */}
        <div ref={newMenuRef} className="relative">
          <button
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            className="h-8 px-2.5 rounded-[6px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Icon icon={Plus} size={14} />
            <span className="hidden sm:inline">New</span>
          </button>

          {isNewMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[8px] shadow-lg p-1 z-50">
              <button
                onClick={() => {
                  setIsCreateOrderModalOpen(true);
                  setIsNewMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-[6px] flex items-center gap-2"
              >
                <Icon icon={Icons.Orders} size={14} className="text-zinc-400" />
                <span>New order</span>
              </button>
              <button
                onClick={() => {
                  setIsPaymentModalOpen(true);
                  setIsNewMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-[6px] flex items-center gap-2"
              >
                <Icon icon={Icons.Payments} size={14} className="text-zinc-400" />
                <span>Record payment</span>
              </button>
              <button
                onClick={() => {
                  setIsAddCustomerModalOpen(true);
                  setIsNewMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-[6px] flex items-center gap-2"
              >
                <Icon icon={Icons.Clients} size={14} className="text-zinc-400" />
                <span>New client</span>
              </button>
              <button
                onClick={() => {
                  setIsShareModalOpen(true);
                  setIsNewMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-[6px] flex items-center gap-2"
              >
                <Icon icon={Icons.Share} size={14} className="text-zinc-400" />
                <span>Share lookbook</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            className="w-8 h-8 rounded-[6px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center relative transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Icon icon={Bell} size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-600" />
            )}
          </button>

          {isNotifDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[8px] shadow-lg p-1.5 z-50">
              <div className="px-2.5 py-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-1.5 flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && <span className="text-[11px] text-zinc-400">{unreadCount} unread</span>}
              </div>
              <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-3">No notifications</p>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-2 rounded-[6px] text-xs cursor-pointer ${
                        !n.read ? 'bg-blue-50/50 dark:bg-blue-950/20 font-medium' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="text-zinc-900 dark:text-zinc-100">{n.title}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">{n.desc || (n as any).message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Menu */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold flex items-center justify-center cursor-pointer select-none"
            title={currentUser.name}
          >
            {currentUser.initials}
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[8px] shadow-lg p-1 z-50">
              <div className="px-2.5 py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">{currentUser.name}</div>
                <div className="text-[11px] text-zinc-400 truncate">{currentUser.roleLabel}</div>
              </div>
              <button
                onClick={() => {
                  switchRole(currentUser.role === 'admin' ? 'salesperson' : 'admin');
                  setIsProfileMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-[6px] flex items-center justify-between"
              >
                <span>Switch to {currentUser.role === 'admin' ? 'Salesman' : 'Trader'}</span>
                <Icon icon={ArrowLeftRight} size={13} className="text-zinc-400" />
              </button>
              <button
                onClick={() => {
                  logout();
                  setIsProfileMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-[6px] flex items-center justify-between"
              >
                <span>Sign out</span>
                <Icon icon={LogOut} size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
