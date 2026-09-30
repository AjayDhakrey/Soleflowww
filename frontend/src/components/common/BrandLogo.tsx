import React from 'react';
import projectLogo from '../../assets/images/project_logo.png';

interface BrandLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  variant?: 'light' | 'dark' | 'auto';
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  subtitle,
  variant = 'auto',
}) => {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${sizeClass} rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-center shrink-0 p-0.5`}
      >
        <img
          src={projectLogo}
          alt="SoleFlow ShoeConnect Logo"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>

      {showText && (
        <div className="min-w-0">
          <h2 className="text-base font-bold text-foreground tracking-tight leading-tight truncate">
            ShoeConnect
          </h2>
          {subtitle ? (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {subtitle}
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground truncate">
              Step Towards Better Tomorrow
            </p>
          )}
        </div>
      )}
    </div>
  );
};
