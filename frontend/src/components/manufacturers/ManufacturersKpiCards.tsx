import React from 'react';
import { Icons } from '../../lib/icons';

interface ManufacturersKpiCardsProps {
  totalUnitsCount?: number | string;
  cumulativeCapacity?: string;
  onTimeRate?: string;
  qcPassRate?: string;
}

/* =========================================================================
   3D Claymorphic Vector SVGs for Manufacturing Plants & Foundries
   ========================================================================= */

// 1. Partner Foundries (3D Blue & Green Multi-Worker Figurines + Radiating Sparkles)
export const PartnerFoundries3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="fndGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="headBlueFnd" cx="42%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="45%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </radialGradient>
        <linearGradient id="bodyBlueFnd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <radialGradient id="headGreenFnd" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="50%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </radialGradient>
        <linearGradient id="bodyGreenFnd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#fndGlow)" />

      {/* Top Radiating Rays */}
      <path d="M50 14V8" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M38 17L34 12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M62 17L66 12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

      {/* Right Worker (Green) */}
      <g filter="drop-shadow(0 4px 6px rgba(5,150,105,0.3))">
        <circle cx="68" cy="46" r="10" fill="url(#headGreenFnd)" />
        <path d="M55 74C55 63 61 58 68 58C75 58 81 63 81 74C81 75 78 76 68 76C58 76 55 75 55 74Z" fill="url(#bodyGreenFnd)" />
      </g>

      {/* Left Worker (Blue Main Lead) */}
      <g filter="drop-shadow(0 6px 10px rgba(2,132,199,0.4))">
        <path d="M26 80C26 65 35 58 48 58C61 58 68 65 68 80C68 83 62 85 48 85C34 85 26 83 26 80Z" fill="url(#bodyBlueFnd)" />
        <circle cx="48" cy="42" r="14" fill="url(#headBlueFnd)" />
        <ellipse cx="44" cy="37" rx="4" ry="2.5" fill="#FFFFFF" fillOpacity="0.45" transform="rotate(-20 44 37)" />
      </g>
    </svg>
  </div>
);

// 2. Cumulative Capacity (3D Stepped Bar Chart + Golden Upward Trend Arrow)
export const CumulativeCapacity3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="capGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F3E8FF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#F3E8FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="barPinkCap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
        <linearGradient id="barBlueCap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="barPurpleCap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
        <linearGradient id="arrowGoldCap" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#capGlow)" />

      {/* Upward Growth Trend Arrow */}
      <g filter="drop-shadow(0 4px 6px rgba(234,88,12,0.35))">
        <path d="M22 64L68 24" stroke="url(#arrowGoldCap)" strokeWidth="6" strokeLinecap="round" />
        <path d="M58 22H70V34" stroke="#F97316" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* 3D Stepped Bar Chart Towers */}
      <g filter="drop-shadow(0 6px 10px rgba(126,34,206,0.3))">
        <rect x="24" y="58" width="14" height="24" rx="5" fill="url(#barPinkCap)" />
        <rect x="44" y="44" width="14" height="38" rx="5" fill="url(#barBlueCap)" />
        <rect x="64" y="32" width="14" height="50" rx="5" fill="url(#barPurpleCap)" />
      </g>
    </svg>
  </div>
);

// 3. Average On-Time Delivery (3D Blue & Green Fast Delivery Truck + Speed Lines)
export const OnTimeDelivery3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="ontGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="truckBodyGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="truckCabBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#ontGlow)" />

      {/* Speed Motion Lines */}
      <line x1="16" y1="46" x2="26" y2="46" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="14" y1="54" x2="24" y2="54" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="18" y1="62" x2="26" y2="62" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />

      {/* 3D Delivery Truck */}
      <g filter="drop-shadow(0 6px 10px rgba(2,132,199,0.35))">
        {/* Green Cargo Body */}
        <rect x="28" y="38" width="34" height="30" rx="5" fill="url(#truckBodyGreen)" />
        {/* Blue Front Cab */}
        <path d="M62 46H74C77 46 80 50 80 54V68H62V46Z" fill="url(#truckCabBlue)" />
        {/* Cab Window */}
        <path d="M65 49H72C74 49 76 51 76 54V58H65V49Z" fill="#FFFFFF" />
        {/* Wheels */}
        <circle cx="40" cy="68" r="6" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.5" />
        <circle cx="40" cy="68" r="2.5" fill="#FFFFFF" />
        <circle cx="70" cy="68" r="6" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.5" />
        <circle cx="70" cy="68" r="2.5" fill="#FFFFFF" />
      </g>
    </svg>
  </div>
);

