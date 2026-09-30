import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Icons } from '../../lib/icons';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Icons.Catalogue,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 my-6 ${className}`}
    >
      <div className="w-[88px] h-[88px] rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-4 shrink-0 shadow-xs">
        <Icon size={36} strokeWidth={1.5} />
      </div>
      <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
        {title}
      </h4>
      {description && (
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-md mt-1.5 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
