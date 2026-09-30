import React from 'react';
import { Icons } from '../../lib/icons';

interface PaymentsKpiCardsProps {
  totalReceivables: string;
  receivablesCaption?: string;
  dueThisWeek: string;
  dueThisWeekCaption?: string;
  criticalAmount: string;
  criticalCaption?: string;
  collectedThisMonth: string;
  collectedCaption?: string;
}

/* =========================================================================
   3D Claymorphic Vector SVGs matching exactly the user's reference mockup
   ========================================================================= */

// 1. Total Receivables (3D Green Wallet + Green Paper Bills + Gold Rupee Coin)
export const TotalReceivablesWallet3D = () => (
  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        {/* Ambient Glow */}
        <radialGradient id="walGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0" />
        </radialGradient>

        {/* Paper Money Green */}
        <linearGradient id="walBill1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>
        <linearGradient id="walBill2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>

        {/* Wallet Body Claymorphic Green Gradient */}
        <linearGradient id="walBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="40%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="walFlapGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Gold Coin Radial Gradient */}
        <radialGradient id="walCoinGold" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="35%" stopColor="#FBBF24" />
          <stop offset="75%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
      </defs>

      {/* Background Soft Glow */}
      <circle cx="60" cy="62" r="50" fill="url(#walGlow)" />

      {/* Radiating Green Sparkles Top-Right */}
      <path d="M96 28L100 24" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
      <path d="M90 20L92 14" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
      <path d="M104 36L110 38" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />

      {/* Paper Cash Banknotes sticking up */}
      {/* Back bill (tilted left) */}
      <rect
        x="36"
        y="24"
        width="34"
        height="26"
        rx="4"
        fill="url(#walBill1)"
        transform="rotate(-14 36 24)"
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
      />
      <circle cx="48" cy="34" r="4" fill="#BBF7D0" opacity="0.6" transform="rotate(-14 48 34)" />

      {/* Front bill (tilted right) */}
      <rect
        x="52"
        y="20"
        width="36"
        height="28"
        rx="4"
        fill="url(#walBill2)"
        transform="rotate(8 52 20)"
        filter="drop-shadow(0 3px 6px rgba(0,0,0,0.12))"
      />
      <circle cx="70" cy="32" r="4.5" fill="#DCFCE7" opacity="0.7" transform="rotate(8 70 32)" />

      {/* 3D Green Leather Wallet Body */}
      <g filter="drop-shadow(0 10px 18px rgba(5,150,105,0.38))">
        {/* Back Wallet Shell */}
        <rect x="22" y="38" width="66" height="52" rx="16" fill="#047857" />

        {/* Main Front Wallet Pouch */}
        <rect x="22" y="42" width="66" height="48" rx="16" fill="url(#walBodyGrad)" />

        {/* Gloss highlight on top curve */}
        <path
          d="M26 54C26 46 32 44 42 44H68C78 44 84 46 84 54C84 48 76 46 68 46H42C34 46 26 48 26 54Z"
          fill="#FFFFFF"
          opacity="0.45"
        />

        {/* Pocket Seam Stitch Line */}
        <rect x="26" y="48" width="58" height="38" rx="12" stroke="#047857" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" fill="none" />

        {/* Flap Catch Button on Left */}
        <circle cx="80" cy="64" r="5" fill="#E2E8F0" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))" />
        <circle cx="80" cy="64" r="2.5" fill="#94A3B8" />
      </g>

      {/* 3D Shiny Golden Rupee Coin Leaning on Lower Right */}
      <g filter="drop-shadow(0 6px 12px rgba(217,119,6,0.45))">
        <circle cx="84" cy="74" r="16" fill="url(#walCoinGold)" />
        {/* Inner Coin Rim */}
        <circle cx="84" cy="74" r="13" stroke="#FEF08A" strokeWidth="1.5" opacity="0.8" fill="none" />
        
        {/* ₹ Rupee Symbol */}
        <path
          d="M79 67H89M79 71H88M79 67V81M83 71C87 71 88 74 86 77C84 79 81 79 81 79L88 83"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
        />

        {/* Coin Specular Highlight */}
        <ellipse cx="80" cy="65" rx="5" ry="2" fill="#FFFFFF" opacity="0.6" transform="rotate(-30 80 65)" />
      </g>
    </svg>
  </div>
);

