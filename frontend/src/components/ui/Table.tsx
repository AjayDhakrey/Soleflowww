import React from 'react';

export interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-[8px] bg-white dark:bg-zinc-900 ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400 select-none">
      {children}
    </thead>
  );
};

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = '' }) => {
  return (
    <tr
      onClick={onClick}
      className={`h-[44px] transition-colors ${
        onClick ? 'cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50' : 'hover:bg-zinc-50/40 dark:hover:bg-zinc-800/20'
      } ${className}`}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<{
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}> = ({ children, align = 'left', className = '' }) => {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <th className={`px-3.5 py-2.5 font-medium tracking-tight ${alignClass} ${className}`}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<{
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}> = ({ children, align = 'left', className = '' }) => {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right tabular-nums',
  }[align];

  return (
    <td className={`px-3.5 py-2.5 whitespace-nowrap text-sm ${alignClass} ${className}`}>
      {children}
    </td>
  );
};
