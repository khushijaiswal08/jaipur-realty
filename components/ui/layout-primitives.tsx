import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("py-12 sm:py-16", className)} {...props} />;
}

export interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: { href: string; label: string };
  as?: "h1" | "h2";
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, action, as = "h2", align = "left", className }: SectionHeadingProps) {
  const Heading = as;
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "items-center text-center sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-700">{eyebrow}</p> : null}
        <Heading className="font-display text-2xl leading-tight text-ink-950 sm:text-3xl">{title}</Heading>
        {description ? <p className="mt-3 text-base text-ink-600">{description}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          {action.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-lg bg-ink-100", className)} aria-hidden="true" {...props} />;
}

export function EmptyState({
  icon,
  title,
  description,
  children,
  className,
  headingLevel = 2,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** 1 when the empty state is the whole page (404). */
  headingLevel?: 1 | 2;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <div className={cn("rounded-card border border-dashed border-ink-200 bg-white px-6 py-12 text-center", className)}>
      {icon ? <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-700 [&_svg]:size-6">{icon}</div> : null}
      <Heading className="text-lg font-semibold text-ink-950">{title}</Heading>
      {description ? <div className="mx-auto mt-2 max-w-md text-sm text-ink-600">{description}</div> : null}
      {children ? <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div> : null}
    </div>
  );
}
