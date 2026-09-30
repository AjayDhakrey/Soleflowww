import React from 'react';

export interface TagProps {
  children: React.ReactNode;
  variant?: 'slate' | 'blue' | 'purple' | 'outline';
  className?: string;
}

const variantStyles = {
  slate: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
  blue: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700',
  purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
  outline: 'bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300',
};

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'slate',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
