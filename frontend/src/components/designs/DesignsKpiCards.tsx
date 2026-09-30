import React from 'react';

interface DesignsKpiCardsProps {
  totalActiveModels: number;
  popularStylesCount: number;
  highMarginCount: number;
  selectedCount: number;
}

/* =========================================================================
   3D Claymorphic Vector SVGs for Footwear Catalogue & Lookbook
   ========================================================================= */

// 1. Total Active Articles (3D Stack of Green Specs Documents + Sneaker Silhouette + Badge)
export const ActiveArticles3D = ({ count = 6 }: { count?: number }) => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="artGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="artDocBack" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <linearGradient id="artDocFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#ECFDF5" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#artGlow)" />

      {/* Sparkles */}
      <path d="M22 36L17 31" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 26L22 20" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

      {/* Back Document Sheet */}
      <rect
        x="24"
        y="30"
        width="38"
        height="50"
        rx="7"
        fill="url(#artDocBack)"
        stroke="#059669"
        strokeWidth="2"
        transform="rotate(-12 43 55)"
        filter="drop-shadow(0 4px 6px rgba(16,185,129,0.25))"
      />

      {/* Front Document Sheet */}
      <g filter="drop-shadow(0 6px 10px rgba(5,150,105,0.3))">
        <rect x="34" y="24" width="42" height="52" rx="8" fill="url(#artDocFront)" stroke="#10B981" strokeWidth="2.5" />
        {/* Sneaker Blueprint Drawing on Sheet */}
        <path
          d="M44 48C44 44 47 41 52 41C56 41 59 44 63 45C67 46 71 45 73 48C74 50 74 54 74 56H44V48Z"
          fill="#34D399"
          stroke="#059669"
          strokeWidth="1.5"
        />
        <rect x="42" y="56" width="34" height="4" rx="2" fill="#047857" />
        <line x1="42" y1="64" x2="62" y2="64" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Green Circular Count Badge on Bottom-Right */}
      <g filter="drop-shadow(0 3px 5px rgba(4,120,87,0.4))">
        <circle cx="74" cy="72" r="11" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
        <text x="74" y="76" textAnchor="middle" fontSize="11" fontWeight="900" fill="#FFFFFF" fontFamily="system-ui, sans-serif">
          {count}
        </text>
      </g>
    </svg>
  </div>
);

// 2. Popular Fast-Movers (3D Blue Running Sneaker + Upward Growth Arrow + Speed Rays)
export const FastMovers3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="fastGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fastShoeBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
        <linearGradient id="arrowGreen" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#fastGlow)" />

      {/* Motion Speed Lines */}
      <line x1="16" y1="52" x2="26" y2="52" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="18" y1="60" x2="28" y2="60" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Upward Growth Arrow */}
      <g filter="drop-shadow(0 4px 6px rgba(16,185,129,0.35))">
        <path d="M52 48L72 26" stroke="url(#arrowGreen)" strokeWidth="6" strokeLinecap="round" />
        <path d="M62 24H74V36" stroke="#10B981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* 3D Blue Leaping Athletic Sneaker */}
      <g filter="drop-shadow(0 6px 10px rgba(30,58,138,0.4))" transform="rotate(-15 48 55)">
        {/* Upper Body */}
        <path
          d="M24 52C24 46 28 42 36 42C42 42 46 46 52 48C58 50 68 46 76 50C82 53 86 58 86 64H24V52Z"
          fill="url(#fastShoeBlue)"
        />
        {/* Collar */}
        <path d="M30 42C30 36 36 32 42 32C48 32 50 38 50 42H30Z" fill="#1E3A8A" />
        {/* White Outsole */}
        <rect x="22" y="64" width="66" height="10" rx="4" fill="#FFFFFF" />
        {/* Dynamic White Swoosh/Stripe */}
        <path d="M38 56C48 56 60 58 70 52" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M46 42L52 50" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

