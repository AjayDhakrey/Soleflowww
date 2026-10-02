import React from 'react';

interface AuditKpiCardsProps {
  totalEvents: number | string;
  totalCaption?: string;
  traderCount: number | string;
  traderCaption?: string;
  fieldRepCount: number | string;
  fieldRepCaption?: string;
  automatedCount: number | string;
  automatedCaption?: string;
}

/* =========================================================================
   3D Claymorphic Vector SVGs matching exactly the user's reference mockup
   ========================================================================= */

// 1. Total Audit Events (3D Blue Folder Doc Stack + Green Checkmark Badge)
export const TotalAuditEvents3D = () => (
  <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        {/* Ambient Glow */}
        <radialGradient id="audEvtGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0" />
        </radialGradient>

        {/* Blue Folder Back Gradient */}
        <linearGradient id="audBackFolder" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* White Document Body */}
        <linearGradient id="audDocBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>

        {/* Green Checkmark Badge */}
        <radialGradient id="audBadgeGrn" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="35%" stopColor="#22C55E" />
          <stop offset="75%" stopColor="#16A34A" />
          <stop offset="100%" stopColor="#15803D" />
        </radialGradient>
      </defs>

      {/* Ambient Blue Glow */}
      <circle cx="60" cy="60" r="50" fill="url(#audEvtGlow)" />

      {/* Radiating Blue Sparks Top-Right */}
      <path d="M90 24L94 18" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
      <path d="M98 32L106 32" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
      <path d="M82 16L80 10" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />

      {/* 3D Stacked Blue Folder + White Document */}
      <g filter="drop-shadow(0 10px 18px rgba(2,132,199,0.38))">
        {/* Back Blue Folder / Sheet (tilted left) */}
        <rect
          x="26"
          y="28"
          width="54"
          height="62"
          rx="12"
          fill="url(#audBackFolder)"
        />

        {/* Front White Document Sheet */}
        <rect
          x="34"
          y="32"
          width="50"
          height="58"
          rx="10"
          fill="url(#audDocBody)"
        />

        {/* Text Lines on Document */}
        <line x1="42" y1="46" x2="64" y2="46" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
        <line x1="42" y1="54" x2="72" y2="54" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="42" y1="62" x2="66" y2="62" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Green Checkmark Badge Overlapping Bottom Right */}
      <g filter="drop-shadow(0 6px 14px rgba(22,163,74,0.48))">
        <circle cx="84" cy="76" r="16" fill="url(#audBadgeGrn)" />
        <circle cx="84" cy="76" r="13" stroke="#BBF7D0" strokeWidth="1.5" opacity="0.65" fill="none" />

        {/* White Checkmark */}
        <path
          d="M77 76L81.5 81L91 71"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.25))"
        />

        {/* Badge Specular Highlight */}
        <ellipse cx="80" cy="68" rx="5" ry="2" fill="#FFFFFF" opacity="0.6" transform="rotate(-25 80 68)" />
      </g>
    </svg>
  </div>
);

// 2. Trader Authorizations (3D Emerald Green Security Shield with White Checkmark)
export const TraderAuthorizations3D = () => (
  <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        {/* Ambient Glow */}
        <radialGradient id="traGlowGrn" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0" />
        </radialGradient>

        {/* Emerald Shield Gradient */}
        <radialGradient id="traShieldGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="30%" stopColor="#10B981" />
          <stop offset="70%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </radialGradient>
      </defs>

      {/* Ambient Mint Glow */}
      <circle cx="60" cy="60" r="50" fill="url(#traGlowGrn)" />

      {/* Green Sparks Top-Right */}
      <path d="M88 20L92 14" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
      <path d="M96 28L102 28" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
      <path d="M80 14L78 8" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />

      {/* 3D Security Shield */}
      <g filter="drop-shadow(0 12px 22px rgba(5,150,105,0.45))">
        {/* Shield Outer Shell */}
        <path
          d="M60 22C80 22 92 28 92 46C92 74 60 96 60 96C60 96 28 74 28 46C28 28 40 22 60 22Z"
          fill="url(#traShieldGrad)"
        />

        {/* Inset Inner Rim */}
        <path
          d="M60 29C75 29 84 34 84 48C84 70 60 88 60 88C60 88 36 70 36 48C36 34 45 29 60 29Z"
          stroke="#A7F3D0"
          strokeWidth="2"
          strokeOpacity="0.5"
          fill="none"
        />

        {/* 3D Bold White Checkmark in Center */}
        <path
          d="M48 56L56 64L74 46"
          stroke="#FFFFFF"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"
        />

        {/* Specular Highlight along Top Crest */}
        <ellipse cx="48" cy="30" rx="8" ry="3" fill="#FFFFFF" opacity="0.45" transform="rotate(-15 48 30)" />
      </g>
    </svg>
  </div>
);

