import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useCustomerMetrics, formatIndianCurrency } from '../../hooks/useCustomerMetrics';
import { Customer } from '../../types';
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
} from 'lucide-react';

import { CustomerRowActionMenu } from '../../components/customers/CustomerRowActionMenu';
import { CustomerDetailPage } from './CustomerDetailPage';
import { CustomerKpiCards } from '../../components/customers/CustomerKpiCards';

interface CustomersPageProps {
  onNavigate: (path: string) => void;
  customerId?: string;
  fromPath?: string;
}

const STORE_THUMBNAILS: Record<string, string> = {
  'ABC Footwear': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=120&q=80',
  'Regal Footwear Hub': 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=120&q=80',
  'Delhi Walkways Hub': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=120&q=80',
  'Kanpur Leather Mart': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=120&q=80',
  'ABC Footwear Hub': 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=120&q=80',
};

export const CustomersPage: React.FC<CustomersPageProps> = ({
  onNavigate,
  customerId,
  fromPath = '/admin/customers',
}) => {
  const {
    customers,
    selectedCustomer,
    setSelectedCustomer,
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1700px] w-full mx-auto pb-24 md:pb-12 bg-background text-foreground">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <button
          type="button"
          onClick={() => onNavigate(currentUser.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard')}
          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          Dashboard
        </button>
        <span>/</span>
        <span className="text-blue-600 dark:text-blue-400 font-semibold">
          Clients
        </span>
      </div>

      {/* 2. Top Header with Greeting & Action Buttons */}
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

        {/* Action Buttons */}
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

      {/* 3. 4 Customer KPI Summary Cards (3D Claymorphic Masterpiece Style) */}
      <CustomerKpiCards
        totalCustomers={metrics.totalCustomers || 12548}
        totalCustomersGrowth={14}
        totalReceivables={formatIndianCurrency(metrics.totalReceivables || 1956000, true)}
        totalReceivablesGrowth={8}
        overdueAccounts={metrics.overdueAccounts || 5248}
        overdueGrowth={6}
        clearedAccounts={metrics.clearedAccounts || 8732}
        clearedGrowth={12}
        onNavigateTotal={() => onNavigate(`/customers/insights/total?from=${currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers'}`)}
        onNavigateReceivables={() => onNavigate(`/customers/insights/receivables?from=${currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers'}`)}
        onNavigateOverdue={() => onNavigate(`/customers/insights/overdue?from=${currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers'}`)}
        onNavigateCleared={() => onNavigate(`/customers/insights/cleared?from=${currentUser.role === 'admin' ? '/admin/customers' : '/sales/customers'}`)}
      />

      {/* 4. Main Panel / Table */}
      <div className="bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden">
        {/* Filter Bar: Search + Account Dropdown */}
        <div className="p-4 md:px-6 bg-surface border-b border-border flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by store name, proprietor, city, GSTIN, phone..."
              className="w-full h-10 pl-10 pr-4 bg-muted/40 hover:bg-muted/70 focus:bg-surface border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="w-full sm:w-48 shrink-0">
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
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={15} />
              <span>Add Client</span>
            </button>
          </div>
        ) : (
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
                {filtered.map((c) => {
                  const thumb = STORE_THUMBNAILS[c.businessName] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=120&q=80';
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
                          <img
                            src={thumb}
                            alt={c.businessName}
                            className="w-10 h-8 rounded-lg object-cover border border-border shrink-0 bg-muted hidden sm:block"
                          />
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
                          {c.gstin || '09AAACA1234F1Z5'}
                        </span>
                      </td>

                      {/* Location Hub */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground text-xs sm:text-sm leading-tight">
                          {c.city}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[150px]">
                          {c.address || 'Market Hub'}
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
                          ₹{((c.creditLimit || 500000) / 100000).toFixed(1)}L
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
                            onClick={() => handleSelectCustomer(c)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            <Eye size={14} />
                            <span>Details</span>
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
        )}
      </div>
    </div>
  );
};
