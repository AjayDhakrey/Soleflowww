import React from 'react';

export interface Icon3DProps {
  size?: number | string;
  className?: string;
  strokeWidth?: number | string;
  [key: string]: any;
}

const parseSize = (size?: number | string): number => {
  if (typeof size === 'number') return size;
  if (typeof size === 'string') {
    const parsed = parseInt(size, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 20;
};

/* =========================================================================
   PREMIUM 3D CLAYMORPHIC & VECTOR ILLUSTRATION ICONS
   Engineered with volumetric depth, lighting, highlights & soft shadows
   ========================================================================= */

// 1. Dashboard (3D 4-Quadrant Claymorphic Plate)
export const IconDashboard3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <radialGradient id="dash3D_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dash3D_p" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>
        <linearGradient id="dash3D_y" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="dash3D_b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="dash3D_g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#dash3D_glow)" />
      <rect x="14" y="14" width="72" height="72" rx="20" fill="#FFFFFF" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
      <rect x="22" y="22" width="24" height="24" rx="8" fill="url(#dash3D_p)" filter="drop-shadow(0 2px 4px rgba(225,29,72,0.3))" />
      <rect x="54" y="22" width="24" height="24" rx="8" fill="url(#dash3D_y)" filter="drop-shadow(0 2px 4px rgba(217,119,6,0.3))" />
      <rect x="22" y="54" width="24" height="24" rx="8" fill="url(#dash3D_b)" filter="drop-shadow(0 2px 4px rgba(2,132,199,0.3))" />
      <rect x="54" y="54" width="24" height="24" rx="8" fill="url(#dash3D_g)" filter="drop-shadow(0 2px 4px rgba(5,150,105,0.3))" />
      {/* Specular Glints */}
      <circle cx="28" cy="28" r="3" fill="#FFFFFF" fillOpacity="0.6" />
      <circle cx="60" cy="28" r="3" fill="#FFFFFF" fillOpacity="0.6" />
    </svg>
  );
};

// 2. Customers / Clients / Users (3D Cyan Figurines)
export const IconCustomers3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <radialGradient id="cust3D_h1" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#A5F3FC" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0E7490" />
        </radialGradient>
        <linearGradient id="cust3D_b1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>
        <radialGradient id="cust3D_h2" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="60%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0369A1" />
        </radialGradient>
      </defs>
      {/* Left Avatar */}
      <circle cx="28" cy="46" r="11" fill="url(#cust3D_h2)" />
      <path d="M15 76C15 63 21 58 28 58C35 58 41 63 41 76C41 78 38 79 28 79C18 79 15 78 15 76Z" fill="#38BDF8" fillOpacity="0.85" />
      {/* Right Avatar */}
      <circle cx="72" cy="46" r="11" fill="url(#cust3D_h2)" />
      <path d="M59 76C59 63 65 58 72 58C79 58 85 63 85 76C85 78 82 79 72 79C62 79 59 78 59 76Z" fill="#38BDF8" fillOpacity="0.85" />
      {/* Center Lead Avatar */}
      <g filter="drop-shadow(0 4px 6px rgba(8,145,178,0.35))">
        <path d="M28 82C28 66 38 58 50 58C62 58 72 66 72 82C72 85 67 87 50 87C33 87 28 85 28 82Z" fill="url(#cust3D_b1)" />
        <circle cx="50" cy="40" r="16" fill="url(#cust3D_h1)" />
        <ellipse cx="45" cy="34" rx="4.5" ry="3" fill="#FFFFFF" fillOpacity="0.5" transform="rotate(-25 45 34)" />
      </g>
    </svg>
  );
};

// 3. Footwear / Designs / Catalogue (3D Wholesale Sneaker)
export const IconDesigns3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="shoe3D_u" x1="0.2" y1="0.2" x2="0.8" y2="0.9">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="45%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>
        <linearGradient id="shoe3D_sole" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
        <linearGradient id="shoe3D_tread" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="82" rx="36" ry="6" fill="#000000" fillOpacity="0.12" filter="blur(3px)" />
      {/* Sneaker Upper */}
      <path d="M16 64C16 52 24 40 36 38C44 36 49 42 58 44C68 46 80 49 84 58C86 63 85 68 83 70H16V64Z" fill="url(#shoe3D_u)" filter="drop-shadow(0 3px 5px rgba(234,88,12,0.35))" />
      {/* Tongue & Collar */}
      <path d="M34 38C32 30 35 24 40 22C45 20 49 26 47 34L34 38Z" fill="#C2410C" />
      <path d="M24 44C20 38 23 32 28 32C32 32 34 37 32 44" stroke="#FED7AA" strokeWidth="2.5" strokeLinecap="round" />
      {/* Swoosh/Stride Accents */}
      <path d="M32 54C46 52 64 56 74 64" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))" />
      <path d="M38 58C48 57 60 60 68 66" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
      {/* Chunky Cushion Midsole */}
      <path d="M12 70C12 68 15 67 22 67H84C87 67 89 69 88 73C87 77 82 79 72 79H16C13 79 12 75 12 70Z" fill="url(#shoe3D_sole)" />
      {/* Blue Tread Bottom */}
      <path d="M14 78H84C86 78 87 79 86 81C85 83 80 84 72 84H18C15 84 14 81 14 78Z" fill="url(#shoe3D_tread)" />
      {/* Front Toe Cap Gloss */}
      <ellipse cx="80" cy="62" rx="4" ry="2.5" fill="#FFFFFF" fillOpacity="0.4" />
    </svg>
  );
};

