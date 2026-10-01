import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary:
          'gradient-primary text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        secondary:
          'bg-[var(--color-lavender-surface)] text-[var(--color-primary)] hover:bg-[var(--color-lavender-mist)]',
        outline:
          'border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent hover:bg-[var(--color-lavender-surface)]',
        ghost:
          'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-lavender-surface)]',
        danger:
          'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-full',
        md: 'h-10 px-5 text-sm rounded-full',
        lg: 'h-12 px-8 text-base rounded-full',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
