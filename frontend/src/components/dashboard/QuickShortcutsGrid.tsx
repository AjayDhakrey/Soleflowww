import React from 'react';

interface QuickShortcutsGridProps {
  onBookOrder: () => void;
  onRecordPayment: () => void;
  onAddCustomer: () => void;
  onNewDesign: () => void;
  onShareLookbook: () => void;
  onGstLedger: () => void;
}

/* =========================================================================
   3D Claymorphic Shortcut Vector Illustrations
   ========================================================================= */

// 1. Book Order (3D Clipboard with Plus Badge & Sparkles)
const BookOrder3D = () => (
  <svg viewBox="0 0 120 100" className="w-14 h-11 sm:w-16 sm:h-13 drop-shadow-md select-none" fill="none">
    {/* Ambient Glow */}
    <circle cx="60" cy="50" r="38" fill="#DBEAFE" fillOpacity="0.6" filter="blur(8px)" />

    {/* Blue Clipboard Sheet */}
    <g transform="rotate(-4 60 50)">
      <rect x="26" y="16" width="54" height="70" rx="10" fill="url(#bookClipGrad)" stroke="#60A5FA" strokeWidth="2.5" />
      <rect x="32" y="24" width="42" height="56" rx="6" fill="#FFFFFF" fillOpacity="0.95" />
      
      {/* Clip on Top */}
      <rect x="42" y="10" width="22" height="10" rx="3" fill="#2563EB" />
      <rect x="46" y="6" width="14" height="7" rx="2" fill="#93C5FD" />
      <circle cx="53" cy="15" r="2.5" fill="#1E40AF" />

      {/* Blue Paper Text Lines */}
      <line x1="38" y1="36" x2="66" y2="36" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
      <line x1="38" y1="44" x2="58" y2="44" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="38" y1="52" x2="64" y2="52" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="60" x2="52" y2="60" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* Sparkle Dashes */}
    <line x1="88" y1="24" x2="94" y2="20" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
    <line x1="90" y1="34" x2="98" y2="32" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />

    {/* 3D Blue Circular Plus Badge on Bottom Right */}
    <circle cx="82" cy="68" r="16" fill="url(#plusGrad)" stroke="#FFFFFF" strokeWidth="2.5" filter="drop-shadow(0 4px 6px rgba(37,99,235,0.4))" />
    <line x1="82" y1="60" x2="82" y2="76" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="74" y1="68" x2="90" y2="68" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />

    <defs>
      <linearGradient id="bookClipGrad" x1="26" y1="16" x2="80" y2="86" gradientUnits="userSpaceOnUse">
        <stop stopColor="#93C5FD" />
        <stop offset="1" stopColor="#3B82F6" />
      </linearGradient>
      <linearGradient id="plusGrad" x1="66" y1="52" x2="98" y2="84" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
  </svg>
);

// 2. Record Payment (3D Coins Stack with Rupee and Green Arrow)
const RecordPayment3D = () => (
  <svg viewBox="0 0 120 100" className="w-14 h-11 sm:w-16 sm:h-13 drop-shadow-md select-none" fill="none">
    {/* Ambient Glow */}
    <circle cx="60" cy="50" r="38" fill="#D1FAE5" fillOpacity="0.6" filter="blur(8px)" />

    {/* Green Growth Arrow */}
    <path d="M68 46L88 22m0 0h-14m14 0v14" stroke="#10B981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 2px 4px rgba(16,185,129,0.3))" />

    {/* Gold Coins Stack */}
    <ellipse cx="44" cy="66" rx="20" ry="8" fill="#F59E0B" />
    <path d="M24 66v8c0 4.4 9 8 20 8s20-3.6 20-8v-8" fill="#D97706" />
    <ellipse cx="44" cy="66" rx="20" ry="8" fill="#FBBF24" />

    <ellipse cx="44" cy="54" rx="20" ry="8" fill="#F59E0B" />
    <path d="M24 54v8c0 4.4 9 8 20 8s20-3.6 20-8v-8" fill="#D97706" />
    <ellipse cx="44" cy="54" rx="20" ry="8" fill="#FCD34D" />

    <ellipse cx="44" cy="42" rx="20" ry="8" fill="#F59E0B" />
    <path d="M24 42v8c0 4.4 9 8 20 8s20-3.6 20-8v-8" fill="#D97706" />
    <ellipse cx="44" cy="42" rx="20" ry="8" fill="#FDE68A" />

    {/* Front Gold Rupee Coin */}
    <circle cx="74" cy="60" r="20" fill="url(#pmtGoldGrad)" stroke="#F59E0B" strokeWidth="2.5" filter="drop-shadow(0 4px 8px rgba(217,119,6,0.3))" />
    <circle cx="74" cy="60" r="16" fill="url(#pmtGoldInner)" />
    <text x="74" y="67" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#B45309" fontFamily="var(--font-sans)">₹</text>

    {/* Sparkles */}
    <path d="M22 34l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#FBBF24" />
    <path d="M96 52l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="#34D399" />

    <defs>
      <linearGradient id="pmtGoldGrad" x1="54" y1="40" x2="94" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A" />
        <stop offset="0.5" stopColor="#FBBF24" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="pmtGoldInner" x1="58" y1="44" x2="90" y2="76" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEF3C7" />
        <stop offset="1" stopColor="#FCD34D" />
      </linearGradient>
    </defs>
  </svg>
);

