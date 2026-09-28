import React, { useState } from 'react';
import {
  Factory,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Phone,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Manufacturer } from '../../types';

interface ManufacturersPageProps {
  onNavigate: (path: string) => void;
}

export const ManufacturersPage: React.FC<ManufacturersPageProps> = ({ onNavigate }) => {
  const { manufacturers, orders, showToast } = useApp();
  const [selectedMfg, setSelectedMfg] = useState<Manufacturer>(manufacturers[0]);

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto select-none pb-20 md:pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 inline-block">
            Supply Chain &amp; Plants
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Manufacturing Plants &amp; Foundries
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 px-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <Factory className="w-4 h-4 text-blue-600" />
            <span>4 Partner Plants</span>
          </div>
        </div>
      </div>

      {/* 2. Plants Grid (Screenshot 3 & 7 Match!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {manufacturers.map((mfg) => {
          const isSelected = selectedMfg.id === mfg.id;
          const assignedOrders = orders.filter((o) => o.manufacturerId === mfg.id);

          return (
            <div
              key={mfg.id}
              onClick={() => setSelectedMfg(mfg)}
              className={`bg-white rounded-3xl border p-6 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-4 ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20'
                  : 'border-slate-200/90'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {mfg.companyName}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        mfg.status === 'Active Plants'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {mfg.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {mfg.hubLocation}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Factory className="w-5 h-5" />
                </div>
              </div>

              {/* Specialization */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Core Specialization
                </span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {mfg.primarySpecialization}
                </span>
              </div>

              {/* Load Capacity Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">
                    Assembly Floor Utilization
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {mfg.loadPercentage}% ({mfg.monthlyCapacityPairs.toLocaleString('en-IN')} prs/mo)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      mfg.loadPercentage > 85 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${mfg.loadPercentage}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">
                    ON-TIME DEL.
                  </span>
                  <span className="text-xs font-black text-slate-900 font-mono block mt-0.5">
                    {mfg.onTimeDeliveryRate}%
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">
                    QC PASS
                  </span>
                  <span className="text-xs font-black text-emerald-600 font-mono block mt-0.5">
                    {mfg.qcPassRatio}%
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">
                    MOLDS ACTIVE
                  </span>
                  <span className="text-xs font-black text-blue-700 font-mono block mt-0.5">
                    {mfg.moldsActiveCount || 36} Dies
                  </span>
                </div>
              </div>

              {/* Manager & Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">General Manager:</span>
                  <p className="font-semibold text-slate-800">
                    {mfg.generalManager} ({mfg.phone})
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Direct WhatsApp dispatched to Plant GM ${mfg.generalManager}`);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Contact Plant
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
