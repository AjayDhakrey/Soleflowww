import React from 'react';
import { Icons } from '../../lib/icons';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  containerClassName?: string;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, children, containerClassName = '', className = '', placeholder, ...props }, ref) => {
    return (
      <div className={`relative inline-flex items-center min-w-[160px] ${containerClassName}`}>
        <select
          ref={ref}
          className={`w-full h-12 pl-4 pr-10 bg-surface border border-border rounded-xl text-sm font-medium text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-colors ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute right-3.5 pointer-events-none text-muted-foreground">
          <Icons.ChevronDown size={18} strokeWidth={1.75} />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