// 4. Average QC Pass Ratio (3D Golden Security Shield + White Checkmark + Sparkles)
export const QcPassRatio3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="qcGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="shieldGoldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#FBBF24" />
          <stop offset="80%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="shieldInnerGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#qcGlow)" />

      {/* Sparkles */}
      <path d="M78 24L83 20" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M84 32H89" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

      {/* 3D Shield Body */}
      <g filter="drop-shadow(0 6px 10px rgba(217,119,6,0.35))">
        {/* Outer Shield */}
        <path
          d="M50 20L74 28C74 52 64 68 50 78C36 68 26 52 26 28L50 20Z"
          fill="url(#shieldGoldGrad)"
          stroke="#FDE68A"
          strokeWidth="1.5"
        />
        {/* Inner Face */}
        <path
          d="M50 24L70 30.5C70 49.5 61.5 63 50 71.5C38.5 63 30 49.5 30 30.5L50 24Z"
          fill="url(#shieldInnerGold)"
        />
        {/* White Checkmark */}
        <path
          d="M41 48L47 54L60 38"
          stroke="#FFFFFF"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0 2px 4px rgba(180,83,9,0.3))"
        />
      </g>
    </svg>
  </div>
);

/* =========================================================================
   Manufacturers KPI Summary Cards Component
   ========================================================================= */

export const ManufacturersKpiCards: React.FC<ManufacturersKpiCardsProps> = ({
  totalUnitsCount = '4 Units',
  cumulativeCapacity = '32K Prs/Mo',
  onTimeRate = '95%',
  qcPassRate = '99.2%',
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
      {/* 1. Partner Foundries */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <PartnerFoundries3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Partner Foundries">
            Partner Foundries
          </span>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-300 mt-0.5 font-sans truncate"
            title={typeof totalUnitsCount === 'number' ? `${totalUnitsCount} Units` : totalUnitsCount}
          >
            {typeof totalUnitsCount === 'number' ? `${totalUnitsCount} Units` : totalUnitsCount}
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="Agra, Kanpur & Delhi hubs">
            Agra, Kanpur &amp; Delhi hubs
          </p>
        </div>
      </div>

      {/* 2. Cumulative Capacity */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <CumulativeCapacity3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Cumulative Capacity">
            Cumulative Capacity
          </span>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-purple-800 dark:text-purple-300 mt-0.5 font-sans truncate"
            title={cumulativeCapacity}
          >
            {cumulativeCapacity}
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="Across all assembly lines">
            Across all assembly lines
          </p>
        </div>
      </div>

      {/* 3. Average On-Time Delivery */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <OnTimeDelivery3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Average On-Time Delivery">
            Average On-Time Delivery
          </span>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-blue-800 dark:text-blue-300 mt-0.5 font-sans truncate"
            title={onTimeRate}
          >
            {onTimeRate}
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="Bilty dispatch punctuality">
            Bilty dispatch punctuality
          </p>
        </div>
      </div>

      {/* 4. Average QC Pass Ratio */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <QcPassRatio3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Average QC Pass Ratio">
            Average QC Pass Ratio
          </span>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-emerald-800 dark:text-emerald-300 mt-0.5 font-sans truncate"
            title={qcPassRate}
          >
            {qcPassRate}
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="Zero-defect sole bonding">
            Zero-defect sole bonding
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManufacturersKpiCards;
