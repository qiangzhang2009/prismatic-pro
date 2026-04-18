import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'amber' | 'green' | 'red' | 'blue' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  default: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border)]',
  amber: 'bg-[var(--color-prism-amber-glow)] text-[var(--color-prism-amber)] border border-[var(--color-border-amber)]',
  green: 'bg-[rgba(74,222,128,0.1)] text-[var(--color-success)] border border-[rgba(74,222,128,0.2)]',
  red: 'bg-[rgba(248,113,113,0.1)] text-[var(--color-error)] border border-[rgba(248,113,113,0.2)]',
  blue: 'bg-[rgba(96,165,250,0.1)] text-[var(--color-info)] border border-[rgba(96,165,250,0.2)]',
  purple: 'bg-[rgba(212,130,196,0.1)] text-[#D482C4] border border-[rgba(212,130,196,0.2)]',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs rounded-full',
  md: 'px-2.5 py-1 text-xs rounded-full',
};

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
  domainColor?: string;
  className?: string;
}

const avatarSizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export function Avatar({ src, name, size = 'md', ring, domainColor, className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const ringStyle = ring
    ? { boxShadow: `0 0 0 2px var(--color-bg-surface), 0 0 0 4px ${domainColor || 'var(--color-prism-amber)'}` }
    : {};

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover shrink-0', avatarSizes[size], className)}
        style={ringStyle}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold shrink-0',
        avatarSizes[size],
        'bg-[var(--color-bg-elevated)] text-[var(--color-prism-amber)] border border-[var(--color-border)]',
        className
      )}
      style={ringStyle}
      title={name}
    >
      {initials}
    </div>
  );
}

interface ProgressBarProps {
  value: number; // 0-1
  size?: 'sm' | 'md';
  color?: string;
  className?: string;
}

export function ProgressBar({ value, size = 'md', color, className }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <div className={cn('w-full rounded-full bg-[var(--color-bg-elevated)]', className,
      size === 'sm' ? 'h-1' : 'h-1.5'
    )}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${clamped * 100}%`,
          backgroundColor: color || 'var(--color-prism-amber)',
        }}
      />
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('skeleton rounded-lg', className)} />
  );
}

interface DividerProps {
  className?: string;
}

export function Divider({ className }: DividerProps) {
  return <div className={cn('h-px bg-[var(--color-border)]', className)} />;
}
