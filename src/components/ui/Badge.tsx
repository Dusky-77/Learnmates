import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      icon,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center font-medium transition-colors';

    const variantStyles = {
      default:
        'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200',
      primary:
        'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
      secondary:
        'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200',
      success:
        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
      warning:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      danger:
        'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      outline:
        'border border-neutral-300 text-neutral-700 dark:border-neutral-600 dark:text-neutral-300 bg-transparent',
      ghost:
        'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 bg-transparent',
    };

    const sizeStyles = {
      xs: 'px-1.5 py-0.5 text-[10px] rounded gap-0.5',
      sm: 'px-2 py-0.5 text-xs rounded gap-1',
      md: 'px-2.5 py-1 text-sm rounded-lg gap-1.5',
      lg: 'px-3 py-1.5 text-base rounded-lg gap-2',
    };

    return (
      <span
        ref={ref}
        className={twMerge(clsx(baseStyles, variantStyles[variant], sizeStyles[size], className))}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;