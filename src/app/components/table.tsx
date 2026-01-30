import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full border-collapse ${className}`}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className = '' }: TableHeaderProps) {
  return (
    <thead className={`bg-table-header-bg border-b border-table-border ${className}`}>
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className = '' }: TableBodyProps) {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  );
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
}

export function TableRow({ children, className = '', clickable = false, onClick }: TableRowProps) {
  const hoverClass = clickable || onClick ? 'hover:bg-table-row-hover cursor-pointer' : '';
  
  return (
    <tr 
      className={`border-b border-table-border transition-colors ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function TableHead({ children, className = '', align = 'left' }: TableHeadProps) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <th className={`px-6 py-3 text-xs font-semibold text-foreground uppercase tracking-wider ${alignmentClass[align]} ${className}`}>
      {children}
    </th>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function TableCell({ children, className = '', align = 'left' }: TableCellProps) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <td className={`px-6 py-4 text-sm text-foreground-secondary ${alignmentClass[align]} ${className}`}>
      {children}
    </td>
  );
}

interface TableCaptionProps {
  children: React.ReactNode;
  className?: string;
}

export function TableCaption({ children, className = '' }: TableCaptionProps) {
  return (
    <caption className={`px-6 py-3 text-sm text-foreground-tertiary text-left ${className}`}>
      {children}
    </caption>
  );
}
