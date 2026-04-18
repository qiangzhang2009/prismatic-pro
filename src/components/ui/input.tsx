'use client';

import { cn } from '@/lib/utils';
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text-secondary)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-lg',
            'bg-[var(--color-bg-elevated)] border border-[var(--color-border)]',
            'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
            'focus:outline-none focus:border-[var(--color-prism-amber)] focus:ring-1 focus:ring-[var(--color-prism-amber)]',
            'transition-colors duration-[var(--transition-fast)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--color-text-tertiary)]">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
