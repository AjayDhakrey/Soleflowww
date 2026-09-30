import React from 'react';
import { Icons } from '../../lib/icons';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onClear?: () => void;
  containerClassName?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, placeholder = 'Search...', className = '', containerClassName = '', ...props }, ref) => {
    const hasValue = Boolean(value);

    return (
      <div className={`relative flex items-center min-w-[240px] flex-1 ${containerClassName}`}>
        <div className="absolute left-4 pointer-events-none text-muted-foreground">
          <Icons.Search size={18} strokeWidth={1.75} />
        </div>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full h-12 pl-11 pr-10 bg-surface border border-border rounded-xl text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${className}`}
          {...props}
        />
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3.5 p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
          >
            <Icons.Close size={16} strokeWidth={1.75} />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
