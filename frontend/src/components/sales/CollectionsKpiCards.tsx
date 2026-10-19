import React from 'react';

/* =========================================================================
   3D Claymorphic Vector SVGs for Collections & Receivables KPI Cards
   ========================================================================= */

// 1. Assigned Receivables: 3D Ruby/Rose Leather Wallet with Gold Card
const CollectionsWallet3D = () => (
  <svg viewBox="0 0 56 56" className="w-full h-full select-none drop-shadow-sm" fill="none">
    <defs>
      <linearGradient id="cWalGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FB7185" />
        <stop offset="50%" stopColor="#F43F5E" />
        <stop offset="100%" stopColor="#BE123C" />
      </linearGradient>
      <linearGradient id="cCardGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="cClaspGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDA4AF" />
        <stop offset="100%" stopColor="#E11D48" />
      </linearGradient>
    </defs>
    {/* Base shadow */}
    <ellipse cx="28" cy="48" rx="18" ry="4" fill="#9F1239" fillOpacity="0.22" />

    {/* Gold Card protruding out of top pocket */}
    <g transform="rotate(-8 28 20)">
      <rect x="18" y="11" width="22" height="15" rx="2.5" fill="url(#cCardGrad)" stroke="#D97706" strokeWidth="0.8" />
      <rect x="20" y="14" width="6" height="4" rx="1" fill="#B45309" fillOpacity="0.6" />
      <line x1="20" y1="21" x2="36" y2="21" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" />
    </g>

    {/* Wallet Back Interior */}
    <rect x="10" y="18" width="36" height="26" rx="6" fill="#881337" />

    {/* Wallet Front Main Leather Body */}
    <rect
      x="10"
      y="22"
      width="36"
      height="24"
      rx="6"
      fill="url(#cWalGrad)"
      stroke="#FDA4AF"
      strokeWidth="1"
      filter="drop-shadow(0 3px 6px rgba(190,18,60,0.3))"
    />

    {/* Leather Stitching Accent Line */}
    <path
      d="M13 25H43"
      stroke="#FECDD3"
      strokeWidth="1"
      strokeDasharray="2 1.5"
      strokeLinecap="round"
      strokeOpacity="0.8"
    />

    {/* Front Clasp Flap with Gold Button */}
    <path
      d="M32 28H43C44.657 28 46 29.343 46 31V37C46 38.657 44.657 40 43 40H32V28Z"
      fill="url(#cClaspGrad)"
      stroke="#FFE4E6"
      strokeWidth="0.8"
    />
    <circle cx="41" cy="34" r="2.4" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
  </svg>
);

// 2. Overdue Stores: 3D Amber Warning Triangle Prism
const CollectionsWarning3D = () => (
  <svg viewBox="0 0 56 56" className="w-full h-full select-none drop-shadow-sm" fill="none">
    <defs>
      <linearGradient id="cWarnTri" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="45%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="cWarnInner" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#78350F" />
        <stop offset="100%" stopColor="#451A03" />
      </linearGradient>
    </defs>
    {/* Base shadow */}
    <ellipse cx="28" cy="48" rx="17" ry="4" fill="#B45309" fillOpacity="0.22" />

    {/* Outer 3D Triangle Prism Body */}
    <path
      d="M24.5 12.8C26.1 10.1 30 10.1 31.5 12.8L47.2 40C48.8 42.7 46.8 46 43.7 46H12.3C9.2 46 7.2 42.7 8.8 40L24.5 12.8Z"
      fill="url(#cWarnTri)"
      filter="drop-shadow(0 4px 7px rgba(217,119,6,0.35))"
      stroke="#FEF3C7"
      strokeWidth="1"
    />

    {/* Top Bevel Specular Reflection */}
    <path
      d="M25 15L12 39"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeOpacity="0.7"
    />

    {/* Inner Dark Contrast Amber Facet */}
    <path
      d="M25.5 17.5C26.6 15.6 29.4 15.6 30.5 17.5L42.5 39C43.6 41 42.1 43.5 39.9 43.5H16.1C13.9 43.5 12.4 41 13.5 39L25.5 17.5Z"
      fill="url(#cWarnInner)"
    />

    {/* 3D Glowing Exclamation Stem */}
    <rect
      x="26.2"
      y="22"
      width="3.6"
      height="11"
      rx="1.8"
      fill="#FBBF24"
      filter="drop-shadow(0 1px 3px rgba(251,191,36,0.5))"
    />
    
    {/* 3D Exclamation Dot */}
    <circle
      cx="28"
      cy="37.5"
      r="2.2"
      fill="#FBBF24"
      filter="drop-shadow(0 1px 3px rgba(251,191,36,0.5))"
    />
  </svg>
);

