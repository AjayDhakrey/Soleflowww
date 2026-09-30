import React from 'react';

/* =========================================================================
   3D Claymorphic Vector SVGs for Sidebar Navigation
   ========================================================================= */

// 1. Dashboard (3D Colorful 4-Tile Grid inside glossy rounded plate)
export const NavDashboard3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-xs" fill="none">
      <defs>
        <radialGradient id="dashGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0" />
        </radialGradient>
        {/* Tiles Gradients */}
        <linearGradient id="tilePink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
        <linearGradient id="tileYellow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>
        <linearGradient id="tileBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="tileGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Glow Backdrop */}
      <circle cx="50" cy="50" r="42" fill="url(#dashGlow)" />

      {/* 3D Rounded White Plate */}
      <rect x="18" y="18" width="64" height="64" rx="16" fill="#FFFFFF" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.08))" />

      {/* 4 Claymorphic Tiles */}
      <rect x="25" y="25" width="22" height="22" rx="7" fill="url(#tilePink)" filter="drop-shadow(0 2px 3px rgba(244,63,94,0.3))" />
      <rect x="53" y="25" width="22" height="22" rx="7" fill="url(#tileYellow)" filter="drop-shadow(0 2px 3px rgba(234,179,8,0.3))" />
      <rect x="25" y="53" width="22" height="22" rx="7" fill="url(#tileBlue)" filter="drop-shadow(0 2px 3px rgba(2,132,199,0.3))" />
      <rect x="53" y="53" width="22" height="22" rx="7" fill="url(#tileGreen)" filter="drop-shadow(0 2px 3px rgba(5,150,105,0.3))" />
    </svg>
  </div>
);

// 2. Customers (3D Cyan / Sky Blue Multi-Avatar Figurines)
export const NavCustomers3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-xs" fill="none">
      <defs>
        <radialGradient id="custNavGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#CCFBF1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#CCFBF1" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cHeadMain" cx="42%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="45%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0E7490" />
        </radialGradient>
        <linearGradient id="cBodyMain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>
        <radialGradient id="cHeadSide" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#A5F3FC" />
          <stop offset="60%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </radialGradient>
        <linearGradient id="cBodySide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#custNavGlow)" />

      {/* Left Avatar */}
      <circle cx="28" cy="46" r="10" fill="url(#cHeadSide)" />
      <path d="M15 73C15 62 21 57 28 57C35 57 41 62 41 73C41 75 38 76 28 76C18 76 15 75 15 73Z" fill="url(#cBodySide)" />

      {/* Right Avatar */}
      <circle cx="72" cy="46" r="10" fill="url(#cHeadSide)" />
      <path d="M59 73C59 62 65 57 72 57C79 57 85 62 85 73C85 75 82 76 72 76C62 76 59 75 59 73Z" fill="url(#cBodySide)" />

      {/* Center Lead Avatar */}
      <g filter="drop-shadow(0 5px 8px rgba(8,145,178,0.35))">
        <path d="M29 80C29 65 38 58 50 58C62 58 71 65 71 80C71 83 66 85 50 85C34 85 29 83 29 80Z" fill="url(#cBodyMain)" />
        <circle cx="50" cy="42" r="14" fill="url(#cHeadMain)" />
        <ellipse cx="46" cy="37" rx="4" ry="2.5" fill="#FFFFFF" fillOpacity="0.45" transform="rotate(-20 46 37)" />
      </g>
    </svg>
  </div>
);

