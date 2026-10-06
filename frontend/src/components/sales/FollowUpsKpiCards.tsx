import React from 'react';

interface FollowUpsKpiCardsProps {
  totalScheduledCount: number;
  pendingCount: number;
  completedCount: number;
  priorityCount: number;
}

/* =========================================================================
   3D Claymorphic Vector SVGs for Follow-ups & Buyer Reminders
   ========================================================================= */

// 1. Total Scheduled (3D Blue Desk Calendar + Checkmarks + Blue Check Seal)
export const ScheduledTasks3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="schedGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="calHeaderBlue" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="sealBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#schedGlow)" />

      {/* Sparkles */}
      <path d="M22 36L17 31" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 26L22 20" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />

      {/* 3D Calendar Body */}
      <g filter="drop-shadow(0 6px 10px rgba(37,99,235,0.35))">
        {/* Main Base Card */}
        <rect x="22" y="28" width="56" height="52" rx="10" fill="#FFFFFF" stroke="#BFDBFE" strokeWidth="2" />
        {/* Blue Header Ribbon */}
        <path d="M22 38C22 32.4772 26.4772 28 32 28H68C73.5228 28 78 32.4772 78 38V42H22V38Z" fill="url(#calHeaderBlue)" />

        {/* Binder Rings */}
        <rect x="32" y="22" width="6" height="12" rx="3" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5" />
        <rect x="62" y="22" width="6" height="12" rx="3" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5" />

        {/* Mini Checkmarks on Days */}
        <path d="M30 52L33 55L38 49" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M44 52L47 55L52 49" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M58 52L61 55L66 49" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M30 64L33 67L38 61" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M44 64L47 67L52 61" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* 3D Blue Checkmark Badge on Bottom-Right */}
      <g filter="drop-shadow(0 4px 6px rgba(37,99,235,0.4))">
        <circle cx="74" cy="72" r="12" fill="url(#sealBlue)" stroke="#FFFFFF" strokeWidth="2.5" />
        <path d="M69 72L72 75L79 68" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  </div>
);

// 2. Pending Action (3D Glass Hourglass + Checklist Card with Orange Plus)
export const PendingAction3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="actGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sandGoldAct" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#EAB308" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#actGlow)" />

      {/* Sparkles */}
      <path d="M78 26L83 22" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M84 34H89" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

      {/* 3D Glass Hourglass on Left */}
      <g filter="drop-shadow(0 6px 10px rgba(217,119,6,0.35))">
        <rect x="22" y="24" width="30" height="6" rx="3" fill="#3B82F6" stroke="#93C5FD" strokeWidth="1" />
        <rect x="22" y="70" width="30" height="6" rx="3" fill="#3B82F6" stroke="#93C5FD" strokeWidth="1" />
        {/* Glass Body */}
        <path
          d="M26 30C26 42 35 46 37 50C35 54 26 58 26 70H48C48 58 39 54 37 50C39 46 48 42 48 30H26Z"
          fill="#EFF6FF"
          fillOpacity="0.75"
          stroke="#BFDBFE"
          strokeWidth="1.5"
        />
        {/* Golden Sand */}
        <path d="M29 33C29 40 35 44 37 46C39 44 45 40 45 33H29Z" fill="url(#sandGoldAct)" />
        <line x1="37" y1="46" x2="37" y2="62" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 1" />
        <path d="M30 68C30 63 34 60 37 60C40 60 44 63 44 68H30Z" fill="url(#sandGoldAct)" />
      </g>

      {/* 3D Mini Task Card with Checklist on Right */}
      <g filter="drop-shadow(0 4px 7px rgba(0,0,0,0.12))">
        <rect x="52" y="38" width="34" height="42" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <circle cx="58" cy="48" r="2" fill="#3B82F6" />
        <line x1="63" y1="48" x2="78" y2="48" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="58" cy="56" r="2" fill="#3B82F6" />
        <line x1="63" y1="56" x2="75" y2="56" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="58" cy="64" r="2" fill="#3B82F6" />
        <line x1="63" y1="64" x2="72" y2="64" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Orange Plus Badge on Card */}
      <g filter="drop-shadow(0 3px 5px rgba(249,115,22,0.4))">
        <circle cx="82" cy="74" r="9" fill="#F97316" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M82 70V78M78 74H86" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

