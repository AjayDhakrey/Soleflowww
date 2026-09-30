import React from 'react';
import { Icons } from '../../lib/icons';

interface ReportsKpiCardsProps {
  totalRevenue: string;
  revenueCaption?: string;
  avgMargin: string;
  marginCaption?: string;
  activeOutlets: string;
  outletsCaption?: string;
  pendingRequests: string;
  requestsCaption?: string;
  onRequestsClick?: () => void;
}

/* =========================================================================
   3D Claymorphic Vector SVGs for Reports, Margins & Analytics
   ========================================================================= */

// 1. Total Revenue (3D Mint-Emerald Ascending Growth Graph & Cash Stack)
export const TotalRevenue3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="revGlowGrn" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="revSphereGrn" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="35%" stopColor="#10B981" />
          <stop offset="75%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064E3B" />
        </radialGradient>
        <linearGradient id="revArrowGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#revGlowGrn)" />

      {/* Main Base Shield */}
      <rect
        x="20"
        y="20"
        width="60"
        height="60"
        rx="20"
        fill="url(#revSphereGrn)"
        filter="drop-shadow(0 6px 12px rgba(5,150,105,0.35))"
      />

      {/* 3D Bar Columns */}
      <rect x="30" y="52" width="9" height="18" rx="4" fill="#A7F3D0" opacity="0.9" />
      <rect x="44" y="42" width="9" height="28" rx="4" fill="#D1FAE5" opacity="0.95" />
      <rect x="58" y="32" width="9" height="38" rx="4" fill="#FFFFFF" />

      {/* Ascending Trend Arrow */}
      <path
        d="M32 46L48 36L60 25M60 25H48M60 25V37"
        stroke="url(#revArrowGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"
      />

      {/* Specular Highlight */}
      <ellipse cx="38" cy="27" rx="8" ry="3" fill="#FFFFFF" opacity="0.45" />

      {/* Sparkle */}
      <path d="M76 22L78 16L80 22L86 24L80 26L78 32L76 26L70 24Z" fill="#34D399" />
    </svg>
  </div>
);

// 2. Wholesale Margin (3D Blue & Cyan Percentage Disc)
export const WholesaleMargin3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="mrgGlowBlu" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mrgSphereBlu" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="35%" stopColor="#0284C7" />
          <stop offset="75%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#075985" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#mrgGlowBlu)" />

      {/* Circular 3D Coin Badge */}
      <circle cx="50" cy="50" r="33" fill="url(#mrgSphereBlu)" filter="drop-shadow(0 6px 12px rgba(2,132,199,0.35))" />

      {/* Inner Inset Ring */}
      <circle cx="50" cy="50" r="26" stroke="#BAE6FD" strokeWidth="2.5" strokeDasharray="5 3" opacity="0.8" />

      {/* 3D % Percentage Sign */}
      <circle cx="41" cy="40" r="4.5" fill="#FFFFFF" filter="drop-shadow(0 2px 2px rgba(0,0,0,0.2))" />
      <circle cx="59" cy="60" r="4.5" fill="#FFFFFF" filter="drop-shadow(0 2px 2px rgba(0,0,0,0.2))" />
      <line x1="62" y1="36" x2="38" y2="64" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" filter="drop-shadow(0 2px 2px rgba(0,0,0,0.2))" />

      {/* Top Gloss Curve */}
      <ellipse cx="40" cy="27" rx="8" ry="3.5" fill="#FFFFFF" opacity="0.45" transform="rotate(-20 40 27)" />
      
      {/* Floating Sparkle */}
      <path d="M74 24L76 19L78 24L83 26L78 28L76 33L74 28L69 26Z" fill="#38BDF8" />
    </svg>
  </div>
);

// 3. Active Retail Outlets (3D Purple Storefront / Boutique Building)
export const RetailOutlets3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="outGlowPurp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="outSpherePurp" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="35%" stopColor="#8B5CF6" />
          <stop offset="75%" stopColor="#6D28D9" />
          <stop offset="100%" stopColor="#4C1D95" />
        </radialGradient>
        <linearGradient id="outAwning" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#DDD6FE" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#outGlowPurp)" />

      {/* Store Base Building */}
      <rect
        x="22"
        y="30"
        width="56"
        height="48"
        rx="12"
        fill="url(#outSpherePurp)"
        filter="drop-shadow(0 8px 14px rgba(109,40,217,0.35))"
      />

      {/* Awning Canopy */}
      <path
        d="M20 36C20 30 24 26 30 26H70C76 26 80 30 80 36L77 46H23L20 36Z"
        fill="url(#outAwning)"
        filter="drop-shadow(0 3px 4px rgba(0,0,0,0.18))"
      />
      {/* Awning Stripes */}
      <path d="M32 26L30 46M44 26L43 46M56 26L57 46M68 26L70 46" stroke="#8B5CF6" strokeWidth="2.5" opacity="0.6" />

      {/* Front Door / Showcase */}
      <rect x="38" y="52" width="24" height="26" rx="5" fill="#FFFFFF" opacity="0.9" />
      <circle cx="57" cy="65" r="2" fill="#6D28D9" />

      {/* Specular Highlight */}
      <ellipse cx="36" cy="30" rx="7" ry="2.5" fill="#FFFFFF" opacity="0.6" />
      
      {/* Sparkle */}
      <path d="M78 20L80 15L82 20L87 22L82 24L80 29L78 24L73 22Z" fill="#A78BFA" />
    </svg>
  </div>
);