// 3. Add Customer (3D Purple Users Group with Plus Badge)
const AddCustomer3D = () => (
  <svg viewBox="0 0 120 100" className="w-14 h-11 sm:w-16 sm:h-13 drop-shadow-md select-none" fill="none">
    {/* Ambient Glow */}
    <circle cx="60" cy="50" r="38" fill="#F3E8FF" fillOpacity="0.7" filter="blur(8px)" />

    {/* Radial Sparkle Rays Top */}
    <line x1="60" y1="12" x2="60" y2="18" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="48" y1="16" x2="52" y2="21" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="72" y1="16" x2="68" y2="21" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" />

    {/* Left Secondary Avatar */}
    <circle cx="36" cy="42" r="10" fill="url(#purpleLightGrad)" />
    <path d="M22 66C22 56 30 52 36 52C42 52 50 56 50 66" fill="url(#purpleLightGrad)" />

    {/* Right Secondary Avatar */}
    <circle cx="84" cy="42" r="10" fill="url(#purpleLightGrad)" />
    <path d="M70 66C70 56 78 52 84 52C90 52 98 56 98 66" fill="url(#purpleLightGrad)" />

    {/* Center Primary Avatar */}
    <circle cx="60" cy="38" r="14" fill="url(#purpleMainGrad)" filter="drop-shadow(0 3px 6px rgba(147,51,234,0.3))" />
    <path d="M40 70C40 56 50 50 60 50C70 50 80 56 80 70" fill="url(#purpleMainGrad)" filter="drop-shadow(0 4px 6px rgba(147,51,234,0.25))" />

    {/* Purple Circular Plus Badge on Bottom Right */}
    <circle cx="82" cy="68" r="15" fill="url(#custPlusGrad)" stroke="#FFFFFF" strokeWidth="2.5" filter="drop-shadow(0 4px 6px rgba(147,51,234,0.4))" />
    <line x1="82" y1="61" x2="82" y2="75" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="75" y1="68" x2="89" y2="68" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />

    <defs>
      <linearGradient id="purpleLightGrad" x1="22" y1="32" x2="50" y2="66" gradientUnits="userSpaceOnUse">
        <stop stopColor="#DDD6FE" />
        <stop offset="1" stopColor="#A78BFA" />
      </linearGradient>
      <linearGradient id="purpleMainGrad" x1="40" y1="24" x2="80" y2="70" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C084FC" />
        <stop offset="1" stopColor="#7E22CE" />
      </linearGradient>
      <linearGradient id="custPlusGrad" x1="67" y1="53" x2="97" y2="83" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A855F7" />
        <stop offset="1" stopColor="#6B21A8" />
      </linearGradient>
    </defs>
  </svg>
);