// 3. Field Rep Entries (3D Royal Blue Avatar on Peach Disk + Orange Plus Badge)
export const FieldRepEntries3D = () => (
  <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        {/* Ambient Glow */}
        <radialGradient id="repGlowPeach" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FED7AA" stopOpacity="0" />
        </radialGradient>

        {/* Warm Peach Circular Base Disc */}
        <radialGradient id="repBasePeach" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="50%" stopColor="#FFEDD5" />
          <stop offset="100%" stopColor="#FDBA74" />
        </radialGradient>

        {/* Royal Blue Avatar Gradients */}
        <radialGradient id="repHeadBlu" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="35%" stopColor="#3B82F6" />
          <stop offset="75%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </radialGradient>
        <linearGradient id="repBodyBlu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>

        {/* Orange Plus Badge */}
        <radialGradient id="repPlusOrg" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="35%" stopColor="#FB923C" />
          <stop offset="75%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#C2410C" />
        </radialGradient>
      </defs>

      {/* Ambient Peach Glow */}
      <circle cx="60" cy="60" r="50" fill="url(#repGlowPeach)" />

      {/* Radiating Golden Sparks Top-Right */}
      <path d="M88 20L92 14" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <path d="M96 28L102 28" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <path d="M80 14L78 8" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />

      {/* 3D Warm Peach Circular Base Disc */}
      <circle cx="60" cy="62" r="38" fill="url(#repBasePeach)" filter="drop-shadow(0 6px 14px rgba(249,115,22,0.25))" />

      {/* 3D Royal Blue Avatar User */}
      <g filter="drop-shadow(0 8px 16px rgba(29,78,216,0.45))">
        {/* Torso / Curved Shoulders */}
        <path
          d="M36 84C36 71 46 63 60 63C74 63 84 71 84 84C84 87 78 88 60 88C42 88 36 87 36 84Z"
          fill="url(#repBodyBlu)"
        />

        {/* Head Sphere */}
        <circle cx="60" cy="46" r="14" fill="url(#repHeadBlu)" />

        {/* Head Specular Highlight */}
        <ellipse cx="55" cy="40" rx="5" ry="2.5" fill="#FFFFFF" opacity="0.55" transform="rotate(-20 55 40)" />
      </g>

      {/* Orange Plus Badge Overlapping Lower Right */}
      <g filter="drop-shadow(0 6px 12px rgba(234,88,12,0.45))">
        <circle cx="82" cy="74" r="15" fill="url(#repPlusOrg)" />
        <circle cx="82" cy="74" r="12" stroke="#FED7AA" strokeWidth="1.2" opacity="0.65" fill="none" />

        {/* Bold White Plus Sign */}
        <path
          d="M82 66V82M74 74H90"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Specular Highlight */}
        <ellipse cx="78" cy="67" rx="4" ry="1.8" fill="#FFFFFF" opacity="0.55" transform="rotate(-25 78 67)" />
      </g>
    </svg>
  </div>
);

