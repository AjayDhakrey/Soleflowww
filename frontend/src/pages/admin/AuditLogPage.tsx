import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  History,
  Download,
  User,
  ShoppingBag,
  Layers,
  CreditCard,
  Factory,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuditEvent } from '../../types';

export const AuditLogPage: React.FC = () => {
  const { auditLogs, currentUser, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [recordFilter, setRecordFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  const recordTypes = ['All', 'Client', 'Order', 'Payment', 'Design', 'Manufacturer'];
  const roleTypes = ['All', 'Trader / Admin', 'Field Sales Rep', 'System'];

  const filteredLogs = auditLogs.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(q) ||
      log.recordTitle.toLowerCase().includes(q) ||
      log.recordId.toLowerCase().includes(q) ||
      log.actor.toLowerCase().includes(q) ||
      log.newValue.toLowerCase().includes(q);

    const matchesRecord = recordFilter === 'All' || log.recordType === recordFilter;
    const matchesRole = roleFilter === 'All' || log.actorRole === roleFilter;

    return matchesSearch && matchesRecord && matchesRole;
  });

  const getRecordIcon = (type: AuditEvent['recordType']) => {
    switch (type) {
      case 'Client':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'Order':
        return <ShoppingBag className="w-4 h-4 text-purple-600" />;
      case 'Payment':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'Design':
        return <Layers className="w-4 h-4 text-amber-600" />;
      case 'Manufacturer':
        return <Factory className="w-4 h-4 text-rose-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto select-none pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 inline-block">
              Governance &amp; Traceability
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
              Immutable Trail
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Audit Log &amp; Business Traceability
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Complete reconstruction of who did what, when, to which record, and exact value state changes.
          </p>
        </div>

        <button
          onClick={() => showToast('Exported Audit Log JSON/CSV for external compliance audit')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">Total Audit Events</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{auditLogs.length}</div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">● Real-time sync</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">Trader Actions</span>
          <div className="text-2xl font-black text-blue-700 mt-1 font-mono">
            {auditLogs.filter((l) => l.actorRole === 'Trader / Admin').length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Full authority logs</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">Sales Force Entries</span>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
            {auditLogs.filter((l) => l.actorRole === 'Field Sales Rep').length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Collections &amp; shares</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">Automated Alerts</span>
          <div className="text-2xl font-black text-purple-700 mt-1 font-mono">
            {auditLogs.filter((l) => l.actorRole === 'System').length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Overdue triggers</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail by actor, order ID, client, action..."
              className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <span className="text-slate-400 px-2 text-[10px] font-bold uppercase">Role:</span>
              {roleTypes.map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                    roleFilter === r
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Record Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Filter Record:
          </span>
          {recordTypes.map((t) => (
            <button
              key={t}
              onClick={() => setRecordFilter(t)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                recordFilter === t
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Timeline Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              Audit Event Records ({filteredLogs.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Sorted Chronologically (Latest first)</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <ShieldAlert className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">No audit events match your filter criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4 group"
              >
                {/* Left: Icon & Meta */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    {getRecordIcon(log.recordType)}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {log.action}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                        {log.recordType}: {log.recordId}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          log.actorRole === 'Trader / Admin'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : log.actorRole === 'Field Sales Rep'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-purple-50 text-purple-800 border border-purple-200'
                        }`}
                      >
                        {log.actorRole}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-700">
                      Target Entity: <strong className="text-slate-900">{log.recordTitle}</strong>
                    </p>

                    {/* Diff: Old Value -> New Value */}
                    <div className="pt-1.5 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                      {log.oldValue && (
                        <div className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-800 text-[11px] font-mono">
                          <span className="text-[9px] uppercase font-bold text-rose-500 block leading-tight">Previous</span>
                          {log.oldValue}
                        </div>
                      )}
                      {log.oldValue && <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />}
                      <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-[11px] font-mono">
                        <span className="text-[9px] uppercase font-bold text-emerald-600 block leading-tight">Current State</span>
                        {log.newValue}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Timestamp & Source */}
                <div className="text-left md:text-right shrink-0 text-xs space-y-1 pl-13 md:pl-0">
                  <div className="font-bold text-slate-800">{log.actor}</div>
                  <div className="flex items-center md:justify-end gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{log.timestamp}</span>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                    Via {log.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
