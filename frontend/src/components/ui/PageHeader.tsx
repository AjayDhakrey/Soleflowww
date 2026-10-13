import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className = '',
}) => {
  return (
    <div className={`space-y-2 mb-6 md:mb-8 ${className}`}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-2" />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground break-words">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground break-words">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 shrink-0 flex-wrap max-w-full">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
