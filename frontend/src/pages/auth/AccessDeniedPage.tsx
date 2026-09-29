import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

interface AccessDeniedPageProps {
  onReturnHome: () => void;
  requiredRole?: string;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  onReturnHome,
  requiredRole = 'Trader / Admin',
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Restricted (403)</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          This area requires elevated <span className="font-semibold text-slate-800 dark:text-slate-200">{requiredRole}</span> permissions.
          Your current account role does not have authorization to view or modify this resource.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onReturnHome}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
