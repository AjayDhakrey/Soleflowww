import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../lib/icons';
import {
  PageHeader,
  KpiCard,
  Panel,
  Button,
  StatusBadge,
  Tag,
  EmptyState,
} from '../../components/ui';

export const VisitsPage: React.FC = () => {
  const { fieldVisits, customers, showToast } = useApp();
  const [selectedCust, setSelectedCust] = useState(customers[0]?.businessName || '');
  const [purpose, setPurpose] = useState('');

  const handleAddVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust) return;
    showToast(`Store check-in recorded for ${selectedCust}!`);
    setPurpose('');
  };

  const completedVisits = fieldVisits.filter((v) => v.status === 'completed').length;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-12">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/sales/dashboard' }, { label: 'Store Visits' }]}
        title="My Retail Store Visits & Routes"
        subtitle="Log physical buyer showroom check-ins, record order negotiations, and sample showings."
      />

      {/* 2. KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KpiCard
          label="Total Route Stops"
          value={`${fieldVisits.length} Stores`}
          icon={Icons.Visits}
          bubbleColor="zinc"
          caption="Daily assigned route"
        />
        <KpiCard
          label="Completed Visits"
          value={`${completedVisits} Done`}
          icon={Icons.Approved}
          bubbleColor="green"
          caption="Physical store visits"
        />
        <KpiCard
          label="Pending Stops"
          value={`${fieldVisits.length - completedVisits} Pending`}
          icon={Icons.Pending}
          bubbleColor="amber"
          caption="Hing Ki Mandi market"
        />
        <KpiCard
          label="Orders Booked on Route"
          value="₹3.80L"
          icon={Icons.Orders}
          bubbleColor="violet"
          caption="Same-day orders captured"
        />
      </div>

      {/* 3. Quick Check-in Panel */}
      <Panel
        title="Quick Log New Field Visit"
        subtitle="Check-in at retail store location to log notes or sample feedback"
      >
        <form onSubmit={handleAddVisit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            value={selectedCust}
            onChange={(e) => setSelectedCust(e.target.value)}
            className="h-12 px-4 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/15 focus:border-zinc-900"
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
            placeholder="Visit purpose (e.g. Sample showing, cheque collection)..."
            className="h-12 px-4 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/15 focus:border-zinc-900"
          />
          <Button
            type="submit"
            variant="primary"
            icon={Icons.Visits}
          >
            Check-in at Store
          </Button>
        </form>
      </Panel>

      {/* 4. Visits Timeline List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Today's Field Route History
        </h3>

        {fieldVisits.length === 0 ? (
          <Panel>
            <EmptyState
              icon={Icons.Visits}
              title="No Visits Logged Yet"
              description="You have not logged any store visits today. Use the check-in form above to start your route."
            />
          </Panel>
        ) : (
          <div className="space-y-4">
            {fieldVisits.map((v) => (
              <Panel key={v.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        {v.customerName}
                      </h4>
                      <StatusBadge status={v.status === 'completed' ? 'active' : 'pending'}>
                        {v.status === 'completed' ? 'Completed' : 'Scheduled Today'}
                      </StatusBadge>
                      {v.outcome && <Tag variant="purple">{v.outcome}</Tag>}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Icons.Visits size={14} className="text-slate-400" />
                      <span>{v.location} • Time: <strong>{v.time}</strong></span>
                    </p>

                    <p className="text-sm text-slate-700 dark:text-slate-300 pt-1 font-medium">
                      {v.purpose}
                    </p>

                    {v.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        Feedback: {v.notes}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Icons.Approved}
                    onClick={() => showToast(`Visit details saved for ${v.customerName}`)}
                  >
                    View Record
                  </Button>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
