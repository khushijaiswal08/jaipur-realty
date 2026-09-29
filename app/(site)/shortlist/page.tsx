import type { Metadata } from "next";
import { ShortlistView } from "@/components/property/shortlist-view";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/layout-primitives";
import { pageRobots } from "@/lib/seo/robots";

export const metadata: Metadata = {
  title: "Your shortlist",
  robots: pageRobots(false),
};

export default function ShortlistPage() {
  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shortlist" }]} />
      <h1 className="mb-6 mt-3 font-display text-3xl text-ink-950">Your shortlist</h1>
      <ShortlistView />
    </Container>
  );
}
