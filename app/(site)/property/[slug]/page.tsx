import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, BadgeCheck, Building2, MapPin, ShieldCheck, Star } from "lucide-react";
import { CompareButton } from "@/components/property/compare-controls";
import { Gallery } from "@/components/property/gallery";
import { PropertyGrid } from "@/components/property/property-card";
import { ShortlistButton } from "@/components/property/shortlist-button";
import { CallButton, WhatsAppButton } from "@/components/shared/contact-buttons";
import {
  AgentCard,
  AmenitiesList,
  Banner,
  DetailSection,
  FactsGrid,
  FaqList,
  MobileContactBar,
  Paragraphs,
} from "@/components/shared/detail-sections";
import { LocationMap } from "@/components/shared/location-map";
import { ShareButton } from "@/components/shared/share-button";
import { VideoEmbed } from "@/components/shared/video-embed";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container, SectionHeading } from "@/components/ui/layout-primitives";
import { absoluteUrl } from "@/lib/config";
import { resolveContact } from "@/lib/contact";
import { PROPERTY_TYPE_NOUNS, TRANSACTION_TYPE_BADGE, TRANSACTION_TYPE_PHRASE } from "@/lib/constants/enums";
import { formatBhk } from "@/lib/format/labels";
import { priceLabel, pricePerAreaLabel, primaryAreaLabel, propertyUrl, propertyWhatsAppMessage } from "@/lib/listing";
import { propertyFacts } from "@/lib/property-facts";
import { pageRobots } from "@/lib/seo/robots";
import { truncate } from "@/lib/format/labels";
import { listingPath } from "@/lib/search/filters";
import {
  findSlugByRefCode,
  getPropertyBySlug,
  getRecentPropertySlugs,
  getSimilarProperties,
  type PropertyDetailDTO,
} from "@/services/property-detail.service";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getRecentPropertySlugs(50);
  return slugs.map((slug) => ({ slug }));
}

function metaDescription(p: PropertyDetailDTO): string {
  const bits = [
    formatBhk(p.bedrooms, p.propertyType),
    `${PROPERTY_TYPE_NOUNS[p.propertyType].toLowerCase()} ${TRANSACTION_TYPE_PHRASE[p.transactionType].toLowerCase()} in ${p.locality.name}, Jaipur`,
  ].filter(Boolean);
  const facts = [primaryAreaLabel(p.primaryArea, true), priceLabel(p)].filter(Boolean).join(", ");
  return truncate(`${bits.join(" ")} — ${facts}. Ref ${p.refCode}. ${p.description.replace(/\s+/g, " ")}`, 158);
}

export async function generateMetadata({ params }: PageProps<"/property/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPropertyBySlug(slug);
  if (!p) return { title: "Property not found", robots: pageRobots(false) };
  const title = p.seoTitle ?? `${p.title} – ${priceLabel(p)}`;
  const description = p.seoDescription ?? metaDescription(p);
  return {
    title,
    description,
    alternates: { canonical: propertyUrl(p.slug) },
    // SPEC §31: demo records are never indexed.
    robots: pageRobots(!p.isDemo),
    openGraph: { type: "article", title, description, url: absoluteUrl(propertyUrl(p.slug)) },
  };
}

