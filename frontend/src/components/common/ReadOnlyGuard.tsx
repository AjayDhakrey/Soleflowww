import React from 'react';
import { Lock } from 'lucide-react';
import { useReadOnly } from '../../context/ViewModeContext';

interface ReadOnlyGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLockBadge?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Reusable wrapper to protect write actions and forms in Super Admin Read-Only View Mode.
 */
export const ReadOnlyGuard: React.FC<ReadOnlyGuardProps> = ({
  children,
  fallback = null,
  showLockBadge = true,
  disabled = false,
  className = '',
}) => {
  const isReadOnly = useReadOnly();

  if (isReadOnly || disabled) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className={`relative inline-flex items-center group cursor-not-allowed select-none ${className}`}>
        <div className="opacity-50 pointer-events-none filter grayscale-30">{children}</div>
        {showLockBadge && (
          <div
            className="absolute -top-1.5 -right-1.5 bg-slate-900 text-amber-300 p-1 rounded-full shadow-md z-10"
            title="Read-only view mode — modifications disabled"
          >
            <Lock size={10} strokeWidth={2.5} />
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default ReadOnlyGuard;