// 4. Orders / ShoppingBag / Items (3D Wholesale Order Bag with Tag)
export const IconOrders3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="bag3D_m" x1="0.1" y1="0.1" x2="0.9" y2="0.9">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="40%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="tag3D_g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="85" rx="32" ry="5" fill="#000000" fillOpacity="0.14" filter="blur(3px)" />
      {/* Handles */}
      <path d="M36 40V26C36 18 42 13 50 13C58 13 64 18 64 26V40" stroke="#93C5FD" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M36 38V26C36 19 42 15 50 15C58 15 64 19 64 26V38" stroke="#1D4ED8" strokeWidth="2.5" strokeLinecap="round" />
      {/* Bag Body */}
      <rect x="20" y="36" width="60" height="48" rx="14" fill="url(#bag3D_m)" filter="drop-shadow(0 4px 8px rgba(37,99,235,0.35))" />
      {/* Bag Rim Fold */}
      <path d="M20 46C26 44 40 43 50 43C60 43 74 44 80 46" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
      {/* Center White Order Brand Seal */}
      <circle cx="50" cy="62" r="12" fill="#FFFFFF" fillOpacity="0.95" />
      <path d="M44 62L48 66L56 58" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Golden Hangtag */}
      <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))" transform="rotate(-15 68 44)">
        <rect x="66" y="38" width="16" height="22" rx="4" fill="url(#tag3D_g)" />
        <circle cx="74" cy="42" r="2" fill="#713F12" />
        <line x1="70" y1="48" x2="78" y2="48" stroke="#854D0E" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
};

// 5. Manufacturers / Factory (3D Industrial Plant with Smokestacks & Gear)
export const IconManufacturers3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="fac3D_wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="50%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#581C87" />
        </linearGradient>
        <linearGradient id="fac3D_gear" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="85" rx="34" ry="5" fill="#000000" fillOpacity="0.14" filter="blur(3px)" />
      {/* Smokestacks */}
      <rect x="25" y="24" width="10" height="26" rx="2" fill="#7E22CE" />
      <rect x="23" y="22" width="14" height="4" rx="2" fill="#E9D5FF" />
      <circle cx="28" cy="16" r="4" fill="#E2E8F0" fillOpacity="0.8" />
      <circle cx="33" cy="11" r="5" fill="#E2E8F0" fillOpacity="0.6" />
      {/* Factory Sawtooth Roof & Main Body */}
      <path d="M18 78V48L36 36V48L54 36V48L72 36V78H18Z" fill="url(#fac3D_wall)" filter="drop-shadow(0 4px 8px rgba(147,51,234,0.35))" />
      {/* Windows */}
      <rect x="26" y="58" width="8" height="12" rx="2" fill="#FEF08A" />
      <rect x="42" y="58" width="8" height="12" rx="2" fill="#FEF08A" />
      {/* Golden Mechanical Gear */}
      <g filter="drop-shadow(0 3px 5px rgba(217,119,6,0.4))">
        <circle cx="68" cy="62" r="15" fill="url(#fac3D_gear)" />
        <circle cx="68" cy="62" r="6" fill="#FFFFFF" />
        <path d="M68 44V49M68 75V80M50 62H55M81 62H86M55 49L59 53M77 71L81 75M55 75L59 71M77 53L81 49" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
};

