import React from 'react';

/* =========================================================================
   3D Claymorphic Vector SVGs for Module KPI Cards
   (Clients, Sales Force, Wholesale Orders, Footwear Catalogue)
   ========================================================================= */

/* -------------------------------------------------------------------------
   1. CLIENTS MODULE 3D ICONS
   ------------------------------------------------------------------------- */

// 1.1 Total Customers (3D Blue Figurine Users Group)
export const CustomerUsers3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="custGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="uHead1" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="60%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E40AF" />
        </radialGradient>
        <radialGradient id="uHead2" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#3B82F6" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#custGlow)" />
      {/* Left Avatar */}
      <circle cx="34" cy="40" r="11" fill="url(#uHead2)" />
      <path d="M22 68C22 56 28 52 34 52C40 52 46 56 46 68" fill="url(#uHead2)" />
      {/* Right Avatar */}
      <circle cx="66" cy="40" r="11" fill="url(#uHead2)" />
      <path d="M54 68C54 56 60 52 66 52C72 52 78 56 78 68" fill="url(#uHead2)" />
      {/* Center Front Avatar */}
      <circle cx="50" cy="36" r="15" fill="url(#uHead1)" filter="drop-shadow(0 3px 5px rgba(30,64,175,0.3))" />
      <path d="M30 72C30 57 40 50 50 50C60 50 70 57 70 72" fill="url(#uHead1)" />
      {/* Gloss highlight */}
      <ellipse cx="46" cy="31" rx="4" ry="2" fill="#FFFFFF" fillOpacity="0.45" />
    </svg>
  </div>
);

// 1.2 Total Receivables (3D Pink/Red Wallet with Gold Card)
export const ReceivablesWallet3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="walGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FCE7F3" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FCE7F3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="walGrad" x1="15" y1="25" x2="85" y2="75" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>
        <linearGradient id="cardGrad" x1="40" y1="20" x2="80" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#walGlow)" />
      {/* Credit Card sticking out */}
      <rect x="42" y="22" width="38" height="26" rx="4" fill="url(#cardGrad)" transform="rotate(12 61 35)" stroke="#D97706" strokeWidth="1" />
      <line x1="46" y1="29" x2="72" y2="35" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
      {/* Back flap */}
      <rect x="18" y="32" width="64" height="46" rx="10" fill="#9F1239" />
      {/* Front body */}
      <rect x="20" y="36" width="60" height="42" rx="9" fill="url(#walGrad)" filter="drop-shadow(0 4px 6px rgba(190,18,60,0.3))" />
      {/* Clasp flap */}
      <path d="M56 46H78C81.3 46 84 48.7 84 52V62C84 65.3 81.3 68 78 68H56V46Z" fill="#E11D48" stroke="#FFFFFF" strokeWidth="1.2" />
      <circle cx="74" cy="57" r="4" fill="#FDE047" stroke="#CA8A04" strokeWidth="1" />
    </svg>
  </div>
);

// 1.3 Overdue Accounts (3D Amber Warning Triangle with Exclamation)
export const OverdueWarning3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="warnGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="warnGrad" x1="50" y1="18" x2="50" y2="82" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#warnGlow)" />
      {/* 3D Triangle */}
      <path
        d="M45.5 22.8C47.4 19.3 52.6 19.3 54.5 22.8L83.2 73.2C85.1 76.6 82.5 81 78.7 81H21.3C17.5 81 14.9 76.6 16.8 73.2L45.5 22.8Z"
        fill="url(#warnGrad)"
        filter="drop-shadow(0 4px 6px rgba(217,119,6,0.35))"
      />
      {/* Inner highlight */}
      <path
        d="M48 27C48.8 25.5 51.2 25.5 52 27L76 69C76.8 70.5 75.8 72 74 72H26C24.2 72 23.2 70.5 24 69L48 27Z"
        fill="#F59E0B"
      />
      {/* Exclamation mark */}
      <rect x="47" y="38" width="6" height="18" rx="3" fill="#FFFFFF" />
      <circle cx="50" cy="63" r="3.5" fill="#FFFFFF" />
    </svg>
  </div>
);

