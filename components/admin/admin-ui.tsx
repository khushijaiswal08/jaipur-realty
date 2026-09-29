import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, back }: { title: string; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back ? (
          <Link href={back.href} className="mb-1 inline-block text-sm text-ink-500 hover:text-ink-900">
            ← {back.label}
          </Link>
        ) : null}
        <h1 className="text-2xl font-semibold text-ink-950">{title}</h1>
        {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-card border border-ink-100 bg-white", className)}>
      {title ? (
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
          <h2 className="font-semibold text-ink-950">{title}</h2>
          {action}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint, href, tone = "default" }: { label: string; value: ReactNode; hint?: ReactNode; href?: string; tone?: "default" | "brand" | "warning" }) {
  const body = (
    <>
      <p className="text-sm text-ink-500">{label}</p>
      <p className={cn("mt-1 text-3xl font-bold", tone === "brand" ? "text-brand-700" : tone === "warning" ? "text-warning-600" : "text-ink-950")}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </>
  );
  const cls = "block rounded-card border border-ink-100 bg-white p-5";
  return href ? (
    <Link href={href} className={cn(cls, "transition-shadow hover:shadow-card")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

const PILL_TONES = {
  gray: "bg-ink-100 text-ink-700",
  blue: "bg-sky-50 text-sky-700",
  green: "bg-success-50 text-success-700",
  amber: "bg-warning-50 text-warning-600",
  red: "bg-danger-50 text-danger-700",
  brand: "bg-brand-50 text-brand-800",
} as const;

export type PillTone = keyof typeof PILL_TONES;

export function Pill({ tone = "gray", children }: { tone?: PillTone; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold", PILL_TONES[tone])}>{children}</span>;
}

/** Scrollable table wrapper with consistent styling. */
export function Table({ children, minWidth = "48rem" }: { children: ReactNode; minWidth?: string }) {
  return (
    <div className="relative overflow-x-auto rounded-card border border-ink-100 bg-white">
      <table className="w-full text-sm" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500";
export const td = "px-4 py-3 align-top text-ink-800";

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-ink-500">
        {children}
      </td>
    </tr>
  );
}
