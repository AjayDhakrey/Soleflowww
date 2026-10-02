import React from 'react';
import { Icons } from '../../lib/icons';

interface OrdersKpiCardsProps {
  totalOrdersCount: number;
  inProductionCount: number;
  readyDispatchCount: number;
  totalConsignmentValue: number | string;
  onNavigateAll?: () => void;
  onNavigateProduction?: () => void;
  onNavigateDispatch?: () => void;
  onNavigateValue?: () => void;
}

/* =========================================================================
   3D Claymorphic Vector SVGs for Wholesale Consignments & Orders
   ========================================================================= */

// 1. Total Orders (3D Green Order Clipboard + Cart + Checkmark Badge)
export const TotalOrders3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="ordGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="boardGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#ordGlow)" />

      {/* Sparkles */}
      <path d="M22 36L17 31" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 26L22 20" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

      {/* 3D Clipboard Body */}
      <g filter="drop-shadow(0 6px 10px rgba(4,120,87,0.35))">
        {/* Main Board */}
        <rect x="24" y="24" width="48" height="58" rx="10" fill="url(#boardGrad)" />
        {/* Top Metallic Clip */}
        <rect x="38" y="20" width="20" height="8" rx="3" fill="#A7F3D0" stroke="#047857" strokeWidth="1.5" />
        {/* White Paper Sheet */}
        <rect x="28" y="28" width="40" height="50" rx="6" fill="#FFFFFF" />

        {/* Shopping Cart Icon on Paper */}
        <path
          d="M38 42H41L44 52H56L59 45H43"
          stroke="#059669"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="46" cy="56" r="1.5" fill="#059669" />
        <circle cx="54" cy="56" r="1.5" fill="#059669" />

        {/* Order Lines */}
        <line x1="36" y1="62" x2="60" y2="62" stroke="#A7F3D0" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="36" y1="68" x2="52" y2="68" stroke="#A7F3D0" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Green Checkmark Badge on Bottom Right */}
      <g filter="drop-shadow(0 3px 5px rgba(4,120,87,0.4))">
        <circle cx="72" cy="72" r="11" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
        <path d="M67 72L70 75L77 68" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  </div>
);

// 2. In Production (3D Purple Factory Plant & Interlocking Gears)
export const InProduction3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="prodGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="factGradProd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="50%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#6B21A8" />
        </linearGradient>
        <linearGradient id="gearGradProd" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#prodGlow)" />

      {/* 3D Purple Factory */}
      <g filter="drop-shadow(0 6px 10px rgba(107,33,168,0.35))">
        {/* Factory Body */}
        <rect x="22" y="44" width="46" height="34" rx="6" fill="url(#factGradProd)" />
        {/* Chimneys */}
        <rect x="26" y="30" width="8" height="16" rx="2" fill="#7E22CE" />
        <rect x="38" y="24" width="10" height="22" rx="2" fill="#7E22CE" />
        <rect x="52" y="32" width="8" height="14" rx="2" fill="#7E22CE" />
        {/* Orange Chimney Tops */}
        <rect x="25" y="28" width="10" height="3" rx="1" fill="#F97316" />
        <rect x="37" y="22" width="12" height="3" rx="1" fill="#F97316" />
        <rect x="51" y="30" width="10" height="3" rx="1" fill="#F97316" />
        {/* Windows */}
        <rect x="28" y="52" width="6" height="6" rx="1.5" fill="#E9D5FF" />
        <rect x="38" y="52" width="6" height="6" rx="1.5" fill="#E9D5FF" />
        <rect x="48" y="52" width="6" height="6" rx="1.5" fill="#E9D5FF" />
        <rect x="28" y="62" width="6" height="6" rx="1.5" fill="#E9D5FF" />
        <rect x="38" y="62" width="6" height="6" rx="1.5" fill="#E9D5FF" />
        <rect x="48" y="62" width="6" height="6" rx="1.5" fill="#E9D5FF" />
      </g>

      {/* 3D Interlocking Gear Cogs on Right */}
      <g filter="drop-shadow(0 4px 6px rgba(126,34,206,0.4))">
        {/* Main Gear */}
        <circle cx="70" cy="68" r="11" fill="url(#gearGradProd)" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="70" cy="68" r="4" fill="#EDE9FE" />
        {/* Smaller Upper Gear */}
        <circle cx="62" cy="54" r="7" fill="url(#gearGradProd)" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="62" cy="54" r="2.5" fill="#EDE9FE" />
      </g>
    </svg>
  </div>
);

// 3. Ready to Dispatch (3D Yellow/Orange Delivery Van + Red Location Pin + Speed Lines)
export const ReadyDispatch3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="dispGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="vanGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="pinRed" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#dispGlow)" />

      {/* Speed Motion Lines */}
      <line x1="16" y1="52" x2="24" y2="52" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="14" y1="60" x2="22" y2="60" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="18" y1="68" x2="24" y2="68" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

      {/* 3D Delivery Van */}
      <g filter="drop-shadow(0 6px 10px rgba(217,119,6,0.35))">
        {/* Van Main Cargo Body */}
        <rect x="26" y="42" width="34" height="28" rx="5" fill="url(#vanGrad)" />
        {/* Van Front Cab */}
        <path d="M60 50H72C75 50 78 54 78 58V70H60V50Z" fill="url(#vanGrad)" />
        {/* Front Cab Window */}
        <path d="M62 53H70C72 53 74 55 74 58V62H62V53Z" fill="#1E293B" />
        {/* Front Bumper Light */}
        <circle cx="77" cy="65" r="2" fill="#FEF08A" />

        {/* Wheels */}
        <circle cx="38" cy="72" r="6" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />
        <circle cx="38" cy="72" r="2.5" fill="#E2E8F0" />
        <circle cx="68" cy="72" r="6" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />
        <circle cx="68" cy="72" r="2.5" fill="#E2E8F0" />
      </g>

      {/* 3D Red Location Pin on Roof */}
      <g filter="drop-shadow(0 4px 6px rgba(225,29,72,0.4))">
        <path
          d="M50 20C44.4772 20 40 24.4772 40 30C40 37 50 48 50 48C50 48 60 37 60 30C60 24.4772 55.5228 20 50 20Z"
          fill="url(#pinRed)"
        />
        <circle cx="50" cy="30" r="3.5" fill="#FFFFFF" />
      </g>
    </svg>
  </div>
);

