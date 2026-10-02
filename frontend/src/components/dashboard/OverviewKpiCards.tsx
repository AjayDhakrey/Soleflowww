import React from 'react';
import { Icons } from '../../lib/icons';

interface OverviewKpiCardsProps {
  salesValue: string;
  salesGrowth?: number;
  collectionsValue: string;
  collectionsGrowth?: number;
  receivablesValue: string;
  receivablesAccountsCount?: number;
  openOrdersCount: number;
  openOrdersValue: string;
  activeStoresCount: number;
  totalRegisteredBuyers?: number;
  pairsBookedValue: string | number;
  pairsBookedGrowth?: number;
  onNavigate: (path: string) => void;
  isSalesperson?: boolean;
}

/* =========================================================================
   3D Claymorphic Vector Illustrations
   ========================================================================= */

// 1. Sales Booked (3D Clipboard + Shopping Cart + Checkmark)
const SalesBooked3D = () => (
  <svg viewBox="0 0 120 100" className="w-20 h-16 sm:w-24 sm:h-20 drop-shadow-md select-none" fill="none">
    {/* Clipboard Base */}
    <rect x="25" y="16" width="60" height="74" rx="12" fill="url(#clipGrad)" stroke="#60A5FA" strokeWidth="2.5" />
    <rect x="31" y="24" width="48" height="60" rx="8" fill="#FFFFFF" fillOpacity="0.95" />
    
    {/* Top Clip */}
    <rect x="42" y="10" width="26" height="12" rx="4" fill="#3B82F6" />
    <rect x="47" y="6" width="16" height="8" rx="3" fill="#93C5FD" />
    <circle cx="55" cy="16" r="3" fill="#1D4ED8" />

    {/* Shopping Cart on Paper */}
    <path d="M42 42h5l4 14h18l3-10H46" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="52" cy="60" r="2.5" fill="#2563EB" />
    <circle cx="66" cy="60" r="2.5" fill="#2563EB" />
    
    {/* Cart Lines */}
    <line x1="42" y1="68" x2="68" y2="68" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
    <line x1="42" y1="74" x2="60" y2="74" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />

    {/* Speed Dashes */}
    <line x1="88" y1="26" x2="94" y2="22" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="90" y1="36" x2="98" y2="34" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />

    {/* 3D Success Checkmark Badge */}
    <circle cx="82" cy="68" r="16" fill="url(#checkGrad)" filter="drop-shadow(0 4px 6px rgba(16,185,129,0.35))" />
    <circle cx="82" cy="68" r="13" fill="#10B981" />
    <path d="M76 68l4 4 8-9" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

    <defs>
      <linearGradient id="clipGrad" x1="25" y1="16" x2="85" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor="#93C5FD" />
        <stop offset="1" stopColor="#3B82F6" />
      </linearGradient>
      <linearGradient id="checkGrad" x1="66" y1="52" x2="98" y2="84" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34D399" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
    </defs>
  </svg>
);

