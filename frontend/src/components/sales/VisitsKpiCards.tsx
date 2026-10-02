import React from 'react';
import { Icons } from '../../lib/icons';

interface VisitsKpiCardsProps {
  totalStopsCount: number;
  completedVisitsCount: number;
  pendingStopsCount: number;
  ordersBookedAmount: number | string;
}

/* =========================================================================
   3D Claymorphic Vector SVGs for Retail Store Visits & Routes
   ========================================================================= */

// 1. Total Route Stops (3D Folded Navigation Map with Red GPS Pins & Route Path)
export const RouteMap3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mapFold1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </linearGradient>
        <linearGradient id="mapFold2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        <linearGradient id="mapFold3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </linearGradient>
        <linearGradient id="pinRedMap" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#mapGlow)" />

      {/* 3D Folded Map in Isometric Perspective */}
      <g filter="drop-shadow(0 6px 10px rgba(2,132,199,0.35))">
        {/* Fold 1 (Left) */}
        <polygon points="18,36 38,26 38,72 18,82" fill="url(#mapFold1)" stroke="#0284C7" strokeWidth="1" />
        {/* Fold 2 (Center) */}
        <polygon points="38,26 62,38 62,84 38,72" fill="url(#mapFold2)" stroke="#0284C7" strokeWidth="1" />
        {/* Fold 3 (Right) */}
        <polygon points="62,38 84,28 84,74 62,84" fill="url(#mapFold3)" stroke="#0284C7" strokeWidth="1" />

        {/* Winding Blue Navigation Route Path */}
        <path
          d="M24,64 Q38,40 50,56 T76,46"
          stroke="#2563EB"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="4 2"
          fill="none"
        />

        {/* Mini Storefront Building on Right Fold */}
        <rect x="68" y="52" width="10" height="12" rx="2" fill="#F43F5E" />
        <path d="M66 52L73 46L80 52H66Z" fill="#FDA4AF" />
      </g>

      {/* 3D Red GPS Map Pin 1 (Left) */}
      <g filter="drop-shadow(0 3px 5px rgba(225,29,72,0.4))">
        <path
          d="M28 32C24.6863 32 22 34.6863 22 38C22 43 28 50 28 50C28 50 34 43 34 38C34 34.6863 31.3137 32 28 32Z"
          fill="url(#pinRedMap)"
        />
        <circle cx="28" cy="37" r="2.5" fill="#FFFFFF" />
      </g>

      {/* 3D Red GPS Map Pin 2 (Center-Right) */}
      <g filter="drop-shadow(0 3px 5px rgba(225,29,72,0.4))">
        <path
          d="M58 26C54.6863 26 52 28.6863 52 32C52 37 58 44 58 44C58 44 64 37 64 32C64 28.6863 61.3137 26 58 26Z"
          fill="url(#pinRedMap)"
        />
        <circle cx="58" cy="31" r="2.5" fill="#FFFFFF" />
      </g>
    </svg>
  </div>
);

// 2. Completed Visits (3D Green Retail Storefront Shop + Green Pin + Checkmark Badge)
export const StorefrontVisited3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="storeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pinGreenStore" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#storeGlow)" />

      {/* 3D Retail Storefront Shop */}
      <g filter="drop-shadow(0 6px 10px rgba(5,150,105,0.35))">
        {/* Main Store Building Body */}
        <rect x="24" y="44" width="52" height="38" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        {/* Glass Windows & Door */}
        <rect x="30" y="56" width="14" height="18" rx="2" fill="#BAE6FD" />
        <rect x="56" y="56" width="14" height="26" rx="2" fill="#60A5FA" />

        {/* Green & White Striped Awning */}
        <path d="M20 44L26 34H74L80 44H20Z" fill="#10B981" />
        <path d="M28 34L24 44H32L34 34H28Z" fill="#FFFFFF" />
        <path d="M42 34L40 44H48L48 34H42Z" fill="#FFFFFF" />
        <path d="M56 34L56 44H64L62 34H56Z" fill="#FFFFFF" />
        <path d="M70 34L72 44H80L74 34H70Z" fill="#FFFFFF" />

        {/* Scalloped Awning Bottom */}
        <path
          d="M20 44Q23 48 26 44Q29 48 32 44Q35 48 38 44Q41 48 44 44Q47 48 50 44Q53 48 56 44Q59 48 62 44Q65 48 68 44Q71 48 74 44Q77 48 80 44"
          stroke="#047857"
          strokeWidth="2"
          fill="none"
        />
      </g>

      {/* 3D Green Location Pin mounted on Store */}
      <g filter="drop-shadow(0 4px 6px rgba(4,120,87,0.4))">
        <path
          d="M70 20C65.5817 20 62 23.5817 62 28C62 34 70 44 70 44C70 44 78 34 78 28C78 23.5817 74.4183 20 70 20Z"
          fill="url(#pinGreenStore)"
        />
        <circle cx="70" cy="27" r="3" fill="#FFFFFF" />
      </g>

      {/* 3D Green Checkmark Badge on Bottom-Right */}
      <g filter="drop-shadow(0 3px 5px rgba(4,120,87,0.4))">
        <circle cx="74" cy="74" r="11" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
        <path d="M69 74L72 77L79 70" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  </div>
);

