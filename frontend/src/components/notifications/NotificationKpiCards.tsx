import React from 'react';

interface NotificationKpiCardsProps {
  totalCount: number;
  unreadCount: number;
  criticalCount?: number | string;
}

/* =========================================================================
   3D Claymorphic Vector SVGs for Notifications & Alerts
   ========================================================================= */

// 1. Total Notifications (3D Golden Bell with Red Badge & Sparkles)
export const BellNotification3D = ({ badgeCount = 0 }: { badgeCount?: number }) => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="bellGlowNav" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#CCFBF1" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#CCFBF1" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bellGoldGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="35%" stopColor="#FBBF24" />
          <stop offset="80%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
        <linearGradient id="bellClapperGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      {/* Backdrop Glow */}
      <circle cx="50" cy="52" r="38" fill="url(#bellGlowNav)" />

      {/* Green Sparkles */}
      <path d="M22 36L16 32" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 26L22 20" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

      {/* 3D Bell Body */}
      <g filter="drop-shadow(0 6px 10px rgba(217,119,6,0.35))">
        {/* Top Handle / Loop */}
        <path d="M44 26C44 22 56 22 56 26" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />

        {/* Bell Dome */}
        <path
          d="M32 60C32 40 40 30 50 30C60 30 68 40 68 60C68 66 74 68 74 72H26C26 68 32 66 32 60Z"
          fill="url(#bellGoldGrad)"
        />

        {/* Specular Highlight Arc */}
        <path
          d="M38 42C41 36 45 33 50 33C54 33 58 35 61 39"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />

        {/* Clapper / Bottom Ball */}
        <ellipse cx="50" cy="74" rx="7" ry="4" fill="url(#bellClapperGrad)" />
      </g>

      {/* Red Counter Badge on Top-Right */}
      {badgeCount > 0 && (
        <g filter="drop-shadow(0 3px 5px rgba(225,29,72,0.4))">
          <circle cx="74" cy="28" r="10" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2" />
          <text x="74" y="32" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFFFFF" fontFamily="var(--font-sans)">
            {badgeCount > 9 ? '9+' : badgeCount}
          </text>
        </g>
      )}
    </svg>
  </div>
);

// 2. Unread Alerts (3D Purple & Gold Sand Hourglass)
export const HourglassAlert3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="hourGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#CCFBF1" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#CCFBF1" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hourCapGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
        <radialGradient id="sandGold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#EAB308" />
        </radialGradient>
      </defs>

      {/* Backdrop Glow */}
      <circle cx="50" cy="52" r="38" fill="url(#hourGlow)" />

      {/* 3D Hourglass Body */}
      <g filter="drop-shadow(0 6px 10px rgba(79,70,229,0.35))">
        {/* Top & Bottom Indigo/Purple Caps */}
        <rect x="28" y="22" width="44" height="7" rx="3.5" fill="url(#hourCapGrad)" stroke="#A5B4FC" strokeWidth="1" />
        <rect x="28" y="73" width="44" height="7" rx="3.5" fill="url(#hourCapGrad)" stroke="#A5B4FC" strokeWidth="1" />

        {/* Glass Bulb Outline */}
        <path
          d="M34 29C34 42 45 47 48 51C45 55 34 60 34 73H66C66 60 55 55 52 51C55 47 66 42 66 29H34Z"
          fill="#E0E7FF"
          fillOpacity="0.75"
          stroke="#C7D2FE"
          strokeWidth="2"
        />

        {/* Golden Sand in Top Bulb */}
        <path d="M38 33C38 41 46 45 50 48C54 45 62 41 62 33H38Z" fill="url(#sandGold)" />

        {/* Falling Sand Stream */}
        <line x1="50" y1="48" x2="50" y2="65" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 1" />

        {/* Golden Sand Pile in Bottom Bulb */}
        <path d="M40 71C40 65 46 62 50 62C54 62 60 65 60 71H40Z" fill="url(#sandGold)" />

        {/* Specular Glint */}
        <path d="M37 34C37 40 42 44 45 47" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
      </g>
    </svg>
  </div>
);

