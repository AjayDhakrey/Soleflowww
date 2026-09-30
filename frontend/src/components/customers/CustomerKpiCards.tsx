import React from 'react';
import { Icons } from '../../lib/icons';

interface CustomerKpiCardsProps {
  totalCustomers: number | string;
  totalCustomersGrowth?: number;
  totalReceivables: string;
  totalReceivablesGrowth?: number;
  overdueAccounts: number | string;
  overdueGrowth?: number;
  clearedAccounts: number | string;
  clearedGrowth?: number;
  onNavigateTotal: () => void;
  onNavigateReceivables: () => void;
  onNavigateOverdue: () => void;
  onNavigateCleared: () => void;
}

/* =========================================================================
   Pixel-Perfect 3D Claymorphic Vector Illustrations
   ========================================================================= */

// 1. Total Customers (3D Violet/Purple Multi-Avatar Figurines + Rays)
const TotalCustomers3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        {/* Ambient Soft Glow Background */}
        <radialGradient id="custGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0" />
        </radialGradient>

        {/* Center Main Figurine (Rich 3D Purple) */}
        <linearGradient id="mainBodyGrad" x1="50" y1="52" x2="50" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9333EA" />
          <stop offset="60%" stopColor="#7E22CE" />
          <stop offset="100%" stopColor="#581C87" />
        </linearGradient>
        <radialGradient id="mainHeadGrad" cx="42%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#D8B4FE" />
          <stop offset="35%" stopColor="#A855F7" />
          <stop offset="85%" stopColor="#7E22CE" />
          <stop offset="100%" stopColor="#581C87" />
        </radialGradient>

        {/* Side Figurines (Soft Lavender 3D) */}
        <radialGradient id="sideHeadGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#E9D5FF" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#9333EA" />
        </radialGradient>
        <linearGradient id="sideBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>

        {/* Specular Highlight */}
        <linearGradient id="specularWhite" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Backdrop Ambient Circle */}
      <circle cx="50" cy="52" r="38" fill="url(#custGlow)" />

      {/* 3 Top Sparkle Rays */}
      <path d="M50 14V8" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
      <path d="M37 17L33 12" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
      <path d="M63 17L67 12" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />

      {/* Left Avatar (Background) */}
      <g filter="drop-shadow(0 4px 6px rgba(126,34,206,0.2))">
        <circle cx="28" cy="46" r="10" fill="url(#sideHeadGrad)" />
        <path d="M14 74C14 62 21 57 28 57C35 57 42 62 42 74C42 75 39 76 28 76C17 76 14 75 14 74Z" fill="url(#sideBodyGrad)" />
      </g>

      {/* Right Avatar (Background) */}
      <g filter="drop-shadow(0 4px 6px rgba(126,34,206,0.2))">
        <circle cx="72" cy="46" r="10" fill="url(#sideHeadGrad)" />
        <path d="M58 74C58 62 65 57 72 57C79 57 86 62 86 74C86 75 83 76 72 76C61 76 58 75 58 74Z" fill="url(#sideBodyGrad)" />
      </g>

      {/* Center Avatar (Foreground Main 3D) */}
      <g filter="drop-shadow(0 6px 10px rgba(88,28,135,0.35))">
        {/* Torso */}
        <path
          d="M29 82C29 65 38 58 50 58C62 58 71 65 71 82C71 85 66 87 50 87C34 87 29 85 29 82Z"
          fill="url(#mainBodyGrad)"
        />
        {/* Torso Top Highlight */}
        <path
          d="M36 67C39 61 45 59 50 59C55 59 61 61 64 67"
          stroke="url(#specularWhite)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Head */}
        <circle cx="50" cy="42" r="15" fill="url(#mainHeadGrad)" />
        {/* Head Specular Highlight */}
        <ellipse cx="46" cy="36" rx="4.5" ry="3" fill="#FFFFFF" fillOpacity="0.45" transform="rotate(-20 46 36)" />
      </g>
    </svg>
  </div>
);

