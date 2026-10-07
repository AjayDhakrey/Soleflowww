import React, { useState, useMemo } from 'react';
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
import { VisitsKpiCards } from '../../components/sales/VisitsKpiCards';

export const VisitsPage: React.FC = () => {
  const { fieldVisits, customers, orders, currentUser, addFieldVisit, completeFieldVisit, showToast } = useApp();
  const [selectedCustId, setSelectedCustId] = useState(customers[0]?.id || '');
  const [purpose, setPurpose] = useState('');
  const [outcome, setOutcome] = useState<'Interested' | 'Order Created' | 'Follow-up Needed' | 'Payment Collected'>('Interested');
  const [notes, setNotes] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<typeof fieldVisits[0] | null>(null);

  const completedVisits = useMemo(() => fieldVisits.filter((v) => v.status === 'completed').length, [fieldVisits]);

  // Compute real orders booked today by this salesman
  const ordersBookedAmount = useMemo(() => {
    return orders
      .filter((o) => o.salespersonId === currentUser.id || o.salespersonName?.toLowerCase().includes(currentUser.name.toLowerCase()))
      .reduce((sum, o) => sum + Number(o.netPayable || 0), 0);
  }, [orders, currentUser]);

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustId) || customers[0];
    if (!cust) return;

    if (!purpose.trim()) {
      showToast('Please specify the visit purpose.');
      return;
    }

    const saved = await addFieldVisit({
      customerId: cust.id,
      customerName: cust.businessName,
      location: `${cust.city}, ${cust.state}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      purpose: purpose.trim(),
      outcome,
      notes: notes.trim(),
      status: 'completed',
    });

    if (!saved) return;
    setPurpose('');
    setNotes('');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-12 animate-in fade-in duration-150">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/sales/dashboard' }, { label: 'Store Visits' }]}
        title="My Retail Store Visits & Routes"
        subtitle="Log physical buyer showroom check-ins, record order negotiations, and sample showings."
      />

      {/* 2. KPI Summary Row (3D Claymorphic Redesign) */}
      <VisitsKpiCards
        totalStopsCount={fieldVisits.length}
        completedVisitsCount={completedVisits}
        pendingStopsCount={Math.max(0, fieldVisits.length - completedVisits)}
        ordersBookedAmount={ordersBookedAmount || '₹0'}
      />

      {/* 3. Quick Check-in Panel */}
      <Panel
        title="Quick Log New Field Visit"
        subtitle="Check-in at retail store location to log notes, sample feedback, and outcomes"
      >
        <form onSubmit={handleAddVisit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Store / Retailer</label>
              <select
                value={selectedCustId}
                onChange={(e) => setSelectedCustId(e.target.value)}
                className="w-full h-11 px-3 text-xs bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.businessName} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Visit Purpose</label>
              <input
                type="text"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Sample showing, cheque collection..."
                className="w-full h-11 px-3 text-xs bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Outcome</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as any)}
                className="w-full h-11 px-3 text-xs bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              >
                <option value="Interested">Interested / Looking for catalogue</option>
                <option value="Order Created">Order Created on spot</option>
                <option value="Payment Collected">Payment / Cheque Collected</option>
                <option value="Follow-up Needed">Follow-up Call Scheduled</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional remarks (e.g. proprietor requested 40 pairs sample batch)..."
              className="flex-1 w-full h-11 px-3 text-xs bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <Button
              type="submit"
              variant="primary"
              icon={Icons.Visits}
              className="w-full sm:w-auto shrink-0 justify-center"
            >
              Check-in &amp; Save Visit
            </Button>
          </div>
        </form>
      </Panel>

      {/* 4. Visits Timeline List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground">
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
          <div className="space-y-3">
            {fieldVisits.map((v) => (
              <Panel key={v.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-bold text-base text-foreground">
                        {v.customerName}
                      </h4>
                      <StatusBadge status={v.status === 'completed' ? 'active' : 'pending'}>
                        {v.status === 'completed' ? 'Completed' : 'Scheduled Today'}
                      </StatusBadge>
                      {v.outcome && <Tag variant="purple">{v.outcome}</Tag>}
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Icons.Visits size={14} className="text-muted-foreground" />
                      <span>{v.location} • Time: <strong>{v.time}</strong></span>
                    </p>

                    <p className="text-sm text-foreground pt-1 font-medium">
                      {v.purpose}
                    </p>

                    {v.notes && (
                      <p className="text-xs text-muted-foreground italic">
                        Feedback: {v.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {v.status !== 'completed' && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Icons.Check}
                        onClick={() => completeFieldVisit(v.id, 'Interested', 'Completed on route')}
                      >
                        Mark Done
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Icons.Eye}
                      onClick={() => setSelectedVisit(v)}
                    >
                      View Note
                    </Button>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>

      {/* Visit Detail Dialog */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">Field Visit Record</h3>
              <button
                type="button"
                onClick={() => setSelectedVisit(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Icons.Close size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Store Name:</span>
                <span className="font-bold text-foreground">{selectedVisit.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="text-foreground">{selectedVisit.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Checked-in:</span>
                <span className="font-mono text-foreground">{selectedVisit.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outcome:</span>
                <Tag variant="purple">{selectedVisit.outcome || 'Logged'}</Tag>
              </div>
              <div className="border-t border-border pt-2">
                <span className="text-muted-foreground block mb-1">Purpose &amp; Discussion:</span>
                <p className="p-2.5 rounded-lg bg-muted/60 text-foreground font-medium text-xs">
                  {selectedVisit.purpose}
                </p>
              </div>
              {selectedVisit.notes && (
                <div>
                  <span className="text-muted-foreground block mb-1">Field Feedback Notes:</span>
                  <p className="p-2.5 rounded-lg bg-muted/60 text-foreground text-xs italic">
                    {selectedVisit.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedVisit(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