// 4. New Design (3D Orange Sneaker + Palette Swatch + Pencil)
const NewDesign3D = () => (
  <svg viewBox="0 0 120 100" className="w-14 h-11 sm:w-16 sm:h-13 drop-shadow-md select-none" fill="none">
    {/* Ambient Glow */}
    <circle cx="60" cy="50" r="38" fill="#FFEDD5" fillOpacity="0.7" filter="blur(8px)" />

    {/* Palette Board in Background */}
    <rect x="52" y="16" width="36" height="42" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" transform="rotate(10 70 37)" filter="drop-shadow(0 3px 5px rgba(0,0,0,0.1))" />
    {/* Swatch color tiles */}
    <g transform="rotate(10 70 37)">
      <rect x="58" y="22" width="7" height="7" rx="1.5" fill="#EF4444" />
      <rect x="68" y="22" width="7" height="7" rx="1.5" fill="#F59E0B" />
      <rect x="78" y="22" width="7" height="7" rx="1.5" fill="#10B981" />
      <rect x="58" y="32" width="7" height="7" rx="1.5" fill="#3B82F6" />
      <rect x="68" y="32" width="7" height="7" rx="1.5" fill="#8B5CF6" />
      <rect x="78" y="32" width="7" height="7" rx="1.5" fill="#EC4899" />
    </g>

    {/* 3D Orange Sneaker Body */}
    <g filter="drop-shadow(0 4px 6px rgba(234,88,12,0.3))">
      {/* Sole */}
      <path d="M26 66C26 66 38 66 52 66C66 66 78 62 82 58C84 62 80 72 68 74C52 76 34 76 26 72C22 70 22 66 26 66Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
      {/* Upper Orange Body */}
      <path d="M30 66C30 54 44 44 54 42C60 40 64 46 68 50C74 50 80 54 82 58C78 62 66 66 52 66C38 66 30 66 30 66Z" fill="url(#shoeGrad)" />
      {/* Tongue & Collar */}
      <path d="M50 43C50 38 56 36 60 40C62 44 58 46 54 46Z" fill="#F97316" />
      {/* White Laces */}
      <line x1="46" y1="50" x2="56" y2="46" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <line x1="48" y1="56" x2="60" y2="52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <line x1="52" y1="61" x2="64" y2="57" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* Yellow Drafting Pencil on Front Right */}
    <g transform="rotate(-40 92 64)" filter="drop-shadow(0 3px 5px rgba(217,119,6,0.3))">
      <rect x="88" y="44" width="8" height="30" rx="1" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
      {/* Eraser */}
      <rect x="88" y="40" width="8" height="5" rx="1" fill="#F43F5E" />
      <rect x="88" y="44" width="8" height="2" fill="#E2E8F0" />
      {/* Pencil Tip */}
      <path d="M88 74L92 82L96 74Z" fill="#FDE68A" />
      <path d="M90 78L92 82L94 78Z" fill="#1E293B" />
    </g>

    {/* Sparkles */}
    <line x1="22" y1="44" x2="28" y2="40" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="18" y1="52" x2="24" y2="52" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />

    <defs>
      <linearGradient id="shoeGrad" x1="30" y1="42" x2="82" y2="66" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FB923C" />
        <stop offset="1" stopColor="#EA580C" />
      </linearGradient>
    </defs>
  </svg>
);

