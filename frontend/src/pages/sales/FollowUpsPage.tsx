import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FollowUpsKpiCards } from '../../components/sales/FollowUpsKpiCards';
import {
  CalendarCheck2,
  Hourglass,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Phone,
  Eye,
  ChevronRight,
  Store,
  Building2,
  Footprints,
  Info,
  Check,
  X,
} from 'lucide-react';
import { AnalogTimePicker } from '../../components/ui';

interface FollowUpsPageProps {
  onNavigate?: (path: string) => void;
}

export const FollowUpsPage: React.FC<FollowUpsPageProps> = ({ onNavigate }) => {
  const { followUps, customers, addFollowUp, completeFollowUp, showToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustId, setSelectedCustId] = useState(customers[0]?.id || '');
  const [reason, setReason] = useState('Payment follow-up for overdue ledger balance');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('11:00 AM');
  const [notes, setNotes] = useState('');
  const [selectedItem, setSelectedItem] = useState<typeof followUps[0] | null>(null);

  const completedCount = useMemo(() => followUps.filter((f) => f.status === 'completed').length, [followUps]);
  const pendingCount = useMemo(() => followUps.filter((f) => f.status !== 'completed').length, [followUps]);

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustId) || customers[0];
    if (!cust) return;

    const saved = await addFollowUp({
      customerId: cust.id,
      customerName: cust.businessName,
      customerCity: cust.city,
      phone: cust.phone,
      reason: reason.trim(),
      date,
      time,
      amountDue: cust.amountDue,
      notes: notes.trim(),
      status: 'today',
    });

    if (!saved) return;
    setIsModalOpen(false);
    setNotes('');
  };

  const renderIcon = (reasonText: string) => {
    const lower = (reasonText || '').toLowerCase();
    if (lower.includes('payment') || lower.includes('overdue')) {
      return <Store size={18} />;
    }
    if (lower.includes('catalog') || lower.includes('mfg') || lower.includes('factory')) {
      return <Building2 size={18} />;
    }
    return <Footprints size={18} />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto pb-24 md:pb-12 bg-background text-foreground animate-in fade-in duration-150">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-primary">
        <button
          type="button"
          onClick={() => onNavigate?.('/sales/dashboard')}
          className="hover:underline cursor-pointer"
        >
          Dashboard
        </button>
        <ChevronRight size={13} className="text-muted-foreground/60" />
        <span className="text-primary font-bold">
          Follow-ups
        </span>
      </div>

      {/* 2. Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Follow-ups &amp; Buyer Reminders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage scheduled retailer phone callbacks, sample reviews, and payment promises.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Follow-up</span>
        </button>
      </div>

      {/* 3. KPI Summary Cards (3D Claymorphic Redesign) */}
      <FollowUpsKpiCards
        totalScheduledCount={followUps.length}
        pendingCount={pendingCount}
        completedCount={completedCount}
        priorityCount={
          followUps.filter((f) => (f.amountDue || 0) > 100000 && f.status !== 'completed').length
        }
      />

      {/* 4. Follow-up Cards List */}
      <div className="space-y-4">
        {followUps.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center text-muted-foreground">
            <p className="text-sm">No follow-up reminders scheduled. Use the button above to add one.</p>
          </div>
        ) : (
          followUps.map((item) => (
            <div
              key={item.id}
              className="bg-surface border border-border rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  {renderIcon(item.reason)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-bold text-foreground text-base">
                      {item.customerName}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      ({item.customerCity})
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {item.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground font-mono">
                    Scheduled: {item.date} • {item.time}
                  </p>

                  <p className="text-sm font-medium text-foreground">
                    {item.reason}
                  </p>

                  {item.notes && (
                    <p className="text-xs text-muted-foreground italic">
                      Notes: {item.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {item.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => completeFollowUp(item.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Done</span>
                  </button>
                )}

                <a
                  href={`tel:${item.phone}`}
                  className="p-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl inline-flex items-center transition-colors"
                  title="Call Customer"
                >
                  <Phone size={15} />
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="p-2 border border-border bg-surface hover:bg-muted text-foreground rounded-xl inline-flex items-center transition-colors cursor-pointer"
                  title="View Detail"
                >
                  <Eye size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Follow-up Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">Schedule Buyer Follow-up</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateFollowUp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Customer</label>
                <select
                  value={selectedCustId}
                  onChange={(e) => setSelectedCustId(e.target.value)}
                  className="w-full h-11 px-3 text-xs bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.businessName} • {c.city} (Due: ₹{Number(c.amountDue || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Follow-up Reason / Topic</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-11 px-3 text-xs bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-11 px-3 text-xs font-mono bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <AnalogTimePicker
                    label="Target Time (Analog Clock)"
                    value={time}
                    onChange={setTime}
                    placeholder="Set meeting time"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Detailed Discussion Plan</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Target order sizes, cheque collection expectations..."
                  className="w-full p-3 text-xs bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold cursor-pointer"
                >
                  Save Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">Follow-up Details</h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Retailer:</span>
                <span className="font-bold text-foreground">{selectedItem.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">City &amp; Phone:</span>
                <span className="text-foreground">{selectedItem.customerCity} • {selectedItem.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timing:</span>
                <span className="font-mono text-foreground">{selectedItem.date} at {selectedItem.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold text-primary">{selectedItem.status}</span>
              </div>
              <div className="border-t border-border pt-2">
                <span className="text-muted-foreground block mb-1">Reason:</span>
                <p className="p-2.5 rounded-lg bg-muted/60 text-foreground font-medium text-xs">
                  {selectedItem.reason}
                </p>
              </div>
              {selectedItem.notes && (
                <div>
                  <span className="text-muted-foreground block mb-1">Action Notes:</span>
                  <p className="p-2.5 rounded-lg bg-muted/60 text-foreground text-xs italic">
                    {selectedItem.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
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