// 1.4 Cleared Accounts (3D Emerald Circular Shield with Checkmark)
export const ClearedShield3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="shieldGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DCFCE7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#DCFCE7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="shieldGrad" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="70%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#shieldGlow)" />
      {/* 3D Round Badge */}
      <circle cx="50" cy="50" r="30" fill="url(#shieldGrad)" filter="drop-shadow(0 4px 8px rgba(16,185,129,0.35))" />
      {/* Gloss arc */}
      <ellipse cx="44" cy="32" rx="14" ry="6" fill="#FFFFFF" fillOpacity="0.3" transform="rotate(-15 44 32)" />
      {/* White Bold Checkmark */}
      <path
        d="M36 50L45 59L65 39"
        stroke="#FFFFFF"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))"
      />
    </svg>
  </div>
);


/* -------------------------------------------------------------------------
   2. SALES FORCE & FIELD DISPATCH 3D ICONS
   ------------------------------------------------------------------------- */

// 2.1 Field Force (same 3D Blue Team)
export const FieldForce3D = CustomerUsers3D;

// 2.2 Booked MTD (3D Green Trending Up Arrow with Bar)
export const TrendingArrow3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="arrowGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="arrowGrad" x1="25" y1="75" x2="75" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#arrowGlow)" />
      {/* Trending Path */}
      <path
        d="M24 72L44 48L58 60L78 28"
        stroke="url(#arrowGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="drop-shadow(0 4px 6px rgba(16,185,129,0.3))"
      />
      {/* Arrow Head */}
      <path
        d="M62 28H78V44"
        stroke="url(#arrowGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sparkles */}
      <circle cx="78" cy="28" r="3" fill="#34D399" />
    </svg>
  </div>
);

// 2.3 Field Incentives (3D Purple Wallet with Coins)
export const IncentivesWallet3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="purpGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F3E8FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F3E8FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="purpGrad" x1="20" y1="30" x2="80" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#purpGlow)" />
      {/* Wallet Body */}
      <rect x="20" y="34" width="60" height="42" rx="10" fill="url(#purpGrad)" filter="drop-shadow(0 4px 8px rgba(126,34,206,0.35))" />
      {/* Clasp */}
      <path d="M58 44H80C82.2 44 84 45.8 84 48V58C84 60.2 82.2 62 80 62H58V44Z" fill="#9333EA" stroke="#FFFFFF" strokeWidth="1.2" />
      <circle cx="76" cy="53" r="3.5" fill="#FDE047" stroke="#EAB308" strokeWidth="1" />
    </svg>
  </div>
);

// 2.4 Visits Today (3D Blue Location Pin with Ripple)
export const VisitsPin3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pinHead" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="70%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#pinGlow)" />
      {/* Ground shadow/ripple */}
      <ellipse cx="50" cy="78" rx="16" ry="5" fill="#BFDBFE" />
      {/* 3D Pin Body */}
      <path
        d="M50 20C37.8 20 28 29.8 28 42C28 56 46 75 50 78C54 75 72 56 72 42C72 29.8 62.2 20 50 20Z"
        fill="url(#pinHead)"
        filter="drop-shadow(0 4px 6px rgba(37,99,235,0.35))"
      />
      {/* Inner white circle */}
      <circle cx="50" cy="40" r="8" fill="#FFFFFF" />
    </svg>
  </div>
);


/* -------------------------------------------------------------------------
   3. WHOLESALE ORDERS 3D ICONS
   ------------------------------------------------------------------------- */

// 3.1 Total Orders (3D Blue Clipboard / Booking Sheet)
export const TotalOrders3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="ordGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="clipBack" x1="25" y1="20" x2="75" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#ordGlow)" />
      {/* Clipboard base */}
      <rect x="25" y="20" width="50" height="64" rx="8" fill="url(#clipBack)" filter="drop-shadow(0 4px 6px rgba(59,130,246,0.3))" />
      <rect x="30" y="26" width="40" height="52" rx="4" fill="#FFFFFF" />
      {/* Top Clip */}
      <rect x="39" y="16" width="22" height="9" rx="3" fill="#1D4ED8" />
      {/* Lines */}
      <line x1="36" y1="38" x2="64" y2="38" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="36" y1="46" x2="56" y2="46" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="54" x2="62" y2="54" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="62" x2="50" y2="62" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

