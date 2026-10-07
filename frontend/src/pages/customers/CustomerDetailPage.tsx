import React, { useState, useMemo, useEffect } from 'react';
import { Customer, LedgerEntry, Order, PaymentReceipt, FollowUpItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatIndianCurrency } from '../../hooks/useCustomerMetrics';
import CustomerProfileKpiCards from '../../components/customers/CustomerProfileKpiCards';
import {
  Users,
  ChevronLeft,
  Store,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Building2,
  Calendar,
  CreditCard,
  Wallet,
  ShoppingBag,
  TrendingUp,
  Plus,
  Share2,
  DollarSign,
  Download,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Package,
  Layers,
  Sparkles,
  Send,
  MoreVertical,
  ArrowUpDown,
  Tag,
  Search,
  ExternalLink,
} from 'lucide-react';
import { CustomerRowActionMenu } from '../../components/customers/CustomerRowActionMenu';
import { ReceiptPreviewModal, mapPaymentStatusToReceiptStatus } from '../../components/payments/ReceiptTemplate';
import { clientsService } from '../../services/clients';
import { AnalogTimePicker } from '../../components/ui';

interface CustomerDetailPageProps {
  customerId: string;
  onNavigate: (path: string) => void;
  fromPath?: string;
  initialTab?: string;
}

// Map Supabase client_notes rows to the local note shape (real data only)
const mapClientNotes = (rows: any[]): Array<{ id: string; author: string; text: string; date: string }> =>
  (rows || []).map((n: any) => ({
    id: String(n.id),
    author: n.author_name || '—',
    text: n.note || '',
    date: n.created_at
      ? new Date(n.created_at).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—',
  }));

