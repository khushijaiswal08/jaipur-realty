import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TOOLS } from "@/components/tools/tool-page";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/layout-primitives";
import { pageRobots } from "@/lib/seo/robots";

export const metadata: Metadata = {
  title: "Property Tools — EMI, Area Converter & Stamp Duty",
  description: "Free calculators for Jaipur property buyers: home loan EMI, area unit conversion and indicative Rajasthan stamp duty.",
  alternates: { canonical: "/tools" },
  robots: pageRobots(),
};

export default function ToolsPage() {
  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tools" }]} />
      <h1 className="mt-4 font-display text-3xl text-ink-950 sm:text-4xl">Property tools</h1>
      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {TOOLS.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="group block h-full rounded-card border border-ink-100 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover">
              <h2 className="font-semibold text-ink-950">{t.title}</h2>
              <p className="mt-1 text-sm text-ink-600">{t.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
