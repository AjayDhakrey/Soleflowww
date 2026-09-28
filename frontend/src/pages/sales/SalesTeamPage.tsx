import React, { useState } from 'react';
import {
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  CheckSquare,
  Square,
  CreditCard,
  Briefcase,
  TrendingUp,
  Phone,
  Mail,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Salesperson } from '../../types';

interface SalesTeamPageProps {
  onNavigate: (path: string) => void;
}

export const SalesTeamPage: React.FC<SalesTeamPageProps> = ({ onNavigate }) => {
  const { salesTeam, toggleSalesTask, showToast } = useApp();
  const [selectedRepId, setSelectedRepId] = useState<string>(salesTeam[0]?.id || '');

  const activeRep = salesTeam.find((r) => r.id === selectedRepId) || salesTeam[0];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 inline-block">
            Field Force &amp; Territory
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Sales Force &amp; Field Dispatch
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2.5 px-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>3 Reps Currently In Market</span>
          </div>
        </div>
      </div>

      {/* 2. Reps Split Grid (Exact Screenshot 6 Match!) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Rep List Cards (4 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
            Territory Representatives ({salesTeam.length})
          </span>

          <div className="space-y-3">
            {salesTeam.map((rep) => {
              const isSelected = activeRep.id === rep.id;
              const targetAchieved = Math.round((rep.bookedThisMonth / rep.monthlyTarget) * 100);

              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedRepId(rep.id)}
                  className={`p-4 rounded-3xl border bg-white cursor-pointer transition-all shadow-xs ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={rep.photo}
                        alt={rep.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900">
                            {rep.name}
                          </h3>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-700">
                            {rep.empId}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {rep.roleTitle} • {rep.zone}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rep.status === 'In Market'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>

                  {/* Progress to Monthly Target */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 text-[11px]">Monthly Booking</span>
                      <span className="font-mono font-bold text-slate-800">
                        ₹{(rep.bookedThisMonth / 100000).toFixed(1)}L / ₹{(rep.monthlyTarget / 100000).toFixed(1)}L ({targetAchieved}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.min(100, targetAchieved)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Visits: <strong>{rep.todayVisitsDone}/{rep.todayVisitsTotal}</strong></span>
                    <span>Cheques: <strong className="text-emerald-700 font-mono">₹{(rep.chequesTodayAmount / 100000).toFixed(2)}L</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Rep Profile & Daily Route Log (7 Cols) */}
        {activeRep && (
          <div className="lg:col-span-7 space-y-4">
            {/* Header Profile Box */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={activeRep.photo}
                    alt={activeRep.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-4 ring-blue-50"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-900">
                        {activeRep.name}
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {activeRep.roleTitle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activeRep.cluster} • {activeRep.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activeRep.phone}`}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`mailto:${activeRep.email}`}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Sample Kit Verification Banner */}
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-950 font-medium">
                    Assigned Kit: <strong>{activeRep.assignedKit}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-blue-700 font-bold">
                  Verified {activeRep.kitVerifiedDate}
                </span>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    MONTH TARGET
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono block mt-0.5">
                    ₹{(activeRep.monthlyTarget / 100000).toFixed(1)}L
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    BOOKED (MTD)
                  </span>
                  <span className="text-sm font-black text-blue-700 font-mono block mt-0.5">
                    ₹{(activeRep.bookedThisMonth / 100000).toFixed(1)}L
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    COMMISSION
                  </span>
                  <span className="text-sm font-black text-emerald-700 font-mono block mt-0.5">
                    ₹{activeRep.commissionAccrued.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-200/80">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block">
                    COLLECTION DUE
                  </span>
                  <span className="text-sm font-black text-rose-700 font-mono block mt-0.5">
                    ₹{(activeRep.collectionDue / 100000).toFixed(2)}L
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Visit & Cheque Collection Checklist */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Today's Retail Visit &amp; Cheque Collection Route
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  {activeRep.todayVisitsDone} / {activeRep.todayVisitsTotal} Completed
                </span>
              </div>

              {/* Task Items */}
              <div className="space-y-3">
                {activeRep.tasksChecklist.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      toggleSalesTask(activeRep.id, task.id);
                      showToast(task.completed ? 'Task reopened' : 'Task marked complete!');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      task.completed
                        ? 'bg-slate-50/60 border-slate-200 text-slate-600'
                        : 'bg-white border-blue-200 shadow-xs hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        className="mt-0.5 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {task.completed ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-xs font-bold ${
                              task.completed
                                ? 'line-through text-slate-500'
                                : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {task.time}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {task.description}
                        </p>

                        {task.badge && (
                          <div className="mt-2 flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                task.badgeColor === 'green'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : task.badgeColor === 'blue'
                                  ? 'bg-blue-100 text-blue-800'
                                  : task.badgeColor === 'amber'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {task.badge}
                            </span>
                            {task.verifiedGps && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-emerald-500" />
                                Verified GPS Check-in
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
