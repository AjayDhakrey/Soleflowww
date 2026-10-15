import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useCustomerMetrics, formatIndianCurrency } from '../../hooks/useCustomerMetrics';
import { Customer } from '../../types';
import {
  Home,
  Users,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Plus,
  Search,
  Store,
  Eye,
  Pencil,
  Phone,
} from 'lucide-react';

import { CustomerRowActionMenu } from '../../components/customers/CustomerRowActionMenu';
import { CustomerDetailPage } from './CustomerDetailPage';
import { CustomerKpiCards } from '../../components/customers/CustomerKpiCards';

interface CustomersPageProps {
  onNavigate: (path: string) => void;
  customerId?: string;
  fromPath?: string;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  onNavigate,
  customerId,
  fromPath = '/admin/customers',
}) => {
  const {
    customers,
    selectedCustomer,
    setSelectedCustomer,
    openEditCustomerModal,
    setIsPaymentModalOpen,
    setIsAddCustomerModalOpen,
    currentUser,
  } = useApp();

  const metrics = useCustomerMetrics();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'due_soon' | 'active' | 'hold'>('all');

  // If customerId is provided via URL route or prop, render the complete CustomerDetailPage
  const effectiveCustomerId = customerId || (selectedCustomer && window.location.hash.includes('detail') ? selectedCustomer.id : undefined);

  if (effectiveCustomerId) {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab') || 'overview';
    return (
      <CustomerDetailPage
        customerId={effectiveCustomerId}
        onNavigate={onNavigate}
        fromPath={fromPath}
        initialTab={tabParam}
      />
    );
  }

  // Filter based on salesperson role restriction if applicable
  const roleFilteredCustomers =
    currentUser.role === 'salesperson'
      ? customers.filter(
          (c) =>
            c.salespersonId === currentUser.id ||
            c.salespersonName?.includes(currentUser.name)
        )
      : customers;

  const filtered = roleFilteredCustomers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.businessName.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      (c.propName && c.propName.toLowerCase().includes(q)) ||
      c.phone.includes(q) ||
      (c.gstin && c.gstin.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (statusFilter === 'overdue') return c.amountDue > 0 && c.status === 'overdue';
    if (statusFilter === 'due_soon') return c.status === 'due_soon';
    if (statusFilter === 'active') return c.amountDue === 0 || c.status === 'active';
    if (statusFilter === 'hold') return (c.status as string) === 'hold' || (c.status as string) === 'credit_hold' || c.amountDue > c.creditLimit;
    return true;
  });

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    const basePath = currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers';
    onNavigate(`${basePath}/${c.id}?from=${basePath}`);
  };

  const getStatusBadge = (c: Customer) => {
    if (c.status === 'overdue' || c.amountDue > 100000) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50">
          Overdue
        </span>
      );
    }
    if ((c.status as string) === 'hold' || (c.status as string) === 'credit_hold' || c.amountDue > c.creditLimit) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50">
          Credit Hold
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
        Active
      </span>
    );
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-[1700px] w-full mx-auto pb-24 md:pb-12 bg-background text-foreground">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium">
        <button
          type="button"
          onClick={() => onNavigate(currentUser.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard')}
          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1.5"
        >
          <Home size={14} className="text-blue-600 dark:text-blue-400" />
          <span>Dashboard</span>
        </button>
        <span className="text-slate-400">/</span>
        <span className="text-slate-400 dark:text-slate-500 font-medium">
          Clients
        </span>
      </div>

      {/* 2. Top Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Clients</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-800">
              {customers.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 mt-1 font-normal">
            Client accounts, credit balances, and payment status.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="justify-center px-3 sm:px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-900 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span>₹</span>
            <span>Record Payment</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddCustomerModalOpen(true)}
            className="justify-center px-3 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* 3. 4 Customer KPI Summary Cards */}
      <CustomerKpiCards
        totalCustomers={metrics.totalCustomers}
        totalCustomersGrowth={metrics.activeCustomers > 0 ? Math.round((metrics.activeCustomers / Math.max(1, metrics.totalCustomers)) * 100) : 30}
        totalReceivables={formatIndianCurrency(metrics.totalReceivables, true)}
        totalReceivablesGrowth={metrics.totalReceivables > 0 ? 5 : undefined}
        overdueAccounts={metrics.overdueAccounts}
        overdueGrowth={metrics.overdueAccounts > 0 ? 2 : undefined}
        clearedAccounts={metrics.clearedAccounts}
        clearedGrowth={12}
        onNavigateTotal={() => onNavigate(`/customers/insights/total?from=${currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers'}`)}
        onNavigateReceivables={() => onNavigate(`/customers/insights/receivables?from=${currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers'}`)}
        onNavigateOverdue={() => onNavigate(`/customers/insights/overdue?from=${currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers'}`)}
        onNavigateCleared={() => onNavigate(`/customers/insights/cleared?from=${currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers'}`)}
      />

      {/* 4. Main Panel / Table */}
      <div className="bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden">
        {/* Filter Bar: Search + Filter Chips Carousel */}
        <div className="p-3 sm:p-4 md:px-6 bg-surface border-b border-border space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search store, proprietor, city, GSTIN, phone..."
                className="w-full h-10 pl-9 pr-4 bg-muted/40 hover:bg-muted/70 focus:bg-surface border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Desktop Account Selector */}
            <div className="hidden sm:block w-48 shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full h-10 px-3 bg-muted/40 hover:bg-muted/70 focus:bg-surface border border-border rounded-xl text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <option value="all">All Accounts</option>
                <option value="active">Active Only</option>
                <option value="overdue">Overdue Only</option>
                <option value="hold">Credit Hold</option>
              </select>
            </div>
          </div>

          {/* Mobile Horizontal Filter Chips Carousel */}
          <div className="sm:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1">
            {[
              { id: 'all', label: 'All Accounts', count: roleFilteredCustomers.length },
              { id: 'overdue', label: 'Overdue', count: roleFilteredCustomers.filter(c => c.amountDue > 0 && c.status === 'overdue').length, badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
              { id: 'active', label: 'Active', count: roleFilteredCustomers.filter(c => c.amountDue === 0 || c.status === 'active').length },
              { id: 'hold', label: 'Credit Hold', count: roleFilteredCustomers.filter(c => (c.status as string) === 'hold' || (c.status as string) === 'credit_hold' || c.amountDue > c.creditLimit).length, badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
            ].map((f) => {
              const isSelected = statusFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/25 text-white' : f.badgeColor || 'bg-background text-muted-foreground'
                  }`}>
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Store className="w-12 h-12 mx-auto mb-3 text-muted-foreground/60" />
            <h3 className="text-base font-bold text-foreground">No Client Accounts Found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              No store accounts match "{search || statusFilter}". Try adjusting your filters or add a new client.
            </p>
            <button
              type="button"
              onClick={() => setIsAddCustomerModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Plus size={15} />
              <span>Add Client</span>
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Card List (md:hidden) */}
            <div className="md:hidden divide-y divide-border/60 bg-surface">
              {filtered.map((c) => {
                const initials = getInitials(c.businessName);
                const isOverdue = c.status === 'overdue' || c.amountDue > 100000;
                const cleanPhone = (c.whatsapp || c.phone || '').replace(/[^0-9]/g, '');

                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    className="p-3.5 hover:bg-muted/30 active:bg-muted/40 transition-colors cursor-pointer space-y-3"
                  >
                    {/* Header: Avatar, Store Name, City & Status Badge */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/60 dark:to-indigo-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-foreground text-sm leading-tight truncate">
                            {c.businessName}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                            <span>{c.propName || c.city}</span>
                            {c.city && c.propName && <span>•</span>}
                            {c.city && c.propName && <span>{c.city}</span>}
                          </p>
                          {c.gstin && (
                            <p className="text-[10px] font-mono text-muted-foreground/75 truncate mt-0.5">
                              GST: {c.gstin}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 pt-0.5">
                        {getStatusBadge(c)}
                      </div>
                    </div>

                    {/* Financial Metrics Strip */}
                    <div className="grid grid-cols-2 gap-2 bg-muted/40 dark:bg-muted/20 p-2.5 rounded-xl border border-border/50">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                          Balance Due
                        </span>
                        <span className={`font-bold font-mono text-sm leading-tight block mt-0.5 ${
                          c.amountDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          ₹{(c.amountDue || 0).toLocaleString('en-IN')}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] font-medium text-rose-500 dark:text-rose-400 block mt-0.5">
                            Overdue payment
                          </span>
                        )}
                      </div>
                      <div className="border-l border-border/60 pl-2.5">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                          Credit Limit
                        </span>
                        <span className="font-semibold text-foreground text-xs sm:text-sm leading-tight block mt-0.5">
                          {c.creditLimit > 0 ? `₹${(c.creditLimit / 100000).toFixed(1)}L` : 'Unlimited'}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate block mt-0.5">
                          {c.paymentTerms || 'Terms: Standard'}
                        </span>
                      </div>
                    </div>

                    {/* Touch Action Bar */}
                    <div className="flex items-center justify-between gap-1.5 pt-0.5" onClick={(e) => e.stopPropagation()}>
                      {/* Direct Phone & WhatsApp buttons */}
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${c.phone}`}
                          className="h-8 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-semibold inline-flex items-center gap-1 border border-blue-200/60 dark:border-blue-900/40 active:scale-95 transition-all"
                          title="Call client"
                        >
                          <Phone size={12} />
                          <span>Call</span>
                        </a>

                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="h-8 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold inline-flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-900/40 active:scale-95 transition-all"
                            title="Chat on WhatsApp"
                          >
                            <span className="text-emerald-500 font-bold">💬</span>
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>

                      {/* View Details & More Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSelectCustomer(c)}
                          className="h-8 px-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold inline-flex items-center gap-1 transition-all active:scale-95"
                        >
                          <span>Profile</span>
                          <ChevronRight size={13} className="text-muted-foreground" />
                        </button>
                        <CustomerRowActionMenu
                          customer={c}
                          onNavigate={onNavigate}
                          fromPath={currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers'}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
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
                  {filtered.map((c) => {
                    const initials = getInitials(c.businessName);

                    return (
                      <tr
                        key={c.id}
                        onClick={() => handleSelectCustomer(c)}
                        className="hover:bg-muted/40 transition-colors cursor-pointer"
                      >
                        {/* Store & Proprietor */}
                        <td className="py-3.5 px-4 md:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-foreground text-xs sm:text-sm leading-tight">
                                {c.businessName}
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                {c.propName || c.city}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* GSTIN */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs text-muted-foreground">
                            {c.gstin || '—'}
                          </span>
                        </td>

                        {/* Location Hub */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-foreground text-xs sm:text-sm leading-tight">
                            {c.city}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[150px]">
                            {c.address || '—'}
                          </div>
                        </td>

                        {/* Phone / Contact */}
                        <td className="py-3.5 px-4">
                          <span className="text-xs text-foreground font-medium">
                            {c.phone}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {getStatusBadge(c)}
                        </td>

                        {/* Credit Limit */}
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-muted-foreground text-xs sm:text-sm">
                            {c.creditLimit > 0 ? `₹${(c.creditLimit / 100000).toFixed(1)}L` : '—'}
                          </span>
                        </td>

                        {/* Balance Due */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold font-mono text-foreground text-xs sm:text-sm">
                            ₹{(c.amountDue || 0).toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 md:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCustomer(c);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                              <Eye size={14} />
                              <span>Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditCustomerModal(c);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                            >
                              <Pencil size={13} />
                              <span>Edit</span>
                            </button>
                            <CustomerRowActionMenu
                              customer={c}
                              onNavigate={onNavigate}
                              fromPath={currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers'}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