// 2. Due This Week (3D Desk Calendar + 3D Royal Blue Clock)
export const DueThisWeekCalendar3D = () => (
  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        {/* Ambient Glow */}
        <radialGradient id="calGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>

        {/* Orange Header Gradient */}
        <linearGradient id="calHeader" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        {/* Calendar Body Soft Gradient */}
        <linearGradient id="calBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>

        {/* Royal Blue Clock Radial Gradient */}
        <radialGradient id="clkSphere" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="35%" stopColor="#3B82F6" />
          <stop offset="75%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </radialGradient>
      </defs>

      {/* Ambient Yellow Glow */}
      <circle cx="60" cy="60" r="50" fill="url(#calGlow)" />

      {/* Orange Sparks Radiating Top-Right */}
      <path d="M88 18L92 14" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <path d="M100 22L106 20" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <path d="M82 12L80 6" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />

      {/* 3D Calendar Main Base */}
      <g filter="drop-shadow(0 10px 18px rgba(234,88,12,0.32))">
        {/* White Calendar Block */}
        <rect x="26" y="32" width="64" height="60" rx="16" fill="url(#calBody)" />

        {/* Orange Top Binder Bar */}
        <path
          d="M26 44C26 37.3726 31.3726 32 38 32H78C84.6274 32 90 37.3726 90 44V48H26V44Z"
          fill="url(#calHeader)"
        />

        {/* 3D Binder Spiral Rings */}
        <rect x="36" y="24" width="6" height="14" rx="3" fill="#E2E8F0" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))" />
        <rect x="38" y="26" width="2" height="10" rx="1" fill="#FFFFFF" />

        <rect x="55" y="24" width="6" height="14" rx="3" fill="#E2E8F0" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))" />
        <rect x="57" y="26" width="2" height="10" rx="1" fill="#FFFFFF" />

        <rect x="74" y="24" width="6" height="14" rx="3" fill="#E2E8F0" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))" />
        <rect x="76" y="26" width="2" height="10" rx="1" fill="#FFFFFF" />

        {/* Calendar Grid Date Marks */}
        {/* Row 1 */}
        <rect x="35" y="56" width="8" height="6" rx="2" fill="#93C5FD" />
        <rect x="49" y="56" width="8" height="6" rx="2" fill="#93C5FD" />
        <rect x="63" y="56" width="8" height="6" rx="2" fill="#93C5FD" />
        {/* Row 2 */}
        <rect x="35" y="67" width="8" height="6" rx="2" fill="#93C5FD" />
        <rect x="49" y="67" width="8" height="6" rx="2" fill="#3B82F6" />
        <rect x="63" y="67" width="8" height="6" rx="2" fill="#93C5FD" />
        {/* Row 3 */}
        <rect x="35" y="78" width="8" height="6" rx="2" fill="#CBD5E1" />
        <rect x="49" y="78" width="8" height="6" rx="2" fill="#CBD5E1" />
      </g>

      {/* 3D Royal Blue Round Clock (Overlapping Bottom Right) */}
      <g filter="drop-shadow(0 8px 16px rgba(29,78,216,0.45))">
        {/* Outer Clock Casing */}
        <circle cx="82" cy="74" r="18" fill="url(#clkSphere)" />

        {/* Clock Bezel Ring */}
        <circle cx="82" cy="74" r="14.5" fill="#FFFFFF" />

        {/* Clock Inner Yellow/Gold Hands */}
        <path d="M82 74V65" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M82 74L90 74" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="82" cy="74" r="2.5" fill="#D97706" />

        {/* Clock Specular Highlight */}
        <ellipse cx="76" cy="64" rx="6" ry="2.5" fill="#FFFFFF" opacity="0.6" transform="rotate(-30 76 64)" />
      </g>
    </svg>
  </div>
);

