// src/components/ui/badge.tsx
import * as React from "react";

export type BadgeVariant = "default" | "secondary" | "outline";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";

  const variants: Record<BadgeVariant, string> = {
    default: "bg-blue-600 text-white border-transparent",
    secondary: "bg-slate-200 text-slate-900 border-transparent",
    outline: "border-slate-300 text-slate-800",
  };

  const classes = [base, variants[variant], className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}
