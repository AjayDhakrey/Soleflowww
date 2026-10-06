import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { useCustomerMetrics, formatIndianCurrency } from '../../../hooks/useCustomerMetrics';
import { Customer } from '../../../types';
import {
  CheckCircle2,
  ChevronLeft,
  Download,
  Search,
  Sparkles,
  Share2,
  Plus,
  Eye,
  ShoppingBag,
  ArrowUpDown,
  Calendar,
  Clock,
  TrendingUp,
  Store,
  DollarSign,
  MessageSquare,
} from 'lucide-react';

interface ClearedAccountsInsightPageProps {
  onNavigate: (path: string) => void;
  fromPath?: string;
}

export const ClearedAccountsInsightPage: React.FC<ClearedAccountsInsightPageProps> = ({
  onNavigate,
  fromPath = '/admin/dashboard',
}) => {
  const {
    currentUser,
    setSelectedCustomer,
    setIsShareModalOpen,
    setIsCreateOrderModalOpen,
    showToast,
  } = useApp();
  const metrics = useCustomerMetrics();

  const [search, setSearch] = useState('');
  const [salesmanFilter, setSalesmanFilter] = useState('all');
  const [reorderFilter, setReorderFilter] = useState<'all' | 'reorder_due' | 'recently_ordered'>('all');
  const [sortField, setSortField] = useState<'totalBusiness' | 'ordersCount' | 'businessName' | 'lastOrderDate'>('totalBusiness');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  // Filtered cleared clients
  const filteredClearedClients = useMemo(() => {
    return metrics.clearedCustomersList
      .filter((c) => {
        const q = search.toLowerCase();
        const matchesSearch =
          c.businessName.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          (c.propName && c.propName.toLowerCase().includes(q)) ||
          c.phone.includes(q);

        if (!matchesSearch) return false;
        if (salesmanFilter !== 'all' && c.salespersonId !== salesmanFilter) return false;

        const isReorderDue = !c.lastOrderDate || new Date(c.lastOrderDate) < sixtyDaysAgo;
        if (reorderFilter === 'reorder_due' && !isReorderDue) return false;
        if (reorderFilter === 'recently_ordered' && isReorderDue) return false;

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        if (sortField === 'lastOrderDate') {
          valA = new Date(valA || '2000-01-01').getTime();
          valB = new Date(valB || '2000-01-01').getTime();
        }
        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
      });
  }, [metrics.clearedCustomersList, search, salesmanFilter, reorderFilter, sortField, sortOrder, sixtyDaysAgo]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleOpenClient = (cust: Customer) => {
    setSelectedCustomer(cust);
    onNavigate(currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers');
  };

  const handleShareLookbook = (cust: Customer) => {
    setSelectedCustomer(cust);
    setIsShareModalOpen(true);
  };

  const handleCreateOrder = (cust: Customer) => {
    setSelectedCustomer(cust);
    setIsCreateOrderModalOpen(true);
  };

  const handleCreateFollowUp = (cust: Customer) => {
    showToast(`Re-order sales follow-up scheduled for ${cust.businessName}`);
  };

  const handleExportCSV = () => {
    const headers = ['Retailer Name', 'Proprietor', 'Phone', 'City', 'Salesperson', 'Orders Count', 'Total Lifetime Business (INR)', 'Outstanding (INR)', 'Last Payment Date', 'Last Order Date', 'Re-order Opportunity'];
    const rows = filteredClearedClients.map((c) => {
      const isReorder = !c.lastOrderDate || new Date(c.lastOrderDate) < sixtyDaysAgo;
      return [
        `"${c.businessName}"`,
        `"${c.propName || ''}"`,
        `"${c.phone}"`,
        `"${c.city}"`,
        `"${c.salespersonName || ''}"`,
        c.ordersCount || 0,
        c.totalBusiness || 0,
        0,
        `"${c.lastPaymentDate || ''}"`,
        `"${c.lastOrderDate || ''}"`,
        isReorder ? 'Yes' : 'No',
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `soleflow_cleared_accounts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Cleared accounts roster exported to CSV');
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto pb-24 md:pb-12 bg-background text-foreground">
      {/* 1. Breadcrumbs & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <button
              type="button"
              onClick={() => onNavigate(fromPath)}
              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              <span>Back to {fromPath.includes('dashboard') ? 'Dashboard' : 'Clients'}</span>
            </button>
            <span>/</span>
            <span className="text-muted-foreground">Insights</span>
            <span>/</span>
            <span className="text-foreground font-semibold">Cleared Accounts</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Cleared Accounts
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Prime retail clients with zero pending ledger balance — high-priority targets for new seasonal catalog orders.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-border bg-surface hover:bg-muted text-foreground text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Share2 size={16} />
            <span>Share Lookbook</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Row (4 Cards) */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-3.5 sm:gap-4">
        {/* Cleared Accounts */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs overflow-hidden min-w-0">
          <p className="text-xs font-semibold text-muted-foreground truncate" title="Cleared Accounts">Cleared Accounts</p>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <h3 title={`${metrics.clearedAccounts}`} className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums wrap-anywhere">
              {metrics.clearedAccounts}
            </h3>
            {metrics.trends.clearedAccounts && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                {metrics.trends.clearedAccounts.value}
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate" title="Zero pending balance on all bills">
            Zero pending balance on all bills
          </p>
        </div>

        {/* Lifetime Business */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs overflow-hidden min-w-0">
          <p className="text-xs font-semibold text-muted-foreground truncate" title="Lifetime Business">Lifetime Business</p>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <h3 title={formatIndianCurrency(metrics.clearedBusinessTotal)} className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-foreground tracking-tight tabular-nums wrap-anywhere">
              {formatIndianCurrency(metrics.clearedBusinessTotal, true)}
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate" title="Generated by fully cleared dealers">
            Generated by fully cleared dealers
          </p>
        </div>

        {/* Avg Days to Pay */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs overflow-hidden min-w-0">
          <p className="text-xs font-semibold text-muted-foreground truncate" title="Avg Payment Velocity">Avg Payment Velocity</p>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <h3 title={`${metrics.avgDaysToPay} Days`} className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-tight tabular-nums wrap-anywhere">
              {metrics.avgDaysToPay} Days
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate" title="Average realization cycle duration">
            Average realization cycle duration
          </p>
        </div>

        {/* Re-order Opportunities */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs overflow-hidden min-w-0">
          <p className="text-xs font-semibold text-muted-foreground truncate" title="Re-order Opportunities">Re-order Opportunities</p>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <h3 title={`${metrics.reorderOpportunities.length} Stores`} className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-tight tabular-nums wrap-anywhere">
              {metrics.reorderOpportunities.length} Stores
            </h3>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0">
              No orders &gt;60d
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate" title="Cleared ledger ready for new booking">
            Cleared ledger ready for new booking
          </p>
        </div>
      </div>

      {/* 3. Re-order Growth Spotlight & Ledger Reliability (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Re-order Growth Banner */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Sparkles className="text-amber-500" size={18} />
              <h3 className="text-sm font-bold text-foreground">Immediate Re-order Pipeline</h3>
            </div>

            <p className="text-xs text-muted-foreground my-3">
              Dealers who have fully cleared their previous invoices represent zero credit risk. Share the newest wholesale footwear catalogue to lock in new carton bookings immediately.
            </p>

            <div className="space-y-3">
              {metrics.reorderOpportunities.map((cust) => (
                <div key={cust.id} className="p-3.5 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-foreground truncate">{cust.businessName}</p>
                    <p className="text-xs text-muted-foreground">
                      {cust.city} • Last ordered: {cust.lastOrderDate || 'Over 60 days ago'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleShareLookbook(cust)}
                      className="px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-muted text-xs font-semibold text-foreground inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Share2 size={13} />
                      <span>Share</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateOrder(cust)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      <span>New Order</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Healthy credit standing: <strong className="text-emerald-600 dark:text-emerald-400">100% Cleared</strong></span>
          </div>
        </div>

        {/* Right: Payment Discipline Analysis */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Top Performing Accounts</h3>
                <p className="text-xs text-muted-foreground">Highest lifetime wholesale volume</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                VIP
              </span>
            </div>

            <div className="divide-y divide-border/60 mt-2">
              {metrics.clearedCustomersList.slice(0, 3).map((cust, idx) => (
                <div key={cust.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      onClick={() => handleOpenClient(cust)}
                      className="font-bold text-xs sm:text-sm text-foreground truncate hover:text-blue-600 cursor-pointer"
                    >
                      {cust.businessName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {cust.city} • {cust.ordersCount} Orders Completed
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-xs sm:text-sm text-foreground tabular-nums">
                      {formatIndianCurrency(cust.totalBusiness)}
                    </p>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Zero Balance
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Credit limit expansion eligible: <strong className="text-foreground">Yes</strong></span>
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cleared accounts by name, city, proprietor..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Re-order Filter */}
          <select
            value={reorderFilter}
            onChange={(e) => setReorderFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">All Cleared Accounts</option>
            <option value="reorder_due">Re-order Opportunities (&gt;60d)</option>
            <option value="recently_ordered">Recently Ordered</option>
          </select>

          {/* Salesman Filter */}
          {currentUser.role === 'admin' && (
            <select
              value={salesmanFilter}
              onChange={(e) => setSalesmanFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Sales Reps</option>
              {metrics.salesmanBreakdown.map((s) => (
                <option key={s.salesmanId} value={s.salesmanId}>{s.salesmanName}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 5. Master Cleared Table */}
      <div className="bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Zero-Balance Dealer Accounts</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              {filteredClearedClients.length} Accounts
            </span>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Fully settled accounts ready for catalogue sharing and re-booking
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th
                  onClick={() => handleSort('businessName')}
                  className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Retailer Client</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4">Sales Rep</th>
                <th
                  onClick={() => handleSort('ordersCount')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Orders</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalBusiness')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Lifetime Business</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4">Last Payment Date</th>
                <th
                  onClick={() => handleSort('lastOrderDate')}
                  className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Last Order</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Opportunity Status</th>
                <th className="py-3 px-4 text-right">Growth Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredClearedClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground">
                    <Store size={44} className="mx-auto mb-2 text-muted-foreground/40" />
                    <p className="font-bold text-foreground text-base">No fully cleared accounts yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">As customer payments are recorded and outstanding balances reach zero, they will appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredClearedClients.map((cust) => {
                  const isReorderDue = !cust.lastOrderDate || new Date(cust.lastOrderDate) < sixtyDaysAgo;

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      {/* Retailer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-900/50">
                            {getInitials(cust.businessName)}
                          </div>
                          <div>
                            <p
                              onClick={() => handleOpenClient(cust)}
                              className="font-bold text-foreground group-hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              {cust.businessName}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <span>{cust.city}</span>
                              <span>•</span>
                              <span>{cust.propName}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Sales Rep */}
                      <td className="py-3.5 px-4 text-xs font-medium text-foreground">
                        {cust.salespersonName || 'Unassigned'}
                      </td>

                      {/* Orders */}
                      <td className="py-3.5 px-4 text-center font-bold text-foreground tabular-nums">
                        {cust.ordersCount || 0}
                      </td>

                      {/* Total Business */}
                      <td className="py-3.5 px-4 text-right font-bold text-foreground tabular-nums">
                        {formatIndianCurrency(cust.totalBusiness || 0)}
                      </td>

                      {/* Last Payment */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {cust.lastPaymentDate || 'Settled'}
                      </td>

                      {/* Last Order */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {cust.lastOrderDate || 'Over 60d'}
                      </td>

                      {/* Re-order Tag */}
                      <td className="py-3.5 px-4 text-center">
                        {isReorderDue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50">
                            <Sparkles size={11} />
                            <span>Re-order Opportunity</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
                            Active Buyer
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Share Lookbook */}
                          <button
                            type="button"
                            onClick={() => handleShareLookbook(cust)}
                            className="p-1.5 rounded-lg border border-border hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                            title="Share Lookbook Catalogue"
                          >
                            <Share2 size={15} />
                          </button>

                          {/* New Order */}
                          <button
                            type="button"
                            onClick={() => handleCreateOrder(cust)}
                            className="px-2 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                            title="Create New Wholesale Order"
                          >
                            <Plus size={14} strokeWidth={2.5} />
                            <span>Order</span>
                          </button>

                          {/* Open Client */}
                          <button
                            type="button"
                            onClick={() => handleOpenClient(cust)}
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
                            title="View Ledger"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