// 3. Critical Overdue (3D Hot Magenta/Pink Warning Triangle with Exclamation)
export const CriticalOverdueAlert3D = () => (
  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        {/* Ambient Glow */}
        <radialGradient id="critGlowPink" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FCE7F3" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FCE7F3" stopOpacity="0" />
        </radialGradient>

        {/* Soft Lavender / Pink Orb Base */}
        <radialGradient id="critBaseOrb" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FDF4FF" />
          <stop offset="60%" stopColor="#F5D0FE" />
          <stop offset="100%" stopColor="#E879F9" />
        </radialGradient>

        {/* Hot Magenta Triangle Prism */}
        <radialGradient id="critTriangleGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="35%" stopColor="#EC4899" />
          <stop offset="75%" stopColor="#DB2777" />
          <stop offset="100%" stopColor="#9D174D" />
        </radialGradient>
      </defs>

      {/* Ambient Pink Glow */}
      <circle cx="60" cy="62" r="50" fill="url(#critGlowPink)" />

      {/* Action Streaks Top-Right */}
      <path d="M88 28L94 24" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" />
      <path d="M96 36L102 36" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" />
      <path d="M84 20L86 14" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" />

      {/* Soft Base Orb */}
      <ellipse cx="46" cy="76" rx="28" ry="18" fill="url(#critBaseOrb)" opacity="0.65" filter="drop-shadow(0 4px 10px rgba(236,72,153,0.2))" />

      {/* 3D Hot Magenta Warning Triangle */}
      <g filter="drop-shadow(0 12px 22px rgba(219,39,119,0.48))">
        {/* Rounded Triangle Path */}
        <path
          d="M58 24C60.5 19.5 67 19.5 69.5 24L99 76C101.5 80.5 98.2 86 93 86H34.5C29.3 86 26 80.5 28.5 76L58 24Z"
          fill="url(#critTriangleGrad)"
        />

        {/* Top Edge Specular Ridge */}
        <path
          d="M62 26L34 76"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* 3D Bold White Exclamation Mark */}
        <path
          d="M64 42V60"
          stroke="#FFFFFF"
          strokeWidth="6.5"
          strokeLinecap="round"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
        />
        <circle
          cx="64"
          cy="72"
          r="4"
          fill="#FFFFFF"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
        />

        {/* Top Specular Pill */}
        <ellipse cx="61" cy="30" rx="4" ry="2" fill="#FFFFFF" opacity="0.6" transform="rotate(-15 61 30)" />
      </g>
    </svg>
  </div>
);

// 4. Collected This Month (3D Blue Classical Bank Building + Green Checkmark Badge)
export const CollectedBank3D = () => (
  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        {/* Ambient Glow */}
        <radialGradient id="bnkGlowCyan" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#CCFBF1" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#CCFBF1" stopOpacity="0" />
        </radialGradient>

        {/* Bank Cyan/Blue Gradient */}
        <linearGradient id="bnkRoofGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        <linearGradient id="bnkPillarGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="50%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        {/* Green Checkmark Badge Radial */}
        <radialGradient id="chkBadgeGrn" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="35%" stopColor="#22C55E" />
          <stop offset="75%" stopColor="#16A34A" />
          <stop offset="100%" stopColor="#15803D" />
        </radialGradient>
      </defs>

      {/* Ambient Cyan Glow */}
      <circle cx="60" cy="60" r="50" fill="url(#bnkGlowCyan)" />

      {/* Sparkles Top-Right */}
      <path d="M88 22L92 17" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
      <path d="M98 28L104 28" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
      <path d="M80 16L78 10" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />

      {/* 3D Bank Building */}
      <g filter="drop-shadow(0 10px 18px rgba(2,132,199,0.38))">
        {/* Triangular Pediment / Roof */}
        <path
          d="M24 44L60 22L96 44H24Z"
          fill="url(#bnkRoofGrad)"
        />
        {/* Roof Base Architrave */}
        <rect x="20" y="44" width="80" height="7" rx="3" fill="#0284C7" />
        <rect x="22" y="45" width="76" height="2" fill="#BAE6FD" opacity="0.6" />

        {/* 3 Cylindrical Columns */}
        {/* Left Column */}
        <rect x="28" y="51" width="10" height="28" rx="3" fill="url(#bnkPillarGrad)" />
        <rect x="26" y="51" width="14" height="3" rx="1.5" fill="#0284C7" />
        <rect x="26" y="76" width="14" height="3" rx="1.5" fill="#0284C7" />

        {/* Middle Column */}
        <rect x="55" y="51" width="10" height="28" rx="3" fill="url(#bnkPillarGrad)" />
        <rect x="53" y="51" width="14" height="3" rx="1.5" fill="#0284C7" />
        <rect x="53" y="76" width="14" height="3" rx="1.5" fill="#0284C7" />

        {/* Right Column */}
        <rect x="82" y="51" width="10" height="28" rx="3" fill="url(#bnkPillarGrad)" />
        <rect x="80" y="51" width="14" height="3" rx="1.5" fill="#0284C7" />
        <rect x="80" y="76" width="14" height="3" rx="1.5" fill="#0284C7" />

        {/* Plinth Base Steps */}
        <rect x="18" y="79" width="84" height="6" rx="2" fill="#0284C7" />
        <rect x="14" y="85" width="92" height="7" rx="3" fill="#0369A1" />
      </g>

      {/* 3D Green Checkmark Badge Overlapping Lower Right */}
      <g filter="drop-shadow(0 8px 16px rgba(22,163,74,0.48))">
        <circle cx="86" cy="76" r="17" fill="url(#chkBadgeGrn)" />
        <circle cx="86" cy="76" r="13.5" stroke="#BBF7D0" strokeWidth="1.5" opacity="0.65" fill="none" />

        {/* White Checkmark */}
        <path
          d="M78 76L83.5 81.5L94 71"
          stroke="#FFFFFF"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0 1px 3px rgba(0,0,0,0.25))"
        />

        {/* Badge Specular Highlight */}
        <ellipse cx="82" cy="67" rx="5" ry="2" fill="#FFFFFF" opacity="0.6" transform="rotate(-25 82 67)" />
      </g>
    </svg>
  </div>
);

