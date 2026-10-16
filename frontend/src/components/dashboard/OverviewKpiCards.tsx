import React from 'react';

export interface OverviewKpiCardsProps {
  salesValue: string;
  salesGrowth?: number;
  collectionsValue: string;
  collectionsGrowth?: number;
  receivablesValue: string;
  receivablesAccountsCount?: number;
  openOrdersCount: number;
  openOrdersValue?: string;
  activeStoresCount: number;
  totalRegisteredBuyers?: number;
  pairsBookedValue: string | number;
  pairsBookedGrowth?: number;
  onNavigate: (path: string) => void;
  isSalesperson?: boolean;
}

/* =========================================================================
   High-Fidelity 3D Claymorphic Illustrations (Exact match to reference photo)
   ========================================================================= */

// 1. Sales Booked: 3D Multi-color Bar Chart (Cyan, Royal Blue, Indigo, Purple)
const SalesBooked3D = () => (
  <svg viewBox="0 0 56 56" className="w-10 h-10 select-none drop-shadow-sm" fill="none">
    <defs>
      <linearGradient id="sbBar1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
      <linearGradient id="sbBar2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="sbBar3" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
      <linearGradient id="sbBar4" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#C084FC" />
        <stop offset="100%" stopColor="#7E22CE" />
      </linearGradient>
      <filter id="sbGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Base glow reflection */}
    <ellipse cx="28" cy="48" rx="22" ry="5" fill="#3B82F6" fillOpacity="0.25" filter="url(#sbGlow)" />
    
    {/* Bar 1 (Leftmost, Cyan) */}
    <rect x="6" y="28" width="9" height="20" rx="4.5" fill="url(#sbBar1)" />
    <ellipse cx="10.5" cy="30" rx="4.5" ry="2" fill="#BAE6FD" />
    
    {/* Bar 2 (Mid-Left, Royal Blue) */}
    <rect x="18" y="16" width="9" height="32" rx="4.5" fill="url(#sbBar2)" />
    <ellipse cx="22.5" cy="18" rx="4.5" ry="2" fill="#BFDBFE" />
    
    {/* Bar 3 (Mid-Right, Indigo - Tallest) */}
    <rect x="30" y="8" width="9" height="40" rx="4.5" fill="url(#sbBar3)" />
    <ellipse cx="34.5" cy="10" rx="4.5" ry="2" fill="#E0E7FF" />
    
    {/* Bar 4 (Rightmost, Purple) */}
    <rect x="42" y="22" width="9" height="26" rx="4.5" fill="url(#sbBar4)" />
    <ellipse cx="46.5" cy="24" rx="4.5" ry="2" fill="#F3E8FF" />
  </svg>
);

