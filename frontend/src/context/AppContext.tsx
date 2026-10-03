import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Customer,
  ShoeDesign,
  Order,
  Manufacturer,
  Salesperson,
  NotificationItem,
  FollowUpItem,
  FieldVisitItem,
  PaymentReceipt,
  AuditEvent,
  DesignShareRecord,
} from '../types';
import {
  MOCK_USERS,
  MOCK_CUSTOMERS,
  MOCK_DESIGNS,
  MOCK_ORDERS,
  MOCK_MANUFACTURERS,
  MOCK_SALES_TEAM,
  MOCK_NOTIFICATIONS,
  MOCK_FOLLOWUPS,
  MOCK_FIELD_VISITS,
  MOCK_AUDIT_LOGS,
  MOCK_DESIGN_SHARES,
} from '../data/mockData';
import { supabaseApi, isSupabaseConfigured } from '../lib/supabase';
import { paymentsService } from '../services/payments';
import { visitsService } from '../services/visits';
import { followUpsService } from '../services/followUps';
import { designsService } from '../services/designs';
import { useAuth } from '../auth/AuthProvider';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role?: UserRole) => void;
  isLoggedIn: boolean;
  login: (email: string, pass: string) => boolean;
  register: (userData: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    businessName?: string;
    phone?: string;
    zone?: string;
  }) => boolean;
  logout: () => void;
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (cust: Customer | null) => void;
  addCustomer: (cust: Partial<Customer>) => void;
  designs: ShoeDesign[];
  setDesigns: React.Dispatch<React.SetStateAction<ShoeDesign[]>>;
  refreshDesigns: () => Promise<void>;
  selectedDesignIds: string[];
  toggleSelectDesign: (id: string) => void;
  clearSelectedDesigns: () => void;
  orders: Order[];
  createOrder: (order: Partial<Order>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  manufacturers: Manufacturer[];
  salesTeam: Salesperson[];
  toggleSalesTask: (salespersonId: string, taskId: string) => void;
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  followUps: FollowUpItem[];
  addFollowUp: (item: Partial<FollowUpItem>) => void;
  completeFollowUp: (id: string) => void;
  fieldVisits: FieldVisitItem[];
  addFieldVisit: (item: Partial<FieldVisitItem>) => void;
  completeFieldVisit: (id: string, outcome: FieldVisitItem['outcome'], notes: string) => void;
  payments: PaymentReceipt[];
  recordPayment: (payment: Partial<PaymentReceipt>) => void;
  // Audit Logs & Traceability
  auditLogs: AuditEvent[];
  addAuditEvent: (event: Partial<AuditEvent>) => void;
  // Design Shares
  designShares: DesignShareRecord[];
  recordDesignShare: (share: Partial<DesignShareRecord>) => void;
  // Interactive Demonstration Walkthrough Mode
  isWalkthroughOpen: boolean;
  setIsWalkthroughOpen: (open: boolean) => void;
  walkthroughStep: number;
  setWalkthroughStep: React.Dispatch<React.SetStateAction<number>>;
  // Modals
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  isCreateOrderModalOpen: boolean;
  setIsCreateOrderModalOpen: (open: boolean) => void;
  isAddCustomerModalOpen: boolean;
  setIsAddCustomerModalOpen: (open: boolean) => void;
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;
  // Sidebar state
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMobileSidebar: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  themePreference: 'light' | 'dark' | 'system';
  setThemePreference: (pref: 'light' | 'dark' | 'system') => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isSupabaseActive: boolean;
}

export type ThemePreference = 'light' | 'dark' | 'system';

const AppContext = createContext<AppContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'soleflow_auth_session';
const THEME_PREF_STORAGE_KEY = 'soleflow_theme';
const OLD_DARK_STORAGE_KEY = 'soleflow_dark_mode';

