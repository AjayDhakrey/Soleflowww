import React from 'react';
import { Icons } from '../../lib/icons';

interface CustomerProfileKpiCardsProps {
  lifetimeBusiness: string;
  lifetimeCaption?: string;
  totalPaid: string;
  paidCaption?: string;
  outstandingDue: string;
  isOverdue?: boolean;
  isCleared?: boolean;
  dueCaption?: string;
  creditLimit: string;
  limitUsage: number;
  paymentTerms?: string;
}

/* =========================================================================
   3D Claymorphic Vector SVGs for Customer Detail / Profile
   ========================================================================= */

// 1. Lifetime Business (3D Blue Diamond Vault & Briefcase)
export const ProfileLifetime3D = () => (
  <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="prfLifeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="prfLifeSphere" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="35%" stopColor="#0284C7" />
          <stop offset="75%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#075985" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#prfLifeGlow)" />

      {/* Main Base Shield */}
      <rect
        x="22"
        y="22"
        width="56"
        height="56"
        rx="18"
        fill="url(#prfLifeSphere)"
        filter="drop-shadow(0 6px 12px rgba(2,132,199,0.35))"
      />

      {/* 3D Rupee / Consignment Box */}
      <rect x="32" y="38" width="36" height="28" rx="6" fill="#FFFFFF" opacity="0.95" />
      <path d="M42 38V32C42 29.8 43.8 28 46 28H54C56.2 28 58 29.8 58 32V38" stroke="#0284C7" strokeWidth="3" fill="none" />
      <line x1="32" y1="50" x2="68" y2="50" stroke="#0284C7" strokeWidth="2" opacity="0.4" />
      <circle cx="50" cy="50" r="3" fill="#0369A1" />

      {/* Specular Highlight */}
      <ellipse cx="36" cy="28" rx="7" ry="2.5" fill="#FFFFFF" opacity="0.5" />
    </svg>
  </div>
);

// 2. Total Realized (3D Emerald Realized Stack & Checkmark)
export const ProfilePaid3D = () => (
  <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="prfPaidGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="prfPaidSphere" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="35%" stopColor="#10B981" />
          <stop offset="75%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064E3B" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#prfPaidGlow)" />

      {/* Main Base Shield */}
      <circle cx="50" cy="50" r="32" fill="url(#prfPaidSphere)" filter="drop-shadow(0 6px 12px rgba(5,150,105,0.35))" />

      {/* Inner Concentric Ring */}
      <circle cx="50" cy="50" r="25" stroke="#A7F3D0" strokeWidth="2" strokeDasharray="5 3" opacity="0.8" />

      {/* 3D Checkmark */}
      <path
        d="M36 50L45 59L65 39"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"
      />

      {/* Specular Highlight */}
      <ellipse cx="40" cy="27" rx="7" ry="3" fill="#FFFFFF" opacity="0.5" transform="rotate(-20 40 27)" />
    </svg>
  </div>
);

// 3. Outstanding Due (3D Rose-Red Debt Ledger / Exclamation)
export const ProfileDue3D = () => (
  <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="prfDueGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE4E6" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFE4E6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="prfDueSphere" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="35%" stopColor="#F43F5E" />
          <stop offset="75%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#9F1239" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#prfDueGlow)" />

      {/* 3D Octagonal Alert Coin */}
      <polygon
        points="50,18 76,29 82,55 68,78 32,78 18,55 24,29"
        fill="url(#prfDueSphere)"
        filter="drop-shadow(0 6px 12px rgba(225,29,72,0.35))"
      />

      {/* Inset Rupee Symbol */}
      <path
        d="M40 37H58M40 44H56M40 37V63M46 44C52 44 54 49 51 53C48 56 42 56 42 56L56 65"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Specular Glint */}
      <ellipse cx="40" cy="27" rx="7" ry="2.5" fill="#FFFFFF" opacity="0.45" />
    </svg>
  </div>
);