// 3. High Margin Lines (3D Tan Leather Dress Shoes + Gold Rupee Coin)
export const HighMargin3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="marGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFEDD5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFEDD5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="leatherGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <radialGradient id="coinGoldMar" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#marGlow)" />

      {/* Sparkles */}
      <path d="M78 24L83 20" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M82 32H87" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

      {/* Back Leather Shoe */}
      <g filter="drop-shadow(0 4px 6px rgba(120,53,15,0.25))">
        <path
          d="M26 42C26 36 34 34 44 34C52 34 58 38 66 40C74 42 80 46 80 50H26V42Z"
          fill="#B45309"
        />
        <rect x="24" y="50" width="58" height="6" rx="2" fill="#451A03" />
      </g>

      {/* Front Leather Shoe */}
      <g filter="drop-shadow(0 6px 10px rgba(120,53,15,0.35))">
        <path
          d="M20 54C20 46 30 44 42 44C52 44 58 50 68 52C78 54 84 58 84 64H20V54Z"
          fill="url(#leatherGrad)"
        />
        {/* Shoe Heel & Outsole */}
        <rect x="18" y="64" width="68" height="8" rx="3" fill="#451A03" />
        <rect x="18" y="70" width="16" height="5" rx="1.5" fill="#1C1917" />
        {/* Glossy Vamp Highlight */}
        <path d="M38 48C46 48 54 52 64 54" stroke="#FEF3C7" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.6" />
      </g>

      {/* Gold Rupee Coin in Front */}
      <g filter="drop-shadow(0 4px 7px rgba(217,119,6,0.45))">
        <circle cx="58" cy="68" r="14" fill="url(#coinGoldMar)" stroke="#B45309" strokeWidth="1.5" />
        <text x="58" y="73" textAnchor="middle" fontSize="14" fontWeight="900" fill="#78350F" fontFamily="system-ui, sans-serif">
          ₹
        </text>
      </g>
    </svg>
  </div>
);

// 4. Selected for Sharing (3D Tablet displaying Shoe + Purple Sharing Nodes)
export const SelectedShare3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="shareGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F3E8FF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#F3E8FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tabBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E9D5FF" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <linearGradient id="nodeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#shareGlow)" />

      {/* 3D Angled Tablet Screen */}
      <g filter="drop-shadow(0 6px 10px rgba(147,51,234,0.3))" transform="rotate(-8 38 52)">
        <rect x="18" y="24" width="44" height="58" rx="8" fill="url(#tabBody)" stroke="#9333EA" strokeWidth="2" />
        <rect x="22" y="28" width="36" height="50" rx="5" fill="#FFFFFF" />
        {/* Green Shoe on Screen */}
        <path d="M26 54C26 50 30 48 36 48C40 48 44 52 50 54H26V54Z" fill="#10B981" />
        <rect x="25" y="54" width="28" height="3" rx="1.5" fill="#047857" />
      </g>

      {/* 3D Purple Share Network Node Bubbles */}
      <g filter="drop-shadow(0 4px 6px rgba(126,34,206,0.35))">
        {/* Connecting Lines */}
        <line x1="62" y1="52" x2="76" y2="40" stroke="#A855F7" strokeWidth="3" strokeLinecap="round" />
        <line x1="62" y1="52" x2="76" y2="64" stroke="#A855F7" strokeWidth="3" strokeLinecap="round" />

        {/* Central Hub Node */}
        <circle cx="60" cy="52" r="7" fill="url(#nodeGrad)" stroke="#FFFFFF" strokeWidth="2" />

        {/* Top Node */}
        <circle cx="76" cy="40" r="6" fill="url(#nodeGrad)" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* Bottom Node */}
        <circle cx="76" cy="64" r="6" fill="url(#nodeGrad)" stroke="#FFFFFF" strokeWidth="1.5" />
      </g>
    </svg>
  </div>
);

/* =========================================================================
   Designs KPI Summary Cards Component
   ========================================================================= */

export const DesignsKpiCards: React.FC<DesignsKpiCardsProps> = ({
  totalActiveModels,
  popularStylesCount,
  highMarginCount,
  selectedCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {/* 1. Total Active Articles */}
      <div className="group relative rounded-2xl p-5 sm:p-6 flex items-center gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none">
        <ActiveArticles3D count={totalActiveModels} />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
            Total Active Articles
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 font-sans">
            {totalActiveModels} Models
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate">
            Ready for factory booking
          </p>
        </div>
      </div>

      {/* 2. Popular Fast-Movers */}
      <div className="group relative rounded-2xl p-5 sm:p-6 flex items-center gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none">
        <FastMovers3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
            Popular Fast-Movers
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400 mt-0.5 font-sans">
            {popularStylesCount} Styles
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate">
            High wholesale repeat rates
          </p>
        </div>
      </div>

      {/* 3. High Margin Lines */}
      <div className="group relative rounded-2xl p-5 sm:p-6 flex items-center gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none">
        <HighMargin3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
            High Margin Lines
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400 mt-0.5 font-sans">
            {highMarginCount} SKUs
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate">
            35%–45% retailer markups
          </p>
        </div>
      </div>

      {/* 4. Selected for Sharing */}
      <div className="group relative rounded-2xl p-5 sm:p-6 flex items-center gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none">
        <SelectedShare3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
            Selected for Sharing
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-purple-600 dark:text-purple-400 mt-0.5 font-sans">
            {selectedCount} Articles
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate">
            Included in WhatsApp lookbook
          </p>
        </div>
      </div>
    </div>
  );
};

export default DesignsKpiCards;