// 3.2 In Production (3D Purple Factory Plant with Smoke)
export const FactoryPlant3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="facGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F3E8FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F3E8FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="facGrad" x1="20" y1="30" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C084FC" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#facGlow)" />
      {/* Smoke puffs */}
      <circle cx="34" cy="22" r="4" fill="#E9D5FF" />
      <circle cx="36" cy="15" r="5" fill="#F3E8FF" />
      {/* Factory building */}
      <path
        d="M24 74V40L42 54V40L60 54V30H76V74H24Z"
        fill="url(#facGrad)"
        filter="drop-shadow(0 4px 6px rgba(126,34,206,0.3))"
      />
      {/* Windows */}
      <rect x="30" y="60" width="6" height="8" rx="1" fill="#FEF08A" />
      <rect x="42" y="60" width="6" height="8" rx="1" fill="#FEF08A" />
      <rect x="54" y="60" width="6" height="8" rx="1" fill="#FEF08A" />
      <rect x="66" y="44" width="5" height="6" rx="1" fill="#FFFFFF" />
      <rect x="66" y="56" width="5" height="6" rx="1" fill="#FFFFFF" />
    </svg>
  </div>
);

// 3.3 Ready to Dispatch (3D Orange Delivery Truck)
export const DispatchTruck3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="trkGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFEDD5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFEDD5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="trkGrad" x1="20" y1="35" x2="80" y2="75" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#trkGlow)" />
      {/* Cargo Box */}
      <rect x="20" y="34" width="40" height="32" rx="4" fill="url(#trkGrad)" filter="drop-shadow(0 4px 6px rgba(234,88,12,0.3))" />
      {/* Cab */}
      <path d="M60 44H72L80 54V66H60V44Z" fill="#F97316" />
      {/* Window */}
      <path d="M63 47H70L76 54H63V47Z" fill="#EFF6FF" />
      {/* Wheels */}
      <circle cx="34" cy="68" r="7" fill="#334155" />
      <circle cx="34" cy="68" r="3" fill="#E2E8F0" />
      <circle cx="70" cy="68" r="7" fill="#334155" />
      <circle cx="70" cy="68" r="3" fill="#E2E8F0" />
    </svg>
  </div>
);

// 3.4 Consignment Value (3D Green Rupee Coin)
export const RupeePipeline3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="rupGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rupGrad" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="70%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#rupGlow)" />
      {/* Coin Plate */}
      <circle cx="50" cy="50" r="30" fill="url(#rupGrad)" filter="drop-shadow(0 4px 8px rgba(16,185,129,0.35))" />
      <circle cx="50" cy="50" r="25" stroke="#A7F3D0" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
      {/* Rupee Symbol */}
      <text x="50" y="60" textAnchor="middle" fontSize="30" fontWeight="bold" fill="#FFFFFF" fontFamily="var(--font-sans)">₹</text>
    </svg>
  </div>
);


/* -------------------------------------------------------------------------
   4. FOOTWEAR CATALOGUE 3D ICONS
   ------------------------------------------------------------------------- */

// 4.1 Active Footwear (3D Blue Stacked Layers)
export const CatalogLayers3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="layGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lTop" x1="20" y1="30" x2="80" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="lMid" x1="20" y1="46" x2="80" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="lBot" x1="20" y1="62" x2="80" y2="78" gradientUnits="userSpaceOnUse">
          <stop stopColor="#BFDBFE" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#layGlow)" />
      {/* Bottom Layer */}
      <path d="M50 56L78 42L50 28L22 42L50 56Z" fill="url(#lTop)" filter="drop-shadow(0 3px 5px rgba(37,99,235,0.3))" />
      {/* Middle Layer */}
      <path d="M50 68L78 54L78 60L50 74L22 60L22 54L50 68Z" fill="url(#lMid)" />
      {/* Base Layer */}
      <path d="M50 78L78 64L78 70L50 84L22 70L22 64L50 78Z" fill="url(#lBot)" />
    </svg>
  </div>
);