// 2. Collections (3D Gold Coins Stack + Rupee + Growth Arrow)
const Collections3D = () => (
  <svg viewBox="0 0 120 100" className="w-20 h-16 sm:w-24 sm:h-20 drop-shadow-md select-none" fill="none">
    {/* Green Growth Arrow Behind */}
    <path d="M68 46L88 22m0 0h-14m14 0v14" stroke="#10B981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 2px 4px rgba(16,185,129,0.3))" />

    {/* Back Coin 1 */}
    <ellipse cx="44" cy="66" rx="20" ry="8" fill="#F59E0B" />
    <path d="M24 66v8c0 4.4 9 8 20 8s20-3.6 20-8v-8" fill="#D97706" />
    <ellipse cx="44" cy="66" rx="20" ry="8" fill="#FBBF24" />

    {/* Back Coin 2 */}
    <ellipse cx="44" cy="54" rx="20" ry="8" fill="#F59E0B" />
    <path d="M24 54v8c0 4.4 9 8 20 8s20-3.6 20-8v-8" fill="#D97706" />
    <ellipse cx="44" cy="54" rx="20" ry="8" fill="#FCD34D" />

    {/* Back Coin 3 */}
    <ellipse cx="44" cy="42" rx="20" ry="8" fill="#F59E0B" />
    <path d="M24 42v8c0 4.4 9 8 20 8s20-3.6 20-8v-8" fill="#D97706" />
    <ellipse cx="44" cy="42" rx="20" ry="8" fill="#FDE68A" />

    {/* Front Big Gold Rupee Coin */}
    <circle cx="74" cy="60" r="20" fill="url(#goldGrad)" stroke="#F59E0B" strokeWidth="2.5" filter="drop-shadow(0 4px 8px rgba(217,119,6,0.3))" />
    <circle cx="74" cy="60" r="16" fill="url(#goldInner)" />
    <text x="74" y="67" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#B45309" fontFamily="system-ui, sans-serif">₹</text>

    {/* Sparkles */}
    <path d="M22 34l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#FBBF24" />
    <path d="M96 52l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="#34D399" />

    <defs>
      <linearGradient id="goldGrad" x1="54" y1="40" x2="94" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A" />
        <stop offset="0.5" stopColor="#FBBF24" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="goldInner" x1="58" y1="44" x2="90" y2="76" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEF3C7" />
        <stop offset="1" stopColor="#FCD34D" />
      </linearGradient>
    </defs>
  </svg>
);

// 3. Receivables (3D Invoice Document + Rupee Wax Seal + Calendar Badge)
const Receivables3D = () => (
  <svg viewBox="0 0 120 100" className="w-20 h-16 sm:w-24 sm:h-20 drop-shadow-md select-none" fill="none">
    {/* Purple Folded Invoice Sheet */}
    <g transform="rotate(-6 50 50)">
      <rect x="24" y="16" width="56" height="72" rx="10" fill="url(#invGrad)" stroke="#F472B6" strokeWidth="2" />
      <rect x="30" y="22" width="44" height="60" rx="6" fill="#FFFFFF" fillOpacity="0.95" />
      
      {/* Invoice Content Lines */}
      <line x1="38" y1="32" x2="66" y2="32" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" />
      <line x1="38" y1="40" x2="60" y2="40" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="47" x2="66" y2="47" stroke="#FBCFE8" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="54" x2="52" y2="54" stroke="#FBCFE8" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* Pink Calendar Badge Top Right */}
    <rect x="72" y="16" width="30" height="26" rx="6" fill="url(#calGrad)" stroke="#FB7185" strokeWidth="2" filter="drop-shadow(0 3px 5px rgba(244,63,94,0.25))" />
    <rect x="72" y="16" width="30" height="8" fill="#E11D48" rx="4" />
    <circle cx="78" cy="20" r="1.5" fill="#FFFFFF" />
    <circle cx="96" cy="20" r="1.5" fill="#FFFFFF" />
    {/* Calendar Dots */}
    <circle cx="79" cy="30" r="1.5" fill="#BE123C" />
    <circle cx="87" cy="30" r="1.5" fill="#BE123C" />
    <circle cx="95" cy="30" r="1.5" fill="#BE123C" />
    <circle cx="79" cy="36" r="1.5" fill="#BE123C" />
    <circle cx="87" cy="36" r="1.5" fill="#BE123C" />

    {/* Pink Rupee Seal Bottom Right */}
    <circle cx="74" cy="68" r="16" fill="url(#sealGrad)" stroke="#FDA4AF" strokeWidth="2" filter="drop-shadow(0 4px 6px rgba(225,29,72,0.3))" />
    <text x="74" y="74" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#FFFFFF" fontFamily="system-ui, sans-serif">₹</text>

    <defs>
      <linearGradient id="invGrad" x1="24" y1="16" x2="80" y2="88" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FCE7F3" />
        <stop offset="1" stopColor="#F472B6" />
      </linearGradient>
      <linearGradient id="calGrad" x1="72" y1="16" x2="102" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFF1F2" />
        <stop offset="1" stopColor="#FECDD3" />
      </linearGradient>
      <linearGradient id="sealGrad" x1="58" y1="52" x2="90" y2="84" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FB7185" />
        <stop offset="1" stopColor="#E11D48" />
      </linearGradient>
    </defs>
  </svg>
);