/* =========================================================================
   Main Component: PaymentsKpiCards
   ========================================================================= */
export const PaymentsKpiCards: React.FC<PaymentsKpiCardsProps> = ({
  totalReceivables,
  receivablesCaption = 'Across 5 active wholesale stores',
  dueThisWeek,
  dueThisWeekCaption = 'Current billing cycle commitments',
  criticalAmount,
  criticalCaption = 'Priority collection reminder queue',
  collectedThisMonth,
  collectedCaption = 'MTD bank verified realizations',
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {/* 1. Total Receivables */}
      <div className="group relative rounded-2xl p-5 sm:p-6 flex items-center gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-emerald-100/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none">
        <TotalReceivablesWallet3D />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block truncate">
              Total Receivables
            </span>
            <span className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
              <Icons.ChevronRight size={15} strokeWidth={2.5} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-400 mt-0.5 font-sans">
            {totalReceivables}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate">
            {receivablesCaption}
          </p>
        </div>
      </div>

      {/* 2. Due This Week */}
      <div className="group relative rounded-2xl p-5 sm:p-6 flex items-center gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-amber-100/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none">
        <DueThisWeekCalendar3D />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block truncate">
              Due This Week
            </span>
            <span className="w-7 h-7 rounded-full flex items-center justify-center bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-all shrink-0">
              <Icons.ChevronRight size={15} strokeWidth={2.5} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400 mt-0.5 font-sans">
            {dueThisWeek}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate">
            {dueThisWeekCaption}
          </p>
        </div>
      </div>

      {/* 3. Critical (<= 30 Days / > 30 Days) */}
      <div className="group relative rounded-2xl p-5 sm:p-6 flex items-center gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-pink-100/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none">
        <CriticalOverdueAlert3D />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block truncate">
              Critical (≤ 30 Days)
            </span>
            <span className="w-7 h-7 rounded-full flex items-center justify-center bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all shrink-0">
              <Icons.ChevronRight size={15} strokeWidth={2.5} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-purple-700 dark:text-purple-400 mt-0.5 font-sans">
            {criticalAmount}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate">
            {criticalCaption}
          </p>
        </div>
      </div>

      {/* 4. Collected This Month */}
      <div className="group relative rounded-2xl p-5 sm:p-6 flex items-center gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-teal-100/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none">
        <CollectedBank3D />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block truncate">
              Collected (This Month)
            </span>
            <span className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
              <Icons.ChevronRight size={15} strokeWidth={2.5} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-400 mt-0.5 font-sans">
            {collectedThisMonth}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate">
            {collectedCaption}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentsKpiCards;
