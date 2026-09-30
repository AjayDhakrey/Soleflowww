import React from 'react';
import { LucideIcon } from 'lucide-react';

export type BubbleColor = 'blue' | 'zinc' | 'green' | 'red' | 'amber' | 'violet' | 'slate';

interface IconBubbleProps {
  icon: LucideIcon;
  color?: BubbleColor;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const colorMap: Record<BubbleColor, { bg: string; icon: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  zinc: {
    bg: 'bg-muted',
    icon: 'text-foreground',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/40',
    icon: 'text-red-600 dark:text-red-400',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  violet: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    icon: 'text-purple-600 dark:text-purple-400',
  },
  slate: {
    bg: 'bg-muted',
    icon: 'text-muted-foreground',
  },
};

const sizeMap = {
  sm: {
    bubble: 'w-8 h-8 rounded-xl',
    iconSize: 16,
  },
  md: {
    bubble: 'w-10 h-10 rounded-xl',
    iconSize: 18,
  },
  lg: {
    bubble: 'w-11 h-11 rounded-2xl',
    iconSize: 20,
  },
};

export const IconBubble: React.FC<IconBubbleProps> = ({
  icon: Icon,
  color = 'blue',
  className = '',
  size = 'md',
}) => {
  const { bg, icon } = colorMap[color] || colorMap.blue;
  const { bubble, iconSize } = sizeMap[size];

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 ${bubble} ${bg} ${className}`}
    >
      <Icon size={iconSize} strokeWidth={1.75} className={icon} />
    </div>
  );
};