const getInitialThemePreference = (): ThemePreference => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_PREF_STORAGE_KEY) as ThemePreference | null;
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
        return stored;
      }
      // Migrate old soleflow_dark_mode value once ('true' -> 'dark', otherwise 'light')
      const oldDark = localStorage.getItem(OLD_DARK_STORAGE_KEY);
      if (oldDark === 'true') {
        localStorage.setItem(THEME_PREF_STORAGE_KEY, 'dark');
        return 'dark';
      } else if (oldDark === 'false') {
        localStorage.setItem(THEME_PREF_STORAGE_KEY, 'light');
        return 'light';
      }
    }
  } catch (e) {
    console.error('Failed to read theme preference:', e);
  }
  return 'light';
};

const getInitialAuth = (): { isLoggedIn: boolean; user: User } => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data && data.isLoggedIn) {
          if (data.user) {
            return { isLoggedIn: true, user: data.user };
          }
          const role = data.role || 'admin';
          const user = role === 'salesperson' ? MOCK_USERS.salesperson : MOCK_USERS.admin;
          return { isLoggedIn: true, user };
        }
      }
    }
  } catch (e) {
    console.error('Failed to load saved session:', e);
  }
  // Default to false so any shared link (e.g. on Netlify) requires login
  return { isLoggedIn: false, user: MOCK_USERS.admin };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialAuth = getInitialAuth();
  const [currentUser, setCurrentUser] = useState<User>(initialAuth.user);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(initialAuth.isLoggedIn);
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(getInitialThemePreference);
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Listen to OS prefers-color-scheme changes live
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDarkMode = themePreference === 'dark' || (themePreference === 'system' && systemPrefersDark);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDarkMode);
      document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';
    }
  }, [isDarkMode]);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(MOCK_CUSTOMERS[0]);
  const [designs, setDesigns] = useState<ShoeDesign[]>(MOCK_DESIGNS);
  const [selectedDesignIds, setSelectedDesignIds] = useState<string[]>(['sf-1024', 'sf-884', 'sf-512']);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>(MOCK_MANUFACTURERS);
  const [salesTeam, setSalesTeam] = useState<Salesperson[]>(MOCK_SALES_TEAM);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>(MOCK_FOLLOWUPS);
  const [fieldVisits, setFieldVisits] = useState<FieldVisitItem[]>(MOCK_FIELD_VISITS);
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(MOCK_AUDIT_LOGS);
  const [designShares, setDesignShares] = useState<DesignShareRecord[]>(MOCK_DESIGN_SHARES);

  const isSupabaseActive = isSupabaseConfigured();

  // Hydrate from live Supabase database if configured
  useEffect(() => {
    if (isSupabaseActive) {
      supabaseApi.getCustomers().then((data) => {
        if (data && data.length > 0) {
          setCustomers(data);
          setSelectedCustomer(data[0]);
        }
      });
      designsService.fetchDesigns().then((data) => {
        if (data) setDesigns(data);
      }).catch((err) => {
        console.warn('Initial designs fetch error:', err);
      });
      supabaseApi.getOrders().then((data) => {
        if (data && data.length > 0) setOrders(data);
      });
      supabaseApi.getPayments().then((data) => {
        if (data && data.length > 0) setPayments(data);
      });
      supabaseApi.getAuditLogs().then((data) => {
        if (data && data.length > 0) setAuditLogs(data);
      });
      supabaseApi.getDesignShares().then((data) => {
        if (data && data.length > 0) setDesignShares(data);
      });
      supabaseApi.getManufacturers().then((data) => {
        if (data && data.length > 0) setManufacturers(data);
      });
      supabaseApi.getSalesTeam().then((data) => {
        if (data && data.length > 0) setSalesTeam(data);
      });
    }
  }, [isSupabaseActive]);

  const refreshDesigns = async () => {
    try {
      const live = await designsService.fetchDesigns();
      if (live) {
        setDesigns(live);
      }
    } catch (e) {
      console.warn('Failed to refresh designs:', e);
    }
  };

  // Interactive Demonstration Walkthrough State
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  const addAuditEvent = (eventData: Partial<AuditEvent>) => {
    const newEvent: AuditEvent = {
      id: `aud-${Date.now()}`,
      actor: eventData.actor || currentUser.name,
      actorRole: eventData.actorRole || (currentUser.role === 'admin' ? 'Trader / Admin' : 'Field Sales Rep'),
      action: eventData.action || 'System Update',
      recordType: eventData.recordType || 'Client',
      recordId: eventData.recordId || 'REF-001',
      recordTitle: eventData.recordTitle || 'Record Updated',
      oldValue: eventData.oldValue,
      newValue: eventData.newValue || 'Updated',
      timestamp: 'Just now',
      source: eventData.source || 'Web App',
    };
    setAuditLogs((prev) => [newEvent, ...prev]);
    if (isSupabaseActive) {
      supabaseApi.insertAuditLog(newEvent);
    }
  };

  const recordDesignShare = (shareData: Partial<DesignShareRecord>) => {
    const newShare: DesignShareRecord = {
      id: `dshare-${Date.now()}`,
      sharedBy: shareData.sharedBy || currentUser.name,
      sharedByRole: shareData.sharedByRole || (currentUser.role === 'admin' ? 'Trader / Admin' : 'Field Sales Rep'),
      targetClientId: shareData.targetClientId || (customers[0]?.id || 'cust-1'),
      targetClientName: shareData.targetClientName || (customers[0]?.businessName || 'Wholesale Client'),
      targetPhone: shareData.targetPhone || (customers[0]?.phone || '+91 98000 00000'),
      designsCount: shareData.designsCount || (shareData.designIds?.length || 1),
      designIds: shareData.designIds || ['sf-1024'],
      designNames: shareData.designNames || ['Runner Classic'],
      timestamp: 'Just now',
      channel: shareData.channel || 'WhatsApp',
      wasViewed: false,
      viewCount: 0,
      wasOrdered: false,
    };
    setDesignShares((prev) => [newShare, ...prev]);
    if (isSupabaseActive) {
      supabaseApi.insertDesignShare(newShare);
    }
    addAuditEvent({
      action: `Shared ${newShare.designsCount} Shoe Designs`,
      recordType: 'Design',
      recordId: newShare.id,
      recordTitle: `${newShare.targetClientName} (${newShare.channel})`,
      newValue: `Shared via ${newShare.channel} to ${newShare.targetPhone}`,
    });
  };

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sidebar collapse & mobile state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const setThemePreference = (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    try {
      localStorage.setItem(THEME_PREF_STORAGE_KEY, pref);
      const willBeDark = pref === 'dark' || (pref === 'system' && systemPrefersDark);
      localStorage.setItem(OLD_DARK_STORAGE_KEY, String(willBeDark));
    } catch (e) {
      console.error('Failed to save theme preference:', e);
    }
  };

  const toggleDarkMode = () => {
    const nextPref: ThemePreference = isDarkMode ? 'light' : 'dark';
    setThemePreference(nextPref);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const auth = useAuth();

  const switchRole = (role?: UserRole) => {
    const targetRole: UserRole = role || (currentUser.role === 'admin' ? 'salesperson' : 'admin');
    const user = targetRole === 'admin' ? MOCK_USERS.admin : MOCK_USERS.salesperson;
    setCurrentUser(user);
    setIsMobileSidebarOpen(false);
    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ isLoggedIn: true, role: user.role, email: user.email, user })
      );
    } catch (e) {
      console.error('Failed to update session:', e);
    }
    try {
      auth?.switchDemoRole(targetRole);
    } catch (e) {
      // ignore
    }
    if (targetRole === 'admin') {
      showToast('Switched to Trader / Admin Mode (Full Business Visibility)');
    } else {
      showToast('Switched to Salesperson Portal (Rahul Sharma • North Zone)');
    }
  };

  const login = (email: string, pass: string): boolean => {
    let user = MOCK_USERS.admin;
    if (email === 'admin@soleflow.com' && pass === 'admin123') {
      user = MOCK_USERS.admin;
    } else if (email === 'sales@soleflow.com' && pass === 'sales123') {
      user = MOCK_USERS.salesperson;
    } else if (email.includes('sales')) {
      user = MOCK_USERS.salesperson;
    } else {
      user = MOCK_USERS.admin;
    }

    setIsMobileSidebarOpen(false);
    setCurrentUser(user);
    setIsLoggedIn(true);
    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ isLoggedIn: true, role: user.role, email: user.email })
      );
    } catch (e) {
      console.error('Failed to save session:', e);
    }
    showToast(`Welcome back, ${user.name}`);
    return true;
  };

  const register = (userData: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    businessName?: string;
    phone?: string;
    zone?: string;
  }): boolean => {
    const initials =
      userData.name
        .trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || (userData.role === 'admin' ? 'SF' : 'SR');

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      role: userData.role,
      avatar:
        userData.role === 'admin'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      initials: initials,
      roleLabel:
        userData.role === 'admin'
          ? `${userData.businessName || 'SoleFlow Footwear Hub'} • Trader Admin`
          : `${userData.zone || 'North Zone'} • Field Sales Specialist`,
      phone: userData.phone || '+91 98765 43210',
      zone: userData.zone || (userData.role === 'admin' ? 'Delhi-NCR Hub' : 'North Zone'),
    };

    setIsMobileSidebarOpen(false);
    setCurrentUser(newUser);
    setIsLoggedIn(true);

    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ isLoggedIn: true, role: newUser.role, email: newUser.email, user: newUser })
      );
    } catch (e) {
      console.error('Failed to save session:', e);
    }

    showToast(`Account created! Welcome to SoleFlow, ${newUser.name}`);
    return true;
  };

  const logout = () => {
    setIsMobileSidebarOpen(false);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
    setIsLoggedIn(false);
    window.location.hash = '#login';
    showToast('Signed out of SoleFlow');
  };

  const toggleSelectDesign = (id: string) => {
    setSelectedDesignIds((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  const clearSelectedDesigns = () => {
    setSelectedDesignIds([]);
  };

  const addCustomer = (custData: Partial<Customer>) => {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      businessName: custData.businessName || 'New Wholesale Store',
      propName: custData.propName || 'Proprietor',
      phone: custData.phone || '+91 98000 00000',
      whatsapp: custData.whatsapp || '+91 98000 00000',
      email: custData.email || 'retail@store.com',
      city: custData.city || 'Agra',
      state: custData.state || 'Uttar Pradesh',
      cluster: custData.cluster || 'Agra Footwear Cluster',
      address: custData.address || 'Central Market',
      gstin: custData.gstin || '09AAAAA0000A1Z5',
      salespersonId: currentUser.id,
      salespersonName: currentUser.name,
      paymentTerms: custData.paymentTerms || '30% Advance + 70% Bilty',
      creditLimit: custData.creditLimit || 500000,
      totalBusiness: 0,
      totalPaid: 0,
      amountDue: 0,
      overdueDays: 0,
      status: 'active',
      ordersCount: 0,
      lastOrderDate: 'Never',
      lastPaymentDate: 'None',
      lastPaymentAmount: 0,
      tier: 'Standard Retail',
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          type: 'note',
          title: 'Account Registered on SoleFlow',
          description: `Onboarded by ${currentUser.name} on standard wholesale terms.`,
          timestamp: 'Just now',
        },
      ],
    };

    setCustomers((prev) => [newCust, ...prev]);
    setSelectedCustomer(newCust);
    if (isSupabaseActive) {
      supabaseApi.insertCustomer(newCust).then((ok) => {
        if (ok) {
          showToast(`✅ Customer '${newCust.businessName}' saved to Supabase!`);
        } else {
          showToast(`⚠️ Cloud save failed for '${newCust.businessName}' (saved locally)`);
        }
      });
    } else {
      showToast(`Added customer: ${newCust.businessName}`);
    }

    addAuditEvent({
      action: 'Created Client Account',
      recordType: 'Client',
      recordId: newCust.id,
      recordTitle: newCust.businessName,
      newValue: `Registered: ${newCust.city}, Terms: ${newCust.paymentTerms}`,
    });
  };

  const createOrder = (orderData: Partial<Order>) => {
    const orderNumber = orderData.id || `ORD-0${149 + orders.length}`;
    const calculatedPairs = orderData.pairsCount ?? (orderData.items?.reduce((sum, item) => sum + (item.totalPairs || 0), 0) ?? 0);
    const calculatedCartons = orderData.cartonsCount ?? (orderData.items?.reduce((sum, item) => sum + (item.totalCartons || 0), 0) ?? 0);
    const subtotal = orderData.subtotal ?? (orderData.items?.reduce((sum, item) => sum + (item.itemSubtotal || 0), 0) ?? 0);
    const tradeDiscountPercent = orderData.tradeDiscountPercent ?? 0;
    const tradeDiscountAmount = orderData.tradeDiscountAmount ?? Math.round((subtotal * tradeDiscountPercent) / 100);
    const taxableSubtotal = orderData.taxableSubtotal ?? (subtotal - tradeDiscountAmount);
    const gstPercent = orderData.gstPercent ?? 12;
    const gstAmount = orderData.gstAmount ?? Math.round((taxableSubtotal * gstPercent) / 100);
    const netPayable = orderData.netPayable ?? (taxableSubtotal + gstAmount);
    const advanceDeposited = orderData.advanceDeposited ?? 0;
    const balanceDue = orderData.balanceDue ?? Math.max(0, netPayable - advanceDeposited);

    const newOrder: Order = {
      id: orderNumber,
      customerId: orderData.customerId || (customers[0]?.id || 'cust-1'),
      customerName: orderData.customerName || (customers[0]?.businessName || 'Retail Customer'),
      propName: orderData.propName || (customers[0]?.propName || ''),
      customerCity: orderData.customerCity || (customers[0]?.city || 'Agra'),
      customerState: orderData.customerState || (customers[0]?.state || 'Uttar Pradesh'),
      salespersonId: currentUser.id,
      salespersonName: currentUser.name,
      items: orderData.items || [],
      pairsCount: calculatedPairs,
      cartonsCount: calculatedCartons,
      wholesaleRate: orderData.wholesaleRate ?? (calculatedPairs > 0 ? Math.round(subtotal / calculatedPairs) : 0),
      subtotal,
      tradeDiscountPercent,
      tradeDiscountAmount,
      taxableSubtotal,
      gstPercent,
      gstAmount,
      netPayable,
      advanceDeposited,
      balanceDue,
      manufacturerId: orderData.manufacturerId || (manufacturers[0]?.id || 'mfg-1'),
      manufacturerName: orderData.manufacturerName || (manufacturers[0]?.companyName || 'Apex Footwear Works'),
      manufacturerPlant: orderData.manufacturerPlant || (manufacturers[0]?.hubLocation || 'Agra Unit 2'),
      expectedDelivery: orderData.expectedDelivery || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      paymentStatus: advanceDeposited > 0 ? (advanceDeposited >= netPayable ? 'Fully Paid' : 'Advance Deposited') : 'Payment Pending',
      status: orderData.status || (currentUser.role === 'admin' ? 'Approved' : 'Submitted'),
      orderDate: 'Today',
      batchNumber: orderData.batchNumber || `SF-90${orders.length + 3}`,
      timeline: [
        { step: 'Created', date: 'Today, Just Now', completed: true },
        { step: 'Submitted', date: 'Today, Just Now', completed: true, active: true },
        { step: 'Approved', date: 'Pending Trader Review', completed: (orderData.status || (currentUser.role === 'admin' ? 'Approved' : 'Submitted')) === 'Approved' },
        { step: 'In Production', date: 'Queued at Plant', completed: false },
        { step: 'Ready QC', date: 'Est. 10 Days', completed: false },
        { step: 'Dispatched', date: 'Bilty Pending', completed: false },
        { step: 'Delivered', date: 'Destination Godown', completed: false },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    if (isSupabaseActive) {
      supabaseApi.insertOrder(newOrder);
    }

    addAuditEvent({
      action: 'Created Wholesale Order',
      recordType: 'Order',
      recordId: newOrder.id,
      recordTitle: `${newOrder.customerName} (${newOrder.pairsCount} Pairs)`,
      newValue: `Net Payable: ₹${newOrder.netPayable.toLocaleString('en-IN')}, Status: ${newOrder.status}`,
    });

    // Update customer stats
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === newOrder.customerId) {
          const updatedCust = {
            ...c,
            ordersCount: c.ordersCount + 1,
            totalBusiness: c.totalBusiness + newOrder.netPayable,
            amountDue: c.amountDue + newOrder.balanceDue,
            activityHistory: [
              {
                id: `act-ord-${Date.now()}`,
                type: 'order_confirmed' as const,
                title: `Order ${newOrder.id} Booked (${newOrder.pairsCount} Pairs)`,
                description: `Created for ₹${newOrder.netPayable.toLocaleString('en-IN')} with ₹${newOrder.advanceDeposited.toLocaleString('en-IN')} advance recorded.`,
                timestamp: 'Just now',
              },
              ...c.activityHistory,
            ],
          };
          if (isSupabaseActive) {
            supabaseApi.updateCustomer(updatedCust.id, updatedCust);
          }
          return updatedCust;
        }
        return c;
      })
    );

    showToast(`Order ${newOrder.id} successfully created!`);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          addAuditEvent({
            action: 'Updated Order Status',
            recordType: 'Order',
            recordId: ord.id,
            recordTitle: `${ord.customerName} - ${ord.id}`,
            oldValue: `Status: ${ord.status}`,
            newValue: `Status: ${status}`,
          });
          if (isSupabaseActive) {
            supabaseApi.updateOrderStatus(orderId, status);
          }
          return { ...ord, status };
        }
        return ord;
      })
    );
    showToast(`Order ${orderId} status updated to: ${status}`);
  };

  const toggleSalesTask = (salespersonId: string, taskId: string) => {
    setSalesTeam((prev) =>
      prev.map((rep) => {
        if (rep.id === salespersonId) {
          const updated = rep.tasksChecklist.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          );
          return { ...rep, tasksChecklist: updated };
        }
        return rep;
      })
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const addFollowUp = (item: Partial<FollowUpItem>) => {
    const newFollowUp: FollowUpItem = {
      id: item.id || `fu-${Date.now()}`,
      customerId: item.customerId || (customers[0]?.id ?? ''),
      customerName: item.customerName || (customers[0]?.businessName ?? 'Client Store'),
      customerCity: item.customerCity || (customers[0]?.city ?? 'Agra'),
      phone: item.phone || (customers[0]?.phone ?? ''),
      reason: item.reason || 'Follow-up for payment & orders',
      date: item.date || new Date().toISOString().split('T')[0],
      time: item.time || '11:00 AM',
      relatedOrder: item.relatedOrder,
      amountDue: item.amountDue,
      notes: item.notes || '',
      status: (item.status as any) || 'today',
    };

    setFollowUps((prev) => [newFollowUp, ...prev]);
    if (isSupabaseActive) {
      followUpsService.createFollowUp({
        client_id: newFollowUp.customerId,
        due_at: new Date().toISOString(),
        type: 'collection',
        status: 'pending',
        priority: 'normal',
      });
    }

    addAuditEvent({
      action: 'Scheduled Follow-up',
      recordType: 'Client',
      recordId: newFollowUp.customerId,
      recordTitle: `${newFollowUp.customerName} (${newFollowUp.reason})`,
      newValue: `Scheduled for ${newFollowUp.date} at ${newFollowUp.time}`,
    });

    showToast(`Follow-up scheduled for ${newFollowUp.customerName}!`);
  };

  const completeFollowUp = (id: string) => {
    setFollowUps((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'completed' } : f))
    );
    if (isSupabaseActive) {
      followUpsService.completeFollowUp(id);
    }
    showToast('Follow-up marked as completed!');
  };

  const addFieldVisit = (item: Partial<FieldVisitItem>) => {
    const newVisit: FieldVisitItem = {
      id: item.id || `vis-${Date.now()}`,
      customerId: item.customerId || (customers[0]?.id ?? ''),
      customerName: item.customerName || (customers[0]?.businessName ?? 'Client Store'),
      location: item.location || (customers[0]?.city ?? 'Agra Marketplace'),
      time: item.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      purpose: item.purpose || 'Store check-in & order discussion',
      status: (item.status as any) || 'completed',
      outcome: item.outcome || 'Interested',
      notes: item.notes || '',
    };

    setFieldVisits((prev) => [newVisit, ...prev]);
    if (isSupabaseActive) {
      visitsService.createVisit({
        client_id: newVisit.customerId,
        salesperson_id: currentUser.id,
        salesperson_name: currentUser.name,
        visit_date: new Date().toISOString().split('T')[0],
        purpose: newVisit.purpose,
        outcome: newVisit.outcome,
        notes: newVisit.notes,
        status: newVisit.status as any,
      });
    }

    addAuditEvent({
      action: 'Logged Field Visit',
      recordType: 'Client',
      recordId: newVisit.customerId,
      recordTitle: `${newVisit.customerName} - ${newVisit.purpose}`,
      newValue: `Outcome: ${newVisit.outcome || 'Check-in'} at ${newVisit.location}`,
    });

    showToast(`Store visit recorded for ${newVisit.customerName}!`);
  };

  const completeFieldVisit = (
    id: string,
    outcome: FieldVisitItem['outcome'] = 'Order Created',
    notes: string = ''
  ) => {
    setFieldVisits((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: 'completed', outcome, notes } : v
      )
    );
    if (isSupabaseActive) {
      visitsService.completeVisit(id, outcome, notes);
    }
    showToast(`Visit completed • Outcome: ${outcome}`);
  };

  const recordPayment = async (p: Partial<PaymentReceipt>) => {
    const cust = customers.find((c) => c.id === p.customerId) || (p.customerId ? { id: p.customerId, businessName: p.customerName || 'Store', amountDue: p.amountDueBefore || 0, totalPaid: 0, city: p.customerCity || 'Agra' } as Customer : customers[0]);
    const payAmount = Number(p.paymentAmount) || 0;
    const beforeDue = cust ? cust.amountDue : (p.amountDueBefore ?? 0);
    const afterDue = Math.max(0, beforeDue - payAmount);
    const receiptNum = p.receiptNumber || `SF-REC-${Math.floor(10000 + Math.random() * 90000)}`;

    const newReceipt: PaymentReceipt = {
      id: p.id || `pay-${Date.now()}`,
      receiptNumber: receiptNum,
      customerId: cust?.id || p.customerId || '',
      customerName: cust?.businessName || p.customerName || 'Customer Store',
      customerCity: cust?.city || p.customerCity || 'Agra',
      orderId: p.orderId,
      orderNumber: p.orderNumber,
      amountDueBefore: beforeDue,
      paymentAmount: payAmount,
      amountDueAfter: afterDue,
      paymentDate: p.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: p.paymentMethod || 'UPI',
      utrRef: p.utrRef || '',
      collectedBy: currentUser.name,
      notes: p.notes || '',
      sentSms: p.sentSms !== false,
      status: p.paymentMethod === 'Cheque' ? 'pending_clearance' : 'verified',
      chequeNo: p.chequeNo,
      chequeBank: p.chequeBank,
      chequeDate: p.chequeDate,
    };

    setPayments((prev) => [newReceipt, ...prev]);

    if (isSupabaseActive && cust?.id) {
      try {
        await paymentsService.recordPayment({
          clientId: cust.id,
          amount: payAmount,
          method: newReceipt.paymentMethod,
          reference: newReceipt.utrRef,
          paymentDate: newReceipt.paymentDate,
          notes: newReceipt.notes,
          chequeNo: newReceipt.chequeNo,
          chequeBank: newReceipt.chequeBank,
          chequeDate: newReceipt.chequeDate,
        });
      } catch (err) {
        console.error('Error saving payment to Supabase:', err);
      }
    }

    addAuditEvent({
      action: 'Recorded Payment Collection',
      recordType: 'Payment',
      recordId: newReceipt.receiptNumber,
      recordTitle: `${newReceipt.customerName} - ₹${newReceipt.paymentAmount.toLocaleString('en-IN')} (${newReceipt.paymentMethod})`,
      oldValue: `Outstanding: ₹${newReceipt.amountDueBefore.toLocaleString('en-IN')}`,
      newValue: `Outstanding: ₹${newReceipt.amountDueAfter.toLocaleString('en-IN')} (Ref: ${newReceipt.utrRef || newReceipt.chequeNo || 'Realized'})`,
    });

    // Update customer balances locally if verified immediately
    if (newReceipt.status === 'verified') {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === newReceipt.customerId) {
            const newDue = Math.max(0, c.amountDue - payAmount);
            return {
              ...c,
              amountDue: newDue,
              totalPaid: c.totalPaid + payAmount,
              lastPaymentDate: 'Today',
              lastPaymentAmount: payAmount,
              status: newDue === 0 ? ('active' as const) : c.status,
              overdueDays: newDue === 0 ? 0 : c.overdueDays,
              activityHistory: [
                {
                  id: `act-pay-${Date.now()}`,
                  type: 'payment' as const,
                  title: `Received ₹${payAmount.toLocaleString('en-IN')} payment via ${newReceipt.paymentMethod}`,
                  description: `Ref: ${newReceipt.utrRef || newReceipt.chequeNo || 'Direct'}. Remaining Due: ₹${newDue.toLocaleString('en-IN')}.`,
                  timestamp: 'Just now',
                  refNumber: newReceipt.utrRef || newReceipt.chequeNo,
                },
                ...c.activityHistory,
              ],
            };
          }
          return c;
        })
      );
    }

    showToast(`Payment of ₹${newReceipt.paymentAmount.toLocaleString('en-IN')} recorded successfully!`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        isLoggedIn,
        login,
        register,
        logout,
        customers,
        selectedCustomer,
        setSelectedCustomer,
        addCustomer,
        designs,
        setDesigns,
        refreshDesigns,
        selectedDesignIds,
        toggleSelectDesign,
        clearSelectedDesigns,
        orders,
        createOrder,
        updateOrderStatus,
        manufacturers,
        salesTeam,
        toggleSalesTask,
        notifications,
        markNotificationAsRead,
        followUps,
        addFollowUp,
        completeFollowUp,
        fieldVisits,
        addFieldVisit,
        completeFieldVisit,
        payments,
        recordPayment,
        auditLogs,
        addAuditEvent,
        designShares,
        recordDesignShare,
        isWalkthroughOpen,
        setIsWalkthroughOpen,
        walkthroughStep,
        setWalkthroughStep,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        isCreateOrderModalOpen,
        setIsCreateOrderModalOpen,
        isAddCustomerModalOpen,
        setIsAddCustomerModalOpen,
        isShareModalOpen,
        setIsShareModalOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleMobileSidebar,
        toastMessage,
        showToast,
        themePreference,
        setThemePreference,
        isDarkMode,
        toggleDarkMode,
        isSupabaseActive,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
