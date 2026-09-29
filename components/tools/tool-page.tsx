import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/layout-primitives";
import { cn } from "@/lib/utils";

export const TOOLS = [
  { href: "/tools/emi-calculator", title: "EMI calculator", description: "Monthly instalment, interest and total cost of a home loan." },
  { href: "/tools/area-converter", title: "Area converter", description: "Sq ft, sq yd (Gaj), sq m, acres, hectares and bigha." },
  { href: "/tools/stamp-duty", title: "Stamp duty estimator", description: "Indicative stamp duty and registration in Rajasthan." },
] as const;

export function ToolPage({ title, intro, current, children }: { title: string; intro: string; current: string; children: ReactNode }) {
  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools" }, { label: title }]} />
      <h1 className="mt-4 font-display text-3xl text-ink-950 sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-ink-600">{intro}</p>
      <div className="mt-8 rounded-card border border-ink-100 bg-white p-5 shadow-card sm:p-8">{children}</div>
      <nav aria-label="Other tools" className="mt-8 flex flex-wrap gap-2">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={t.href === current ? "page" : undefined}
            className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", t.href === current ? "bg-ink-900 text-white" : "bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50")}
          >
            {t.title}
          </Link>
        ))}
      </nav>
    </Container>
  );
}
