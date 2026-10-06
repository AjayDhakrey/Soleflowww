import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Icons } from '../../lib/icons';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Icons.Catalogue,
  title,
  description,
  action,
  className = '',
  compact = false,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'p-4 sm:p-6 my-1' : 'p-6 sm:p-8 my-3'
      } ${className}`}
    >
      <div
        className={`${
          compact ? 'w-12 h-12 mb-2.5' : 'w-16 h-16 mb-3.5'
        } rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 shadow-2xs`}
      >
        <Icon size={compact ? 24 : 32} strokeWidth={1.5} />
      </div>
      <h4 className="font-display text-sm sm:text-base font-semibold text-foreground">
        {title}
      </h4>
      {description && (
        <p className="max-w-sm text-xs text-muted-foreground mt-1">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