// 4. Total Consignment Value (3D Stack of Green Rupee Coins + Upward Arrow)
export const ConsignmentValue3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="valGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="valCoinGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="arrowVal" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#valGlow)" />

      {/* Upward Growth Arrow on Top */}
      <g filter="drop-shadow(0 3px 5px rgba(5,150,105,0.35))">
        <path d="M72 36V22" stroke="url(#arrowVal)" strokeWidth="4" strokeLinecap="round" />
        <path d="M66 26L72 20L78 26" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Stack of 3 3D Emerald Rupee Coins */}
      <g filter="drop-shadow(0 6px 10px rgba(4,120,87,0.35))">
        {/* Bottom Coin */}
        <ellipse cx="42" cy="68" rx="18" ry="8" fill="url(#valCoinGrad)" stroke="#047857" strokeWidth="1" />
        {/* Middle Coin */}
        <ellipse cx="42" cy="60" rx="18" ry="8" fill="url(#valCoinGrad)" stroke="#047857" strokeWidth="1" />
        {/* Top Coin */}
        <ellipse cx="42" cy="52" rx="18" ry="8" fill="url(#valCoinGrad)" stroke="#047857" strokeWidth="1" />
      </g>

      {/* Big Front Facing Rupee Coin on Right */}
      <g filter="drop-shadow(0 6px 10px rgba(4,120,87,0.4))">
        <circle cx="68" cy="64" r="16" fill="url(#valCoinGrad)" stroke="#FFFFFF" strokeWidth="2.5" />
        <circle cx="68" cy="64" r="13" stroke="#A7F3D0" strokeWidth="1" strokeDasharray="2 2" fill="none" />
        <text x="68" y="70" textAnchor="middle" fontSize="16" fontWeight="900" fill="#FFFFFF" fontFamily="system-ui, sans-serif">
          ₹
        </text>
      </g>
    </svg>
  </div>
);

/* =========================================================================
   Orders KPI Summary Cards Component
   ========================================================================= */

export const OrdersKpiCards: React.FC<OrdersKpiCardsProps> = ({
  totalOrdersCount,
  inProductionCount,
  readyDispatchCount,
  totalConsignmentValue,
  onNavigateAll,
  onNavigateProduction,
  onNavigateDispatch,
  onNavigateValue,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
      {/* 1. Total Orders */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateAll}
        className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0"
      >
        <TotalOrders3D />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Total Orders">
              Total Orders
            </span>
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
              <Icons.ChevronRight size={14} />
            </span>
          </div>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-300 mt-0.5 font-sans truncate flex items-baseline gap-1.5"
            title={`${totalOrdersCount} Batches`}
          >
            <span className="tabular-nums">{totalOrdersCount}</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-600/90 dark:text-emerald-400/90 tracking-normal">
              Batches
            </span>
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="All active consignments">
            All active consignments
          </p>
        </div>
      </div>

      {/* 2. In Production */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateProduction}
        className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0"
      >
        <InProduction3D />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="In Production">
              In Production
            </span>
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all shrink-0">
              <Icons.ChevronRight size={14} />
            </span>
          </div>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-purple-700 dark:text-purple-300 mt-0.5 font-sans truncate flex items-baseline gap-1.5"
            title={`${inProductionCount} Batches`}
          >
            <span className="tabular-nums">{inProductionCount}</span>
            <span className="text-xs sm:text-sm font-bold text-purple-600/90 dark:text-purple-400/90 tracking-normal">
              Batches
            </span>
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="Active on factory lines">
            Active on factory lines
          </p>
        </div>
      </div>

      {/* 3. Ready to Dispatch */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateDispatch}
        className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0"
      >
        <ReadyDispatch3D />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Ready to Dispatch">
              Ready to Dispatch
            </span>
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-all shrink-0">
              <Icons.ChevronRight size={14} />
            </span>
          </div>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-amber-700 dark:text-amber-300 mt-0.5 font-sans truncate flex items-baseline gap-1.5"
            title={`${readyDispatchCount} Batches`}
          >
            <span className="tabular-nums">{readyDispatchCount}</span>
            <span className="text-xs sm:text-sm font-bold text-amber-600/90 dark:text-amber-400/90 tracking-normal">
              Batches
            </span>
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="Awaiting transport loading">
            Awaiting transport loading
          </p>
        </div>
      </div>

      {/* 4. Total Consignment Value */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateValue}
        className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0"
      >
        <ConsignmentValue3D />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Total Consignment Value">
              Total Consignment Value
            </span>
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
              <Icons.ChevronRight size={14} />
            </span>
          </div>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5 font-sans truncate"
            title={typeof totalConsignmentValue === 'number' ? `₹${(totalConsignmentValue / 100000).toFixed(2)}L` : String(totalConsignmentValue)}
          >
            <span className="tabular-nums">
              {typeof totalConsignmentValue === 'number'
                ? `₹${(totalConsignmentValue / 100000).toFixed(2)}L`
                : totalConsignmentValue}
            </span>
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="Gross wholesale value">
            Gross wholesale value
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrdersKpiCards;
