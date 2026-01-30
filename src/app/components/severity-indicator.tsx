import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

interface SeverityIndicatorProps {
  level: SeverityLevel;
  label?: string;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SeverityIndicator({
  level,
  label,
  showIcon = true,
  className = '',
  size = 'md',
}: SeverityIndicatorProps) {
  const severityConfig = {
    low: {
      bg: 'bg-severity-low-bg',
      text: 'text-severity-low-foreground',
      border: 'border-severity-low',
      icon: CheckCircle,
      defaultLabel: 'Low',
      dotColor: 'bg-severity-low',
    },
    medium: {
      bg: 'bg-severity-medium-bg',
      text: 'text-severity-medium-foreground',
      border: 'border-severity-medium',
      icon: AlertCircle,
      defaultLabel: 'Medium',
      dotColor: 'bg-severity-medium',
    },
    high: {
      bg: 'bg-severity-high-bg',
      text: 'text-severity-high-foreground',
      border: 'border-severity-high',
      icon: AlertTriangle,
      defaultLabel: 'High',
      dotColor: 'bg-severity-high',
    },
    critical: {
      bg: 'bg-severity-critical-bg',
      text: 'text-severity-critical-foreground',
      border: 'border-severity-critical',
      icon: XCircle,
      defaultLabel: 'Critical',
      dotColor: 'bg-severity-critical',
    },
  };

  const sizeConfig = {
    sm: {
      container: 'px-2 py-0.5 text-xs',
      icon: 'w-3 h-3',
      gap: 'gap-1',
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      gap: 'gap-2',
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      gap: 'gap-2',
    },
  };

  const config = severityConfig[level];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;
  const displayLabel = label || config.defaultLabel;

  return (
    <div
      className={`inline-flex items-center ${sizeStyles.gap} ${sizeStyles.container} rounded border ${config.border} ${config.bg} ${config.text} font-medium ${className}`}
    >
      {showIcon && <Icon className={sizeStyles.icon} aria-hidden="true" />}
      <span>{displayLabel}</span>
    </div>
  );
}

interface SeverityDotProps {
  level: SeverityLevel;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SeverityDot({ level, className = '', size = 'md' }: SeverityDotProps) {
  const severityConfig = {
    low: 'bg-severity-low',
    medium: 'bg-severity-medium',
    high: 'bg-severity-high',
    critical: 'bg-severity-critical',
  };

  const sizeConfig = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-block rounded-full ${severityConfig[level]} ${sizeConfig[size]} ${className}`}
      aria-label={`${level} severity`}
    />
  );
}

interface SeverityBarProps {
  level: SeverityLevel;
  percentage?: number;
  className?: string;
}

export function SeverityBar({ level, percentage = 100, className = '' }: SeverityBarProps) {
  const severityConfig = {
    low: 'bg-severity-low',
    medium: 'bg-severity-medium',
    high: 'bg-severity-high',
    critical: 'bg-severity-critical',
  };

  return (
    <div className={`w-full h-1.5 bg-background-secondary rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full ${severityConfig[level]} transition-all duration-300`}
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        aria-label={`${level} severity at ${percentage}%`}
      />
    </div>
  );
}
