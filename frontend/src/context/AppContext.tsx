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
import { notificationsService } from '../services/notifications';
import { useAuth } from '../auth/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';
import { useEffectiveOrgId, useReadOnly } from './ViewModeContext';
import { clientsService, mapClientRowToCustomer } from '../services/clients';
import { ordersService } from '../services/orders';
import { salesmenService } from '../services/salesmen';
import { mapFollowUpRow } from '../services/followUps';
import { mapFieldVisitRow } from '../services/visits';

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
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (cust: Customer | null) => void;
  addCustomer: (cust: Partial<Customer>) => Promise<boolean>;
  archiveCustomer: (customerId: string) => Promise<boolean>;
  assignCustomerSalesman: (customerId: string, salesmanId: string) => Promise<boolean>;
  designs: ShoeDesign[];
  setDesigns: React.Dispatch<React.SetStateAction<ShoeDesign[]>>;
  refreshDesigns: () => Promise<void>;
  selectedDesignIds: string[];
  toggleSelectDesign: (id: string) => void;
  clearSelectedDesigns: () => void;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  createOrder: (order: Partial<Order>) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>;
  manufacturers: Manufacturer[];
  setManufacturers: React.Dispatch<React.SetStateAction<Manufacturer[]>>;
  salesTeam: Salesperson[];
  setSalesTeam: React.Dispatch<React.SetStateAction<Salesperson[]>>;
  toggleSalesTask: (salespersonId: string, taskId: string) => void;
  addSalesTask: (salespersonId: string, task: Salesperson['tasksChecklist'][number]) => Promise<boolean>;
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  followUps: FollowUpItem[];
  setFollowUps: React.Dispatch<React.SetStateAction<FollowUpItem[]>>;
  addFollowUp: (item: Partial<FollowUpItem>) => Promise<boolean>;
  completeFollowUp: (id: string) => Promise<boolean>;
  fieldVisits: FieldVisitItem[];
  setFieldVisits: React.Dispatch<React.SetStateAction<FieldVisitItem[]>>;
  addFieldVisit: (item: Partial<FieldVisitItem>) => Promise<boolean>;
  completeFieldVisit: (id: string, outcome: FieldVisitItem['outcome'], notes: string) => void;
  payments: PaymentReceipt[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentReceipt[]>>;
  recordPayment: (payment: Partial<PaymentReceipt>) => Promise<PaymentReceipt>;
  // Audit Logs & Traceability
  auditLogs: AuditEvent[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditEvent[]>>;
  addAuditEvent: (event: Partial<AuditEvent>) => void;
  // Design Shares
  designShares: DesignShareRecord[];
  recordDesignShare: (share: Partial<DesignShareRecord>) => Promise<boolean>;
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [designs, setDesigns] = useState<ShoeDesign[]>([]);
  const [selectedDesignIds, setSelectedDesignIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [salesTeam, setSalesTeam] = useState<Salesperson[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [fieldVisits, setFieldVisits] = useState<FieldVisitItem[]>([]);
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [designShares, setDesignShares] = useState<DesignShareRecord[]>([]);

  const auth = useAuth();
  const isSupabaseActive = isSupabaseConfigured();
  const orgId = useEffectiveOrgId() || 'ff415366-0239-4fa2-b7f6-dec643136aa3';
  const isReadOnly = useReadOnly();
  const queryClient = useQueryClient();
  const requirePersistence = () => {
    if (isSupabaseConfigured()) {
      return true;
    }
    if (isReadOnly) {
      showToast('This workspace is in read-only view mode.');
      return false;
    }
    return true;
  };
  const invalidateData = () => { void queryClient.invalidateQueries(); };

  // Clear account state before loading; discard requests from an earlier account.
  useEffect(() => {
    let cancelled = false;
    setCustomers([]); setSelectedCustomer(null); setDesigns([]); setOrders([]);
    setManufacturers([]); setSalesTeam([]); setNotifications([]); setFollowUps([]);
    setFieldVisits([]); setPayments([]); setAuditLogs([]); setDesignShares([]);
    setSelectedDesignIds([]);
    queryClient.clear();
    if (!auth.hasRealSession && auth.isDemoAccount) {
      setCustomers(MOCK_CUSTOMERS); setDesigns(MOCK_DESIGNS); setOrders(MOCK_ORDERS);
      setManufacturers(MOCK_MANUFACTURERS); setSalesTeam(MOCK_SALES_TEAM);
      setFollowUps(MOCK_FOLLOWUPS); setFieldVisits(MOCK_FIELD_VISITS);
      setAuditLogs(MOCK_AUDIT_LOGS); setDesignShares(MOCK_DESIGN_SHARES);
      return;
    }
    if (isSupabaseActive && orgId) {
      const load = async (fetcher: () => Promise<any>, setter: (data: any) => void) => {
        try { const data = await fetcher(); if (!cancelled && data !== null) setter(data); }
        catch (err) { if (!cancelled) showToast('Could not load workspace data. Please retry.'); console.error(err); }
      };
      void load(() => supabaseApi.getCustomers(orgId), data => { setCustomers(data); setSelectedCustomer(data[0] || null); });
      void load(() => designsService.fetchDesigns({ orgId }), setDesigns);
      void load(() => supabaseApi.getOrders(orgId), setOrders);
      void load(() => supabaseApi.getPayments(orgId), setPayments);
      void load(() => followUpsService.fetchFollowUps({ orgId }), setFollowUps);
      void load(() => visitsService.fetchVisits({ orgId }), setFieldVisits);
      void load(() => notificationsService.fetchNotifications(orgId), setNotifications);
      void load(() => supabaseApi.getAuditLogs(orgId), setAuditLogs);
      void load(() => supabaseApi.getDesignShares(orgId), setDesignShares);
      void load(() => supabaseApi.getManufacturers(orgId), setManufacturers);
      void load(() => supabaseApi.getSalesTeam(orgId), setSalesTeam);
    }
    return () => { cancelled = true; };
  }, [isSupabaseActive, orgId, auth.user?.id, auth.isDemoAccount]);

  const refreshDesigns = async () => {
    try {
      const live = await designsService.fetchDesigns({ orgId: orgId || undefined });
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

  const addAuditEvent = async (eventData: Partial<AuditEvent>) => {
    if (!isSupabaseActive || isReadOnly) return;
    const newEvent: AuditEvent = {
      id: crypto.randomUUID(),
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
    if (!await supabaseApi.insertAuditLog(newEvent)) { showToast('Activity log could not be saved.'); return; }
    setAuditLogs((prev) => [newEvent, ...prev]);
  };

  const recordDesignShare = async (shareData: Partial<DesignShareRecord>) => {
    if (!requirePersistence()) return false;
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
    if (!await supabaseApi.insertDesignShare(newShare)) { showToast('Could not save this design share. Please retry.'); return false; }
    setDesignShares((prev) => [newShare, ...prev]);
    addAuditEvent({
      action: `Shared ${newShare.designsCount} Shoe Designs`,
      recordType: 'Design',
      recordId: newShare.id,
      recordTitle: `${newShare.targetClientName} (${newShare.channel})`,
      newValue: `Shared via ${newShare.channel} to ${newShare.targetPhone}`,
    });
    return true;
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

  useEffect(() => {
    if (auth?.user) {
      setCurrentUser(auth.user);
      setIsLoggedIn(auth.isLoggedIn);
    } else if (auth && !auth.isLoading && !auth.isLoggedIn) {
      setIsLoggedIn(false);
    }
  }, [auth?.user, auth?.isLoggedIn, auth?.isLoading]);

  const switchRole = (role?: UserRole) => {
    if (auth.hasRealSession || !auth.isDemoAccount) {
      showToast('Your account role is managed by your organization.');
      return;
    }
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

  const login = (email: string, pass?: string): boolean => {
    let user = MOCK_USERS.admin;
    const isSuper = email.includes('super');
    if (email === 'sales@soleflow.com' || email.includes('sales')) {
      user = { ...MOCK_USERS.salesperson, isSuperAdmin: false, is_super_admin: false, isDemoAccount: true };
    } else if (isSuper) {
      user = {
        ...MOCK_USERS.admin,
        id: 'superadmin-demo-uuid',
        name: 'Platform Super Admin',
        email: 'superadmin@soleflow.com',
        roleLabel: 'Platform Owner',
        isSuperAdmin: true,
        is_super_admin: true,
        isDemoAccount: true,
      };
    } else {
      user = { ...MOCK_USERS.admin, isSuperAdmin: false, is_super_admin: false, isDemoAccount: true };
    }

    setIsMobileSidebarOpen(false);
    setCurrentUser(user);
    setIsLoggedIn(true);
    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ isLoggedIn: true, role: user.role, email: user.email, isSuperAdmin: user.isSuperAdmin, user })
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

  const addCustomer = async (input: Partial<Customer>) => {
    if (!requirePersistence()) return false;
    const result = await clientsService.createClient(input);
    if (!result.success || !result.data) { showToast(result.error || 'Customer could not be saved.'); return false; }
    const saved = mapClientRowToCustomer(result.data);
    setCustomers(prev => [saved, ...prev]); setSelectedCustomer(saved);
    invalidateData(); showToast('Customer saved.'); return true;
  };

  const archiveCustomer = async (customerId: string) => {
    if (!requirePersistence()) return false;
    const result = await clientsService.archiveClient(customerId);
    if (!result.success) { showToast(result.error || 'Customer could not be archived.'); return false; }
    setCustomers(prev => prev.filter(customer => customer.id !== customerId));
    setSelectedCustomer(prev => prev?.id === customerId ? null : prev);
    invalidateData(); return true;
  };
  const assignCustomerSalesman = async (customerId: string, salesmanId: string) => {
    if (!requirePersistence()) return false;
    const result = await clientsService.assignSalesman(customerId, salesmanId);
    if (!result.success) { showToast(result.error || 'Assignment could not be saved.'); return false; }
    const rep = salesTeam.find(item => item.id === salesmanId);
    const update = (customer: Customer) => customer.id === customerId ? { ...customer, salespersonId: salesmanId, salespersonName: rep?.name || '' } : customer;
    setCustomers(prev => prev.map(update));
    setSelectedCustomer(prev => prev ? update(prev) : prev);
    invalidateData(); return true;
  };

  const createOrder = async (input: Partial<Order>) => {
    if (!requirePersistence()) return false;
    const result = await ordersService.createOrderDraft({ order: input, items: input.items || [] });
    if (!result.success || !result.data?.id) { showToast(result.error || 'Order could not be saved.'); return false; }
    const saved = { ...input, ...result.data } as Order;
    if (input.manufacturerId && !await supabaseApi.assignOrderManufacturer(saved.id, input.manufacturerId)) {
      showToast('Order saved; factory assignment failed. Assign a factory from the order details.');
    }
    setOrders(prev => [saved, ...prev]); invalidateData();
    showToast('Order saved.'); return true;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!requirePersistence()) return false;
    const result = await ordersService.advanceOrderStatus({ orderId, newStatus: status });
    if (!result.success) { showToast(result.error || 'Status could not be saved.'); return false; }
    setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status } : order));
    invalidateData(); showToast('Order status saved.'); return true;
  };

  const toggleSalesTask = async (salespersonId: string, taskId: string) => {
    if (!requirePersistence()) return;
    const rep = salesTeam.find(item => item.id === salespersonId);
    if (!rep) return;
    const tasksChecklist = rep.tasksChecklist.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task);
    const result = await salesmenService.updateSalesman(salespersonId, { tasksChecklist });
    if (!result.success) { showToast(result.error || 'Task could not be saved.'); return; }
    setSalesTeam(prev => prev.map(item => item.id === salespersonId ? { ...item, tasksChecklist } : item));
  };

  const addSalesTask = async (salespersonId: string, task: Salesperson['tasksChecklist'][number]) => {
    if (!requirePersistence()) return false;
    const rep = salesTeam.find(item => item.id === salespersonId);
    if (!rep) return false;
    const tasksChecklist = [...(rep.tasksChecklist || []), task];
    const result = await salesmenService.updateSalesman(salespersonId, { tasksChecklist });
    if (!result.success) { showToast(result.error || 'Route stop could not be saved.'); return false; }
    setSalesTeam(prev => prev.map(item => item.id === salespersonId ? { ...item, tasksChecklist } : item));
    invalidateData();
    return true;
  };

  const markNotificationAsRead = async (id: string) => {
    if (!requirePersistence() || !await notificationsService.markAsRead(id)) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const markAllNotificationsAsRead = async () => {
    if (!requirePersistence() || !await notificationsService.markAllAsRead()) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  const addFollowUp = async (input: Partial<FollowUpItem>) => {
    if (!requirePersistence()) return false;
    const result = await followUpsService.createFollowUp({ ...input, owner_id: auth.user?.id, owner_name: currentUser.name });
    if (!result.success || !result.data) { showToast(result.error || 'Follow-up could not be saved.'); return false; }
    const saved = { ...input, ...mapFollowUpRow(result.data), customerName: input.customerName || '', customerCity: input.customerCity || '', phone: input.phone || '' };
    setFollowUps(prev => [saved, ...prev]); showToast('Follow-up saved.'); return true;
  };
  const completeFollowUp = async (id: string) => {
    if (!requirePersistence()) return false;
    const result = await followUpsService.completeFollowUp(id);
    if (!result.success) { showToast(result.error || 'Follow-up could not be completed.'); return false; }
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, status: 'completed' } : f));
    return true;
  };
  const addFieldVisit = async (input: Partial<FieldVisitItem>) => {
    if (!requirePersistence()) return false;
    const result = await visitsService.createVisit({ ...input, salesperson_id: currentUser.id, salesperson_name: currentUser.name });
    if (!result.success || !result.data) { showToast(result.error || 'Visit could not be saved.'); return false; }
    const saved = { ...mapFieldVisitRow(result.data), customerName: input.customerName || '' };
    setFieldVisits(prev => [saved, ...prev.filter(v => v.id !== saved.id)]); showToast('Visit saved.'); return true;
  };
  const completeFieldVisit = async (id: string, outcome: FieldVisitItem['outcome'] = 'Order Created', notes = '') => {
    if (!requirePersistence()) return;
    const result = await visitsService.completeVisit(id, outcome, notes);
    if (!result.success) { showToast(result.error || 'Visit could not be completed.'); return; }
    setFieldVisits(prev => prev.map(v => v.id === id ? { ...v, status: 'completed', outcome, notes } : v));
  };
  const recordPayment = async (input: Partial<PaymentReceipt>): Promise<PaymentReceipt> => {
    if (!requirePersistence()) throw new Error('Sign in to an editable account to save payments.');
    if (!input.customerId) throw new Error('Select a customer.');
    const effectiveOrg = orgId || 'ff415366-0239-4fa2-b7f6-dec643136aa3';
    const result = await paymentsService.recordPayment({
      clientId: input.customerId,
      customerName: input.customerName,
      customerCity: input.customerCity,
      amount: Number(input.paymentAmount),
      amountDueBefore: input.amountDueBefore,
      amountDueAfter: input.amountDueAfter,
      method: input.paymentMethod,
      reference: input.utrRef,
      paymentDate: input.paymentDate,
      notes: input.notes,
      collectedBy: input.collectedBy || currentUser?.name || 'Sales Representative',
      chequeNo: input.chequeNo,
      chequeBank: input.chequeBank,
      chequeDate: input.chequeDate,
      allocations: input.orderId ? [{ orderId: input.orderId, amount: Number(input.paymentAmount) }] : [],
      idempotencyKey: input.id || crypto.randomUUID(),
      orgId: effectiveOrg,
    });
    if (!result.success || !result.data) throw new Error(result.error || 'Payment could not be saved.');
    const saved = {
      ...result.data,
      chequeNo: result.data.cheque_no || input.chequeNo,
      chequeBank: result.data.cheque_bank || input.chequeBank,
      chequeDate: result.data.cheque_date || input.chequeDate,
      receiptNumber: result.data.receiptNumber || `SF-REC-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName: result.data.customerName || input.customerName,
      customerCity: result.data.customerCity || input.customerCity,
    } as PaymentReceipt;
    
    setPayments(prev => [saved, ...prev.filter(p => p.id !== saved.id)]);

    // Update customer balances in local UI state
    setCustomers(prev => prev.map(c => {
      if (c.id === input.customerId) {
        const newPaid = (c.totalPaid || 0) + Number(input.paymentAmount);
        const newDue = Math.max(0, (c.amountDue || 0) - Number(input.paymentAmount));
        return {
          ...c,
          totalPaid: newPaid,
          amountDue: newDue,
          lastPaymentDate: 'Today',
          lastPaymentAmount: Number(input.paymentAmount),
        };
      }
      return c;
    }));

    const liveCustomers = await supabaseApi.getCustomers(effectiveOrg);
    if (liveCustomers && liveCustomers.length > 0) setCustomers(liveCustomers);
    invalidateData();
    showToast('Payment saved and synced to Supabase.');
    return saved;
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
        setCustomers,
        selectedCustomer,
        setSelectedCustomer,
        addCustomer,
        archiveCustomer,
        assignCustomerSalesman,
        designs,
        setDesigns,
        refreshDesigns,
        selectedDesignIds,
        toggleSelectDesign,
        clearSelectedDesigns,
        orders,
        setOrders,
        createOrder,
        updateOrderStatus,
        manufacturers,
        setManufacturers,
        salesTeam,
        setSalesTeam,
        toggleSalesTask,
        addSalesTask,
        notifications,
        setNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        followUps,
        setFollowUps,
        addFollowUp,
        completeFollowUp,
        fieldVisits,
        setFieldVisits,
        addFieldVisit,
        completeFieldVisit,
        payments,
        setPayments,
        recordPayment,
        auditLogs,
        setAuditLogs,
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
