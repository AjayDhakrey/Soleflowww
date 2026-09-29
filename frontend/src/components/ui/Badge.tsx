import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { Icon } from '../../lib/icons';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  icon?: LucideIcon;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  icon,
  className = '',
}) => {
  const variantClasses = {
    neutral: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    danger: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-xs font-medium tracking-tight ${variantClasses} ${className}`}
    >
      {icon && <Icon icon={icon} size={13} className="shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export interface StatusDotProps {
  status: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  label?: string;
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, label, className = '' }) => {
  const dotClasses = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-zinc-400',
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses}`} />
      {label && <span>{label}</span>}
    </span>
  );
};
