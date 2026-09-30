import React from 'react';

export interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-wrap items-center gap-3 w-full ${className}`}>
      {children}
    </div>
  );
};