export const CustomerDetailPage: React.FC<CustomerDetailPageProps> = ({
  customerId,
  onNavigate,
  fromPath = '/admin/customers',
  initialTab = 'overview',
}) => {
  const {
    customers,
    orders,
    payments,
    followUps,
    designs,
    currentUser,
    isSupabaseActive,
    addFollowUp,
    setSelectedCustomer,
    setIsCreateOrderModalOpen,
    setIsPaymentModalOpen,
    setIsShareModalOpen,
    showToast,
  } = useApp();

  // Find customer by ID (or fallback)
  const customer = useMemo(() => {
    return customers.find((c) => c.id === customerId);
  }, [customers, customerId]);

  // Check salesperson authorization: Salesperson can only view their own customers
  const isAuthorized = useMemo(() => {
    if (!customer) return false;
    if (currentUser.role === 'admin') return true;
    return (
      customer.salespersonId === currentUser.id ||
      customer.salespersonName?.toLowerCase().includes(currentUser.name.toLowerCase())
    );
  }, [customer, currentUser]);

  // Tab state synced with URL/initialTab
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'invoices' | 'payments'>('all');
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentReceipt | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [localNotes, setLocalNotes] = useState<Array<{ id: string; author: string; text: string; date: string }>>([]);

  const [newFollowUpText, setNewFollowUpText] = useState('');
  const [newFollowUpDate, setNewFollowUpDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [newFollowUpTime, setNewFollowUpTime] = useState('11:00 AM');

  // Update URL search params when tab changes without full page reload
  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabKey);
    window.history.replaceState({}, '', url.toString());
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load real client notes from Supabase (stays empty until notes are saved)
  useEffect(() => {
    if (!customer?.id || !isSupabaseActive) return;
    let cancelled = false;
    clientsService.fetchClientNotes(customer.id).then((rows) => {
      if (!cancelled && rows) setLocalNotes(mapClientNotes(rows));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.id, isSupabaseActive]);

  // Orders for this customer
  const customerOrders = useMemo(() => {
    if (!customer) return [];
    return orders.filter(
      (o) => o.customerId === customer.id || o.customerName === customer.businessName
    );
  }, [customer, orders]);

  // Payments for this customer
  const customerPayments = useMemo(() => {
    if (!customer) return [];
    return payments.filter(
      (p) => p.customerId === customer.id || p.customerName === customer.businessName
    );
  }, [customer, payments]);

  // Follow-ups for this customer
  const customerFollowUps = useMemo(() => {
    if (!customer) return [];
    return followUps.filter(
      (fu) => fu.customerId === customer.id || fu.customerName === customer.businessName
    );
  }, [customer, followUps]);

  // Earliest open follow-up for this customer
  const nextFollowUp = useMemo(() => {
    const open = customerFollowUps.filter((fu) => fu.status !== 'completed');
    return [...open].sort((a, b) => (new Date(a.date).getTime() || 0) - (new Date(b.date).getTime() || 0))[0];
  }, [customerFollowUps]);

  // Real Ledger Entries — built only from actual invoices and realized payments
  const ledgerEntries = useMemo<LedgerEntry[]>(() => {
    if (!customer) return [];

    const entries: LedgerEntry[] = [];

    customerPayments.forEach((pay) => {
      entries.push({
        id: `pay-${pay.id}`,
        date: pay.paymentDate || '—',
        type: 'payment',
        typeLabel: `Payment Realized (${pay.paymentMethod || 'Bank'})`,
        refNo: pay.receiptNumber || pay.utrRef || '—',
        particulars: `${pay.paymentMethod || 'Bank'} realization${pay.chequeBank ? ` • ${pay.chequeBank}` : ''}`,
        debit: 0,
        credit: pay.paymentAmount || 0,
        runningBalance: 0,
      });
    });

    customerOrders.forEach((ord) => {
      entries.push({
        id: `ord-${ord.id}`,
        date: ord.orderDate || '—',
        type: 'invoice',
        typeLabel: `Tax Invoice (${ord.items?.length || 1} Articles)`,
        refNo: ord.id,
        particulars: `${ord.pairsCount} Pairs${ord.batchNumber ? ` • Bilty #${ord.batchNumber}` : ''}`,
        debit: ord.netPayable || ord.subtotal || 0,
        credit: 0,
        runningBalance: 0,
      });
    });

    // Chronological running balance: oldest first, debits grow the outstanding due.
    const timeOf = (d: string) => {
      const ms = new Date(d).getTime();
      return Number.isNaN(ms) ? 0 : ms;
    };
    entries.sort((a, b) => timeOf(a.date) - timeOf(b.date));
    let balance = 0;
    entries.forEach((e) => {
      balance += e.debit - e.credit;
      e.runningBalance = balance;
    });

    return entries.reverse();
  }, [customer, customerOrders, customerPayments]);

  const filteredLedger = useMemo(() => {
    if (ledgerFilter === 'invoices') return ledgerEntries.filter((e) => e.debit > 0);
    if (ledgerFilter === 'payments') return ledgerEntries.filter((e) => e.credit > 0);
    return ledgerEntries;
  }, [ledgerEntries, ledgerFilter]);

  if (!customer || !isAuthorized) {
    return (
      <div className="p-6 sm:p-12 max-w-xl mx-auto text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900/50">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-xl font-bold text-foreground">Customer Not Found or Access Restricted</h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          The requested retailer store account <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{customerId}</code> either does not exist or you do not have authorization to view this territory.
        </p>
        <button
          type="button"
          onClick={() => onNavigate(fromPath)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <ChevronLeft size={16} />
          <span>Return to Customers Roster</span>
        </button>
      </div>
    );
  }

  const initials = customer.businessName
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const isOverdue = (customer.amountDue || 0) > 0 && (customer.overdueDays > 0 || customer.status === 'overdue');
  const isCleared = (customer.ordersCount > 0 || (customer.totalBusiness || 0) > 0) && (customer.amountDue || 0) <= 0;
  const limitUsage = customer.creditLimit > 0 ? Math.round(((customer.amountDue || 0) / customer.creditLimit) * 100) : 0;
  const topModels = customer.topSellingModels || [];
  const recentActivity = customer.activityHistory || [];

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !customer) return;
    const note = {
      id: `note-${Date.now()}`,
      author: currentUser.name,
      text: newNoteText.trim(),
      date: 'Just now',
    };
    if (!isSupabaseActive) { showToast('Sign in to a real account to save notes.'); return; }
    if (!await clientsService.addClientNote(customer.id, note.text)) { showToast('Note could not be saved. Please retry.'); return; }
    const rows = await clientsService.fetchClientNotes(customer.id);
    setLocalNotes(mapClientNotes(rows));
    setNewNoteText('');
    showToast('Note saved to client file');
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollowUpText.trim() || !customer) return;
    const saved = await addFollowUp({
      customerId: customer.id,
      customerName: customer.businessName,
      customerCity: customer.city,
      phone: customer.phone,
      reason: 'Scheduled Interaction & Order Discussion',
      date: newFollowUpDate || new Date().toISOString().split('T')[0],
      time: newFollowUpTime || '11:00 AM',
      notes: newFollowUpText.trim(),
      amountDue: customer.amountDue,
      status: 'today',
    });
    if (!saved) return;
    setNewFollowUpText('');
  };

  const handleExportLedgerCSV = () => {
    const headers = ['Date', 'Type', 'Reference No', 'Particulars', 'Billed Debit (INR)', 'Paid Credit (INR)', 'Running Balance (INR)'];
    const rows = filteredLedger.map((e) => [
      `"${e.date}"`,
      `"${e.typeLabel}"`,
      `"${e.refNo}"`,
      `"${e.particulars}"`,
      e.debit || 0,
      e.credit || 0,
      e.runningBalance || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ledger_${customer.businessName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Ledger statement exported to CSV');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1700px] w-full mx-auto pb-24 md:pb-12 bg-background text-foreground">
      {/* 1. Breadcrumbs Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <button
          type="button"
          onClick={() => onNavigate(fromPath)}
          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer inline-flex items-center gap-1"
        >
          <ChevronLeft size={14} />
          <span>Back to {fromPath.includes('dashboard') ? 'Dashboard' : 'Clients'}</span>
        </button>
        <span>/</span>
        <span className="text-muted-foreground">Store Profiles</span>
        <span>/</span>
        <span className="text-foreground font-semibold">{customer.businessName}</span>
      </div>

      {/* 2. Top Profile Header (Sticky & Comprehensive) */}
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Client Identity & Title */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-lg flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/50 shadow-2xs">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {customer.businessName}
                </h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-muted text-muted-foreground border border-border">
                  {customer.id}
                </span>
                {isOverdue ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50">
                    Overdue ({customer.overdueDays}d)
                  </span>
                ) : isCleared ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
                    Cleared
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50">
                    Active
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {customer.tier || '—'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
                <span>Proprietor: <strong className="text-foreground">{customer.propName || '—'}</strong></span>
                <span>•</span>
                <span>GSTIN: <strong className="font-mono text-foreground">{customer.gstin || '—'}</strong></span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedCustomer(customer);
                setIsShareModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-muted text-foreground text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Share2 size={15} />
              <span>Share Catalogue</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCustomer(customer);
                setIsPaymentModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>₹</span>
              <span>Record Payment</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCustomer(customer);
                setIsCreateOrderModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>New Order</span>
            </button>

            <CustomerRowActionMenu customer={customer} onNavigate={onNavigate} fromPath={fromPath} />
          </div>
        </div>

        {/* Contact & Territory Meta Line */}
        <div className="pt-3 border-t border-border flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 text-foreground">
            <MapPin size={14} className="text-muted-foreground" />
            <span>{customer.city}, {customer.state} ({customer.cluster || '—'})</span>
          </span>

          <a
            href={`tel:${customer.phone}`}
            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Phone size={14} />
            <span>{customer.phone}</span>
          </a>

          <a
            href={`https://wa.me/${(customer.whatsapp || customer.phone).replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <MessageSquare size={14} />
            <span>WhatsApp Connect</span>
          </a>

          <span className="inline-flex items-center gap-1.5">
            <Building2 size={14} />
            <span>Sales Rep: <strong className="text-foreground">{customer.salespersonName || 'Unassigned'}</strong></span>
          </span>
        </div>
      </div>

      {/* 3. Summary Performance Cards (4 3D Claymorphic Cards) */}
      <CustomerProfileKpiCards
        lifetimeBusiness={formatIndianCurrency(customer.totalBusiness || 0, true)}
        lifetimeCaption={`${customer.ordersCount || 0} wholesale consignments`}
        totalPaid={formatIndianCurrency(customer.totalPaid || 0, true)}
        paidCaption="Cheques & direct bank deposits"
        outstandingDue={formatIndianCurrency(customer.amountDue || 0)}
        isOverdue={isOverdue}
        isCleared={isCleared}
        dueCaption={isOverdue ? `${customer.overdueDays} days overdue` : 'Ledger in good standing'}
        creditLimit={customer.creditLimit > 0 ? formatIndianCurrency(customer.creditLimit, true) : '—'}
        limitUsage={limitUsage}
        paymentTerms={customer.paymentTerms || 'Not set'}
      />

      {/* 4. Detail Navigation Tabs (9 Tabs, URL-synced) */}
      <div className="border-b border-border overflow-x-auto pb-px flex gap-2 sm:gap-6 scrollbar-none">
        {[
          { key: 'overview', label: 'Overview', icon: Store },
          { key: 'ledger', label: 'Financial Ledger', icon: FileText, count: ledgerEntries.length },
          { key: 'orders', label: 'Order History', icon: ShoppingBag, count: customerOrders.length },
          { key: 'payments', label: 'Payments', icon: DollarSign, count: customerPayments.length },
          { key: 'designs', label: 'Designs Shared', icon: Share2 },
          { key: 'models', label: 'Top Models', icon: Layers },
          { key: 'followups', label: 'Follow-ups & Visits', icon: Calendar, count: customerFollowUps.length },
          { key: 'notes', label: 'Internal Notes', icon: MessageSquare, count: localNotes.length },
          { key: 'activity', label: 'Activity Timeline', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.count != null && tab.count > 0 && (
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 5. Tab Content Panes */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 cols: Business Profile Card & Top Models */}
          <div className="lg:col-span-7 space-y-6">
            {/* Business & Commercial Terms */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Building2 size={16} className="text-blue-600 dark:text-blue-400" />
                <span>Commercial &amp; Billing Terms</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                  <p className="text-muted-foreground font-medium">Sanctioned Payment Terms</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{customer.paymentTerms || 'Not set'}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                  <p className="text-muted-foreground font-medium">Sanctioned Credit Limit</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{customer.creditLimit > 0 ? formatIndianCurrency(customer.creditLimit) : '—'}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                  <p className="text-muted-foreground font-medium">Last Order Date</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{customer.lastOrderDate || '—'}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
                  <p className="text-muted-foreground font-medium">Last Realized Payment</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {customer.lastPaymentAmount
                      ? `+${formatIndianCurrency(customer.lastPaymentAmount)} (${customer.lastPaymentDate || '—'})`
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="pt-2">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Billing &amp; Consignment Dispatch Address</p>
                <p className="text-xs text-foreground bg-muted/30 p-3 rounded-xl border border-border/60 leading-relaxed">
                  {customer.address || '—'}
                </p>
              </div>
            </div>

            {/* Top 3 Selling Models */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Layers size={16} className="text-amber-500" />
                  <span>Top Selling Footwear Models</span>
                </h3>
                <button
                  type="button"
                  onClick={() => handleTabChange('models')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                >
                  View All Models
                </button>
              </div>

              {topModels.length === 0 ? (
                <p className="text-xs text-muted-foreground">No sales data yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {topModels.map((model, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-border bg-muted/20 flex flex-col items-center text-center">
                      {model.image ? (
                        <img src={model.image} alt={model.name} className="w-20 h-16 object-cover rounded-lg border border-border mb-2" />
                      ) : (
                        <div className="w-20 h-16 rounded-lg border border-border mb-2 bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground">
                          {model.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <p className="text-xs font-bold text-foreground truncate w-full">{model.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">{model.pairs} Pairs Ordered</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right 5 cols: Scheduled Follow-ups & Recent Activity */}
          <div className="lg:col-span-5 space-y-6">
            {/* Next Scheduled Action */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar size={16} className="text-amber-500" />
                <span>Next Scheduled Action</span>
              </h3>

              {nextFollowUp ? (
                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-200">
                    <span>{nextFollowUp.reason || 'Client Check-in'}</span>
                    <span>{nextFollowUp.date || '—'}</span>
                  </div>
                  {(nextFollowUp.notes || nextFollowUp.time) && (
                    <p className="text-amber-800 dark:text-amber-300">
                      {nextFollowUp.notes || nextFollowUp.time}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No action scheduled.</p>
              )}
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                <span>Recent Client Activity</span>
              </h3>

              <div className="divide-y divide-border/60">
                {recentActivity.slice(0, 4).length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">No activity yet.</p>
                ) : (
                  recentActivity.slice(0, 4).map((act, idx) => (
                    <div key={idx} className="py-3 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-foreground">
                        <span>{act.title}</span>
                        <span className="text-[11px] font-normal text-muted-foreground">{act.timestamp}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{act.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Verified Financial Statement</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete ledger of billed tax invoices and realized bank payment receipts
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <select
                value={ledgerFilter}
                onChange={(e) => setLedgerFilter(e.target.value as any)}
                className="h-9 px-3 bg-muted/50 border border-border rounded-xl text-xs font-medium text-foreground cursor-pointer"
              >
                <option value="all">All Transactions</option>
                <option value="invoices">Invoices (Debits)</option>
                <option value="payments">Payments (Credits)</option>
              </select>
              <button
                type="button"
                onClick={handleExportLedgerCSV}
                className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-muted text-xs font-semibold text-foreground inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 md:px-6">Date</th>
                  <th className="py-3.5 px-4">Transaction / Voucher</th>
                  <th className="py-3.5 px-4">Particulars &amp; Consignment</th>
                  <th className="py-3.5 px-4 text-right">Billed (Debit)</th>
                  <th className="py-3.5 px-4 text-right">Paid (Credit)</th>
                  <th className="py-3.5 px-4 md:px-6 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <FileText size={36} className="mx-auto mb-2 text-muted-foreground/40" />
                      <p className="font-bold text-foreground">No transactions yet</p>
                      <p className="text-xs mt-1">Billed invoices and realized payments for this client will appear here.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 md:px-6 font-mono text-xs">{entry.date}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-foreground block">{entry.typeLabel}</span>
                        {entry.type === 'payment' && (
                          <button
                            type="button"
                            onClick={() => {
                              const cleanId = entry.id.replace('pay-', '');
                              const matched = payments.find((p) => p.id === cleanId || p.receiptNumber === entry.refNo || p.utrRef === entry.refNo) || {
                                id: cleanId || `pay-${Date.now()}`,
                                receiptNumber: entry.refNo || `SF-REC-${Date.now().toString().slice(-5)}`,
                                customerId: customer.id,
                                customerName: customer.businessName,
                                customerCity: customer.city,
                                amountDueBefore: (customer.amountDue || 0) + (entry.credit || 0),
                                paymentAmount: entry.credit,
                                amountDueAfter: customer.amountDue || 0,
                                paymentDate: entry.date,
                                paymentMethod: 'UPI' as const,
                                utrRef: entry.refNo,
                                status: 'verified',
                              } as PaymentReceipt;
                              setSelectedReceiptPayment(matched);
                            }}
                            className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 text-[10px] font-semibold border border-blue-200 dark:border-blue-900/40 cursor-pointer"
                            title="View official digital receipt slip"
                          >
                            <FileText size={11} />
                            <span>Slip</span>
                          </button>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">Ref: {entry.refNo}</span>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground text-xs">{entry.particulars}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-foreground">
                      {entry.debit > 0 ? formatIndianCurrency(entry.debit) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      {entry.credit > 0 ? formatIndianCurrency(entry.credit) : '—'}
                    </td>
                    <td className="py-3.5 px-4 md:px-6 text-right font-mono font-bold text-foreground">
                      {formatIndianCurrency(entry.runningBalance)}
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Order Consignments ({customerOrders.length})</h3>
              <p className="text-xs text-muted-foreground">All production and dispatched footwear orders</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCustomer(customer);
                setIsCreateOrderModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={15} />
              <span>New Order</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 md:px-6">Order ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Items / Pairs</th>
                  <th className="py-3.5 px-4 text-right">Order Value</th>
                  <th className="py-3.5 px-4 text-right">Advance Paid</th>
                  <th className="py-3.5 px-4 text-right">Balance Due</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 md:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customerOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      <ShoppingBag size={36} className="mx-auto mb-2 text-muted-foreground/40" />
                      <p className="font-bold text-foreground">No orders on file yet</p>
                      <p className="text-xs mt-1">Create the first wholesale consignment order for this client.</p>
                    </td>
                  </tr>
                ) : (
                  customerOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 md:px-6 font-bold text-blue-600 dark:text-blue-400 font-mono">
                        {ord.id}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground text-xs">{ord.orderDate || 'Recent'}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-foreground block">{ord.pairsCount} Pairs</span>
                        <span className="text-[11px] text-muted-foreground">{ord.items?.length || 1} Footwear Articles</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-foreground tabular-nums">
                        {formatIndianCurrency(ord.netPayable || ord.subtotal || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
                        {formatIndianCurrency(ord.advanceDeposited || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                        {formatIndianCurrency(ord.balanceDue || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 md:px-6 text-right">
                        <button
                          type="button"
                          onClick={() => onNavigate(`/admin/orders?order=${ord.id}`)}
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
                          title="Inspect Order"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Realized Payment Receipts</h3>
              <p className="text-xs text-muted-foreground">Bank transfers, cheques, and cash clearances</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCustomer(customer);
                setIsPaymentModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>₹</span>
              <span>Record Payment</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 md:px-6">Receipt No</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Amount Realized</th>
                  <th className="py-3.5 px-4">Payment Mode</th>
                  <th className="py-3.5 px-4">Bank Ref / UTR</th>
                  <th className="py-3.5 px-4">Allocated Invoice</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 md:px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customerPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      <DollarSign size={36} className="mx-auto mb-2 text-muted-foreground/40" />
                      <p className="font-bold text-foreground">No payment records logged</p>
                      <p className="text-xs mt-1">Record a cheque or UPI collection to clear balance.</p>
                    </td>
                  </tr>
                ) : (
                  customerPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 md:px-6 font-mono font-bold text-foreground">
                        {pay.receiptNumber || `SF-REC-${pay.id.slice(-5)}`}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground text-xs">{pay.paymentDate || 'Recent'}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums text-sm">
                        {formatIndianCurrency(pay.paymentAmount || 0)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground">{pay.paymentMethod || 'UPI'}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">{pay.utrRef || '—'}</td>
                      <td className="py-3.5 px-4 text-xs font-medium text-blue-600 dark:text-blue-400">{pay.orderNumber || pay.orderId || 'General'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                          {pay.status === 'pending_clearance' ? 'Cheque Pending' : 'Realized'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 md:px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptPayment(pay)}
                          className="px-2.5 py-1 rounded-lg border border-border hover:bg-muted text-blue-600 dark:text-blue-400 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="View Official Digital Receipt"
                        >
                          <FileText size={13} />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DESIGNS SHARED */}
      {activeTab === 'designs' && (
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-base font-bold text-foreground">Shared Lookbooks &amp; Design Catalogs</h3>
              <p className="text-xs text-muted-foreground">Digital collections shared with this retailer</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCustomer(customer);
                setIsShareModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Share2 size={15} />
              <span>Share New Catalog</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {designs.slice(0, 6).map((d) => (
              <div key={d.id} className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center gap-3">
                <img src={d.image} alt={d.name} className="w-16 h-14 object-cover rounded-lg border border-border shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-[10px] text-muted-foreground font-bold">{d.articleCode}</span>
                  <p className="font-bold text-xs text-foreground truncate">{d.name}</p>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{formatIndianCurrency(d.price)} / pair</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: TOP MODELS */}
      {activeTab === 'models' && (
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-base font-bold text-foreground">Best Selling Footwear Models</h3>
              <p className="text-xs text-muted-foreground">High velocity models with repeat orders from this store</p>
            </div>
          </div>

          {topModels.length === 0 ? (
            <p className="text-xs text-muted-foreground">No sales data yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {topModels.map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-surface shadow-2xs space-y-3">
                  {m.image ? (
                    <img src={m.image} alt={m.name} className="w-full h-36 object-cover rounded-lg border border-border" />
                  ) : (
                    <div className="w-full h-36 rounded-lg border border-border bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{m.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Total Quantity: <strong className="text-foreground">{m.pairs} Pairs</strong></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setIsCreateOrderModalOpen(true);
                    }}
                    className="w-full py-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    Book New Lot
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: FOLLOW-UPS & VISITS */}
      {activeTab === 'followups' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-foreground">Scheduled Follow-ups &amp; Visits</h3>
            <div className="divide-y divide-border/60">
              {customerFollowUps.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs">
                  No pending follow-ups scheduled for this client.
                </div>
              ) : (
                customerFollowUps.map((fu) => (
                  <div key={fu.id} className="py-3 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <span>📍 Follow-up ({fu.reason || 'Client Check-in'})</span>
                      <span className="text-[11px] text-muted-foreground">{fu.date}</span>
                    </div>
                    <p className="text-muted-foreground">{fu.notes}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-foreground">Schedule Next Interaction</h3>
            <form onSubmit={handleAddFollowUp} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-muted-foreground mb-1 font-medium">Follow-up Date</label>
                  <input
                    type="date"
                    value={newFollowUpDate}
                    onChange={(e) => setNewFollowUpDate(e.target.value)}
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-foreground text-xs font-mono"
                  />
                </div>
                <div>
                  <AnalogTimePicker
                    label="Follow-up Time"
                    value={newFollowUpTime}
                    onChange={setNewFollowUpTime}
                    placeholder="Set time"
                  />
                </div>
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-medium">Objective &amp; Notes</label>
                <textarea
                  value={newFollowUpText}
                  onChange={(e) => setNewFollowUpText(e.target.value)}
                  placeholder="e.g. In-person visit to collect festive lot advance payment..."
                  rows={3}
                  className="w-full p-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer shadow-xs"
              >
                Schedule Follow-up
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 8: NOTES */}
      {activeTab === 'notes' && (
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
          <h3 className="text-base font-bold text-foreground">Commercial Notes &amp; Observations</h3>

          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Add confidential customer note, payment commitment, or proprietor preference..."
              rows={3}
              className="w-full p-3.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send size={14} />
                <span>Save Note</span>
              </button>
            </div>
          </form>

          <div className="space-y-3 pt-2">
            {localNotes.map((n) => (
              <div key={n.id} className="p-4 rounded-xl bg-muted/30 border border-border/60 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span>{n.author}</span>
                  <span className="text-[11px] font-normal text-muted-foreground">{n.date}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{n.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            <span>Full Chronological Activity Log</span>
          </h3>

          <div className="divide-y divide-border/60">
            {recentActivity.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">No activity yet.</p>
            ) : (
              recentActivity.map((item, idx) => (
                <div key={idx} className="py-3.5 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>{item.title}</span>
                    <span className="text-[11px] font-normal text-muted-foreground">{item.timestamp}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Standalone Receipt Preview Modal */}
      {selectedReceiptPayment && (
        <ReceiptPreviewModal
          open={Boolean(selectedReceiptPayment)}
          onClose={() => setSelectedReceiptPayment(null)}
          receipt={selectedReceiptPayment}
          customer={{
            customerCode: customer?.id,
            gstin: customer?.gstin,
            phone: customer?.phone,
            address: customer?.address
              ? `${customer.address}, ${customer.city}, ${customer.state}`
              : [customer?.city, customer?.state].filter(Boolean).join(', '),
          }}
          status={mapPaymentStatusToReceiptStatus(selectedReceiptPayment.status)}
        />
      )}
    </div>
  );
};