// 6. Payments / Currency (3D Metallic Gold Indian Rupee Coin)
export const IconPayments3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="coin3D_gold" x1="0.1" y1="0.1" x2="0.9" y2="0.9">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="30%" stopColor="#FBBF24" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <radialGradient id="coin3D_inner" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="84" rx="30" ry="6" fill="#000000" fillOpacity="0.15" filter="blur(3px)" />
      {/* Coin Thickness Rim */}
      <circle cx="50" cy="53" r="33" fill="#B45309" />
      {/* Main Face */}
      <circle cx="50" cy="49" r="33" fill="url(#coin3D_gold)" filter="drop-shadow(0 4px 8px rgba(180,83,9,0.4))" />
      <circle cx="50" cy="49" r="27" fill="url(#coin3D_inner)" stroke="#FEF08A" strokeWidth="1.5" />
      {/* 3D Embossed Rupee Sign */}
      <text x="50" y="60" textAnchor="middle" fontSize="30" fontWeight="900" fill="#78350F" filter="drop-shadow(0 1px 2px rgba(254,240,138,0.7))" fontFamily="var(--font-sans), system-ui, sans-serif">
        ₹
      </text>
      {/* Specular Highlight Arc */}
      <path d="M30 33C36 26 44 23 54 23" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.75" />
    </svg>
  );
};

// 7. Receivables / Wallet / Outstanding (3D Leather Bifold Wallet with Cash & Coin)
export const IconReceivables3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="wal3D_leather" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="60%" stopColor="#C2410C" />
          <stop offset="100%" stopColor="#7C2D12" />
        </linearGradient>
        <linearGradient id="wal3D_cash" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="82" rx="34" ry="5" fill="#000000" fillOpacity="0.14" filter="blur(3px)" />
      {/* Cash Notes Sticking Out */}
      <rect x="26" y="24" width="46" height="26" rx="4" fill="url(#wal3D_cash)" transform="rotate(-6 26 24)" />
      <rect x="30" y="28" width="44" height="24" rx="4" fill="#DCFCE7" transform="rotate(-3 30 28)" stroke="#16A34A" strokeWidth="1" />
      {/* Main Wallet Body */}
      <rect x="16" y="36" width="68" height="44" rx="12" fill="url(#wal3D_leather)" filter="drop-shadow(0 4px 7px rgba(124,45,18,0.4))" />
      {/* Wallet Flap with Stitching */}
      <path d="M16 48C30 46 70 46 84 48" stroke="#FED7AA" strokeWidth="1.5" strokeDasharray="3 3" />
      {/* Clasp & Golden Snap Button */}
      <rect x="62" y="48" width="24" height="18" rx="6" fill="#9A3412" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.25))" />
      <circle cx="74" cy="57" r="4.5" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  );
};

// 8. Collections (3D Hand with Coins & Growth Star)
export const IconCollections3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="col3D_coin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      {/* Coins Stack */}
      <ellipse cx="48" cy="42" rx="18" ry="6" fill="#F59E0B" />
      <ellipse cx="48" cy="36" rx="18" ry="6" fill="#FCD34D" />
      <ellipse cx="48" cy="30" rx="18" ry="6" fill="url(#col3D_coin)" />
      {/* Big Front Rupee Coin */}
      <circle cx="68" cy="44" r="18" fill="url(#col3D_coin)" filter="drop-shadow(0 3px 5px rgba(217,119,6,0.4))" />
      <circle cx="68" cy="44" r="14" fill="#FBBF24" />
      <text x="68" y="50" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#78350F">₹</text>
      {/* Hand Palm Supporting */}
      <path d="M18 64C28 60 40 60 52 64C64 68 76 68 84 62C86 64 86 68 80 72C70 79 56 82 44 80C32 78 20 74 18 64Z" fill="#38BDF8" filter="drop-shadow(0 3px 6px rgba(2,132,199,0.3))" />
      <path d="M22 68C32 66 44 66 54 70" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />
    </svg>
  );
};

// 9. Notifications / Bell (3D Ringing Golden Bell with Sound Waves)
export const IconNotifications3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="bell3D_body" x1="0.1" y1="0.1" x2="0.9" y2="0.9">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="85" rx="22" ry="5" fill="#000000" fillOpacity="0.12" filter="blur(2px)" />
      {/* Hanging Top Ring */}
      <circle cx="50" cy="18" r="8" stroke="#D97706" strokeWidth="4" />
      {/* Bell Clapper */}
      <circle cx="50" cy="74" r="8" fill="#92400E" />
      {/* Bell Main Body */}
      <path d="M50 22C38 22 32 34 30 52C28 64 20 70 18 72H82C80 70 72 64 70 52C68 34 62 22 50 22Z" fill="url(#bell3D_body)" filter="drop-shadow(0 5px 8px rgba(180,83,9,0.4))" />
      {/* Bell Lip Rim */}
      <ellipse cx="50" cy="72" rx="32" ry="7" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
      {/* Specular Flare */}
      <path d="M40 32C44 26 50 25 56 26" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.8" />
      {/* Sound Waves */}
      <path d="M12 40C8 46 8 54 12 60" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <path d="M88 40C92 46 92 54 88 60" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

