import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const pillVariants = cva(
  'inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer select-none border',
  {
    variants: {
      active: {
        true: 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm scale-[1.02]',
        false: 'bg-white/80 hover:bg-white text-[var(--color-text-secondary)] border-[var(--color-border-light)] hover:text-[var(--color-primary)] hover:border-[var(--color-violet-soft)]',
      },
      size: {
        sm: 'h-7 px-3 text-xs',
        md: 'h-9 px-4 text-xs md:text-sm',
        lg: 'h-11 px-5 text-sm',
      },
    },
    defaultVariants: {
      active: false,
      size: 'md',
    },
  },
);

export interface PillProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pillVariants> {
  active?: boolean;
}

const Pill = forwardRef<HTMLButtonElement, PillProps>(
  ({ className, active, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(pillVariants({ active, size, className }))}
        {...props}
      />
    );
  },
);
Pill.displayName = 'Pill';

export { Pill, pillVariants };