// 4. Open Orders (3D Cardboard Box + Orange Badge Counter)
const OpenOrders3D = ({ count }: { count: number }) => (
  <svg viewBox="0 0 120 100" className="w-20 h-16 sm:w-24 sm:h-20 drop-shadow-md select-none" fill="none">
    {/* Speed Lines */}
    <line x1="16" y1="46" x2="26" y2="46" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="12" y1="54" x2="24" y2="54" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

    {/* Cardboard Box (Isometric-ish) */}
    {/* Left Face */}
    <path d="M30 42L58 54V86L30 72Z" fill="#D97706" stroke="#B45309" strokeWidth="2" />
    {/* Right Face */}
    <path d="M58 54L92 40V70L58 86Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
    {/* Top Face */}
    <path d="M30 42L62 28L92 40L58 54Z" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />

    {/* Tape on Top */}
    <path d="M46 35L74 47" stroke="#FEF3C7" strokeWidth="5" strokeLinecap="round" />
    {/* Front Box Label */}
    <rect x="36" y="60" width="14" height="10" rx="2" fill="#FFFFFF" fillOpacity="0.9" />
    <line x1="39" y1="63" x2="47" y2="63" stroke="#92400E" strokeWidth="1.5" />
    <line x1="39" y1="67" x2="44" y2="67" stroke="#92400E" strokeWidth="1.5" />

    {/* Orange Circular Counter Badge */}
    <circle cx="86" cy="62" r="16" fill="url(#orderBadgeGrad)" stroke="#FFFFFF" strokeWidth="2.5" filter="drop-shadow(0 4px 6px rgba(245,158,11,0.4))" />
    <text x="86" y="68" textAnchor="middle" fontSize="16" fontWeight="extrabold" fill="#FFFFFF" fontFamily="system-ui, sans-serif">{count || 3}</text>

    <defs>
      <linearGradient id="orderBadgeGrad" x1="70" y1="46" x2="102" y2="78" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBF24" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

// 5. Active Stores (3D Storefront Shop + Striped Awning + Pink Map Pin)
const ActiveStores3D = () => (
  <svg viewBox="0 0 120 100" className="w-20 h-16 sm:w-24 sm:h-20 drop-shadow-md select-none" fill="none">
    {/* Shop Building Base */}
    <rect x="28" y="44" width="64" height="42" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
    
    {/* Blue Door & Windows */}
    <rect x="36" y="56" width="18" height="20" rx="4" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1.5" />
    <line x1="45" y1="56" x2="45" y2="76" stroke="#3B82F6" strokeWidth="1.5" />
    <line x1="36" y1="66" x2="54" y2="66" stroke="#3B82F6" strokeWidth="1.5" />

    <rect x="62" y="54" width="22" height="32" rx="4" fill="#60A5FA" stroke="#2563EB" strokeWidth="1.5" />
    <circle cx="66" cy="70" r="2" fill="#FFFFFF" />

    {/* Ground Green Plant */}
    <ellipse cx="94" cy="78" rx="6" ry="10" fill="#10B981" />
    <ellipse cx="98" cy="80" rx="4" ry="7" fill="#34D399" />

    {/* Striped Canopy Awning */}
    <g filter="drop-shadow(0 3px 4px rgba(0,0,0,0.1))">
      <path d="M24 44L28 32H92L96 44Z" fill="#F43F5E" />
      {/* White Stripes */}
      <path d="M36 32L34 44H44L46 32Z" fill="#FFFFFF" />
      <path d="M56 32L54 44H64L66 32Z" fill="#FFFFFF" />
      <path d="M76 32L74 44H84L86 32Z" fill="#FFFFFF" />
      
      {/* Scalloped Edge */}
      <circle cx="29" cy="44" r="5" fill="#F43F5E" />
      <circle cx="39" cy="44" r="5" fill="#FFFFFF" />
      <circle cx="49" cy="44" r="5" fill="#F43F5E" />
      <circle cx="59" cy="44" r="5" fill="#FFFFFF" />
      <circle cx="69" cy="44" r="5" fill="#F43F5E" />
      <circle cx="79" cy="44" r="5" fill="#FFFFFF" />
      <circle cx="89" cy="44" r="5" fill="#F43F5E" />
    </g>

    {/* Magenta Map Pin Marker on Top */}
    <g filter="drop-shadow(0 4px 6px rgba(225,29,72,0.35))">
      <path d="M60 10C52 10 46 16 46 24C46 33 60 44 60 44C60 44 74 33 74 24C74 16 68 10 60 10Z" fill="url(#pinGrad)" />
      <circle cx="60" cy="22" r="5.5" fill="#FFFFFF" />
    </g>

    <defs>
      <linearGradient id="pinGrad" x1="46" y1="10" x2="74" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FB7185" />
        <stop offset="1" stopColor="#E11D48" />
      </linearGradient>
    </defs>
  </svg>
);

// 6. Pairs Booked (3D Blue-sleeved Handshake Partnership)
const PairsBooked3D = () => (
  <svg viewBox="0 0 120 100" className="w-20 h-16 sm:w-24 sm:h-20 drop-shadow-md select-none" fill="none">
    {/* Sparkle Dashes */}
    <line x1="60" y1="14" x2="60" y2="20" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="44" y1="20" x2="48" y2="24" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="76" y1="20" x2="72" y2="24" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" />

    {/* Left Blue Arm Sleeve */}
    <path d="M16 46L34 32C37 34 40 37 42 41L26 62L16 46Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2" filter="drop-shadow(0 3px 5px rgba(37,99,235,0.3))" />
    <rect x="23" y="38" width="8" height="24" rx="4" transform="rotate(-30 23 38)" fill="#3B82F6" />

    {/* Right Blue Arm Sleeve */}
    <path d="M104 46L86 32C83 34 80 37 78 41L94 62L104 46Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2" filter="drop-shadow(0 3px 5px rgba(37,99,235,0.3))" />
    <rect x="85" y="34" width="8" height="24" rx="4" transform="rotate(30 85 34)" fill="#3B82F6" />

    {/* Clasping 3D Hands */}
    {/* Left Hand Base & Thumb */}
    <path d="M38 46C42 40 50 42 56 46L68 56C72 59 70 65 64 68L50 66C44 64 38 56 38 46Z" fill="#FBCFE8" stroke="#F472B6" strokeWidth="1.5" />
    <path d="M42 42C46 36 54 38 60 43L68 50" fill="#FDA4AF" />

    {/* Right Fingers Clasping */}
    <path d="M60 48C64 45 70 47 72 51C74 55 72 60 67 63L54 72C48 76 42 72 44 66L60 48Z" fill="#FBBF24" />
    <rect x="52" y="52" width="16" height="6" rx="3" fill="#F59E0B" />
    <rect x="50" y="58" width="16" height="6" rx="3" fill="#F59E0B" />
    <rect x="48" y="64" width="15" height="6" rx="3" fill="#F59E0B" />
    <rect x="46" y="70" width="14" height="6" rx="3" fill="#D97706" />

    <defs>
      <linearGradient id="handGrad" x1="30" y1="30" x2="90" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDBA74" />
        <stop offset="1" stopColor="#FB923C" />
      </linearGradient>
    </defs>
  </svg>
);

/* =========================================================================
   6 KPI Master Cards Row Component
   ========================================================================= */

export const OverviewKpiCards: React.FC<OverviewKpiCardsProps> = ({
  salesValue,
  salesGrowth = 14,
  collectionsValue,
  collectionsGrowth = 8,
  receivablesValue,
  receivablesAccountsCount = 7,
  openOrdersCount,
  openOrdersValue,
  activeStoresCount,
  totalRegisteredBuyers = 7,
  pairsBookedValue,
  pairsBookedGrowth = 12,
  onNavigate,
  isSalesperson = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-3.5 sm:gap-4">
      {/* 1. SALES BOOKED */}
      <div
        onClick={() => onNavigate(isSalesperson ? '/sales/orders' : '/admin/orders')}
        className="group relative rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer bg-gradient-to-b from-blue-50/70 via-blue-50/30 to-white dark:from-blue-950/40 dark:via-slate-900/40 dark:to-slate-900/60 border border-blue-200/80 dark:border-blue-900/50 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 overflow-hidden min-w-0"
      >
        <div className="mb-2 flex items-center justify-center transition-transform group-hover:scale-105 duration-200 shrink-0">
          <SalesBooked3D />
        </div>

        <div className="w-full space-y-1 my-1 min-w-0">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 truncate" title="Sales Booked">
            Sales Booked
          </p>
          <p
            className="text-xl sm:text-2xl 2xl:text-[28px] font-extrabold tracking-tight text-[#0B2A63] dark:text-blue-200 font-mono leading-none truncate max-w-full"
            title={salesValue}
          >
            {salesValue}
          </p>
        </div>

        <div className="mt-3 w-full flex justify-center min-w-0">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 shadow-2xs max-w-full truncate">
            <span className="font-bold">↑ {salesGrowth}%</span>
            <span className="text-[11px] opacity-80 truncate">vs prev period</span>
          </span>
        </div>
      </div>

      {/* 2. COLLECTIONS */}
      <div
        onClick={() => onNavigate(isSalesperson ? '/sales/collections' : '/admin/payments')}
        className="group relative rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer bg-gradient-to-b from-emerald-50/70 via-emerald-50/30 to-white dark:from-emerald-950/40 dark:via-slate-900/40 dark:to-slate-900/60 border border-emerald-200/80 dark:border-emerald-900/50 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 overflow-hidden min-w-0"
      >
        <div className="mb-2 flex items-center justify-center transition-transform group-hover:scale-105 duration-200 shrink-0">
          <Collections3D />
        </div>

        <div className="w-full space-y-1 my-1 min-w-0">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 truncate" title="Collections">
            Collections
          </p>
          <p
            className="text-xl sm:text-2xl 2xl:text-[28px] font-extrabold tracking-tight text-[#064E3B] dark:text-emerald-200 font-mono leading-none truncate max-w-full"
            title={collectionsValue}
          >
            {collectionsValue}
          </p>
        </div>

        <div className="mt-3 w-full flex justify-center min-w-0">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 shadow-2xs max-w-full truncate">
            <span className="font-bold">↑ {collectionsGrowth}%</span>
            <span className="text-[11px] opacity-80 truncate">bank verified</span>
          </span>
        </div>
      </div>

      {/* 3. RECEIVABLES */}
      <div
        onClick={() => onNavigate(isSalesperson ? '/sales/collections?tab=overdue' : '/admin/customers/insights/receivables')}
        className="group relative rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer bg-gradient-to-b from-rose-50/70 via-rose-50/30 to-white dark:from-rose-950/40 dark:via-slate-900/40 dark:to-slate-900/60 border border-rose-200/80 dark:border-rose-900/50 hover:border-rose-400 dark:hover:border-rose-500 hover:shadow-lg hover:-translate-y-1 overflow-hidden min-w-0"
      >
        <div className="mb-2 flex items-center justify-center transition-transform group-hover:scale-105 duration-200 shrink-0">
          <Receivables3D />
        </div>

        <div className="w-full space-y-1 my-1 min-w-0">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-300 truncate" title="Receivables">
            Receivables
          </p>
          <p
            className="text-xl sm:text-2xl 2xl:text-[28px] font-extrabold tracking-tight text-[#9F1239] dark:text-rose-200 font-mono leading-none truncate max-w-full"
            title={receivablesValue}
          >
            {receivablesValue}
          </p>
        </div>

        <div className="mt-3 w-full flex justify-center min-w-0">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50/90 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 shadow-2xs truncate max-w-full">
            <Icons.FileText size={12} className="shrink-0 opacity-75" />
            <span className="truncate">Across {receivablesAccountsCount} accounts</span>
          </span>
        </div>
      </div>

      {/* 4. OPEN ORDERS */}
      <div
        onClick={() => onNavigate(isSalesperson ? '/sales/orders' : '/admin/orders')}
        className="group relative rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer bg-gradient-to-b from-amber-50/70 via-amber-50/30 to-white dark:from-amber-950/40 dark:via-slate-900/40 dark:to-slate-900/60 border border-amber-200/80 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg hover:-translate-y-1 overflow-hidden min-w-0"
      >
        <div className="mb-2 flex items-center justify-center transition-transform group-hover:scale-105 duration-200 shrink-0">
          <OpenOrders3D count={openOrdersCount} />
        </div>

        <div className="w-full space-y-1 my-1 min-w-0">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 truncate" title="Open Orders">
            Open Orders
          </p>
          <p
            className="text-xl sm:text-2xl 2xl:text-[28px] font-extrabold tracking-tight text-[#78350F] dark:text-amber-200 font-mono leading-none truncate max-w-full"
            title={`${openOrdersCount} Orders`}
          >
            {openOrdersCount} Orders
          </p>
        </div>

        <div className="mt-3 w-full flex justify-center min-w-0">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50/90 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 shadow-2xs truncate max-w-full">
            <Icons.TrendingUp size={12} className="shrink-0 opacity-75" />
            <span className="truncate">{openOrdersValue} pipeline</span>
          </span>
        </div>
      </div>

      {/* 5. ACTIVE STORES */}
      <div
        onClick={() => onNavigate(isSalesperson ? '/sales/customers' : '/admin/customers/insights/total')}
        className="group relative rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer bg-gradient-to-b from-purple-50/70 via-purple-50/30 to-white dark:from-purple-950/40 dark:via-slate-900/40 dark:to-slate-900/60 border border-purple-200/80 dark:border-purple-900/50 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-lg hover:-translate-y-1 overflow-hidden min-w-0"
      >
        <div className="mb-2 flex items-center justify-center transition-transform group-hover:scale-105 duration-200 shrink-0">
          <ActiveStores3D />
        </div>

        <div className="w-full space-y-1 my-1 min-w-0">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 truncate" title="Active Stores">
            Active Stores
          </p>
          <p
            className="text-xl sm:text-2xl 2xl:text-[28px] font-extrabold tracking-tight text-[#581C87] dark:text-purple-200 font-mono leading-none truncate max-w-full"
            title={`${activeStoresCount} Accounts`}
          >
            {activeStoresCount} Accounts
          </p>
        </div>

        <div className="mt-3 w-full flex justify-center min-w-0">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50/90 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/60 text-purple-800 dark:text-purple-300 shadow-2xs truncate max-w-full">
            <Icons.Clients size={12} className="shrink-0 opacity-75" />
            <span className="truncate">{totalRegisteredBuyers} buyers</span>
          </span>
        </div>
      </div>

      {/* 6. PAIRS BOOKED */}
      <div
        onClick={() => onNavigate(isSalesperson ? '/sales/orders' : '/admin/reports')}
        className="group relative rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer bg-gradient-to-b from-cyan-50/70 via-cyan-50/30 to-white dark:from-cyan-950/40 dark:via-slate-900/40 dark:to-slate-900/60 border border-cyan-200/80 dark:border-cyan-900/50 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-lg hover:-translate-y-1 overflow-hidden min-w-0"
      >
        <div className="mb-2 flex items-center justify-center transition-transform group-hover:scale-105 duration-200 shrink-0">
          <PairsBooked3D />
        </div>

        <div className="w-full space-y-1 my-1 min-w-0">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-cyan-900 dark:text-cyan-300 truncate" title="Pairs Booked">
            Pairs Booked
          </p>
          <p
            className="text-xl sm:text-2xl 2xl:text-[28px] font-extrabold tracking-tight text-[#0E7490] dark:text-cyan-200 font-mono leading-none truncate max-w-full"
            title={typeof pairsBookedValue === 'number' ? pairsBookedValue.toLocaleString('en-IN') : pairsBookedValue}
          >
            {typeof pairsBookedValue === 'number' ? pairsBookedValue.toLocaleString('en-IN') : pairsBookedValue}
          </p>
        </div>

        <div className="mt-3 w-full flex justify-center min-w-0">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/80 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 shadow-2xs max-w-full truncate">
            <span className="font-bold">↑ {pairsBookedGrowth}%</span>
            <span className="text-[11px] opacity-80 truncate">production vol</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default OverviewKpiCards;