// 4. Automated Triggers (3D Purple Bell with Exclamation '!' and Soundwaves)
export const AutomatedTriggers3D = () => (
  <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        {/* Ambient Glow */}
        <radialGradient id="trgGlowPurp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E9D5FF" stopOpacity="0" />
        </radialGradient>

        {/* Purple Bell Gradient */}
        <radialGradient id="trgBellSphere" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#D8B4FE" />
          <stop offset="35%" stopColor="#A855F7" />
          <stop offset="75%" stopColor="#7E22CE" />
          <stop offset="100%" stopColor="#581C87" />
        </radialGradient>
      </defs>

      {/* Ambient Purple Glow */}
      <circle cx="60" cy="60" r="50" fill="url(#trgGlowPurp)" />

      {/* Left Soundwave Vibration Brackets */}
      <path d="M30 42C26 50 26 62 30 70" stroke="#9333EA" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 36C17 48 17 66 22 78" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />

      {/* Right Soundwave Vibration Brackets */}
      <path d="M90 42C94 50 94 62 90 70" stroke="#9333EA" strokeWidth="3" strokeLinecap="round" />
      <path d="M98 36C103 48 103 66 98 78" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />

      {/* Top Sparks */}
      <path d="M88 18L92 14" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M78 12L76 6" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" />

      {/* 3D Purple Bell Body */}
      <g filter="drop-shadow(0 10px 20px rgba(126,34,206,0.45))">
        {/* Top Handle Loop */}
        <circle cx="60" cy="24" r="5" fill="#7E22CE" />
        <circle cx="60" cy="24" r="2.5" fill="#F3E8FF" />

        {/* Bell Flared Dome */}
        <path
          d="M60 28C48 28 44 42 42 58C40 70 34 76 34 78C34 81 37 83 44 83H76C83 83 86 81 86 78C86 76 80 70 78 58C76 42 72 28 60 28Z"
          fill="url(#trgBellSphere)"
        />

        {/* Bell Clapper Bottom */}
        <circle cx="60" cy="86" r="6" fill="#6B21A8" />
        <ellipse cx="60" cy="85" rx="4" ry="2" fill="#D8B4FE" opacity="0.6" />

        {/* White Exclamation '!' on Bell Surface */}
        <path
          d="M60 44V56"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
        />
        <circle
          cx="60"
          cy="66"
          r="2.5"
          fill="#FFFFFF"
          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
        />

        {/* Specular Highlight */}
        <ellipse cx="50" cy="38" rx="5" ry="2.5" fill="#FFFFFF" opacity="0.5" transform="rotate(-30 50 38)" />
      </g>
    </svg>
  </div>
);

/* =========================================================================
   Main Component: AuditKpiCards
   ========================================================================= */
export const AuditKpiCards: React.FC<AuditKpiCardsProps> = ({
  totalEvents,
  totalCaption = 'Across 5 active wholesale stores',
  traderCount,
  traderCaption = 'Current billing cycle commitments',
  fieldRepCount,
  fieldRepCaption = 'Priority collection reminder queue',
  automatedCount,
  automatedCaption = 'MTD bank verified realizations',
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
      {/* 1. Total Audit Events */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <TotalAuditEvents3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Total Audit Events">
            Total Audit Events
          </span>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-0.5 font-sans truncate"
            title={String(totalEvents)}
          >
            {totalEvents}
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title={totalCaption}>
            {totalCaption}
          </p>
        </div>
      </div>

      {/* 2. Trader Authorizations */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <TraderAuthorizations3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Trader Authorizations">
            Trader Authorizations
          </span>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-0.5 font-sans truncate"
            title={String(traderCount)}
          >
            {traderCount}
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title={traderCaption}>
            {traderCaption}
          </p>
        </div>
      </div>

      {/* 3. Field Rep Entries */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <FieldRepEntries3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Field Rep Entries">
            Field Rep Entries
          </span>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-0.5 font-sans truncate"
            title={String(fieldRepCount)}
          >
            {fieldRepCount}
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title={fieldRepCaption}>
            {fieldRepCaption}
          </p>
        </div>
      </div>

      {/* 4. Automated Triggers */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <AutomatedTriggers3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Automated Triggers">
            Automated Triggers
          </span>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-0.5 font-sans truncate"
            title={String(automatedCount)}
          >
            {automatedCount}
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title={automatedCaption}>
            {automatedCaption}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditKpiCards;