// 10. Reports / Analytics / BarChart (3D 3-Pillar Column Chart with Green Growth Arrow)
export const IconReports3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="bar3D_1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="bar3D_2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>
        <linearGradient id="bar3D_3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="85" rx="34" ry="5" fill="#000000" fillOpacity="0.14" filter="blur(3px)" />
      {/* Base Grid Plate */}
      <rect x="14" y="78" width="72" height="8" rx="4" fill="#CBD5E1" />
      {/* Pillar 1 (Left - Short) */}
      <rect x="22" y="52" width="16" height="28" rx="5" fill="url(#bar3D_1)" filter="drop-shadow(0 2px 4px rgba(37,99,235,0.3))" />
      {/* Pillar 2 (Center - Medium) */}
      <rect x="42" y="38" width="16" height="42" rx="5" fill="url(#bar3D_2)" filter="drop-shadow(0 2px 4px rgba(126,34,206,0.3))" />
      {/* Pillar 3 (Right - High) */}
      <rect x="62" y="24" width="16" height="56" rx="5" fill="url(#bar3D_3)" filter="drop-shadow(0 2px 4px rgba(5,150,105,0.3))" />
      {/* Growth Arrow Swoosh */}
      <path d="M22 46L46 32L66 18L84 14M84 14V26M84 14H72" stroke="#10B981" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 3px 5px rgba(16,185,129,0.4))" />
    </svg>
  );
};

// 11. Settings (3D Dual Metallic Mechanical Gears)
export const IconSettings3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="set3D_g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="50%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="set3D_g2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      {/* Back Secondary Gear */}
      <circle cx="68" cy="38" r="18" fill="url(#set3D_g2)" filter="drop-shadow(0 2px 4px rgba(37,99,235,0.3))" />
      <circle cx="68" cy="38" r="7" fill="#FFFFFF" />
      {/* Front Primary Gear */}
      <g filter="drop-shadow(0 4px 7px rgba(51,65,85,0.4))">
        <circle cx="44" cy="56" r="26" fill="url(#set3D_g1)" />
        <circle cx="44" cy="56" r="10" fill="#F8FAFC" />
        {/* Teeth */}
        <path d="M44 26V32M44 80V86M14 56H20M68 56H74M23 35L27 39M61 73L65 77M23 77L27 73M61 39L65 35" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  );
};

// 12. Search (3D Magnifying Glass with Glossy Lens)
export const IconSearch3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="srch3D_handle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
        <radialGradient id="srch3D_glass" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#BAE6FD" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.25" />
        </radialGradient>
      </defs>
      {/* Beveled Handle */}
      <path d="M58 58L82 82C84 84 84 88 82 90C80 92 76 92 74 90L50 66" stroke="url(#srch3D_handle)" strokeWidth="12" strokeLinecap="round" filter="drop-shadow(0 3px 5px rgba(3,105,161,0.4))" />
      {/* Outer Metallic Ring */}
      <circle cx="42" cy="42" r="26" fill="url(#srch3D_glass)" stroke="#0284C7" strokeWidth="6" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.12))" />
      {/* Internal Reflection Flare */}
      <path d="M26 34C30 26 38 22 46 22" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.9" />
    </svg>
  );
};

// 13. Building / Store (3D Commercial Footwear Headquarters)
export const IconBuilding3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="bld3D_wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="86" rx="34" ry="5" fill="#000000" fillOpacity="0.14" filter="blur(3px)" />
      {/* Main High-Rise Building */}
      <rect x="24" y="20" width="52" height="64" rx="8" fill="url(#bld3D_wall)" filter="drop-shadow(0 4px 8px rgba(37,99,235,0.35))" />
      {/* Roof Parapet */}
      <rect x="20" y="16" width="60" height="6" rx="3" fill="#93C5FD" />
      {/* Windows Grid */}
      <rect x="32" y="28" width="10" height="8" rx="2" fill="#FEF08A" />
      <rect x="48" y="28" width="10" height="8" rx="2" fill="#FEF08A" />
      <rect x="32" y="42" width="10" height="8" rx="2" fill="#FEF08A" />
      <rect x="48" y="42" width="10" height="8" rx="2" fill="#FEF08A" />
      <rect x="32" y="56" width="10" height="8" rx="2" fill="#FEF08A" />
      <rect x="48" y="56" width="10" height="8" rx="2" fill="#FEF08A" />
      {/* Entrance Door */}
      <rect x="42" y="68" width="16" height="16" rx="3" fill="#FFFFFF" />
      <line x1="50" y1="68" x2="50" y2="84" stroke="#CBD5E1" strokeWidth="1.5" />
    </svg>
  );
};

