import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { useCustomerMetrics, formatIndianCurrency } from '../../../hooks/useCustomerMetrics';
import { Customer } from '../../../types';
import {
  AlertTriangle,
  ChevronLeft,
  Download,
  Search,
  Phone,
  MessageSquare,
  Clock,
  Eye,
  CheckCircle2,
  Calendar,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
  ArrowUpDown,
  DollarSign,
  UserCheck,
} from 'lucide-react';

interface OverdueAccountsInsightPageProps {
  onNavigate: (path: string) => void;
  fromPath?: string;
}

export const OverdueAccountsInsightPage: React.FC<OverdueAccountsInsightPageProps> = ({
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
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'moderate' | 'over_limit'>('all');
  const [salesmanFilter, setSalesmanFilter] = useState('all');
  const [sortField, setSortField] = useState<'overdueDays' | 'amountDue' | 'businessName'>('overdueDays');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtered overdue clients
  const filteredOverdueClients = useMemo(() => {
    return metrics.overdueCustomersList
      .filter((c) => {
        const q = search.toLowerCase();
        const matchesSearch =
          c.businessName.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          (c.propName && c.propName.toLowerCase().includes(q)) ||
          c.phone.includes(q);

        if (!matchesSearch) return false;
        if (salesmanFilter !== 'all' && c.salespersonId !== salesmanFilter) return false;

        const limitUsage = c.creditLimit > 0 ? (c.amountDue / c.creditLimit) * 100 : 0;
        if (severityFilter === 'critical' && (c.overdueDays || 0) < 30) return false;
        if (severityFilter === 'moderate' && (c.overdueDays || 0) >= 30) return false;
        if (severityFilter === 'over_limit' && limitUsage <= 100) return false;

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
  }, [metrics.overdueCustomersList, search, severityFilter, salesmanFilter, sortField, sortOrder]);

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

  const handleRecordPayment = (cust: Customer) => {
    setSelectedCustomer(cust);
    setIsPaymentModalOpen(true);
  };

  const handleWhatsAppReminder = (cust: Customer) => {
    const rawPhone = (cust.whatsapp || cust.phone || '').replace(/[^0-9]/g, '');
    const phone = rawPhone.startsWith('91') ? rawPhone : `91${rawPhone}`;
    const amountStr = formatIndianCurrency(cust.amountDue);
    const message = encodeURIComponent(
      `URGENT NOTICE: Dear ${cust.propName || cust.businessName},\n\nYour account has an overdue balance of ${amountStr} which has exceeded your credit terms (${cust.overdueDays} days past due).\n\nPlease transfer the outstanding balance immediately to avoid billing hold on pending dispatches.\n\nSoleFlow Accounts Team`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleScheduleFollowUp = (cust: Customer) => {
    showToast(`Priority collection follow-up assigned to ${cust.salespersonName || 'sales team'} for ${cust.businessName}`);
  };

  const handleExportCSV = () => {
    const headers = ['Retailer Name', 'Proprietor', 'Phone', 'Salesperson', 'City', 'Overdue Amount (INR)', 'Days Overdue', 'Payment Terms', 'Credit Limit (INR)', 'Last Payment Date', 'Last Payment (INR)'];
    const rows = filteredOverdueClients.map((c) => [
      `"${c.businessName}"`,
      `"${c.propName || ''}"`,
      `"${c.phone}"`,
      `"${c.salespersonName || ''}"`,
      `"${c.city}"`,
      c.amountDue || 0,
      c.overdueDays || 0,
      `"${c.paymentTerms || ''}"`,
      c.creditLimit || 0,
      `"${c.lastPaymentDate || ''}"`,
      c.lastPaymentAmount || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `soleflow_overdue_accounts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Overdue accounts roster exported to CSV');
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const overLimitCount = metrics.overdueCustomersList.filter(
    (c) => c.creditLimit > 0 && (c.amountDue || 0) > c.creditLimit
  ).length;

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
            <span className="text-foreground font-semibold">Overdue Accounts</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={22} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Overdue Accounts
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                High-priority recovery list of retail clients who have crossed agreed payment terms and credit cycles.
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
        </div>
      </div>

      {/* 2. Top Summary KPI Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Overdue Accounts */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs overflow-hidden min-w-0">
          <p className="text-xs font-semibold text-muted-foreground truncate" title="Overdue Accounts">Overdue Accounts</p>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <h3 className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-tight tabular-nums truncate">
              {metrics.overdueAccounts}
            </h3>
            {metrics.trends.overdueAccounts && (
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 shrink-0">
                {metrics.trends.overdueAccounts.value}
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate" title="Retailers with unpaid invoices past due date">
            Retailers with unpaid invoices past due date
          </p>
        </div>

        {/* Total Overdue Amount */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs overflow-hidden min-w-0">
          <p className="text-xs font-semibold text-muted-foreground truncate" title="Overdue Amount">Overdue Amount</p>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <h3 className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight tabular-nums truncate">
              {formatIndianCurrency(metrics.overdueAmount, true)}
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate" title={`Full exact: ${formatIndianCurrency(metrics.overdueAmount)}`}>
            Full exact: <strong className="text-foreground">{formatIndianCurrency(metrics.overdueAmount)}</strong>
          </p>
        </div>

        {/* Avg Days Overdue */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs overflow-hidden min-w-0">
          <p className="text-xs font-semibold text-muted-foreground truncate" title="Avg Days Overdue">Avg Days Overdue</p>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <h3 className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-foreground tracking-tight tabular-nums truncate">
              {metrics.avgDaysOverdue || 18} Days
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate" title="Average delay across delinquent accounts">
            Average delay across delinquent accounts
          </p>
        </div>

        {/* Over Credit Limit */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs overflow-hidden min-w-0">
          <p className="text-xs font-semibold text-muted-foreground truncate" title="Credit Limit Breaches">Credit Limit Breaches</p>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <h3 className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight tabular-nums truncate">
              {overLimitCount} Stores
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate" title="Outstanding exceeds sanctioned limit">
            Outstanding exceeds sanctioned limit
          </p>
        </div>
      </div>

      {/* 3. Severity Distribution Chart & Critical Action Notice */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Overdue Aging Buckets */}
        <div className="lg:col-span-6 bg-surface border border-border rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Overdue Aging Buckets</h3>
                <p className="text-xs text-muted-foreground">Breakdown of delinquent balances by days overdue</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                Action Required
              </span>
            </div>

            <div className="space-y-4 my-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-foreground">1–30 Days (Follow-up Call)</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{formatIndianCurrency(metrics.ageingBuckets[0].amount, true)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div style={{ width: `${metrics.ageingBuckets[0].percentage}%` }} className="h-full bg-amber-500 rounded-full" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-foreground">31–60 Days (Formal Notice)</span>
                  <span className="font-bold text-rose-500">{formatIndianCurrency(metrics.ageingBuckets[1].amount, true)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div style={{ width: `${metrics.ageingBuckets[1].percentage}%` }} className="h-full bg-rose-500 rounded-full" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-foreground">60+ Days (Legal / Credit Stop)</span>
                  <span className="font-bold text-rose-700 dark:text-rose-400">{formatIndianCurrency(metrics.ageingBuckets[2].amount + metrics.ageingBuckets[3].amount, true)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div style={{ width: `${metrics.ageingBuckets[2].percentage + metrics.ageingBuckets[3].percentage}%` }} className="h-full bg-rose-700 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Critical hold threshold: <strong className="text-foreground">45 days / ₹2.0L</strong></span>
            <span>Recovery rate target: <strong className="text-emerald-600 dark:text-emerald-400">92%</strong></span>
          </div>
        </div>

        {/* Right: Credit Control Advice */}
        <div className="lg:col-span-6 bg-surface border border-border rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <ShieldAlert className="text-rose-600 dark:text-rose-400" size={18} />
              <h3 className="text-sm font-bold text-foreground">Credit Control Guidelines</h3>
            </div>

            <div className="space-y-3 mt-4 text-xs text-muted-foreground leading-relaxed">
              <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200">
                <p className="font-bold mb-0.5">Automated Dispatch Hold Policy:</p>
                <p>Retail accounts with invoices overdue by &gt;30 days or exceeding 100% of sanctioned credit limit are blocked from automated Bilty dispatch until at least 50% clearance is recorded.</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border border-border/80">
                <p className="font-bold text-foreground mb-0.5">Recovery Protocol:</p>
                <p>1. Initiate WhatsApp reminder with statement attached.<br />2. Follow up via field rep in-person visit within 48 hours.<br />3. Collect post-dated cheque or UPI transfer.</p>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Primary escalation: <strong className="text-foreground">Rahul Sharma (Field Lead)</strong></span>
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
            placeholder="Search overdue stores by name, city, phone..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="all">All Overdue Severities</option>
            <option value="critical">Critical (&gt;30 Days)</option>
            <option value="moderate">Moderate (&lt;30 Days)</option>
            <option value="over_limit">Over Credit Limit</option>
          </select>

          {/* Salesman Filter */}
          {currentUser.role === 'admin' && (
            <select
              value={salesmanFilter}
              onChange={(e) => setSalesmanFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">All Sales Reps</option>
              {metrics.salesmanBreakdown.map((s) => (
                <option key={s.salesmanId} value={s.salesmanId}>{s.salesmanName}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 5. Master Overdue Table */}
      <div className="bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Delinquent Retail Accounts</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              {filteredOverdueClients.length} Urgent
            </span>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Quick communication buttons: Call, WhatsApp, Follow-up, or Record Payment
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
                  onClick={() => handleSort('amountDue')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Overdue Amount</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('overdueDays')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Days Overdue</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4">Payment Terms</th>
                <th className="py-3 px-4">Last Payment</th>
                <th className="py-3 px-4 text-center">Credit Risk</th>
                <th className="py-3 px-4 text-right">Recovery Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOverdueClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground">
                    <CheckCircle2 size={44} className="mx-auto mb-2 text-emerald-500" />
                    <p className="font-bold text-foreground text-base">No overdue accounts.</p>
                    <p className="text-xs text-muted-foreground mt-1">All retail accounts are currently within agreed credit terms.</p>
                  </td>
                </tr>
              ) : (
                filteredOverdueClients.map((cust) => {
                  const isOverLimit = cust.creditLimit > 0 && cust.amountDue > cust.creditLimit;
                  const isCriticalDays = cust.overdueDays >= 60;

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      {/* Retailer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-900/50">
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

                      {/* Overdue Amount */}
                      <td className="py-3.5 px-4 text-right tabular-nums">
                        <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                          {formatIndianCurrency(cust.amountDue || 0)}
                        </span>
                      </td>

                      {/* Days Overdue Badge */}
                      <td className="py-3.5 px-4 text-center tabular-nums">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isCriticalDays
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50'
                        }`}>
                          {cust.overdueDays} Days
                        </span>
                      </td>

                      {/* Payment Terms */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {cust.paymentTerms || '30% Advance + 70% Bilty'}
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

                      {/* Credit Risk */}
                      <td className="py-3.5 px-4 text-center">
                        {isOverLimit ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50">
                            Limit Breached
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50">
                            Exceeded Cycle
                          </span>
                        )}
                      </td>

                      {/* Recovery Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Call Button */}
                          <a
                            href={`tel:${cust.phone}`}
                            className="p-1.5 rounded-lg border border-border hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 transition-colors"
                            title={`Call ${cust.phone}`}
                          >
                            <Phone size={15} />
                          </a>

                          {/* WhatsApp Reminder */}
                          <button
                            type="button"
                            onClick={() => handleWhatsAppReminder(cust)}
                            className="p-1.5 rounded-lg border border-border hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                            title="WhatsApp Urgent Reminder"
                          >
                            <MessageSquare size={15} />
                          </button>

                          {/* Record Payment */}
                          <button
                            type="button"
                            onClick={() => handleRecordPayment(cust)}
                            className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold inline-flex items-center gap-1 border border-emerald-200 dark:border-emerald-900/50 transition-colors cursor-pointer"
                            title="Record Payment"
                          >
                            <span>₹</span>
                            <span>Pay</span>
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
