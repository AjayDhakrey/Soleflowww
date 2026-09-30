import React from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import {
  PageHeader,
  KpiCard,
  Panel,
  Button,
  StatusBadge,
} from '../../components/ui';

interface SalesDashboardProps {
  onNavigate: (path: string) => void;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    salesTeam,
    followUps,
    setIsCreateOrderModalOpen,
    setIsShareModalOpen,
    toggleSalesTask,
    completeFollowUp,
  } = useApp();

  const currentRep = salesTeam.find((r) => r.id === currentUser.id) || salesTeam[0];
  const targetPct = Math.round((currentRep.bookedThisMonth / currentRep.monthlyTarget) * 100);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-12">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/sales/dashboard' }, { label: 'Field Portal' }]}
        title={`Good morning, ${currentUser.name}`}
        subtitle="Today's store visits, order booking target, and pending collections."
        actions={
          <>
            <Button
              variant="secondary"
              icon={Icons.Visits}
              onClick={() => onNavigate('/sales/visits')}
            >
              Log Visit
            </Button>
            <Button
              variant="secondary"
              icon={Icons.Share}
              onClick={() => setIsShareModalOpen(true)}
            >
              Share Catalogue
            </Button>
            <Button
              variant="primary"
              icon={Icons.Add}
              onClick={() => setIsCreateOrderModalOpen(true)}
            >
              New Order
            </Button>
          </>
        }
      />

      {/* 2. Rep KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KpiCard
          label="Monthly Target"
          value={`₹${(currentRep.bookedThisMonth / 100000).toFixed(1)}L`}
          icon={Icons.TrendingUp}
          bubbleColor="zinc"
          caption={`${targetPct}% of ₹${(currentRep.monthlyTarget / 100000).toFixed(1)}L achieved`}
        />
        <KpiCard
          label="Commission Accrued"
          value={`₹${currentRep.commissionAccrued.toLocaleString('en-IN')}`}
          icon={Icons.Payments}
          bubbleColor="green"
          caption="Calculated on cleared invoices"
        />
        <KpiCard
          label="Today's Store Visits"
          value={`${currentRep.todayVisitsDone} / ${currentRep.todayVisitsTotal}`}
          icon={Icons.Visits}
          bubbleColor="amber"
          caption="Hing Ki Mandi & Sadar Bazaar"
          onClick={() => onNavigate('/sales/visits')}
        />
        <KpiCard
          label="Collection Due"
          value={`₹${(currentRep.collectionDue / 100000).toFixed(2)}L`}
          icon={Icons.Overdue}
          bubbleColor="red"
          caption="Pending retail receivables"
          onClick={() => onNavigate('/sales/collections')}
        />
      </div>

      {/* 3. Today's Field Route & Follow-ups Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Field Route Stops (7 cols) */}
        <div className="lg:col-span-7">
          <Panel
            title="Today's Route & Store Stops"
            subtitle="Check off visits as you arrive and book orders"
            headerAction={
              <Button
                variant="ghost"
                size="sm"
                icon={Icons.ChevronRight}
                iconPosition="right"
                onClick={() => onNavigate('/sales/visits')}
              >
                View Map Route
              </Button>
            }
          >
            <div className="space-y-3">
              {currentRep.tasksChecklist.map((task: any) => (
                <div
                  key={task.id}
                  onClick={() => toggleSalesTask(currentRep.id, task.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 hover:border-zinc-400 dark:hover:border-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                        task.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {task.completed && <Icons.Check size={14} strokeWidth={2.5} />}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          task.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.task}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {task.time} • Priority Route
                      </p>
                    </div>
                  </div>

                  <StatusBadge variant={task.completed ? 'success' : 'pending'}>
                    {task.completed ? 'Completed' : 'Pending'}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Right: Follow-ups & Reminders (5 cols) */}
        <div className="lg:col-span-5">
          <Panel
            title="Follow-ups & Client Requests"
            subtitle="Scheduled call-backs and sample reviews"
            headerAction={
              <Button
                variant="ghost"
                size="sm"
                icon={Icons.ChevronRight}
                iconPosition="right"
                onClick={() => onNavigate('/sales/follow-ups')}
              >
                All ({followUps.length})
              </Button>
            }
          >
            <div className="space-y-3">
              {followUps.slice(0, 4).map((f) => (
                <div
                  key={f.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {f.customerName}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {f.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {f.notes}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300">
                      {f.phone}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Icons.Check}
                      onClick={() => completeFollowUp(f.id)}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};
