import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-lavender-surface)] text-[var(--color-primary)]',
        primary: 'bg-[var(--color-primary)] text-white',
        magenta: 'bg-[var(--color-pink-accent)] text-white',
        pink: 'bg-[var(--color-pink-blush)] text-[var(--color-magenta-text)]',
        outline: 'border border-[var(--color-border-light)] text-[var(--color-text-secondary)] bg-white/70 backdrop-blur-xs',
        glass: 'bg-white/80 text-[var(--color-primary)] backdrop-blur-md shadow-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(badgeVariants({ variant, className }))} {...props} />
  ),
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
