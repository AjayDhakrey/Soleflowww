import React from 'react';
import {
  MapPin,
  Plus,
  CreditCard,
  Share2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SalesDashboardProps {
  onNavigate: (path: string) => void;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    salesTeam,
    followUps,
    fieldVisits,
    setIsCreateOrderModalOpen,
    setIsPaymentModalOpen,
    setIsShareModalOpen,
    toggleSalesTask,
    completeFollowUp,
    completeFieldVisit,
    showToast,
  } = useApp();

  const currentRep = salesTeam.find((r) => r.id === currentUser.id) || salesTeam[0];
  const targetPct = Math.round((currentRep.bookedThisMonth / currentRep.monthlyTarget) * 100);

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto select-none pb-20 md:pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 inline-block">
            Field Sales Portal
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Good morning, Rahul
          </h1>
        </div>

        {/* Rep Actions */}
        <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 sm:gap-2.5">
          <button
            onClick={() => onNavigate('/sales/visits')}
            className="flex items-center justify-center gap-1 px-2.5 py-2 sm:px-3.5 sm:py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Log Visit</span>
          </button>
          <button
            onClick={() => setIsCreateOrderModalOpen(true)}
            className="flex items-center justify-center gap-1 px-2.5 py-2 sm:px-3.5 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
            <span className="truncate">+ Order</span>
          </button>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center justify-center gap-1 px-2.5 py-2 sm:px-3.5 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Catalog</span>
          </button>
        </div>
      </div>

      {/* 2. Rep KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-3xl border border-slate-200/90 shadow-xs">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
            MONTHLY BOOKING TARGET
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base sm:text-xl font-black text-slate-900 font-display">
              ₹{(currentRep.bookedThisMonth / 100000).toFixed(1)}L
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 font-mono">
              / ₹{(currentRep.monthlyTarget / 100000).toFixed(1)}L
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${targetPct}%` }} />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 block mt-1 truncate">
            {targetPct}% achieved
          </span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-3xl border border-slate-200/90 shadow-xs">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
            COMMISSION ACCRUED
          </span>
          <span className="text-base sm:text-xl font-black text-emerald-700 font-display block mt-1">
            ₹{currentRep.commissionAccrued.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-3xl border border-slate-200/90 shadow-xs">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
            TODAY'S VISITS
          </span>
          <span className="text-base sm:text-xl font-black text-blue-700 font-display block mt-1">
            {currentRep.todayVisitsDone} / {currentRep.todayVisitsTotal}
          </span>
        </div>

        <div className="bg-rose-50/70 p-3 sm:p-4 rounded-xl sm:rounded-3xl border border-rose-200/80">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-rose-700 block truncate">
            COLLECTION DUE
          </span>
          <span className="text-base sm:text-xl font-black text-rose-700 font-display block mt-1">
            ₹{(currentRep.collectionDue / 100000).toFixed(2)}L
          </span>
          <button
            onClick={() => onNavigate('/sales/collections')}
            className="text-[9px] sm:text-[10px] font-bold text-rose-800 hover:underline block mt-1 truncate"
          >
            Collect Cheques &rarr;
          </button>
        </div>
      </div>

      {/* 3. Today's Route Checklist & Follow-ups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left Column: Field Route Tasks (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              Today's Field Route &amp; Store Stops
            </h3>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {currentRep.tasksChecklist.map((task: any) => (
              <div
                key={task.id}
                onClick={() => toggleSalesTask(currentRep.id, task.id)}
                className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${
                  task.completed
                    ? 'bg-slate-50 border-slate-200 text-slate-500'
                    : 'bg-white border-blue-200 shadow-xs hover:border-blue-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className={`text-xs font-bold ${task.completed ? 'line-through' : 'text-slate-900'}`}>
                    {task.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">{task.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {task.description}
                </p>
                {task.badge && (
                  <span
                    className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.badgeColor === 'green'
                        ? 'bg-emerald-100 text-emerald-800'
                        : task.badgeColor === 'blue'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {task.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Follow-ups Due (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              Urgent Buyer Follow-ups
            </h3>
            <button
              onClick={() => onNavigate('/sales/follow-ups')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {followUps.map((fol) => (
              <div
                key={fol.id}
                className="p-3 sm:p-3.5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">
                    {fol.customerName} ({fol.customerCity})
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {fol.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  {fol.reason}
                </p>
                {fol.amountDue && (
                  <p className="text-[11px] font-bold text-rose-600">
                    Pending Due: ₹{fol.amountDue.toLocaleString('en-IN')}
                  </p>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <a
                    href={`tel:${fol.phone}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Shop</span>
                  </a>
                  <button
                    onClick={() => completeFollowUp(fol.id)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
