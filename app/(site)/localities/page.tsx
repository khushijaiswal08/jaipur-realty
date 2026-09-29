import type { Metadata } from "next";
import { LocalityCard } from "@/components/locality/locality-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/layout-primitives";
import { pageRobots } from "@/lib/seo/robots";
import { getLocalityCards, type LocalityCardDTO } from "@/services/locality.service";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Jaipur Localities — Neighbourhood Guides, Property Rates & Listings",
  description:
    "Compare Jaipur neighbourhoods — Vaishali Nagar, Malviya Nagar, Mansarovar, C-Scheme, Jagatpura and more — by indicative rates, connectivity and live listings.",
  alternates: { canonical: "/localities" },
  robots: pageRobots(),
};

export default async function LocalitiesPage() {
  const localities = await getLocalityCards();
  const zones = new Map<string, LocalityCardDTO[]>();
  for (const l of localities) {
    const zone = l.zone ?? "Other";
    zones.set(zone, [...(zones.get(zone) ?? []), l]);
  }

  return (
    <>
      <div className="border-b border-ink-100 bg-white">
        <Container className="py-8 sm:py-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Localities" }]} />
          <h1 className="mt-3 font-display text-3xl leading-tight text-ink-950 sm:text-4xl">Explore Jaipur localities</h1>
          <p className="mt-3 max-w-3xl text-ink-600">
            Every neighbourhood has its own character, budget and commute. Use these guides to compare indicative rates, connectivity
            and what&apos;s currently available before you shortlist.
          </p>
        </Container>
      </div>
      <Container className="space-y-12 py-10">
        {[...zones.entries()].map(([zone, items]) => (
          <section key={zone} aria-labelledby={`zone-${zone}`}>
            <h2 id={`zone-${zone}`} className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-500">
              {zone} Jaipur
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((l) => (
                <LocalityCard key={l.id} locality={l} />
              ))}
            </div>
          </section>
        ))}
        <p className="text-xs text-ink-500">
          Rates marked “indicative” are approximate averages for guidance only and vary by project, floor, age and exact location.
        </p>
      </Container>
    </>
  );
}