// 14. Calendar / Date (3D Spiral Desk Calendar with Red Header)
export const IconCalendar3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="cal3D_red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="85" rx="32" ry="5" fill="#000000" fillOpacity="0.12" filter="blur(3px)" />
      {/* White Paper Backing */}
      <rect x="18" y="22" width="64" height="60" rx="12" fill="#FFFFFF" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
      {/* Red Calendar Header Bar */}
      <rect x="18" y="22" width="64" height="20" rx="8" fill="url(#cal3D_red)" />
      {/* Spiral Binder Rings */}
      <rect x="30" y="14" width="6" height="14" rx="3" fill="#94A3B8" />
      <rect x="47" y="14" width="6" height="14" rx="3" fill="#94A3B8" />
      <rect x="64" y="14" width="6" height="14" rx="3" fill="#94A3B8" />
      {/* Calendar Page Day / Grid */}
      <circle cx="34" cy="54" r="4" fill="#3B82F6" />
      <circle cx="50" cy="54" r="4" fill="#94A3B8" fillOpacity="0.4" />
      <circle cx="66" cy="54" r="4" fill="#94A3B8" fillOpacity="0.4" />
      <circle cx="34" cy="68" r="4" fill="#94A3B8" fillOpacity="0.4" />
      <circle cx="50" cy="68" r="4" fill="#EF4444" />
      <circle cx="66" cy="68" r="4" fill="#94A3B8" fillOpacity="0.4" />
    </svg>
  );
};

// 15. Check / Approved / Success (3D Emerald Shield Badge with Checkmark)
export const IconCheck3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <radialGradient id="chk3D_rad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="52" r="38" fill="#047857" />
      <circle cx="50" cy="48" r="38" fill="url(#chk3D_rad)" filter="drop-shadow(0 4px 8px rgba(16,185,129,0.4))" />
      {/* Beveled Checkmark */}
      <path d="M30 48L44 62L70 34" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))" />
      {/* Specular Glint */}
      <ellipse cx="40" cy="24" rx="8" ry="4" fill="#FFFFFF" fillOpacity="0.5" transform="rotate(-30 40 24)" />
    </svg>
  );
};

// 16. Alert / Overdue / AlertTriangle (3D Amber/Rose Warning Pyramid)
export const IconAlert3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="alt3D_grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="85" rx="30" ry="5" fill="#000000" fillOpacity="0.15" filter="blur(3px)" />
      {/* Warning Triangle Body */}
      <path d="M50 16C53 16 56 19 58 23L88 73C90 77 88 82 83 82H17C12 82 10 77 12 73L42 23C44 19 47 16 50 16Z" fill="url(#alt3D_grad)" filter="drop-shadow(0 4px 8px rgba(220,38,38,0.4))" />
      {/* Exclamation Mark */}
      <line x1="50" y1="36" x2="50" y2="58" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
      <circle cx="50" cy="69" r="4" fill="#FFFFFF" />
    </svg>
  );
};

// 17. Add / Plus (3D Blue Pill Sphere Button)
export const IconAdd3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <radialGradient id="add3D_rad" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="52" r="38" fill="#1E40AF" />
      <circle cx="50" cy="48" r="38" fill="url(#add3D_rad)" filter="drop-shadow(0 4px 7px rgba(37,99,235,0.4))" />
      <line x1="50" y1="32" x2="50" y2="64" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
      <line x1="34" y1="48" x2="66" y2="48" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="40" cy="24" rx="7" ry="3.5" fill="#FFFFFF" fillOpacity="0.5" transform="rotate(-30 40 24)" />
    </svg>
  );
};

// 18. FileText / Document / Receipt (3D Tax Invoice Slip with Blue Seal)
export const IconFileText3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="doc3D_fold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="85" rx="30" ry="5" fill="#000000" fillOpacity="0.12" filter="blur(3px)" />
      {/* White Document Body */}
      <path d="M22 18H62L78 34V80C78 84 74 86 70 86H22C18 86 14 84 14 80V24C14 20 18 18 22 18Z" fill="#FFFFFF" filter="drop-shadow(0 4px 7px rgba(0,0,0,0.12))" />
      {/* Folded Top-Right Corner */}
      <path d="M62 18V34H78Z" fill="url(#doc3D_fold)" />
      {/* Blue Header Stripe */}
      <rect x="22" y="30" width="30" height="5" rx="2.5" fill="#3B82F6" />
      {/* Text Lines */}
      <line x1="22" y1="44" x2="68" y2="44" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
      <line x1="22" y1="54" x2="60" y2="54" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
      <line x1="22" y1="64" x2="52" y2="64" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
      {/* Circular Official Seal */}
      <circle cx="62" cy="70" r="8" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2" />
    </svg>
  );
};

