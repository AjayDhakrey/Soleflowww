import React from 'react';
import { Icons } from '../../lib/icons';

interface CollectionsKpiCardsProps {
  totalAssignedDue: number;
  pendingStoresCount: number;
  collectedThisMonth: number;
  chequesInClearingAmount: number;
  pendingChequesCount: number;
  onNavigatePending?: () => void;
  onNavigateOverdue?: () => void;
  onNavigateCollected?: () => void;
  onNavigateCheques?: () => void;
}

/* =========================================================================
   3D Claymorphic Vector SVGs for Collections & Receivables
   ========================================================================= */

// 1. Total Assigned Receivables (3D Stack of Green Invoices + Rupee Coin Seal)
export const AssignedReceivables3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="recGlowCol" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="docGreenBack" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        <linearGradient id="docGreenFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#ECFDF5" />
        </linearGradient>
        <linearGradient id="coinRupeeCol" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      {/* Glow */}
      <circle cx="50" cy="52" r="38" fill="url(#recGlowCol)" />

      {/* Sparkles */}
      <path d="M22 36L17 31" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 26L22 20" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

      {/* Back Document Sheet (Tilted) */}
      <rect
        x="24"
        y="30"
        width="38"
        height="50"
        rx="7"
        fill="url(#docGreenBack)"
        stroke="#10B981"
        strokeWidth="2.5"
        transform="rotate(-12 43 55)"
        filter="drop-shadow(0 4px 6px rgba(16,185,129,0.25))"
      />

      {/* Front Document Sheet */}
      <g filter="drop-shadow(0 6px 10px rgba(5,150,105,0.3))">
        <rect x="34" y="24" width="42" height="52" rx="8" fill="url(#docGreenFront)" stroke="#10B981" strokeWidth="3" />
        {/* Document Header Line */}
        <line x1="42" y1="36" x2="68" y2="36" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
        {/* Document Content Lines */}
        <line x1="42" y1="46" x2="60" y2="46" stroke="#34D399" strokeWidth="3" strokeLinecap="round" />
        <line x1="42" y1="55" x2="56" y2="55" stroke="#34D399" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Rupee Coin Seal on Bottom Right */}
      <g filter="drop-shadow(0 3px 5px rgba(4,120,87,0.4))">
        <circle cx="72" cy="70" r="11" fill="url(#coinRupeeCol)" stroke="#FFFFFF" strokeWidth="2.5" />
        <text x="72" y="74" textAnchor="middle" fontSize="11" fontWeight="700" fill="#FFFFFF" fontFamily="var(--font-sans)">
          ₹
        </text>
      </g>
    </svg>
  </div>
);

// 2. Overdue Stores (3D Orange Calendar with Exclamation Alert Badge)
export const OverdueCalendar3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="calGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFEDD5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFEDD5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="calHeader" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>

      {/* Glow */}
      <circle cx="50" cy="52" r="38" fill="url(#calGlow)" />

      {/* Sparkles */}
      <path d="M78 26L83 22" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M84 34H89" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />

      {/* 3D Calendar Body */}
      <g filter="drop-shadow(0 6px 10px rgba(234,88,12,0.35))">
        {/* Main Base Card */}
        <rect x="22" y="28" width="56" height="52" rx="10" fill="#FFFFFF" stroke="#FDBA74" strokeWidth="2" />
        {/* Header Ribbon */}
        <path d="M22 38C22 32.4772 26.4772 28 32 28H68C73.5228 28 78 32.4772 78 38V42H22V38Z" fill="url(#calHeader)" />

        {/* Binder Rings */}
        <rect x="32" y="22" width="6" height="12" rx="3" fill="#FED7AA" stroke="#EA580C" strokeWidth="1.5" />
        <rect x="62" y="22" width="6" height="12" rx="3" fill="#FED7AA" stroke="#EA580C" strokeWidth="1.5" />

        {/* Date Grid Dots */}
        <circle cx="34" cy="52" r="2.5" fill="#FCA5A5" />
        <circle cx="46" cy="52" r="2.5" fill="#FCA5A5" />
        <circle cx="58" cy="52" r="2.5" fill="#FCA5A5" />
        <circle cx="34" cy="62" r="2.5" fill="#FCA5A5" />
        <circle cx="46" cy="62" r="2.5" fill="#FCA5A5" />
        <circle cx="58" cy="62" r="2.5" fill="#FCA5A5" />
      </g>

      {/* Red Alert Exclamation Badge */}
      <g filter="drop-shadow(0 4px 6px rgba(225,29,72,0.4))">
        <circle cx="74" cy="72" r="12" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2.5" />
        <line x1="74" y1="66" x2="74" y2="73" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <circle cx="74" cy="78" r="1.5" fill="#FFFFFF" />
      </g>
    </svg>
  </div>
);

