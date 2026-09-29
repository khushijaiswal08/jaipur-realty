import type { Metadata } from "next";
import { CompareView } from "@/components/property/compare-view";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/layout-primitives";
import { pageRobots } from "@/lib/seo/robots";

export const metadata: Metadata = {
  title: "Compare properties",
  robots: pageRobots(false),
};

export default function ComparePage() {
  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Compare" }]} />
      <h1 className="mt-3 font-display text-3xl text-ink-950">Compare properties</h1>
      <p className="mb-6 mt-1 text-sm text-ink-500">Rows where the properties differ are highlighted.</p>
      <CompareView />
    </Container>
  );
}