// 19. TrendingUp (3D Ascending Green Neon Arrow)
export const IconTrendingUp3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="tUp3D" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path d="M18 72L44 46L58 60L82 28M82 28V46M82 28H64" stroke="url(#tUp3D)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 4px 6px rgba(5,150,105,0.4))" />
      <path d="M18 72L44 46L58 60L82 28" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" />
    </svg>
  );
};

// 20. WhatsApp (3D Glossy Chat Bubble)
export const IconWhatsApp3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <radialGradient id="wa3D_grad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="60%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="38" fill="url(#wa3D_grad)" filter="drop-shadow(0 4px 8px rgba(34,197,94,0.4))" />
      {/* Telephone Handset */}
      <path d="M34 46C36 54 44 62 52 64L58 58C60 56 63 56 66 57L73 60C76 61 77 64 76 67L74 74C73 77 70 78 67 78C46 78 28 60 28 39C28 36 29 33 32 32L39 30C42 29 45 30 46 33L49 40C50 43 50 46 48 48L42 54" fill="#FFFFFF" />
      <ellipse cx="40" cy="24" rx="7" ry="3.5" fill="#FFFFFF" fillOpacity="0.45" transform="rotate(-30 40 24)" />
    </svg>
  );
};

// 21. Share (3D Connected Tri-Node Tripod)
export const IconShare3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <radialGradient id="shr3D_node" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#5B21B6" />
        </radialGradient>
      </defs>
      {/* Connecting Stems */}
      <line x1="32" y1="50" x2="68" y2="30" stroke="#DDD6FE" strokeWidth="6" strokeLinecap="round" />
      <line x1="32" y1="50" x2="68" y2="70" stroke="#DDD6FE" strokeWidth="6" strokeLinecap="round" />
      {/* Nodes */}
      <circle cx="32" cy="50" r="14" fill="url(#shr3D_node)" filter="drop-shadow(0 3px 5px rgba(139,92,246,0.4))" />
      <circle cx="68" cy="30" r="14" fill="url(#shr3D_node)" filter="drop-shadow(0 3px 5px rgba(139,92,246,0.4))" />
      <circle cx="68" cy="70" r="14" fill="url(#shr3D_node)" filter="drop-shadow(0 3px 5px rgba(139,92,246,0.4))" />
      {/* Glossy Glints */}
      <circle cx="30" cy="46" r="3" fill="#FFFFFF" fillOpacity="0.6" />
      <circle cx="66" cy="26" r="3" fill="#FFFFFF" fillOpacity="0.6" />
      <circle cx="66" cy="66" r="3" fill="#FFFFFF" fillOpacity="0.6" />
    </svg>
  );
};

// 22. Edit / Pencil (3D Stylus Pencil with Eraser Tip)
export const IconEdit3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="pen3D_body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
      </defs>
      <g transform="rotate(45 50 50)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.2))">
        {/* Pink Eraser */}
        <rect x="42" y="14" width="16" height="12" rx="3" fill="#FB7185" />
        <rect x="42" y="24" width="16" height="5" fill="#E2E8F0" />
        {/* Yellow Body */}
        <rect x="42" y="29" width="16" height="42" fill="url(#pen3D_body)" />
        {/* Wood Sharpened Point & Lead Tip */}
        <path d="M42 71L50 86L58 71Z" fill="#FED7AA" />
        <path d="M47 81L50 86L53 81Z" fill="#1E293B" />
      </g>
    </svg>
  );
};

// 23. Logout (3D Open Portal Doorway with Crimson Exit Arrow)
export const IconLogout3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="log3D_door" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
      {/* Door Frame */}
      <path d="M46 22H24C20 22 18 24 18 28V76C18 80 20 82 24 82H46" stroke="url(#log3D_door)" strokeWidth="6" strokeLinecap="round" />
      {/* Arrow Out */}
      <path d="M40 52H82M82 52L66 36M82 52L66 68" stroke="#EF4444" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 3px 5px rgba(239,68,68,0.4))" />
    </svg>
  );
};

// 24. Sun (3D Radiant Solar Orb)
export const IconSun3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <radialGradient id="sun3D_core" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
      </defs>
      {/* Corona Rays */}
      <path d="M50 14V22M50 78V86M14 50H22M78 50H86M24 24L30 30M70 70L76 76M24 76L30 70M70 30L76 24" stroke="#FBBF24" strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="50" cy="50" r="24" fill="url(#sun3D_core)" filter="drop-shadow(0 4px 8px rgba(245,158,11,0.5))" />
    </svg>
  );
};