// 3. Realized Collections: 3D Glossy Emerald Shield Orb with Checkmark
const CollectionsCheckCircle3D = () => (
  <svg viewBox="0 0 56 56" className="w-full h-full select-none drop-shadow-sm" fill="none">
    <defs>
      <radialGradient id="cChkOrb" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#6EE7B7" />
        <stop offset="45%" stopColor="#10B981" />
        <stop offset="80%" stopColor="#059669" />
        <stop offset="100%" stopColor="#047857" />
      </radialGradient>
      <linearGradient id="cChkRim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#A7F3D0" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    {/* Ambient shadow */}
    <ellipse cx="28" cy="48" rx="17" ry="4" fill="#047857" fillOpacity="0.25" />

    {/* Outer 3D Rim Ring */}
    <circle cx="28" cy="27" r="19" fill="none" stroke="url(#cChkRim)" strokeWidth="2.5" />

    {/* Central 3D Spherical Core */}
    <circle
      cx="28"
      cy="27"
      r="17"
      fill="url(#cChkOrb)"
      filter="drop-shadow(0 4px 7px rgba(4,120,87,0.38))"
    />

    {/* Specular curved gloss reflection */}
    <ellipse cx="23" cy="19" rx="6.5" ry="3.2" fill="#FFFFFF" fillOpacity="0.6" transform="rotate(-30 23 19)" />

    {/* Secondary bottom rim reflection */}
    <path
      d="M15 32C15 38 20 42 27 42"
      stroke="#A7F3D0"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeOpacity="0.5"
    />

    {/* 3D Checkmark Shadow */}
    <path
      d="M19 28.5L25 34.5L37 21.5"
      stroke="#064E3B"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.4"
    />
    {/* 3D Bold White Checkmark Face */}
    <path
      d="M19 27.5L25 33.5L37 20.5"
      stroke="#FFFFFF"
      strokeWidth="3.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 4. Cheques in Clearing: 3D Bank Cheque Slip with Purple Chrono Clock
const CollectionsCheques3D = () => (
  <svg viewBox="0 0 56 56" className="w-full h-full select-none drop-shadow-sm" fill="none">
    <defs>
      <linearGradient id="cChqPaper" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#F3E8FF" />
      </linearGradient>
      <radialGradient id="cClkDialPurp" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#D8B4FE" />
        <stop offset="45%" stopColor="#A855F7" />
        <stop offset="85%" stopColor="#7E22CE" />
        <stop offset="100%" stopColor="#581C87" />
      </radialGradient>
      <linearGradient id="cClkRimPurp" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E9D5FF" />
        <stop offset="100%" stopColor="#7E22CE" />
      </linearGradient>
    </defs>
    {/* Ambient shadow */}
    <ellipse cx="28" cy="48" rx="18" ry="4" fill="#581C87" fillOpacity="0.22" />

    {/* Bank Cheque Leaf Slip floating in background */}
    <g transform="rotate(-12 28 22)">
      <rect x="12" y="12" width="32" height="18" rx="3" fill="url(#cChqPaper)" stroke="#C084FC" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(126,34,206,0.25))" />
      {/* Cheque bank logo / chip */}
      <rect x="15" y="15" width="5" height="3" rx="0.8" fill="#A855F7" />
      {/* Cheque signature line & text lines */}
      <line x1="22" y1="16.5" x2="39" y2="16.5" stroke="#D8B4FE" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="15" y1="22" x2="32" y2="22" stroke="#D8B4FE" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="34" y1="24" x2="41" y2="24" stroke="#7E22CE" strokeWidth="1" strokeLinecap="round" />
    </g>

    {/* 3D Purple Chrono Clock Orb in foreground */}
    <g transform="translate(14, 14)">
      {/* Outer 3D Rim Ring */}
      <circle cx="18" cy="18" r="15" fill="none" stroke="url(#cClkRimPurp)" strokeWidth="2" />
      {/* Core Dial */}
      <circle cx="18" cy="18" r="13.5" fill="url(#cClkDialPurp)" filter="drop-shadow(0 3px 6px rgba(88,28,135,0.4))" />
      {/* Specular curved highlight */}
      <ellipse cx="14" cy="12" rx="4.5" ry="2.2" fill="#FFFFFF" fillOpacity="0.55" transform="rotate(-30 14 12)" />
      {/* Center Pin */}
      <circle cx="18" cy="18" r="1.8" fill="#FFFFFF" />
      {/* Clock Hands (~3:00 / ~3:15) */}
      <line x1="18" y1="18" x2="23" y2="18" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="18" x2="18" y2="11" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  </svg>
);

