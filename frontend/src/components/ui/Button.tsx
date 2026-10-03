import React from 'react';
import { LucideIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs font-medium focus:ring-2 focus:ring-primary/25 border border-transparent active:scale-[0.99]',
  secondary:
    'bg-surface border border-border hover:bg-muted text-foreground font-medium shadow-2xs active:scale-[0.99]',
  outline:
    'bg-transparent border border-border hover:bg-muted text-foreground font-medium',
  ghost:
    'bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground font-medium border border-transparent',
  danger:
    'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/50 dark:text-red-300 font-medium border border-red-200 dark:border-red-900/50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-xs font-medium rounded-lg gap-1.5',
  md: 'h-11 px-4 text-sm font-medium rounded-xl gap-2',
  lg: 'h-12 px-5 text-sm font-medium rounded-xl gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'lg',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-colors duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon size={size === 'sm' ? 16 : 18} strokeWidth={1.75} className="shrink-0" />
      ) : null}

      {children}

      {!isLoading && Icon && iconPosition === 'right' ? (
        <Icon size={size === 'sm' ? 16 : 18} strokeWidth={1.75} className="shrink-0" />
      ) : null}
    </button>
  );
};
