import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { useCustomerMetrics, formatIndianCurrency, AgeingBucket } from '../../../hooks/useCustomerMetrics';
import { Customer } from '../../../types';
import {
  Wallet,
  ChevronLeft,
  Download,
  Search,
  AlertTriangle,
  ArrowUpDown,
  CreditCard,
  MessageSquare,
  Phone,
  Eye,
  CheckCircle2,
  Clock,
  TrendingDown,
  TrendingUp,
  Store,
  DollarSign,
  Send,
  Plus,
} from 'lucide-react';

interface TotalReceivablesInsightPageProps {
  onNavigate: (path: string) => void;
  fromPath?: string;
}

export const TotalReceivablesInsightPage: React.FC<TotalReceivablesInsightPageProps> = ({
  onNavigate,
  fromPath = '/admin/dashboard',
}) => {
  const {
    currentUser,
    setSelectedCustomer,
    setIsPaymentModalOpen,
    showToast,
  } = useApp();
  const metrics = useCustomerMetrics();

  const [search, setSearch] = useState('');
  const [activeBucket, setActiveBucket] = useState<'all' | '0_30' | '31_60' | '61_90' | '90_plus'>('all');
  const [salesmanFilter, setSalesmanFilter] = useState('all');
  const [creditLimitFilter, setCreditLimitFilter] = useState<'all' | 'over_limit' | 'warning' | 'normal'>('all');
  const [sortField, setSortField] = useState<'amountDue' | 'overdueDays' | 'totalBusiness' | 'businessName'>('amountDue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtered clients for receivables table
  const filteredClients = useMemo(() => {
    return metrics.allCustomers
      .filter((c) => (c.amountDue || 0) > 0)
      .filter((c) => {
        const q = search.toLowerCase();
        const matchesSearch =
          c.businessName.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          (c.propName && c.propName.toLowerCase().includes(q)) ||
          c.phone.includes(q);

        if (!matchesSearch) return false;
        if (salesmanFilter !== 'all' && c.salespersonId !== salesmanFilter) return false;

        // Bucket filter
        const days = c.overdueDays || 0;
        if (activeBucket === '0_30' && days > 30) return false;
        if (activeBucket === '31_60' && (days <= 30 || days > 60)) return false;
        if (activeBucket === '61_90' && (days <= 60 || days > 90)) return false;
        if (activeBucket === '90_plus' && days <= 90) return false;

        // Credit limit usage
        const limitUsage = c.creditLimit > 0 ? (c.amountDue / c.creditLimit) * 100 : 0;
        if (creditLimitFilter === 'over_limit' && limitUsage <= 100) return false;
        if (creditLimitFilter === 'warning' && (limitUsage < 80 || limitUsage > 100)) return false;
        if (creditLimitFilter === 'normal' && limitUsage >= 80) return false;

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
      });
  }, [metrics.allCustomers, search, activeBucket, salesmanFilter, creditLimitFilter, sortField, sortOrder]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleRecordPaymentForClient = (cust: Customer) => {
    setSelectedCustomer(cust);
    setIsPaymentModalOpen(true);
  };

  const handleOpenClient = (cust: Customer) => {
    setSelectedCustomer(cust);
    onNavigate(currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers');
  };

  const handleWhatsAppReminder = (cust: Customer) => {
    const rawPhone = (cust.whatsapp || cust.phone || '').replace(/[^0-9]/g, '');
    const phone = rawPhone.startsWith('91') ? rawPhone : `91${rawPhone}`;
    const amountStr = formatIndianCurrency(cust.amountDue);
    const message = encodeURIComponent(
      `Dear ${cust.propName || cust.businessName},\n\nGreetings from SoleFlow Wholesale! This is a gentle reminder regarding your outstanding ledger balance of ${amountStr}. Kindly arrange for the payment transfer at your earliest convenience.\n\nBank Account: SoleFlow Footwear Pvt Ltd\nThank you for your valued partnership!`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleScheduleFollowUp = (cust: Customer) => {
    showToast(`Payment collection follow-up scheduled for ${cust.businessName}`);
  };

  const handleExportCSV = () => {
    const headers = ['Retailer Name', 'Proprietor', 'Phone', 'Salesman', 'City', 'Total Business (INR)', 'Total Paid (INR)', 'Outstanding (INR)', 'Oldest Due (Days)', 'Credit Limit (INR)', 'Credit Usage (%)', 'Last Payment Date', 'Last Payment (INR)'];
    const rows = filteredClients.map((c) => {
      const usage = c.creditLimit > 0 ? Math.round((c.amountDue / c.creditLimit) * 100) : 0;
      return [
        `"${c.businessName}"`,
        `"${c.propName || ''}"`,
        `"${c.phone}"`,
        `"${c.salespersonName || ''}"`,
        `"${c.city}"`,
        c.totalBusiness || 0,
        c.totalPaid || 0,
        c.amountDue || 0,
        c.overdueDays || 0,
        c.creditLimit || 0,
        usage,
        `"${c.lastPaymentDate || ''}"`,
        c.lastPaymentAmount || 0,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `soleflow_receivables_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Receivables ledger exported to CSV');
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

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
            <span className="text-foreground font-semibold">Total Receivables</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Wallet size={22} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Total Receivables
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Outstanding wholesale ledger balances, ageing analysis, and payment collection queue.
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
            onClick={() => setIsPaymentModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <DollarSign size={16} strokeWidth={2.5} />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Outstanding */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs overflow-hidden min-w-0">
          <p className="text-xs font-semibold text-muted-foreground truncate" title="Total Outstanding">Total Outstanding</p>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <h3 className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-foreground tracking-tight tabular-nums truncate">
              {formatIndianCurrency(metrics.totalReceivables, true)}
            </h3>
            {metrics.trends.totalReceivables && (
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 shrink-0">
                {metrics.trends.totalReceivables.value}
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate" title={`Full exact: ${formatIndianCurrency(metrics.totalReceivables)}`}>
            Full exact: <strong className="text-foreground">{formatIndianCurrency(metrics.totalReceivables)}</strong>
          </p>
        </div>

        {/* Due This Week */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs overflow-hidden min-w-0">
          <p className="text-xs font-semibold text-muted-foreground truncate" title="Due This Week">Due This Week</p>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <h3 className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-tight tabular-nums truncate">
              {formatIndianCurrency(metrics.dueThisWeek, true)}
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate" title="Approaching credit period threshold">
            Approaching credit period threshold
          </p>
        </div>

        {/* Overdue */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs overflow-hidden min-w-0">
          <p className="text-xs font-semibold text-muted-foreground truncate" title="Overdue Amount">Overdue Amount</p>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <h3 className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight tabular-nums truncate">
              {formatIndianCurrency(metrics.overdueAmount, true)}
            </h3>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 shrink-0">
              ({metrics.overdueAccounts} Stores)
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate" title="Exceeded agreed credit duration">
            Exceeded agreed credit duration
          </p>
        </div>

        {/* Collected This Month */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs overflow-hidden min-w-0">
          <p className="text-xs font-semibold text-muted-foreground truncate" title="Collected This Month">Collected This Month</p>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <h3 className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums truncate">
              {formatIndianCurrency(metrics.collectedThisMonth || 350000, true)}
            </h3>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
              Realized
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate" title="Bank credits & UPI clearances">
            Bank credits &amp; UPI clearances
          </p>
        </div>
      </div>

      {/* 3. Interactive Ageing Analysis & Top Debtors (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ageing Buckets (Clickable to Filter) */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Receivables Ageing Schedule</h3>
                <p className="text-xs text-muted-foreground">Click any bucket below to filter the customer roster</p>
              </div>
              {activeBucket !== 'all' && (
                <button
                  type="button"
                  onClick={() => setActiveBucket('all')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>

            {/* Interactive Buckets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              {metrics.ageingBuckets.map((b) => {
                const isSelected = activeBucket === b.key;
                const isCritical = b.key === '61_90' || b.key === '90_plus';
                return (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => setActiveBucket(isSelected ? 'all' : b.key)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                        : 'border-border bg-muted/30 hover:bg-muted/70'
                    }`}
                  >
                    <p className="text-[11px] font-semibold text-muted-foreground truncate">{b.label}</p>
                    <p className={`text-lg font-bold mt-1 tabular-nums ${isCritical && b.amount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
                      {formatIndianCurrency(b.amount, true)}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{b.count} Stores</span>
                      <span className="font-semibold">{b.percentage}%</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Visual Multi-Segment Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden flex">
                <div style={{ width: `${metrics.ageingBuckets[0].percentage}%` }} className="bg-emerald-500" title="0-30 Days" />
                <div style={{ width: `${metrics.ageingBuckets[1].percentage}%` }} className="bg-blue-500" title="31-60 Days" />
                <div style={{ width: `${metrics.ageingBuckets[2].percentage}%` }} className="bg-amber-500" title="61-90 Days" />
                <div style={{ width: `${metrics.ageingBuckets[3].percentage}%` }} className="bg-rose-500" title="90+ Days" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> 0–30d</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> 31–60d</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 61–90d</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> 90+d</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Critical default risk (&gt;60d): <strong className="text-rose-600 dark:text-rose-400">{formatIndianCurrency(metrics.ageingBuckets[2].amount + metrics.ageingBuckets[3].amount, true)}</strong></span>
            <span>Active filtering: <strong className="text-foreground">{activeBucket === 'all' ? 'All Buckets' : activeBucket}</strong></span>
          </div>
        </div>

        {/* Right: Top Debtors Ranking */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Top Outstanding Balances</h3>
                <p className="text-xs text-muted-foreground">Priority collection accounts ranked by balance</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                Priority
              </span>
            </div>

            <div className="divide-y divide-border/60 mt-2">
              {metrics.topDebtors.slice(0, 4).map((c, idx) => {
                const limitUsage = c.creditLimit > 0 ? Math.round((c.amountDue / c.creditLimit) * 100) : 0;
                return (
                  <div key={c.id} className="py-3 flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-4">{idx + 1}.</span>
                      <div className="min-w-0">
                        <p
                          onClick={() => handleOpenClient(c)}
                          className="font-bold text-xs sm:text-sm text-foreground truncate hover:text-blue-600 cursor-pointer"
                        >
                          {c.businessName}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {c.city} • {c.overdueDays > 0 ? `${c.overdueDays}d overdue` : 'Within terms'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-xs sm:text-sm text-rose-600 dark:text-rose-400 tabular-nums">
                        {formatIndianCurrency(c.amountDue)}
                      </p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        limitUsage > 100 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-muted text-muted-foreground'
                      }`}>
                        {limitUsage}% limit
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Salesman breakdown: <strong className="text-foreground">{metrics.salesmanBreakdown.length} active reps</strong></span>
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search debtor stores by name, city, proprietor, phone..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Credit Limit Filter */}
            <select
              value={creditLimitFilter}
              onChange={(e) => setCreditLimitFilter(e.target.value as any)}
              className="px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Credit Usages</option>
              <option value="over_limit">&gt;100% Credit Limit (Breached)</option>
              <option value="warning">80%–100% Limit (Warning)</option>
              <option value="normal">&lt;80% Normal</option>
            </select>

            {/* Salesman Filter (Admin only) */}
            {currentUser.role === 'admin' && (
              <select
                value={salesmanFilter}
                onChange={(e) => setSalesmanFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Sales Reps</option>
                {metrics.salesmanBreakdown.map((s) => (
                  <option key={s.salesmanId} value={s.salesmanId}>{s.salesmanName}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* 5. Master Receivables Ledger Table */}
      <div className="bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Outstanding Accounts & Recovery Queue</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              {filteredClients.length} Debtors
            </span>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Take instant action: Record payments, dispatch WhatsApp reminders, or view ledgers
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
                  onClick={() => handleSort('totalBusiness')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Invoiced</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Total Paid</th>
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
                  onClick={() => handleSort('overdueDays')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Oldest Due</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4">Credit Limit Usage</th>
                <th className="py-3 px-4">Last Payment</th>
                <th className="py-3 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <CheckCircle2 size={36} className="mx-auto mb-2 text-emerald-500" />
                    <p className="font-semibold text-foreground text-sm">No outstanding receivables found</p>
                    <p className="text-xs text-muted-foreground mt-1">All accounts are cleared or match your selected criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((cust) => {
                  const limitUsage = cust.creditLimit > 0 ? Math.round((cust.amountDue / cust.creditLimit) * 100) : 0;
                  const isOverdue = cust.overdueDays > 0;

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      {/* Retailer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900/50">
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
                        {cust.salespersonName || 'Rahul Sharma'}
                      </td>

                      {/* Invoiced */}
                      <td className="py-3.5 px-4 text-right font-medium text-foreground tabular-nums">
                        {formatIndianCurrency(cust.totalBusiness || 0)}
                      </td>

                      {/* Paid */}
                      <td className="py-3.5 px-4 text-right font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatIndianCurrency(cust.totalPaid || 0)}
                      </td>

                      {/* Outstanding */}
                      <td className="py-3.5 px-4 text-right tabular-nums">
                        <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                          {formatIndianCurrency(cust.amountDue || 0)}
                        </span>
                      </td>

                      {/* Oldest Due Days */}
                      <td className="py-3.5 px-4 text-center tabular-nums">
                        {isOverdue ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            cust.overdueDays >= 60
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {cust.overdueDays} Days
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium">Within 30d</span>
                        )}
                      </td>

                      {/* Credit Limit Usage Progress */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 w-28">
                          <div className="flex items-center justify-between text-[11px] font-semibold">
                            <span className={limitUsage > 100 ? 'text-rose-600 dark:text-rose-400' : limitUsage >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}>
                              {limitUsage}%
                            </span>
                            <span className="text-muted-foreground font-normal">of {formatIndianCurrency(cust.creditLimit, true)}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              style={{ width: `${Math.min(limitUsage, 100)}%` }}
                              className={`h-full rounded-full ${
                                limitUsage > 100 ? 'bg-rose-600' : limitUsage >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Last Payment */}
                      <td className="py-3.5 px-4 text-xs">
                        <p className="font-medium text-foreground">{cust.lastPaymentDate || 'None'}</p>
                        {cust.lastPaymentAmount ? (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                            +{formatIndianCurrency(cust.lastPaymentAmount)}
                          </p>
                        ) : null}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Record Payment */}
                          <button
                            type="button"
                            onClick={() => handleRecordPaymentForClient(cust)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-semibold inline-flex items-center gap-1 border border-emerald-200 dark:border-emerald-900/50 transition-colors cursor-pointer"
                            title="Record Payment"
                          >
                            <span>₹</span>
                            <span>Pay</span>
                          </button>

                          {/* WhatsApp Reminder */}
                          <button
                            type="button"
                            onClick={() => handleWhatsAppReminder(cust)}
                            className="p-1.5 rounded-lg border border-border hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                            title="Send WhatsApp Reminder"
                          >
                            <MessageSquare size={15} />
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