export default async function PropertyPage({ params }: PageProps<"/property/[slug]">) {
  const { slug } = await params;
  // Short links: /property/JP1001 → canonical slug.
  if (/^jp\d{3,}$/i.test(slug)) {
    const canonical = await findSlugByRefCode(slug);
    if (canonical) permanentRedirect(propertyUrl(canonical));
  }

  const p = await getPropertyBySlug(slug);
  if (!p) notFound();
  const similar = await getSimilarProperties(p);

  const contact = p.agent?.contact ?? resolveContact();
  const message = propertyWhatsAppMessage(p);
  const track = { propertyId: p.id };
  const perArea = pricePerAreaLabel(p);
  const facts = propertyFacts(p);
  const listPath = listingPath(p.transactionType);
  const unavailable = p.status === "SOLD" || p.status === "RENTED";

  return (
    <>
      <Container className="py-6 sm:py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: p.transactionType === "SALE" ? "Buy" : "Rent", href: listPath },
            { label: p.locality.name, href: `${listPath}/${p.locality.slug}` },
            { label: truncate(p.title, 48) },
          ]}
        />

        <div className="mt-4 space-y-3">
          {p.isDemo ? (
            <Banner tone="demo" title="Demo listing">
              This property is sample content that shows how listings appear on this website. It is not an actual property for sale or rent.
            </Banner>
          ) : null}
          {unavailable ? (
            <Banner tone="warning" title={`This property has been ${p.status === "SOLD" ? "sold" : "rented out"}`}>
              It&apos;s no longer available, but{" "}
              <a href="#similar" className="font-semibold underline underline-offset-2">
                similar properties
              </a>{" "}
              are listed below.
            </Banner>
          ) : null}
          {p.status === "UNDER_OFFER" ? (
            <Banner tone="info" title="Under offer">
              An offer has been accepted on this property. Enquire to be notified if it becomes available again.
            </Banner>
          ) : null}
        </div>

        <header className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="brand">{TRANSACTION_TYPE_BADGE[p.transactionType]}</Badge>
              {p.isVerified ? (
                <Badge variant="verified">
                  <BadgeCheck aria-hidden="true" />
                  Verified
                </Badge>
              ) : null}
              {p.isFeatured ? (
                <Badge variant="featured">
                  <Star aria-hidden="true" />
                  Featured
                </Badge>
              ) : null}
              {p.reraNumber ? (
                <Badge variant="rera">
                  <ShieldCheck aria-hidden="true" />
                  RERA registered
                </Badge>
              ) : null}
              {p.isDemo ? <DemoBadge /> : null}
            </div>
            <h1 className="mt-2 font-display text-2xl leading-tight text-ink-950 sm:text-3xl">{p.title}</h1>
            <p className="mt-2 flex items-start gap-1.5 text-ink-600">
              <MapPin className="mt-1 size-4 shrink-0 text-brand-600" aria-hidden="true" />
              <span>
                {p.landmark ? `${p.landmark}, ` : ""}
                <Link href={`/localities/${p.locality.slug}`} className="font-medium underline-offset-4 hover:text-brand-700 hover:underline">
                  {p.locality.name}
                </Link>
                {", Jaipur"}
                {p.project ? (
                  <>
                    {" · "}
                    <Link href={`/projects/${p.project.slug}`} className="inline-flex items-center gap-1 font-medium hover:text-brand-700">
                      <Building2 className="size-4" aria-hidden="true" />
                      {p.project.name}
                    </Link>
                  </>
                ) : null}
              </span>
            </p>
          </div>
          <div className="shrink-0 lg:text-right">
            <p className="text-3xl font-bold tracking-tight text-ink-950">{priceLabel(p)}</p>
            <p className="mt-0.5 text-sm text-ink-500">
              {[perArea, p.isNegotiable ? "Negotiable" : null, `Ref ${p.refCode}`].filter(Boolean).join(" · ")}
            </p>
          </div>
        </header>

        <div className="mt-5 flex flex-wrap gap-2">
          <ShortlistButton id={p.id} title={p.title} withLabel className="h-11 rounded-xl px-4" />
          <CompareButton id={p.id} />
          <ShareButton url={absoluteUrl(propertyUrl(p.slug))} title={p.title} />
        </div>

        <div className="mt-6">
          <Gallery images={p.images} title={p.title} />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <DetailSection id="overview" title="Overview">
              <FactsGrid facts={facts} />
            </DetailSection>

            <DetailSection id="description" title="About this property">
              <Paragraphs text={p.description} />
            </DetailSection>

            {p.amenities.length ? (
              <DetailSection id="amenities" title="Amenities">
                <AmenitiesList amenities={p.amenities} />
              </DetailSection>
            ) : null}

            {p.videoUrl ? (
              <DetailSection id="video" title="Video tour">
                <VideoEmbed url={p.videoUrl} title={`${p.title} — video tour`} />
              </DetailSection>
            ) : null}

            {p.map ? (
              <DetailSection id="location" title="Location">
                {p.address ? <p className="mb-3 text-ink-700">{p.address}</p> : null}
                <LocationMap lat={p.map.lat} lng={p.map.lng} exact={p.map.exact} title={`Map of ${p.locality.name}, Jaipur`} />
                <Link href={`/localities/${p.locality.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
                  Explore {p.locality.name}: prices, connectivity and more
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </DetailSection>
            ) : null}

            {p.faqs.length ? (
              <DetailSection id="faqs" title="Frequently asked questions">
                <FaqList faqs={p.faqs} />
              </DetailSection>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Contact">
            <div id="enquire" className="scroll-mt-24 rounded-card border border-ink-100 bg-white p-5 shadow-card">
              <p className="text-sm text-ink-500">{TRANSACTION_TYPE_BADGE[p.transactionType]}</p>
              <p className="text-2xl font-bold text-ink-950">{priceLabel(p)}</p>
              <h2 className="mt-4 font-semibold text-ink-950">Interested in this property?</h2>
              <p className="mt-1 text-sm text-ink-600">Call or WhatsApp us — mention reference {p.refCode}.</p>
              <div className="mt-4 grid gap-2">
                <WhatsAppButton contact={contact} message={message} context="property_detail" {...track} size="lg" className="w-full">
                  WhatsApp us
                </WhatsAppButton>
                <CallButton contact={contact} context="property_detail" {...track} size="lg" className="w-full" showNumber />
              </div>
            </div>
            {p.agent ? (
              <div className="mt-4">
                <AgentCard agent={p.agent} contextId={track} message={message} />
              </div>
            ) : null}
            <p className="mt-4 text-xs leading-relaxed text-ink-500">
              Details and images are indicative. Please verify documents, approvals and measurements independently before paying any
              amount.
            </p>
          </aside>
        </div>
      </Container>

      {similar.length ? (
        <section id="similar" className="scroll-mt-24 border-t border-ink-100 bg-white py-12">
          <Container>
            <SectionHeading
              title={`Similar properties ${TRANSACTION_TYPE_PHRASE[p.transactionType].toLowerCase()}`}
              action={{ href: `${listPath}/${p.locality.slug}`, label: `More in ${p.locality.name}` }}
            />
            <PropertyGrid properties={similar.slice(0, 4)} />
          </Container>
        </section>
      ) : null}

      {!unavailable ? <MobileContactBar contact={contact} message={message} track={track} /> : null}
    </>
  );
}
