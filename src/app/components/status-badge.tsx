import React from 'react';

type StatusType = 'active' | 'inactive' | 'pending' | 'error';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ 
  status, 
  label, 
  showDot = true, 
  className = '' 
}: StatusBadgeProps) {
  const statusConfig = {
    active: {
      bg: 'bg-severity-low-bg',
      text: 'text-severity-low-foreground',
      dot: 'bg-status-active',
      defaultLabel: 'Active',
    },
    inactive: {
      bg: 'bg-badge-neutral-bg',
      text: 'text-badge-neutral-fg',
      dot: 'bg-status-inactive',
      defaultLabel: 'Inactive',
    },
    pending: {
      bg: 'bg-severity-medium-bg',
      text: 'text-severity-medium-foreground',
      dot: 'bg-status-pending',
      defaultLabel: 'Pending',
    },
    error: {
      bg: 'bg-severity-high-bg',
      text: 'text-severity-high-foreground',
      dot: 'bg-status-error',
      defaultLabel: 'Error',
    },
  };

  const config = statusConfig[status];
  const displayLabel = label || config.defaultLabel;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded ${config.bg} ${config.text} text-xs font-medium ${className}`}
    >
      {showDot && (
        <span className={`w-2 h-2 rounded-full ${config.dot}`} aria-hidden="true" />
      )}
      <span>{displayLabel}</span>
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'neutral' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-accent text-accent-foreground',
    neutral: 'bg-badge-neutral-bg text-badge-neutral-fg',
    outline: 'border border-border text-foreground-secondary bg-transparent',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
