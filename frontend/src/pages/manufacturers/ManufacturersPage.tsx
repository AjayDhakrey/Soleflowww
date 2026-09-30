import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Manufacturer } from '../../types';
import {
  Users,
  TrendingUp,
  Truck,
  ShieldCheck,
  ChevronRight,
  Clock,
  Building2,
  BarChart2,
  ArrowRight,
  MoreVertical,
  Layers,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface ManufacturersPageProps {
  onNavigate: (path: string) => void;
}

const PLANT_DATA = [
  {
    id: 'mfg-1',
    name: 'Apex Footwear Works',
    status: 'Active Plants',
    statusType: 'active',
    hubLocation: 'Agra Hub, UP • Est. 2011',
    specialization: 'Vulcanized Sneakers & Strobel Running Shoes',
    utilization: 74,
    capacityText: '74% (8,200 prs/mo)',
    barColor: 'bg-emerald-500',
    onTime: '96.4%',
    qcPass: '99.2%',
    activeMolds: 14,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'mfg-2',
    name: 'Metro Leather Crafts',
    status: 'Near Full',
    statusType: 'near_full',
    hubLocation: 'Kanpur Industrial Zone, UP',
    specialization: 'Goodyear Welt Derby & Oiled Chelsea Boots',
    utilization: 88,
    capacityText: '88% (4,500 prs/mo)',
    barColor: 'bg-amber-500',
    onTime: '94.1%',
    qcPass: '98.7%',
    activeMolds: 14,
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'mfg-3',
    name: 'Zenith Polyurethanes',
    status: 'Active Plants',
    statusType: 'active',
    hubLocation: 'Dongguan Technical Park • Tooling Hub',
    specialization: 'Dual-density EVA Outsoles & Mold Tooling',
    utilization: 65,
    capacityText: '65% (15,000 prs/mo)',
    barColor: 'bg-teal-500',
    onTime: '98.2%',
    qcPass: '99.6%',
    activeMolds: 14,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'mfg-4',
    name: 'Taj Heritage Craft',
    status: 'Active Plants',
    statusType: 'active',
    hubLocation: 'Agra Unit 1 • Traditional Crust Finishing',
    specialization: 'Italian Hand Crust Patina & Blake Stitching',
    utilization: 62,
    capacityText: '62% (3,800 prs/mo)',
    barColor: 'bg-purple-600',
    onTime: '92.8%',
    qcPass: '99%',
    activeMolds: 14,
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=160&q=80',
  },
];

const BATCH_ORDERS = [
  {
    id: 'ORD-0148',
    initials: 'AF',
    customerStore: 'ABC Footwear',
    location: 'Agra',
    date: '24 Sep 2026',
    articles: 'Runner Classic',
    volume: '200 Pairs (16 Ctns)',
    status: 'In Production',
    statusType: 'in_production',
    netValue: '₹2,66,000',
  },
  {
    id: 'ORD-0146',
    initials: 'DW',
    customerStore: 'Delhi Walkways Hub',
    location: 'New Delhi',
    date: '22 Sep 2026',
    articles: 'AeroGlide Knit Runner',
    volume: '120 Pairs (10 Ctns)',
    status: 'Delivered',
    statusType: 'delivered',
    netValue: '₹1,47,840',
  },
  {
    id: 'ORD-0145',
    initials: 'AF',
    customerStore: 'ABC Footwear Hub',
    location: 'Agra',
    date: '19 Sep 2026',
    articles: 'Verona Derby & Runners',
    volume: '320 Pairs (26 Ctns)',
    status: 'Under Review',
    statusType: 'under_review',
    netValue: '₹6,12,864',
  },
];

export const ManufacturersPage: React.FC<ManufacturersPageProps> = ({ onNavigate }) => {
  const { showToast } = useApp();
  const [selectedPlantId, setSelectedPlantId] = useState('mfg-1');

  const selectedPlant = PLANT_DATA.find((p) => p.id === selectedPlantId) || PLANT_DATA[0];

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
            Agra &amp; Kanpur OEM partner foundries, production line utilization, and QC ratings.
          </p>
        </div>
      </div>

      {/* 3. 4 KPI Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Partner Foundries */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-border/80 transition-all flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users size={22} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Partner Foundries</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight">
                4 Units
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5">
                Agra, Kanpur &amp; Delhi hubs
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-foreground/50 mt-1" />
        </div>

        {/* Card 2: Cumulative Capacity */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-border/80 transition-all flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center shrink-0">
              <TrendingUp size={22} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Cumulative Capacity</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight">
                32K Prs/Mo
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5">
                Across all assembly lines
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-foreground/50 mt-1" />
        </div>

        {/* Card 3: Average On-Time Delivery */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-border/80 transition-all flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Truck size={22} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Average On-Time Delivery</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight">
                95%
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5">
                Bilty dispatch punctuality
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-foreground/50 mt-1" />
        </div>

        {/* Card 4: Average QC Pass Ratio */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-border/80 transition-all flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={22} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Average QC Pass Ratio</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 tracking-tight">
                99.2%
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5">
                Zero-defect sole bonding
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-foreground/50 mt-1" />
        </div>
      </div>

      {/* 4. Plants 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {PLANT_DATA.map((plant) => {
          const isSelected = selectedPlantId === plant.id;

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
                  <img
                    src={plant.image}
                    alt={plant.name}
                    className="w-12 h-12 rounded-full object-cover border border-border shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                        {plant.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          plant.statusType === 'near_full'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/50'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50'
                        }`}
                      >
                        {plant.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin size={13} className="text-blue-500 shrink-0" />
                      <span>{plant.hubLocation}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast(`Analytics for ${plant.name}`);
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
                  {plant.specialization}
                </span>
              </div>

              {/* Assembly Line Utilization */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-muted-foreground font-medium">Assembly Line Utilization</span>
                  <span className="font-bold text-foreground">
                    {plant.capacityText}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${plant.barColor}`}
                    style={{ width: `${plant.utilization}%` }}
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
                      {plant.onTime}
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
                      {plant.qcPass}
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
                      {plant.activeMolds}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Bottom Panel: Active Batches Allocated */}
      <div className="bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-5 md:px-6 md:py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
              <Layers size={20} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-tight">
                Active Batches Allocated to {selectedPlant.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                3 wholesale orders scheduled on factory assembly floor
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
              {BATCH_ORDERS.map((order) => (
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
                        {order.initials}
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-xs sm:text-sm leading-tight">
                          {order.customerStore}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {order.location}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                    {order.date}
                  </td>

                  {/* Articles */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-foreground text-xs sm:text-sm leading-tight">
                      {order.articles}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {order.volume}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(order.statusType, order.status)}
                  </td>

                  {/* Net Value */}
                  <td className="py-3.5 px-4 text-right font-bold font-mono text-foreground text-xs sm:text-sm">
                    {order.netValue}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
