import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Navigation } from "lucide-react";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { LocalityStats } from "@/components/locality/locality-stats";
import { ProjectCard } from "@/components/project/project-card";
import { PropertyGrid } from "@/components/property/property-card";
import { CallButton, WhatsAppButton } from "@/components/shared/contact-buttons";
import { FaqList, Paragraphs } from "@/components/shared/detail-sections";
import { LocationMap } from "@/components/shared/location-map";
import { SmartImage } from "@/components/shared/smart-image";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd, localityJsonLd } from "@/lib/seo/jsonld";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/layout-primitives";
import { absoluteUrl } from "@/lib/config";
import { formatPricePerUnit } from "@/lib/format/price";
import { truncate } from "@/lib/format/labels";
import { pageRobots } from "@/lib/seo/robots";
import { localityMessage } from "@/lib/whatsapp";
import {
  getLocalityBySlug,
  getLocalityListings,
  getLocalityProjects,
  getLocalitySlugs,
  getNearbyLocalities,
} from "@/services/locality-detail.service";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getLocalitySlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/localities/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const l = await getLocalityBySlug(slug);
  if (!l) return { title: "Locality not found", robots: pageRobots(false) };
  const title = l.seoTitle ?? `${l.name}, Jaipur — Property Rates, Homes for Sale & Rent`;
  const rate = l.avgPricePerSqft ? ` Indicative rate ~${formatPricePerUnit(l.avgPricePerSqft)}.` : "";
  const description =
    l.seoDescription ??
    truncate(`${l.name} locality guide: ${l.stats.saleCount} properties for sale and ${l.stats.rentCount} for rent.${rate} ${l.description ?? ""}`, 158);
  return {
    title,
    description,
    alternates: { canonical: `/localities/${l.slug}` },
    robots: pageRobots(),
    openGraph: { title, description, url: absoluteUrl(`/localities/${l.slug}`) },
  };
}

