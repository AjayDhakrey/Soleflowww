import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { useCustomerMetrics, formatIndianCurrency } from '../../../hooks/useCustomerMetrics';
import { Customer } from '../../../types';
import {
  Users,
  ChevronLeft,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Phone,
  MapPin,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  TrendingUp,
  Store,
  UserCheck,
  UserX,
  Plus,
} from 'lucide-react';

interface TotalCustomersInsightPageProps {
  onNavigate: (path: string) => void;
  fromPath?: string;
}

export const TotalCustomersInsightPage: React.FC<TotalCustomersInsightPageProps> = ({
  onNavigate,
  fromPath = '/admin/dashboard',
}) => {
  const { currentUser, setSelectedCustomer, setIsAddCustomerModalOpen, showToast } = useApp();
  const metrics = useCustomerMetrics();

  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [salesmanFilter, setSalesmanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [timeRange, setTimeRange] = useState<'this_month' | '30d' | '90d' | 'this_year' | 'all'>('all');
  const [sortField, setSortField] = useState<'businessName' | 'totalBusiness' | 'amountDue' | 'ordersCount' | 'lastOrderDate'>('totalBusiness');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtered customers list
  const filteredCustomers = useMemo(() => {
    return metrics.allCustomers.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        c.businessName.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        (c.propName && c.propName.toLowerCase().includes(q)) ||
        c.phone.includes(q) ||
        (c.gstin && c.gstin.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (cityFilter !== 'all' && c.city !== cityFilter) return false;
      if (salesmanFilter !== 'all' && c.salespersonId !== salesmanFilter) return false;
      if (tierFilter !== 'all' && c.tier !== tierFilter) return false;

      if (statusFilter === 'active') return c.status === 'active' || (c.ordersCount > 0 && c.amountDue === 0);
      if (statusFilter === 'overdue') return (c.amountDue || 0) > 0 && (c.overdueDays > 0 || c.status === 'overdue');
      if (statusFilter === 'cleared') return c.ordersCount > 0 && (c.amountDue || 0) === 0;
      if (statusFilter === 'idle') return c.status === 'idle' || c.ordersCount === 0;

      return true;
    }).sort((a, b) => {
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
  }, [metrics.allCustomers, search, cityFilter, salesmanFilter, statusFilter, tierFilter, sortField, sortOrder]);

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

  const handleExportCSV = () => {
    const headers = ['Business Name', 'Contact Person', 'Phone', 'City', 'State', 'Salesperson', 'Tier', 'Status', 'Orders Count', 'Total Business (INR)', 'Amount Due (INR)', 'Last Order Date'];
    const rows = filteredCustomers.map((c) => [
      `"${c.businessName}"`,
      `"${c.propName || ''}"`,
      `"${c.phone}"`,
      `"${c.city}"`,
      `"${c.state}"`,
      `"${c.salespersonName || ''}"`,
      `"${c.tier || ''}"`,
      `"${c.status}"`,
      c.ordersCount || 0,
      c.totalBusiness || 0,
      c.amountDue || 0,
      `"${c.lastOrderDate || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `soleflow_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Customer roster exported to CSV');
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Mock monthly acquisition histogram
  const monthlyAcquisition = [
    { month: 'Oct', count: 1 },
    { month: 'Nov', count: 1 },
    { month: 'Dec', count: 2 },
    { month: 'Jan', count: 1 },
    { month: 'Feb', count: 1 },
    { month: 'Mar', count: 1 },
  ];
  const maxMonthCount = Math.max(...monthlyAcquisition.map((m) => m.count), 3);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto pb-24 md:pb-12 bg-background text-foreground">
      {/* 1. Breadcrumbs & Top Navigation */}
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
            <span className="text-foreground font-semibold">Total Customers</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users size={22} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Total Customers
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Comprehensive directory of verified footwear retailer accounts, tier breakdown, and regional coverage.
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
            onClick={() => setIsAddCustomerModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Row (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Customers */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs">
          <p className="text-xs font-semibold text-muted-foreground">Total Accounts</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight tabular-nums">
              {metrics.totalCustomers}
            </h3>
            {metrics.trends.totalCustomers && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {metrics.trends.totalCustomers.value}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Registered wholesale retail accounts
          </p>
        </div>

        {/* Active (90d) */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs">
          <p className="text-xs font-semibold text-muted-foreground">Active (Last 90d)</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums">
              {metrics.activeCustomers}
            </h3>
            <span className="text-xs font-medium text-muted-foreground">
              ({Math.round((metrics.activeCustomers / Math.max(1, metrics.totalCustomers)) * 100)}%)
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Placed ≥1 order in the last quarter
          </p>
        </div>

        {/* New This Month */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs">
          <p className="text-xs font-semibold text-muted-foreground">New This Month</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-tight tabular-nums">
              {metrics.newCustomersThisMonth}
            </h3>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-semibold">
              +14% vs last mo.
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Onboarded in current billing cycle
          </p>
        </div>

        {/* Inactive / Idle */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs">
          <p className="text-xs font-semibold text-muted-foreground">Inactive / Zero Orders</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl sm:text-3xl font-bold text-muted-foreground tracking-tight tabular-nums">
              {metrics.inactiveCustomers}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Accounts requiring sales reactivation
          </p>
        </div>
      </div>

      {/* 3. Analytics & Breakdowns (2 Columns: Left monthly trend, Right distribution bars) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Acquisition Chart */}
        <div className="lg:col-span-6 bg-surface border border-border rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground">New Retailers Onboarded</h3>
              <p className="text-xs text-muted-foreground">Monthly dealer network expansion trend</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
              6 Month Growth
            </span>
          </div>

          <div className="py-6">
            <div className="h-40 flex items-end gap-3 sm:gap-6 justify-between px-2">
              {monthlyAcquisition.map((item, idx) => {
                const heightPct = Math.round((item.count / maxMonthCount) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-xs font-bold text-foreground group-hover:text-blue-600 transition-colors">
                      {item.count}
                    </span>
                    <div className="w-full bg-muted rounded-t-lg h-28 flex items-end overflow-hidden">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-blue-600 hover:bg-blue-500 rounded-t-lg transition-all duration-300"
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Total network size: <strong className="text-foreground">{metrics.totalCustomers} Accounts</strong></span>
            <span>Avg onboarding: <strong className="text-foreground">1.2 stores/mo</strong></span>
          </div>
        </div>

        {/* Right: Regional & Tier Breakdowns */}
        <div className="lg:col-span-6 space-y-6">
          {/* City / Cluster Breakdown */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-foreground mb-1">Geographic Distribution</h3>
            <p className="text-xs text-muted-foreground mb-4">Client concentration across footwear wholesale hubs</p>
            
            <div className="space-y-3">
              {metrics.cityBreakdown.slice(0, 4).map((city, idx) => {
                const pct = Math.round((city.count / Math.max(1, metrics.totalCustomers)) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-foreground flex items-center gap-1.5">
                        <MapPin size={12} className="text-muted-foreground" />
                        {city.city}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{city.count} stores ({pct}%)</span>
                        <span className="font-semibold text-foreground">{formatIndianCurrency(city.totalBusiness, true)}</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier Breakdown */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-foreground mb-1">Dealer Tier Breakdown</h3>
            <p className="text-xs text-muted-foreground mb-4">Account classification by volume & distribution capacity</p>
            
            <div className="grid grid-cols-2 gap-3">
              {metrics.tierBreakdown.map((tier, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <p className="text-[11px] font-semibold text-muted-foreground truncate">{tier.tier}</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">{tier.count} Accounts</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                    {formatIndianCurrency(tier.totalBusiness, true)} Booked
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Filter & Search Toolbar */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by store name, proprietor, city, phone, GSTIN..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Date / Time Range Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'this_month', label: 'This Month' },
              { id: '90d', label: 'Last 90d' },
              { id: 'this_year', label: 'This Year' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeRange(t.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  timeRange === t.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-border">
          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Cities</option>
            {metrics.cityBreakdown.map((c) => (
              <option key={c.city} value={c.city}>{c.city} ({c.count})</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="overdue">Overdue Accounts</option>
            <option value="cleared">Cleared Accounts</option>
            <option value="idle">Idle / Zero Orders</option>
          </select>

          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Tiers</option>
            {metrics.tierBreakdown.map((t) => (
              <option key={t.tier} value={t.tier}>{t.tier}</option>
            ))}
          </select>

          {/* Salesman Filter (Admin only) */}
          {currentUser.role === 'admin' && (
            <select
              value={salesmanFilter}
              onChange={(e) => setSalesmanFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Sales Representatives</option>
              {metrics.salesmanBreakdown.map((s) => (
                <option key={s.salesmanId} value={s.salesmanId}>{s.salesmanName}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 5. Master Customers Table */}
      <div className="bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Registered Retail Accounts</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
              {filteredCustomers.length}
            </span>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Click any row to open ledger details and catalog orders
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
                <th className="py-3 px-4">Location</th>
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
                    <span>Total Business</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('amountDue')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Outstanding</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('lastOrderDate')}
                  className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Last Order</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <Store size={36} className="mx-auto mb-2 text-muted-foreground/40" />
                    <p className="font-semibold text-foreground text-sm">No customers found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try adjusting your search terms or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isOverdue = (cust.amountDue || 0) > 0 && (cust.overdueDays > 0 || cust.status === 'overdue');
                  const isCleared = cust.ordersCount > 0 && (cust.amountDue || 0) === 0;

                  return (
                    <tr
                      key={cust.id}
                      onClick={() => handleOpenClient(cust)}
                      className="hover:bg-muted/40 transition-colors cursor-pointer group"
                    >
                      {/* Retailer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/50">
                            {getInitials(cust.businessName)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground group-hover:text-blue-600 transition-colors">
                              {cust.businessName}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <span>{cust.propName}</span>
                              <span>•</span>
                              <span>{cust.phone}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-foreground">{cust.city}</p>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[120px]">{cust.state}</p>
                      </td>

                      {/* Salesman */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-foreground">{cust.salespersonName || 'Rahul Sharma'}</p>
                        <p className="text-[11px] text-muted-foreground">{cust.tier || 'Tier-1 Wholesale'}</p>
                      </td>

                      {/* Orders */}
                      <td className="py-3.5 px-4 text-center font-bold text-foreground tabular-nums">
                        {cust.ordersCount || 0}
                      </td>

                      {/* Total Business */}
                      <td className="py-3.5 px-4 text-right font-bold text-foreground tabular-nums">
                        {formatIndianCurrency(cust.totalBusiness || 0)}
                      </td>

                      {/* Outstanding */}
                      <td className="py-3.5 px-4 text-right tabular-nums">
                        <span className={`font-bold ${isOverdue ? 'text-rose-600 dark:text-rose-400' : isCleared ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                          {formatIndianCurrency(cust.amountDue || 0)}
                        </span>
                      </td>

                      {/* Last Order */}
                      <td className="py-3.5 px-4 text-muted-foreground text-xs whitespace-nowrap">
                        {cust.lastOrderDate || 'Recent'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isOverdue ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50">
                            Overdue
                          </span>
                        ) : isCleared ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
                            Cleared
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenClient(cust);
                          }}
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
                          title="View Ledger & Profile"
                        >
                          <Eye size={15} />
                        </button>
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
