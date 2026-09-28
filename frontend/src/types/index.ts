export type UserRole = 'admin' | 'salesperson';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  initials: string;
  roleLabel: string;
  phone?: string;
  zone?: string;
}

export interface CustomerActivity {
  id: string;
  type: 'payment' | 'order_dispatched' | 'production' | 'order_confirmed' | 'shared_designs' | 'note' | 'call';
  title: string;
  description: string;
  timestamp: string;
  refNumber?: string;
  badge?: string;
}

export interface Customer {
  id: string;
  businessName: string;
  propName: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  state: string;
  cluster: string;
  address: string;
  gstin: string;
  salespersonId: string;
  salespersonName: string;
  paymentTerms: string;
  creditLimit: number;
  totalBusiness: number; // e.g. 2840000
  totalPaid: number; // e.g. 2610000
  amountDue: number; // e.g. 230000
  overdueDays: number; // e.g. 18
  status: 'overdue' | 'active' | 'idle' | 'due_soon';
  ordersCount: number;
  lastOrderDate: string;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  tier: 'Tier-1 Wholesale' | 'Regional Chain' | 'Distributor' | 'Standard Retail';
  topSellingModels?: { name: string; pairs: number; image: string }[];
  activityHistory: CustomerActivity[];
  notes?: string;
}

export interface ShoeDesign {
  id: string;
  articleCode: string;
  name: string;
  category: 'Athletic Sneakers' | 'Formal Derby & Oxford' | 'Leather Boots' | 'Loafers & Casuals';
  price: number; // Wholesale Ex-Factory per pair
  moqPairs: number;
  moqCartons: number;
  sizes: number[];
  colors: string[];
  status: 'Available' | 'New Designs' | 'Popular' | 'Archived';
  tags: string[];
  subline: string;
  image: string;
  soleType: string;
  pairsPerCarton: number;
  upperMaterial: string;
  marginBadge?: string;
  velocityBadge?: string;
}

export interface OrderSizeMatrix {
  size: number;
  pairs: number;
  cartons: number;
  loose: number;
  isFastMover?: boolean;
}

export interface OrderItem {
  designId: string;
  designName: string;
  articleCode: string;
  image: string;
  ratePerPair: number;
  sizeBreakdown: OrderSizeMatrix[];
  totalPairs: number;
  totalCartons: number;
  loosePairs: number;
  itemSubtotal: number;
}

export interface OrderTimelineEvent {
  step: string;
  date: string;
  completed: boolean;
  active?: boolean;
  notes?: string;
}

export interface Order {
  id: string; // e.g. ORD-0148
  customerId: string;
  customerName: string;
  propName: string;
  customerCity: string;
  customerState: string;
  salespersonId: string;
  salespersonName: string;
  items: OrderItem[];
  pairsCount: number;
  cartonsCount: number;
  wholesaleRate: number;
  subtotal: number;
  tradeDiscountPercent: number;
  tradeDiscountAmount: number;
  taxableSubtotal: number;
  gstPercent: number;
  gstAmount: number;
  netPayable: number;
  advanceDeposited: number;
  balanceDue: number;
  manufacturerId: string;
  manufacturerName: string;
  manufacturerPlant: string;
  expectedDelivery: string;
  paymentStatus: 'Paid' | 'Advance Deposited' | 'Payment Pending' | 'Overdue';
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'In Production' | 'Ready QC' | 'Ready to Dispatch' | 'Dispatched' | 'Delivered' | 'Cancelled';
  orderDate: string;
  batchNumber?: string;
  timeline: OrderTimelineEvent[];
}

export interface Manufacturer {
  id: string;
  companyName: string;
  hubLocation: string;
  estYear: number;
  primarySpecialization: string;
  monthlyCapacityPairs: number;
  runningBatchesCount: number;
  onTimeDeliveryRate: number;
  qcPassRatio: number;
  generalManager: string;
  phone: string;
  loadPercentage: number;
  status: 'Active Plants' | 'Near Full' | 'Maintenance';
  toolingLeadTimeDays: number;
  activeOrdersList?: string[];
  moldsActiveCount?: number;
}

export interface SalespersonTask {
  id: string;
  time: string;
  title: string;
  description: string;
  verifiedGps?: boolean;
  completed: boolean;
  badge?: string;
  badgeColor?: 'green' | 'blue' | 'amber' | 'purple';
  type: 'visit' | 'cheque' | 'followup' | 'meeting';
}

export interface Salesperson {
  id: string;
  name: string;
  roleTitle: 'Senior Rep' | 'Territory Lead' | 'Field Rep';
  photo: string;
  zone: string;
  cluster: string;
  phone: string;
  email: string;
  empId: string;
  monthlyTarget: number;
  bookedThisMonth: number;
  commissionRate: number;
  commissionAccrued: number;
  collectionDue: number;
  assignedAccountsCount: number;
  todayVisitsDone: number;
  todayVisitsTotal: number;
  chequesTodayAmount: number;
  status: 'In Market' | 'Office/HQ' | 'On Leave';
  assignedKit: string;
  kitVerifiedDate: string;
  tasksChecklist: SalespersonTask[];
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  customerId: string;
  customerName: string;
  customerCity: string;
  orderId: string;
  orderNumber: string;
  amountDueBefore: number;
  paymentAmount: number;
  amountDueAfter: number;
  paymentDate: string;
  paymentMethod: 'UPI' | 'Cash' | 'NEFT/RTGS' | 'Cheque';
  utrRef: string;
  collectedBy: string;
  notes: string;
  sentSms: boolean;
}

export interface FollowUpItem {
  id: string;
  customerId: string;
  customerName: string;
  customerCity: string;
  phone: string;
  reason: string;
  date: string;
  time: string;
  relatedOrder?: string;
  amountDue?: number;
  notes: string;
  status: 'today' | 'upcoming' | 'overdue' | 'completed';
}

export interface FieldVisitItem {
  id: string;
  customerId: string;
  customerName: string;
  location: string;
  time: string;
  purpose: string;
  status: 'today' | 'upcoming' | 'completed';
  outcome?: 'Interested' | 'Order Created' | 'Follow-up Needed' | 'Payment Collected' | 'Not Interested' | 'Other';
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  desc: string;
  category: 'order' | 'payment' | 'factory' | 'alert' | 'visit';
  read: boolean;
  linkTab?: string;
}