// 4.2 Fast-Moving (3D Green Growth Bars)
export const FastMovingBars3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="barGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#barGlow)" />
      {/* 3 Bars */}
      <rect x="26" y="52" width="12" height="26" rx="4" fill="#6EE7B7" />
      <rect x="44" y="38" width="12" height="40" rx="4" fill="#34D399" />
      <rect x="62" y="24" width="12" height="54" rx="4" fill="#10B981" filter="drop-shadow(0 4px 6px rgba(16,185,129,0.3))" />
      {/* Arrow over bars */}
      <path d="M26 44L44 32L62 20" stroke="#047857" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 3" />
    </svg>
  </div>
);

// 4.3 High Margin (3D Purple Upward Chart with Crown)
export const HighMarginCrown3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="crownGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F3E8FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F3E8FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="crnGrad" x1="25" y1="30" x2="75" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C084FC" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#crownGlow)" />
      {/* Upward Curve */}
      <path
        d="M26 70C36 70 42 56 52 46C60 38 68 32 76 26"
        stroke="url(#crnGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        filter="drop-shadow(0 4px 6px rgba(126,34,206,0.3))"
      />
      {/* Arrow head */}
      <path d="M64 24H76V36" stroke="url(#crnGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Crown */}
      <path d="M30 38L36 48L44 38L52 48L58 38V52H30V38Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
    </svg>
  </div>
);

// 4.4 Lookbook (3D Blue Open Book / Catalog)
export const LookbookOpen3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="bookGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bookGrad" x1="20" y1="30" x2="80" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#bookGlow)" />
      {/* Open Book Wings */}
      <path
        d="M50 38C42 32 30 32 20 34V68C30 66 42 66 50 72C58 66 70 66 80 68V34C70 32 58 32 50 38Z"
        fill="url(#bookGrad)"
        filter="drop-shadow(0 4px 6px rgba(37,99,235,0.35))"
      />
      {/* Spine */}
      <line x1="50" y1="38" x2="50" y2="72" stroke="#1D4ED8" strokeWidth="2.5" />
      {/* Pages lines */}
      <line x1="28" y1="44" x2="44" y2="44" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="52" x2="42" y2="52" stroke="#DBEAFE" strokeWidth="2" strokeLinecap="round" />
      <line x1="56" y1="44" x2="72" y2="44" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <line x1="58" y1="52" x2="72" y2="52" stroke="#DBEAFE" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

/* -------------------------------------------------------------------------
   5. PAYMENTS & RECEIVABLES MODULE 3D ICONS
   ------------------------------------------------------------------------- */

// 5.1 Due This Week (3D Orange Calendar with Rings)
export const DueCalendar3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="calGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="calBody" x1="20" y1="25" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#calGlow)" />
      {/* Calendar Back */}
      <rect x="22" y="26" width="56" height="52" rx="14" fill="#B45309" opacity="0.3" transform="translate(0, 4)" />
      {/* Calendar Main Sheet */}
      <rect x="22" y="24" width="56" height="52" rx="14" fill="url(#calBody)" filter="drop-shadow(0 4px 6px rgba(217,119,6,0.3))" />
      {/* Inner White Page */}
      <rect x="27" y="38" width="46" height="33" rx="8" fill="#FFFFFF" fillOpacity="0.92" />
      {/* Top Header Bar Accent */}
      <path d="M22 34C22 28.5 26.5 24 32 24H68C73.5 24 78 28.5 78 34V36H22V34Z" fill="#F59E0B" />
      {/* Calendar Rings */}
      <rect x="34" y="19" width="4" height="10" rx="2" fill="#78350F" />
      <rect x="62" y="19" width="4" height="10" rx="2" fill="#78350F" />
      {/* Date Rows */}
      <circle cx="38" cy="48" r="3" fill="#D97706" />
      <circle cx="50" cy="48" r="3" fill="#D97706" />
      <circle cx="62" cy="48" r="3" fill="#D97706" />
      <circle cx="38" cy="58" r="3" fill="#D97706" />
      <circle cx="50" cy="58" r="4" fill="#DC2626" />
      <circle cx="62" cy="58" r="3" fill="#D97706" />
    </svg>
  </div>
);

