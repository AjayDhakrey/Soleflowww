import React from 'react';
import { Avatar } from './Avatar';
import { Icons } from '../../lib/icons';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full text-left border-collapse ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <thead className={`border-b border-border bg-muted/20 ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <tbody className={`divide-y divide-border ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  clickable?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
  className = '',
  clickable = false,
  children,
  ...props
}) => {
  return (
    <tr
      className={`min-h-[72px] transition-colors duration-150 ${
        clickable ? 'cursor-pointer hover:bg-muted/60' : 'hover:bg-muted/30'
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <th
      className={`py-4 px-4 text-sm font-medium text-muted-foreground select-none whitespace-nowrap ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <td
      className={`py-4 px-4 text-sm text-foreground align-middle ${className}`}
      {...props}
    >
      {children}
    </td>
  );
};

export interface TableAvatarCellProps {
  name: string;
  subtext?: React.ReactNode;
  badge?: React.ReactNode;
  avatarSrc?: string;
  className?: string;
}

export const TableAvatarCell: React.FC<TableAvatarCellProps> = ({
  name,
  subtext,
  badge,
  avatarSrc,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3.5 py-1 ${className}`}>
      <Avatar name={name} src={avatarSrc} size="lg" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-foreground text-sm leading-tight truncate">
            {name}
          </p>
          {badge}
        </div>
        {subtext && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};

export interface TableMoneyCellProps {
  amount: number | string;
  isBold?: boolean;
  className?: string;
}

export const TableMoneyCell: React.FC<TableMoneyCellProps> = ({
  amount,
  isBold = false,
  className = '',
}) => {
  const formatted = typeof amount === 'number' ? `₹${amount.toLocaleString('en-IN')}` : amount;

  return (
    <div className={`text-right tabular-nums text-sm ${isBold ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'} ${className}`}>
      {formatted}
    </div>
  );
};

export interface TableActionCellProps {
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  className?: string;
}

export const TableActionCell: React.FC<TableActionCellProps> = ({
  onClick,
  title = 'More options',
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer ${className}`}
    >
      <Icons.More size={18} strokeWidth={1.75} />
    </button>
  );
};