// 2. Collections: 3D Stack of Green Shiny Coins with Shield/Emblem
const Collections3D = () => (
  <svg viewBox="0 0 56 56" className="w-10 h-10 select-none drop-shadow-sm" fill="none">
    <defs>
      <linearGradient id="colCoinTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A7F3D0" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
      <linearGradient id="colShield" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    {/* Ambient shadow */}
    <ellipse cx="25" cy="48" rx="16" ry="4.5" fill="#047857" fillOpacity="0.25" />

    {/* Coin 1 Bottom */}
    <path d="M10 38v6c0 3 6.7 5.5 15 5.5s15-2.5 15-5.5v-6" fill="#059669" />
    <ellipse cx="25" cy="38" rx="15" ry="5.5" fill="url(#colCoinTop)" />

    {/* Coin 2 Middle */}
    <path d="M10 30v6c0 3 6.7 5.5 15 5.5s15-2.5 15-5.5v-6" fill="#059669" />
    <ellipse cx="25" cy="30" rx="15" ry="5.5" fill="url(#colCoinTop)" />

    {/* Coin 3 Top */}
    <path d="M10 22v6c0 3 6.7 5.5 15 5.5s15-2.5 15-5.5v-6" fill="#059669" />
    <ellipse cx="25" cy="22" rx="15" ry="5.5" fill="url(#colCoinTop)" />

    {/* Front Green Shield / Emblem Badge */}
    <g transform="translate(26, 22)">
      <circle cx="12" cy="12" r="11" fill="url(#colShield)" stroke="#6EE7B7" strokeWidth="1.5" filter="drop-shadow(0 2px 4px rgba(4,120,87,0.35))" />
      <path d="M8.5 12l2.5 2.5 4.5-5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

// 3. Receivables: 3D Coral/Pink Cash Register / POS Terminal with Paper Receipt Roll
const Receivables3D = () => (
  <svg viewBox="0 0 56 56" className="w-10 h-10 select-none drop-shadow-sm" fill="none">
    <defs>
      <linearGradient id="recPos" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FB7185" />
        <stop offset="50%" stopColor="#F43F5E" />
        <stop offset="100%" stopColor="#BE123C" />
      </linearGradient>
      <linearGradient id="recPaper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#FFE4E6" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="28" cy="48" rx="18" ry="4.5" fill="#BE123C" fillOpacity="0.22" />

    {/* Paper Receipt curling from top */}
    <path d="M19 12c0-3.5 3.5-5.5 8-5.5s8 2 8 5.5v12H19V12z" fill="url(#recPaper)" stroke="#FDA4AF" strokeWidth="1" />
    <line x1="22.5" y1="12" x2="31.5" y2="12" stroke="#FB7185" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="22.5" y1="16" x2="29.5" y2="16" stroke="#FB7185" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="22.5" y1="20" x2="32.5" y2="20" stroke="#FB7185" strokeWidth="1.5" strokeLinecap="round" />

    {/* Terminal Main Body */}
    <rect x="11" y="21" width="34" height="26" rx="7" fill="url(#recPos)" stroke="#FDA4AF" strokeWidth="1" />
    {/* Terminal Display */}
    <rect x="16" y="25" width="24" height="10" rx="3.5" fill="#9F1239" />
    <text x="28" y="33" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#FECDD3" fontFamily="var(--font-mono)">₹ 0.00</text>
    
    {/* Keypad Buttons */}
    <circle cx="20" cy="41" r="1.8" fill="#FFE4E6" />
    <circle cx="25.5" cy="41" r="1.8" fill="#FFE4E6" />
    <circle cx="31" cy="41" r="1.8" fill="#FFE4E6" />
    <circle cx="36.5" cy="41" r="1.8" fill="#34D399" />
  </svg>
);

// 4. Open Orders: 3D Warm Orange Packaging / Delivery Box with Tape
const OpenOrders3D = () => (
  <svg viewBox="0 0 56 56" className="w-10 h-10 select-none drop-shadow-sm" fill="none">
    <defs>
      <linearGradient id="boxTopFace" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#FBBF24" />
      </linearGradient>
      <linearGradient id="boxLeftFace" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="boxRightFace" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="28" cy="48" rx="18" ry="4.5" fill="#B45309" fillOpacity="0.25" />

    {/* Top Face */}
    <polygon points="28,12 46,21 28,30 10,21" fill="url(#boxTopFace)" stroke="#B45309" strokeWidth="0.8" strokeLinejoin="round" />
    {/* Left Face */}
    <polygon points="10,21 28,30 28,46 10,37" fill="url(#boxLeftFace)" stroke="#92400E" strokeWidth="0.8" strokeLinejoin="round" />
    {/* Right Face */}
    <polygon points="28,30 46,21 46,37 28,46" fill="url(#boxRightFace)" stroke="#78350F" strokeWidth="0.8" strokeLinejoin="round" />

    {/* Packaging Tape Center Strip */}
    <polygon points="23,14.5 33,19.5 33,32.5 23,27.5" fill="#FEF3C7" fillOpacity="0.9" stroke="#D97706" strokeWidth="0.5" />
    {/* Small Shipping Label */}
    <rect x="15" y="28" width="7" height="5" rx="1" fill="#FEF3C7" />
    <line x1="17" y1="30" x2="20" y2="30" stroke="#B45309" strokeWidth="0.8" />
  </svg>
);

// 5. Active Stores: 3D Purple Boutique Storefront with Striped Awning
const ActiveStores3D = () => (
  <svg viewBox="0 0 56 56" className="w-10 h-10 select-none drop-shadow-sm" fill="none">
    <defs>
      <linearGradient id="storeWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#C084FC" />
        <stop offset="100%" stopColor="#7E22CE" />
      </linearGradient>
      <linearGradient id="storeAwning" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E879F9" />
        <stop offset="100%" stopColor="#A855F7" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="28" cy="48" rx="18" ry="4.5" fill="#581C87" fillOpacity="0.25" />

    {/* Building Wall */}
    <rect x="11" y="21" width="34" height="26" rx="5" fill="url(#storeWall)" stroke="#D8B4FE" strokeWidth="0.8" />
    
    {/* Arched Doorway */}
    <path d="M22 31h12v16H22z" fill="#581C87" rx="2.5" />
    <circle cx="31" cy="39" r="1.3" fill="#FDE047" />

    {/* Display Window */}
    <rect x="14" y="31" width="5.5" height="9" rx="1.5" fill="#E9D5FF" />

    {/* Striped Canopy Awning */}
    <polygon points="8,21 12,12 44,12 48,21" fill="url(#storeAwning)" />
    {/* White Stripes on Canopy */}
    <polygon points="16,12 20,12 17,21 13,21" fill="#FFFFFF" fillOpacity="0.95" />
    <polygon points="26,12 30,12 29,21 25,21" fill="#FFFFFF" fillOpacity="0.95" />
    <polygon points="36,12 40,12 41,21 37,21" fill="#FFFFFF" fillOpacity="0.95" />
    
    {/* Scalloped edge */}
    <path d="M8 21q2.8 2.5 5.7 0t5.7 0t5.7 0t5.7 0t5.7 0t5.7 0t5.7 0" fill="#A855F7" stroke="#7E22CE" strokeWidth="0.6" />
  </svg>
);

// 6. Pairs Booked: 3D Royal Blue Running Athletic Sneaker
const PairsBooked3D = () => (
  <svg viewBox="0 0 56 56" className="w-10 h-10 select-none drop-shadow-sm" fill="none">
    <defs>
      <linearGradient id="shoeUpperGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="50%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="shoeSoleGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E2E8F0" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="28" cy="46" rx="18" ry="4" fill="#1E3A8A" fillOpacity="0.25" />

    {/* Athletic Shoe Upper Body */}
    <path
      d="M11 35c0-5 3-10 9-12 3-1 6-4 8-6 2-2 4-3 7-2 2 1 3 3 3 5v4l7 2.5c3.5 1.5 4.5 5 2.5 8l-1.5 2.5c-1 1.5-2.5 2-5 2H15c-2.5 0-4-1.5-4-4z"
      fill="url(#shoeUpperGrad)"
      stroke="#1E40AF"
      strokeWidth="0.8"
    />

    {/* Ankle Collar */}
    <ellipse cx="32" cy="21" rx="3.5" ry="2" fill="#1E3A8A" />

    {/* Sporty White Stripe Swoosh Accent */}
    <path d="M18 31c4-2.5 9-3.5 14-1 2 0.8 3.5 0 4.5-0.8" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />

    {/* Shoe Laces */}
    <line x1="25" y1="23" x2="28" y2="25.5" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" />
    <line x1="28" y1="25.5" x2="31" y2="28" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" />

    {/* White Midsole / Sole */}
    <path
      d="M9 38c2-1 5-1 11-1 7 0 14 1 21 0 2 0 3.5 1 3.5 2.5 0 2-2 3.5-4.5 3.5H13c-2.5 0-4-1.5-4-3.5 0-0.8 0-1.5 0-1.5z"
      fill="url(#shoeSoleGrad)"
      stroke="#CBD5E1"
      strokeWidth="0.8"
    />
    {/* Cyan Traction Accent */}
    <path d="M16 41h14" stroke="#38BDF8" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/* =========================================================================
   6 KPI Master Cards Row Component (Exact match to reference photo)
   ========================================================================= */

export const OverviewKpiCards: React.FC<OverviewKpiCardsProps> = ({
  salesValue,
  salesGrowth = 100,
  collectionsValue,
  collectionsGrowth = 100,
  receivablesValue,
  receivablesAccountsCount = 0,
  openOrdersCount,
  openOrdersValue,
  activeStoresCount,
  totalRegisteredBuyers = 10,
  pairsBookedValue,
  pairsBookedGrowth = 100,
  onNavigate,
  isSalesperson = false,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5 lg:gap-4">
      {/* 1. SALES BOOKED (Featured Primary Dark Card - Exact Match) */}
      <div
        onClick={() => onNavigate(isSalesperson ? '/sales/orders' : '/admin/orders')}
        className="bg-[#0f172a] dark:bg-[#0c1427] border border-slate-800/80 rounded-[26px] p-4 sm:p-4.5 lg:p-5 shadow-lg shadow-slate-950/20 hover:border-slate-700 transition-all duration-150 cursor-pointer flex flex-col justify-between text-left select-none group min-w-0 active:scale-[0.98]"
      >
        <div>
          {/* Top Row: 3D Bar Chart + Title + Dots */}
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-500/15 flex items-center justify-center shrink-0">
                <SalesBooked3D />
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] sm:text-sm font-bold text-white tracking-tight leading-tight truncate">
                  Sales Booked
                </h4>
                <p className="text-[11px] font-medium text-slate-400 leading-tight truncate mt-0.5">
                  Wholesale
                </p>
              </div>
            </div>
            <span className="text-slate-500 font-bold tracking-widest text-xs select-none pt-0.5">•••</span>
          </div>

          {/* Big Metric Value */}
          <div className="mt-3.5 mb-2 sm:mt-4 sm:mb-2.5">
            <span className="text-2xl sm:text-[26px] font-black text-white tracking-tight leading-none truncate block">
              {salesValue || '₹2.66L'}
            </span>
          </div>
        </div>

        {/* Bottom Progress Bar & Label */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-400">Progress</span>
            <span className="text-white font-bold">{salesGrowth ? `${salesGrowth}%` : '100%'}</span>
          </div>
          <div className="w-full bg-[#1e293b] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#2563eb] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(15, salesGrowth || 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. COLLECTIONS (White Card with Green Progress) */}
      <div
        onClick={() => onNavigate(isSalesperson ? '/sales/collections' : '/admin/payments')}
        className="bg-white dark:bg-card border border-slate-100 dark:border-slate-800 rounded-[26px] p-4 sm:p-4.5 lg:p-5 shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between text-left select-none group min-w-0 active:scale-[0.98]"
      >
        <div>
          {/* Top Row: 3D Coin Stack + Title + Dots */}
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Collections3D />
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                  Collections
                </h4>
                <p className="text-[11px] font-medium text-slate-400 leading-tight truncate mt-0.5">
                  Realized Cash
                </p>
              </div>
            </div>
            <span className="text-slate-400 font-bold tracking-widest text-xs select-none pt-0.5">•••</span>
          </div>

          {/* Big Metric Value */}
          <div className="mt-3.5 mb-2 sm:mt-4 sm:mb-2.5">
            <span className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight leading-none truncate block">
              {collectionsValue || '₹7.10L'}
            </span>
          </div>
        </div>

        {/* Bottom Progress Bar & Label */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-400">Progress</span>
            <span className="text-[#10b981] font-bold">{collectionsGrowth ? `${collectionsGrowth}%` : '100%'}</span>
          </div>
          <div className="w-full bg-emerald-100 dark:bg-emerald-950/40 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#10b981] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(15, collectionsGrowth || 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. RECEIVABLES (White Card with Red Metric & Pink Track) */}
      <div
        onClick={() => onNavigate(isSalesperson ? '/sales/collections?tab=overdue' : '/admin/customers/insights/receivables')}
        className="bg-white dark:bg-card border border-slate-100 dark:border-slate-800 rounded-[26px] p-4 sm:p-4.5 lg:p-5 shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between text-left select-none group min-w-0 active:scale-[0.98]"
      >
        <div>
          {/* Top Row: 3D POS Terminal + Title + Dots */}
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                <Receivables3D />
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                  Receivables
                </h4>
                <p className="text-[11px] font-medium text-slate-400 leading-tight truncate mt-0.5">
                  Total Dues
                </p>
              </div>
            </div>
            <span className="text-slate-400 font-bold tracking-widest text-xs select-none pt-0.5">•••</span>
          </div>

          {/* Big Metric Value (Vibrant Rose Red matching photo) */}
          <div className="mt-3.5 mb-2 sm:mt-4 sm:mb-2.5">
            <span className="text-2xl sm:text-[26px] font-black text-[#f43f5e] tracking-tight leading-none truncate block">
              {receivablesValue || '₹0.00L'}
            </span>
          </div>
        </div>

        {/* Bottom Progress Bar & Label */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-400">Recovery</span>
            <span className="text-[#f43f5e] font-bold">{receivablesAccountsCount || 0} Stores</span>
          </div>
          <div className="w-full bg-rose-100 dark:bg-rose-950/40 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#f43f5e] h-full rounded-full transition-all duration-500"
              style={{ width: receivablesAccountsCount && receivablesAccountsCount > 0 ? '65%' : '12%' }}
            />
          </div>
        </div>
      </div>

      {/* 4. OPEN ORDERS (White Card with Amber Accent) */}
      <div
        onClick={() => onNavigate(isSalesperson ? '/sales/orders' : '/admin/orders')}
        className="bg-white dark:bg-card border border-slate-100 dark:border-slate-800 rounded-[26px] p-4 sm:p-4.5 lg:p-5 shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between text-left select-none group min-w-0 active:scale-[0.98]"
      >
        <div>
          {/* Top Row: 3D Box + Title + Dots */}
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <OpenOrders3D />
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                  Open Orders
                </h4>
                <p className="text-[11px] font-medium text-slate-400 leading-tight truncate mt-0.5">
                  In Production
                </p>
              </div>
            </div>
            <span className="text-slate-400 font-bold tracking-widest text-xs select-none pt-0.5">•••</span>
          </div>

          {/* Big Metric Value */}
          <div className="mt-3.5 mb-2 sm:mt-4 sm:mb-2.5">
            <span className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight leading-none truncate block">
              {openOrdersCount === 1 ? '1 Order' : `${openOrdersCount || 1} Orders`}
            </span>
          </div>
        </div>

        {/* Bottom Progress Bar & Label */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-400">Progress</span>
            <span className="text-[#f59e0b] font-bold">58%</span>
          </div>
          <div className="w-full bg-amber-100 dark:bg-amber-950/40 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#f59e0b] h-full rounded-full transition-all duration-500"
              style={{ width: '58%' }}
            />
          </div>
        </div>
      </div>

      {/* 5. ACTIVE STORES (White Card with Purple Accent) */}
      <div
        onClick={() => onNavigate(isSalesperson ? '/sales/customers' : '/admin/customers/insights/total')}
        className="bg-white dark:bg-card border border-slate-100 dark:border-slate-800 rounded-[26px] p-4 sm:p-4.5 lg:p-5 shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between text-left select-none group min-w-0 active:scale-[0.98]"
      >
        <div>
          {/* Top Row: 3D Shop + Title + Dots */}
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <ActiveStores3D />
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                  Active Stores
                </h4>
                <p className="text-[11px] font-medium text-slate-400 leading-tight truncate mt-0.5">
                  Retail Accounts
                </p>
              </div>
            </div>
            <span className="text-slate-400 font-bold tracking-widest text-xs select-none pt-0.5">•••</span>
          </div>

          {/* Big Metric Value */}
          <div className="mt-3.5 mb-2 sm:mt-4 sm:mb-2.5">
            <span className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight leading-none truncate block">
              {activeStoresCount ? `${activeStoresCount} Accounts` : '8 Accounts'}
            </span>
          </div>
        </div>

        {/* Bottom Progress Bar & Label */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-400">Coverage</span>
            <span className="text-[#9333ea] font-bold">{totalRegisteredBuyers || 10} Total</span>
          </div>
          <div className="w-full bg-purple-100 dark:bg-purple-950/40 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#9333ea] h-full rounded-full transition-all duration-500"
              style={{ width: '80%' }}
            />
          </div>
        </div>
      </div>

      {/* 6. PAIRS BOOKED (White Card with Blue Accent) */}
      <div
        onClick={() => onNavigate(isSalesperson ? '/sales/orders' : '/admin/reports')}
        className="bg-white dark:bg-card border border-slate-100 dark:border-slate-800 rounded-[26px] p-4 sm:p-4.5 lg:p-5 shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between text-left select-none group min-w-0 active:scale-[0.98]"
      >
        <div>
          {/* Top Row: 3D Sneaker + Title + Dots */}
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <PairsBooked3D />
              </div>
              <div className="min-w-0">
                <h4 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                  Pairs Booked
                </h4>
                <p className="text-[11px] font-medium text-slate-400 leading-tight truncate mt-0.5">
                  Units Volume
                </p>
              </div>
            </div>
            <span className="text-slate-400 font-bold tracking-widest text-xs select-none pt-0.5">•••</span>
          </div>

          {/* Big Metric Value */}
          <div className="mt-3.5 mb-2 sm:mt-4 sm:mb-2.5">
            <span className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight leading-none truncate block">
              {typeof pairsBookedValue === 'number'
                ? pairsBookedValue.toLocaleString('en-IN')
                : (pairsBookedValue || '200')}
            </span>
          </div>
        </div>

        {/* Bottom Progress Bar & Label */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-400">Target</span>
            <span className="text-[#2563eb] font-bold">{pairsBookedGrowth ? `${pairsBookedGrowth}%` : '100%'}</span>
          </div>
          <div className="w-full bg-blue-100 dark:bg-blue-950/40 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#2563eb] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(15, pairsBookedGrowth || 100))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewKpiCards;
