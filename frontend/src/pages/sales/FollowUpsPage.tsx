import React from 'react';
import { CalendarCheck, Phone, CheckCircle2, Clock, Plus, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FollowUpsPage: React.FC = () => {
  const { followUps, completeFollowUp, showToast } = useApp();

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto select-none pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 inline-block">
            Retail Pipeline &amp; Calls
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Follow-ups &amp; Buyer Reminders
          </h1>
        </div>

        <button
          onClick={() => showToast('Follow-up scheduled')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Follow-up</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {followUps.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-3xl border bg-white shadow-xs space-y-3 ${
              item.status === 'completed'
                ? 'opacity-60 border-slate-200'
                : 'border-slate-200/90 hover:border-blue-400'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {item.date} • {item.time}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-2">
                  {item.customerName}
                </h3>
                <p className="text-xs text-slate-500">{item.customerCity}</p>
              </div>
              {item.status === 'completed' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Completed
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  Pending
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
              {item.reason}
            </p>

            {item.notes && (
              <p className="text-[11px] text-slate-400 italic">
                Note: {item.notes}
              </p>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`tel:${item.phone}`}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Shop</span>
              </a>

              {item.status !== 'completed' && (
                <button
                  onClick={() => completeFollowUp(item.id)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Done</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
