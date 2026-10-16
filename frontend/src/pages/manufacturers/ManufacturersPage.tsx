import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Manufacturer, Order } from '../../types';
import { manufacturersService } from '../../services/manufacturers';
import { ordersService } from '../../services/orders';
import ManufacturersKpiCards from '../../components/manufacturers/ManufacturersKpiCards';
import { OrderInspectDrawer } from '../../components/orders/OrderInspectDrawer';
import { EmptyState, Button } from '../../components/ui';
import { Icons } from '../../lib/icons';
import {
  Home,
  ChevronRight,
  Clock,
  Building2,
  BarChart2,
  ArrowRight,
  MoreVertical,
  Layers,
  MapPin,
  ShieldCheck,
  Search,
  X,
  Phone,
  User,
  Copy,
  Check,
  ExternalLink,
  Eye,
  Wrench,
  Sparkles,
} from 'lucide-react';

interface ManufacturersPageProps {
  onNavigate: (path: string) => void;
}

const getInitials = (name: string | undefined): string => {
  return (
    (name || '')
      .replace(/__AUDIT_TEST__/g, '')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '—'
  );
};

const getStatusType = (status: string): 'in_production' | 'delivered' | 'under_review' => {
  if (status === 'Delivered') return 'delivered';
  if (['Draft', 'Submitted', 'Under Review'].includes(status)) return 'under_review';
  return 'in_production';
};

/* =========================================================================
   Plant Analytics & Operations Detail Modal
   ========================================================================= */
interface PlantAnalyticsModalProps {
  plant: Manufacturer | null;
  orders: Order[];
  onClose: () => void;
  onInspectOrder: (order: Order) => void;
  onNavigateOrders: () => void;
}