// 4. Special Margin Requests (3D Amber Glowing Clipboard & Stamp)
export const MarginRequests3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="reqGlowAmb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="reqSphereAmb" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="75%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#reqGlowAmb)" />

      {/* Clipboard Body */}
      <rect
        x="24"
        y="22"
        width="52"
        height="60"
        rx="14"
        fill="url(#reqSphereAmb)"
        filter="drop-shadow(0 6px 12px rgba(217,119,6,0.35))"
      />

      {/* Inset White Paper Document */}
      <rect x="30" y="32" width="40" height="44" rx="8" fill="#FFFFFF" opacity="0.95" />

      {/* Text Lines on Paper */}
      <line x1="36" y1="42" x2="56" y2="42" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
      <line x1="36" y1="50" x2="64" y2="50" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      <line x1="36" y1="58" x2="52" y2="58" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

      {/* Top Clip */}
      <rect x="41" y="17" width="18" height="10" rx="4" fill="#78350F" filter="drop-shadow(0 2px 2px rgba(0,0,0,0.2))" />
      <circle cx="50" cy="21" r="2" fill="#FFFFFF" opacity="0.7" />

      {/* Specular Glint */}
      <ellipse cx="36" cy="28" rx="6" ry="2.5" fill="#FFFFFF" opacity="0.5" />

      {/* Sparkle */}
      <path d="M76 22L78 17L80 22L85 24L80 26L78 31L76 26L71 24Z" fill="#F59E0B" />
    </svg>
  </div>
);

/* =========================================================================
   Main Component: ReportsKpiCards
   ========================================================================= */
export const ReportsKpiCards: React.FC<ReportsKpiCardsProps> = ({
  totalRevenue,
  revenueCaption = 'Wholesale billed turnover',
  avgMargin,
  marginCaption = 'Healthy distributor spread',
  activeOutlets,
  outletsCaption = 'Consistent repeat billing',
  pendingRequests,
  requestsCaption = 'Special margin requests',
  onRequestsClick,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {/* 1. Total Revenue */}
      <div className="group relative rounded-2xl p-5 sm:p-6 flex items-center gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none">
        <TotalRevenue3D />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
              Total Revenue
            </span>
            <span className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
              <Icons.ChevronRight size={15} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-800 dark:text-emerald-300 mt-0.5 font-sans">
            {totalRevenue}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate">
            {revenueCaption}
          </p>
        </div>
      </div>

      {/* 2. Average Wholesale Margin */}
      <div className="group relative rounded-2xl p-5 sm:p-6 flex items-center gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none">
        <WholesaleMargin3D />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
              Average Wholesale Margin
            </span>
            <span className="w-7 h-7 rounded-full flex items-center justify-center bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
              <Icons.ChevronRight size={15} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-800 dark:text-blue-300 mt-0.5 font-sans">
            {avgMargin}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate">
            {marginCaption}
          </p>
        </div>
      </div>

      {/* 3. Active Retail Outlets */}
      <div className="group relative rounded-2xl p-5 sm:p-6 flex items-center gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none">
        <RetailOutlets3D />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
              Active Retail Outlets
            </span>
            <span className="w-7 h-7 rounded-full flex items-center justify-center bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all shrink-0">
              <Icons.ChevronRight size={15} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-purple-800 dark:text-purple-300 mt-0.5 font-sans">
            {activeOutlets}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate">
            {outletsCaption}
          </p>
        </div>
      </div>

      {/* 4. Special Margin Requests */}
      <div
        onClick={onRequestsClick}
        className="group relative rounded-2xl p-5 sm:p-6 flex items-center gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none cursor-pointer active:scale-[0.99]"
      >
        <MarginRequests3D />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
              Special Margin Requests
            </span>
            <span className="w-7 h-7 rounded-full flex items-center justify-center bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-all shrink-0">
              <Icons.ChevronRight size={15} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-800 dark:text-amber-300 mt-0.5 font-sans">
            {pendingRequests}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate">
            {requestsCaption}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsKpiCards;