// 3. Sales Team (3D Sales Executive Avatar with Green Plus Badge)
export const NavSalesTeam3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-xs" fill="none">
      <defs>
        <radialGradient id="salesGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="salesHair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
        <linearGradient id="salesFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FDBA74" />
        </linearGradient>
        <linearGradient id="salesShirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#salesGlow)" />

      {/* 3D Person Body */}
      <g filter="drop-shadow(0 4px 6px rgba(2,132,199,0.3))">
        {/* Shirt / Torso */}
        <path d="M26 82C26 66 36 60 50 60C64 60 74 66 74 82C74 85 68 87 50 87C32 87 26 85 26 82Z" fill="url(#salesShirt)" />
        {/* Head */}
        <circle cx="50" cy="42" r="15" fill="url(#salesFace)" />
        {/* Hair */}
        <path d="M36 38C36 29 42 26 50 26C58 26 64 29 64 38C64 33 60 30 50 30C40 30 36 34 36 38Z" fill="url(#salesHair)" />
      </g>

      {/* Green Plus Badge */}
      <g filter="drop-shadow(0 3px 4px rgba(5,150,105,0.4))">
        <circle cx="70" cy="70" r="11" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
        <path d="M70 65V75M65 70H75" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

// 4. Orders (3D Cardboard Parcel Box)
export const NavOrders3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-xs" fill="none">
      <defs>
        <radialGradient id="boxGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="boxTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="boxLeft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="boxRight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#boxGlow)" />

      {/* Isometric Box */}
      <g filter="drop-shadow(0 6px 10px rgba(180,83,9,0.35))">
        {/* Top Face */}
        <path d="M50 24L76 37L50 50L24 37Z" fill="url(#boxTop)" />
        {/* Left Face */}
        <path d="M24 37L50 50V78L24 65Z" fill="url(#boxLeft)" />
        {/* Right Face */}
        <path d="M50 50L76 37V65L50 78Z" fill="url(#boxRight)" />
        {/* Tape Line */}
        <path d="M50 24L50 50L50 78" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.8" />
        {/* White Label */}
        <rect x="30" y="52" width="12" height="8" rx="2" fill="#FFFFFF" transform="skewY(-15)" />
      </g>
    </svg>
  </div>
);

// 5. Designs (3D Green & White Athletic Sneaker Shoe)
export const NavDesigns3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-xs" fill="none">
      <defs>
        <radialGradient id="shoeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="shoeGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="60%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#shoeGlow)" />

      {/* 3D Green Sneaker */}
      <g filter="drop-shadow(0 6px 10px rgba(4,120,87,0.35))">
        {/* Sneaker Upper Body */}
        <path
          d="M20 54C20 48 24 44 32 44C38 44 42 48 48 50C54 52 64 48 72 52C78 55 82 60 82 66H20V54Z"
          fill="url(#shoeGreen)"
        />
        {/* Ankle Collar */}
        <path d="M26 44C26 38 32 34 38 34C44 34 46 40 46 44H26Z" fill="#047857" />
        {/* White Chunky Outsole */}
        <rect x="18" y="66" width="66" height="10" rx="4" fill="#FFFFFF" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.1))" />
        {/* White Laces & Swoosh Accent */}
        <path d="M42 42L48 52" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M48 44L54 54" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M34 58C44 58 56 60 66 54" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

// 6. Manufacturers (3D Purple Industrial Factory Building)
export const NavManufacturers3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-xs" fill="none">
      <defs>
        <radialGradient id="factGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="factBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="50%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#6B21A8" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#factGlow)" />

      {/* 3D Factory Building */}
      <g filter="drop-shadow(0 6px 10px rgba(107,33,168,0.35))">
        {/* Main Building Body */}
        <rect x="22" y="46" width="56" height="34" rx="6" fill="url(#factBody)" />
        {/* Sawtooth / Chimneys */}
        <rect x="28" y="32" width="10" height="18" rx="2" fill="#7E22CE" />
        <rect x="44" y="26" width="12" height="24" rx="2" fill="#7E22CE" />
        <rect x="62" y="36" width="10" height="14" rx="2" fill="#7E22CE" />
        {/* Chimney Caps */}
        <rect x="26" y="30" width="14" height="4" rx="1.5" fill="#A855F7" />
        <rect x="42" y="24" width="16" height="4" rx="1.5" fill="#A855F7" />
        <rect x="60" y="34" width="14" height="4" rx="1.5" fill="#A855F7" />
        {/* Cyan Glowing Windows */}
        <rect x="30" y="56" width="8" height="8" rx="2" fill="#A5F3FC" />
        <rect x="46" y="56" width="8" height="8" rx="2" fill="#A5F3FC" />
        <rect x="62" y="56" width="8" height="8" rx="2" fill="#A5F3FC" />
        <rect x="30" y="68" width="8" height="6" rx="2" fill="#A5F3FC" />
        <rect x="46" y="68" width="8" height="6" rx="2" fill="#A5F3FC" />
        <rect x="62" y="68" width="8" height="6" rx="2" fill="#A5F3FC" />
      </g>
    </svg>
  </div>
);

