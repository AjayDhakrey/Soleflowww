import React from 'react';

/* =========================================================================
   3D Claymorphic Vector SVGs for Route & Store Visits KPI Cards
   ========================================================================= */

// 1. Scheduled Stops: 3D Blue GPS Navigation Pin with Radar Rings
const VisitsLocationPin3D = () => (
  <svg viewBox="0 0 56 56" className="w-full h-full select-none drop-shadow-sm" fill="none">
    <defs>
      <radialGradient id="vPinSphere" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="45%" stopColor="#2563EB" />
        <stop offset="90%" stopColor="#1D4ED8" />
        <stop offset="100%" stopColor="#1E3A8A" />
      </radialGradient>
      <linearGradient id="vPinRing" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
      </linearGradient>
    </defs>
    {/* Ground Radar/Target Rings */}
    <ellipse cx="28" cy="47" rx="16" ry="4.5" fill="#1E40AF" fillOpacity="0.22" />
    <ellipse cx="28" cy="47" rx="10" ry="3" stroke="url(#vPinRing)" strokeWidth="1.2" strokeDasharray="3 2" />

    {/* Pin Tip Drop Shadow */}
    <ellipse cx="28" cy="46" rx="3.5" ry="1.5" fill="#1E3A8A" />

    {/* 3D Map Pin Body (Balloon drop-pin silhouette) */}
    <path
      d="M28 46C26 42 14 30 14 21C14 13.268 20.268 7 28 7C35.732 7 42 13.268 42 21C42 30 30 42 28 46Z"
      fill="url(#vPinSphere)"
      filter="drop-shadow(0 4px 6px rgba(30,64,175,0.35))"
    />

    {/* Specular Curved Highlight on Head */}
    <ellipse cx="23" cy="14" rx="5.5" ry="2.8" fill="#FFFFFF" fillOpacity="0.55" transform="rotate(-35 23 14)" />

    {/* Inner White Core Aperture / Target Eye */}
    <circle cx="28" cy="21" r="6" fill="#FFFFFF" />
    <circle cx="28" cy="21" r="3.2" fill="#1D4ED8" />
  </svg>
);