export default async function LocalityPage({ params }: PageProps<"/localities/[slug]">) {
  const { slug } = await params;
  const l = await getLocalityBySlug(slug);
  if (!l) notFound();

  const [sale, rent, projects, nearby] = await Promise.all([
    getLocalityListings(l.id, "SALE", 4),
    getLocalityListings(l.id, "RENT", 4),
    getLocalityProjects(l.id),
    getNearbyLocalities(l.id, 4),
  ]);
  const message = localityMessage(l.name);

  return (
    <>
      <JsonLd data={[localityJsonLd(l), faqJsonLd(l.faqs)]} />
      <section className="relative overflow-hidden bg-ink-950">
        <SmartImage src={l.image.url} alt="" fill priority sizes="100vw" className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/40" aria-hidden="true" />
        <Container className="relative py-10 sm:py-14">
          <Breadcrumbs tone="dark" items={[{ label: "Home", href: "/" }, { label: "Localities", href: "/localities" }, { label: l.name }]} />
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-brand-300">
            {[l.zone ? `${l.zone} Jaipur` : "Jaipur", l.pincode].filter(Boolean).join(" · ")}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-white sm:text-5xl">{l.name}</h1>
          {l.description ? <p className="mt-4 max-w-2xl text-ink-200">{truncate(l.description, 220)}</p> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/buy/${l.slug}`} className={buttonVariants({ size: "lg" })}>
              Properties for sale
            </Link>
            <Link href={`/rent/${l.slug}`} className={buttonVariants({ variant: "outline", size: "lg", className: "border-white/30 bg-white/10 text-white hover:bg-white/20" })}>
              Properties for rent
            </Link>
          </div>
        </Container>
      </section>

      <Container className="-mt-6 relative">
        <LocalityStats locality={l} />
      </Container>

      <Container className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-10">
          {l.description ? (
            <section aria-labelledby="about-title">
              <h2 id="about-title" className="mb-4 font-display text-2xl text-ink-950">
                About {l.name}
              </h2>
              <Paragraphs text={l.description} />
            </section>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2">
            {l.highlights.length ? (
              <section aria-labelledby="highlights-title" className="rounded-card border border-ink-100 bg-white p-5 shadow-card">
                <h2 id="highlights-title" className="mb-3 font-semibold text-ink-950">
                  Highlights
                </h2>
                <ul className="space-y-2 text-sm text-ink-700">
                  {l.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-600" aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {l.connectivity.length ? (
              <section aria-labelledby="connectivity-title" className="rounded-card border border-ink-100 bg-white p-5 shadow-card">
                <h2 id="connectivity-title" className="mb-3 font-semibold text-ink-950">
                  Connectivity
                </h2>
                <ul className="space-y-2 text-sm text-ink-700">
                  {l.connectivity.map((c) => (
                    <li key={c} className="flex gap-2">
                      <Navigation className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          {l.map ? (
            <section aria-labelledby="map-title">
              <h2 id="map-title" className="mb-4 font-display text-2xl text-ink-950">
                Where is {l.name}?
              </h2>
              <LocationMap lat={l.map.lat} lng={l.map.lng} exact={false} title={`Map of ${l.name}, Jaipur`} />
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-ink-100 bg-white p-5 shadow-card">
            <h2 className="font-semibold text-ink-950">Looking in {l.name}?</h2>
            <p className="mt-1 text-sm text-ink-600">Tell us your budget — we&apos;ll share options, including ones not listed online yet.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <WhatsAppButton context="locality_page" message={message} className="w-full" />
              <CallButton context="locality_page" className="w-full" />
            </div>
            <p className="mb-3 mt-5 text-sm font-semibold text-ink-950">Or request a callback</p>
            <EnquiryForm
              source="CALLBACK_REQUEST"
              fields="minimal"
              context={{ localityId: l.id }}
              submitLabel="Call me back"
              whatsappMessage={message}
              trackContext="locality_page"
            />
          </div>
          {nearby.length ? (
            <div className="rounded-card border border-ink-100 bg-white p-5 shadow-card">
              <h2 className="font-semibold text-ink-950">Nearby localities</h2>
              <ul className="mt-3 divide-y divide-ink-100">
                {nearby.map((n) => (
                  <li key={n.id}>
                    <Link href={`/localities/${n.slug}`} className="flex items-center justify-between py-2.5 text-sm hover:text-brand-700">
                      <span className="font-medium">{n.name}</span>
                      <span className="text-ink-500">{n.km !== null ? `~${n.km} km` : ""}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </Container>

      {sale.length ? (
        <Section className="border-t border-ink-100 bg-white">
          <Container>
            <SectionHeading title={`Properties for sale in ${l.name}`} action={{ href: `/buy/${l.slug}`, label: `All ${l.stats.saleCount} for sale` }} />
            <PropertyGrid properties={sale} />
          </Container>
        </Section>
      ) : null}

      {rent.length ? (
        <Section>
          <Container>
            <SectionHeading title={`Properties for rent in ${l.name}`} action={{ href: `/rent/${l.slug}`, label: `All ${l.stats.rentCount} for rent` }} />
            <PropertyGrid properties={rent} />
          </Container>
        </Section>
      ) : null}

      {projects.length ? (
        <Section className="bg-sand-100">
          <Container>
            <SectionHeading title={`Projects in ${l.name}`} action={{ href: `/projects?locality=${l.slug}`, label: "All projects" }} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {l.faqs.length ? (
        <Section>
          <Container className="max-w-3xl">
            <SectionHeading title={`${l.name}: frequently asked questions`} />
            <FaqList faqs={l.faqs} />
          </Container>
        </Section>
      ) : null}

      {!sale.length && !rent.length ? (
        <Container className="pb-4">
          <Link href="/buy" className="inline-flex items-center gap-1.5 font-semibold text-brand-700">
            Browse all properties in Jaipur <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Container>
      ) : null}
    </>
  );
}
