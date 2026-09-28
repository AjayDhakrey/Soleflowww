import React from 'react';
import {
  CreditCard,
  Plus,
  Users,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
    setSelectedCustomer,
    showToast,
  } = useApp();

  const totalOverdue = customers.reduce((sum, c) => sum + (c.amountDue || 0), 0);
  const openOrdersCount = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto select-none pb-20 md:pb-8">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 inline-block">
            Trader Portal
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Good morning, Ajay
          </h1>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Record Payment</span>
          </button>

          <button
            onClick={() => setIsCreateOrderModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] shrink-0" />
            <span className="truncate">+ New Order</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        {/* Active Customers */}
        <div
          onClick={() => onNavigate('/admin/customers')}
          className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold text-slate-600 truncate">
              Active Customers
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-lg sm:text-2xl font-black text-slate-900 font-display leading-tight">
              {customers.length} Stores
            </div>
          </div>
        </div>

        {/* Open Orders */}
        <div
          onClick={() => onNavigate('/admin/orders')}
          className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold text-slate-600 truncate">
              Open Orders
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-lg sm:text-2xl font-black text-slate-900 font-display leading-tight">
              {openOrdersCount} Batches
            </div>
          </div>
        </div>

        {/* Sales This Month */}
        <div
          onClick={() => onNavigate('/admin/reports')}
          className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold text-slate-600 truncate">
              Sales This Month
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-lg sm:text-2xl font-black text-slate-900 font-display leading-tight">
              ₹24.8L
            </div>
          </div>
        </div>

        {/* Amount Due (Highlight Red) */}
        <div
          onClick={() => onNavigate('/admin/payments')}
          className="bg-rose-50/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-rose-200/90 hover:border-rose-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[11px] sm:text-xs font-bold text-rose-800 truncate">
              Amount Due
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-lg sm:text-2xl font-black text-rose-700 font-display leading-tight">
              ₹{(totalOverdue / 100000).toFixed(2)}L
            </div>
          </div>
        </div>

        {/* Payments Today */}
        <div
          onClick={() => onNavigate('/admin/payments')}
          className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold text-slate-600 truncate">
              Payments Today
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors shrink-0">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-lg sm:text-2xl font-black text-slate-900 font-display leading-tight">
              ₹1.45L
            </div>
          </div>
        </div>

        {/* Orders Delayed */}
        <div
          onClick={() => onNavigate('/admin/manufacturers')}
          className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-amber-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold text-slate-600 truncate">
              Orders Delayed
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-lg sm:text-2xl font-black text-amber-600 font-display leading-tight">
              1 Alert
            </div>
          </div>
        </div>
      </div>

      {/* 3. "Needs Your Immediate Attention" Section (Swipeable on Mobile) */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 space-y-3 sm:space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
            Needs Your Immediate Attention
          </h2>
        </div>

        {/* Mobile Swipe Container / Desktop Grid */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 overflow-x-auto pb-1.5 -mx-1 px-1 snap-x scrollbar-none">
          {/* Card 1: Overdue Ledger */}
          <div className="min-w-[260px] sm:min-w-0 flex-1 shrink-0 snap-start p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-50/60 border border-rose-200/80 flex flex-col justify-between space-y-2 sm:space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                  Overdue Ledger
                </span>
                <span className="text-[10px] font-bold text-rose-600 font-mono">
                  18 Days Over
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5">
                ABC Footwear (Agra)
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 font-medium line-clamp-2 sm:line-clamp-none">
                ₹2,30,000 balance pending. Dispatch for 320 pairs (ORD-0145) on dock hold.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCustomer(customers[0]);
                onNavigate('/admin/customers');
              }}
              className="w-full py-1.5 sm:py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>View Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Margin Approval */}
          <div className="min-w-[260px] sm:min-w-0 flex-1 shrink-0 snap-start p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-blue-50/60 border border-blue-200/80 flex flex-col justify-between space-y-2 sm:space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  Margin Approval
                </span>
                <span className="text-[10px] font-bold text-blue-600">
                  PO-8820
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5">
                Metro Shoes Delhi
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 font-medium line-clamp-2 sm:line-clamp-none">
                Requested 9.5% Special Wholesale Margin (+1.5%) for 900 pairs bulk contract.
              </p>
            </div>
            <button
              onClick={() => {
                showToast('Approved 9.5% special volume margin for Metro Shoes Delhi!');
              }}
              className="w-full py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Approve Discount</span>
            </button>
          </div>

          {/* Card 3: Factory Alert */}
          <div className="min-w-[260px] sm:min-w-0 flex-1 shrink-0 snap-start p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col justify-between space-y-2 sm:space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Factory Alert
                </span>
                <span className="text-[10px] font-bold text-amber-700">
                  Agra Unit 2
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5">
                Apex Footwear Works
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 font-medium line-clamp-2 sm:line-clamp-none">
                Sole Injection Line 3 periodic maintenance. Batch SF-902 delayed 48 hours.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/admin/manufacturers')}
              className="w-full py-1.5 sm:py-2 bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View Impact</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: Field Visits */}
          <div className="min-w-[260px] sm:min-w-0 flex-1 shrink-0 snap-start p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col justify-between space-y-2 sm:space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Field Visits
                </span>
                <span className="text-[10px] font-bold text-emerald-700">
                  6 of 8 Done
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5">
                Rahul Sharma (Agra)
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 font-medium line-clamp-2 sm:line-clamp-none">
                Completed Hing Ki Mandi route. Booked ORD-0149 (200 Prs) &amp; ₹1L cheque.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/admin/sales-team')}
              className="w-full py-1.5 sm:py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>View Route</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Active Orders Live Tracking Table / Mobile List */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
            Recent Wholesale Consignments
          </h3>
          <button
            onClick={() => onNavigate('/admin/orders')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 shrink-0"
          >
            <span>All ({orders.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Card List View (Clean and Lightweight) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {orders.map((ord) => (
            <div key={ord.id} className="p-3 space-y-2 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-blue-600">
                    {ord.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      ord.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'Ready to Dispatch'
                        ? 'bg-blue-100 text-blue-800'
                        : ord.status === 'In Production'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
                <span className="font-mono font-bold text-xs text-slate-900">
                  ₹{ord.netPayable.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">
                    {ord.customerName}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {ord.customerCity} • {ord.pairsCount} Pairs ({ord.cartonsCount} Ctns)
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('/admin/orders')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold shrink-0"
                >
                  Track
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-5">Order ID</th>
                <th className="py-3 px-4">Customer Shop</th>
                <th className="py-3 px-4">Articles / SKU</th>
                <th className="py-3 px-4">Volume</th>
                <th className="py-3 px-4">Net Value</th>
                <th className="py-3 px-4">Factory Allocated</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-blue-600">
                    {ord.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">
                      {ord.customerName}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {ord.customerCity} • {ord.propName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {ord.items.map((i) => i.designName).join(', ')}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                    {ord.pairsCount} Pairs ({ord.cartonsCount} Ctns)
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 block">
                      ₹{ord.netPayable.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        ord.balanceDue === 0
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {ord.balanceDue === 0
                        ? 'Fully Cleared'
                        : `₹${ord.balanceDue.toLocaleString('en-IN')} Bal`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-800 block">
                      {ord.manufacturerName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {ord.manufacturerPlant}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'Ready to Dispatch'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'In Production'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => onNavigate('/admin/orders')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold"
                    >
                      Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
