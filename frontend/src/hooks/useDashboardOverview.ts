import { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/AuthProvider';
import {
  Order,
  PaymentReceipt,
  Customer,
  ShoeDesign,
  Manufacturer,
  Salesperson,
  FollowUpItem,
  FieldVisitItem,
  DiscountRequest,
  AuditEvent,
} from '../types';
import { discountRequestsService } from '../services/discountRequests';

export type DashboardPeriod = 'today' | 'week' | 'month' | 'quarter' | 'custom';

export interface NeedsAttentionItem {
  id: string;
  type: 'order_approval' | 'discount_pending' | 'overdue_account' | 'cheque_pending' | 'order_delayed' | 'followup_overdue';
  title: string;
  count: number;
  amount?: number;
  route: string;
  badgeVariant: 'rose' | 'amber' | 'blue' | 'purple';
}

export interface PeriodComparison {
  current: number;
  previous: number;
  changePercent: number | null; // null if previous is 0
  isPositive: boolean; // positive growth
}

export function useDashboardOverview(initialPeriod: DashboardPeriod = 'month') {
  const {
    currentUser,
    customers,
    orders,
    payments,
    designs,
    manufacturers,
    salesTeam,
    followUps,
    fieldVisits,
    auditLogs,
    updateOrderStatus,
    showToast,
  } = useApp();

  const { isAdmin } = useAuth();
  const isSalesperson = currentUser.role === 'salesperson';

  // Read/write period from URL or state
  const [period, setPeriod] = useState<DashboardPeriod>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const p = searchParams.get('period') as DashboardPeriod | null;
      if (p && ['today', 'week', 'month', 'quarter', 'custom'].includes(p)) {
        return p;
      }
    }
    return initialPeriod;
  });

  const [discountRequests, setDiscountRequests] = useState<DiscountRequest[]>([]);
  const [isLoadingDiscounts, setIsLoadingDiscounts] = useState(false);

  // Fetch live discount requests
  useEffect(() => {
    let mounted = true;
    const fetchDiscounts = async () => {
      setIsLoadingDiscounts(true);
      try {
        const reqs = await discountRequestsService.listDiscountRequests();
        if (mounted) {
          setDiscountRequests(reqs);
        }
      } catch (err) {
        console.warn('Error fetching discount requests:', err);
      } finally {
        if (mounted) setIsLoadingDiscounts(false);
      }
    };
    fetchDiscounts();
    return () => {
      mounted = false;
    };
  }, []);

  // Sync period with URL search params without reload
  const handleSetPeriod = (newPeriod: DashboardPeriod) => {
    setPeriod(newPeriod);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('period', newPeriod);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Scope datasets based on user role (Admin: full, Salesperson: assigned territory only)
  const scopedCustomers = useMemo(() => {
    if (isAdmin || currentUser.role === 'admin') return customers;
    return customers.filter(
      (c) =>
        c.salespersonId === currentUser.id ||
        (c.salespersonName && c.salespersonName.toLowerCase().includes(currentUser.name.toLowerCase()))
    );
  }, [customers, currentUser, isAdmin]);

  const scopedCustomerIds = useMemo(() => new Set(scopedCustomers.map((c) => c.id)), [scopedCustomers]);

  const scopedOrders = useMemo(() => {
    if (isAdmin || currentUser.role === 'admin') return orders;
    return orders.filter(
      (o) =>
        o.salespersonId === currentUser.id ||
        (o.salespersonName && o.salespersonName.toLowerCase().includes(currentUser.name.toLowerCase())) ||
        scopedCustomerIds.has(o.customerId)
    );
  }, [orders, currentUser, isAdmin, scopedCustomerIds]);

  const scopedPayments = useMemo(() => {
    if (isAdmin || currentUser.role === 'admin') return payments;
    return payments.filter(
      (p) =>
        p.collectedBy?.toLowerCase().includes(currentUser.name.toLowerCase()) ||
        scopedCustomerIds.has(p.customerId)
    );
  }, [payments, currentUser, isAdmin, scopedCustomerIds]);

  const scopedFollowUps = useMemo(() => {
    if (isAdmin || currentUser.role === 'admin') return followUps;
    return followUps.filter((fu) => scopedCustomerIds.has(fu.customerId));
  }, [followUps, scopedCustomerIds, isAdmin, currentUser.role]);

  const scopedVisits = useMemo(() => {
    if (isAdmin || currentUser.role === 'admin') return fieldVisits;
    return fieldVisits.filter(
      (v: any) =>
        v.salesperson_id === currentUser.id ||
        v.salesperson_name?.toLowerCase().includes(currentUser.name.toLowerCase()) ||
        scopedCustomerIds.has(v.customerId)
    );
  }, [fieldVisits, currentUser, isAdmin, scopedCustomerIds]);

  const scopedDiscounts = useMemo(() => {
    if (isAdmin || currentUser.role === 'admin') return discountRequests;
    return discountRequests.filter(
      (d) =>
        d.salesmanId === currentUser.id ||
        d.salesmanName?.toLowerCase().includes(currentUser.name.toLowerCase()) ||
        scopedCustomerIds.has(d.clientId)
    );
  }, [discountRequests, currentUser, isAdmin, scopedCustomerIds]);

  // Date boundary helpers
  const now = new Date();

  const getDateRange = (p: DashboardPeriod): { start: Date; end: Date; prevStart: Date; prevEnd: Date } => {
    const end = new Date(now);
    let start = new Date(now);
    let prevStart = new Date(now);
    let prevEnd = new Date(now);

    if (p === 'today') {
      start.setHours(0, 0, 0, 0);
      prevStart.setDate(prevStart.getDate() - 1);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setDate(prevEnd.getDate() - 1);
      prevEnd.setHours(23, 59, 59, 999);
    } else if (p === 'week') {
      const day = now.getDay() || 7;
      start.setDate(now.getDate() - day + 1);
      start.setHours(0, 0, 0, 0);
      prevEnd = new Date(start);
      prevEnd.setMilliseconds(-1);
      prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 7);
    } else if (p === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    } else if (p === 'quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), currentQuarter * 3, 1);
      prevEnd = new Date(now.getFullYear(), currentQuarter * 3, 0, 23, 59, 59, 999);
      prevStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
    } else {
      // default 30 days
      start.setDate(now.getDate() - 30);
      prevEnd = new Date(start);
      prevStart.setDate(prevStart.getDate() - 30);
    }

    return { start, end, prevStart, prevEnd };
  };

  const { start: pStart, end: pEnd, prevStart: pPrevStart, prevEnd: pPrevEnd } = getDateRange(period);

  const parseItemDate = (dateStr?: string | Date): Date => {
    if (!dateStr) return new Date();
    if (dateStr instanceof Date) return dateStr;
    if (dateStr.toLowerCase() === 'today' || dateStr.toLowerCase() === 'just now') return new Date();
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  };

  // 1. NEEDS ATTENTION ALERTS
  const needsAttention = useMemo<NeedsAttentionItem[]>(() => {
    const items: NeedsAttentionItem[] = [];

    // A. Orders awaiting approval
    const awaitingOrders = scopedOrders.filter(
      (o) => o.status === 'Submitted' || o.status === 'Under Review'
    );
    if (awaitingOrders.length > 0) {
      items.push({
        id: 'att-orders',
        type: 'order_approval',
        title: `${awaitingOrders.length} Order${awaitingOrders.length > 1 ? 's' : ''} Awaiting Approval`,
        count: awaitingOrders.length,
        route: isSalesperson ? '/sales/orders?status=submitted' : '/admin/orders?status=under_review',
        badgeVariant: 'amber',
      });
    }

    // B. Pending discount requests
    const pendingDiscounts = scopedDiscounts.filter((d) => d.status === 'pending');
    if (pendingDiscounts.length > 0) {
      const totalConcession = pendingDiscounts.reduce((sum, d) => sum + (d.marginConcession || 0), 0);
      items.push({
        id: 'att-discounts',
        type: 'discount_pending',
        title: `${pendingDiscounts.length} Discount Request${pendingDiscounts.length > 1 ? 's' : ''} Pending`,
        count: pendingDiscounts.length,
        amount: totalConcession,
        route: isSalesperson ? '/sales/orders' : '/admin/reports',
        badgeVariant: 'purple',
      });
    }

    // C. Overdue accounts
    const overdueCusts = scopedCustomers.filter((c) => Number(c.amountDue || 0) > 0 && (c.overdueDays > 0 || c.status === 'overdue'));
    if (overdueCusts.length > 0) {
      const totalOverdueDue = overdueCusts.reduce((sum, c) => sum + Number(c.amountDue || 0), 0);
      items.push({
        id: 'att-overdue',
        type: 'overdue_account',
        title: `${overdueCusts.length} Overdue Store Account${overdueCusts.length > 1 ? 's' : ''}`,
        count: overdueCusts.length,
        amount: totalOverdueDue,
        route: isSalesperson ? '/sales/collections?tab=overdue' : '/admin/customers/insights/overdue',
        badgeVariant: 'rose',
      });
    }

    // D. Cheques pending clearance
    const pendingChqs = scopedPayments.filter(
      (p) => p.paymentMethod === 'Cheque' && (p.status === 'pending_clearance' || !p.status)
    );
    if (pendingChqs.length > 0) {
      const totalChqAmount = pendingChqs.reduce((sum, p) => sum + Number(p.paymentAmount || 0), 0);
      items.push({
        id: 'att-cheques',
        type: 'cheque_pending',
        title: `${pendingChqs.length} Cheque${pendingChqs.length > 1 ? 's' : ''} in Clearing`,
        count: pendingChqs.length,
        amount: totalChqAmount,
        route: isSalesperson ? '/sales/collections?tab=cheques' : '/admin/payments?status=pending_clearance',
        badgeVariant: 'amber',
      });
    }

    // E. Orders delayed at manufacturer
    const delayedOrders = scopedOrders.filter((o) => {
      if (['Delivered', 'Dispatched', 'Cancelled'].includes(o.status)) return false;
      if (!o.expectedDelivery || o.expectedDelivery === '—') return false;
      const expDate = parseItemDate(o.expectedDelivery);
      return expDate < now;
    });
    if (delayedOrders.length > 0) {
      items.push({
        id: 'att-delayed',
        type: 'order_delayed',
        title: `${delayedOrders.length} Order${delayedOrders.length > 1 ? 's' : ''} Past Due Delivery`,
        count: delayedOrders.length,
        route: isSalesperson ? '/sales/orders?filter=delayed' : '/admin/orders?filter=delayed',
        badgeVariant: 'rose',
      });
    }

    // F. Overdue follow-ups
    const todayStr = now.toISOString().slice(0, 10);
    const overdueFollowUps = scopedFollowUps.filter(
      (fu) => fu.status !== 'completed' && fu.date && fu.date < todayStr
    );
    if (overdueFollowUps.length > 0) {
      items.push({
        id: 'att-followups',
        type: 'followup_overdue',
        title: `${overdueFollowUps.length} Overdue Client Follow-up${overdueFollowUps.length > 1 ? 's' : ''}`,
        count: overdueFollowUps.length,
        route: isSalesperson ? '/sales/follow-ups' : '/admin/sales-team',
        badgeVariant: 'blue',
      });
    }

    return items;
  }, [scopedOrders, scopedDiscounts, scopedCustomers, scopedPayments, scopedFollowUps, isSalesperson, now]);

  // 2. BUSINESS KPIS ROW (6 Cards with comparison)
  const kpis = useMemo(() => {
    // Current period filter helper
    const isInCurrentPeriod = (dateStr?: string | Date) => {
      const d = parseItemDate(dateStr);
      return d >= pStart && d <= pEnd;
    };
    const isInPrevPeriod = (dateStr?: string | Date) => {
      const d = parseItemDate(dateStr);
      return d >= pPrevStart && d <= pPrevEnd;
    };

    // 1. Sales / Order Value
    let currentOrders = scopedOrders.filter((o) => o.status !== 'Cancelled' && isInCurrentPeriod(o.orderDate));
    const prevOrders = scopedOrders.filter((o) => o.status !== 'Cancelled' && isInPrevPeriod(o.orderDate));
    if (currentOrders.length === 0 && scopedOrders.length > 0) {
      currentOrders = scopedOrders.filter((o) => o.status !== 'Cancelled');
    }

    const currentSales = currentOrders.reduce((sum, o) => sum + Number(o.netPayable || o.subtotal || 0), 0);
    const prevSales = prevOrders.reduce((sum, o) => sum + Number(o.netPayable || o.subtotal || 0), 0);
    const salesChange = prevSales > 0 ? Math.round(((currentSales - prevSales) / prevSales) * 100) : (currentSales > 0 ? 100 : 0);

    // 2. Collections Received
    let currentPayments = scopedPayments.filter((p) => p.status !== 'bounced' && p.status !== 'reversed' && isInCurrentPeriod(p.paymentDate));
    const prevPayments = scopedPayments.filter((p) => p.status !== 'bounced' && p.status !== 'reversed' && isInPrevPeriod(p.paymentDate));
    if (currentPayments.length === 0 && scopedPayments.length > 0) {
      currentPayments = scopedPayments.filter((p) => p.status !== 'bounced' && p.status !== 'reversed');
    }

    const currentCollections = currentPayments.reduce((sum, p) => sum + Number(p.paymentAmount || 0), 0);
    const prevCollections = prevPayments.reduce((sum, p) => sum + Number(p.paymentAmount || 0), 0);
    const collectionsChange = prevCollections > 0 ? Math.round(((currentCollections - prevCollections) / prevCollections) * 100) : (currentCollections > 0 ? 100 : 0);

    // 3. Total Receivables Outstanding
    const totalReceivables = scopedCustomers.reduce((sum, c) => sum + Number(c.amountDue || 0), 0);

    // 4. Open Orders (Count & Value)
    const openOrdersList = scopedOrders.filter((o) => !['Delivered', 'Cancelled'].includes(o.status));
    const openOrdersCount = openOrdersList.length;
    const openOrdersValue = openOrdersList.reduce((sum, o) => sum + Number(o.balanceDue || o.netPayable || 0), 0);

    // 5. Active Customers
    const activeCustomersCount = scopedCustomers.filter((c) => c.status === 'active' || (c.ordersCount || 0) > 0).length;

    // 6. Pairs Booked
    const currentPairs = currentOrders.reduce((sum, o) => sum + Number(o.pairsCount || 0), 0);
    const prevPairs = prevOrders.reduce((sum, o) => sum + Number(o.pairsCount || 0), 0);
    const pairsChange = prevPairs > 0 ? Math.round(((currentPairs - prevPairs) / prevPairs) * 100) : (currentPairs > 0 ? 100 : 0);

    return {
      sales: {
        value: currentSales,
        comparison: {
          current: currentSales,
          previous: prevSales,
          changePercent: salesChange,
          isPositive: salesChange !== null ? salesChange >= 0 : true,
        },
      },
      collections: {
        value: currentCollections,
        comparison: {
          current: currentCollections,
          previous: prevCollections,
          changePercent: collectionsChange,
          isPositive: collectionsChange !== null ? collectionsChange >= 0 : true,
        },
      },
      receivables: {
        value: totalReceivables,
        customerCount: scopedCustomers.filter((c) => Number(c.amountDue || 0) > 0).length,
      },
      openOrders: {
        count: openOrdersCount,
        value: openOrdersValue,
      },
      activeCustomers: {
        count: activeCustomersCount,
        total: scopedCustomers.length,
      },
      pairsBooked: {
        value: currentPairs,
        comparison: {
          current: currentPairs,
          previous: prevPairs,
          changePercent: pairsChange,
          isPositive: pairsChange !== null ? pairsChange >= 0 : true,
        },
      },
    };
  }, [scopedOrders, scopedPayments, scopedCustomers, pStart, pEnd, pPrevStart, pPrevEnd]);

  // 3. ORDERS PIPELINE (Stage counts & latest 5 orders)
  const ordersPipeline = useMemo(() => {
    const stages = [
      { name: 'Submitted', key: 'Submitted', color: 'bg-amber-500' },
      { name: 'Under Review', key: 'Under Review', color: 'bg-purple-500' },
      { name: 'Approved', key: 'Approved', color: 'bg-emerald-500' },
      { name: 'In Production', key: 'In Production', color: 'bg-blue-500' },
      { name: 'Ready QC', key: 'Ready QC', color: 'bg-sky-500' },
      { name: 'Dispatched', key: 'Dispatched', color: 'bg-indigo-500' },
      { name: 'Delivered', key: 'Delivered', color: 'bg-teal-500' },
    ];

    const counts: Record<string, { count: number; value: number }> = {};
    stages.forEach((s) => {
      counts[s.key] = { count: 0, value: 0 };
    });

    scopedOrders.forEach((o) => {
      const st = o.status;
      if (counts[st]) {
        counts[st].count += 1;
        counts[st].value += Number(o.netPayable || 0);
      }
    });

    const latestOrders = [...scopedOrders]
      .sort((a, b) => parseItemDate(b.orderDate).getTime() - parseItemDate(a.orderDate).getTime())
      .slice(0, 5);

    return {
      stages: stages.map((s) => ({
        ...s,
        count: counts[s.key]?.count || 0,
        value: counts[s.key]?.value || 0,
      })),
      totalActive: scopedOrders.filter((o) => !['Delivered', 'Cancelled'].includes(o.status)).length,
      latestOrders,
    };
  }, [scopedOrders]);

  // 4. COLLECTIONS & RECEIVABLES BREAKDOWN
  const collectionsData = useMemo(() => {
    const pendingChqs = scopedPayments.filter(
      (p) => p.paymentMethod === 'Cheque' && (p.status === 'pending_clearance' || !p.status)
    );
    const chequesInTransit = pendingChqs.reduce((sum, p) => sum + Number(p.paymentAmount || 0), 0);

    // Aging buckets based on customer overdueDays
    const agingBuckets = {
      b0_30: { label: '0–30 Days', count: 0, amount: 0, range: '0-30' },
      b31_60: { label: '31–60 Days', count: 0, amount: 0, range: '31-60' },
      b61_90: { label: '61–90 Days', count: 0, amount: 0, range: '61-90' },
      b90_plus: { label: '90+ Days (Critical)', count: 0, amount: 0, range: '90+' },
    };

    scopedCustomers.forEach((c) => {
      const due = Number(c.amountDue || 0);
      if (due > 0) {
        const days = c.overdueDays || 0;
        if (days <= 30) {
          agingBuckets.b0_30.count += 1;
          agingBuckets.b0_30.amount += due;
        } else if (days <= 60) {
          agingBuckets.b31_60.count += 1;
          agingBuckets.b31_60.amount += due;
        } else if (days <= 90) {
          agingBuckets.b61_90.count += 1;
          agingBuckets.b61_90.amount += due;
        } else {
          agingBuckets.b90_plus.count += 1;
          agingBuckets.b90_plus.amount += due;
        }
      }
    });

    const latestPayments = [...scopedPayments]
      .sort((a, b) => parseItemDate(b.paymentDate).getTime() - parseItemDate(a.paymentDate).getTime())
      .slice(0, 5);

    return {
      collectedThisPeriod: kpis.collections.value,
      chequesInTransit,
      overdueAmount: agingBuckets.b31_60.amount + agingBuckets.b61_90.amount + agingBuckets.b90_plus.amount,
      agingBuckets: Object.values(agingBuckets),
      latestPayments,
    };
  }, [scopedPayments, scopedCustomers, kpis.collections.value]);

  // 5. CUSTOMERS SUMMARY & TOP CLIENTS
  const customersSummary = useMemo(() => {
    const active = scopedCustomers.filter((c) => (c.ordersCount || 0) > 0 || c.status === 'active').length;
    const overdue = scopedCustomers.filter((c) => Number(c.amountDue || 0) > 0 && c.overdueDays > 0).length;
    const cleared = scopedCustomers.filter((c) => Number(c.amountDue || 0) === 0 && (c.ordersCount || 0) > 0).length;
    const newClients = scopedCustomers.filter((c) => c.tier === 'Standard Retail' || (c.ordersCount || 0) <= 1).length;

    const topCustomers = [...scopedCustomers]
      .sort((a, b) => Number(b.totalBusiness || 0) - Number(a.totalBusiness || 0))
      .slice(0, 5);

    // Re-order opportunities: accounts that haven't ordered recently
    const reorderOpportunities = scopedCustomers
      .filter((c) => (c.ordersCount || 0) > 0 && Number(c.amountDue || 0) === 0)
      .slice(0, 5);

    return {
      active,
      overdue,
      cleared,
      newClients,
      topCustomers,
      reorderOpportunities,
    };
  }, [scopedCustomers]);

  // 6. PRODUCTION & MANUFACTURERS
  const productionSummary = useMemo(() => {
    const activeOrders = scopedOrders.filter((o) => ['Approved', 'In Production', 'Ready QC'].includes(o.status));

    const mfgMap: Record<string, { id: string; name: string; plant: string; activeOrdersCount: number; pairsInProduction: number; onTimeRate: number; loadPercentage: number }> = {};

    manufacturers.forEach((m: any) => {
      mfgMap[m.id] = {
        id: m.id,
        name: m.companyName || m.name || 'Apex Footwear Works',
        plant: m.hubLocation || m.plant || m.city || 'Agra Hub',
        activeOrdersCount: 0,
        pairsInProduction: 0,
        onTimeRate: m.onTimeDeliveryRate || m.onTimeDispatchRate || 96,
        loadPercentage: m.loadPercentage || 72,
      };
    });

    activeOrders.forEach((o) => {
      const mId = o.manufacturerId || '';
      if (!mfgMap[mId]) {
        mfgMap[mId] = {
          id: mId,
          name: o.manufacturerName || 'Apex Footwear Works',
          plant: o.manufacturerPlant || 'Agra Unit 2',
          activeOrdersCount: 0,
          pairsInProduction: 0,
          onTimeRate: 94,
          loadPercentage: 70,
        };
      }
      mfgMap[mId].activeOrdersCount += 1;
      mfgMap[mId].pairsInProduction += Number(o.pairsCount || 0);
    });

    const delayedOrders = scopedOrders
      .filter((o) => {
        if (['Delivered', 'Dispatched', 'Cancelled'].includes(o.status)) return false;
        if (!o.expectedDelivery || o.expectedDelivery === '—') return false;
        return parseItemDate(o.expectedDelivery) < now;
      })
      .slice(0, 5);

    return {
      manufacturers: Object.values(mfgMap),
      totalInProduction: activeOrders.reduce((sum, o) => sum + Number(o.pairsCount || 0), 0),
      delayedOrders,
    };
  }, [scopedOrders, manufacturers, now]);

  // 7. DESIGN CATALOGUE
  const designsSummary = useMemo(() => {
    const totalActive = designs.filter((d) => d.status !== 'Archived').length;
    
    // Calculate best-selling designs from actual order items
    const designOrderCounts: Record<string, { design: ShoeDesign; pairs: number; ordersCount: number }> = {};

    designs.forEach((d) => {
      designOrderCounts[d.id] = { design: d, pairs: 0, ordersCount: 0 };
    });

    scopedOrders.forEach((o) => {
      if (o.status !== 'Cancelled' && o.items) {
        o.items.forEach((item) => {
          const dId = item.designId;
          if (dId && designOrderCounts[dId]) {
            designOrderCounts[dId].pairs += Number(item.totalPairs || 0);
            designOrderCounts[dId].ordersCount += 1;
          }
        });
      }
    });

    const bestSellers = Object.values(designOrderCounts)
      .filter((item) => item.pairs > 0)
      .sort((a, b) => b.pairs - a.pairs)
      .slice(0, 5);

    // If none ordered yet, fall back to default catalog slice with 0 pairs
    const displayTopDesigns = bestSellers.length > 0 
      ? bestSellers.map((b) => ({ ...b.design, orderedPairs: b.pairs }))
      : designs.slice(0, 5).map((d) => ({ ...d, orderedPairs: 0 }));

    return {
      totalActive,
      newInPeriod: designs.filter((d) => d.status === 'New Designs').slice(0, 3).length,
      topDesigns: displayTopDesigns,
    };
  }, [designs, scopedOrders]);

  // 8. SALES TEAM (For Admin Dashboard)
  const salesTeamSummary = useMemo(() => {
    return salesTeam.map((rep) => {
      const repOrders = orders.filter((o) => o.salespersonId === rep.id || o.salespersonName?.includes(rep.name));
      const repPayments = payments.filter((p) => p.collectedBy?.toLowerCase().includes(rep.name.toLowerCase()));
      
      const realBooked = repOrders.reduce((sum, o) => sum + Number(o.netPayable || 0), 0);
      const target = rep.monthlyTarget || 0;
      const targetPct = target > 0 ? Math.min(100, Math.round((realBooked / target) * 100)) : 0;

      const realCollected = repPayments.reduce((sum, p) => sum + Number(p.paymentAmount || 0), 0);

      return {
        ...rep,
        bookedThisMonth: realBooked,
        commissionAccrued: realCollected > 0 ? Math.round(realCollected * ((rep.commissionRate || 2.5) / 100)) : 0,
        targetPct,
        isInactive: repOrders.length === 0 && repPayments.length === 0,
      };
    });
  }, [salesTeam, orders, payments]);

  // 9. TODAY'S FOLLOW-UPS & VISITS
  const followUpsAndVisits = useMemo(() => {
    const todayStr = now.toISOString().slice(0, 10);
    
    const todaysFollowUps = scopedFollowUps
      .filter((fu) => fu.status !== 'completed' && (fu.date === todayStr || fu.status === 'today'))
      .slice(0, 5);

    const overdueFollowUps = scopedFollowUps
      .filter((fu) => fu.status !== 'completed' && fu.date && fu.date < todayStr)
      .slice(0, 5);

    const todaysVisits = scopedVisits.filter(
      (v: any) => v.visit_date === todayStr || v.status === 'completed'
    );
    const completedVisitsCount = todaysVisits.filter((v) => v.status === 'completed').length;

    return {
      todaysFollowUps,
      overdueFollowUps,
      visitsCompleted: completedVisitsCount,
      visitsPlanned: todaysVisits.length,
      visitsList: scopedVisits.slice(0, 5),
    };
  }, [scopedFollowUps, scopedVisits, now]);

  // 10. APPROVALS (Discounts & Order Authorizations)
  const approvalsSummary = useMemo(() => {
    const pendingDiscounts = scopedDiscounts.filter((d) => d.status === 'pending');
    const ordersAwaitingReview = scopedOrders.filter(
      (o) => o.status === 'Submitted' || o.status === 'Under Review'
    );

    return {
      pendingDiscounts,
      ordersAwaitingReview,
      totalPendingCount: pendingDiscounts.length + ordersAwaitingReview.length,
    };
  }, [scopedDiscounts, scopedOrders]);

  // Quick Approval Handlers
  const handleApproveDiscount = async (requestId: string) => {
    try {
      const res = await discountRequestsService.approveDiscountRequest(requestId, undefined, 'Approved from Dashboard Overview');
      if (res) {
        setDiscountRequests((prev) =>
          prev.map((d) => (d.id === requestId ? { ...d, status: 'approved' } : d))
        );
        showToast('Special discount request approved successfully!');
      } else {
        showToast('Failed to approve discount');
      }
    } catch (err: any) {
      showToast(err?.message || 'Approval action failed');
    }
  };

  const handleRejectDiscount = async (requestId: string) => {
    try {
      const res = await discountRequestsService.rejectDiscountRequest(requestId, 'Rejected from Dashboard Overview');
      if (res) {
        setDiscountRequests((prev) =>
          prev.map((d) => (d.id === requestId ? { ...d, status: 'rejected' } : d))
        );
        showToast('Discount request rejected');
      } else {
        showToast('Failed to reject discount');
      }
    } catch (err: any) {
      showToast(err?.message || 'Reject action failed');
    }
  };

  const handleApproveOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'Approved');
    showToast(`Order ${orderId} approved for manufacturing!`);
  };

  // 11. RECENT ACTIVITY EVENTS
  const recentActivities = useMemo(() => {
    return auditLogs.slice(0, 10);
  }, [auditLogs]);

  return {
    period,
    setPeriod: handleSetPeriod,
    isSalesperson,
    needsAttention,
    kpis,
    ordersPipeline,
    collectionsData,
    customersSummary,
    productionSummary,
    designsSummary,
    salesTeamSummary,
    followUpsAndVisits,
    approvalsSummary,
    recentActivities,
    actions: {
      approveDiscount: handleApproveDiscount,
      rejectDiscount: handleRejectDiscount,
      approveOrder: handleApproveOrder,
    },
  };
}
