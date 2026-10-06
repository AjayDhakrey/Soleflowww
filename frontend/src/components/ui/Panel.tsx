import React from 'react';

export interface PanelProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  className = '',
  bodyClassName = '',
  noPadding = false,
}) => {
  const hasHeader = Boolean(title || subtitle || headerAction);

  return (
    <div
      className={`bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden ${className}`}
    >
      {hasHeader && (
        <div className="px-4 sm:px-5 py-3.5 border-b border-border flex flex-wrap items-center justify-between gap-3">
          <div>
            {title && (
              <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className={noPadding ? bodyClassName : `p-4 sm:p-5 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};
