import React from 'react';

/* =========================================================================
   3D Claymorphic Vector SVGs for Follow-up Reminders & Commitments
   ========================================================================= */

// 1. Reminders: 3D Blue Desk Calendar with Checkmark Badge
const FollowUpCalendar3D = () => (
  <svg viewBox="0 0 56 56" className="w-full h-full select-none drop-shadow-sm" fill="none">
    <defs>
      <linearGradient id="fuCalHeader" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="fuCalSheet" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#EFF6FF" />
      </linearGradient>
      <linearGradient id="fuCalBadge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="50%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="fuCalRing" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="50%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    {/* Ambient shadow */}
    <ellipse cx="28" cy="48" rx="18" ry="4" fill="#1E3A8A" fillOpacity="0.22" />

    {/* Calendar 3D Bevel Thickness */}
    <rect x="10" y="14" width="36" height="32" rx="7" fill="#1E40AF" />

    {/* Calendar Main Sheet Front Face */}
    <rect x="10" y="12" width="36" height="32" rx="7" fill="url(#fuCalSheet)" stroke="#DBEAFE" strokeWidth="1" />

    {/* Calendar Top Header Ribbon */}
    <path
      d="M10 19C10 15.134 13.134 12 17 12H39C42.866 12 46 15.134 46 19V22H10V19Z"
      fill="url(#fuCalHeader)"
    />

    {/* Spiral Binding Rings */}
    <rect x="16" y="9" width="3" height="6.5" rx="1.5" fill="url(#fuCalRing)" />
    <rect x="26.5" y="9" width="3" height="6.5" rx="1.5" fill="url(#fuCalRing)" />
    <rect x="37" y="9" width="3" height="6.5" rx="1.5" fill="url(#fuCalRing)" />

    {/* Calendar Grid Date Dots */}
    <circle cx="17" cy="27" r="1.8" fill="#93C5FD" />
    <circle cx="23.5" cy="27" r="1.8" fill="#93C5FD" />
    <circle cx="30" cy="27" r="1.8" fill="#93C5FD" />
    <circle cx="36.5" cy="27" r="1.8" fill="#93C5FD" />

    <circle cx="17" cy="33" r="1.8" fill="#93C5FD" />
    <circle cx="23.5" cy="33" r="1.8" fill="#2563EB" />
    <circle cx="30" cy="33" r="1.8" fill="#93C5FD" />

    <circle cx="17" cy="39" r="1.8" fill="#93C5FD" />
    <circle cx="23.5" cy="39" r="1.8" fill="#93C5FD" />

    {/* Floating 3D Check Circle Badge */}
    <g transform="translate(30, 27)">
      <circle cx="12" cy="12" r="11" fill="url(#fuCalBadge)" filter="drop-shadow(0 3px 5px rgba(29,78,216,0.4))" />
      <circle cx="12" cy="12" r="10" stroke="#93C5FD" strokeWidth="1" strokeOpacity="0.6" />
      {/* Gloss Highlight */}
      <ellipse cx="9.5" cy="7.5" rx="3.5" ry="1.5" fill="#FFFFFF" fillOpacity="0.55" transform="rotate(-25 9.5 7.5)" />
      {/* Bold White Checkmark */}
      <path d="M7.5 12l3 3 6-6" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

// 2. Pending Actions: 3D Amber Crystal Glass Hourglass with Flowing Sand
const FollowUpHourglass3D = () => (
  <svg viewBox="0 0 56 56" className="w-full h-full select-none drop-shadow-sm" fill="none">
    <defs>
      <linearGradient id="fuHgCap" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="50%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="fuHgGlass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.75" />
        <stop offset="50%" stopColor="#FDE68A" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.55" />
      </linearGradient>
      <linearGradient id="fuHgSand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    {/* Base shadow */}
    <ellipse cx="28" cy="48" rx="16" ry="4" fill="#B45309" fillOpacity="0.22" />

    {/* Top Cap Base & Plate */}
    <rect x="13" y="10" width="30" height="5.5" rx="2.5" fill="url(#fuHgCap)" stroke="#B45309" strokeWidth="0.8" />
    <ellipse cx="28" cy="11" rx="12" ry="2.2" fill="#FEF3C7" fillOpacity="0.8" />

    {/* Bottom Cap Base & Plate */}
    <rect x="13" y="41" width="30" height="5.5" rx="2.5" fill="url(#fuHgCap)" stroke="#B45309" strokeWidth="0.8" />
    <ellipse cx="28" cy="42" rx="12" ry="2.2" fill="#FEF3C7" fillOpacity="0.8" />

    {/* Supporting Side Pillars */}
    <rect x="14.5" y="14" width="2.5" height="28" rx="1.2" fill="#D97706" />
    <rect x="39" y="14" width="2.5" height="28" rx="1.2" fill="#D97706" />

    {/* Glass Bulb Body (Curved hourglass contour) */}
    <path
      d="M17 15C17 23 24 26 27 28C24 30 17 33 17 41H39C39 33 32 30 29 28C32 26 39 23 39 15H17Z"
      fill="url(#fuHgGlass)"
      stroke="#FDE68A"
      strokeWidth="1.2"
    />

    {/* Top Sand Chamber Funnel */}
    <path
      d="M18.5 18C18.5 22 25 24 27 27C29 24 35.5 22 35.5 18H18.5Z"
      fill="url(#fuHgSand)"
    />

    {/* Sand Flow Stream through neck */}
    <line x1="28" y1="26" x2="28" y2="36" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
    {/* Falling sand drops */}
    <circle cx="28" cy="30" r="1" fill="#FEF3C7" />
    <circle cx="28" cy="33" r="0.9" fill="#FDE68A" />

    {/* Bottom Sand Mound Heap */}
    <path
      d="M20 41C20 37 25 35 28 35C31 35 36 37 36 41H20Z"
      fill="url(#fuHgSand)"
    />

    {/* Curved Glass Specular Highlight Streaks */}
    <path
      d="M19 18C19 23 23 25 24 26"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeOpacity="0.8"
    />
    <path
      d="M19 38C19 34 23 32 24 30"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeOpacity="0.8"
    />
  </svg>
);

// 3. Completed: 3D Glossy Emerald Shield Orb with Checkmark
const FollowUpCheckCircle3D = () => (
  <svg viewBox="0 0 56 56" className="w-full h-full select-none drop-shadow-sm" fill="none">
    <defs>
      <radialGradient id="fuChkOrb" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#6EE7B7" />
        <stop offset="45%" stopColor="#10B981" />
        <stop offset="80%" stopColor="#059669" />
        <stop offset="100%" stopColor="#047857" />
      </radialGradient>
      <linearGradient id="fuChkRim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#A7F3D0" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    {/* Ambient shadow */}
    <ellipse cx="28" cy="48" rx="17" ry="4" fill="#047857" fillOpacity="0.25" />

    {/* Outer 3D Rim Ring */}
    <circle cx="28" cy="27" r="19" fill="none" stroke="url(#fuChkRim)" strokeWidth="2.5" />

    {/* Central 3D Spherical Core */}
    <circle
      cx="28"
      cy="27"
      r="17"
      fill="url(#fuChkOrb)"
      filter="drop-shadow(0 4px 7px rgba(4,120,87,0.38))"
    />

    {/* Specular curved gloss reflection */}
    <ellipse cx="23" cy="19" rx="6.5" ry="3.2" fill="#FFFFFF" fillOpacity="0.6" transform="rotate(-30 23 19)" />

    {/* Secondary bottom rim reflection */}
    <path
      d="M15 32C15 38 20 42 27 42"
      stroke="#A7F3D0"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeOpacity="0.5"
    />

    {/* 3D Checkmark Shadow */}
    <path
      d="M19 28.5L25 34.5L37 21.5"
      stroke="#064E3B"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.4"
    />
    {/* 3D Bold White Checkmark Face */}
    <path
      d="M19 27.5L25 33.5L37 20.5"
      stroke="#FFFFFF"
      strokeWidth="3.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 4. Priority Dues: 3D Vibrant Rose-Ruby Warning Prism with Exclamation
const FollowUpAlertTriangle3D = () => (
  <svg viewBox="0 0 56 56" className="w-full h-full select-none drop-shadow-sm" fill="none">
    <defs>
      <linearGradient id="fuAlertTri" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FB7185" />
        <stop offset="50%" stopColor="#F43F5E" />
        <stop offset="100%" stopColor="#BE123C" />
      </linearGradient>
      <linearGradient id="fuAlertInner" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#881337" />
        <stop offset="100%" stopColor="#4C0519" />
      </linearGradient>
    </defs>
    {/* Ambient shadow */}
    <ellipse cx="28" cy="48" rx="17" ry="4" fill="#9F1239" fillOpacity="0.25" />

    {/* Outer 3D Triangle Prism Body */}
    <path
      d="M24.5 12.8C26.1 10.1 30 10.1 31.5 12.8L47.2 40C48.8 42.7 46.8 46 43.7 46H12.3C9.2 46 7.2 42.7 8.8 40L24.5 12.8Z"
      fill="url(#fuAlertTri)"
      filter="drop-shadow(0 4px 8px rgba(190,18,60,0.35))"
      stroke="#FDA4AF"
      strokeWidth="1"
    />

    {/* Top Bevel Specular Reflection */}
    <path
      d="M25 15L12 39"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeOpacity="0.6"
    />

    {/* Inner Contrast Ruby Facet */}
    <path
      d="M25.5 17.5C26.6 15.6 29.4 15.6 30.5 17.5L42.5 39C43.6 41 42.1 43.5 39.9 43.5H16.1C13.9 43.5 12.4 41 13.5 39L25.5 17.5Z"
      fill="url(#fuAlertInner)"
    />

    {/* 3D Exclamation Stem */}
    <rect
      x="26.2"
      y="22"
      width="3.6"
      height="11"
      rx="1.8"
      fill="#FFFFFF"
      filter="drop-shadow(0 1px 3px rgba(255,255,255,0.4))"
    />

    {/* 3D Exclamation Dot */}
    <circle
      cx="28"
      cy="37.5"
      r="2.2"
      fill="#FFFFFF"
      filter="drop-shadow(0 1px 3px rgba(255,255,255,0.4))"
    />
  </svg>
);

/* =========================================================================
   Follow-ups 4 KPI Cards Row Component
   ========================================================================= */

interface FollowUpsKpiCardsProps {
  totalScheduledCount: number;
  pendingCount: number;
  completedCount: number;
  priorityCount: number;
}

export const FollowUpsKpiCards: React.FC<FollowUpsKpiCardsProps> = ({
  totalScheduledCount,
  pendingCount,
  completedCount,
  priorityCount,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
      {/* 1. Scheduled Reminders */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-950/30 hover:-translate-y-1 transform-gpu select-none overflow-hidden min-w-0">
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-500/10 dark:bg-blue-950/50 flex items-center justify-center shrink-0 p-1 sm:p-1.5 group-hover:scale-110 transition-transform duration-300">
          <FollowUpCalendar3D />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Reminders
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 font-display truncate">
              {totalScheduledCount}
            </span>
            <span className="text-xs sm:text-base font-semibold text-blue-600 dark:text-blue-400 hidden xs:inline">
              Tasks
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Calls planned
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
              Scheduled
            </span>
          </div>
        </div>
      </div>

      {/* 2. Pending Actions */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-amber-500/10 dark:hover:shadow-amber-950/30 hover:-translate-y-1 transform-gpu select-none overflow-hidden min-w-0">
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-500/10 dark:bg-amber-950/50 flex items-center justify-center shrink-0 p-1 sm:p-1.5 group-hover:scale-110 transition-transform duration-300">
          <FollowUpHourglass3D />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Pending Actions
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-amber-500 dark:text-amber-400 font-display truncate">
              {pendingCount}
            </span>
            <span className="text-xs sm:text-base font-semibold text-amber-500 dark:text-amber-400 hidden xs:inline">
              Calls
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Callbacks
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
              Due
            </span>
          </div>
        </div>
      </div>

      {/* 3. Completed Commitments */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-950/30 hover:-translate-y-1 transform-gpu select-none overflow-hidden min-w-0">
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/50 flex items-center justify-center shrink-0 p-1 sm:p-1.5 group-hover:scale-110 transition-transform duration-300">
          <FollowUpCheckCircle3D />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Completed
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-display truncate">
              {completedCount}
            </span>
            <span className="text-xs sm:text-base font-semibold text-emerald-600 dark:text-emerald-400 hidden xs:inline">
              Resolved
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Closed
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              Done
            </span>
          </div>
        </div>
      </div>

      {/* 4. Priority Dues */}
      <div className="group relative rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-xl hover:shadow-rose-500/10 dark:hover:shadow-rose-950/30 hover:-translate-y-1 transform-gpu select-none overflow-hidden min-w-0">
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-rose-500/10 dark:bg-rose-950/50 flex items-center justify-center shrink-0 p-1 sm:p-1.5 group-hover:scale-110 transition-transform duration-300">
          <FollowUpAlertTriangle3D />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <span className="text-[11px] sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
            Priority Dues
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 font-display truncate">
              {priorityCount}
            </span>
            <span className="text-xs sm:text-base font-semibold text-rose-600 dark:text-rose-400 hidden xs:inline">
              Urgent
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-0.5 text-xs">
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 truncate">
              Overdue
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
              Critical
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUpsKpiCards;
