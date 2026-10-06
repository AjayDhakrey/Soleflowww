import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Download,
  Filter,
  Eye,
  ChevronRight,
  Shield,
  Clock,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Users,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { usePlatformAccounts, PlatformAccount } from '../../hooks/usePlatformAccounts';
import { useViewMode } from '../../context/ViewModeContext';
import { AccountDetailDrawer } from '../../components/platform/AccountDetailDrawer';

interface AccountsPageProps {
  onNavigate: (path: string) => void;
}

export const AccountsPage: React.FC<AccountsPageProps> = ({ onNavigate }) => {
  const { data: accounts = [], isLoading, isError, error, refetch } = usePlatformAccounts();
  const { enterViewMode } = useViewMode();

  const [searchQuery, setSearchQuery] = useState('');
  const [healthFilter, setHealthFilter] = useState<'all' | 'active' | 'slowing' | 'inactive' | 'new'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [demoFilter, setDemoFilter] = useState<'all' | 'live' | 'demo'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'activity' | 'orders' | 'volume' | 'setup'>('newest');

  const [selectedAccount, setSelectedAccount] = useState<PlatformAccount | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Top Summary Statistics
  const stats = useMemo(() => {
    const totalAccounts = accounts.length;
    const active7d = accounts.filter((a) => a.days_since_last_activity <= 7).length;
    const newThisMonth = accounts.filter((a) => {
      const created = new Date(a.created_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
      return created >= thirtyDaysAgo;
    }).length;
    const inactive = accounts.filter((a) => a.days_since_last_activity > 30 || a.health === 'inactive').length;
    const totalVolume = accounts.reduce((sum, a) => sum + (Number(a.total_order_value) || 0), 0);

    return { totalAccounts, active7d, newThisMonth, inactive, totalVolume };
  }, [accounts]);

  // Filtered & Sorted Accounts
  const filteredAccounts = useMemo(() => {
    return accounts
      .filter((a) => {
        // Search
        const q = searchQuery.toLowerCase().trim();
        if (q) {
          const matchName = a.name.toLowerCase().includes(q);
          const matchOwner = a.owner_name?.toLowerCase().includes(q);
          const matchEmail = a.owner_email?.toLowerCase().includes(q);
          const matchPhone = a.owner_phone?.includes(q);
          if (!matchName && !matchOwner && !matchEmail && !matchPhone) return false;
        }

        // Health
        if (healthFilter !== 'all' && a.health !== healthFilter) return false;

        // Status
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;

        // Demo
        if (demoFilter === 'live' && a.is_demo) return false;
        if (demoFilter === 'demo' && !a.is_demo) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'activity') {
          return a.days_since_last_activity - b.days_since_last_activity;
        }
        if (sortBy === 'orders') {
          return b.orders_count - a.orders_count;
        }
        if (sortBy === 'volume') {
          return Number(b.total_order_value) - Number(a.total_order_value);
        }
        if (sortBy === 'setup') {
          return b.setup_percent - a.setup_percent;
        }
        return 0;
      });
  }, [accounts, searchQuery, healthFilter, statusFilter, demoFilter, sortBy]);

  // Handle Client-side CSV Export
  const exportAccountsToCSV = () => {
    if (filteredAccounts.length === 0) return;

    const headers = [
      'Organization Name',
      'Status',
      'Type',
      'Owner Name',
      'Owner Email',
      'Owner Phone',
      'Admins',
      'Sales Reps',
      'Customers',
      'Designs',
      'Total Orders',
      'Orders Last 30d',
      'Total Order Value',
      'Total Collected',
      'Total Outstanding',
      'Setup Done',
      'Setup Percent',
      'Days Inactive',
      'Health',
      'Created At',
    ];

    const rows = filteredAccounts.map((a) => [
      `"${a.name}"`,
      `"${a.status}"`,
      a.is_demo ? 'Demo' : 'Live',
      `"${a.owner_name || ''}"`,
      `"${a.owner_email || ''}"`,
      `"${a.owner_phone || ''}"`,
      a.admin_count,
      a.sales_rep_count,
      a.customers_count,
      a.designs_count,
      a.orders_count,
      a.orders_last_30d,
      a.total_order_value,
      a.total_collected,
      a.total_outstanding,
      `${a.setup_steps_done}/6`,
      `${a.setup_percent}%`,
      a.days_since_last_activity,
      a.health,
      `"${a.created_at}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SoleFlow_All_Accounts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenViewMode = async (account: PlatformAccount) => {
    await enterViewMode(account.org_id, account.name);
    onNavigate('/admin/dashboard');
  };

  const handleOpenDetails = (account: PlatformAccount) => {
    setSelectedAccount(account);
    setIsDrawerOpen(true);
  };

  const formatLakh = (num: number) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Platform Accounts</h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            All organizations across the SoleFlow ecosystem · Inspect setup, usage & launch read-only view sessions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportAccountsToCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 5 Top Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Accounts</span>
            <Building2 size={16} className="text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{stats.totalAccounts}</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active (7d)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{stats.active7d}</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">New (30d)</span>
            <Sparkles size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.newThisMonth}</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Inactive (&gt;30d)</span>
            <span className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-600 dark:text-slate-400 mt-2">{stats.inactive}</div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-surface border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Volume</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{formatLakh(stats.totalVolume)}</div>
        </div>
      </div>

      {/* Toolbar: Search, Filters, Sort */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts by name, owner, email, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Filters and Sort Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Health Filter */}
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value as any)}
            className="px-3 py-2 bg-muted/50 border border-border rounded-xl text-xs font-medium text-foreground focus:outline-none cursor-pointer"
          >
            <option value="all">Health: All</option>
            <option value="active">Active (&le;7d)</option>
            <option value="slowing">Slowing (8-30d)</option>
            <option value="inactive">Inactive (&gt;30d)</option>
            <option value="new">New Accounts</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-muted/50 border border-border rounded-xl text-xs font-medium text-foreground focus:outline-none cursor-pointer"
          >
            <option value="all">Status: All</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Demo Filter */}
          <select
            value={demoFilter}
            onChange={(e) => setDemoFilter(e.target.value as any)}
            className="px-3 py-2 bg-muted/50 border border-border rounded-xl text-xs font-medium text-foreground focus:outline-none cursor-pointer"
          >
            <option value="all">Accounts: All</option>
            <option value="live">Live Businesses</option>
            <option value="demo">Demo Only</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-muted/50 border border-border rounded-xl text-xs font-semibold text-primary focus:outline-none cursor-pointer"
          >
            <option value="newest">Sort: Newest</option>
            <option value="activity">Sort: Recent Activity</option>
            <option value="orders">Sort: Most Orders</option>
            <option value="volume">Sort: Order Volume</option>
            <option value="setup">Sort: Setup Progress</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-8 rounded-2xl bg-surface border border-border text-center space-y-3 animate-pulse">
          <div className="h-6 w-48 bg-muted mx-auto rounded-lg" />
          <div className="h-4 w-64 bg-muted mx-auto rounded-lg" />
          <div className="py-12 text-xs text-muted-foreground font-medium">Loading organization directories...</div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-foreground">Failed to load platform accounts</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {error instanceof Error ? error.message : 'Database communication error'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition-all cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Accounts Table & Mobile Cards */}
      {!isLoading && !isError && (
        <>
          {filteredAccounts.length === 0 ? (
            <div className="p-12 rounded-2xl bg-surface border border-border text-center space-y-3">
              <Building2 className="w-10 h-10 text-muted-foreground/60 mx-auto" />
              <h3 className="text-base font-bold text-foreground">No accounts found</h3>
              <p className="text-xs text-muted-foreground">
                No organizations match your current search and filter criteria.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Organization & Owner</th>
                      <th className="py-3 px-3">Team</th>
                      <th className="py-3 px-3">Customers</th>
                      <th className="py-3 px-3">Orders (30d)</th>
                      <th className="py-3 px-3">Total Value</th>
                      <th className="py-3 px-3">Collected</th>
                      <th className="py-3 px-3">Outstanding</th>
                      <th className="py-3 px-3">Setup</th>
                      <th className="py-3 px-3">Last Active</th>
                      <th className="py-3 px-3">Health</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border/60">
                    {filteredAccounts.map((account) => {
                      const healthBadgeColor =
                        account.health === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : account.health === 'slowing'
                          ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : account.health === 'new'
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';

                      return (
                        <tr key={account.org_id} className="hover:bg-muted/30 transition-colors">
                          {/* Account & Owner */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                {account.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-foreground truncate">{account.name}</span>
                                  {account.is_demo && (
                                    <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/50 uppercase">
                                      Demo
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-muted-foreground truncate">
                                  {account.owner_name} {account.owner_email ? `• ${account.owner_email}` : ''}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Team */}
                          <td className="py-3 px-3 text-muted-foreground font-medium">
                            {account.admin_count}a / {account.sales_rep_count}r
                          </td>

                          {/* Customers */}
                          <td className="py-3 px-3 text-foreground font-medium">
                            {account.customers_count}
                          </td>

                          {/* Orders */}
                          <td className="py-3 px-3 text-foreground font-medium">
                            {account.orders_count} <span className="text-muted-foreground text-[10px]">({account.orders_last_30d})</span>
                          </td>

                          {/* Total Value */}
                          <td className="py-3 px-3 font-semibold text-foreground">
                            {formatLakh(Number(account.total_order_value))}
                          </td>

                          {/* Collected */}
                          <td className="py-3 px-3 font-medium text-emerald-600 dark:text-emerald-400">
                            {formatLakh(Number(account.total_collected))}
                          </td>

                          {/* Outstanding */}
                          <td className="py-3 px-3 font-medium text-rose-600 dark:text-rose-400">
                            {formatLakh(Number(account.total_outstanding))}
                          </td>

                          {/* Setup Progress */}
                          <td className="py-3 px-3 min-w-[90px]">
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 bg-muted rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-primary h-1.5 rounded-full"
                                  style={{ width: `${account.setup_percent}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium">
                                {account.setup_steps_done}/6
                              </span>
                            </div>
                          </td>

                          {/* Last Active */}
                          <td className="py-3 px-3 text-muted-foreground text-[11px]">
                            {account.days_since_last_activity === 0
                              ? 'Today'
                              : `${account.days_since_last_activity}d ago`}
                          </td>

                          {/* Health */}
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${healthBadgeColor} capitalize`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  account.health === 'active'
                                    ? 'bg-emerald-500'
                                    : account.health === 'slowing'
                                    ? 'bg-amber-500'
                                    : account.health === 'new'
                                    ? 'bg-blue-500'
                                    : 'bg-slate-400'
                                }`}
                              />
                              {account.health}
                            </span>
                          </td>

                          {/* Actions: View and Details */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenViewMode(account)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-lg transition-all cursor-pointer"
                                title="Open in View Mode"
                              >
                                <Eye size={13} />
                                <span>View</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenDetails(account)}
                                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                                title="View Account Details"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Account Detail Drawer */}
      <AccountDetailDrawer
        account={selectedAccount}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigateToDashboard={() => onNavigate('/admin/dashboard')}
      />
    </div>
  );
};

export default AccountsPage;