// 7. Payments & Finance (3D Emerald Green Wallet with Gold Coin & Rupee Sign)
export const NavPayments3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-xs" fill="none">
      <defs>
        <radialGradient id="payGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="payWallet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#payGlow)" />

      {/* Gold Coin on Top */}
      <circle cx="60" cy="34" r="11" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
      <text x="60" y="38" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#854D0E">₹</text>

      {/* 3D Green Wallet */}
      <g filter="drop-shadow(0 5px 8px rgba(4,120,87,0.35))">
        <rect x="22" y="38" width="56" height="42" rx="10" fill="url(#payWallet)" />
        {/* Flap */}
        <path d="M22 44C22 40 26 38 32 38H68C74 38 78 40 78 44V48C78 54 72 58 66 58H34C28 58 22 54 22 48V44Z" fill="#059669" />
        {/* Clasp */}
        <circle cx="68" cy="52" r="3.5" fill="#FFFFFF" />
      </g>

      {/* Rupee Coin Badge on bottom right */}
      <g filter="drop-shadow(0 3px 5px rgba(202,138,4,0.4))">
        <circle cx="72" cy="70" r="11" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
        <text x="72" y="74" textAnchor="middle" fontSize="11" fontWeight="900" fill="#FFFFFF">₹</text>
      </g>
    </svg>
  </div>
);

// 8. Reports & Alerts (3D Analytics Chart Document + Red Notification Bell)
export const NavReports3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-xs" fill="none">
      <defs>
        <radialGradient id="repGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#CCFBF1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#CCFBF1" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bellGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#repGlow)" />

      {/* 3D Document Sheet */}
      <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))">
        <rect x="24" y="22" width="46" height="56" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        {/* Chart Bars */}
        <rect x="32" y="52" width="6" height="18" rx="2" fill="#38BDF8" />
        <rect x="42" y="40" width="6" height="30" rx="2" fill="#F43F5E" />
        <rect x="52" y="34" width="6" height="36" rx="2" fill="#10B981" />
      </g>

      {/* 3D Red Alert Bell on Corner */}
      <g filter="drop-shadow(0 4px 7px rgba(225,29,72,0.4))">
        <circle cx="70" cy="68" r="14" fill="url(#bellGrad)" stroke="#FFFFFF" strokeWidth="2.5" />
        {/* Bell Clapper */}
        <path d="M66 65C66 62 68 60 70 60C72 60 74 62 74 65V70H66V65Z" fill="#FFFFFF" />
        <circle cx="70" cy="73" r="2" fill="#FFFFFF" />
      </g>
    </svg>
  </div>
);

// 9. Audit Log (3D Security Shield with Checkmark)
export const NavAuditLog3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-xs" fill="none">
      <defs>
        <radialGradient id="audGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#audGlow)" />

      {/* 3D Shield */}
      <g filter="drop-shadow(0 6px 10px rgba(67,56,202,0.35))">
        <path
          d="M50 20L74 28C74 52 64 68 50 78C36 68 26 52 26 28L50 20Z"
          fill="url(#shieldGrad)"
          stroke="#A5B4FC"
          strokeWidth="1.5"
        />
        {/* Inner Highlight Shield */}
        <path
          d="M50 24L70 30.5C70 49.5 61.5 63 50 71.5C38.5 63 30 49.5 30 30.5L50 24Z"
          fill="#4F46E5"
        />
        {/* Crisp White Checkmark */}
        <path
          d="M41 48L47 54L60 38"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  </div>
);

