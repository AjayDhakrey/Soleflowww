import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  HelpCircle,
  Bell,
  ChevronDown,
  ShoppingBag,
  CreditCard,
  UserPlus,
  Share2,
  X,
  Building,
  CheckCircle2,
  ExternalLink,
  PanelLeft,
  LogOut,
  Phone,
  FileText,
  Layers,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
    manufacturers,
    notifications,
    markNotificationAsRead,
    setIsPaymentModalOpen,
    setIsCreateOrderModalOpen,
    setIsAddCustomerModalOpen,
    setIsShareModalOpen,
    setSelectedCustomer,
    isSidebarCollapsed,
    toggleSidebar,
    toggleMobileSidebar,
    logout,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState<'all' | 'customers' | 'orders' | 'designs'>('all');

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const newMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

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
        setIsHelpOpen(false);
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
      if (helpRef.current && !helpRef.current.contains(target)) {
        setIsHelpOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search results
  const q = searchQuery.toLowerCase().trim();
  const matchedCustomers = q
    ? customers.filter(
        (c) =>
          c.businessName.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.gstin.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.propName.toLowerCase().includes(q)
      )
    : [];

  const matchedOrders = q
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.items.some((i) => i.designName.toLowerCase().includes(q))
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

  const totalMatches = matchedCustomers.length + matchedOrders.length + matchedDesigns.length;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-3 sm:px-5 md:px-6 flex items-center justify-between sticky top-0 z-40 select-none gap-3 box-border">
      {/* ========================================================================= */}
      {/* 1. Mobile Search Modal Overlay (< sm screens)                             */}
      {/* ========================================================================= */}
      {isSearchOpen && (
        <div className="sm:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex flex-col">
          <div className="bg-white p-3 border-b border-slate-200 flex items-center gap-2 shadow-sm">
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 shrink-0 cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search accounts, ledger, orders, designs..."
                className="w-full h-10 pl-9 pr-8 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 bg-white overflow-y-auto divide-y divide-slate-100 p-2">
            {!q ? (
              <div className="p-4 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Navigation
                </span>
                <button
                  onClick={() => {
                    onNavigate(currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers');
                    setIsSearchOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-left border border-slate-100"
                >
                  <span className="text-xs font-bold text-slate-800">Customer Accounts & Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setIsCreateOrderModalOpen(true);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-left border border-slate-100"
                >
                  <span className="text-xs font-bold text-slate-800">New Wholesale Order</span>
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                </button>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setIsPaymentModalOpen(true);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-left border border-slate-100"
                >
                  <span className="text-xs font-bold text-slate-800">Record Customer Payment</span>
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                </button>
              </div>
            ) : totalMatches === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No matching accounts, orders, or shoe designs for "{searchQuery}".
              </div>
            ) : (
              <>
                {matchedCustomers.length > 0 && (
                  <div className="p-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                      Wholesale Accounts ({matchedCustomers.length})
                    </span>
                    {matchedCustomers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer(c);
                          onNavigate(currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-900">{c.businessName}</div>
                          <div className="text-[11px] text-slate-500">{c.city} • Prop: {c.propName}</div>
                        </div>
                        <span className={`text-xs font-bold ${c.amountDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {c.amountDue > 0 ? `₹${(c.amountDue / 100000).toFixed(2)}L Due` : 'Cleared'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {matchedOrders.length > 0 && (
                  <div className="p-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                      Orders ({matchedOrders.length})
                    </span>
                    {matchedOrders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          onNavigate(currentUser.role === 'admin' ? '/admin/orders' : '/sales/orders');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-xs text-blue-600 font-mono">{o.id} - {o.customerName}</div>
                          <div className="text-[11px] text-slate-500">{o.pairsCount} Pairs • ₹{o.netPayable.toLocaleString('en-IN')}</div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{o.status}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Left Slot: Mobile Hamburger + Brand / Collapsed Sidebar Toggle          */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Hamburger toggle button (< md screens) */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden h-10 w-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors flex items-center justify-center cursor-pointer shrink-0"
          aria-label="Open navigation menu"
          title="Open Menu"
        >
          <PanelLeft className="w-5 h-5 text-slate-700" />
        </button>

        {/* Mobile Brand (visible only on mobile where desktop sidebar is hidden) */}
        <div
          onClick={() => onNavigate(currentUser.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard')}
          className="md:hidden flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-xs">
            <svg
              className="w-4 h-4 text-blue-400"
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
          <span className="font-extrabold text-sm tracking-tight text-slate-900">
            SoleFlow
          </span>
        </div>

        {/* Desktop Sidebar Toggle icon when sidebar is collapsed */}
        {isSidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="hidden md:flex h-10 w-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors items-center justify-center cursor-pointer shrink-0"
            title="Expand Sidebar (Ctrl+B)"
            aria-label="Expand Sidebar"
          >
            <PanelLeft className="w-4 h-4 text-slate-700" />
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. Center Slot: Perfectly Aligned Desktop Search Bar with Command Palette   */}
      {/* ========================================================================= */}
      <div ref={searchRef} className="relative flex-1 max-w-lg min-w-0 hidden sm:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search accounts, orders, articles..."
            className="w-full h-10 pl-10 pr-14 text-[13px] bg-slate-50/90 hover:bg-slate-100/70 focus:bg-white border border-slate-200/90 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 placeholder-slate-400 font-normal"
          />
          <div className="absolute right-3 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-200/60 rounded border border-slate-300 pointer-events-none select-none">
                ⌘K
              </kbd>
            )}
          </div>
        </div>

        {/* Global Search Results Dropdown - Perfectly Anchored Directly Below Search Box */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 max-h-[75vh] overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1">
            {!q ? (
              /* Quick Navigation / Recent Accounts view when query is blank */
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Navigation &amp; Actions
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Press Esc to exit</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onNavigate(currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers');
                      setIsSearchOpen(false);
                    }}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 text-left transition-colors flex items-center gap-2.5 group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Building className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                        Customer Ledger
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">Outstanding balances</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setIsCreateOrderModalOpen(true);
                    }}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-left transition-colors flex items-center gap-2.5 group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                        New Order
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">Book wholesale batch</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setIsPaymentModalOpen(true);
                    }}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 text-left transition-colors flex items-center gap-2.5 group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 truncate">
                        Record Payment
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">NEFT / Cheque / Cash</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate(currentUser.role === 'admin' ? '/admin/designs' : '/sales/designs');
                      setIsSearchOpen(false);
                    }}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/40 text-left transition-colors flex items-center gap-2.5 group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700 truncate">
                        Shoe Catalogue
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">Articles, rates &amp; MOQs</div>
                    </div>
                  </button>
                </div>

                {/* Top Wholesale Accounts */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Frequent Accounts
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {customers.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer(c);
                          onNavigate(currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers');
                          setIsSearchOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>{c.businessName}</span>
                        <span className={`text-[10px] ${c.amountDue > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}`}>
                          {c.amountDue > 0 ? `₹${(c.amountDue / 100000).toFixed(1)}L` : 'Cleared'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : totalMatches === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No matching accounts, orders, or shoe designs for "{searchQuery}".
              </div>
            ) : (
              <>
                {/* Result Category Filter Pills */}
                <div className="px-3.5 py-2 bg-slate-50/80 flex items-center gap-1.5 text-[11px]">
                  <button
                    onClick={() => setSearchFilter('all')}
                    className={`px-2.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                      searchFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({totalMatches})
                  </button>
                  {matchedCustomers.length > 0 && (
                    <button
                      onClick={() => setSearchFilter('customers')}
                      className={`px-2.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                        searchFilter === 'customers' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Accounts ({matchedCustomers.length})
                    </button>
                  )}
                  {matchedOrders.length > 0 && (
                    <button
                      onClick={() => setSearchFilter('orders')}
                      className={`px-2.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                        searchFilter === 'orders' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Orders ({matchedOrders.length})
                    </button>
                  )}
                  {matchedDesigns.length > 0 && (
                    <button
                      onClick={() => setSearchFilter('designs')}
                      className={`px-2.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                        searchFilter === 'designs' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Articles ({matchedDesigns.length})
                    </button>
                  )}
                </div>

                {/* Customers Group */}
                {(searchFilter === 'all' || searchFilter === 'customers') && matchedCustomers.length > 0 && (
                  <div className="p-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                      Wholesale Accounts ({matchedCustomers.length})
                    </span>
                    {matchedCustomers.map((cust) => (
                      <button
                        key={cust.id}
                        onClick={() => {
                          setSelectedCustomer(cust);
                          onNavigate(currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {cust.businessName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {cust.city}, {cust.state}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Prop: {cust.propName} • GST: {cust.gstin}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold shrink-0 ml-2 ${
                            cust.amountDue > 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {cust.amountDue > 0
                            ? `₹${(cust.amountDue / 100000).toFixed(2)}L Due`
                            : 'Cleared'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Orders Group */}
                {(searchFilter === 'all' || searchFilter === 'orders') && matchedOrders.length > 0 && (
                  <div className="p-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                      Wholesale Orders ({matchedOrders.length})
                    </span>
                    {matchedOrders.map((ord) => (
                      <button
                        key={ord.id}
                        onClick={() => {
                          onNavigate(currentUser.role === 'admin' ? '/admin/orders' : '/sales/orders');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-600 font-mono">
                              {ord.id}
                            </span>
                            <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {ord.customerName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {ord.pairsCount} Pairs • {ord.manufacturerPlant}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0 ml-2">
                          {ord.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Shoe Designs Group */}
                {(searchFilter === 'all' || searchFilter === 'designs') && matchedDesigns.length > 0 && (
                  <div className="p-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                      Shoe Designs ({matchedDesigns.length})
                    </span>
                    {matchedDesigns.map((des) => (
                      <button
                        key={des.id}
                        onClick={() => {
                          onNavigate(currentUser.role === 'admin' ? '/admin/designs' : '/sales/designs');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors group cursor-pointer"
                      >
                        <img
                          src={des.image}
                          alt={des.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors block truncate">
                            {des.name} ({des.articleCode})
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            ₹{des.price.toLocaleString('en-IN')}/pair • MOQ {des.moqPairs} Prs
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. Right Slot: Mode Pill, + New Button, Help Desk, Alerts, Profile Avatar  */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Mobile Search Button (< sm screens) */}
        <button
          onClick={() => {
            setIsSearchOpen(true);
            setTimeout(() => searchInputRef.current?.focus(), 50);
          }}
          className="sm:hidden h-10 w-10 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-colors cursor-pointer shrink-0"
          title="Search"
          aria-label="Open search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Trader Mode Switcher Pill (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 h-10 px-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs box-border">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              currentUser.role === 'admin'
                ? 'bg-blue-600 ring-3 ring-blue-100'
                : 'bg-emerald-500 ring-3 ring-emerald-100'
            }`}
          />
          <span className="font-semibold text-slate-700 whitespace-nowrap">
            {currentUser.role === 'admin' ? 'Trader Admin' : 'Sales Rep'}
          </span>
          <button
            onClick={() => {
              switchRole(currentUser.role === 'admin' ? 'salesperson' : 'admin');
              onNavigate(currentUser.role === 'admin' ? '/sales/dashboard' : '/admin/dashboard');
            }}
            className="text-[11px] text-blue-600 hover:text-blue-800 font-bold ml-1 pl-2 border-l border-slate-200 cursor-pointer transition-colors whitespace-nowrap"
            title="Switch User Role"
          >
            Switch
          </button>
        </div>

        {/* + New Primary Action Button with Dropdown */}
        <div ref={newMenuRef} className="relative">
          <button
            onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
            className="h-10 px-3 sm:px-3.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer box-border"
            title="Create New Transaction"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">New</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isNewMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
              <button
                onClick={() => {
                  setIsNewMenuOpen(false);
                  setIsCreateOrderModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">New Wholesale Order</div>
                  <div className="text-[10px] text-slate-400">Book footwear carton batches</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsNewMenuOpen(false);
                  setIsPaymentModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Record Payment</div>
                  <div className="text-[10px] text-slate-400">Post NEFT / Cheque / Cash</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsNewMenuOpen(false);
                  setIsAddCustomerModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <UserPlus className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Add Wholesale Buyer</div>
                  <div className="text-[10px] text-slate-400">Onboard retail shop / dealer</div>
                </div>
              </button>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={() => {
                  setIsNewMenuOpen(false);
                  setIsShareModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Share WhatsApp Lookbook</div>
                  <div className="text-[10px] text-slate-400">Send catalogue with MOQ</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Support & Shortcuts Desk Button */}
        <div ref={helpRef} className="relative hidden sm:block">
          <button
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer box-border"
            title="Assistance & Shortcuts"
            aria-label="Support desk"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {isHelpOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 z-50 animate-in fade-in slide-in-from-top-1 text-left">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  SF
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">SoleFlow Support Desk</h4>
                  <p className="text-[10px] text-slate-500">B2B Footwear Wholesale Platform</p>
                </div>
              </div>

              <div className="py-2.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Helpline</span>
                  </span>
                  <a href="tel:+919876543210" className="font-bold text-blue-600 hover:underline">
                    +91 98765 43210
                  </a>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Operating Hours</span>
                  </span>
                  <span className="font-medium text-slate-800">9 AM - 8 PM IST</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Keyboard Shortcuts
                </span>
                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Search accounts &amp; orders</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] border border-slate-200">⌘K</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Toggle navigation sidebar</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] border border-slate-200">⌘B</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Close popups &amp; menus</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] border border-slate-200">Esc</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon with Counter Badge */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors relative cursor-pointer box-border"
            title="Notifications & Trade Alerts"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 text-left">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <span className="text-xs font-bold text-slate-900">
                  Trade Alerts &amp; Notifications
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {unreadCount} unread
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationAsRead(notif.id);
                      if (notif.linkTab) {
                        onNavigate(
                          currentUser.role === 'admin'
                            ? `/admin/${notif.linkTab}`
                            : `/sales/${notif.linkTab}`
                        );
                      }
                      setIsNotifDropdownOpen(false);
                    }}
                    className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                      notif.read ? 'opacity-60' : 'bg-blue-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-900 leading-snug">
                        {notif.title}
                      </h5>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {notif.desc}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    onNavigate(
                      currentUser.role === 'admin'
                        ? '/admin/notifications'
                        : '/sales/notifications'
                    );
                    setIsNotifDropdownOpen(false);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Photo Avatar with Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="h-10 pl-1.5 pr-2 sm:pr-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/80 transition-colors flex items-center gap-2 cursor-pointer box-border"
            title={`${currentUser.name} (${currentUser.roleLabel})`}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300 shrink-0"
            />
            <div className="hidden md:block text-left">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-500 block leading-none">
                {currentUser.roleLabel}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block shrink-0" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in slide-in-from-top-1 text-left">
              <div className="p-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</p>
                <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>{currentUser.zone} • {currentUser.roleLabel}</span>
                </div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    switchRole(currentUser.role === 'admin' ? 'salesperson' : 'admin');
                    onNavigate(currentUser.role === 'admin' ? '/sales/dashboard' : '/admin/dashboard');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Switch to {currentUser.role === 'admin' ? 'Salesperson' : 'Admin'} Mode</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center justify-between transition-colors mt-0.5 cursor-pointer"
                >
                  <span>Sign Out</span>
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
