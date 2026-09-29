import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { Icon } from '../../lib/icons';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8 px-2.5 text-xs gap-1.5 rounded-[6px]',
    md: 'h-9 px-3.5 text-sm gap-2 rounded-[6px]',
    lg: 'h-10 px-4 text-sm gap-2 rounded-[6px]',
  }[size];

  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white font-medium border border-blue-700/20 shadow-xs focus:ring-2 focus:ring-blue-500/20',
    secondary:
      'bg-white hover:bg-zinc-50 text-zinc-900 font-medium border border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-500/10',
    ghost:
      'bg-transparent hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 border border-transparent',
    danger:
      'bg-red-50 hover:bg-red-100 text-red-700 font-medium border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center font-sans tracking-tight transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : icon ? (
        <Icon icon={icon} size={size === 'sm' ? 14 : 16} />
      ) : null}
      {children}
    </button>
  );
};
