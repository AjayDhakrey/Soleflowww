import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import AuditKpiCards from '../../components/admin/AuditKpiCards';
import {
  FileCheck,
  ShieldCheck,
  User,
  AlertTriangle,
  Download,
  Search,
  Box,
  IndianRupee,
  Building2,
  Share2,
  Bell,
  CreditCard,
  MoreVertical,
  ChevronRight,
  ArrowUpDown,
  X,
} from 'lucide-react';

interface AuditLogPageProps {
  onNavigate?: (path: string) => void;
}

export const AuditLogPage: React.FC<AuditLogPageProps> = ({ onNavigate }) => {
  const { auditLogs, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedAudit, setSelectedAudit] = useState<any | null>(null);

  // Map AppContext audit logs
  const mappedLogs = useMemo(() => {
    return auditLogs.map((log, idx) => {
      const isSystem = log.actorRole?.includes('System') || log.actor === 'System';
      const isAdmin = log.actorRole?.includes('Admin') || log.actorRole?.includes('Trader');

      let icon = Box;
      let isWhatsApp = false;
      if (log.recordType === 'Payment') icon = IndianRupee;
      else if (log.recordType === 'Client') icon = CreditCard;
      else if (log.recordType === 'Manufacturer') icon = Building2;
      else if (log.recordType === 'Design') {
        icon = Share2;
        isWhatsApp = true;
      } else if (isSystem) icon = Bell;

      const actorInitials = log.actor
        ? log.actor.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
        : 'SF';

      const actorColor = isAdmin
        ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/50'
        : isSystem
        ? 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/50'
        : 'bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900/50';

      return {
        id: log.id || `evt-${idx}`,
        timestamp: log.timestamp || 'Today',
        actorName: log.actor || 'System Admin',
        actorRole: log.actorRole || (isAdmin ? 'Trader / Admin' : 'Field Sales Rep'),
        actorInitials,
        actorColor,
        action: log.action || 'Updated Record',
        entityTitle: log.recordTitle || `${log.recordType} ${log.recordId || ''}`,
        entityRef: log.recordId || 'REF',
        entityIcon: icon,
        isWhatsAppIcon: isWhatsApp,
        entityType: log.recordType || 'Order',
        stateModBadge: log.newValue || 'Updated state',
        stateModDetail: log.oldValue ? `Prev: ${log.oldValue}` : '(Direct mutation)',
        raw: log,
      };
    });
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    return mappedLogs.filter((log) => {
      const q = search.toLowerCase();
      const matchesSearch =
        log.action.toLowerCase().includes(q) ||
        log.entityTitle.toLowerCase().includes(q) ||
        log.entityRef.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        log.stateModBadge.toLowerCase().includes(q);

      const matchesEntity = entityFilter === 'All' || log.entityType === entityFilter;
      const matchesRole = roleFilter === 'All' || log.actorRole === roleFilter;

      return matchesSearch && matchesEntity && matchesRole;
    });
  }, [mappedLogs, search, entityFilter, roleFilter]);

  // Counts for KPIs
  const traderCount = useMemo(() => mappedLogs.filter((l) => l.actorRole.includes('Admin') || l.actorRole.includes('Trader')).length, [mappedLogs]);
  const fieldRepCount = useMemo(() => mappedLogs.filter((l) => l.actorRole.includes('Sales') || l.actorRole.includes('Field')).length, [mappedLogs]);
  const systemCount = useMemo(() => mappedLogs.filter((l) => l.actorRole.includes('System') || l.actorName === 'System').length, [mappedLogs]);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Actor Name', 'Actor Role', 'Action', 'Entity Type', 'Entity Title', 'Reference ID', 'New Value', 'Old Value'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.actorName}"`,
      `"${l.actorRole}"`,
      `"${l.action}"`,
      `"${l.entityType}"`,
      `"${l.entityTitle}"`,
      `"${l.entityRef}"`,
      `"${l.stateModBadge}"`,
      `"${l.stateModDetail}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `soleflow_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit Trail exported to CSV!');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto pb-24 md:pb-12 bg-background text-foreground animate-in fade-in duration-150">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-primary">
        <button
          type="button"
          onClick={() => onNavigate?.('/admin/dashboard')}
          className="hover:underline cursor-pointer"
        >
          Dashboard
        </button>
        <ChevronRight size={13} className="text-muted-foreground/60" />
        <span className="text-primary font-bold">
          Audit Log
        </span>
      </div>

      {/* 2. Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Audit Log &amp; Business Traceability
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Immutable governance record of who did what, when, to which record, and exact value state changes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-muted text-foreground text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <Download size={16} />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* 3. 4 KPI Summary Cards Row */}
      <AuditKpiCards
        totalEvents={mappedLogs.length}
        totalCaption="Live transactional log"
        traderCount={traderCount}
        traderCaption="Full authority actions"
        fieldRepCount={fieldRepCount}
        fieldRepCaption="Collections & orders"
        automatedCount={systemCount}
        automatedCaption="Overdue & stage alerts"
      />

      {/* 4. Table Panel */}
      <div className="bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 md:px-6 bg-surface border-b border-border flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail by actor, order ID, client, action..."
              className="w-full h-10 pl-10 pr-4 bg-muted/40 hover:bg-muted/70 focus:bg-surface border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="w-full sm:w-44 shrink-0">
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="w-full h-10 px-3 bg-muted/40 hover:bg-muted/70 focus:bg-surface border border-border rounded-xl text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              <option value="All">All Entity Types</option>
              <option value="Order">Orders</option>
              <option value="Payment">Payments</option>
              <option value="Client">Clients</option>
              <option value="Manufacturer">Manufacturers</option>
              <option value="Design">Designs</option>
            </select>
          </div>

          <div className="w-full sm:w-44 shrink-0">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full h-10 px-3 bg-muted/40 hover:bg-muted/70 focus:bg-surface border border-border rounded-xl text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="Trader / Admin">Trader / Admin</option>
              <option value="Field Sales Rep">Field Sales Rep</option>
              <option value="System">System</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold uppercase text-[11px] tracking-wider bg-muted/25">
                <th className="py-3.5 px-4 md:px-6">
                  <div className="flex items-center gap-1.5 select-none">
                    <span>Timestamp</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity &amp; Reference</th>
                <th className="py-3.5 px-4">State Modification</th>
                <th className="py-3.5 px-4 md:px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <FileCheck className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="font-semibold text-foreground text-sm">No Audit Events Found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">New operational transactions will be automatically recorded here.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const IconComp = log.entityIcon;

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedAudit(log)}
                  >
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 md:px-6 whitespace-nowrap text-muted-foreground font-medium text-xs">
                      {log.timestamp}
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${log.actorColor}`}>
                          {log.actorInitials}
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-xs sm:text-sm leading-tight">
                            {log.actorName}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {log.actorRole}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        {log.action}
                      </span>
                    </td>

                    {/* Entity & Reference */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          log.isWhatsAppIcon
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                        }`}>
                          <IconComp size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-xs sm:text-sm leading-tight">
                            {log.entityTitle}
                          </div>
                          <div className="font-mono text-[11px] text-muted-foreground mt-0.5">
                            {log.entityRef}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* State Modification */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-foreground text-xs leading-tight">
                          {log.stateModBadge}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {log.stateModDetail}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 md:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedAudit(log)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        title="View Full Audit Event"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">Audit Event Snapshot</h3>
              <button
                type="button"
                onClick={() => setSelectedAudit(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Action:</span>
                <span className="font-bold text-foreground">{selectedAudit.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actor:</span>
                <span className="text-foreground">{selectedAudit.actorName} ({selectedAudit.actorRole})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entity:</span>
                <span className="font-mono text-foreground">{selectedAudit.entityType} ({selectedAudit.entityRef})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timestamp:</span>
                <span className="font-mono text-foreground">{selectedAudit.timestamp}</span>
              </div>
              <div className="border-t border-border pt-2 space-y-1">
                <span className="text-muted-foreground block">Modified Value:</span>
                <p className="p-2.5 rounded-lg bg-muted/60 text-foreground font-mono text-[11px] break-all">
                  {selectedAudit.stateModBadge}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