// 2. Total Receivables (3D Coral-Pink Wallet with Popping Gold Rupee Coin)
const TotalReceivables3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        {/* Glow */}
        <radialGradient id="recGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE4E6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFE4E6" stopOpacity="0" />
        </radialGradient>

        {/* Gold Coin */}
        <radialGradient id="coinGold" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#FACC15" />
          <stop offset="85%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </radialGradient>

        {/* Pink Wallet */}
        <linearGradient id="walletMain" x1="20" y1="36" x2="80" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="50%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>

        {/* Wallet Flap */}
        <linearGradient id="walletFlap" x1="50" y1="40" x2="50" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
      </defs>

      {/* Glow */}
      <circle cx="50" cy="54" r="38" fill="url(#recGlow)" />

      {/* Sparkles around coin */}
      <path d="M78 20L81 16" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M84 27H89" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

      {/* Gold Coin Popping Out */}
      <g filter="drop-shadow(0 4px 6px rgba(202,138,4,0.35))">
        <circle cx="64" cy="36" r="16" fill="url(#coinGold)" stroke="#CA8A04" strokeWidth="1.5" />
        <circle cx="64" cy="36" r="13" stroke="#FDE047" strokeWidth="1" strokeDasharray="2 2" fill="none" />
        <text x="64" y="42" textAnchor="middle" fontSize="15" fontWeight="900" fill="#854D0E" fontFamily="system-ui, -apple-system, sans-serif">
          ₹
        </text>
      </g>

      {/* 3D Pink Wallet Body */}
      <g filter="drop-shadow(0 8px 12px rgba(225,29,72,0.3))">
        <rect x="20" y="42" width="60" height="42" rx="12" fill="url(#walletMain)" />

        {/* Flap Curve */}
        <path
          d="M20 48C20 44 24 42 28 42H72C76 42 80 44 80 48V52C80 58 74 62 68 62H32C26 62 20 58 20 52V48Z"
          fill="url(#walletFlap)"
          stroke="#FDA4AF"
          strokeWidth="1"
        />

        {/* Clasp */}
        <circle cx="68" cy="56" r="4.5" fill="#FFFFFF" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))" />
        <circle cx="68" cy="56" r="2" fill="#E11D48" />

        {/* Rupee Symbol on Front */}
        <text x="46" y="74" textAnchor="middle" fontSize="22" fontWeight="900" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif">
          ₹
        </text>
      </g>
    </svg>
  </div>
);

// 3. Overdue Accounts (3D Yellow/Golden Warning Triangle with Exclamation & Rays)
const OverdueAccounts3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        {/* Glow */}
        <radialGradient id="warnGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF9C3" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FEF9C3" stopOpacity="0" />
        </radialGradient>

        {/* Triangle Outer */}
        <linearGradient id="triangleOuter" x1="50" y1="16" x2="50" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Triangle Inner Face */}
        <radialGradient id="triangleInner" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
      </defs>

      {/* Glow */}
      <circle cx="50" cy="52" r="38" fill="url(#warnGlow)" />

      {/* Rays */}
      <path d="M22 38L16 34" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <path d="M26 26L22 20" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <path d="M78 38L84 34" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <path d="M74 26L78 20" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />

      {/* 3D Warning Triangle */}
      <g filter="drop-shadow(0 8px 12px rgba(217,119,6,0.35))">
        {/* Base Beveled Triangle */}
        <path
          d="M42.5 22.8C45.8 17.1 54.2 17.1 57.5 22.8L85.2 70.8C88.5 76.5 84.3 83.5 77.7 83.5H22.3C15.7 83.5 11.5 76.5 14.8 70.8L42.5 22.8Z"
          fill="url(#triangleOuter)"
        />

        {/* Inner Front Face */}
        <path
          d="M44.5 26.5C46.8 22.5 53.2 22.5 55.5 26.5L81.5 71.5C83.8 75.5 80.8 80.5 76 80.5H24C19.2 80.5 16.2 75.5 18.5 71.5L44.5 26.5Z"
          fill="url(#triangleInner)"
        />

        {/* Specular Edge Highlight */}
        <path
          d="M48 24L21 72"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />

        {/* 3D Exclamation Mark (White with soft drop shadow) */}
        <path d="M50 40V58" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" filter="drop-shadow(0 2px 3px rgba(180,83,9,0.3))" />
        <circle cx="50" cy="69" r="3.5" fill="#FFFFFF" filter="drop-shadow(0 2px 3px rgba(180,83,9,0.3))" />
      </g>
    </svg>
  </div>
);

