import React from 'react';
import {
  LayoutDashboard,
  Users,
  Store,
  Footprints,
  ShoppingBag,
  Package,
  Factory,
  UserRound,
  IndianRupee,
  Wallet,
  HandCoins,
  CalendarClock,
  MapPin,
  BarChart3,
  Bell,
  History,
  Settings,
  Search,
  Share2,
  MessageCircle,
  Phone,
  Mail,
  Plus,
  Pencil,
  Archive,
  Trash2,
  SlidersHorizontal,
  Download,
  Printer,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Hammer,
  Truck,
  PackageCheck,
  CircleCheck,
  Clock,
  AlertTriangle,
  FileText,
  Banknote,
  Smartphone,
  Landmark,
  ScrollText,
  Calendar,
  StickyNote,
  Activity,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Eye,
  LogOut,
  Sparkles,
  ArrowUpDown,
  Filter,
  Check,
  type LucideIcon,
} from 'lucide-react';

/**
 * SoleFlow Unified Icon System (Stroke 1.5, Outline only)
 * Follows the strict 1:1 concept mapping per Design Rules
 */
export const Icons = {
  // Navigation & Core Entities
  Dashboard: LayoutDashboard,
  Clients: Users,
  ClientSingle: Store,
  Designs: Footprints,
  Orders: ShoppingBag,
  OrderItems: Package,
  Manufacturers: Factory,
  Salesmen: UserRound,
  Payments: IndianRupee,
  Receivables: Wallet,
  Collections: HandCoins,
  FollowUps: CalendarClock,
  Visits: MapPin,
  Reports: BarChart3,
  Notifications: Bell,
  AuditLog: History,
  Settings: Settings,
  Search: Search,
  Landing: Sparkles,

  // Actions
  Add: Plus,
  Edit: Pencil,
  Archive: Archive,
  Delete: Trash2,
  Filter: SlidersHorizontal,
  Export: Download,
  Print: Printer,
  More: MoreHorizontal,
  Share: Share2,
  WhatsApp: MessageCircle,
  Phone: Phone,
  Email: Mail,
  View: Eye,
  Logout: LogOut,
  Close: X,
  Check: Check,
  Sort: ArrowUpDown,
  ChevronDown: ChevronDown,
  ChevronRight: ChevronRight,
  ChevronLeft: ChevronLeft,

  // Status Lifecycle
  Status: {
    Draft: FileText,
    UnderReview: Clock,
    Confirmed: CheckCircle2,
    InProduction: Hammer,
    ReadyQC: Package,
    ReadyToDispatch: PackageCheck,
    Dispatched: Truck,
    Delivered: PackageCheck,
    Cancelled: XCircle,
    OnHold: PauseCircle,
    Paid: CircleCheck,
    Pending: Clock,
    Overdue: AlertTriangle,
  },

  // Payment Methods
  Method: {
    Cash: Banknote,
    UPI: Smartphone,
    BankTransfer: Landmark,
    Cheque: ScrollText,
    RTGS: Landmark,
    NEFT: Landmark,
  },

  // Record Meta & Details
  Meta: {
    City: MapPin,
    Date: Calendar,
    Notes: StickyNote,
    Activity: Activity,
    Amount: IndianRupee,
    User: UserRound,
    Store: Store,
  },
} as const;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: LucideIcon;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  icon: Component,
  size = 16,
  className = '',
  strokeWidth = 1.5,
  ...props
}) => {
  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={`shrink-0 ${className}`}
      {...props}
    />
  );
};
