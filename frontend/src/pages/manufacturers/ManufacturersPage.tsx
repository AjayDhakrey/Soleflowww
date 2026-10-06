import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Manufacturer, Order } from '../../types';
import { manufacturersService } from '../../services/manufacturers';
import { ordersService } from '../../services/orders';
import ManufacturersKpiCards from '../../components/manufacturers/ManufacturersKpiCards';
import { EmptyState } from '../../components/ui';
import { Icons } from '../../lib/icons';
import {
  ChevronRight,
  Clock,
  Building2,
  BarChart2,
  ArrowRight,
  MoreVertical,
  Layers,
  MapPin,
  ShieldCheck,
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

export const ManufacturersPage: React.FC<ManufacturersPageProps> = ({ onNavigate }) => {
  const { showToast } = useApp();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  // Real data only: plants and orders come from the server, never from fixtures.
  useEffect(() => {
    let cancelled = false;

    Promise.all([manufacturersService.fetchManufacturers(), ordersService.fetchOrders()])
      .then(([mfgs, ords]) => {
        if (cancelled) return;
        setManufacturers(mfgs);
        setOrders(ords);
        setSelectedPlantId(mfgs[0]?.id ?? null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPlant =
    manufacturers.find((p) => p.id === selectedPlantId) || manufacturers[0];

  const plantOrders = selectedPlant
    ? orders.filter((o) => o.manufacturerId === selectedPlant.id)
    : [];

  const totalCapacityPairs = manufacturers.reduce(
    (sum, m) => sum + (m.monthlyCapacityPairs || 0),
    0
  );
  const avgOnTimeRate =
    manufacturers.length > 0
      ? manufacturers.reduce((sum, m) => sum + (m.onTimeDeliveryRate || 0), 0) / manufacturers.length
      : 0;
  const avgQcPassRatio =
    manufacturers.length > 0
      ? manufacturers.reduce((sum, m) => sum + (m.qcPassRatio || 0), 0) / manufacturers.length
      : 0;

  const getStatusBadge = (statusType: string, label: string) => {
    switch (statusType) {
      case 'in_production':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>{label}</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{label}</span>
          </span>
        );
      case 'under_review':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>{label}</span>
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto pb-24 md:pb-12 bg-background text-foreground">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <button
          type="button"
          onClick={() => onNavigate('/admin/dashboard')}
          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          Dashboard
        </button>
        <ChevronRight size={13} className="text-muted-foreground/60" />
        <span className="text-blue-600 dark:text-blue-400 font-semibold">
          Manufacturers &amp; Supply Chain
        </span>
      </div>

      {/* 2. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Manufacturing Plants &amp; Foundries
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            OEM partner plants &amp; foundries, production line utilization, and QC ratings.
          </p>
        </div>
      </div>

      {/* 3. 4 KPI Summary Cards Row */}
      <ManufacturersKpiCards
        totalUnitsCount={manufacturers.length}
        cumulativeCapacity={
          totalCapacityPairs > 0 ? `${totalCapacityPairs.toLocaleString('en-IN')} Prs/Mo` : '—'
        }
        onTimeRate={manufacturers.length > 0 ? `${avgOnTimeRate.toFixed(1)}%` : '—'}
        qcPassRate={manufacturers.length > 0 ? `${avgQcPassRatio.toFixed(1)}%` : '—'}
      />

      {/* 4. Plants 2x2 Grid */}
      {!isLoading && manufacturers.length === 0 ? (
        <EmptyState
          icon={Icons.Manufacturers}
          title="No manufacturers added yet"
          description="Add your partner plants & foundries to allocate production batches."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {manufacturers.map((plant) => {
            const isSelected = selectedPlant?.id === plant.id;
            const loadPct = Math.min(100, Math.max(0, plant.loadPercentage || 0));

            return (
              <div
                key={plant.id}
                onClick={() => setSelectedPlantId(plant.id)}
                className={`bg-surface border rounded-2xl p-5 md:p-6 shadow-2xs transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-border hover:border-border/80 hover:shadow-sm'
                }`}
              >
                {/* Plant Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-border flex items-center justify-center text-sm font-bold shrink-0">
                      {getInitials(plant.companyName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                          {plant.companyName || '—'}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            plant.status === 'Near Full'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/50'
                              : plant.status === 'Maintenance'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50'
                          }`}
                        >
                          {plant.status || '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin size={13} className="text-blue-500 shrink-0" />
                        <span>
                          {`${plant.hubLocation || '—'}${plant.estYear ? ` • Est. ${plant.estYear}` : ''}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      showToast(`Analytics for ${plant.companyName || 'plant'}`);
                    }}
                    className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center shrink-0 transition-colors"
                  >
                    <BarChart2 size={18} />
                  </button>
                </div>

                {/* Core Specialization Box */}
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border mt-4 text-xs">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">
                    Core Specialization
                  </span>
                  <span className="font-semibold text-foreground block mt-0.5">
                    {plant.primarySpecialization || '—'}
                  </span>
                </div>

                {/* Assembly Line Utilization */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground font-medium">Assembly Line Utilization</span>
                    <span className="font-bold text-foreground">
                      {`${loadPct}% (${(plant.monthlyCapacityPairs || 0).toLocaleString('en-IN')} prs/mo)`}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        loadPct >= 85 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${loadPct}%` }}
                    />
                  </div>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-2.5 pt-4 text-center">
                  {/* On-Time */}
                  <div className="p-2.5 bg-muted/30 rounded-xl border border-border flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Clock size={15} />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block leading-tight">
                        ON-TIME
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground block leading-tight mt-0.5">
                        {plant.onTimeDeliveryRate || 0}%
                      </span>
                    </div>
                  </div>

                  {/* QC Pass */}
                  <div className="p-2.5 bg-muted/30 rounded-xl border border-border flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <ShieldCheck size={15} />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block leading-tight">
                        QC PASS
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground block leading-tight mt-0.5">
                        {plant.qcPassRatio || 0}%
                      </span>
                    </div>
                  </div>

                  {/* Active Molds */}
                  <div className="p-2.5 bg-muted/30 rounded-xl border border-border flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Building2 size={15} />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block leading-tight">
                        ACTIVE MOLDS
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground block leading-tight mt-0.5">
                        {plant.moldsActiveCount ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Bottom Panel: Active Batches Allocated */}
      <div className="bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-5 md:px-6 md:py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
              <Layers size={20} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">
                Active Batches Allocated to {selectedPlant?.companyName || '—'}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {plantOrders.length} wholesale order{plantOrders.length === 1 ? '' : 's'} allocated to this plant
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/admin/orders')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
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
              {plantOrders.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Icons.Orders}
                      title="No orders allocated to this plant yet"
                      description="Orders assigned to this manufacturer will appear here."
                    />
                  </td>
                </tr>
              ) : (
                plantOrders.map((order) => {
                  const firstItem = order.items?.[0];
                  const articles = firstItem?.designName || firstItem?.articleCode || '—';

                  return (
                    <tr
                      key={order.id}
                      onClick={() => onNavigate('/admin/orders')}
                      className="hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      {/* Order ID */}
                      <td className="py-3.5 px-4 md:px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
                          {order.id}
                        </span>
                      </td>

                      {/* Customer Store */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {getInitials(order.customerName)}
                          </div>
                          <div>
                            <div className="font-bold text-foreground text-xs sm:text-sm leading-tight">
                              {order.customerName || '—'}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {order.customerCity || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                        {order.orderDate || '—'}
                      </td>

                      {/* Articles */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground text-xs sm:text-sm leading-tight">
                          {articles}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {`${Number(order.pairsCount || 0)} Pairs (${Number(order.cartonsCount || 0)} Ctns)`}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(getStatusType(order.status), order.status)}
                      </td>

                      {/* Net Value */}
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-foreground text-xs sm:text-sm">
                        ₹{Number(order.netPayable || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 md:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => showToast(`Actions for ${order.id}`)}
                          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
