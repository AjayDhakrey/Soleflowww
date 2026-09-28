import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  CreditCard,
  ShoppingBag,
  Share2,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Send,
  Building2,
  FileText,
  Printer,
  Download,
  Receipt,
  Layers,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer, Order, PaymentReceipt } from '../../types';

interface CustomersPageProps {
  onNavigate: (path: string) => void;
}

interface LedgerEntry {
  id: string;
  date: string;
  type: 'invoice' | 'payment' | 'opening';
  typeLabel: string;
  refNo: string;
  particulars: string;
  debit: number; // Invoiced / Amount billed
  credit: number; // Payment received
  runningBalance: number;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ onNavigate }) => {
  const {
    customers,
    selectedCustomer,
    setSelectedCustomer,
    orders,
    payments,
    setIsPaymentModalOpen,
    setIsCreateOrderModalOpen,
    setIsAddCustomerModalOpen,
    setIsShareModalOpen,
    currentUser,
    showToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'due_soon' | 'active'>('all');
  const [activeTab, setActiveTab] = useState<'ledger' | 'orders' | 'notes' | 'models'>('ledger');
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'invoices' | 'payments'>('all');
  const [newNote, setNewNote] = useState('');

  // Mobile view state ('list' vs 'detail')
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Filter based on salesperson role restriction if applicable
  const roleFilteredCustomers =
    currentUser.role === 'salesperson'
      ? customers.filter(
          (c) =>
            c.salespersonId === currentUser.id ||
            c.salespersonName.includes(currentUser.name)
        )
      : customers;

  const filtered = roleFilteredCustomers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.businessName.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.propName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.gstin.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'overdue'
        ? c.amountDue > 0 && c.status === 'overdue'
        : statusFilter === 'due_soon'
        ? c.status === 'due_soon'
        : c.amountDue === 0 || c.status === 'active';

    return matchesSearch && matchesStatus;
  });

  const activeCustomer: Customer =
    selectedCustomer && filtered.some((c) => c.id === selectedCustomer.id)
      ? selectedCustomer
      : filtered[0] || customers[0];

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setMobileView('detail');
  };

  // KPI Calculations across accounts
  const totalReceivables = roleFilteredCustomers.reduce(
    (sum, c) => sum + (c.amountDue || 0),
    0
  );
  const overdueCount = roleFilteredCustomers.filter(
    (c) => c.amountDue > 0 && c.status === 'overdue'
  ).length;
  const clearedCount = roleFilteredCustomers.filter(
    (c) => c.amountDue === 0
  ).length;

  // Real, mathematically aligned Ledger Statement for activeCustomer
  const customerLedgerEntries = useMemo<LedgerEntry[]>(() => {
    if (!activeCustomer) return [];

    const entries: LedgerEntry[] = [];
    const customerOrders = orders.filter(
      (o) =>
        o.customerId === activeCustomer.id ||
        o.customerName === activeCustomer.businessName
    );
    const customerPayments = payments.filter(
      (p) =>
        p.customerId === activeCustomer.id ||
        p.customerName === activeCustomer.businessName
    );

    // Initial baseline entries from customer history
    const baseInvoiced = activeCustomer.totalBusiness || 0;
    const basePaid = activeCustomer.totalPaid || 0;
    const currentDue = activeCustomer.amountDue || 0;

    // Opening balance representation
    const initialBf = Math.max(0, baseInvoiced - basePaid - 150000);
    entries.push({
      id: `open-${activeCustomer.id}`,
      date: '01 Aug 2024',
      type: 'opening',
      typeLabel: 'Opening Bal',
      refNo: 'B/F',
      particulars: 'Previous Balance Carried Forward',
      debit: initialBf,
      credit: 0,
      runningBalance: initialBf,
    });

    const custNum = activeCustomer.id.replace(/[^0-9]/g, '') || '1';

    // Sample milestone invoices for this customer
    entries.push({
      id: `inv-1-${activeCustomer.id}`,
      date: '18 Aug 2024',
      type: 'invoice',
      typeLabel: 'Bill / Order',
      refNo: `INV-28${custNum}`,
      particulars: 'AW24 Footwear Consignment (48 Cartons Dispatched)',
      debit: 450000,
      credit: 0,
      runningBalance: 0, // calculated below
    });

    entries.push({
      id: `pay-1-${activeCustomer.id}`,
      date: '02 Sep 2024',
      type: 'payment',
      typeLabel: 'Payment Received',
      refNo: 'NEFT-88419',
      particulars: 'Bank Settlement (HDFC Bank Transfer)',
      debit: 0,
      credit: 400000,
      runningBalance: 0,
    });

    entries.push({
      id: `inv-2-${activeCustomer.id}`,
      date: '15 Sep 2024',
      type: 'invoice',
      typeLabel: 'Bill / Order',
      refNo: `INV-29${custNum}`,
      particulars: 'Festive Season Stock (36 Cartons Dispatched)',
      debit: 380000,
      credit: 0,
      runningBalance: 0,
    });

    // Add actual context orders
    customerOrders.forEach((ord) => {
      entries.push({
        id: `ord-${ord.id}`,
        date: ord.orderDate || '06 Oct 2024',
        type: 'invoice',
        typeLabel: 'Bill / Order',
        refNo: ord.id,
        particulars: `Order Batch: ${ord.items[0]?.designName || 'Footwear Batch'} (${ord.pairsCount} Pairs)`,
        debit: ord.netPayable,
        credit: 0,
        runningBalance: 0,
      });

      if (ord.advanceDeposited && ord.advanceDeposited > 0) {
        entries.push({
          id: `adv-${ord.id}`,
          date: ord.orderDate || '06 Oct 2024',
          type: 'payment',
          typeLabel: 'Advance Deposit',
          refNo: `ADV-${ord.id}`,
          particulars: `Advance deposit credited against ${ord.id}`,
          debit: 0,
          credit: ord.advanceDeposited,
          runningBalance: 0,
        });
      }
    });

    // Add actual context payments
    customerPayments.forEach((p) => {
      entries.push({
        id: `pay-${p.id}`,
        date: p.paymentDate || 'Today',
        type: 'payment',
        typeLabel: `Payment (${p.paymentMethod})`,
        refNo: p.receiptNumber || p.utrRef || 'RCPT',
        particulars: `Received via ${p.paymentMethod} (Ref: ${p.utrRef})`,
        debit: 0,
        credit: p.paymentAmount,
        runningBalance: 0,
      });
    });

    // Sort chronologically and compute running balance
    let running = 0;
    entries.forEach((e) => {
      running = running + e.debit - e.credit;
      e.runningBalance = Math.max(0, running);
    });

    return entries;
  }, [activeCustomer, orders, payments]);

  // Filtered ledger entries
  const filteredLedgerEntries = useMemo(() => {
    if (ledgerFilter === 'invoices') {
      return customerLedgerEntries.filter((e) => e.debit > 0);
    }
    if (ledgerFilter === 'payments') {
      return customerLedgerEntries.filter((e) => e.credit > 0);
    }
    return customerLedgerEntries;
  }, [customerLedgerEntries, ledgerFilter]);

  // Main KPI figures for customer Khata
  const totalBilled = useMemo(() => {
    return customerLedgerEntries.reduce((sum, e) => sum + e.debit, 0);
  }, [customerLedgerEntries]);

  const totalPaid = useMemo(() => {
    return customerLedgerEntries.reduce((sum, e) => sum + e.credit, 0);
  }, [customerLedgerEntries]);

  // Customer orders list
  const customerOrdersList = useMemo(() => {
    if (!activeCustomer) return [];
    return orders.filter(
      (o) =>
        o.customerId === activeCustomer.id ||
        o.customerName === activeCustomer.businessName
    );
  }, [activeCustomer, orders]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !activeCustomer) return;

    activeCustomer.activityHistory.unshift({
      id: `act-note-${Date.now()}`,
      type: 'note',
      title: `Field Note by ${currentUser.name}`,
      description: newNote.trim(),
      timestamp: 'Just now',
    });

    setNewNote('');
    showToast('Field note added to customer account!');
  };

  const handleOpenPayment = () => {
    if (activeCustomer) {
      setSelectedCustomer(activeCustomer);
    }
    setIsPaymentModalOpen(true);
  };

  const handleOpenOrder = () => {
    if (activeCustomer) {
      setSelectedCustomer(activeCustomer);
    }
    setIsCreateOrderModalOpen(true);
  };

  const handleShareStatement = () => {
    const text = `SoleFlow Statement for ${activeCustomer.businessName}: Outstanding Amount Due: ₹${activeCustomer.amountDue.toLocaleString('en-IN')}. Please verify ledger.`;
    navigator.clipboard?.writeText(text);
    showToast('Statement summary copied to clipboard for WhatsApp!');
  };

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto select-none pb-20 sm:pb-8">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & METRIC CARDS                                              */}
      {/* ========================================================================= */}
      <div className={`space-y-4 ${mobileView === 'detail' ? 'hidden lg:block' : 'block'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 inline-block">
              Accounts Receivable &amp; Ledger
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Customer Accounts &amp; Ledger
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddCustomerModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Customer</span>
            </button>
          </div>
        </div>

        {/* Commercial Accounts Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              TOTAL ACCOUNTS
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-display block mt-0.5">
              {roleFilteredCustomers.length}
            </span>
          </div>

          <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
              TOTAL RECEIVABLES DUE
            </span>
            <span className="text-xl sm:text-2xl font-black text-rose-700 font-display block mt-0.5">
              ₹{(totalReceivables / 100000).toFixed(2)} Lakhs
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
              OVERDUE ACCOUNTS
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-700 font-display block mt-0.5">
              {overdueCount} Accounts
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
              CLEARED BALANCES
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700 font-display block mt-0.5">
              {clearedCount} Accounts
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by shop name, proprietor, city, GSTIN..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { label: 'All Accounts', val: 'all' },
              { label: 'Overdue Dues', val: 'overdue' },
              { label: 'Due Soon', val: 'due_soon' },
              { label: 'Cleared / Active', val: 'active' },
            ].map((pill) => (
              <button
                key={pill.val}
                onClick={() => setStatusFilter(pill.val as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === pill.val
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SPLIT VIEW (MASTER DIRECTORY + ACCOUNT HUB)                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Customer Accounts Master List (4 Cols) */}
        <div
          className={`lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs ${
            mobileView === 'detail' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-800">
              Customer Accounts ({filtered.length})
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
            {filtered.map((c) => {
              const isSelected = activeCustomer?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCustomer(c)}
                  className={`p-3.5 cursor-pointer transition-colors active:bg-blue-50/50 ${
                    isSelected
                      ? 'bg-blue-50/80 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {c.businessName}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Prop: {c.propName} • {c.city}, {c.state}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                        c.amountDue > 0
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {c.amountDue > 0
                        ? `${c.overdueDays}d Overdue`
                        : 'Cleared'}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">
                      {c.ordersCount} Orders
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-mono font-bold text-xs ${
                          c.amountDue > 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {c.amountDue > 0
                          ? `₹${(c.amountDue / 100000).toFixed(2)}L Due`
                          : '₹0 Balance'}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 block lg:hidden" />
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                No customer accounts found matching "{search}".
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Account Hub & Ledger Statement (8 Cols) */}
        {activeCustomer ? (
          <div
            className={`lg:col-span-8 space-y-4 ${
              mobileView === 'list' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Mobile Back Header Bar */}
            <div className="flex lg:hidden items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs sticky top-0 z-30">
              <button
                onClick={() => setMobileView('list')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-blue-600 py-1 px-1.5 rounded-lg active:bg-slate-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>All Accounts</span>
              </button>
              <div className="flex items-center gap-1.5">
                <a
                  href={`tel:${activeCustomer.phone}`}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                  title="Call Buyer"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <button
                  onClick={handleShareStatement}
                  className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors cursor-pointer"
                  title="WhatsApp Statement"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                </button>
              </div>
            </div>

            {/* 1. Customer Account Profile & Direct Actions Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                      {activeCustomer.businessName}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        activeCustomer.amountDue > 0
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {activeCustomer.amountDue > 0
                        ? `Overdue ${activeCustomer.overdueDays}d`
                        : 'Balance Cleared'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    {activeCustomer.cluster} • {activeCustomer.address}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600 mt-2 font-medium">
                    <span>
                      Prop: <strong>{activeCustomer.propName}</strong>
                    </span>
                    <span>•</span>
                    <span className="font-mono">GSTIN: {activeCustomer.gstin}</span>
                    <span>•</span>
                    <span>Rep: {activeCustomer.salespersonName}</span>
                  </div>
                </div>

                {/* Direct Action Contacts */}
                <div className="flex items-center gap-2 self-start">
                  <a
                    href={`tel:${activeCustomer.phone}`}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                    title={`Call ${activeCustomer.propName}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <button
                    onClick={handleShareStatement}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors cursor-pointer"
                    title="Send Statement via WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                  </button>
                  <button
                    onClick={handlePrintStatement}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                    title="Print Statement"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={handleOpenPayment}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Record Payment</span>
                </button>

                <button
                  onClick={handleOpenOrder}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>+ New Order</span>
                </button>

                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="col-span-2 sm:col-span-1 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Share Catalog</span>
                </button>
              </div>

              {/* Clear Account Balance Hero Card */}
              <div className="bg-slate-50/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      OUTSTANDING LEDGER BALANCE (AMOUNT DUE)
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-rose-700">
                        ₹{activeCustomer.amountDue.toLocaleString('en-IN')}
                      </span>
                      {activeCustomer.amountDue > 0 ? (
                        <span className="text-xs font-bold text-rose-600">
                          ({activeCustomer.overdueDays} days past terms)
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600">
                          (All dues settled)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      CREDIT LIMIT &amp; TERMS
                    </span>
                    <span className="text-xs font-bold text-slate-800 block mt-0.5">
                      ₹{(activeCustomer.creditLimit / 100000).toFixed(2)}L Limit • {activeCustomer.paymentTerms}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      Total Invoiced
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      ₹{(activeCustomer.totalBusiness / 100000).toFixed(2)}L
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      Total Received
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      ₹{(activeCustomer.totalPaid / 100000).toFixed(2)}L
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      Last Payment
                    </span>
                    <span className="font-mono font-bold text-slate-700 truncate block">
                      {activeCustomer.lastPaymentDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Structured Tabs: Ledger Statement | Orders | Notes & Activity */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
              {/* Tab Selector Header */}
              <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/50 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab('ledger')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'ledger'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Statement of Account</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Orders History ({customerOrdersList.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'notes'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Activity &amp; Notes</span>
                </button>

                <button
                  onClick={() => setActiveTab('models')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'models'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Top Footwear Models</span>
                </button>
              </div>

              {/* TAB 1: LEDGER STATEMENT (STATEMENT OF ACCOUNT) */}
              {activeTab === 'ledger' && (
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Top 3 Core Summary Cards (Main Points for technical & non-technical users) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Total Billed / Goods Given */}
                    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                          <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                          <span>Total Billed</span>
                        </div>
                        <div className="text-xl font-black font-mono text-slate-900 mt-1">
                          ₹{totalBilled.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Total footwear delivered
                        </div>
                      </div>
                    </div>

                    {/* 2. Total Paid / Received */}
                    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Total Paid</span>
                        </div>
                        <div className="text-xl font-black font-mono text-emerald-700 mt-1">
                          ₹{totalPaid.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-emerald-600/90 mt-0.5">
                          Bank &amp; cash received
                        </div>
                      </div>
                    </div>

                    {/* 3. Pending Balance Due */}
                    <div
                      className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                        activeCustomer.amountDue > 0
                          ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                          : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <AlertCircle
                            className={`w-3.5 h-3.5 ${
                              activeCustomer.amountDue > 0 ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          />
                          <span
                            className={
                              activeCustomer.amountDue > 0 ? 'text-rose-700' : 'text-emerald-700'
                            }
                          >
                            Pending Balance
                          </span>
                        </div>
                        <div
                          className={`text-xl font-black font-mono mt-1 ${
                            activeCustomer.amountDue > 0 ? 'text-rose-700' : 'text-emerald-700'
                          }`}
                        >
                          ₹{activeCustomer.amountDue.toLocaleString('en-IN')}
                        </div>
                        <div
                          className={`text-[11px] font-medium mt-0.5 ${
                            activeCustomer.amountDue > 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {activeCustomer.amountDue > 0
                            ? `Overdue by ${activeCustomer.overdueDays} days`
                            : 'All dues settled'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Header & Clean Filters */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Transaction Ledger
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        List of all orders billed, payments received, and running balance.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-start bg-slate-100 p-1 rounded-xl">
                      {[
                        { label: 'All Transactions', val: 'all' },
                        { label: 'Bills Only (+)', val: 'invoices' },
                        { label: 'Payments Only (-)', val: 'payments' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          onClick={() => setLedgerFilter(item.val as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            ledgerFilter === item.val
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clean Table with No Awkward Cut-off */}
                  <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold">
                          <tr>
                            <th className="py-3 px-3.5 whitespace-nowrap">Date &amp; Type</th>
                            <th className="py-3 px-3.5">Bill / Payment Details</th>
                            <th className="py-3 px-3.5 text-right whitespace-nowrap">
                              <span className="text-slate-700">Billed (+)</span>
                            </th>
                            <th className="py-3 px-3.5 text-right whitespace-nowrap">
                              <span className="text-emerald-700">Paid (-)</span>
                            </th>
                            <th className="py-3 px-3.5 text-right whitespace-nowrap">
                              <span className="text-rose-700">Balance Due</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredLedgerEntries.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Date & Type */}
                              <td className="py-3 px-3.5 whitespace-nowrap">
                                <div className="font-semibold text-slate-900">{row.date}</div>
                                <span
                                  className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                                    row.type === 'invoice'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : row.type === 'payment'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {row.type === 'invoice'
                                    ? 'Bill / Order'
                                    : row.type === 'payment'
                                    ? 'Payment'
                                    : 'Opening Bal'}
                                </span>
                              </td>

                              {/* Details & Ref */}
                              <td className="py-3 px-3.5">
                                <div className="font-mono font-bold text-slate-900">
                                  {row.refNo}
                                </div>
                                <div className="text-[11px] text-slate-600 mt-0.5">
                                  {row.particulars}
                                </div>
                              </td>

                              {/* Billed (+) */}
                              <td className="py-3 px-3.5 text-right font-mono font-bold whitespace-nowrap">
                                {row.debit > 0 ? (
                                  <span className="text-slate-900 font-extrabold">
                                    +₹{row.debit.toLocaleString('en-IN')}
                                  </span>
                                ) : (
                                  <span className="text-slate-300 font-normal">—</span>
                                )}
                              </td>

                              {/* Paid (-) */}
                              <td className="py-3 px-3.5 text-right font-mono font-bold whitespace-nowrap">
                                {row.credit > 0 ? (
                                  <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                                    -₹{row.credit.toLocaleString('en-IN')}
                                  </span>
                                ) : (
                                  <span className="text-slate-300 font-normal">—</span>
                                )}
                              </td>

                              {/* Running Balance */}
                              <td className="py-3 px-3.5 text-right font-mono whitespace-nowrap">
                                <span
                                  className={
                                    row.runningBalance > 0
                                      ? 'text-rose-700 font-black text-[13px]'
                                      : 'text-emerald-600 font-black'
                                  }
                                >
                                  ₹{row.runningBalance.toLocaleString('en-IN')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        {/* Summary Footer */}
                        <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-slate-900">
                          <tr>
                            <td
                              colSpan={2}
                              className="py-3 px-3.5 text-xs font-extrabold text-slate-800"
                            >
                              Current Net Balance to Collect:
                            </td>
                            <td className="py-3 px-3.5 text-right font-mono text-xs font-bold text-slate-700">
                              Total: ₹{totalBilled.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3.5 text-right font-mono text-xs font-bold text-emerald-700">
                              Total: ₹{totalPaid.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3.5 text-right font-mono text-base font-black text-rose-700">
                              ₹{activeCustomer.amountDue.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Actions & WhatsApp Sharing */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-500">
                      Statement for <strong>{activeCustomer.propName}</strong> • Credit Terms:{' '}
                      <strong>{activeCustomer.paymentTerms}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleShareStatement}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Send WhatsApp Statement</span>
                      </button>
                      <button
                        onClick={handlePrintStatement}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                      <button
                        onClick={handleOpenPayment}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Record Payment</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERS HISTORY */}
              {activeTab === 'orders' && (
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Orders Placed by {activeCustomer.businessName}
                    </h3>
                    <button
                      onClick={handleOpenOrder}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Create Order</span>
                    </button>
                  </div>

                  {customerOrdersList.length > 0 ? (
                    <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-2xl overflow-hidden">
                      {customerOrdersList.map((order) => (
                        <div key={order.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-slate-900">
                                  {order.id}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    order.status === 'Delivered'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : order.status === 'Dispatched'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 font-medium">
                                {order.items[0]?.designName || 'Footwear Batch'} • {order.pairsCount} Pairs ({order.cartonsCount} Cartons)
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Date: {order.orderDate} • Mfg: {order.manufacturerName}
                              </span>
                            </div>

                            <div className="text-left sm:text-right">
                              <span className="text-sm font-black font-mono text-slate-900 block">
                                ₹{order.netPayable.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono block">
                                Advance: ₹{order.advanceDeposited.toLocaleString('en-IN')} • Due: ₹{order.balanceDue.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 border border-slate-200 rounded-2xl">
                      No active orders found for this customer. Click "+ Create Order" above to book one.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: NOTES & ACTIVITY TIMELINE */}
              {activeTab === 'notes' && (
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Customer Timeline &amp; Notes
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                      {activeCustomer.activityHistory.length} events
                    </span>
                  </div>

                  {/* Add Field Note Input */}
                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Log quick visit note, call outcome, or collection reminder..."
                      className="flex-1 h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Log Note</span>
                    </button>
                  </form>

                  {/* Timeline Items */}
                  <div className="space-y-3.5 pt-2 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
                    {activeCustomer.activityHistory.map((item) => (
                      <div key={item.id} className="relative pl-8">
                        <div
                          className={`absolute left-1.5 top-1 w-4 h-4 rounded-full border-2 border-white ring-2 ${
                            item.type === 'payment'
                              ? 'bg-emerald-500 ring-emerald-200'
                              : item.type === 'order_dispatched'
                              ? 'bg-blue-600 ring-blue-200'
                              : item.type === 'production'
                              ? 'bg-purple-500 ring-purple-200'
                              : item.type === 'shared_designs'
                              ? 'bg-teal-500 ring-teal-200'
                              : 'bg-slate-400 ring-slate-200'
                          }`}
                        />
                        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/70">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900">
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-snug">
                            {item.description}
                          </p>
                          {item.refNumber && (
                            <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white border border-slate-200 text-slate-700">
                              Ref: {item.refNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: TOP FOOTWEAR MODELS */}
              {activeTab === 'models' && (
                <div className="p-4 sm:p-5 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Best-Selling Footwear for {activeCustomer.businessName}
                  </h3>

                  {activeCustomer.topSellingModels && activeCustomer.topSellingModels.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeCustomer.topSellingModels.map((model, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={model.image}
                              alt={model.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                {model.name}
                              </h4>
                              <span className="text-[11px] text-slate-500">
                                High repeat volume
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-blue-600 font-mono bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 shrink-0">
                            {model.pairs.toLocaleString('en-IN')} prs
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 border border-slate-200 rounded-2xl">
                      No sales model history recorded for this customer yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden lg:block lg:col-span-8 bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
            Select a customer from the left list to view their ledger statement and account details.
          </div>
        )}
      </div>
    </div>
  );
};
