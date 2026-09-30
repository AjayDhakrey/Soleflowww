import React from 'react';
import { LucideIcon } from 'lucide-react';
import { IconBubble, BubbleColor } from './IconBubble';

export interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  bubbleColor?: BubbleColor;
  caption?: string;
  change?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon,
  bubbleColor = 'blue',
  caption,
  change,
  onClick,
  className = '',
}) => {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`bg-surface border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 sm:gap-3.5 transition-all duration-150 shadow-2xs ${
        isClickable
          ? 'cursor-pointer hover:border-border hover:shadow-sm active:scale-[0.99]'
          : ''
      } ${className}`}
    >
      <IconBubble icon={icon} color={bubbleColor} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground truncate" title={label}>
          {label}
        </p>
        <p className="text-lg sm:text-xl font-bold text-foreground tracking-tight tabular-nums mt-0.5 leading-tight truncate">
          {value}
        </p>
        {caption && (
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {caption}
          </p>
        )}
        {change && (
          <p
            className={`text-xs font-medium mt-1 inline-flex items-center gap-1 ${
              change.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {change.value}
          </p>
        )}
      </div>
    </div>
  );
};