const PlantAnalyticsModal: React.FC<PlantAnalyticsModalProps> = ({
  plant,
  orders,
  onClose,
  onInspectOrder,
  onNavigateOrders,
}) => {
  const { showToast } = useApp();
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!plant) return null;

  const plantOrders = orders.filter((o) => o.manufacturerId === plant.id);
  const totalValue = plantOrders.reduce((sum, o) => sum + (o.netPayable || 0), 0);
  const loadPct = Math.min(100, Math.max(0, plant.loadPercentage || 0));

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!plant.phone) return;
    navigator.clipboard?.writeText(plant.phone).then(() => {
      setCopiedPhone(true);
      showToast('Phone number copied to clipboard');
      setTimeout(() => setCopiedPhone(false), 2000);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plant-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 duration-200"
      >
        {/* Mobile Pull Handle */}
        <div className="sm:hidden w-12 h-1.5 rounded-full bg-muted-foreground/30 mx-auto mt-2.5 mb-0.5" />
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-border flex items-start justify-between gap-3 bg-muted/20">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center text-sm font-bold shrink-0">
              {getInitials(plant.companyName)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="plant-modal-title" className="text-lg sm:text-xl font-bold text-foreground leading-tight truncate">
                  {plant.companyName || '—'}
                </h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    plant.status === 'Near Full'
                      ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/50'
                      : plant.status === 'Maintenance'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50'
                  }`}
                >
                  {plant.status || 'Active'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5">
                <MapPin size={13} className="text-blue-500 shrink-0" />
                <span>{plant.hubLocation || '—'}</span>
                {plant.estYear && <span>• Est. {plant.estYear}</span>}
                <span>• Code: {plant.id}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Key Contact & Tooling Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-muted/30 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100/60 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                <User size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  General Manager
                </span>
                <span className="font-semibold text-foreground truncate block">
                  {plant.generalManager || 'Operations Lead'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-3 sm:pl-3 sm:border-l border-border">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Phone size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Contact Phone
                  </span>
                  <a
                    href={plant.phone ? `tel:${plant.phone}` : undefined}
                    className="font-mono font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate block"
                  >
                    {plant.phone || '—'}
                  </a>
                </div>
              </div>
              {plant.phone && (
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Copy Phone"
                >
                  {copiedPhone ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              )}
            </div>
          </div>

          {/* Operational Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-surface rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase mb-1">
                <Clock size={12} className="text-emerald-500" />
                <span>On-Time Rate</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-foreground">
                {plant.onTimeDeliveryRate || 0}%
              </p>
              <span className="text-[10px] text-muted-foreground">Bilty punctuality</span>
            </div>

            <div className="p-3 bg-surface rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase mb-1">
                <ShieldCheck size={12} className="text-blue-500" />
                <span>QC Pass Ratio</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-foreground">
                {plant.qcPassRatio || 0}%
              </p>
              <span className="text-[10px] text-muted-foreground">Inspection audit</span>
            </div>

            <div className="p-3 bg-surface rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase mb-1">
                <Building2 size={12} className="text-purple-500" />
                <span>Active Molds</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-foreground">
                {plant.moldsActiveCount ?? 0}
              </p>
              <span className="text-[10px] text-muted-foreground">In tooling lineup</span>
            </div>

            <div className="p-3 bg-surface rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase mb-1">
                <Wrench size={12} className="text-amber-500" />
                <span>Tooling Lead</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-foreground">
                {plant.toolingLeadTimeDays || 0}d
              </p>
              <span className="text-[10px] text-muted-foreground">Mold setup turnaround</span>
            </div>
          </div>

          {/* Assembly Line Utilization Gauge */}
          <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-500" />
                Assembly Line Load &amp; Capacity
              </span>
              <span className="font-bold text-foreground font-mono">
                {loadPct}% ({((plant.monthlyCapacityPairs || 0) * (loadPct / 100)).toLocaleString('en-IN', { maximumFractionDigits: 0 })} / {(plant.monthlyCapacityPairs || 0).toLocaleString('en-IN')} pairs/mo)
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  loadPct >= 85 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${loadPct}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Core Specialization: <span className="font-medium text-foreground">{plant.primarySpecialization || 'Full Footwear Range'}</span>
            </p>
          </div>

          {/* Currently Allocated Batches Quick Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-xs sm:text-sm flex items-center gap-1.5">
                <Layers size={15} className="text-blue-500" />
                Allocated Batches ({plantOrders.length})
              </h3>
              <span className="text-xs font-mono font-semibold text-muted-foreground">
                Total ₹{totalValue.toLocaleString('en-IN')}
              </span>
            </div>

            {plantOrders.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center border border-dashed border-border rounded-xl">
                No orders currently assigned to this facility.
              </p>
            ) : (
              <div className="divide-y divide-border border border-border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                {plantOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      onClose();
                      onInspectOrder(ord);
                    }}
                    className="p-2.5 sm:p-3 flex items-center justify-between hover:bg-muted/40 transition-colors cursor-pointer gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                          {ord.id}
                        </span>
                        <span className="text-xs font-medium text-foreground truncate">
                          {ord.customerName}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {ord.items?.[0]?.designName || 'Footwear Batch'} • {ord.pairsCount || 0} Pairs
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-xs text-foreground">
                        ₹{Number(ord.netPayable || 0).toLocaleString('en-IN')}
                      </span>
                      <Eye size={14} className="text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateOrders();
            }}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Browse All Orders</span>
            <ExternalLink size={13} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   Order Action Menu Component
   ========================================================================= */
interface OrderActionMenuProps {
  order: Order;
  onInspect: () => void;
  onViewAllOrders: () => void;
}

const OrderActionMenu: React.FC<OrderActionMenuProps> = ({ order, onInspect, onViewAllOrders }) => {
  const { showToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(order.id).then(() => {
      showToast(`Order ID ${order.id} copied to clipboard`);
      setIsOpen(false);
    });
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        aria-label="Order actions"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl bg-surface border border-border shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onInspect();
            }}
            className="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-muted flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Eye size={14} className="text-blue-500" />
            <span>Inspect Details</span>
          </button>
          <button
            type="button"
            onClick={handleCopyId}
            className="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-muted flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Copy size={14} className="text-emerald-500" />
            <span>Copy Order ID</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onViewAllOrders();
            }}
            className="w-full px-3 py-2 text-left text-xs text-foreground hover:bg-muted flex items-center gap-2 cursor-pointer transition-colors border-t border-border mt-1 pt-1.5"
          >
            <ExternalLink size={14} className="text-purple-500" />
            <span>View All Orders</span>
          </button>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   Main ManufacturersPage Component
   ========================================================================= */
export const ManufacturersPage: React.FC<ManufacturersPageProps> = ({ onNavigate }) => {
  const {
    manufacturers: contextManufacturers,
    setManufacturers: setContextManufacturers,
    setIsAddManufacturerModalOpen,
  } = useApp();

  const [manufacturers, setManufacturers] = useState<Manufacturer[]>(contextManufacturers || []);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active Plants' | 'Near Full' | 'Maintenance'>('all');
  const [batchSearchQuery, setBatchSearchQuery] = useState('');
  const [batchStatusFilter, setBatchStatusFilter] = useState<'all' | 'in_production' | 'delivered' | 'under_review'>('all');

  // Modals & Drawers
  const [analyticsPlant, setAnalyticsPlant] = useState<Manufacturer | null>(null);
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (contextManufacturers && contextManufacturers.length > 0) {
      setManufacturers(contextManufacturers);
      const apex = contextManufacturers.find((m) => m.companyName.includes('Apex'));
      setSelectedPlantId((prev) => prev || apex?.id || contextManufacturers[1]?.id || contextManufacturers[0].id);
    }
  }, [contextManufacturers]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([manufacturersService.fetchManufacturers(), ordersService.fetchOrders()])
      .then(([mfgs, ords]) => {
        if (cancelled) return;
        if (mfgs && mfgs.length > 0) {
          setManufacturers(mfgs);
          setContextManufacturers(mfgs);
          const apex = mfgs.find((m) => m.companyName.includes('Apex'));
          setSelectedPlantId((prev) => prev || apex?.id || mfgs[1]?.id || mfgs[0]?.id || null);
        }
        setOrders(ords);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Filtered plants
  const filteredManufacturers = useMemo(() => {
    return manufacturers.filter((plant) => {
      if (statusFilter !== 'all' && plant.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        plant.companyName?.toLowerCase().includes(q) ||
        plant.hubLocation?.toLowerCase().includes(q) ||
        plant.primarySpecialization?.toLowerCase().includes(q) ||
        plant.generalManager?.toLowerCase().includes(q)
      );
    });
  }, [manufacturers, searchQuery, statusFilter]);

  const selectedPlant = useMemo(() => {
    return manufacturers.find((p) => p.id === selectedPlantId) || filteredManufacturers[0] || manufacturers[0];
  }, [manufacturers, selectedPlantId, filteredManufacturers]);

  // Orders for selected plant
  const plantOrders = useMemo(() => {
    if (!selectedPlant) return [];
    return orders.filter((o) => o.manufacturerId === selectedPlant.id);
  }, [selectedPlant, orders]);

  // Filtered batches inside selected plant
  const filteredPlantOrders = useMemo(() => {
    return plantOrders.filter((order) => {
      if (batchStatusFilter !== 'all' && getStatusType(order.status) !== batchStatusFilter) {
        return false;
      }
      if (!batchSearchQuery.trim()) return true;
      const q = batchSearchQuery.toLowerCase().trim();
      const firstItem = order.items?.[0];
      return (
        order.id.toLowerCase().includes(q) ||
        order.customerName?.toLowerCase().includes(q) ||
        order.customerCity?.toLowerCase().includes(q) ||
        firstItem?.designName?.toLowerCase().includes(q) ||
        firstItem?.articleCode?.toLowerCase().includes(q)
      );
    });
  }, [plantOrders, batchSearchQuery, batchStatusFilter]);

  // KPI Calculations
  const totalCapacityPairs = useMemo(() => {
    return manufacturers.reduce((sum, m) => sum + (m.monthlyCapacityPairs || 0), 0);
  }, [manufacturers]);

  const avgOnTimeRate = useMemo(() => {
    return manufacturers.length > 0
      ? manufacturers.reduce((sum, m) => sum + (m.onTimeDeliveryRate || 0), 0) / manufacturers.length
      : 0;
  }, [manufacturers]);

  const avgQcPassRatio = useMemo(() => {
    return manufacturers.length > 0
      ? manufacturers.reduce((sum, m) => sum + (m.qcPassRatio || 0), 0) / manufacturers.length
      : 0;
  }, [manufacturers]);

  const getStatusBadge = (statusType: string, label: string) => {
    switch (statusType) {
      case 'in_production':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>{label}</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{label}</span>
          </span>
        );
      case 'under_review':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>{label}</span>
          </span>
        );
    }
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto pb-24 md:pb-12 bg-background text-foreground">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium">
        <button
          type="button"
          onClick={() => onNavigate('/admin/dashboard')}
          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1.5"
        >
          <Home size={14} className="text-blue-600 dark:text-blue-400" />
          <span>Dashboard</span>
        </button>
        <span className="text-slate-400">/</span>
        <span className="text-slate-400 dark:text-slate-500 font-medium">
          Foundries &amp; Plants
        </span>
      </div>

      {/* 2. Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Manufacturing Plants &amp; Foundries</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-800">
              {manufacturers.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 mt-1 font-normal">
            OEM partner plants &amp; foundries, assembly line capacity utilization, and QC ratings.
          </p>
        </div>

        {/* Global Plant Search Bar & Add Manufacturer Action */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72 shrink-0">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search plant, hub, or GM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-foreground placeholder:text-slate-400 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-foreground p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsAddManufacturerModalOpen(true)}
            className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Icons.Add size={15} />
            <span className="hidden sm:inline">Add Manufacturer</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* 3. 4 KPI Summary Cards Row */}
      <ManufacturersKpiCards
        totalUnitsCount={manufacturers.length}
        cumulativeCapacity={
          totalCapacityPairs > 0 ? `${totalCapacityPairs.toLocaleString('en-IN')} Prs/...` : '70,000 Prs/...'
        }
        onTimeRate={manufacturers.length > 0 ? `${avgOnTimeRate.toFixed(1)}%` : '95.8%'}
        qcPassRate={manufacturers.length > 0 ? `${avgQcPassRatio.toFixed(1)}%` : '98.3%'}
      />

      {/* 4. Plants Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {(
            [
              { key: 'all', label: 'All Plants', count: manufacturers.length },
              {
                key: 'Active Plants',
                label: 'Active Plants',
                count: manufacturers.filter((m) => m.status === 'Active Plants').length,
              },
              {
                key: 'Near Full',
                label: 'Near Full',
                count: manufacturers.filter((m) => m.status === 'Near Full').length,
              },
              {
                key: 'Maintenance',
                label: 'Maintenance',
                count: manufacturers.filter((m) => m.status === 'Maintenance').length,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-card text-slate-700 dark:text-slate-300 hover:text-foreground hover:bg-slate-50 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-xs ${statusFilter === tab.key ? 'text-white' : 'text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {filteredManufacturers.length > 0 && (
          <p className="text-xs text-slate-500 hidden sm:block">
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredManufacturers.length}</span> foundries
          </p>
        )}
      </div>

      {/* 5. Plants Grid or Loading/Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted/40 border border-border" />
          ))}
        </div>
      ) : filteredManufacturers.length === 0 ? (
        <EmptyState
          icon={Icons.Manufacturers}
          title={searchQuery ? 'No matching partner foundries found' : 'No manufacturers added yet'}
          description={
            searchQuery
              ? `No plant matching "${searchQuery}". Clear your search or filter.`
              : 'Add your partner plants & foundries to allocate production batches.'
          }
          action={
            searchQuery || statusFilter !== 'all' ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            ) : (
              <Button
                variant="primary"
                icon={Icons.Add}
                onClick={() => setIsAddManufacturerModalOpen(true)}
              >
                Add Manufacturer
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredManufacturers.map((plant) => {
            const isSelected = selectedPlant?.id === plant.id;
            const loadPct = Math.min(100, Math.max(0, plant.loadPercentage || 0));

            return (
              <div
                key={plant.id}
                onClick={() => setSelectedPlantId(plant.id)}
                className="bg-white dark:bg-card border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Plant Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-sm font-bold shrink-0">
                        {getInitials(plant.companyName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[220px] sm:max-w-xs"
                            title={plant.companyName}
                          >
                            {plant.companyName || '—'}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                              plant.status === 'Near Full'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/50'
                                : plant.status === 'Maintenance'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50'
                            }`}
                          >
                            {plant.status || '—'}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
                              Active Focus
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-1">
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={13} className="text-blue-500 shrink-0" />
                            <span>{plant.hubLocation || '—'}</span>
                          </span>
                          {plant.estYear && (
                            <>
                              <span className="text-slate-400">•</span>
                              <span>Est. {plant.estYear}</span>
                            </>
                          )}
                          {plant.generalManager && (
                            <>
                              <span className="text-slate-400 hidden sm:inline">•</span>
                              <span className="hidden sm:inline">GM: {plant.generalManager}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAnalyticsPlant(plant);
                      }}
                      className="w-9 h-9 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100/60 dark:border-blue-900/40 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                      title="View Plant Analytics & Operations"
                      aria-label="View Plant Analytics"
                    >
                      <BarChart2 size={18} />
                    </button>
                  </div>

                  {/* Core Specialization & Tooling Box */}
                  <div className="p-3.5 bg-slate-50/80 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 mt-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                        CORE SPECIALIZATION
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-1 truncate">
                        {plant.primarySpecialization || '—'}
                      </span>
                    </div>
                    {plant.toolingLeadTimeDays && (
                      <div className="sm:text-right shrink-0">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block sm:text-right">
                          TOOLING LEAD
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white block mt-1 sm:text-right">
                          {plant.toolingLeadTimeDays} Days
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Assembly Line Utilization Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Assembly Line Utilization</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {`${loadPct}% (${(plant.monthlyCapacityPairs || 0).toLocaleString('en-IN')} prs/mo)`}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          loadPct >= 85 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${loadPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4 text-center">
                  {/* On-Time */}
                  <div
                    className="p-2.5 sm:p-3 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2.5 min-w-0"
                    title={`On-Time Delivery Rate: ${plant.onTimeDeliveryRate || 0}%`}
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Clock size={15} />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight truncate">
                        ON-TIME
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block leading-tight mt-0.5 truncate">
                        {plant.onTimeDeliveryRate || 0}%
                      </span>
                    </div>
                  </div>

                  {/* QC Pass */}
                  <div
                    className="p-2.5 sm:p-3 bg-blue-50/40 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-2.5 min-w-0"
                    title={`QC Pass Ratio: ${plant.qcPassRatio || 0}%`}
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100/60 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <ShieldCheck size={15} />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight truncate">
                        QC PASS
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block leading-tight mt-0.5 truncate">
                        {plant.qcPassRatio || 0}%
                      </span>
                    </div>
                  </div>

                  {/* Active Molds */}
                  <div
                    className="p-2.5 sm:p-3 bg-purple-50/40 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/30 flex items-center gap-2.5 min-w-0"
                    title={`Active Molds: ${plant.moldsActiveCount ?? 0}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-purple-100/60 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Building2 size={15} />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight truncate">
                        MOLDS
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block leading-tight mt-0.5 truncate">
                        {plant.moldsActiveCount ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Matching Screenshot */}
                <div className="flex items-center gap-2.5 mt-4" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      setAnalyticsPlant(plant);
                    }}
                    className="flex-1 h-10 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <span>View Details</span>
                    <ArrowRight size={14} />
                  </button>

                  <a
                    href={
                      plant.phone
                        ? `https://wa.me/${plant.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${plant.generalManager || 'Operations Team'}, regarding batch orders at ${plant.companyName}:`
                          )}`
                        : undefined
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 h-10 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 shadow-xs cursor-pointer"
                    title="Message on WhatsApp"
                  >
                    <Icons.WhatsApp size={15} />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setAnalyticsPlant(plant);
                    }}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
                    title="More actions"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Bottom Panel: Active Batches Allocated */}
      <div className="bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden">
        {/* Table Panel Header */}
        <div className="p-4 sm:p-5 md:px-6 md:py-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
              <Layers size={20} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-foreground leading-tight truncate">
                Active Batches Allocated to {selectedPlant?.companyName || 'Selected Plant'}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {plantOrders.length} wholesale order{plantOrders.length === 1 ? '' : 's'} assigned to this facility
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Search Filter for Orders in Selected Plant */}
            <div className="relative w-full sm:w-48 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search batches..."
                value={batchSearchQuery}
                onChange={(e) => setBatchSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs bg-muted/30 border border-border focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-foreground placeholder:text-muted-foreground/70"
              />
              {batchSearchQuery && (
                <button
                  type="button"
                  onClick={() => setBatchSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Status Filter for Orders */}
            <select
              aria-label="Filter batches by status"
              value={batchStatusFilter}
              onChange={(e) => setBatchStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg text-xs bg-muted/30 border border-border text-foreground font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="in_production">In Production</option>
              <option value="under_review">Under Review</option>
              <option value="delivered">Delivered</option>
            </select>

            <button
              type="button"
              onClick={() => onNavigate('/admin/orders')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>View All Orders</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Mobile Batch Cards View (Dedicated Phone View) */}
        <div className="md:hidden divide-y divide-border">
          {filteredPlantOrders.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={Icons.Orders}
                title={batchSearchQuery || batchStatusFilter !== 'all' ? 'No matching batches' : 'No orders allocated to this plant yet'}
                description={
                  batchSearchQuery || batchStatusFilter !== 'all'
                    ? 'Try resetting the batch search or status filter.'
                    : 'Orders assigned to this facility will appear here.'
                }
                action={
                  batchSearchQuery || batchStatusFilter !== 'all' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setBatchSearchQuery('');
                        setBatchStatusFilter('all');
                      }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            filteredPlantOrders.map((order) => {
              const firstItem = order.items?.[0];
              const articleName = firstItem?.designName || firstItem?.articleCode || 'Footwear Batch';
              const pairs = Number(order.pairsCount || 0);
              const cartons = Number(order.cartonsCount || 0);

              return (
                <div
                  key={order.id}
                  onClick={() => setInspectOrder(order)}
                  className="p-3.5 hover:bg-muted/30 transition-colors cursor-pointer space-y-2.5 active:bg-muted/50"
                >
                  {/* Top Bar: Order ID, Date, Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50">
                        {order.id}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate">
                        • {order.orderDate || '—'}
                      </span>
                    </div>
                    {getStatusBadge(getStatusType(order.status), order.status)}
                  </div>

                  {/* Customer & Article Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-foreground truncate">
                        {order.customerName || '—'}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                        <MapPin size={11} className="text-muted-foreground/70 shrink-0" />
                        <span>{order.customerCity || '—'}</span>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="font-medium text-foreground">{articleName}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Net Value</span>
                      <span className="font-mono font-bold text-sm text-foreground block">
                        ₹{Number(order.netPayable || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Batch Volume & Inspect CTA */}
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border/40">
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                      <Layers size={13} className="text-blue-500" />
                      <span>{pairs.toLocaleString('en-IN')} Pairs</span>
                      {cartons > 0 && <span className="text-muted-foreground/70">({cartons} ctns)</span>}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectOrder(order);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Inspect Batch</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Data Table (Hidden on Phone View) */}
        <div className="hidden md:block overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs sm:text-sm min-w-[680px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold uppercase text-[11px] tracking-wider bg-muted/25">
                <th className="py-3.5 px-4 md:px-6">Order ID</th>
                <th className="py-3.5 px-4">Customer Store</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Articles</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Net Value</th>
                <th className="py-3.5 px-4 md:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPlantOrders.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Icons.Orders}
                      title={batchSearchQuery || batchStatusFilter !== 'all' ? 'No matching batches' : 'No orders allocated to this plant yet'}
                      description={
                        batchSearchQuery || batchStatusFilter !== 'all'
                          ? 'Try resetting the batch search or status filter.'
                          : 'Orders assigned to this manufacturer will appear here.'
                      }
                      action={
                        batchSearchQuery || batchStatusFilter !== 'all' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setBatchSearchQuery('');
                              setBatchStatusFilter('all');
                            }}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            Reset Filter
                          </button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredPlantOrders.map((order) => {
                  const firstItem = order.items?.[0];
                  const articles = firstItem?.designName || firstItem?.articleCode || '—';

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setInspectOrder(order)}
                      className="hover:bg-muted/40 transition-colors cursor-pointer group"
                    >
                      {/* Order ID */}
                      <td className="py-3.5 px-4 md:px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50 group-hover:border-blue-400">
                          {order.id}
                        </span>
                      </td>

                      {/* Customer Store */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {getInitials(order.customerName)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-foreground text-xs sm:text-sm leading-tight truncate max-w-[140px] sm:max-w-[200px]">
                              {order.customerName || '—'}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                              {order.customerCity || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {order.orderDate || '—'}
                      </td>

                      {/* Articles */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground text-xs sm:text-sm leading-tight truncate max-w-[160px] sm:max-w-[220px]">
                          {articles}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 whitespace-nowrap">
                          {`${Number(order.pairsCount || 0)} Pairs (${Number(order.cartonsCount || 0)} Ctns)`}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(getStatusType(order.status), order.status)}
                      </td>

                      {/* Net Value */}
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-foreground text-xs sm:text-sm whitespace-nowrap">
                        ₹{Number(order.netPayable || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 md:px-6 text-right whitespace-nowrap">
                        <OrderActionMenu
                          order={order}
                          onInspect={() => setInspectOrder(order)}
                          onViewAllOrders={() => onNavigate('/admin/orders')}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Plant Analytics Modal */}
      {analyticsPlant && (
        <PlantAnalyticsModal
          plant={analyticsPlant}
          orders={orders}
          onClose={() => setAnalyticsPlant(null)}
          onInspectOrder={(order) => setInspectOrder(order)}
          onNavigateOrders={() => onNavigate('/admin/orders')}
        />
      )}

      {/* 8. Order Inspect Drawer */}
      {inspectOrder && (
        <OrderInspectDrawer
          order={inspectOrder}
          open={!!inspectOrder}
          onClose={() => setInspectOrder(null)}
          onOpenFullDetail={() => onNavigate('/admin/orders')}
        />
      )}
    </div>
  );
};