// 25. Moon (3D Golden Crescent Moon)
export const IconMoon3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="moon3D_grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <path d="M68 24C68 48 48 68 24 68C22 68 20 68 18 67C26 79 40 86 54 86C74 86 90 70 90 50C90 36 82 24 68 24Z" fill="url(#moon3D_grad)" filter="drop-shadow(0 4px 7px rgba(245,158,11,0.4))" />
      {/* Little Twinkle Stars */}
      <circle cx="34" cy="28" r="3" fill="#FDE68A" />
      <circle cx="24" cy="42" r="2" fill="#FDE68A" />
    </svg>
  );
};

// 26. Refresh (3D Circular Dual-Arrow Orbit)
export const IconRefresh3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="ref3D_grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      <path d="M78 50C78 65 65 78 50 78C38 78 28 70 24 60M22 50C22 35 35 22 50 22C62 22 72 30 76 40" stroke="url(#ref3D_grad)" strokeWidth="8" strokeLinecap="round" filter="drop-shadow(0 3px 5px rgba(2,132,199,0.35))" />
      <path d="M76 26L78 42L62 40" fill="url(#ref3D_grad)" />
      <path d="M24 74L22 58L38 60" fill="url(#ref3D_grad)" />
    </svg>
  );
};

// 27. Filter (3D Equalizer Sliders with Metallic Cylinders)
export const IconFilter3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <line x1="20" y1="30" x2="80" y2="30" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
      <line x1="20" y1="50" x2="80" y2="50" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
      <line x1="20" y1="70" x2="80" y2="70" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
      {/* 3D Knobs */}
      <rect x="36" y="22" width="16" height="16" rx="5" fill="#3B82F6" filter="drop-shadow(0 2px 4px rgba(37,99,235,0.4))" />
      <rect x="56" y="42" width="16" height="16" rx="5" fill="#10B981" filter="drop-shadow(0 2px 4px rgba(16,185,129,0.4))" />
      <rect x="30" y="62" width="16" height="16" rx="5" fill="#F59E0B" filter="drop-shadow(0 2px 4px rgba(245,158,11,0.4))" />
    </svg>
  );
};

// 28. Phone (3D Ergonomic Handset)
export const IconPhone3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="ph3D" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      <path d="M30 44C34 56 44 66 56 70L62 62C64 60 67 59 70 60L82 64C86 65 88 70 86 74L82 84C80 88 76 90 72 90C44 90 20 66 20 38C20 34 22 30 26 28L36 24C40 22 45 24 46 28L50 40C51 43 50 46 48 48L40 54" fill="url(#ph3D)" filter="drop-shadow(0 4px 7px rgba(30,64,175,0.4))" />
    </svg>
  );
};

// 29. Mail (3D Envelope with Red Stamp)
export const IconMail3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="mail3D_flap" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="84" rx="34" ry="5" fill="#000000" fillOpacity="0.14" filter="blur(3px)" />
      <rect x="16" y="28" width="68" height="48" rx="10" fill="#FFFFFF" filter="drop-shadow(0 4px 7px rgba(0,0,0,0.12))" />
      <path d="M16 34L50 56L84 34" stroke="url(#mail3D_flap)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="56" r="6" fill="#EF4444" filter="drop-shadow(0 2px 3px rgba(239,68,68,0.4))" />
    </svg>
  );
};

// 30. Eye / View (3D Glossy Iris Sphere)
export const IconEye3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <radialGradient id="eye3D_iris" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#082F49" />
        </radialGradient>
      </defs>
      <path d="M14 50C22 34 35 24 50 24C65 24 78 34 86 50C78 66 65 76 50 76C35 76 22 66 14 50Z" fill="#FFFFFF" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.12))" />
      <circle cx="50" cy="50" r="18" fill="url(#eye3D_iris)" />
      <circle cx="50" cy="50" r="8" fill="#020617" />
      <circle cx="45" cy="45" r="4" fill="#FFFFFF" />
    </svg>
  );
};