/* =========================================================================
   Collections 4 KPI Cards Row Component
   ========================================================================= */

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
  const formatLakh = (val: number) => `₹${(val / 100000).toFixed(2)}L`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
      {/* 1. Total Assigned Receivables */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigatePending}
        className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-300 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-rose-500/10 dark:hover:shadow-rose-950/30 hover:-translate-y-1 active:scale-[0.98] transform-gpu select-none overflow-hidden min-w-0"
      >
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-rose-500/10 dark:bg-rose-950/50 flex items-center justify-center shrink-0 p-1 sm:p-1.5 group-hover:scale-110 transition-transform duration-300">
          <CollectionsWallet3D />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Assigned Receivables
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display truncate">
              {formatLakh(totalAssignedDue)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Pending
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
              Outstanding
            </span>
          </div>
        </div>
      </div>

      {/* 2. Overdue Stores */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateOverdue}
        className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-300 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-amber-500/10 dark:hover:shadow-amber-950/30 hover:-translate-y-1 active:scale-[0.98] transform-gpu select-none overflow-hidden min-w-0"
      >
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-500/10 dark:bg-amber-950/50 flex items-center justify-center shrink-0 p-1 sm:p-1.5 group-hover:scale-110 transition-transform duration-300">
          <CollectionsWarning3D />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Overdue Stores
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-amber-500 dark:text-amber-400 font-display truncate">
              {pendingStoresCount}
            </span>
            <span className="text-xs sm:text-base font-semibold text-amber-500 dark:text-amber-400 hidden xs:inline">
              Stores
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Credit terms
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
              Action
            </span>
          </div>
        </div>
      </div>

      {/* 3. Realized Collections MTD */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateCollected}
        className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-300 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-950/30 hover:-translate-y-1 active:scale-[0.98] transform-gpu select-none overflow-hidden min-w-0"
      >
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/50 flex items-center justify-center shrink-0 p-1 sm:p-1.5 group-hover:scale-110 transition-transform duration-300">
          <CollectionsCheckCircle3D />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Realized Collections
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-display truncate">
              {formatLakh(collectedThisMonth)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Bank cleared
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              MTD
            </span>
          </div>
        </div>
      </div>

      {/* 4. Cheques in Clearing */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateCheques}
        className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-300 cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-950/30 hover:-translate-y-1 active:scale-[0.98] transform-gpu select-none overflow-hidden min-w-0"
      >
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-500/10 dark:bg-purple-950/50 flex items-center justify-center shrink-0 p-1 sm:p-1.5 group-hover:scale-110 transition-transform duration-300">
          <CollectionsCheques3D />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Cheques in Clearing
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400 font-display truncate">
              {formatLakh(chequesInClearingAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              {pendingChequesCount} in transit
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
              Clearing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionsKpiCards;
