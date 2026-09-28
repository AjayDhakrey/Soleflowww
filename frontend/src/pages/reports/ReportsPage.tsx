import React from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Download,
  CheckCircle2,
  Calendar,
  Layers,
  Factory,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportsPage: React.FC = () => {
  const { customers, orders, showToast } = useApp();

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto select-none pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 inline-block">
            Executive Analytics
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Reports, Margins &amp; Trade Alerts
          </h1>
        </div>

        <button
          onClick={() => showToast('Generated GST Wholesale Audit Ledger (Q3 FY24-25)')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Excel Ledger</span>
        </button>
      </div>

      {/* Margin Approvals Queue */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900">
            Pending Volume Margin Approvals
          </h3>
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            1 Pending
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900">
                Metro Shoes Delhi (PO-8820)
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                +1.5% Override
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              900 Pairs Runner Classic • Requested 9.5% bulk discount instead of default 8.0%.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Impact: ₹28,400 margin concession • Profitability remains healthy at 21.4%.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Override rejected • Reset to 8.0% standard discount')}
              className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
            >
              Reject
            </button>
            <button
              onClick={() => showToast('Special 9.5% volume discount approved for PO-8820!')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Approve 9.5%
            </button>
          </div>
        </div>
      </div>

      {/* Production Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900">
            Monthly Category Turnover
          </h3>
          <div className="space-y-3 pt-2 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-700">Athletic Sneakers (Phylon &amp; EVA)</span>
                <span className="font-mono font-bold text-slate-900">₹14.2L (57%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '57%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-700">Formal Derby &amp; Crust Oxford</span>
                <span className="font-mono font-bold text-slate-900">₹6.4L (26%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '26%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-700">Leather Boots &amp; Chelsea</span>
                <span className="font-mono font-bold text-slate-900">₹4.2L (17%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '17%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900">
            Hub Delivery Precision Rate
          </h3>
          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-900 block">Agra Industrial Cluster</span>
                <span className="text-[11px] text-emerald-700">Apex Footwear Works &amp; Taj Craft</span>
              </div>
              <span className="text-base font-black text-emerald-800 font-mono">96.4% On-Time</span>
            </div>

            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-blue-900 block">Kanpur Leather Belt</span>
                <span className="text-[11px] text-blue-700">Metro Leather Crafts</span>
              </div>
              <span className="text-base font-black text-blue-800 font-mono">94.1% On-Time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
