import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-[11px] text-muted-foreground select-none ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {index > 0 && <span className="opacity-50">/</span>}
            {isLast || (!item.href && !item.onClick) ? (
              <span className={`font-normal truncate ${isLast ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            ) : item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-foreground transition-colors cursor-pointer text-muted-foreground truncate"
              >
                {item.label}
              </button>
            ) : (
              <a
                href={item.href?.startsWith('#') || item.href?.startsWith('/') ? item.href : `#${item.href}`}
                onClick={(e) => {
                  if (item.href?.startsWith('/')) {
                    e.preventDefault();
                    // trigger internal custom navigation if needed
                    window.location.hash = item.href.replace('/', '#');
                  }
                }}
                className="hover:text-foreground transition-colors text-muted-foreground"
              >
                {item.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