// 3. Pending Stops (3D Map Grid + Red Location Pin + Golden Glass Hourglass Timer)
export const PendingStops3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="pendGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pinRedPend" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>
        <radialGradient id="sandGoldPend" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#EAB308" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#pendGlow)" />

      {/* Sparkles */}
      <path d="M78 26L83 22" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M84 34H89" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

      {/* Isometric Map Grid Tile */}
      <g filter="drop-shadow(0 4px 6px rgba(217,119,6,0.25))">
        <polygon points="20,54 50,40 68,52 38,66" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="1.5" />
        <line x1="30" y1="49" x2="48" y2="58" stroke="#FED7AA" strokeWidth="1" />
        <line x1="40" y1="45" x2="58" y2="54" stroke="#FED7AA" strokeWidth="1" />
        <line x1="35" y1="61" x2="59" y2="47" stroke="#FDBA74" strokeWidth="1.5" strokeDasharray="2 2" />
      </g>

      {/* 3D Big Red GPS Location Pin */}
      <g filter="drop-shadow(0 6px 10px rgba(225,29,72,0.4))">
        <path
          d="M40 22C32.268 22 26 28.268 26 36C26 46 40 60 40 60C40 60 54 46 54 36C54 28.268 47.732 22 40 22Z"
          fill="url(#pinRedPend)"
        />
        <circle cx="40" cy="34" r="5" fill="#FFFFFF" />
      </g>

      {/* 3D Golden Glass Hourglass Timer on Right */}
      <g filter="drop-shadow(0 4px 8px rgba(217,119,6,0.4))">
        <rect x="60" y="44" width="22" height="4" rx="2" fill="#F59E0B" />
        <rect x="60" y="74" width="22" height="4" rx="2" fill="#F59E0B" />
        {/* Glass Bulb */}
        <path
          d="M63 48C63 56 69 58 71 60C69 62 63 64 63 74H79C79 64 73 62 71 60C73 58 79 56 79 48H63Z"
          fill="#FEF3C7"
          fillOpacity="0.8"
          stroke="#FBBF24"
          strokeWidth="1.5"
        />
        {/* Golden Sand */}
        <path d="M65 50C65 55 70 57 71 58C72 57 77 55 77 50H65Z" fill="url(#sandGoldPend)" />
        <path d="M66 73C66 69 70 67 71 67C72 67 76 69 76 73H66Z" fill="url(#sandGoldPend)" />
      </g>
    </svg>
  </div>
);

