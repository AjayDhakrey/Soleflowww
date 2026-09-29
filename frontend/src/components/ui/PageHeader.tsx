import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { Icon } from '../../lib/icons';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) => {
  return (
    <div
      className={`p-8 rounded-[8px] border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col items-center justify-center text-center select-none ${className}`}
    >
      {icon && (
        <div className="mb-2.5 text-zinc-400 dark:text-zinc-500">
          <Icon icon={icon} size={20} />
        </div>
      )}
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{title}</p>
      {description && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="mt-3.5">
          <Button variant="primary" size="sm" onClick={onAction} icon={actionIcon}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-[6px] ${className}`} />
  );
};

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 select-none ${className}`}>
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {secondaryAction && (
          <Button
            variant="secondary"
            size="md"
            icon={secondaryAction.icon}
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
        {primaryAction && (
          <Button
            variant="primary"
            size="md"
            icon={primaryAction.icon}
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
};