// 4. Cleared Accounts (3D Emerald Green Circular Seal / Checkmark Button)
const ClearedAccounts3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        {/* Glow */}
        <radialGradient id="clearGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>

        {/* Outer Rim */}
        <linearGradient id="sealOuter" x1="30" y1="16" x2="70" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="45%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Inner Dome */}
        <radialGradient id="sealDome" cx="42%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="40%" stopColor="#34D399" />
          <stop offset="85%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </radialGradient>
      </defs>

      {/* Glow */}
      <circle cx="50" cy="52" r="38" fill="url(#clearGlow)" />

      {/* Sparkles */}
      <path d="M78 24L83 19" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
      <path d="M85 33H90" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />

      {/* 3D Green Seal */}
      <g filter="drop-shadow(0 8px 12px rgba(4,120,87,0.35))">
        {/* Outer Beveled Rim */}
        <circle cx="50" cy="52" r="28" fill="url(#sealOuter)" />

        {/* Inner Raised Dome */}
        <circle cx="50" cy="52" r="23" fill="url(#sealDome)" />

        {/* Top Rim Specular Arc */}
        <path
          d="M32 40C36 33 43 29 50 29C57 29 64 33 68 40"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.55"
        />

        {/* Crisp Bold White Checkmark */}
        <path
          d="M38 52L46 60L63 42"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0 2px 4px rgba(4,120,87,0.3))"
        />
      </g>
    </svg>
  </div>
);

/* =========================================================================
   Customer KPI Cards Component
   ========================================================================= */

export const CustomerKpiCards: React.FC<CustomerKpiCardsProps> = ({
  totalCustomers,
  totalCustomersGrowth = 14,
  totalReceivables,
  totalReceivablesGrowth = 8,
  overdueAccounts,
  overdueGrowth = 6,
  clearedAccounts,
  clearedGrowth = 12,
  onNavigateTotal,
  onNavigateReceivables,
  onNavigateOverdue,
  onNavigateCleared,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {/* 1. Total Customers */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateTotal}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigateTotal();
          }
        }}
        className="group relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <TotalCustomers3D />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
              Total<br />Customers
            </span>
          </div>
          <Icons.ChevronRight size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
        </div>

        <div className="my-3 sm:my-4">
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            {typeof totalCustomers === 'number' ? totalCustomers.toLocaleString('en-IN') : totalCustomers}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400">
            ↑ {totalCustomersGrowth}%
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
            vs prev period
          </span>
        </div>
      </div>

      {/* 2. Total Receivables */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateReceivables}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigateReceivables();
          }
        }}
        className="group relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <TotalReceivables3D />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
              Total<br />Receivables
            </span>
          </div>
          <Icons.ChevronRight size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-rose-600 dark:group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
        </div>

        <div className="my-3 sm:my-4">
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            {totalReceivables}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400">
            ↑ {totalReceivablesGrowth}%
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
            vs prev period
          </span>
        </div>
      </div>

      {/* 3. Overdue Accounts */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateOverdue}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigateOverdue();
          }
        }}
        className="group relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <OverdueAccounts3D />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
              Overdue<br />Accounts
            </span>
          </div>
          <Icons.ChevronRight size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
        </div>

        <div className="my-3 sm:my-4">
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            {typeof overdueAccounts === 'number' ? overdueAccounts.toLocaleString('en-IN') : overdueAccounts}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/60 text-rose-600 dark:text-rose-400">
            ↑ {overdueGrowth}%
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
            vs prev period
          </span>
        </div>
      </div>

      {/* 4. Cleared Accounts */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNavigateCleared}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigateCleared();
          }
        }}
        className="group relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <ClearedAccounts3D />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
              Cleared<br />Accounts
            </span>
          </div>
          <Icons.ChevronRight size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
        </div>

        <div className="my-3 sm:my-4">
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            {typeof clearedAccounts === 'number' ? clearedAccounts.toLocaleString('en-IN') : clearedAccounts}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400">
            ↑ {clearedGrowth}%
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
            vs prev period
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomerKpiCards;