// 31. Delete / Trash (3D Crimson Canister)
export const IconTrash3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="tr3D_red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="85" rx="26" ry="5" fill="#000000" fillOpacity="0.14" filter="blur(3px)" />
      {/* Canister Body */}
      <path d="M26 36L32 78C32 82 36 84 40 84H60C64 84 68 82 68 78L74 36H26Z" fill="url(#tr3D_red)" filter="drop-shadow(0 4px 7px rgba(185,28,28,0.4))" />
      {/* Ribs */}
      <line x1="42" y1="44" x2="42" y2="76" stroke="#FECACA" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="50" y1="44" x2="50" y2="76" stroke="#FECACA" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="58" y1="44" x2="58" y2="76" stroke="#FECACA" strokeWidth="2.5" strokeLinecap="round" />
      {/* Lid & Handle */}
      <rect x="22" y="30" width="56" height="8" rx="4" fill="#EF4444" />
      <rect x="42" y="22" width="16" height="8" rx="3" fill="#DC2626" />
    </svg>
  );
};

// 32. Truck / Dispatched (3D Express Cargo Van)
export const IconTruck3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="trk3D_blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="82" rx="36" ry="5" fill="#000000" fillOpacity="0.14" filter="blur(3px)" />
      {/* Cargo Box */}
      <rect x="14" y="32" width="46" height="42" rx="6" fill="url(#trk3D_blue)" filter="drop-shadow(0 4px 6px rgba(2,132,199,0.35))" />
      {/* Front Cab */}
      <path d="M60 44H74C78 44 82 48 84 52L88 64V74H60V44Z" fill="#E2E8F0" />
      <path d="M64 48H74L80 60H64V48Z" fill="#38BDF8" />
      {/* Dual Wheels */}
      <circle cx="32" cy="74" r="9" fill="#1E293B" />
      <circle cx="32" cy="74" r="4" fill="#CBD5E1" />
      <circle cx="74" cy="74" r="9" fill="#1E293B" />
      <circle cx="74" cy="74" r="4" fill="#CBD5E1" />
    </svg>
  );
};

// 33. Delivered / PackageCheck (3D Cardboard Parcel Box with Green Seal)
export const IconDelivered3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <linearGradient id="pkg3D_kraft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="85" rx="34" ry="5" fill="#000000" fillOpacity="0.15" filter="blur(3px)" />
      {/* Isometric Cube Box */}
      <path d="M50 20L84 36V66L50 82L16 66V36L50 20Z" fill="url(#pkg3D_kraft)" filter="drop-shadow(0 4px 7px rgba(180,83,9,0.35))" />
      {/* Top Tape Seam */}
      <path d="M50 20L50 52" stroke="#FEF08A" strokeWidth="4" />
      <path d="M50 52L84 36" stroke="#B45309" strokeWidth="2.5" />
      <path d="M50 52L16 36" stroke="#FEF08A" strokeWidth="2.5" />
      {/* Green Checkmark Badge */}
      <circle cx="68" cy="62" r="14" fill="#10B981" filter="drop-shadow(0 3px 5px rgba(16,185,129,0.4))" />
      <path d="M62 62L66 66L74 58" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// 34. MapPin / Visits (3D Teardrop Pin over Map Tile)
export const IconVisits3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <defs>
        <radialGradient id="pin3D_red" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="50%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#881337" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="86" rx="20" ry="4" fill="#000000" fillOpacity="0.2" filter="blur(2px)" />
      {/* 3D Pin Head & Point */}
      <path d="M50 82C50 82 74 54 74 38C74 24 63 14 50 14C37 14 26 24 26 38C26 54 50 82 50 82Z" fill="url(#pin3D_red)" filter="drop-shadow(0 5px 8px rgba(225,29,72,0.45))" />
      {/* Pin Center Core */}
      <circle cx="50" cy="38" r="10" fill="#FFFFFF" />
      <ellipse cx="44" cy="24" rx="6" ry="3" fill="#FFFFFF" fillOpacity="0.5" transform="rotate(-30 44 24)" />
    </svg>
  );
};

// 35. Target (3D Archery Bullseye with Golden Arrow)
export const IconTarget3D: React.FC<Icon3DProps> = ({ size = 20, className = '', ...props }) => {
  const s = parseSize(size);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" className={`inline-block select-none shrink-0 drop-shadow-xs ${className}`} {...props}>
      <circle cx="50" cy="50" r="38" fill="#EF4444" filter="drop-shadow(0 4px 6px rgba(239,68,68,0.35))" />
      <circle cx="50" cy="50" r="28" fill="#FFFFFF" />
      <circle cx="50" cy="50" r="18" fill="#EF4444" />
      <circle cx="50" cy="50" r="8" fill="#FBBF24" />
      {/* Arrow Stem */}
      <line x1="50" y1="50" x2="78" y2="22" stroke="#D97706" strokeWidth="5" strokeLinecap="round" />
      <polygon points="76,18 84,16 82,24" fill="#F59E0B" />
    </svg>
  );
};