// 4. Orders Booked on Route (3D Cardboard Box + Purple Route Loop + Purple Pin + Purple Rupee Coin)
export const RouteOrders3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="ordRouteGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F3E8FF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#F3E8FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="boxTopRoute" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="boxLeftRoute" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="boxRightRoute" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="pinPurpleRoute" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>
        <linearGradient id="coinPurpleRoute" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#ordRouteGlow)" />

      {/* Purple Route Loop Dashes around box */}
      <path
        d="M24 44C24 36 36 36 44 36H70C76 36 78 44 78 54V68C78 74 70 76 60 76H32C24 76 24 68 24 58Z"
        stroke="#A855F7"
        strokeWidth="2.5"
        strokeDasharray="4 3"
        fill="none"
      />

      {/* 3D Isometric Cardboard Box */}
      <g filter="drop-shadow(0 6px 10px rgba(180,83,9,0.35))">
        <path d="M44 34L64 44L44 54L24 44Z" fill="url(#boxTopRoute)" />
        <path d="M24 44L44 54V74L24 64Z" fill="url(#boxLeftRoute)" />
        <path d="M44 54L64 44V64L44 74Z" fill="url(#boxRightRoute)" />
        <path d="M44 34V74" stroke="#FBBF24" strokeWidth="2.5" strokeOpacity="0.8" />
      </g>

      {/* 3D Purple Location Pin on top of box */}
      <g filter="drop-shadow(0 4px 6px rgba(126,34,206,0.4))">
        <path
          d="M44 18C39.5817 18 36 21.5817 36 26C36 32 44 42 44 42C44 42 52 32 52 26C52 21.5817 48.4183 18 44 18Z"
          fill="url(#pinPurpleRoute)"
        />
        <circle cx="44" cy="25" r="3" fill="#FFFFFF" />
      </g>

      {/* 3D Purple Rupee Coin on Bottom-Right */}
      <g filter="drop-shadow(0 3px 5px rgba(126,34,206,0.4))">
        <circle cx="74" cy="72" r="11" fill="url(#coinPurpleRoute)" stroke="#FFFFFF" strokeWidth="2.5" />
        <text x="74" y="76" textAnchor="middle" fontSize="11" fontWeight="900" fill="#FFFFFF" fontFamily="system-ui, sans-serif">
          ₹
        </text>
      </g>
    </svg>
  </div>
);

/* =========================================================================
   Visits KPI Summary Cards Component
   ========================================================================= */

export const VisitsKpiCards: React.FC<VisitsKpiCardsProps> = ({
  totalStopsCount,
  completedVisitsCount,
  pendingStopsCount,
  ordersBookedAmount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
      {/* 1. Total Route Stops */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <RouteMap3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Total Route Stops">
            Total Route Stops
          </span>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5 font-sans truncate flex items-baseline gap-1.5"
            title={`${totalStopsCount} Stores`}
          >
            <span className="tabular-nums">{totalStopsCount}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 tracking-normal">Stores</span>
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="Assigned route itinerary">
            Assigned route itinerary
          </p>
        </div>
      </div>

      {/* 2. Completed Visits */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <StorefrontVisited3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Completed Visits">
            Completed Visits
          </span>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-300 mt-0.5 font-sans truncate flex items-baseline gap-1.5"
            title={`${completedVisitsCount} Done`}
          >
            <span className="tabular-nums">{completedVisitsCount}</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-600/90 dark:text-emerald-400/90 tracking-normal">Done</span>
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="Physical store visits">
            Physical store visits
          </p>
        </div>
      </div>

      {/* 3. Pending Stops */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <PendingStops3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Pending Stops">
            Pending Stops
          </span>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-amber-700 dark:text-amber-300 mt-0.5 font-sans truncate flex items-baseline gap-1.5"
            title={`${pendingStopsCount} Pending`}
          >
            <span className="tabular-nums">{pendingStopsCount}</span>
            <span className="text-xs sm:text-sm font-bold text-amber-600/90 dark:text-amber-400/90 tracking-normal">Pending</span>
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="Remaining market queue">
            Remaining market queue
          </p>
        </div>
      </div>

      {/* 4. Orders Booked on Route */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <RouteOrders3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Orders Booked on Route">
            Orders Booked on Route
          </span>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-purple-700 dark:text-purple-300 mt-0.5 font-sans truncate"
            title={typeof ordersBookedAmount === 'number' ? `₹${(ordersBookedAmount / 100000).toFixed(2)}L` : String(ordersBookedAmount)}
          >
            <span className="tabular-nums">
              {typeof ordersBookedAmount === 'number'
                ? `₹${(ordersBookedAmount / 100000).toFixed(2)}L`
                : ordersBookedAmount}
            </span>
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="Territory orders captured">
            Territory orders captured
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisitsKpiCards;