// 5.2 Collected This Month (3D Emerald Stacked Cash Coins)
export const CollectedCash3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="cashGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="coinGrad" x1="30" y1="20" x2="70" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#cashGlow)" />
      {/* Left Stack */}
      <ellipse cx="36" cy="68" rx="14" ry="6" fill="#047857" />
      <path d="M22 68V54C22 57.3 28.3 60 36 60C43.7 60 50 57.3 50 54V68C50 71.3 43.7 74 36 74C28.3 74 22 71.3 22 68Z" fill="url(#coinGrad)" />
      <ellipse cx="36" cy="54" rx="14" ry="6" fill="#6EE7B7" />
      <path d="M22 54V42C22 45.3 28.3 48 36 48C43.7 48 50 45.3 50 42V54C50 57.3 43.7 60 36 60C28.3 60 22 57.3 22 54Z" fill="url(#coinGrad)" />
      <ellipse cx="36" cy="42" rx="14" ry="6" fill="#A7F3D0" />
      {/* Right Higher Stack */}
      <ellipse cx="62" cy="74" rx="15" ry="6" fill="#065F46" />
      <path d="M47 74V56C47 59.5 53.7 62 62 62C70.3 62 77 59.5 77 56V74C77 77.5 70.3 80 62 80C53.7 80 47 77.5 47 74Z" fill="url(#coinGrad)" />
      <ellipse cx="62" cy="56" rx="15" ry="6" fill="#34D399" />
      <path d="M47 56V38C47 41.5 53.7 44 62 44C70.3 44 77 41.5 77 38V56C77 59.5 70.3 62 62 62C53.7 62 47 59.5 47 56Z" fill="url(#coinGrad)" />
      <ellipse cx="62" cy="38" rx="15" ry="6" fill="#A7F3D0" />
      <ellipse cx="62" cy="38" rx="10" ry="3.8" fill="#ECFDF5" />
      <text x="59" y="42" fill="#047857" fontSize="11" fontWeight="bold" fontFamily="sans-serif">₹</text>
    </svg>
  </div>
);

// 5.3 Settled Document 3D Illustration (For empty state)
export const SettledDocument3D: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 120 120" className="w-full h-full select-none drop-shadow-xl" fill="none">
      <defs>
        <radialGradient id="docBgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="docGrad" x1="30" y1="20" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <radialGradient id="chkBadge" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="54" fill="url(#docBgGlow)" />
      {/* Decorative stars */}
      <circle cx="28" cy="32" r="2.5" fill="#3B82F6" />
      <circle cx="94" cy="36" r="3" fill="#60A5FA" />
      <circle cx="22" cy="80" r="2" fill="#93C5FD" />
      <circle cx="98" cy="82" r="2.5" fill="#3B82F6" />
      {/* Document page with curled edge */}
      <rect x="36" y="24" width="48" height="66" rx="10" fill="url(#docGrad)" stroke="#CBD5E1" strokeWidth="1.5" filter="drop-shadow(0 6px 12px rgba(100,116,139,0.25))" />
      {/* Content lines */}
      <rect x="44" y="36" width="32" height="4" rx="2" fill="#94A3B8" />
      <rect x="44" y="46" width="24" height="3" rx="1.5" fill="#CBD5E1" />
      <rect x="44" y="54" width="28" height="3" rx="1.5" fill="#CBD5E1" />
      <rect x="44" y="62" width="16" height="3" rx="1.5" fill="#CBD5E1" />
      {/* Curled bottom tail */}
      <path d="M36 82C44 82 48 88 56 88C64 88 72 82 84 82" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      {/* Floating 3D Check Circle Badge */}
      <circle cx="78" cy="74" r="16" fill="url(#chkBadge)" filter="drop-shadow(0 4px 8px rgba(37,99,235,0.45))" />
      <path d="M72 74L76 78L85 69" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Gloss */}
      <ellipse cx="75" cy="67" rx="5" ry="2.5" fill="#FFFFFF" fillOpacity="0.45" />
    </svg>
  </div>
);