// 3. Completed (3D Glossy Emerald Checkmark Seal / Disc)
export const CompletedSeal3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="compGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="compOuter" x1="30" y1="16" x2="70" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="45%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <radialGradient id="compDome" cx="42%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="40%" stopColor="#34D399" />
          <stop offset="85%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#compGlow)" />

      {/* Golden Sparkles */}
      <path d="M78 24L83 19" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M84 32H89" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 68L17 73" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

      {/* 3D Green Disc Seal */}
      <g filter="drop-shadow(0 8px 12px rgba(4,120,87,0.35))">
        {/* Outer Beveled Rim */}
        <circle cx="50" cy="52" r="28" fill="url(#compOuter)" />
        {/* Inner Dome */}
        <circle cx="50" cy="52" r="23" fill="url(#compDome)" />

        {/* Specular Rim Arc */}
        <path
          d="M32 40C36 33 43 29 50 29C57 29 64 33 68 40"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.55"
        />

        {/* White Checkmark */}
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

// 4. Priority Reminders (3D Red Alert Bell + Exclamation Badge + Sparkles)
export const PriorityAlertBell3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="prioGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE4E6" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFE4E6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bellRedGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="40%" stopColor="#FB7185" />
          <stop offset="85%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#E11D48" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="52" r="38" fill="url(#prioGlow)" />

      {/* Red Sparkles */}
      <path d="M78 24L83 20" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M84 32H89" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />

      {/* 3D Red Alert Bell */}
      <g filter="drop-shadow(0 6px 10px rgba(225,29,72,0.35))">
        {/* Top Loop */}
        <path d="M44 26C44 22 56 22 56 26" stroke="#BE123C" strokeWidth="3" strokeLinecap="round" />
        {/* Bell Dome */}
        <path
          d="M32 60C32 40 40 30 50 30C60 30 68 40 68 60C68 66 74 68 74 72H26C26 68 32 66 32 60Z"
          fill="url(#bellRedGrad)"
        />
        {/* Specular Highlight */}
        <path
          d="M38 42C41 36 45 33 50 33C54 33 58 35 61 39"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
        {/* Clapper */}
        <ellipse cx="50" cy="74" rx="7" ry="4" fill="#9F1239" />
      </g>

      {/* Red Exclamation Badge on Top Right */}
      <g filter="drop-shadow(0 3px 5px rgba(190,18,60,0.4))">
        <circle cx="74" cy="30" r="11" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2.5" />
        <line x1="74" y1="24" x2="74" y2="31" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <circle cx="74" cy="36" r="1.5" fill="#FFFFFF" />
      </g>
    </svg>
  </div>
);

/* =========================================================================
   Follow-ups KPI Cards Component
   ========================================================================= */

export const FollowUpsKpiCards: React.FC<FollowUpsKpiCardsProps> = ({
  totalScheduledCount,
  pendingCount,
  completedCount,
  priorityCount,
}) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-3.5 sm:gap-4 md:gap-5">
      {/* 1. Total Scheduled */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <ScheduledTasks3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-slate-300 block truncate" title="Total Scheduled">
            Total Scheduled
          </span>
          <p
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5 font-display wrap-anywhere"
            title={String(totalScheduledCount)}
          >
            <span className="tabular-nums">{totalScheduledCount}</span>
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="Scheduled tasks">
            Scheduled tasks
          </p>
        </div>
      </div>

      {/* 2. Pending Action */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <PendingAction3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-slate-300 block truncate" title="Pending Action">
            Pending Action
          </span>
          <p
            className="text-xl sm:text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 mt-0.5 font-display wrap-anywhere"
            title={String(pendingCount)}
          >
            <span className="tabular-nums">{pendingCount}</span>
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="Awaiting completion">
            Awaiting completion
          </p>
        </div>
      </div>

      {/* 3. Completed */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <CompletedSeal3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-slate-300 block truncate" title="Completed">
            Completed
          </span>
          <p
            className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5 font-display wrap-anywhere"
            title={String(completedCount)}
          >
            <span className="tabular-nums">{completedCount}</span>
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="Closed reminders">
            Closed reminders
          </p>
        </div>
      </div>

      {/* 4. Priority Reminders */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <PriorityAlertBell3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-medium text-slate-600 dark:text-slate-300 block truncate" title="Priority Reminders">
            Priority Reminders
          </span>
          <p
            className="text-xl sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 mt-0.5 font-display wrap-anywhere"
            title={String(priorityCount)}
          >
            <span className="tabular-nums">{priorityCount}</span>
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title="High financial impact">
            High financial impact
          </p>
        </div>
      </div>
    </div>
  );
};

export default FollowUpsKpiCards;
