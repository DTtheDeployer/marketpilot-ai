import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-500/20",
        secondary:
          "bg-surface-200 text-surface-900 hover:bg-surface-300 border border-surface-400",
        outline:
          "border border-surface-400 bg-transparent text-surface-900 hover:bg-surface-200 hover:border-surface-500",
        ghost: "text-surface-800 hover:bg-surface-200 hover:text-surface-900",
        danger:
          "bg-danger text-white hover:bg-red-500 shadow-lg shadow-red-500/20",
        success:
          "bg-success text-white hover:bg-green-400 shadow-lg shadow-green-500/20",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants, type ButtonProps };
