import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glow';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-[var(--transition-base)]',
        variant === 'default' && 'bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-bright)]',
        variant === 'elevated' && 'glass-elevated',
        variant === 'glow' && 'prism-card-active glow-amber',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pt-5 pb-3', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pb-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-5 pb-5 pt-3 border-t border-[var(--color-border)]', className)}
      {...props}
    />
  );
}