// 10. Settings (3D Purple Multi-Tooth Cog Gear)
export const NavSettings3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-xs" fill="none">
      <defs>
        <radialGradient id="setGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F3E8FF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F3E8FF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="gearGrad" cx="42%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#D8B4FE" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#6B21A8" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#setGlow)" />

      {/* 3D Gear */}
      <g filter="drop-shadow(0 6px 10px rgba(107,33,168,0.35))">
        {/* 8 Teeth */}
        <path
          d="M44 20H56V26H44V20ZM72 32L80 40L76 44L68 36L72 32ZM80 56V68H74V56H80ZM68 84L60 92L56 88L64 80L68 84ZM44 80H56V86H44V80ZM28 68L20 60L24 56L32 64L28 68ZM20 44V32H26V44H20ZM32 16L40 8L44 12L36 20L32 16Z"
          fill="#9333EA"
        />
        {/* Main Circular Body */}
        <circle cx="50" cy="50" r="26" fill="url(#gearGrad)" />
        {/* Center Hole */}
        <circle cx="50" cy="50" r="11" fill="#FFFFFF" filter="drop-shadow(inset 0 2px 3px rgba(0,0,0,0.2))" />
      </g>
    </svg>
  </div>
);

// 11. Follow-ups (3D Clock/Calendar)
export const NavFollowUps3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-xs" fill="none">
      <defs>
        <radialGradient id="folGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="folGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#folGlow)" />

      {/* 3D Clock Disc */}
      <g filter="drop-shadow(0 6px 10px rgba(234,88,12,0.35))">
        <circle cx="50" cy="50" r="28" fill="url(#folGrad)" stroke="#FED7AA" strokeWidth="2" />
        {/* Clock Center */}
        <circle cx="50" cy="50" r="4" fill="#FFFFFF" />
        {/* Hands */}
        <line x1="50" y1="50" x2="50" y2="34" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="50" y1="50" x2="63" y2="50" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

// 12. Visits (3D Map Pin & Location Beacon)
export const NavVisits3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none drop-shadow-xs" fill="none">
      <defs>
        <radialGradient id="visGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pinGradNav" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#visGlow)" />

      <g filter="drop-shadow(0 6px 10px rgba(217,119,6,0.35))">
        <path d="M50 24C40 24 32 32 32 42C32 54 48 74 50 76C52 74 68 54 68 42C68 32 60 24 50 24Z" fill="url(#pinGradNav)" />
        <circle cx="50" cy="41" r="7" fill="#FFFFFF" />
      </g>
    </svg>
  </div>
);

// 13. 3D User Avatar for Profile
export const NavUserAvatar3D: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full select-none" fill="none">
      <defs>
        <radialGradient id="avatarBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="100%" stopColor="#BAE6FD" />
        </radialGradient>
        <linearGradient id="userShirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="userSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FDBA74" />
        </linearGradient>
        <linearGradient id="userHair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="46" fill="url(#avatarBg)" />

      {/* Shirt */}
      <path d="M22 86C22 68 34 62 50 62C66 62 78 68 78 86C78 90 70 94 50 94C30 94 22 90 22 86Z" fill="url(#userShirt)" />

      {/* Head */}
      <circle cx="50" cy="44" r="17" fill="url(#userSkin)" />

      {/* Hair */}
      <path d="M34 40C34 28 40 24 50 24C60 24 66 28 66 40C66 33 60 29 50 29C40 29 34 33 34 40Z" fill="url(#userHair)" />
    </svg>
  </div>
);
