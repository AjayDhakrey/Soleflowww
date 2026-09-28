import React, { useState } from 'react';
import {
  Search,
  Plus,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  FileText,
  CreditCard,
  ChevronRight,
  Filter,
  Eye,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';

interface OrdersPageProps {
  onNavigate: (path: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  const {
    orders,
    setIsCreateOrderModalOpen,
    setIsPaymentModalOpen,
    updateOrderStatus,
    currentUser,
    showToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>('list');

  const statuses = [
    'All',
    'In Production',
    'Ready to Dispatch',
    'Delivered',
    'Under Review',
  ];

  const roleFilteredOrders =
    currentUser.role === 'salesperson'
      ? orders.filter((o) => o.salespersonId === currentUser.id || o.salespersonName.includes(currentUser.name))
      : orders;

  const filteredOrders = roleFilteredOrders.filter((ord) => {
    const matchesSearch =
      ord.id.toLowerCase().includes(search.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(search.toLowerCase()) ||
      ord.customerCity.toLowerCase().includes(search.toLowerCase()) ||
      ord.items.some((i) => i.designName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeOrd = selectedOrder || filteredOrders[0] || orders[0];

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto select-none pb-20 md:pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 inline-block">
            Consignments &amp; Orders
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            {currentUser.role === 'admin' ? 'Wholesale Orders & Production Batches' : 'My Orders & Dispatches'}
          </h1>
        </div>

        <button
          onClick={() => setIsCreateOrderModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>+ New Wholesale Order</span>
        </button>
      </div>

      {/* 2. Filters (hidden on mobile when inspecting order detail) */}
      <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs ${mobileTab === 'detail' ? 'hidden lg:flex' : 'flex'}`}>
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID (ORD-0148), customer, article..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === s
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Split View: Left Orders List + Right Detailed Order Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left Column: Order Cards / List (5 Cols) */}
        <div className={`lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs ${mobileTab === 'detail' ? 'hidden lg:block' : 'block'}`}>
          <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Orders Queue ({filteredOrders.length})
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[720px] overflow-y-auto">
            {filteredOrders.map((ord) => {
              const isSelected = activeOrd?.id === ord.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => {
                    setSelectedOrder(ord);
                    setMobileTab('detail');
                  }}
                  className={`p-3.5 sm:p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50/70 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-600">
                      {ord.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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

                  <div className="mt-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {ord.customerName}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {ord.customerCity} • {ord.pairsCount} Pairs ({ord.cartonsCount} Cartons)
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">
                      Plant: {ord.manufacturerName}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{ord.netPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Order Detail & Timeline Inspector (7 Cols) */}
        {activeOrd ? (
          <div className={`lg:col-span-7 space-y-4 ${mobileTab === 'list' ? 'hidden lg:block' : 'block'}`}>
            {/* Mobile Back Header Button */}
            <div className="lg:hidden flex items-center justify-between bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 shadow-xs sticky top-0 z-20">
              <button
                onClick={() => setMobileTab('list')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-blue-600 py-1 px-2 rounded-lg active:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>All Orders List</span>
              </button>
              <span className="text-xs font-mono font-bold text-blue-600">
                {activeOrd.id}
              </span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-blue-600">
                      {activeOrd.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        activeOrd.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {activeOrd.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    {activeOrd.customerName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {activeOrd.customerCity}, {activeOrd.customerState} • Prop: {activeOrd.propName}
                  </p>
                </div>

                {/* Status progression button */}
                <div className="flex items-center gap-2">
                  {activeOrd.status === 'Submitted' && (
                    <button
                      onClick={() => updateOrderStatus(activeOrd.id, 'Approved')}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                    >
                      Approve Order
                    </button>
                  )}
                  {activeOrd.status === 'Approved' && (
                    <button
                      onClick={() => updateOrderStatus(activeOrd.id, 'In Production')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
                    >
                      Send to Production
                    </button>
                  )}
                  {activeOrd.status === 'In Production' && (
                    <button
                      onClick={() => updateOrderStatus(activeOrd.id, 'Ready to Dispatch')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                    >
                      Pass QC &amp; Pack
                    </button>
                  )}
                  {activeOrd.status === 'Ready to Dispatch' && (
                    <button
                      onClick={() => updateOrderStatus(activeOrd.id, 'Delivered')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                    >
                      Confirm Bilty Delivery
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Milestones */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  PRODUCTION &amp; LOGISTICS TIMELINE
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {activeOrd.timeline.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-xs ${
                        step.completed
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : step.active
                          ? 'bg-blue-50 border-blue-300 text-blue-900 ring-2 ring-blue-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        {step.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        <span>{step.step}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{step.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ordered Items Breakdown */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  ARTICLE LINE ITEMS
                </span>
                <div className="space-y-2">
                  {activeOrd.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.designName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            {item.designName}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Article {item.articleCode} • ₹{item.ratePerPair} / pair
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 font-mono block">
                          {item.totalPairs} Pairs ({item.totalCartons} Cartons)
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ₹{item.itemSubtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commercials Summary Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total Order Value
                  </span>
                  <span className="font-mono font-bold text-slate-900 block mt-0.5">
                    ₹{activeOrd.netPayable.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Advance Paid
                  </span>
                  <span className="font-mono font-bold text-emerald-600 block mt-0.5">
                    ₹{activeOrd.advanceDeposited.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Balance Due
                  </span>
                  <span
                    className={`font-mono font-bold block mt-0.5 ${
                      activeOrd.balanceDue > 0 ? 'text-amber-600' : 'text-slate-500'
                    }`}
                  >
                    ₹{activeOrd.balanceDue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Factory Facility
                  </span>
                  <span className="font-medium text-slate-800 block mt-0.5">
                    {activeOrd.manufacturerName}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() =>
                    alert(
                      `Generated Transport Bilty & Packing Slip for ${activeOrd.id} (${activeOrd.pairsCount} Pairs to ${activeOrd.customerCity}).`
                    )
                  }
                  className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Transport Bilty / Slip</span>
                </button>
                {activeOrd.balanceDue > 0 && (
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Record Balance Settlement</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
            Select an order to view size breakdown, manufacturing facility, and delivery timeline.
          </div>
        )}
      </div>
    </div>
  );
};
