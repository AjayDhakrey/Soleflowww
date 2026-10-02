import React from 'react';

interface SalesTeamKpiCardsProps {
  totalReps: number;
  repsCaption?: string;
  repsGrowth?: string;
  totalBooked: number;
  targetAmount: number;
  bookedGrowth?: string;
  commissionAccrued: number;
  commissionCaption?: string;
  commissionGrowth?: string;
  visitsDone: number;
  visitsGoal: number;
  visitsCompletionPct: number;
}

/* =========================================================================
   3D Claymorphic Vector SVGs for Sales Force & Field Dispatch
   ========================================================================= */

// 1. Total Field Reps (3D Blue / Indigo Field Force Team Figurines with Glow)
export const FieldForce3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="ffGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ffHeadMain" cx="42%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="40%" stopColor="#3B82F6" />
          <stop offset="85%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </radialGradient>
        <linearGradient id="ffBodyMain" x1="50" y1="52" x2="50" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="60%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <radialGradient id="ffHeadSide" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="50%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </radialGradient>
        <linearGradient id="ffBodySide" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>

      {/* Ambient Glow */}
      <circle cx="50" cy="52" r="38" fill="url(#ffGlow)" />

      {/* Sparkles */}
      <path d="M78 22L82 17" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
      <path d="M85 30H90" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />

      {/* Left Avatar */}
      <g filter="drop-shadow(0 4px 6px rgba(29,78,216,0.2))">
        <circle cx="28" cy="46" r="10" fill="url(#ffHeadSide)" />
        <path d="M14 74C14 62 21 57 28 57C35 57 42 62 42 74C42 75 39 76 28 76C17 76 14 75 14 74Z" fill="url(#ffBodySide)" />
      </g>

      {/* Right Avatar */}
      <g filter="drop-shadow(0 4px 6px rgba(29,78,216,0.2))">
        <circle cx="72" cy="46" r="10" fill="url(#ffHeadSide)" />
        <path d="M58 74C58 62 65 57 72 57C79 57 86 62 86 74C86 75 83 76 72 76C61 76 58 75 58 74Z" fill="url(#ffBodySide)" />
      </g>

      {/* Center Lead Avatar */}
      <g filter="drop-shadow(0 6px 10px rgba(30,58,138,0.35))">
        <path d="M29 82C29 65 38 58 50 58C62 58 71 65 71 82C71 85 66 87 50 87C34 87 29 85 29 82Z" fill="url(#ffBodyMain)" />
        <circle cx="50" cy="42" r="15" fill="url(#ffHeadMain)" />
        <ellipse cx="46" cy="36" rx="4.5" ry="3" fill="#FFFFFF" fillOpacity="0.45" transform="rotate(-20 46 36)" />
      </g>
    </svg>
  </div>
);

// 2. Total Booked (Month) (3D Violet Trend Growth Chart & Target Rocket)
export const BookedRevenue3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="bookGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F3E8FF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#F3E8FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="100%">
          <stop offset="0%" stopColor="#DDD6FE" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
        <linearGradient id="barGrad3" x1="0" y1="0" x2="0" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>
        <linearGradient id="trendArrow" x1="20" y1="70" x2="80" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>

      {/* Ambient Glow */}
      <circle cx="50" cy="52" r="38" fill="url(#bookGlow)" />

      {/* Sparkles */}
      <path d="M76 18L81 13" stroke="#9333EA" strokeWidth="3" strokeLinecap="round" />
      <path d="M84 25H89" stroke="#9333EA" strokeWidth="3" strokeLinecap="round" />

      {/* 3D Ascending Bars */}
      <g filter="drop-shadow(0 4px 6px rgba(126,34,206,0.25))">
        {/* Bar 1 */}
        <rect x="22" y="54" width="13" height="26" rx="5" fill="url(#barGrad1)" />
        {/* Bar 2 */}
        <rect x="42" y="42" width="13" height="38" rx="5" fill="url(#barGrad2)" />
        {/* Bar 3 */}
        <rect x="62" y="28" width="13" height="52" rx="5" fill="url(#barGrad3)" />
      </g>

      {/* Dynamic 3D Ascending Trend Line */}
      <path
        d="M20 62C32 54 44 48 56 38C64 30 72 26 80 22"
        stroke="url(#trendArrow)"
        strokeWidth="4.5"
        strokeLinecap="round"
        filter="drop-shadow(0 3px 5px rgba(147,51,234,0.35))"
      />
      {/* Arrow Tip */}
      <path
        d="M68 21H80V33"
        stroke="#8B5CF6"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

// 3. Commission Accrued (3D Emerald Green Wallet with Popping Gold Coins)
export const CommissionAccrued3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="commGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="commCoinGold" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#FACC15" />
          <stop offset="85%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </radialGradient>
        <linearGradient id="commWallet" x1="20" y1="36" x2="80" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="commWalletFlap" x1="50" y1="40" x2="50" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>

      {/* Glow */}
      <circle cx="50" cy="54" r="38" fill="url(#commGlow)" />

      {/* Sparkles */}
      <path d="M78 20L82 16" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M84 27H89" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

      {/* Gold Coin Popping Out */}
      <g filter="drop-shadow(0 4px 6px rgba(202,138,4,0.35))">
        <circle cx="64" cy="36" r="16" fill="url(#commCoinGold)" stroke="#CA8A04" strokeWidth="1.5" />
        <circle cx="64" cy="36" r="13" stroke="#FDE047" strokeWidth="1" strokeDasharray="2 2" fill="none" />
        <text x="64" y="42" textAnchor="middle" fontSize="15" fontWeight="900" fill="#854D0E" fontFamily="system-ui, -apple-system, sans-serif">
          ₹
        </text>
      </g>

      {/* 3D Green Leather Wallet Body */}
      <g filter="drop-shadow(0 8px 12px rgba(4,120,87,0.3))">
        <rect x="20" y="42" width="60" height="42" rx="12" fill="url(#commWallet)" />
        <path
          d="M20 48C20 44 24 42 28 42H72C76 42 80 44 80 48V52C80 58 74 62 68 62H32C26 62 20 58 20 52V48Z"
          fill="url(#commWalletFlap)"
          stroke="#A7F3D0"
          strokeWidth="1"
        />
        <circle cx="68" cy="56" r="4.5" fill="#FFFFFF" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))" />
        <circle cx="68" cy="56" r="2" fill="#047857" />
        <text x="46" y="74" textAnchor="middle" fontSize="22" fontWeight="900" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif">
          ₹
        </text>
      </g>
    </svg>
  </div>
);