// 4. Credit Limit Usage (3D Purple Gauge / Meter)
export const ProfileCredit3D = () => (
  <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm select-none" fill="none">
      <defs>
        <radialGradient id="prfCrdGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="prfCrdSphere" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="35%" stopColor="#8B5CF6" />
          <stop offset="75%" stopColor="#6D28D9" />
          <stop offset="100%" stopColor="#4C1D95" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#prfCrdGlow)" />

      {/* Main Base Card */}
      <rect
        x="22"
        y="22"
        width="56"
        height="56"
        rx="18"
        fill="url(#prfCrdSphere)"
        filter="drop-shadow(0 6px 12px rgba(109,40,217,0.35))"
      />

      {/* Gauge Arc */}
      <path
        d="M34 60A20 20 0 1 1 66 60"
        stroke="#DDD6FE"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M34 60A20 20 0 0 1 54 30"
        stroke="#F59E0B"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Gauge Needle Center */}
      <circle cx="50" cy="56" r="4.5" fill="#FFFFFF" />
      <line x1="50" y1="56" x2="57" y2="40" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

      {/* Specular Highlight */}
      <ellipse cx="36" cy="27" rx="7" ry="2.5" fill="#FFFFFF" opacity="0.45" />
    </svg>
  </div>
);

/* =========================================================================
   Main Component: CustomerProfileKpiCards
   ========================================================================= */
export const CustomerProfileKpiCards: React.FC<CustomerProfileKpiCardsProps> = ({
  lifetimeBusiness,
  lifetimeCaption = 'Wholesale consignments',
  totalPaid,
  paidCaption = 'Cheques & bank deposits',
  outstandingDue,
  isOverdue = false,
  isCleared = false,
  dueCaption = 'Ledger standing',
  creditLimit,
  limitUsage,
  paymentTerms = 'Not set',
}) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-3.5 sm:gap-4 md:gap-5">
      {/* 1. Lifetime Business */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <ProfileLifetime3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Lifetime Business">
            Lifetime Business
          </span>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-blue-800 dark:text-blue-300 mt-0.5 font-sans wrap-anywhere"
            title={lifetimeBusiness}
          >
            {lifetimeBusiness}
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title={lifetimeCaption}>
            {lifetimeCaption}
          </p>
        </div>
      </div>

      {/* 2. Total Realized */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <ProfilePaid3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Total Realized">
            Total Realized
          </span>
          <p
            className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-emerald-800 dark:text-emerald-300 mt-0.5 font-sans wrap-anywhere"
            title={totalPaid}
          >
            {totalPaid}
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title={paidCaption}>
            {paidCaption}
          </p>
        </div>
      </div>

      {/* 3. Outstanding Due */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <ProfileDue3D />
        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Outstanding Balance">
            Outstanding Balance
          </span>
          <p
            className={`text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight mt-0.5 font-sans wrap-anywhere ${
              isOverdue
                ? 'text-rose-800 dark:text-rose-300'
                : isCleared
                ? 'text-emerald-800 dark:text-emerald-300'
                : 'text-slate-800 dark:text-slate-100'
            }`}
            title={outstandingDue}
          >
            {outstandingDue}
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5 truncate" title={dueCaption}>
            {dueCaption}
          </p>
        </div>
      </div>

      {/* 4. Credit Limit Usage */}
      <div className="group relative rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none overflow-hidden min-w-0">
        <ProfileCredit3D />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block truncate" title="Credit Limit Usage">
              Credit Limit Usage
            </span>
            <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded-md shrink-0 ${
              limitUsage > 100
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                : limitUsage >= 80
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
            }`}>
              {limitUsage}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden my-2">
            <div
              style={{ width: `${Math.min(limitUsage, 100)}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                limitUsage > 100 ? 'bg-rose-500' : limitUsage >= 80 ? 'bg-amber-500' : 'bg-purple-500'
              }`}
            />
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal truncate" title={`Limit: ${creditLimit} • ${paymentTerms}`}>
            Limit: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{creditLimit}</strong> • {paymentTerms}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileKpiCards;
