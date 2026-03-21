import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";
import type { ReactNode, HTMLAttributes } from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand-500/20 text-brand-400 border border-brand-500/30",
        success: "bg-success/20 text-green-400 border border-green-500/30",
        danger: "bg-danger/20 text-red-400 border border-red-500/30",
        warning: "bg-warning/20 text-amber-400 border border-amber-500/30",
        muted: "bg-surface-300 text-surface-700 border border-surface-400",
        paper: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        live: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof badgeVariants> {
  children?: ReactNode;
}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export { Badge, badgeVariants, type BadgeProps };
