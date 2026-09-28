import React from 'react';
import { Bell, AlertTriangle, CheckCircle2, Clock, Factory, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead } = useApp();

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto select-none">
      <div>
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 inline-block">
          System Alerts
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
          Notifications &amp; Trade Alerts
        </h1>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markNotificationAsRead(n.id)}
            className={`p-4 flex items-start gap-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
              n.read ? 'opacity-60' : 'bg-blue-50/20'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                n.category === 'alert'
                  ? 'bg-rose-100 text-rose-600'
                  : n.category === 'factory'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {n.category === 'alert' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : n.category === 'factory' ? (
                <Factory className="w-4 h-4" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
