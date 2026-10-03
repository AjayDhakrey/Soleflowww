import React from 'react';

export type BadgeVariant =
  | 'info'
  | 'success'
  | 'pending'
  | 'danger'
  | 'neutral'
  | 'active'
  | 'purple'
  | 'warning'
  | 'rose';

export interface StatusBadgeProps {
  status?: string;
  variant?: BadgeVariant | string;
  showDot?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const resolveVariant = (statusText?: string, explicitVariant?: string): { variant: string; hasDot: boolean } => {
  if (explicitVariant) {
    return { variant: explicitVariant, hasDot: explicitVariant === 'success' || explicitVariant === 'active' };
  }

  const s = (statusText || '').toLowerCase().trim();

  // Success / Active / Converted / Paid / Delivered
  if (['active', 'paid', 'delivered', 'converted', 'completed', 'success'].includes(s)) {
    return { variant: 'success', hasDot: true };
  }

  if (['approved'].includes(s)) {
    return { variant: 'purple', hasDot: false };
  }

  // Pending / Review / In Progress / On Hold
  if (['pending', 'review', 'under review', 'in progress', 'in_progress', 'ready qc', 'on_hold', 'dispatched', 'in_transit', 'partial'].includes(s)) {
    return { variant: 'pending', hasDot: false };
  }

  // Danger / Overdue / Cancelled / Failed / Suspended
  if (['overdue', 'cancelled', 'failed', 'suspended', 'rejected', 'danger'].includes(s)) {
    return { variant: 'danger', hasDot: false };
  }

  // Info / Ready
  if (['info', 'ready', 'open', 'sent', 'new'].includes(s)) {
    return { variant: 'info', hasDot: false };
  }

  // Neutral / Draft / Inactive / Archived
  return { variant: 'neutral', hasDot: false };
};

const badgeStyles: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    text: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500',
    border: 'border-blue-200 dark:border-blue-800/60',
  },
  active: {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    text: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500',
    border: 'border-blue-200 dark:border-blue-800/60',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200 dark:border-emerald-800/60',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/50',
    text: 'text-purple-700 dark:text-purple-300',
    dot: 'bg-purple-500',
    border: 'border-purple-200 dark:border-purple-800/60',
  },
  pending: {
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-800/60',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-800/60',
  },
  danger: {
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
    border: 'border-rose-200 dark:border-rose-800/60',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
    border: 'border-rose-200 dark:border-rose-800/60',
  },
  neutral: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    dot: 'bg-subtle-foreground',
    border: 'border-border',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant: explicitVariant,
  showDot,
  children,
  className = '',
}) => {
  const label = children || status;
  const { variant, hasDot: autoDot } = resolveVariant(typeof label === 'string' ? label : status, explicitVariant);
  const styles = badgeStyles[variant] || badgeStyles.neutral;
  const shouldRenderDot = showDot !== undefined ? showDot : autoDot;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold select-none whitespace-nowrap border ${styles.bg} ${styles.text} ${styles.border} ${className}`}
    >
      {shouldRenderDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
      )}
      {label}
    </span>
  );
};
