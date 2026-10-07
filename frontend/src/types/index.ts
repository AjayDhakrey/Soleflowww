export type UserRole = 'admin' | 'salesperson';

export interface Organization {
  id: string;
  name: string;
  phone?: string;
  city?: string;
  state?: string;
  gstin?: string;
  owner_id?: string;
  status: 'active' | 'suspended';
  is_demo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OrgInvite {
  id: string;
  org_id: string;
  email: string;
  role: UserRole;
  token: string;
  invited_by?: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

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
  org_id?: string;
  orgId?: string;
  isSuperAdmin?: boolean;
  is_super_admin?: boolean;
  isDemoAccount?: boolean;
  is_demo_account?: boolean;
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
  costPrice?: number; // Factory manufacturing / COGS per pair
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
  isArchived?: boolean;
  createdAt?: string;
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
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Confirmed' | 'In Production' | 'Ready' | 'Ready QC' | 'Ready to Dispatch' | 'Dispatched' | 'Delivered' | 'Cancelled';
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
  orderId?: string;
  orderNumber?: string;
  amountDueBefore: number;
  paymentAmount: number;
  amountDueAfter: number;
  paymentDate: string;
  paymentMethod: 'UPI' | 'Cash' | 'NEFT/RTGS' | 'Cheque';
  utrRef: string;
  collectedBy: string;
  notes: string;
  sentSms: boolean;
  status?: 'recorded' | 'pending_clearance' | 'verified' | 'bounced' | 'reversed';
  chequeNo?: string;
  chequeBank?: string;
  chequeDate?: string;
  bounceReason?: string;
  reversalReason?: string;
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
  category: 'order' | 'payment' | 'factory' | 'alert' | 'visit' | 'design';
  read: boolean;
  linkTab?: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  actorRole: 'Trader / Admin' | 'Field Sales Rep' | 'System';
  action: string;
  recordType: 'Client' | 'Order' | 'Design' | 'Payment' | 'Manufacturer' | 'Salesperson' | 'Settings';
  recordId: string;
  recordTitle: string;
  oldValue?: string;
  newValue: string;
  timestamp: string;
  source: 'Web App' | 'Mobile App' | 'Automated System';
}

export interface DesignShareRecord {
  id: string;
  sharedBy: string;
  sharedByRole: string;
  targetClientId: string;
  targetClientName: string;
  targetPhone: string;
  designsCount: number;
  designIds: string[];
  designNames: string[];
  timestamp: string;
  channel: 'WhatsApp' | 'Direct Link' | 'PDF Lookbook';
  wasViewed: boolean;
  viewCount: number;
  wasOrdered: boolean;
  orderId?: string;
}

export interface DiscountRequest {
  id: string;
  orderId: string;
  clientId: string;
  clientName?: string;
  clientCity?: string;
  requestedBy: string;
  salesmanId?: string;
  salesmanName?: string;
  defaultPercent: number;
  requestedPercent: number;
  approvedPercent?: number | null;
  orderSubtotal: number;
  pairs: number;
  productSummary?: string;
  marginConcession: number;
  projectedMarginPercent?: number | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  decidedBy?: string | null;
  decidedAt?: string | null;
  decisionNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountRequestStats {
  pendingCount: number;
  pendingConcessionTotal: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  totalRequests: number;
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'payment' | 'invoice' | 'opening';
  typeLabel: string;
  refNo: string;
  particulars: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export * from './database.types';