/* -------------------------------------------------------------------------
   6. REPORTS & TRADE ALERTS MODULE 3D ICONS
   ------------------------------------------------------------------------- */

// 6.1 Booked Turnover (3D Blue Ascending Bars with Glow)
export const TurnoverChart3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="turnGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="barGrad3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#turnGlow)" />
      {/* 3D Ascending Bars */}
      {/* Bar 1 (Lowest) */}
      <rect x="25" y="52" width="13" height="24" rx="5" fill="url(#barGrad1)" filter="drop-shadow(0 3px 5px rgba(37,99,235,0.3))" />
      <ellipse cx="31.5" cy="54" rx="4" ry="1.5" fill="#FFFFFF" fillOpacity="0.6" />
      {/* Bar 2 (Medium) */}
      <rect x="43.5" y="40" width="13" height="36" rx="5" fill="url(#barGrad2)" filter="drop-shadow(0 3px 5px rgba(29,78,216,0.35))" />
      <ellipse cx="50" cy="42" rx="4" ry="1.5" fill="#FFFFFF" fillOpacity="0.6" />
      {/* Bar 3 (Highest) */}
      <rect x="62" y="26" width="13" height="50" rx="5" fill="url(#barGrad3)" filter="drop-shadow(0 4px 6px rgba(30,64,175,0.4))" />
      <ellipse cx="68.5" cy="28" rx="4" ry="1.5" fill="#FFFFFF" fillOpacity="0.6" />
    </svg>
  </div>
);

// 6.2 Gross Margin % Tile (3D Emerald Percent Badge)
export const GrossMarginPercent3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="pctGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pctTile" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#pctGlow)" />
      {/* 3D Chamfered Tile */}
      <rect x="22" y="24" width="56" height="52" rx="14" fill="#047857" opacity="0.3" transform="translate(0, 3)" />
      <rect x="22" y="24" width="56" height="52" rx="14" fill="url(#pctTile)" filter="drop-shadow(0 4px 6px rgba(5,150,105,0.35))" />
      {/* Slash */}
      <line x1="64" y1="36" x2="36" y2="64" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" />
      {/* Top circle */}
      <circle cx="40" cy="42" r="5" stroke="#FFFFFF" strokeWidth="4" fill="none" />
      {/* Bottom circle */}
      <circle cx="60" cy="58" r="5" stroke="#FFFFFF" strokeWidth="4" fill="none" />
    </svg>
  </div>
);

// 6.3 Retail Outlets Storefront (3D Purple Shop)
export const Storefront3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="storeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F3E8FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F3E8FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="storeRoof" x1="20" y1="30" x2="80" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>
        <linearGradient id="storeWall" x1="26" y1="48" x2="74" y2="76" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F3E8FF" />
          <stop offset="100%" stopColor="#E9D5FF" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#storeGlow)" />
      {/* Building Body */}
      <rect x="26" y="44" width="48" height="32" rx="6" fill="url(#storeWall)" stroke="#C084FC" strokeWidth="1.5" />
      {/* Door */}
      <rect x="43" y="54" width="14" height="22" rx="3" fill="#7E22CE" />
      {/* Windows */}
      <rect x="30" y="52" width="9" height="10" rx="2" fill="#DDD6FE" />
      <rect x="61" y="52" width="9" height="10" rx="2" fill="#DDD6FE" />
      {/* Scalloped Awning Roof */}
      <path
        d="M22 42C22 36 28 32 50 32C72 32 78 36 78 42L74 48H26L22 42Z"
        fill="url(#storeRoof)"
        filter="drop-shadow(0 3px 5px rgba(126,34,206,0.35))"
      />
      {/* Awning Stripes */}
      <path d="M32 34L35 48M44 33L45 48M56 33L55 48M68 34L65 48" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.75" />
    </svg>
  </div>
);