// 3. Urgent Action Required (3D Coral / Red Warning Triangle with Rays)
export const UrgentWarning3D = () => (
  <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="urgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#CCFBF1" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#CCFBF1" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="urgTriOuter" x1="50" y1="16" x2="50" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="45%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>
        <radialGradient id="urgTriInner" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FECDD3" />
          <stop offset="60%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#E11D48" />
        </radialGradient>
      </defs>

      {/* Glow */}
      <circle cx="50" cy="52" r="38" fill="url(#urgGlow)" />

      {/* Red/Coral Radiating Rays */}
      <path d="M22 38L16 34" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" />
      <path d="M26 26L22 20" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" />
      <path d="M78 38L84 34" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" />
      <path d="M74 26L78 20" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" />

      {/* 3D Warning Triangle */}
      <g filter="drop-shadow(0 8px 12px rgba(190,18,60,0.35))">
        {/* Base Triangle */}
        <path
          d="M42.5 22.8C45.8 17.1 54.2 17.1 57.5 22.8L85.2 70.8C88.5 76.5 84.3 83.5 77.7 83.5H22.3C15.7 83.5 11.5 76.5 14.8 70.8L42.5 22.8Z"
          fill="url(#urgTriOuter)"
        />
        {/* Inner Highlight Face */}
        <path
          d="M44.5 26.5C46.8 22.5 53.2 22.5 55.5 26.5L81.5 71.5C83.8 75.5 80.8 80.5 76 80.5H24C19.2 80.5 16.2 75.5 18.5 71.5L44.5 26.5Z"
          fill="url(#urgTriInner)"
        />
        {/* Specular Highlight */}
        <path
          d="M48 24L21 72"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
        {/* 3D Exclamation Mark */}
        <path d="M50 40V58" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" filter="drop-shadow(0 2px 3px rgba(159,18,57,0.3))" />
        <circle cx="50" cy="69" r="3.5" fill="#FFFFFF" filter="drop-shadow(0 2px 3px rgba(159,18,57,0.3))" />
      </g>
    </svg>
  </div>
);

/* =========================================================================
   Notification KPI Cards Component
   ========================================================================= */

export const NotificationKpiCards: React.FC<NotificationKpiCardsProps> = ({
  totalCount,
  unreadCount,
  criticalCount = 0,
}) => {
  const criticalDisplay = typeof criticalCount === 'number' ? `${criticalCount} Critical` : criticalCount;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-4 md:gap-5">
      {/* 1. Total Notifications */}
      <div className="group relative rounded-2xl p-5 sm:p-6 flex items-center gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none min-w-0 overflow-hidden">
        <BellNotification3D badgeCount={unreadCount} />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
            Total Notifications
          </span>
          <p
            className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5 wrap-anywhere"
            title={String(totalCount)}
          >
            <span className="tabular-nums">{totalCount}</span>
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate">
            System &amp; trade logs
          </p>
        </div>
      </div>

      {/* 2. Unread Alerts */}
      <div className="group relative rounded-2xl p-5 sm:p-6 flex items-center gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none min-w-0 overflow-hidden">
        <HourglassAlert3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
            Unread Alerts
          </span>
          <p
            className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5 wrap-anywhere"
            title={String(unreadCount)}
          >
            <span className="tabular-nums">{unreadCount}</span>
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate">
            {unreadCount > 0 ? 'Pending review' : 'All caught up'}
          </p>
        </div>
      </div>

      {/* 3. Urgent Action Required */}
      <div className="group relative rounded-2xl p-5 sm:p-6 flex items-center gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none min-w-0 overflow-hidden">
        <UrgentWarning3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
            Urgent Action Required
          </span>
          <p
            className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5 wrap-anywhere"
            title={criticalDisplay}
          >
            {criticalDisplay}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate">
            {criticalCount === 0 || criticalCount === '0 Critical' ? 'All systems nominal' : 'High priority alerts'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationKpiCards;
