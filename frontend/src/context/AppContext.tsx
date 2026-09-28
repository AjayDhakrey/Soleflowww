import React, { createContext, useContext, useState } from 'react';
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
} from '../data/mockData';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
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
  completeFollowUp: (id: string) => void;
  fieldVisits: FieldVisitItem[];
  completeFieldVisit: (id: string, outcome: FieldVisitItem['outcome'], notes: string) => void;
  payments: PaymentReceipt[];
  recordPayment: (payment: Partial<PaymentReceipt>) => void;
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
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'soleflow_auth_session';
const THEME_STORAGE_KEY = 'soleflow_dark_mode';

const getInitialDarkMode = () => {
  try {
    return typeof window !== 'undefined' && localStorage.getItem(THEME_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialDarkMode);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(MOCK_CUSTOMERS[0]);
  const [designs] = useState<ShoeDesign[]>(MOCK_DESIGNS);
  const [selectedDesignIds, setSelectedDesignIds] = useState<string[]>(['sf-1024', 'sf-884', 'sf-512']);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>(MOCK_MANUFACTURERS);
  const [salesTeam, setSalesTeam] = useState<Salesperson[]>(MOCK_SALES_TEAM);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>(MOCK_FOLLOWUPS);
  const [fieldVisits, setFieldVisits] = useState<FieldVisitItem[]>(MOCK_FIELD_VISITS);
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);

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

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, String(next));
      } catch (e) {
        console.error('Failed to save theme preference:', e);
      }
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const switchRole = (role: UserRole) => {
    const user = role === 'admin' ? MOCK_USERS.admin : MOCK_USERS.salesperson;
    setCurrentUser(user);
    setIsMobileSidebarOpen(false);
    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ isLoggedIn: true, role: user.role, email: user.email })
      );
    } catch (e) {
      console.error('Failed to update session:', e);
    }
    if (role === 'admin') {
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
    showToast(`Added customer: ${newCust.businessName}`);
  };

  const createOrder = (orderData: Partial<Order>) => {
    const orderNumber = `ORD-0${149 + orders.length}`;
    const newOrder: Order = {
      id: orderNumber,
      customerId: orderData.customerId || customers[0].id,
      customerName: orderData.customerName || customers[0].businessName,
      propName: orderData.propName || customers[0].propName,
      customerCity: orderData.customerCity || customers[0].city,
      customerState: orderData.customerState || customers[0].state,
      salespersonId: currentUser.id,
      salespersonName: currentUser.name,
      items: orderData.items || [],
      pairsCount: orderData.pairsCount || 200,
      cartonsCount: orderData.cartonsCount || 16,
      wholesaleRate: orderData.wholesaleRate || 1250,
      subtotal: orderData.subtotal || 250000,
      tradeDiscountPercent: orderData.tradeDiscountPercent || 5,
      tradeDiscountAmount: orderData.tradeDiscountAmount || 12500,
      taxableSubtotal: orderData.taxableSubtotal || 237500,
      gstPercent: 12,
      gstAmount: orderData.gstAmount || 28500,
      netPayable: orderData.netPayable || 266000,
      advanceDeposited: orderData.advanceDeposited || 100000,
      balanceDue: orderData.balanceDue || 166000,
      manufacturerId: orderData.manufacturerId || 'mfg-1',
      manufacturerName: orderData.manufacturerName || 'Apex Footwear Works',
      manufacturerPlant: orderData.manufacturerPlant || 'Agra Unit 2',
      expectedDelivery: '10 Nov 2024',
      paymentStatus: 'Advance Deposited',
      status: currentUser.role === 'admin' ? 'Approved' : 'Submitted',
      orderDate: 'Today',
      batchNumber: `SF-90${orders.length + 3}`,
      timeline: [
        { step: 'Created', date: 'Today, Just Now', completed: true },
        { step: 'Submitted', date: 'Today, Just Now', completed: true, active: true },
        { step: 'Approved', date: 'Pending Trader Review', completed: currentUser.role === 'admin' },
        { step: 'In Production', date: 'Queued at Plant', completed: false },
        { step: 'Ready QC', date: 'Est. 10 Days', completed: false },
        { step: 'Dispatched', date: 'Bilty Pending', completed: false },
        { step: 'Delivered', date: 'Destination Godown', completed: false },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update customer stats
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === newOrder.customerId) {
          return {
            ...c,
            ordersCount: c.ordersCount + 1,
            totalBusiness: c.totalBusiness + newOrder.netPayable,
            amountDue: c.amountDue + newOrder.balanceDue,
            activityHistory: [
              {
                id: `act-ord-${Date.now()}`,
                type: 'order_confirmed',
                title: `Order ${newOrder.id} Booked (${newOrder.pairsCount} Pairs)`,
                description: `Created for ₹${newOrder.netPayable.toLocaleString('en-IN')} with ₹${newOrder.advanceDeposited.toLocaleString('en-IN')} advance recorded.`,
                timestamp: 'Just now',
              },
              ...c.activityHistory,
            ],
          };
        }
        return c;
      })
    );

    showToast(`Order ${newOrder.id} successfully created!`);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
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

  const completeFollowUp = (id: string) => {
    setFollowUps((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'completed' } : f))
    );
    showToast('Follow-up marked as completed!');
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
    showToast(`Visit completed • Outcome: ${outcome}`);
  };

  const recordPayment = (p: Partial<PaymentReceipt>) => {
    const receiptNum = `SF-REC-${403 + payments.length}`;
    const newReceipt: PaymentReceipt = {
      id: `pay-${Date.now()}`,
      receiptNumber: receiptNum,
      customerId: p.customerId || customers[0].id,
      customerName: p.customerName || customers[0].businessName,
      customerCity: p.customerCity || customers[0].city,
      orderId: p.orderId || 'ORD-0148',
      orderNumber: p.orderNumber || 'ORD-0148',
      amountDueBefore: p.amountDueBefore || 230000,
      paymentAmount: p.paymentAmount || 100000,
      amountDueAfter: Math.max(0, (p.amountDueBefore || 230000) - (p.paymentAmount || 100000)),
      paymentDate: p.paymentDate || 'Today, 24 Oct 2024',
      paymentMethod: p.paymentMethod || 'UPI',
      utrRef: p.utrRef || 'UPI/428901239841',
      collectedBy: currentUser.name,
      notes: p.notes || 'Recorded via Bill Allocation Mode',
      sentSms: p.sentSms !== false,
    };

    setPayments((prev) => [newReceipt, ...prev]);

    // Update customer balances
    setCustomers((prev) =>
      prev.map((cust) => {
        if (cust.id === newReceipt.customerId) {
          const newDue = Math.max(0, cust.amountDue - newReceipt.paymentAmount);
          return {
            ...cust,
            amountDue: newDue,
            totalPaid: cust.totalPaid + newReceipt.paymentAmount,
            lastPaymentDate: 'Today',
            lastPaymentAmount: newReceipt.paymentAmount,
            status: newDue === 0 ? 'active' : cust.status,
            overdueDays: newDue === 0 ? 0 : cust.overdueDays,
            activityHistory: [
              {
                id: `act-pay-${Date.now()}`,
                type: 'payment',
                title: `Received ₹${newReceipt.paymentAmount.toLocaleString('en-IN')} payment via ${newReceipt.paymentMethod}`,
                description: `Transaction Ref: ${newReceipt.utrRef}. Adjusted against balance. Remaining Due: ₹${newDue.toLocaleString('en-IN')}.`,
                timestamp: 'Just now',
                refNumber: newReceipt.utrRef,
              },
              ...cust.activityHistory,
            ],
          };
        }
        return cust;
      })
    );

    showToast(`Payment of ₹${newReceipt.paymentAmount.toLocaleString('en-IN')} recorded & WhatsApp receipt sent!`);
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
        completeFollowUp,
        fieldVisits,
        completeFieldVisit,
        payments,
        recordPayment,
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
        isDarkMode,
        toggleDarkMode,
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
