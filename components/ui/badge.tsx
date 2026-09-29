import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "neutral" | "brand" | "demo" | "verified" | "featured" | "rera" | "warning" | "danger" | "dark";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-ink-50 text-ink-700 ring-ink-200",
  brand: "bg-brand-50 text-brand-800 ring-brand-200",
  demo: "bg-warning-50 text-warning-600 ring-warning-600/30 border-dashed",
  verified: "bg-success-50 text-success-700 ring-success-600/25",
  featured: "bg-gold-100 text-gold-600 ring-gold-600/25",
  rera: "bg-ink-50 text-ink-800 ring-ink-300",
  warning: "bg-warning-50 text-warning-600 ring-warning-600/25",
  danger: "bg-danger-50 text-danger-700 ring-danger-600/25",
  dark: "bg-ink-900/85 text-white ring-transparent backdrop-blur",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset [&_svg]:size-3.5",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

/** Visible marker for demo content (SPEC §35.1). */
export function DemoBadge({ label = "Demo", className }: { label?: string; className?: string }) {
  return (
    <Badge variant="demo" className={className} title="Demo content — for illustration only">
      {label}
    </Badge>
  );
}