// 3. Collected This Month (3D Emerald Green Money Sack + Gold Coin Stack)
export const MoneySackCoins3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="sackGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sackBody" cx="42%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </radialGradient>
        <linearGradient id="sackTop" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <radialGradient id="coinGoldSack" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
      </defs>

      {/* Glow */}
      <circle cx="50" cy="52" r="38" fill="url(#sackGlow)" />

      {/* Sparkles */}
      <path d="M72 22L76 18" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M78 29H83" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

      {/* 3D Money Bag */}
      <g filter="drop-shadow(0 6px 10px rgba(4,120,87,0.35))">
        {/* Ruffled Top Neck */}
        <path d="M38 28C38 24 42 22 48 22C54 22 58 24 58 28L54 35H42L38 28Z" fill="url(#sackTop)" />
        {/* Tie Ribbon */}
        <rect x="40" y="34" width="16" height="4" rx="2" fill="#047857" />
        {/* Main Round Sack */}
        <path
          d="M26 62C26 46 36 36 48 36C60 36 70 46 70 62C70 76 60 82 48 82C36 82 26 76 26 62Z"
          fill="url(#sackBody)"
        />
        {/* White Rupee Symbol on Front */}
        <text x="48" y="66" textAnchor="middle" fontSize="18" fontWeight="700" fill="#FFFFFF" fontFamily="var(--font-sans)">
          ₹
        </text>
      </g>

      {/* Stack of 3 Gold Coins on Bottom Right */}
      <g filter="drop-shadow(0 4px 6px rgba(217,119,6,0.4))">
        {/* Bottom Coin */}
        <ellipse cx="74" cy="74" rx="11" ry="5.5" fill="url(#coinGoldSack)" stroke="#B45309" strokeWidth="1" />
        {/* Middle Coin */}
        <ellipse cx="74" cy="68" rx="11" ry="5.5" fill="url(#coinGoldSack)" stroke="#B45309" strokeWidth="1" />
        {/* Top Coin */}
        <ellipse cx="74" cy="62" rx="11" ry="5.5" fill="url(#coinGoldSack)" stroke="#B45309" strokeWidth="1" />
      </g>
    </svg>
  </div>
);

// 4. Cheques in Clearing (3D Blue Cheque Slip + Fountain Pen)
export const ChequePen3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="chequeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="chequeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
        <linearGradient id="penGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>

      {/* Glow */}
      <circle cx="50" cy="52" r="38" fill="url(#chequeGlow)" />

      {/* Sparkles */}
      <path d="M22 34L17 30" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 24L23 18" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36 18L36 12" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />

      {/* 3D Blue Cheque Slip */}
      <g filter="drop-shadow(0 6px 10px rgba(2,132,199,0.35))">
        <rect x="18" y="36" width="62" height="38" rx="8" fill="url(#chequeGrad)" />
        {/* Top Pay Line */}
        <line x1="26" y1="46" x2="52" y2="46" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.9" />
        {/* Amount Box on Cheque */}
        <rect x="56" y="42" width="18" height="10" rx="3" fill="#FFFFFF" fillOpacity="0.3" stroke="#FFFFFF" strokeWidth="1" />
        <text x="65" y="50" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#FFFFFF">₹</text>
        {/* Bottom Lines */}
        <line x1="26" y1="58" x2="60" y2="58" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" />
        <line x1="26" y1="65" x2="48" y2="65" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* 3D Blue Fountain Pen Diagonally Across */}
      <g filter="drop-shadow(0 4px 7px rgba(30,58,138,0.4))" transform="rotate(-15 68 45)">
        {/* Pen Body */}
        <rect x="66" y="20" width="8" height="34" rx="4" fill="url(#penGrad)" stroke="#93C5FD" strokeWidth="1" />
        {/* Metallic Band */}
        <rect x="66" y="32" width="8" height="3" fill="#FDE047" />
        {/* Metallic Nib */}
        <path d="M66 54L70 63L74 54Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.5" />
      </g>
    </svg>
  </div>
);

/* =========================================================================
   Collections KPI Cards Component
   ========================================================================= */

export const CollectionsKpiCards: React.FC<CollectionsKpiCardsProps> = ({
  totalAssignedDue,
  pendingStoresCount,
  collectedThisMonth,
  chequesInClearingAmount,
  pendingChequesCount,
  onNavigatePending,
  onNavigateOverdue,
  onNavigateCollected,
  onNavigateCheques,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
      {/* 1. Total Assigned Receivables */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigatePending}
        className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0"
      >
        <AssignedReceivables3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-slate-300 block truncate" title="Total Assigned Receivables">
            Total Assigned Receivables
          </span>
          <p
            className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 font-display truncate"
            title={`₹${(totalAssignedDue / 100000).toFixed(2)}L`}
          >
            ₹{(totalAssignedDue / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title={`Across ${pendingStoresCount} pending stores`}>
            Across {pendingStoresCount} pending stores
          </p>
        </div>
      </div>

      {/* 2. Overdue Stores */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateOverdue}
        className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0"
      >
        <OverdueCalendar3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-slate-300 block truncate" title="Overdue Stores">
            Overdue Stores
          </span>
          <p
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5 font-display truncate flex items-baseline gap-1.5"
            title={`${pendingStoresCount} Accounts`}
          >
            <span className="tabular-nums">{pendingStoresCount}</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-normal">Accounts</span>
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="Need field collection visits">
            Need field collection visits
          </p>
        </div>
      </div>

      {/* 3. Collected This Month */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateCollected}
        className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0"
      >
        <MoneySackCoins3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-slate-300 block truncate" title="Collected This Month">
            Collected This Month
          </span>
          <p
            className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 font-display truncate"
            title={`₹${(collectedThisMonth / 100000).toFixed(2)}L`}
          >
            ₹{(collectedThisMonth / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="Realized in bank">
            Realized in bank
          </p>
        </div>
      </div>

      {/* 4. Cheques in Clearing */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateCheques}
        className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0"
      >
        <ChequePen3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-slate-300 block truncate" title="Cheques in Clearing">
            Cheques in Clearing
          </span>
          <p
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5 font-display truncate"
            title={`₹${(chequesInClearingAmount / 100000).toFixed(2)}L`}
          >
            ₹{(chequesInClearingAmount / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title={`${pendingChequesCount} pending realization`}>
            {pendingChequesCount} pending realization
          </p>
        </div>
      </div>
    </div>
  );
};

export default CollectionsKpiCards;
