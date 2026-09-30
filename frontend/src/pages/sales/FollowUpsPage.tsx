import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
} from 'lucide-react';

interface FollowUpsPageProps {
  onNavigate?: (path: string) => void;
}

interface FollowUpDisplayItem {
  id: string;
  timeLabel: string;
  status: 'Pending' | 'Completed';
  customerName: string;
  city: string;
  phone: string;
  iconType: 'sneaker' | 'factory' | 'store' | 'shoe_red';
  iconBg: string;
  reason: string;
  note: string;
}

const DEFAULT_FOLLOW_UPS: FollowUpDisplayItem[] = [
  {
    id: 'fu-1',
    timeLabel: 'Today • 11:00 AM',
    status: 'Pending',
    customerName: 'ABC Footwear',
    city: 'Agra',
    phone: '+91 98371 44812',
    iconType: 'sneaker',
    iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    reason: 'Payment follow-up for overdue ledger balance',
    note: 'Speak to Sunil Agarwal about clearing remaining ₹2,30,000 to release 3.20 pairs.',
  },
  {
    id: 'fu-2',
    timeLabel: 'Today • 03:45 PM',
    status: 'Pending',
    customerName: 'Regal Footwear Hub',
    city: 'Kanpur',
    phone: '+91 98211 88412',
    iconType: 'factory',
    iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
    reason: 'Winter boot catalog volume discount review',
    note: 'Review pending ₹60k before committing extra 40 pairs allocation.',
  },
  {
    id: 'fu-3',
    timeLabel: 'Tomorrow • 04:00 PM',
    status: 'Pending',
    customerName: 'Walkwell Retailers',
    city: 'Jaipur',
    phone: '+91 98765 43210',
    iconType: 'store',
    iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    reason: 'Diwali Festival season bulk booking for Oxford line',
    note: 'Target 15 cartons minimum for seasonal priority freight.',
  },
  {
    id: 'fu-4',
    timeLabel: '20 Oct • 02:00 PM',
    status: 'Pending',
    customerName: 'Bansal Shoe House',
    city: 'Indore',
    phone: '+91 99123 45678',
    iconType: 'shoe_red',
    iconBg: 'bg-rose-50 text-rose-500 dark:bg-rose-950/60 dark:text-rose-400',
    reason: 'Verify dispatch tracking LR #88921-AGR arrival',
    note: 'Confirm consignment unloading and inspect condition.',
  },
];

export const FollowUpsPage: React.FC<FollowUpsPageProps> = ({ onNavigate }) => {
  const { showToast } = useApp();
  const [items, setItems] = useState<FollowUpDisplayItem[]>(DEFAULT_FOLLOW_UPS);

  const completedCount = items.filter((f) => f.status === 'Completed').length;
  const pendingCount = items.filter((f) => f.status === 'Pending').length;

  const handleMarkDone = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: 'Completed' } : it))
    );
    showToast('Follow-up marked as completed!');
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'factory':
        return <Building2 size={18} />;
      case 'store':
        return <Store size={18} />;
      case 'shoe_red':
      case 'sneaker':
      default:
        return <Footprints size={18} />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto pb-24 md:pb-12 bg-background text-foreground">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
        <button
          type="button"
          onClick={() => onNavigate?.('/sales/dashboard')}
          className="hover:underline cursor-pointer"
        >
          Dashboard
        </button>
        <ChevronRight size={13} className="text-muted-foreground/60" />
        <span className="text-blue-600 dark:text-blue-400 font-bold">
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
          onClick={() => showToast('New follow-up reminder scheduled!')}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Follow-up</span>
        </button>
      </div>

      {/* 3. 4 KPI Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Reminders */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-border/80 transition-all flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CalendarCheck2 size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Total Reminders</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight">
              {items.length} Tasks
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5">
              Retailer interaction tasks
            </p>
          </div>
        </div>

        {/* Card 2: Pending Callbacks */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-border/80 transition-all flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Hourglass size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Pending Callbacks</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight">
              {pendingCount} Pending
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5">
              Action required today
            </p>
          </div>
        </div>

        {/* Card 3: Completed Tasks */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-border/80 transition-all flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Completed Tasks</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight">
              {completedCount} Done
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5">
              Resolved callbacks
            </p>
          </div>
        </div>

        {/* Card 4: High Priority */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-border/80 transition-all flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">High Priority</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight">
              2 Critical
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5">
              Cheque pickup reminders
            </p>
          </div>
        </div>
      </div>

      {/* 4. Follow-up Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className={`bg-surface border border-border rounded-2xl p-5 shadow-2xs flex flex-col justify-between transition-all ${
              item.status === 'Completed' ? 'opacity-60' : 'hover:border-border/80 hover:shadow-sm'
            }`}
          >
            <div className="space-y-4">
              {/* Header: Timestamp + Pending Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  {item.timeLabel}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    item.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {/* Store Row */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.iconBg}`}>
                  {renderIcon(item.iconType)}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
                    {item.customerName}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.city}
                  </p>
                </div>
              </div>

              {/* Purpose Box */}
              <div className="p-3 bg-muted/30 rounded-xl border border-border text-xs font-medium text-foreground leading-relaxed">
                {item.reason}
              </div>

              {/* Note */}
              <div className="flex items-start gap-1.5 text-xs text-muted-foreground leading-normal">
                <Info size={14} className="shrink-0 mt-0.5 text-muted-foreground/80" />
                <p className="italic">
                  <span className="font-semibold not-italic">Note:</span> {item.note}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between gap-3">
              <a
                href={`tel:${item.phone}`}
                className="px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-muted text-foreground text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone size={14} />
                <span>Call Shop</span>
              </a>

              {item.status === 'Pending' ? (
                <button
                  type="button"
                  onClick={() => handleMarkDone(item.id)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Eye size={14} />
                  <span>Mark Done</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check size={14} />
                  <span>Done</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