// 5. Share Lookbook (3D Tablet with Shoe Lookbook & Blue Share Nodes)
const ShareLookbook3D = () => (
  <svg viewBox="0 0 120 100" className="w-14 h-11 sm:w-16 sm:h-13 drop-shadow-md select-none" fill="none">
    {/* Ambient Glow */}
    <circle cx="60" cy="50" r="38" fill="#EFF6FF" fillOpacity="0.7" filter="blur(8px)" />

    {/* Tablet Base */}
    <g transform="rotate(-8 52 48)">
      <rect x="24" y="14" width="56" height="72" rx="8" fill="url(#tabletGrad)" stroke="#3B82F6" strokeWidth="2.5" filter="drop-shadow(0 4px 8px rgba(59,130,246,0.3))" />
      <rect x="30" y="22" width="44" height="56" rx="5" fill="#FFFFFF" />
      
      {/* Shoe Thumbnail on Screen */}
      <rect x="34" y="26" width="36" height="24" rx="3" fill="#EFF6FF" />
      {/* Mini Shoe Graphic */}
      <path d="M38 42C44 42 50 36 56 36C60 36 64 40 66 42H38Z" fill="#3B82F6" />
      <line x1="38" y1="44" x2="66" y2="44" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" />

      {/* Lookbook Specs Lines */}
      <line x1="36" y1="56" x2="64" y2="56" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="62" x2="54" y2="62" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="68" x2="60" y2="68" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* 3D Blue Share Nodes Icon on Front Right */}
    <g filter="drop-shadow(0 4px 6px rgba(37,99,235,0.4))">
      {/* Node Lines */}
      <line x1="72" y1="58" x2="88" y2="48" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
      <line x1="72" y1="58" x2="88" y2="68" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
      {/* Node Spheres */}
      <circle cx="72" cy="58" r="8" fill="url(#shareNodeGrad)" />
      <circle cx="88" cy="48" r="7" fill="url(#shareNodeGrad)" />
      <circle cx="88" cy="68" r="7" fill="url(#shareNodeGrad)" />
    </g>

    {/* Sparkles */}
    <line x1="94" y1="28" x2="100" y2="24" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="96" y1="36" x2="102" y2="36" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />

    <defs>
      <linearGradient id="tabletGrad" x1="24" y1="14" x2="80" y2="86" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="1" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="shareNodeGrad" x1="64" y1="40" x2="96" y2="76" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
  </svg>
);

// 6. GST Audit Ledger (3D Spiral Audit Book with Charts & GST Seal Badge)
const GstAuditLedger3D = () => (
  <svg viewBox="0 0 120 100" className="w-14 h-11 sm:w-16 sm:h-13 drop-shadow-md select-none" fill="none">
    {/* Ambient Glow */}
    <circle cx="60" cy="50" r="38" fill="#CCFBF1" fillOpacity="0.7" filter="blur(8px)" />

    {/* Spiral Notebook Base */}
    <g transform="rotate(-4 54 50)">
      <rect x="26" y="16" width="56" height="70" rx="8" fill="url(#gstBookGrad)" stroke="#14B8A6" strokeWidth="2.5" filter="drop-shadow(0 4px 8px rgba(20,184,166,0.3))" />
      <rect x="34" y="22" width="44" height="58" rx="5" fill="#FFFFFF" fillOpacity="0.95" />

      {/* Spiral Wire Rings */}
      <circle cx="28" cy="28" r="3" fill="#0D9488" />
      <circle cx="28" cy="40" r="3" fill="#0D9488" />
      <circle cx="28" cy="52" r="3" fill="#0D9488" />
      <circle cx="28" cy="64" r="3" fill="#0D9488" />
      <circle cx="28" cy="74" r="3" fill="#0D9488" />

      {/* Bar Chart Illustration on Cover */}
      <rect x="42" y="52" width="6" height="18" rx="2" fill="#2DD4BF" />
      <rect x="52" y="42" width="6" height="28" rx="2" fill="#0D9488" />
      <rect x="62" y="34" width="6" height="36" rx="2" fill="#042F2E" />

      {/* Ledger Lines */}
      <line x1="42" y1="30" x2="68" y2="30" stroke="#99F6E4" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* 3D Teal Circular GST Badge on Bottom Right */}
    <circle cx="82" cy="68" r="16" fill="url(#gstBadgeGrad)" stroke="#FFFFFF" strokeWidth="2.5" filter="drop-shadow(0 4px 6px rgba(13,148,136,0.4))" />
    <text x="82" y="73" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#FFFFFF" fontFamily="var(--font-sans)" letterSpacing="0.5">GST</text>

    {/* Sparkles */}
    <line x1="90" y1="24" x2="96" y2="20" stroke="#14B8A6" strokeWidth="3" strokeLinecap="round" />
    <line x1="92" y1="34" x2="100" y2="32" stroke="#14B8A6" strokeWidth="3" strokeLinecap="round" />

    <defs>
      <linearGradient id="gstBookGrad" x1="26" y1="16" x2="82" y2="86" gradientUnits="userSpaceOnUse">
        <stop stopColor="#5EEAD4" />
        <stop offset="1" stopColor="#0D9488" />
      </linearGradient>
      <linearGradient id="gstBadgeGrad" x1="66" y1="52" x2="98" y2="84" gradientUnits="userSpaceOnUse">
        <stop stopColor="#14B8A6" />
        <stop offset="1" stopColor="#0F766E" />
      </linearGradient>
    </defs>
  </svg>
);

