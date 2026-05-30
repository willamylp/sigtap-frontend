import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/lib/labels";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors whitespace-nowrap",
  {
    variants: {
      // Tons "soft": fundo levemente tingido + texto escuro (claro) / claro (escuro),
      // garantindo contraste legível em ambos os temas.
      tone: {
        neutral: "border-border bg-muted text-muted-foreground",
        primary:
          "border-transparent bg-primary/10 text-primary dark:text-indigo-300",
        success:
          "border-transparent bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
        warning:
          "border-transparent bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
        danger:
          "border-transparent bg-red-500/15 text-red-700 dark:bg-red-500/15 dark:text-red-400",
        info: "border-transparent bg-sky-500/15 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  tone?: BadgeTone;
}

function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { Badge, badgeVariants };