// 4. Today's Field Visits (3D Amber/Orange Dispatch Location Pin & Beacon)
export const FieldVisits3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="visitGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pinGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#FBBF24" />
          <stop offset="85%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
        <linearGradient id="groundRing" x1="20" y1="78" x2="80" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Glow */}
      <circle cx="50" cy="52" r="38" fill="url(#visitGlow)" />

      {/* Sparkles */}
      <path d="M76 22L80 18" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M82 29H87" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

      {/* Ground Location Rings / Radar */}
      <ellipse cx="50" cy="80" rx="26" ry="9" stroke="url(#groundRing)" strokeWidth="2" strokeDasharray="4 3" fill="none" />
      <ellipse cx="50" cy="80" rx="14" ry="5" fill="#F59E0B" fillOpacity="0.2" />

      {/* 3D Glossy Map Pin */}
      <g filter="drop-shadow(0 8px 12px rgba(217,119,6,0.35))">
        <path
          d="M50 20C38.95 20 30 28.95 30 40C30 54 48 76 50 78C52 76 70 54 70 40C70 28.95 61.05 20 50 20Z"
          fill="url(#pinGrad)"
        />
        {/* Specular Highlight Arc */}
        <path
          d="M37 32C40 26 45 23 50 23C54 23 58 25 61 28"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />
        {/* Center White Core Circle */}
        <circle cx="50" cy="39" r="8.5" fill="#FFFFFF" filter="drop-shadow(0 2px 3px rgba(180,83,9,0.3))" />
        <circle cx="50" cy="39" r="4.5" fill="#D97706" />
      </g>
    </svg>
  </div>
);

/* =========================================================================
   Sales Force & Field Dispatch KPI Cards Component
   ========================================================================= */

export const SalesTeamKpiCards: React.FC<SalesTeamKpiCardsProps> = ({
  totalReps,
  repsCaption = 'Agra, Kanpur & Delhi routes',
  repsGrowth = '↑ +12%',
  totalBooked,
  targetAmount,
  bookedGrowth = '↑ +18%',
  commissionAccrued,
  commissionCaption = 'Calculated on cleared invoices',
  commissionGrowth = '↑ +8%',
  visitsDone,
  visitsGoal,
  visitsCompletionPct,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
      {/* 1. Total Field Reps */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <FieldForce3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Total Field Reps">
            Total Field Reps
          </span>
          <p className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5 font-sans truncate flex items-baseline gap-1.5" title={`${totalReps} Executives`}>
            <span className="tabular-nums">{totalReps}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 tracking-normal">Executives</span>
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
              {repsGrowth}
            </span>
            <span className="w-px h-3 bg-slate-200 dark:bg-slate-700 shrink-0" />
            <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 truncate" title={repsCaption}>
              {repsCaption}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Total Booked (Month) */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <BookedRevenue3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Total Booked (Month)">
            Total Booked (Month)
          </span>
          <p className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5 font-sans truncate" title={`₹${(totalBooked / 100000).toFixed(1)}L`}>
            ₹{(totalBooked / 100000).toFixed(1)}L
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
              {bookedGrowth}
            </span>
            <span className="w-px h-3 bg-slate-200 dark:bg-slate-700 shrink-0" />
            <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 truncate" title={`Target: ₹${(targetAmount / 100000).toFixed(1)}L (${targetAmount > 0 ? Math.round((totalBooked / targetAmount) * 100) : 0}%)`}>
              Target: ₹{(targetAmount / 100000).toFixed(1)}L ({targetAmount > 0 ? Math.round((totalBooked / targetAmount) * 100) : 0}%)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Commission Accrued */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <CommissionAccrued3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Commission Accrued">
            Commission Accrued
          </span>
          <p className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5 font-sans truncate" title={`₹${commissionAccrued.toLocaleString('en-IN')}`}>
            ₹{commissionAccrued.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
              {commissionGrowth}
            </span>
            <span className="w-px h-3 bg-slate-200 dark:bg-slate-700 shrink-0" />
            <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 truncate" title={commissionCaption}>
              {commissionCaption}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Today's Field Visits */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <FieldVisits3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Today's Field Visits">
            Today's Field Visits
          </span>
          <p className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5 font-sans truncate flex items-baseline gap-1.5" title={`${visitsDone} / ${visitsGoal} Done`}>
            <span className="tabular-nums">{visitsDone} / {visitsGoal}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 tracking-normal">Done</span>
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
              ↑ +{visitsDone}
            </span>
            <span className="w-px h-3 bg-slate-200 dark:bg-slate-700 shrink-0" />
            <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 truncate" title={`${visitsCompletionPct}% daily route completion`}>
              {visitsCompletionPct}% daily route
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesTeamKpiCards;
