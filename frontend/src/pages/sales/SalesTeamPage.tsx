import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  TrendingUp,
  Wallet,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  Clock,
  Briefcase,
  Package,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  Navigation,
  Sparkles,
  ExternalLink,
  FileText,
  Layers,
  Store,
  Check,
  Building2,
  Receipt,
  CircleDot,
  Send,
  X,
  UserPlus,
  Download,
  Printer,
  FileSpreadsheet,
  ChevronLeft,
} from 'lucide-react';
import { Icons } from '../../lib/icons';
import {
  PageHeader,
  KpiCard,
  Panel,
  Avatar,
  StatusBadge,
  Button,
  AnalogTimePicker,
} from '../../components/ui';
import { SalesTeamKpiCards } from '../../components/sales/SalesTeamKpiCards';
import { CreateSalesRepresentativeModal } from '../../components/team/CreateSalesRepresentativeModal';
import { Salesperson, SalespersonTask } from '../../types';

interface SalesTeamPageProps {
  onNavigate: (path: string) => void;
}

export const SalesTeamPage: React.FC<SalesTeamPageProps> = ({ onNavigate }) => {
  const { salesTeam, toggleSalesTask, addSalesTask, showToast } = useApp();
  const [selectedRepId, setSelectedRepId] = useState<string>(salesTeam[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Market' | 'Office/HQ'>('All');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [mobileTab, setMobileTab] = useState<'directory' | 'inspector'>('directory');
  
  // Quick Add Stop Modal State
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [newStopTitle, setNewStopTitle] = useState('');
  const [newStopDesc, setNewStopDesc] = useState('');
  const [newStopTime, setNewStopTime] = useState('16:30');
  const [newStopType, setNewStopType] = useState<'visit' | 'cheque' | 'followup' | 'meeting'>('visit');

  // Add Sales Representative Modal State
  const [isCreateRepModalOpen, setIsCreateRepModalOpen] = useState(false);

  // Export Routes Modal State
  const [isExportRoutesModalOpen, setIsExportRoutesModalOpen] = useState(false);

  const activeRep = useMemo(() => {
    return salesTeam.find((r) => r.id === selectedRepId) || salesTeam[0] || {} as Salesperson;
  }, [salesTeam, selectedRepId]);

  const filteredReps = useMemo(() => {
    return salesTeam.filter((rep) => {
      const matchesSearch =
        rep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.cluster.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || rep.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [salesTeam, searchQuery, statusFilter]);

  const totalBooked = salesTeam.reduce((s, r) => s + (r.bookedThisMonth || 0), 0);
  const totalTarget = salesTeam.reduce((s, r) => s + (r.monthlyTarget || 0), 0);
  const totalCommissions = salesTeam.reduce((s, r) => s + (r.commissionAccrued || 0), 0);
  const activeInMarketCount = salesTeam.filter((r) => r.status === 'In Market').length;

  const totalVisitsDone = salesTeam.reduce((s, r) => s + (r.todayVisitsDone || 0), 0);
  const totalVisitsGoal = salesTeam.reduce((s, r) => s + (r.todayVisitsTotal || 0), 0);
  const visitsCompletionPct = totalVisitsGoal > 0 ? Math.round((totalVisitsDone / totalVisitsGoal) * 100) : 0;

  const filteredTasks = useMemo(() => {
    if (!activeRep?.tasksChecklist) return [];
    if (taskFilter === 'completed') return activeRep.tasksChecklist.filter((t) => t.completed);
    if (taskFilter === 'pending') return activeRep.tasksChecklist.filter((t) => !t.completed);
    return activeRep.tasksChecklist;
  }, [activeRep, taskFilter]);

  const handleCreateStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopTitle.trim()) return;

    const newTask: SalespersonTask = {
      id: `task-${Date.now()}`,
      time: new Date(`2000-01-01T${newStopTime}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      title: newStopTitle,
      description: newStopDesc || 'Dispatched via Admin Field Console',
      verifiedGps: false,
      completed: false,
      badge: 'Scheduled Dispatched Stop',
      badgeColor: 'blue',
      type: newStopType,
    };

    if (!await addSalesTask(activeRep.id, newTask)) return;
    showToast(`New stop "${newStopTitle}" dispatched to ${activeRep.name}'s route.`);
    setNewStopTitle('');
    setNewStopDesc('');
    setIsAddStopOpen(false);
  };

  const handleExportRoutesCSV = (onlyActiveRep = false) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const targets = onlyActiveRep && activeRep?.id ? [activeRep] : salesTeam;

    const headers = [
      'Representative Name',
      'Employee ID',
      'Territory / Zone',
      'Cluster',
      'Contact Phone',
      'Assigned Kit',
      'Market Status',
      'Stop Time',
      'Stop Type',
      'Store / Task Title',
      'Stop Description',
      'Completed Status',
      'GPS Verified',
    ];

    const rows: string[][] = [];

    targets.forEach((rep) => {
      const tasks = rep.tasksChecklist || [];
      if (tasks.length === 0) {
        rows.push([
          `"${rep.name}"`,
          `"${rep.empId || ''}"`,
          `"${rep.zone || ''}"`,
          `"${rep.cluster || ''}"`,
          `"${rep.phone || ''}"`,
          `"${rep.assignedKit || ''}"`,
          `"${rep.status || ''}"`,
          `"-"`,
          `"-"`,
          `"No scheduled field stops"`,
          `"-"`,
          `"Pending"`,
          `"No"`,
        ]);
      } else {
        tasks.forEach((t) => {
          rows.push([
            `"${rep.name}"`,
            `"${rep.empId || ''}"`,
            `"${rep.zone || ''}"`,
            `"${rep.cluster || ''}"`,
            `"${rep.phone || ''}"`,
            `"${rep.assignedKit || ''}"`,
            `"${rep.status || ''}"`,
            `"${t.time || ''}"`,
            `"${t.type || 'visit'}"`,
            `"${(t.title || '').replace(/"/g, '""')}"`,
            `"${(t.description || '').replace(/"/g, '""')}"`,
            `"${t.completed ? 'Completed' : 'Pending'}"`,
            `"${t.verifiedGps ? 'Yes' : 'No'}"`,
          ]);
        });
      }
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filename = onlyActiveRep
      ? `soleflow_route_${(activeRep.name || 'rep').toLowerCase().replace(/\s+/g, '_')}_${todayStr}.csv`
      : `soleflow_daily_field_routes_${todayStr}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(
      `Exported ${rows.length} route stops for ${onlyActiveRep ? activeRep.name : `${targets.length} representatives`}!`
    );
    setIsExportRoutesModalOpen(false);
  };

  const handlePrintManifest = (onlyActiveRep = false) => {
    const todayStr = new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const targets = onlyActiveRep && activeRep?.id ? [activeRep] : salesTeam;

    const printWin = window.open('', '_blank');
    if (!printWin) {
      showToast('Popup blocked. Please allow popups to view printable manifest.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SoleFlow Field Route Manifest - ${todayStr}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0f172a; }
          h1 { margin: 0 0 4px; font-size: 20px; color: #0f172a; }
          .header-meta { font-size: 12px; color: #64748b; margin-bottom: 20px; display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
          .rep-section { margin-bottom: 24px; page-break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
          .rep-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; }
          .rep-title { font-weight: bold; font-size: 15px; }
          .rep-meta { font-size: 12px; color: #475569; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
          th { text-align: left; background: #f8fafc; padding: 8px; border-bottom: 1px solid #cbd5e1; font-weight: 600; color: #334155; }
          td { padding: 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
          .badge-completed { background: #dcfce7; color: #166534; }
          .badge-pending { background: #fef3c7; color: #92400e; }
          .sign-block { margin-top: 36px; display: flex; justify-content: space-between; font-size: 12px; color: #475569; border-top: 1px solid #cbd5e1; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header-meta">
          <div>
            <h1>SoleFlow Field Sales Route Manifest</h1>
            <div>Date: <strong>${todayStr}</strong> &bull; Total Reps: <strong>${targets.length}</strong></div>
          </div>
          <div style="text-align: right;">
            <div><strong>Dispatch Operations Console</strong></div>
            <div>Generated: ${new Date().toLocaleTimeString('en-IN')}</div>
          </div>
        </div>

        ${targets
          .map((rep) => {
            const tasks = rep.tasksChecklist || [];
            return `
            <div class="rep-section">
              <div class="rep-head">
                <div>
                  <span class="rep-title">${rep.name}</span> (${rep.empId || 'No Emp ID'})
                  <div class="rep-meta">${rep.zone || ''} &bull; ${rep.cluster || ''} &bull; Tel: ${rep.phone || 'N/A'}</div>
                </div>
                <div style="text-align: right; font-size: 12px;">
                  Status: <strong>${rep.status || 'In Market'}</strong> &bull; Target: ₹${((rep.monthlyTarget || 0) / 100000).toFixed(1)}L
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 75px;">Time</th>
                    <th style="width: 105px;">Type</th>
                    <th>Stop Title / Client</th>
                    <th>Instructions / Details</th>
                    <th style="width: 90px;">Status</th>
                    <th style="width: 80px;">Sign / Done</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    tasks.length === 0
                      ? `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 16px;">No route stops dispatched for today.</td></tr>`
                      : tasks
                          .map(
                            (t) => `
                        <tr>
                          <td><strong>${t.time || '-'}</strong></td>
                          <td><span class="badge" style="background:#e0f2fe; color:#0369a1;">${t.type || 'Visit'}</span></td>
                          <td><strong>${t.title || '-'}</strong></td>
                          <td style="color: #475569;">${t.description || '-'}</td>
                          <td>
                            <span class="badge ${t.completed ? 'badge-completed' : 'badge-pending'}">
                              ${t.completed ? 'Completed' : 'Pending'}
                            </span>
                          </td>
                          <td style="border: 1px dashed #cbd5e1; text-align: center;">[ &nbsp; ]</td>
                        </tr>
                      `
                          )
                          .join('')
                  }
                </tbody>
              </table>
            </div>
          `;
          })
          .join('')}

        <div class="sign-block">
          <div>Field Supervisor Signature: __________________________</div>
          <div>Territory Manager Approval: __________________________</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
    setIsExportRoutesModalOpen(false);
  };

  const getTaskTypeBadge = (type: string) => {
    switch (type) {
      case 'visit':
        return { label: 'Store Visit', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800' };
      case 'cheque':
        return { label: 'Payment / Cheque', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' };
      case 'followup':
        return { label: 'Follow Up', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800' };
      case 'meeting':
        return { label: 'Trade Meeting', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800' };
      default:
        return { label: 'Route Stop', color: 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
    }
  };

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto pb-28 sm:pb-32 md:pb-12 animate-in fade-in duration-150">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Sales Team & Field Force' }]}
        title="Sales Force & Field Dispatch"
        subtitle="Track field sales reps, target quotas, live market routes, and daily store visits."
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold shadow-xs whitespace-nowrap shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                {activeInMarketCount} Reps Active In Market
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                size="sm"
                icon={FileText}
                onClick={() => setIsExportRoutesModalOpen(true)}
                className="flex-1 sm:flex-none justify-center shadow-2xs font-semibold"
              >
                Export Routes
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={UserPlus}
                onClick={() => setIsCreateRepModalOpen(true)}
                className="flex-1 sm:flex-none justify-center shadow-xs font-semibold"
              >
                + Add Representative
              </Button>
            </div>
          </div>
        }
      />

      {/* 2. KPI Summary Cards (3D Claymorphic Redesign) */}
      <SalesTeamKpiCards
        totalReps={salesTeam.length}
        totalBooked={totalBooked}
        targetAmount={totalTarget}
        commissionAccrued={totalCommissions}
        commissionCaption="Calculated on cleared invoices"
        visitsDone={totalVisitsDone}
        visitsGoal={totalVisitsGoal}
        visitsCompletionPct={visitsCompletionPct}
      />

      {/* 3. Mobile View Segmented Switcher (Stitch Pattern) */}
      <div className="lg:hidden flex p-1 bg-muted/80 dark:bg-muted/40 rounded-2xl border border-border/80 shadow-2xs gap-1">
        <button
          type="button"
          onClick={() => setMobileTab('directory')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none ${
            mobileTab === 'directory'
              ? 'bg-surface text-foreground shadow-xs border border-border/50'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-500" />
          <span>Team Directory ({filteredReps.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('inspector')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none ${
            mobileTab === 'inspector'
              ? 'bg-surface text-foreground shadow-xs border border-border/50'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-500" />
          <span className="truncate">Route &amp; Stops ({activeRep.name ? activeRep.name.split(' ')[0] : 'Rep'})</span>
        </button>
      </div>

      {/* 4. Main Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Representatives Directory (5 Cols) */}
        <div className={`${mobileTab === 'inspector' ? 'hidden lg:block' : 'block'} lg:col-span-5 space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground tracking-tight">
                  Territory Representatives ({filteredReps.length})
                </h3>
                <p className="text-[11px] text-muted-foreground">Manage and track field force routes</p>
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline-flex items-center gap-1">
              Click to inspect <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rep name, zone, emp ID..."
                className="w-full h-9 pl-9 pr-8 text-xs rounded-xl bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex bg-muted/60 p-1 rounded-xl border border-border text-xs shrink-0 gap-0.5 justify-center sm:justify-start">
              {(
                [
                  { label: 'All', value: 'All' },
                  { label: 'Market', value: 'In Market' },
                  { label: 'HQ', value: 'Office/HQ' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={`flex-1 sm:flex-none px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                    statusFilter === tab.value
                      ? 'bg-surface text-foreground shadow-2xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Representatives List Cards */}
          <div className="space-y-3">
            {filteredReps.length === 0 ? (
              <div className="p-8 text-center bg-surface rounded-2xl border border-border">
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-foreground">No representatives found</p>
                <p className="text-xs text-muted-foreground mt-0.5">Try changing your search query or filter.</p>
              </div>
            ) : (
              filteredReps.map((rep) => {
                const isSelected = activeRep.id === rep.id;
                const targetAchieved = Math.round((rep.bookedThisMonth / (rep.monthlyTarget || 1)) * 100);
                const isInMarket = rep.status === 'In Market';

                return (
                  <div
                    key={rep.id}
                    onClick={() => {
                      setSelectedRepId(rep.id);
                      setMobileTab('inspector');
                    }}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group text-left ${
                      isSelected
                        ? 'bg-surface border-primary/50 shadow-sm ring-1 ring-primary/25'
                        : 'bg-surface/80 border-border/80 hover:border-border hover:bg-muted/30'
                    }`}
                  >
                    {/* Active accent left bar */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-r-full" />
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar name={rep.name} src={rep.photo} size="lg" />
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-surface ${
                              isInMarket ? 'bg-emerald-500 ring-emerald-500/20' : 'bg-slate-400'
                            }`}
                            title={rep.status}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                              {rep.name}
                            </h4>
                            <span className="font-mono text-[10px] font-semibold text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded border border-border">
                              {rep.empId}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground/70" />
                            {rep.zone} Territory • {rep.cluster}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                          isInMarket
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {isInMarket ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>In Market</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3 h-3" />
                            <span>Office/HQ</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Quota Progress */}
                    <div className="mt-3.5 pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground font-medium">Monthly Quota</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground font-mono">
                            ₹{(rep.bookedThisMonth / 100000).toFixed(1)}L
                          </span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-muted-foreground font-mono">
                            ₹{(rep.monthlyTarget / 100000).toFixed(1)}L
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                              targetAchieved >= 90
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            }`}
                          >
                            {targetAchieved}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden p-0.5 border border-border/50">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            targetAchieved >= 90
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-500'
                          }`}
                          style={{ width: `${Math.min(100, targetAchieved)}%` }}
                        />
                      </div>

                      {/* Rep mini sub-metrics */}
                      <div className="flex items-center justify-between mt-2.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 text-foreground font-medium text-[11px] border border-border/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {rep.todayVisitsDone}/{rep.todayVisitsTotal} Stops Done
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-mono font-bold text-[11px] border border-rose-200 dark:border-rose-900/60">
                          <Receipt className="w-3 h-3" />
                          ₹{(rep.collectionDue / 100000).toFixed(1)}L Due
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Rep Inspector & Live Route Dispatch (7 Cols) */}
        <div className={`${mobileTab === 'directory' ? 'hidden lg:block' : 'block'} lg:col-span-7 space-y-4 sm:space-y-6`}>
          {/* Mobile Back Button */}
          <button
            type="button"
            onClick={() => setMobileTab('directory')}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer w-fit transition-colors mb-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>← Back to Directory ({filteredReps.length})</span>
          </button>

          <Panel
            title={
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar name={activeRep.name} src={activeRep.photo} size="lg" />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-surface ${
                      activeRep.status === 'In Market' ? 'bg-emerald-500 ring-emerald-500/20' : 'bg-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                      {activeRep.name}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded border border-border">
                      {activeRep.empId}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    {activeRep.zone} Territory • {activeRep.cluster}
                  </p>
                </div>
              </div>
            }
            subtitle={
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                <a
                  href={`tel:${activeRep.phone}`}
                  className="flex items-center gap-1 font-mono hover:text-foreground text-muted-foreground transition-colors"
                >
                  <Phone className="w-3 h-3 text-blue-500" />
                  {activeRep.phone}
                </a>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-emerald-500" />
                  Commission Accrued: <strong className="text-foreground font-mono">₹{Number(activeRep.commissionAccrued || 0).toLocaleString('en-IN')}</strong> ({activeRep.commissionRate || 0}%)
                </span>
              </div>
            }
            headerAction={
              <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Phone}
                  onClick={() => {
                    window.location.href = `tel:${activeRep.phone}`;
                  }}
                  className="text-xs rounded-xl h-8 px-2.5"
                >
                  Call
                </Button>
                {activeRep.phone && (
                  <a
                    href={`https://wa.me/${(activeRep.phone || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="Message Rep on WhatsApp"
                  >
                    <Icons.WhatsApp className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">WhatsApp</span>
                  </a>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => setIsAddStopOpen(true)}
                  className="text-xs rounded-xl shadow-xs h-8 px-2.5"
                >
                  Add Stop
                </Button>
              </div>
            }
          >
            <div className="space-y-6">
              {/* Sample Kit & Zone Info Banner */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground text-sm block">
                      Assigned Kit: {activeRep.assignedKit || 'Kit not assigned'}
                    </span>
                    <span className="text-muted-foreground text-xs mt-0.5 block">
                      Kit physical inspection verified on {activeRep.kitVerifiedDate || '—'}
                    </span>
                  </div>
                </div>
                {activeRep.assignedKit && activeRep.kitVerifiedDate && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Kit Verified</span>
                  </div>
                )}
              </div>

              {/* 4 Performance Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                {/* 1. Today Visits */}
                <div className="p-3.5 bg-surface rounded-2xl border border-border flex flex-col justify-between shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between gap-1 text-muted-foreground">
                    <span className="text-[11px] uppercase font-semibold tracking-tight block truncate">
                      Today Visits
                    </span>
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-foreground font-display tracking-tight tabular-nums block">
                      {activeRep.todayVisitsDone || 0} / {activeRep.todayVisitsTotal || 0}
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
                      {Math.round(((activeRep.todayVisitsDone || 0) / (activeRep.todayVisitsTotal || 1)) * 100)}% Route Done
                    </span>
                  </div>
                </div>

                {/* 2. Booked (MTD) */}
                <div className="p-3.5 bg-surface rounded-2xl border border-border flex flex-col justify-between shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between gap-1 text-muted-foreground">
                    <span className="text-[11px] uppercase font-semibold tracking-tight block truncate">
                      Booked (MTD)
                    </span>
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-primary font-display tracking-tight tabular-nums block">
                      ₹{((activeRep.bookedThisMonth || 0) / 100000).toFixed(1)}L
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium mt-0.5 block">
                      Target: ₹{((activeRep.monthlyTarget || 0) / 100000).toFixed(1)}L
                    </span>
                  </div>
                </div>

                {/* 3. Collection Due */}
                <div className="p-3.5 bg-surface rounded-2xl border border-border flex flex-col justify-between shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between gap-1 text-muted-foreground">
                    <span className="text-[11px] uppercase font-semibold tracking-tight block truncate">
                      Collection Due
                    </span>
                    <Receipt className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-rose-600 dark:text-rose-400 font-display tracking-tight tabular-nums block">
                      ₹{((activeRep.collectionDue || 0) / 100000).toFixed(1)}L
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium mt-0.5 block">
                      Ledger balance
                    </span>
                  </div>
                </div>

                {/* 4. Accounts */}
                <div className="p-3.5 bg-surface rounded-2xl border border-border flex flex-col justify-between shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between gap-1 text-muted-foreground">
                    <span className="text-[11px] uppercase font-semibold tracking-tight block truncate">
                      Accounts
                    </span>
                    <Store className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-foreground font-display tracking-tight tabular-nums block">
                      {activeRep.assignedAccountsCount || 0} Stores
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium mt-0.5 block truncate">
                      Active wholesale clients
                    </span>
                  </div>
                </div>
              </div>

              {/* Today's Route Stops Checklist & Live Feed */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-foreground tracking-tight">
                      Today's Field Stops &amp; Action Items
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Interactive route manifest • Check off visited stores and payments
                    </p>
                  </div>

                  {/* Task status filter tabs */}
                  <div className="inline-flex items-center shrink-0 bg-muted/60 p-1 rounded-xl border border-border text-xs gap-1 self-start sm:self-auto">
                    <button
                      onClick={() => setTaskFilter('all')}
                      className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        taskFilter === 'all'
                          ? 'bg-surface text-foreground font-bold shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      All ({activeRep.tasksChecklist?.length || 0})
                    </button>
                    <button
                      onClick={() => setTaskFilter('pending')}
                      className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        taskFilter === 'pending'
                          ? 'bg-surface text-foreground font-bold shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setTaskFilter('completed')}
                      className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        taskFilter === 'completed'
                          ? 'bg-surface text-foreground font-bold shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Completed
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredTasks.length === 0 ? (
                    <div className="p-10 text-center bg-muted/15 rounded-2xl border border-dashed border-border text-xs text-muted-foreground flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 border border-blue-500/20">
                        <Navigation className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-foreground">No route stops match this filter</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                        You can dispatch new store visits or payment collections directly to {activeRep.name}'s daily route.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Plus}
                        onClick={() => setIsAddStopOpen(true)}
                        className="mt-4 rounded-xl"
                      >
                        Add Route Stop
                      </Button>
                    </div>
                  ) : (
                    filteredTasks.map((task: SalespersonTask) => {
                      const typeConfig = getTaskTypeBadge(task.type);

                      return (
                        <div
                          key={task.id}
                          onClick={() => toggleSalesTask(activeRep.id, task.id)}
                          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start justify-between gap-3.5 group ${
                            task.completed
                              ? 'bg-muted/30 border-border/80 opacity-75'
                              : 'bg-surface border-border hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            {/* Checkbox */}
                            <div
                              className={`w-5 h-5 rounded-lg flex items-center justify-center border mt-0.5 shrink-0 transition-colors ${
                                task.completed
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                  : 'border-slate-300 dark:border-slate-600 group-hover:border-primary bg-surface'
                              }`}
                            >
                              {task.completed && <Check size={14} strokeWidth={2.5} />}
                            </div>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-md border font-semibold ${typeConfig.color}`}
                                >
                                  {typeConfig.label}
                                </span>

                                {task.verifiedGps && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                                    <MapPin className="w-3 h-3" />
                                    GPS Verified
                                  </span>
                                )}

                                <span
                                  className={`text-sm font-bold transition-colors ${
                                    task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                                  }`}
                                >
                                  {task.title}
                                </span>
                              </div>

                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {task.description}
                              </p>

                              {task.badge && (
                                <div className="pt-1">
                                  <span
                                    className={`inline-block text-[11px] font-mono font-medium px-2 py-0.5 rounded-md ${
                                      task.badgeColor === 'green'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                                        : task.badgeColor === 'blue'
                                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                                        : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                                    }`}
                                  >
                                    {task.badge}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.time}
                            </span>
                            <span className="text-[10px] text-primary hover:underline font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Toggle Done
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Quick Add Stop Modal (Bottom-sheet on mobile) */}
      {isAddStopOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 dark:bg-black/80 backdrop-blur-xs select-none animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-surface rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-border overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Mobile Sheet Grab Handle */}
            <div className="pt-2.5 pb-0.5 sm:hidden flex justify-center bg-muted/30 shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            <div className="px-5 sm:px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Dispatch Route Stop</h3>
                  <p className="text-xs text-muted-foreground">Assigning to {activeRep.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStopOpen(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStop} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Store / Account Name &amp; Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={newStopTitle}
                  onChange={(e) => setNewStopTitle(e.target.value)}
                  placeholder="e.g. Visit Walkwell Footwear, MG Road"
                  className="w-full h-9 px-3 text-xs rounded-xl bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <AnalogTimePicker
                    label="Scheduled Time"
                    value={newStopTime}
                    onChange={setNewStopTime}
                    placeholder="Set time"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Stop Category
                  </label>
                  <select
                    value={newStopType}
                    onChange={(e: any) => setNewStopType(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="visit">Store Visit</option>
                    <option value="cheque">Payment / Cheque</option>
                    <option value="followup">Follow Up</option>
                    <option value="meeting">Trade Meeting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Action Item Notes &amp; Objectives
                </label>
                <textarea
                  rows={3}
                  value={newStopDesc}
                  onChange={(e) => setNewStopDesc(e.target.value)}
                  placeholder="e.g. Show SS25 Derby catalog, collect overdue invoice #4421."
                  className="w-full p-3 text-xs rounded-xl bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddStopOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={Send}
                  className="rounded-xl shadow-xs"
                >
                  Dispatch to Route
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Daily Route Manifest Modal (Bottom-sheet on mobile) */}
      {isExportRoutesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-surface border-t sm:border border-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-150">
            {/* Mobile Sheet Grab Handle */}
            <div className="pb-1 sm:hidden flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <FileSpreadsheet size={19} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-foreground">
                    Export Field Route Manifest
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Download spreadsheets or print daily route manifests for field dispatch operations.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportRoutesModalOpen(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground text-sm font-bold cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-muted/40 rounded-2xl border border-border/60 text-center">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Field Reps</span>
                <p className="text-sm font-extrabold text-foreground">{salesTeam.length}</p>
              </div>
              <div className="border-x border-border/60">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Stops</span>
                <p className="text-sm font-extrabold text-primary">{totalVisitsGoal}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Completed</span>
                <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{totalVisitsDone}</p>
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-3">
              {/* Option 1: All Reps CSV */}
              <div className="p-3.5 rounded-2xl border border-border bg-surface hover:border-primary/40 transition-all flex items-center justify-between gap-3 group">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Download size={14} className="text-primary" />
                    <h4 className="text-xs font-bold text-foreground">All Representatives (CSV)</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Complete manifest covering all {salesTeam.length} representatives and {totalVisitsGoal} route stops today.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleExportRoutesCSV(false)}
                  className="shrink-0 text-xs shadow-xs"
                >
                  Download CSV
                </Button>
              </div>

              {/* Option 2: Active Rep CSV */}
              {activeRep?.name && (
                <div className="p-3.5 rounded-2xl border border-border bg-surface hover:border-primary/40 transition-all flex items-center justify-between gap-3 group">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Download size={14} className="text-blue-500" />
                      <h4 className="text-xs font-bold text-foreground">
                        {activeRep.name}'s Route Only (CSV)
                      </h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Targeted manifest for {activeRep.zone} ({activeRep.tasksChecklist?.length || 0} stops).
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExportRoutesCSV(true)}
                    className="shrink-0 text-xs"
                  >
                    Download Rep
                  </Button>
                </div>
              )}

              {/* Option 3: Printable PDF / Hard Copy Manifest */}
              <div className="p-3.5 rounded-2xl border border-border bg-surface hover:border-primary/40 transition-all flex items-center justify-between gap-3 group">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Printer size={14} className="text-emerald-500" />
                    <h4 className="text-xs font-bold text-foreground">Printable Manifest (PDF / Paper)</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Formatted dispatch sheets with checkbox verifications and supervisor signoff blocks.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePrintManifest(false)}
                  className="shrink-0 text-xs"
                >
                  Print / Save PDF
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-2 border-t border-border">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsExportRoutesModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Sales Representative & Set Credentials Modal */}
      <CreateSalesRepresentativeModal
        isOpen={isCreateRepModalOpen}
        onClose={() => setIsCreateRepModalOpen(false)}
        defaultRole="salesperson"
      />
    </div>
  );
};
