import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-40 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover border border-primary',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-background-tertiary border border-border',
    ghost: 'bg-transparent text-foreground-secondary hover:bg-background-secondary border border-transparent',
    outline: 'bg-transparent text-foreground border-2 border-border hover:bg-background-secondary',
    danger: 'bg-severity-high text-severity-high-foreground hover:bg-severity-critical border border-severity-high',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function IconButton({
  children,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}: IconButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-40 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-background-tertiary',
    ghost: 'bg-transparent text-foreground-secondary hover:bg-background-secondary',
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ButtonGroup({ children, className = '' }: ButtonGroupProps) {
  return (
    <div className={`inline-flex gap-2 ${className}`}>
      {children}
    </div>
  );
}
