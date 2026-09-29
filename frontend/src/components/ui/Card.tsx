import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { Icon } from '../../lib/icons';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[8px] ${
        onClick ? 'cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  onClick?: () => void;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon,
  change,
  changeType = 'neutral',
  onClick,
  className = '',
}) => {
  const changeClasses = {
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-zinc-500 dark:text-zinc-400',
  }[changeType];

  return (
    <Card
      onClick={onClick}
      className={`p-4 flex flex-col justify-between select-none ${className}`}
    >
      <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
        {icon && <Icon icon={icon} size={15} className="text-zinc-400 dark:text-zinc-500" />}
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
          {value}
        </div>
        {change && (
          <div className={`text-xs font-medium tabular-nums ${changeClasses}`}>
            {change}
          </div>
        )}
      </div>
    </Card>
  );
};