// 2. Visits Completed: 3D Glossy Emerald Shield Orb with Checkmark
const VisitsCheckCircle3D = () => (
  <svg viewBox="0 0 56 56" className="w-full h-full select-none drop-shadow-sm" fill="none">
    <defs>
      <radialGradient id="vChkOrb" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#6EE7B7" />
        <stop offset="45%" stopColor="#10B981" />
        <stop offset="80%" stopColor="#059669" />
        <stop offset="100%" stopColor="#047857" />
      </radialGradient>
      <linearGradient id="vChkRim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#A7F3D0" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    {/* Ambient shadow */}
    <ellipse cx="28" cy="48" rx="17" ry="4" fill="#047857" fillOpacity="0.25" />

    {/* Outer 3D Rim Ring */}
    <circle cx="28" cy="27" r="19" fill="none" stroke="url(#vChkRim)" strokeWidth="2.5" />

    {/* Central 3D Spherical Core */}
    <circle
      cx="28"
      cy="27"
      r="17"
      fill="url(#vChkOrb)"
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

// 3. Pending Stops: 3D Amber Chrono Stopwatch / Clock
const VisitsClock3D = () => (
  <svg viewBox="0 0 56 56" className="w-full h-full select-none drop-shadow-sm" fill="none">
    <defs>
      <linearGradient id="vClkCase" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <radialGradient id="vClkDial" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="85%" stopColor="#FFFBEB" />
        <stop offset="100%" stopColor="#FEF3C7" />
      </radialGradient>
    </defs>
    {/* Ambient shadow */}
    <ellipse cx="28" cy="48" rx="17" ry="4" fill="#B45309" fillOpacity="0.22" />

    {/* Top Stopwatch Crown Button */}
    <rect x="25" y="7" width="6" height="4.5" rx="1.8" fill="#D97706" />
    <rect x="23.5" y="6" width="9" height="2.5" rx="1.2" fill="#FBBF24" />

    {/* Clock 3D Beveled Outer Case */}
    <circle cx="28" cy="28" r="18" fill="url(#vClkCase)" filter="drop-shadow(0 4px 6px rgba(217,119,6,0.35))" />

    {/* Inner White/Cream Dial Face */}
    <circle cx="28" cy="28" r="14" fill="url(#vClkDial)" stroke="#FDE68A" strokeWidth="1" />

    {/* Dial Hour Markers */}
    <circle cx="28" cy="17" r="1.3" fill="#D97706" />
    <circle cx="39" cy="28" r="1.3" fill="#D97706" />
    <circle cx="28" cy="39" r="1.3" fill="#D97706" />
    <circle cx="17" cy="28" r="1.3" fill="#D97706" />

    {/* Dial Glass Specular Glare */}
    <path
      d="M17 23C19 18 24 16 29 16"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeOpacity="0.8"
    />

    {/* Center Pivot Pin */}
    <circle cx="28" cy="28" r="2.2" fill="#92400E" />

    {/* Hour Hand */}
    <line x1="28" y1="28" x2="34" y2="28" stroke="#B45309" strokeWidth="2.4" strokeLinecap="round" />
    {/* Minute Hand */}
    <line x1="28" y1="28" x2="28" y2="19" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
    <circle cx="28" cy="28" r="1.2" fill="#FDE68A" />
  </svg>
);

// 4. Spot Bookings: 3D Purple/Violet Embossed Rupee Coin
const VisitsRupee3D = () => (
  <svg viewBox="0 0 56 56" className="w-full h-full select-none drop-shadow-sm" fill="none">
    <defs>
      <linearGradient id="vRupRim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E9D5FF" />
        <stop offset="50%" stopColor="#A855F7" />
        <stop offset="100%" stopColor="#7E22CE" />
      </linearGradient>
      <radialGradient id="vRupFace" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#C084FC" />
        <stop offset="50%" stopColor="#9333EA" />
        <stop offset="90%" stopColor="#7E22CE" />
        <stop offset="100%" stopColor="#581C87" />
      </radialGradient>
      <linearGradient id="vRupSymbol" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#F3E8FF" />
      </linearGradient>
    </defs>
    {/* Ambient shadow */}
    <ellipse cx="28" cy="48" rx="17" ry="4" fill="#6B21A8" fillOpacity="0.25" />

    {/* Outer 3D Coin Edge Chamfer */}
    <circle cx="28" cy="27" r="18.5" fill="none" stroke="url(#vRupRim)" strokeWidth="2.5" />

    {/* Central 3D Coin Face */}
    <circle
      cx="28"
      cy="27"
      r="16.5"
      fill="url(#vRupFace)"
      filter="drop-shadow(0 4px 7px rgba(126,34,206,0.38))"
    />

    {/* Specular Curved Highlight */}
    <ellipse cx="23" cy="18" rx="6.5" ry="3.2" fill="#FFFFFF" fillOpacity="0.55" transform="rotate(-30 23 18)" />

    {/* Embossed Indian Rupee (₹) Symbol */}
    <g>
      {/* Top Bar 1 */}
      <line x1="22" y1="20" x2="34" y2="20" stroke="url(#vRupSymbol)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Top Bar 2 */}
      <line x1="22" y1="24.5" x2="32" y2="24.5" stroke="url(#vRupSymbol)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Curved Stem & Downward Slant */}
      <path
        d="M26 20V29C28.5 29 32 28.5 32 24.5M26 29L33 37"
        stroke="url(#vRupSymbol)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>

    {/* Ambient Sparkles */}
    <circle cx="39" cy="16" r="1.5" fill="#E9D5FF" />
    <circle cx="15" cy="36" r="1.2" fill="#E9D5FF" />
  </svg>
);

/* =========================================================================
   Store Visits 4 KPI Cards Row Component
   ========================================================================= */

interface VisitsKpiCardsProps {
  totalStopsCount: number;
  completedVisitsCount: number;
  pendingStopsCount: number;
  ordersBookedAmount: number | string;
}

export const VisitsKpiCards: React.FC<VisitsKpiCardsProps> = ({
  totalStopsCount,
  completedVisitsCount,
  pendingStopsCount,
  ordersBookedAmount,
}) => {
  const formatAmount = (val: number | string) => {
    if (typeof val === 'string') return val.startsWith('₹') ? val : `₹${val}`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
      {/* 1. Scheduled Stops */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-950/30 hover:-translate-y-1 transform-gpu select-none overflow-hidden min-w-0">
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-500/10 dark:bg-blue-950/50 flex items-center justify-center shrink-0 p-1 sm:p-1.5 group-hover:scale-110 transition-transform duration-300">
          <VisitsLocationPin3D />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Scheduled Stops
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 font-display truncate">
              {totalStopsCount}
            </span>
            <span className="text-xs sm:text-base font-semibold text-blue-600 dark:text-blue-400 hidden xs:inline">
              Stores
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Route plan
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
              Assigned
            </span>
          </div>
        </div>
      </div>

      {/* 2. Visits Completed */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-950/30 hover:-translate-y-1 transform-gpu select-none overflow-hidden min-w-0">
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/50 flex items-center justify-center shrink-0 p-1 sm:p-1.5 group-hover:scale-110 transition-transform duration-300">
          <VisitsCheckCircle3D />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Completed
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-display truncate">
              {completedVisitsCount}
            </span>
            <span className="text-xs sm:text-base font-semibold text-emerald-600 dark:text-emerald-400 hidden xs:inline">
              Visited
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Logged
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* 3. Pending Stops */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-amber-500/10 dark:hover:shadow-amber-950/30 hover:-translate-y-1 transform-gpu select-none overflow-hidden min-w-0">
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-500/10 dark:bg-amber-950/50 flex items-center justify-center shrink-0 p-1 sm:p-1.5 group-hover:scale-110 transition-transform duration-300">
          <VisitsClock3D />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Pending Stops
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-amber-500 dark:text-amber-400 font-display truncate">
              {pendingStopsCount}
            </span>
            <span className="text-xs sm:text-base font-semibold text-amber-500 dark:text-amber-400 hidden xs:inline">
              Left
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Awaiting
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
              Pending
            </span>
          </div>
        </div>
      </div>

      {/* 4. Spot Bookings */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-950/30 hover:-translate-y-1 transform-gpu select-none overflow-hidden min-w-0">
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-500/10 dark:bg-purple-950/50 flex items-center justify-center shrink-0 p-1 sm:p-1.5 group-hover:scale-110 transition-transform duration-300">
          <VisitsRupee3D />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Spot Bookings
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400 font-display truncate">
              {formatAmount(ordersBookedAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Order value
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
              Converted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitsKpiCards;