/* =========================================================================
   Quick Operational Shortcuts Grid Component
   ========================================================================= */

export const QuickShortcutsGrid: React.FC<QuickShortcutsGridProps> = ({
  onBookOrder,
  onRecordPayment,
  onAddCustomer,
  onNewDesign,
  onShareLookbook,
  onGstLedger,
}) => {
  return (
    <div className="rounded-2xl border border-border/80 bg-border/60 dark:bg-border/40 overflow-hidden shadow-2xs grid grid-cols-[repeat(auto-fit,minmax(min(100%,9.5rem),1fr))] gap-px">
      {/* 1. Book Order */}
      <button
        type="button"
        onClick={onBookOrder}
        className="group relative p-3 sm:p-3.5 flex flex-col items-center justify-between text-center transition-colors duration-150 cursor-pointer bg-surface hover:bg-muted/40 dark:hover:bg-muted/20 select-none overflow-hidden min-w-0"
      >
        <div className="mb-1.5 flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
          <BookOrder3D />
        </div>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight mt-0.5">
          Book Order
        </span>
      </button>

      {/* 2. Record Payment */}
      <button
        type="button"
        onClick={onRecordPayment}
        className="group relative p-3 sm:p-3.5 flex flex-col items-center justify-between text-center transition-colors duration-150 cursor-pointer bg-surface hover:bg-muted/40 dark:hover:bg-muted/20 select-none overflow-hidden min-w-0"
      >
        <div className="mb-1.5 flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
          <RecordPayment3D />
        </div>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight mt-0.5">
          Record Payment
        </span>
      </button>

      {/* 3. Add Customer */}
      <button
        type="button"
        onClick={onAddCustomer}
        className="group relative p-3 sm:p-3.5 flex flex-col items-center justify-between text-center transition-colors duration-150 cursor-pointer bg-surface hover:bg-muted/40 dark:hover:bg-muted/20 select-none overflow-hidden min-w-0"
      >
        <div className="mb-1.5 flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
          <AddCustomer3D />
        </div>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors tracking-tight mt-0.5">
          Add Customer
        </span>
      </button>

      {/* 4. New Design */}
      <button
        type="button"
        onClick={onNewDesign}
        className="group relative p-3 sm:p-3.5 flex flex-col items-center justify-between text-center transition-colors duration-150 cursor-pointer bg-surface hover:bg-muted/40 dark:hover:bg-muted/20 select-none overflow-hidden min-w-0"
      >
        <div className="mb-1.5 flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
          <NewDesign3D />
        </div>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors tracking-tight mt-0.5">
          New Design
        </span>
      </button>

      {/* 5. Share Lookbook */}
      <button
        type="button"
        onClick={onShareLookbook}
        className="group relative p-3 sm:p-3.5 flex flex-col items-center justify-between text-center transition-colors duration-150 cursor-pointer bg-surface hover:bg-muted/40 dark:hover:bg-muted/20 select-none overflow-hidden min-w-0"
      >
        <div className="mb-1.5 flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
          <ShareLookbook3D />
        </div>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight mt-0.5">
          Share Lookbook
        </span>
      </button>

      {/* 6. GST Tax Ledger */}
      <button
        type="button"
        onClick={onGstLedger}
        className="group relative p-3 sm:p-3.5 flex flex-col items-center justify-between text-center transition-colors duration-150 cursor-pointer bg-surface hover:bg-muted/40 dark:hover:bg-muted/20 select-none overflow-hidden min-w-0"
      >
        <div className="mb-1.5 flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
          <GstAuditLedger3D />
        </div>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors tracking-tight mt-0.5">
          GST Tax Ledger
        </span>
      </button>
    </div>
  );
};

export default QuickShortcutsGrid;
