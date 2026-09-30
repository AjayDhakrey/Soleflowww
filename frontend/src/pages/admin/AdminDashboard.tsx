import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useCustomerMetrics, formatIndianCurrency } from '../../hooks/useCustomerMetrics';
import { CustomerRowActionMenu } from '../../components/customers/CustomerRowActionMenu';
import {
  Users,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Plus,
  Search,
  Store,
  Eye,
  MoreVertical,
  Zap,
  ShoppingBag,
  TrendingUp,
  Package,
  UserPlus,
  CreditCard,
  ArrowUpRight,
  SunMedium,
  Check,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    customers,
    orders,
    setIsPaymentModalOpen,
    setIsCreateOrderModalOpen,
    setIsAddCustomerModalOpen,
    showToast,
  } = useApp();

  const metrics = useCustomerMetrics();

  const [searchFilter, setSearchFilter] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');

  const STORE_THUMBNAILS: Record<string, string> = {
    'ABC Footwear': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=120&q=80',
    'Regal Footwear Hub': 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=120&q=80',
    'Delhi Walkways Hub': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=120&q=80',
    'Kanpur Leather Mart': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=120&q=80',
    'ABC Footwear Hub': 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=120&q=80',
  };

  const filteredAccounts = React.useMemo(() => {
    return metrics.allCustomers.filter((c) => {
      const query = searchFilter.toLowerCase();
      const matchesSearch =
        c.businessName.toLowerCase().includes(query) ||
        (c.propName && c.propName.toLowerCase().includes(query)) ||
        c.city.toLowerCase().includes(query) ||
        (c.address && c.address.toLowerCase().includes(query)) ||
        (c.gstin && c.gstin.toLowerCase().includes(query)) ||
        c.phone.includes(query);

      if (!matchesSearch) return false;
      if (accountTypeFilter === 'overdue') return (c.amountDue || 0) > 0 && (c.overdueDays > 0 || c.status === 'overdue');
      if (accountTypeFilter === 'active') return c.status === 'active' || ((c.amountDue || 0) === 0 && (c.ordersCount || 0) > 0);
      if (accountTypeFilter === 'hold') return c.status === 'hold' || c.status === 'credit_hold';
      return true;
    });
  }, [metrics.allCustomers, searchFilter, accountTypeFilter]);

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'Overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50">
            Overdue
          </span>
        );
      case 'Active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
            Active
          </span>
        );
      case 'Credit Hold':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50">
            Credit Hold
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1700px] w-full mx-auto pb-24 md:pb-12 bg-background text-foreground">
      {/* 1. Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl select-none" role="img" aria-label="sun">
              ☀️
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Good morning, {currentUser.name}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening with your shoe wholesale business today.
          </p>
        </div>
      </div>

      {/* 2. Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Customers */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Open Total Customers details"
          onClick={() => onNavigate('/admin/customers/insights/total?from=/admin/dashboard')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('/admin/customers/insights/total?from=/admin/dashboard');
            }
          }}
          className="bg-surface border border-border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer group flex items-start justify-between"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users size={22} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total Customers</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight tabular-nums">
                {metrics.totalCustomers}
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium">
                {metrics.trends.totalCustomers && (
                  <span className={`font-bold inline-flex items-center ${
                    metrics.trends.totalCustomers.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {metrics.trends.totalCustomers.value}
                  </span>
                )}
                <span className="text-muted-foreground">Active dealer accounts</span>
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all mt-1" />
        </div>

        {/* Card 2: Total Receivables */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Open Total Receivables details"
          onClick={() => onNavigate('/admin/customers/insights/receivables?from=/admin/dashboard')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('/admin/customers/insights/receivables?from=/admin/dashboard');
            }
          }}
          className="bg-surface border border-border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-rose-500/40 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all cursor-pointer group flex items-start justify-between"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Wallet size={22} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total Receivables</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight tabular-nums">
                {formatIndianCurrency(metrics.totalReceivables, true)}
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium">
                {metrics.trends.totalReceivables && (
                  <span className={`font-bold inline-flex items-center ${
                    metrics.trends.totalReceivables.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {metrics.trends.totalReceivables.value}
                  </span>
                )}
                <span className="text-muted-foreground">Outstanding ledger balance</span>
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all mt-1" />
        </div>

        {/* Card 3: Overdue Accounts */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Open Overdue Accounts details"
          onClick={() => onNavigate('/admin/customers/insights/overdue?from=/admin/dashboard')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('/admin/customers/insights/overdue?from=/admin/dashboard');
            }
          }}
          className="bg-surface border border-border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer group flex items-start justify-between"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={22} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Overdue Accounts</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight tabular-nums">
                {metrics.overdueAccounts}
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium">
                {metrics.trends.overdueAccounts && (
                  <span className={`font-bold inline-flex items-center ${
                    metrics.trends.overdueAccounts.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {metrics.trends.overdueAccounts.value}
                  </span>
                )}
                <span className="text-muted-foreground">Exceeded credit cycle</span>
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all mt-1" />
        </div>

        {/* Card 4: Cleared Accounts */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Open Cleared Accounts details"
          onClick={() => onNavigate('/admin/customers/insights/cleared?from=/admin/dashboard')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('/admin/customers/insights/cleared?from=/admin/dashboard');
            }
          }}
          className="bg-surface border border-border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer group flex items-start justify-between"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Cleared Accounts</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight tabular-nums">
                {metrics.clearedAccounts}
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium">
                {metrics.trends.clearedAccounts && (
                  <span className={`font-bold inline-flex items-center ${
                    metrics.trends.clearedAccounts.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {metrics.trends.clearedAccounts.value}
                  </span>
                )}
                <span className="text-muted-foreground">Zero pending balance</span>
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all mt-1" />
        </div>
      </div>

      {/* 3. Full-Width Customers & Store Accounts Panel */}
      <div className="w-full bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden">
        {/* Header: Title + Action Buttons */}
        <div className="p-5 md:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs border border-emerald-100 dark:border-emerald-900/40">
              <Store size={22} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground leading-tight">
                Customers &amp; Store Accounts
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage retailer store profiles, outstanding ledgers, credit terms, and order history.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 hover:bg-blue-100/60 dark:bg-blue-950/30 dark:hover:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>₹</span>
              <span>Record Payment</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddCustomerModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Client</span>
            </button>
          </div>
        </div>

        {/* Filter Bar: Search + Account Status Dropdown */}
        <div className="p-4 md:px-6 bg-surface border-b border-border flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by store name, proprietor, city, GSTIN, phone..."
              className="w-full h-10 pl-10 pr-4 bg-muted/40 hover:bg-muted/70 focus:bg-surface border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="w-full sm:w-48 shrink-0">
            <select
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value)}
              className="w-full h-10 px-3 bg-muted/40 hover:bg-muted/70 focus:bg-surface border border-border rounded-xl text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              <option value="all">All Accounts</option>
              <option value="active">Active Only</option>
              <option value="overdue">Overdue Only</option>
              <option value="hold">Credit Hold</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold uppercase text-[11px] tracking-wider bg-muted/25">
                <th className="py-3.5 px-4 md:px-6">Store &amp; Proprietor</th>
                <th className="py-3.5 px-4">GSTIN</th>
                <th className="py-3.5 px-4">Location Hub</th>
                <th className="py-3.5 px-4">Phone / Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Credit Limit</th>
                <th className="py-3.5 px-4">Balance Due</th>
                <th className="py-3.5 px-4 md:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAccounts.map((account) => {
                const thumb = STORE_THUMBNAILS[account.businessName] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=120&q=80';
                const initials = account.businessName
                  .trim()
                  .split(' ')
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase();

                const isOverdue = (account.amountDue || 0) > 0 && (account.overdueDays > 0 || account.status === 'overdue');
                const isHold = account.status === 'hold' || account.status === 'credit_hold';
                const displayStatus = isOverdue ? 'Overdue' : isHold ? 'Credit Hold' : 'Active';

                return (
                  <tr
                    key={account.id}
                    onClick={() => onNavigate(`/admin/customers/${account.id}?from=/admin/dashboard`)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    {/* Store & Proprietor */}
                    <td className="py-3.5 px-4 md:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {initials}
                        </div>
                        <img
                          src={thumb}
                          alt={account.businessName}
                          className="w-10 h-8 rounded-lg object-cover border border-border shrink-0 bg-muted hidden sm:block"
                        />
                        <div>
                          <div className="font-bold text-foreground text-xs sm:text-sm leading-tight group-hover:text-blue-600 transition-colors">
                            {account.businessName}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {account.propName || account.city}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* GSTIN */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs text-muted-foreground">
                        {account.gstin || '09AAACA1234F1Z5'}
                      </span>
                    </td>

                    {/* Location Hub */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground text-xs sm:text-sm leading-tight">
                        {account.city}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[140px]">
                        {account.address || 'Market Complex'}
                      </div>
                    </td>

                    {/* Phone / Contact */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-foreground font-medium">
                        {account.phone}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusPill(displayStatus)}
                    </td>

                    {/* Credit Limit */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-muted-foreground text-xs sm:text-sm">
                        {formatIndianCurrency(account.creditLimit || 500000, true)}
                      </span>
                    </td>

                    {/* Balance Due */}
                    <td className="py-3.5 px-4">
                      <span className={`font-bold font-mono text-xs sm:text-sm ${
                        isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
                      }`}>
                        {formatIndianCurrency(account.amountDue || 0)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 md:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onNavigate(`/admin/customers/${account.id}?from=/admin/dashboard`)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>Details</span>
                        </button>
                        <CustomerRowActionMenu customer={account} onNavigate={onNavigate} fromPath="/admin/dashboard" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Bottom 3-Card Grid: Promo + Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* 1. Sneaker Promo Banner Card */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-white dark:from-blue-950/40 dark:via-sky-950/20 dark:to-surface border border-blue-100 dark:border-blue-900/40 relative overflow-hidden shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-3 z-10 max-w-[60%]">
              <h3 className="text-base sm:text-lg font-bold text-blue-950 dark:text-blue-100 leading-tight">
                Good Business Starts with Good Shoes
              </h3>
              <div className="space-y-1.5 text-xs font-medium text-blue-900/80 dark:text-blue-200/80">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                  <span>Quality shoes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                  <span>Better margins</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                  <span>Happier customers</span>
                </div>
              </div>
            </div>

            {/* Sneaker Graphic */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80"
                alt="Shoe"
                className="w-full h-full object-contain relative z-10 drop-shadow-lg transform -rotate-12 hover:rotate-0 transition-transform duration-300"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-100/60 dark:border-blue-900/30 flex items-center justify-between text-xs text-blue-800 dark:text-blue-300 font-semibold">
            <span>Wholesale Line Sheet 2026</span>
            <span className="text-blue-600 dark:text-blue-400">SoleFlow Premium</span>
          </div>
        </div>

        {/* 2. Quick Actions Panel */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Zap size={18} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-foreground">
                Quick Actions
              </h3>
            </div>

            <div className="space-y-2 mt-3">
              {/* Add New Client */}
              <button
                type="button"
                onClick={() => setIsAddCustomerModalOpen(true)}
                className="w-full p-2.5 rounded-xl bg-surface hover:bg-muted/60 border border-border flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <UserPlus size={16} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    Add New Client
                  </span>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Create Order */}
              <button
                type="button"
                onClick={() => setIsCreateOrderModalOpen(true)}
                className="w-full p-2.5 rounded-xl bg-surface hover:bg-muted/60 border border-border flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <ShoppingBag size={16} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    Create Order
                  </span>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* View Reports */}
              <button
                type="button"
                onClick={() => onNavigate('/admin/reports')}
                className="w-full p-2.5 rounded-xl bg-surface hover:bg-muted/60 border border-border flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <TrendingUp size={16} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    View Reports
                  </span>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Manage Inventory */}
              <button
                type="button"
                onClick={() => onNavigate('/admin/designs')}
                className="w-full p-2.5 rounded-xl bg-surface hover:bg-muted/60 border border-border flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Package size={16} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    Manage Inventory
                  </span>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Recent Activity Feed */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="text-sm font-bold text-foreground">
                  Recent Activity
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/admin/orders')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-3 mt-3">
              {/* Activity Item 1 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShoppingBag size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      Order #ORD-0148 created
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      ABC Footwear
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  2h ago
                </span>
              </div>

              {/* Activity Item 2 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CreditCard size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      Payment received
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      ₹75,000 from Regal Footwear
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  4h ago
                </span>
              </div>

              {/* Activity Item 3 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <UserPlus size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      New customer added
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Delhi Walkways Hub
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  6h ago
                </span>
              </div>

              {/* Activity Item 4 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Package size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      Stock updated
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Kanpur Leather Mart
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  8h ago
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