// 6.4 Pending Requests Clock (3D Orange Document with Clock)
export const PendingClock3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="docClkGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="orgDocGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <radialGradient id="clkPinGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#docClkGlow)" />
      {/* 3D Orange Document */}
      <rect x="25" y="24" width="46" height="56" rx="10" fill="url(#orgDocGrad)" filter="drop-shadow(0 4px 6px rgba(217,119,6,0.35))" />
      {/* Folded corner / notch */}
      <path d="M55 24H71V40H55V24Z" fill="#F59E0B" opacity="0.4" />
      {/* Document text lines */}
      <rect x="33" y="36" width="22" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.9" />
      <rect x="33" y="44" width="28" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.9" />
      <rect x="33" y="52" width="18" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.7" />
      {/* Superimposed 3D Clock Dial on bottom-right */}
      <circle cx="67" cy="65" r="15" fill="url(#clkPinGrad)" filter="drop-shadow(0 3px 6px rgba(180,83,9,0.4))" />
      <circle cx="67" cy="65" r="11" fill="#FFFFFF" />
      {/* Clock hands */}
      <circle cx="67" cy="65" r="1.8" fill="#D97706" />
      <line x1="67" y1="65" x2="67" y2="58" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
      <line x1="67" y1="65" x2="73" y2="65" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

/* -------------------------------------------------------------------------
   7. MANUFACTURING PLANTS & FOUNDRIES MODULE 3D ICONS
   ------------------------------------------------------------------------- */

// 7.1 Factory Foundry (3D Isometric Purple Block Plant with 3 Smokestacks & 3 Windows)
export const FactoryFoundry3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none" fill="none">
      <defs>
        {/* Soft Lavender Background Plate Gradient */}
        <linearGradient id="fndPlateGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FAF5FF" />
          <stop offset="100%" stopColor="#EDE4FC" />
        </linearGradient>

        {/* Ambient Floor Shadow Filter */}
        <filter id="fndShadow" x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="1.5" dy="4" stdDeviation="3" floodColor="#6B21A8" floodOpacity="0.3" />
        </filter>

        {/* Top Roof Face Gradient */}
        <linearGradient id="fndTopRoof" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D8B4FE" />
          <stop offset="60%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>

        {/* Front Wall Gradient */}
        <linearGradient id="fndFrontWall" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="45%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>

        {/* Right Wall Gradient */}
        <linearGradient id="fndRightWall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7E22CE" />
          <stop offset="50%" stopColor="#6B21A8" />
          <stop offset="100%" stopColor="#581C87" />
        </linearGradient>

        {/* Chimney Left Gradient */}
        <linearGradient id="fndChimney1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E9D5FF" />
          <stop offset="40%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#6B21A8" />
        </linearGradient>

        {/* Chimney Center Gradient */}
        <linearGradient id="fndChimney2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F3E8FF" />
          <stop offset="35%" stopColor="#C084FC" />
          <stop offset="80%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#6B21A8" />
        </linearGradient>

        {/* Chimney Right Gradient */}
        <linearGradient id="fndChimney3" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D8B4FE" />
          <stop offset="40%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#6B21A8" />
        </linearGradient>
      </defs>

      {/* 1. Rounded Square Lavender Background Plate */}
      <rect x="8" y="8" width="84" height="84" rx="22" fill="url(#fndPlateGrad)" />

      {/* 2. Soft Ambient Shadow on Plate Floor */}
      <ellipse cx="53" cy="78" rx="25" ry="6.5" fill="#6B21A8" fillOpacity="0.22" filter="blur(3px)" />

      {/* 3. Three 3D Cylindrical Smokestacks */}
      {/* Left Chimney (Medium) */}
      <g>
        <rect x="33.5" y="38" width="7" height="15" rx="3.5" fill="url(#fndChimney1)" />
        <ellipse cx="37" cy="38" rx="3.5" ry="1.8" fill="#F3E8FF" />
      </g>

      {/* Center Chimney (Tallest) */}
      <g>
        <rect x="47.5" y="31" width="7.5" height="23" rx="3.75" fill="url(#fndChimney2)" />
        <ellipse cx="51.25" cy="31" rx="3.75" ry="2" fill="#FFFFFF" />
      </g>

      {/* Right Chimney (Medium-Tall) */}
      <g>
        <rect x="62" y="37" width="7" height="18" rx="3.5" fill="url(#fndChimney3)" />
        <ellipse cx="65.5" cy="37" rx="3.5" ry="1.8" fill="#E9D5FF" />
      </g>

      {/* 4. Main 3D Factory Block */}
      <g filter="url(#fndShadow)">
        {/* Top Face */}
        <path
          d="M24 52 L36 47 L78 52 L66 57 Z"
          fill="url(#fndTopRoof)"
          stroke="#C084FC"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Right Wall (Darker shade) */}
        <path
          d="M66 57 L78 52 L78 69 L66 74 Z"
          fill="url(#fndRightWall)"
          stroke="#581C87"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Front Wall (Main Face with 3 Windows) */}
        <path
          d="M24 52 L66 57 L66 74 L24 69 Z"
          fill="url(#fndFrontWall)"
          stroke="#7E22CE"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* 3 Rounded White Vertical Windows */}
        <rect x="32" y="57.5" width="4.5" height="8" rx="2.25" fill="#FFFFFF" />
        <rect x="43" y="59" width="4.5" height="8" rx="2.25" fill="#FFFFFF" />
        <rect x="54" y="60.5" width="4.5" height="8" rx="2.25" fill="#FFFFFF" />
      </g>
    </svg>
  </div>
);

