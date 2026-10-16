import React from 'react';

// Exact authentic 3D icon assets extracted from the design reference
import brandLogoImg from '../../assets/images/sidebar-icons/brand_logo.png';
import navDashboardImg from '../../assets/images/sidebar-icons/nav_dashboard.png';
import navCustomersImg from '../../assets/images/sidebar-icons/nav_customers.png';
import navSalesTeamImg from '../../assets/images/sidebar-icons/nav_sales_team.png';
import navOrdersImg from '../../assets/images/sidebar-icons/nav_orders.png';
import navDesignsImg from '../../assets/images/sidebar-icons/nav_designs.png';
import navManufacturersImg from '../../assets/images/sidebar-icons/nav_manufacturers.png';
import navPaymentsImg from '../../assets/images/sidebar-icons/nav_payments.png';
import navReportsImg from '../../assets/images/sidebar-icons/nav_reports.png';
import navSettingsImg from '../../assets/images/sidebar-icons/nav_settings.png';

/* =========================================================================
   3D Claymorphic Icons for Sidebar Navigation
   ========================================================================= */

// Brand Logo (Sneaker on rounded squircle plate)
export const NavBrandLogo3D: React.FC<{ className?: string }> = ({ className = 'w-[50px] h-[50px]' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <img src={brandLogoImg} alt="ShoeConnect Logo" className="w-full h-full object-contain select-none pointer-events-none" />
  </div>
);

// 1. Dashboard (3D Colorful 4-Tile Grid inside glossy rounded plate)
export const NavDashboard3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <img src={navDashboardImg} alt="Dashboard" className="w-full h-full object-contain select-none pointer-events-none drop-shadow-xs" />
  </div>
);

// 2. Customers (3D Cyan / Sky Blue Multi-Avatar Figurines)
export const NavCustomers3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <img src={navCustomersImg} alt="Customers" className="w-full h-full object-contain select-none pointer-events-none" />
  </div>
);

// 3. Sales Team (3D Figurine with Golden Head, Blue Body & Green Plus Badge)
export const NavSalesTeam3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <img src={navSalesTeamImg} alt="Sales Team" className="w-full h-full object-contain select-none pointer-events-none" />
  </div>
);

// 4. Orders (3D Warm Amber / Orange Isometric Cardboard Cube with Tape)
export const NavOrders3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <img src={navOrdersImg} alt="Orders" className="w-full h-full object-contain select-none pointer-events-none" />
  </div>
);

// 5. Designs (3D Mint Green / Turquoise Athletic Running Shoe facing Left)
export const NavDesigns3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <img src={navDesignsImg} alt="Designs" className="w-full h-full object-contain select-none pointer-events-none" />
  </div>
);

// 6. Manufacturers (3D Purple Sawtooth Factory with 6 Windows & Chimneys)
export const NavManufacturers3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <img src={navManufacturersImg} alt="Manufacturers" className="w-full h-full object-contain select-none pointer-events-none" />
  </div>
);

// 7. Payments & Finance (3D Emerald Green Wallet with Gold Coin & Rupee Sign)
export const NavPayments3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <img src={navPaymentsImg} alt="Payments & Amount Due" className="w-full h-full object-contain select-none pointer-events-none" />
  </div>
);

// 8. Reports & Alerts (3D White Plate with Blue, Orange, Green Vertical Bar Charts)
export const NavReports3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <img src={navReportsImg} alt="Reports & Alerts" className="w-full h-full object-contain select-none pointer-events-none drop-shadow-xs" />
  </div>
);

// 9. Settings (3D Purple Multi-Tooth Cog Gear)
export const NavSettings3D: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
    <img src={navSettingsImg} alt="Settings" className="w-full h-full object-contain select-none pointer-events-none" />
  </div>
);

// 10. Audit Log (3D Security Shield with Checkmark)
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
