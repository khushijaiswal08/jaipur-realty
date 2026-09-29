import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("py-14 sm:py-20", className)} {...props} />;
}

/** Small uppercase label above a heading, with a short gold rule. */
export function Eyebrow({ children, tone = "dark", className }: { children: ReactNode; tone?: "dark" | "light"; className?: string }) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.2em] sm:text-[0.8rem]",
        tone === "light" ? "text-gold-300" : "text-gold-700",
        className,
      )}
    >
      <span className={cn("h-px w-8 shrink-0", tone === "light" ? "bg-gold-300" : "bg-gold-500")} aria-hidden="true" />
      {children}
    </p>
  );
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
        {eyebrow ? <Eyebrow className={cn("mb-3", align === "center" && "justify-center")}>{eyebrow}</Eyebrow> : null}
        <Heading className="font-display text-[1.75rem] font-semibold leading-tight tracking-tight text-brand-900 sm:text-4xl">{title}</Heading>
        {description ? <p className="mt-3 text-base leading-relaxed text-ink-600 sm:text-lg">{description}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-brand-600 underline decoration-gold-400 decoration-2 underline-offset-[6px] hover:text-brand-800"
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