// 7.2 Capacity Boxes (3D Orange Shipping Cartons)
export const CapacityBoxes3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="boxGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFEDD5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFEDD5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="boxGrad1" x1="20" y1="40" x2="60" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="boxGrad2" x1="40" y1="20" x2="80" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDBA74" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#boxGlow)" />
      {/* Bottom Box */}
      <path d="M22 52L50 38L78 52L50 66L22 52Z" fill="#FDBA74" />
      <path d="M22 52L50 66V78L22 64V52Z" fill="url(#boxGrad1)" />
      <path d="M78 52L50 66V78L78 64V52Z" fill="#C2410C" />
      {/* Top Stacked Box */}
      <path d="M34 38L50 30L66 38L50 46L34 38Z" fill="#FED7AA" />
      <path d="M34 38L50 46V56L34 48V38Z" fill="url(#boxGrad2)" />
      <path d="M66 38L50 46V56L66 48V38Z" fill="#EA580C" />
      {/* Tape mark */}
      <line x1="48" y1="31" x2="52" y2="45" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.75" />
    </svg>
  </div>
);

// 7.3 On-Time Clock (3D Cyan / Blue Clock)
export const OnTimeClock3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="otGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="otBody" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#otGlow)" />
      {/* Clock Dial Rim */}
      <circle cx="50" cy="50" r="28" fill="url(#otBody)" filter="drop-shadow(0 4px 6px rgba(2,132,199,0.35))" />
      {/* Inner White Plate */}
      <circle cx="50" cy="50" r="21" fill="#FFFFFF" fillOpacity="0.95" />
      {/* Center point and hands */}
      <circle cx="50" cy="50" r="3" fill="#0284C7" />
      <line x1="50" y1="50" x2="50" y2="37" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="50" x2="61" y2="44" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </div>
);

// 7.4 QC Pass Shield (3D Emerald Shield with Checkmark)
export const QcShield3D: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-md" fill="none">
      <defs>
        <radialGradient id="qcGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="qcGrad" x1="25" y1="20" x2="75" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#qcGlow)" />
      {/* Shield Body */}
      <path
        d="M50 24L26 34V52C26 66 36 76 50 80C64 76 74 66 74 52V34L50 24Z"
        fill="url(#qcGrad)"
        filter="drop-shadow(0 4px 6px rgba(5,150,105,0.35))"
      />
      {/* Inner Edge highlight */}
      <path
        d="M50 28L30 36.5V51C30 63 38.5 72 50 75.5C61.5 72 70 63 70 51V36.5L50 28Z"
        fill="#059669"
        fillOpacity="0.3"
      />
      {/* White Checkmark */}
      <path d="M42 51L47 56L59 44" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);


