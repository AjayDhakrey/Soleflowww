import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
} from 'lucide-react';

interface AuditLogPageProps {
  onNavigate?: (path: string) => void;
}

const AUDIT_EVENTS = [
  {
    id: 'evt-1',
    timestamp: 'Today, 02:45 PM',
    actorName: 'Ajay Sharma',
    actorRole: 'Trader / Admin',
    actorInitials: 'AS',
    actorColor: 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/50',
    action: 'Approved Wholesale Order',
    entityTitle: 'ABC Footwear (420 Pairs)',
    entityRef: 'ORD-0148',
    entityIcon: Box,
    entityType: 'Order',
    stateModBadge: 'Status: Approved',
    stateModDetail: '(Assigned to Apex...)',
  },
  {
    id: 'evt-2',
    timestamp: 'Today, 01:15 PM',
    actorName: 'Rahul Sharma',
    actorRole: 'Field Sales Rep',
    actorInitials: 'RS',
    actorColor: 'bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900/50',
    action: 'Recorded Payment Collection',
    entityTitle: 'ABC Footwear – ₹1,00,000 NEFT',
    entityRef: 'PAY-00931',
    entityIcon: IndianRupee,
    entityType: 'Payment',
    stateModBadge: 'Customer Due: ₹1,30,000',
    stateModDetail: '(UTR HDFC...)',
  },
  {
    id: 'evt-3',
    timestamp: 'Yesterday, 05:30 PM',
    actorName: 'Ajay Sharma',
    actorRole: 'Trader / Admin',
    actorInitials: 'AS',
    actorColor: 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/50',
    action: 'Assigned Manufacturing Facility',
    entityTitle: 'Apex Footwear Works (Agra Plant)',
    entityRef: 'mfg-1',
    entityIcon: Building2,
    entityType: 'Manufacturer',
    stateModBadge: 'Active Batches: 9',
    stateModDetail: '(Batch SF-903...)',
  },
  {
    id: 'evt-4',
    timestamp: 'Yesterday, 11:20 AM',
    actorName: 'Rahul Sharma',
    actorRole: 'Field Sales Rep',
    actorInitials: 'RS',
    actorColor: 'bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900/50',
    action: 'Shared Digital Lookbook',
    entityTitle: '3 Autumn Designs shared with ABC Footwear',
    entityRef: 'sf-1024',
    entityIcon: Share2,
    isWhatsAppIcon: true,
    entityType: 'Design',
    stateModBadge: 'Shared via WhatsApp',
    stateModDetail: '(with Ramesh A...)',
  },
  {
    id: 'evt-5',
    timestamp: '24 Sep, 04:10 PM',
    actorName: 'Ajay Sharma',
    actorRole: 'Trader / Admin',
    actorInitials: 'AS',
    actorColor: 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/50',
    action: 'Adjusted Customer Credit Limit',
    entityTitle: 'ABC Footwear',
    entityRef: 'cust-1',
    entityIcon: CreditCard,
    entityType: 'Client',
    stateModBadge: 'Credit Limit: ₹5,00,000',
    stateModDetail: '(Approved...)',
  },
  {
    id: 'evt-6',
    timestamp: '24 Sep, 09:00 AM',
    actorName: 'System',
    actorRole: 'System',
    actorInitials: 'SS',
    actorColor: 'bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900/50',
    action: 'Generated Automatic Overdue Alert',
    entityTitle: 'Regal Footwear Hub',
    entityRef: 'cust-2',
    entityIcon: Bell,
    entityType: 'Client',
    stateModBadge: 'Overdue: 14 Days',
    stateModDetail: '(₹1,15,000 Overd...)',
  },
];

export const AuditLogPage: React.FC<AuditLogPageProps> = ({ onNavigate }) => {
  const { showToast } = useApp();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  const filteredLogs = AUDIT_EVENTS.filter((log) => {
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto pb-24 md:pb-12 bg-background text-foreground">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
        <button
          type="button"
          onClick={() => onNavigate?.('/admin/dashboard')}
          className="hover:underline cursor-pointer"
        >
          Dashboard
        </button>
        <ChevronRight size={13} className="text-muted-foreground/60" />
        <span className="text-blue-600 dark:text-blue-400 font-bold">
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
          onClick={() => showToast('Audit Log exported to CSV!')}
          className="px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-muted text-foreground text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <Download size={16} />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* 3. 4 KPI Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Audit Events */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-border/80 transition-all flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileCheck size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Total Audit Events</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight">
              6
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5">
              Immutable event ledger
            </p>
          </div>
        </div>

        {/* Card 2: Trader Authorizations */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-border/80 transition-all flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Trader Authorizations</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight">
              3
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5">
              Full authority actions
            </p>
          </div>
        </div>

        {/* Card 3: Field Rep Entries */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-border/80 transition-all flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <User size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Field Rep Entries</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight">
              2
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5">
              Collections &amp; orders
            </p>
          </div>
        </div>

        {/* Card 4: Automated Triggers */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-border/80 transition-all flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Automated Triggers</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight">
              1
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5">
              Overdue &amp; stage alerts
            </p>
          </div>
        </div>
      </div>

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
                  <div className="flex items-center gap-1.5 cursor-pointer select-none">
                    <span>Timestamp</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity &amp; Reference</th>
                <th className="py-3.5 px-4">State Modification</th>
                <th className="py-3.5 px-4 md:px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log) => {
                const IconComp = log.entityIcon;

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-muted/40 transition-colors"
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
                    <td className="py-3.5 px-4 md:px-6 text-right">
                      <button
                        type="button"
                        onClick={() => showToast(`Audit details for ${log.id}`)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
