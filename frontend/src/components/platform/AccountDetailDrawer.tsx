import React from 'react';
import {
  X,
  Building2,
  Phone,
  Mail,
  Calendar,
  Eye,
  CheckCircle2,
  Circle,
  TrendingUp,
  CreditCard,
  Package,
  Users,
  Copy,
  Check,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { PlatformAccount, usePlatformAccountTimeline } from '../../hooks/usePlatformAccounts';
import { useViewMode } from '../../context/ViewModeContext';

interface AccountDetailDrawerProps {
  account: PlatformAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDashboard: () => void;
}

export const AccountDetailDrawer: React.FC<AccountDetailDrawerProps> = ({
  account,
  isOpen,
  onClose,
  onNavigateToDashboard,
}) => {
  const { enterViewMode } = useViewMode();
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const { data: timeline = [], isLoading: isLoadingTimeline } = usePlatformAccountTimeline(
    isOpen && account ? account.org_id : null
  );

  if (!isOpen || !account) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleOpenViewMode = async () => {
    await enterViewMode(account.org_id, account.name);
    onClose();
    onNavigateToDashboard();
  };

  const setupSteps = [
    { label: 'Company Profile Details', done: Boolean(account.name && (account.owner_phone || account.owner_email)) },
    { label: 'Footwear Designs in Catalogue (≥1)', done: account.designs_count >= 1 },
    { label: 'Registered Wholesale Buyers (≥1)', done: account.customers_count >= 1 },
    { label: 'Sales Reps or Invites Active (≥1)', done: account.sales_rep_count >= 1 || account.pending_invites >= 1 },
    { label: 'B2B Orders Booked (≥1)', done: account.orders_count >= 1 },
    { label: 'Payment Receipts Recorded (≥1)', done: account.payments_count >= 1 },
  ];

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-surface border-l border-border h-full overflow-y-auto shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="sticky top-0 bg-surface/95 backdrop-blur-md border-b border-border p-5 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Building2 size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground truncate">{account.name}</h2>
                {account.is_demo && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-md border border-amber-300/60">
                    Demo
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <Calendar size={12} />
                <span>Created {new Date(account.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Quick Action Button */}
          <button
            type="button"
            onClick={handleOpenViewMode}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Eye size={18} />
            <span>Open in Read-Only View Mode</span>
          </button>

          {/* Owner / Contact Card */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Owner & Contact</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Owner Name:</span>
                <p className="font-semibold text-foreground mt-0.5">{account.owner_name || 'SoleFlow Admin'}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-semibold text-foreground mt-0.5 capitalize">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                      account.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  {account.status}
                </p>
              </div>

              {account.owner_email && (
                <div className="sm:col-span-2 flex items-center justify-between bg-surface p-2.5 rounded-xl border border-border">
                  <div className="flex items-center gap-2 truncate">
                    <Mail size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-foreground truncate font-mono">{account.owner_email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(account.owner_email, 'email')}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedField === 'email' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              )}

              {account.owner_phone && (
                <div className="sm:col-span-2 flex items-center justify-between bg-surface p-2.5 rounded-xl border border-border">
                  <div className="flex items-center gap-2 truncate">
                    <Phone size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-foreground font-mono">{account.owner_phone}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(account.owner_phone, 'phone')}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                    title="Copy Phone"
                  >
                    {copiedField === 'phone' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Business Numbers Matrix */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-surface border border-border text-center">
              <div className="text-[11px] font-medium text-muted-foreground">Total Booked</div>
              <div className="text-base font-bold text-foreground mt-1">{formatCurrency(account.total_order_value)}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{account.orders_count} orders</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface border border-border text-center">
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Collected</div>
              <div className="text-base font-bold text-emerald-700 dark:text-emerald-300 mt-1">{formatCurrency(account.total_collected)}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{account.payments_count} receipts</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface border border-border text-center">
              <div className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Outstanding</div>
              <div className="text-base font-bold text-rose-700 dark:text-rose-300 mt-1">{formatCurrency(account.total_outstanding)}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Due balance</div>
            </div>
          </div>

          {/* Setup Progress Checklist */}
          <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Setup Checklist</span>
              <span className="text-xs font-bold text-primary">
                {account.setup_steps_done} of 6 completed ({account.setup_percent}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${account.setup_percent}%` }}
              />
            </div>

            <div className="space-y-2 mt-3 pt-2">
              {setupSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs">
                  {step.done ? (
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  ) : (
                    <Circle size={16} className="text-muted-foreground/50 shrink-0" />
                  )}
                  <span className={step.done ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Activity</span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock size={12} />
                {account.days_since_last_activity === 0
                  ? 'Active today'
                  : `${account.days_since_last_activity}d ago`}
              </span>
            </div>

            {isLoadingTimeline ? (
              <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">Loading timeline events...</div>
            ) : timeline.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">No recent activity events recorded yet.</div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {timeline.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground truncate">{item.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(item.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {item.description && <p className="text-muted-foreground text-[11px]">{item.description}</p>}
                    <div className="text-[10px] text-subtle-foreground font-medium">By {item.actor_name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
