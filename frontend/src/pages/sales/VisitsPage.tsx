import React, { useState } from 'react';
import { MapPin, Plus, CheckCircle2, Clock, Calendar, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const VisitsPage: React.FC = () => {
  const { fieldVisits, customers, completeFieldVisit, showToast } = useApp();
  const [selectedCust, setSelectedCust] = useState(customers[0]?.businessName || '');
  const [purpose, setPurpose] = useState('');

  const handleAddVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust) return;
    showToast(`Visit logged for ${selectedCust}`);
    setPurpose('');
  };

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto select-none pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 inline-block">
            Field Store Visits
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            My Retail Store Visits &amp; Routes
          </h1>
        </div>
      </div>

      {/* Log Visit Quick Form */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900">
          Quick Log New Field Visit
        </h3>
        <form onSubmit={handleAddVisit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={selectedCust}
            onChange={(e) => setSelectedCust(e.target.value)}
            className="h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.businessName}>
                {c.businessName} ({c.city})
              </option>
            ))}
          </select>
          <input
            type="text"
            required
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Purpose (e.g. Sample showing, ledger collection)..."
            className="h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Check-in at Store</span>
          </button>
        </form>
      </div>

      {/* Visits List */}
      <div className="space-y-3">
        {fieldVisits.map((v) => (
          <div
            key={v.id}
            className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900">
                  {v.customerName}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    v.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {v.status === 'completed' ? 'Completed' : 'Scheduled Today'}
                </span>
                {v.outcome && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                    {v.outcome}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                <MapPin className="w-3 h-3 inline mr-1 text-slate-400" />
                {v.location} • Time: <strong>{v.time}</strong>
              </p>
              <p className="text-xs text-slate-700 mt-2 font-medium">
                {v.purpose}
              </p>
              {v.notes && (
                <p className="text-[11px] text-slate-500 mt-1 italic">
                  Note: {v.notes}
                </p>
              )}
            </div>

            {v.status !== 'completed' && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => completeFieldVisit(v.id, 'Order Created', 'Took fresh wholesale order')}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Mark Order Taken
                </button>
                <button
                  onClick={() => completeFieldVisit(v.id, 'Follow-up Needed', 'Owner requested quote')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Follow-up Needed
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
