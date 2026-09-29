import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, FileDown, MapPin, ShieldCheck } from "lucide-react";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { LeadPanel } from "@/components/forms/lead-panel";
import { SiteVisitForm } from "@/components/forms/site-visit-form";
import { ConfigurationsTable } from "@/components/project/configurations-table";
import { ProjectCard } from "@/components/project/project-card";
import { Gallery } from "@/components/property/gallery";
import { PropertyGrid } from "@/components/property/property-card";
import { CallButton, WhatsAppButton } from "@/components/shared/contact-buttons";
import {
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
import { buttonVariants } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/layout-primitives";
import { absoluteUrl } from "@/lib/config";
import { resolveContact } from "@/lib/contact";
import { CONSTRUCTION_STATUS_LABELS } from "@/lib/constants/enums";
import { formatMonthYear } from "@/lib/format/date";
import { truncate } from "@/lib/format/labels";
import { formatNumberIN } from "@/lib/format/number";
import { formatPriceRange } from "@/lib/format/price";
import { projectUrl } from "@/lib/listing";
import { pageRobots } from "@/lib/seo/robots";
import { projectMessage } from "@/lib/whatsapp";
import {
  getOtherProjects,
  getProjectBySlug,
  getProjectListings,
  getPublishedProjectSlugs,
  type ProjectDetailDTO,
} from "@/services/project-detail.service";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getPublishedProjectSlugs()).map((slug) => ({ slug }));
}

function priceText(p: ProjectDetailDTO): string {
  return p.priceOnRequest ? "Price on Request" : formatPriceRange(p.priceMin, p.priceMax);
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) return { title: "Project not found", robots: pageRobots(false) };
  const title = p.seoTitle ?? `${p.name}, ${p.locality.name} — ${priceText(p)}`;
  const description =
    p.seoDescription ??
    truncate(
      `${p.name} by ${p.developerName} in ${p.locality.name}, Jaipur: ${p.unitSummary}. ${CONSTRUCTION_STATUS_LABELS[p.constructionStatus]}. ${p.description}`,
      158,
    );
  return {
    title,
    description,
    alternates: { canonical: projectUrl(p.slug) },
    robots: pageRobots(!p.isDemo),
    openGraph: { title, description, url: absoluteUrl(projectUrl(p.slug)) },
  };
}

function projectFacts(p: ProjectDetailDTO) {
  return [
    { label: "Status", value: CONSTRUCTION_STATUS_LABELS[p.constructionStatus], icon: "hard-hat" },
    p.launchDate ? { label: "Launched", value: formatMonthYear(p.launchDate), icon: "calendar" } : null,
    p.possessionDate ? { label: p.constructionStatus === "READY_TO_MOVE" ? "Possession since" : "Possession", value: formatMonthYear(p.possessionDate), icon: "calendar" } : null,
    p.totalUnits ? { label: "Total units", value: formatNumberIN(p.totalUnits), icon: "building" } : null,
    p.totalTowers ? { label: "Towers", value: String(p.totalTowers), icon: "building-2" } : null,
    p.totalFloors ? { label: "Floors per tower", value: String(p.totalFloors), icon: "layers" } : null,
    p.landAreaAcres ? { label: "Land area", value: `${formatNumberIN(p.landAreaAcres, 2)} acres`, icon: "land-plot" } : null,
    p.reraNumber ? { label: "RERA number", value: p.reraNumber, icon: "shield-check" } : null,
  ].filter((f): f is { label: string; value: string; icon: string } => f !== null);
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) notFound();
  const [listings, others] = await Promise.all([getProjectListings(p.id), getOtherProjects(p.id, p.locality.slug)]);

  const contact = resolveContact();
  const message = projectMessage({ name: p.name, localityName: p.locality.name, url: absoluteUrl(projectUrl(p.slug)) });
  const track = { projectId: p.id };

  return (
    <>
      <Container className="py-6 sm:py-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Projects", href: "/projects" }, { label: p.name }]} />

        {p.isDemo ? (
          <div className="mt-4">
            <Banner tone="demo" title="Demo project">
              This project and its developer are sample content that shows how projects appear on this website. It is not a real project.
            </Banner>
          </div>
        ) : null}

        <header className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="brand">{CONSTRUCTION_STATUS_LABELS[p.constructionStatus]}</Badge>
              {p.reraNumber ? (
                <Badge variant="rera">
                  <ShieldCheck aria-hidden="true" />
                  RERA {p.reraNumber}
                </Badge>
              ) : null}
              {p.isDemo ? <DemoBadge /> : null}
            </div>
            <h1 className="mt-2 font-display text-3xl leading-tight text-ink-950 sm:text-4xl">{p.name}</h1>
            <p className="mt-1 text-ink-600">by {p.developerName}</p>
            <p className="mt-2 flex items-start gap-1.5 text-ink-600">
              <MapPin className="mt-1 size-4 shrink-0 text-brand-600" aria-hidden="true" />
              <span>
                {p.address ? `${p.address} · ` : ""}
                <Link href={`/localities/${p.locality.slug}`} className="font-medium underline-offset-4 hover:text-brand-700 hover:underline">
                  {p.locality.name}
                </Link>
                {", Jaipur"}
              </span>
            </p>
          </div>
          <div className="shrink-0 lg:text-right">
            <p className="text-3xl font-bold tracking-tight text-ink-950">{priceText(p)}</p>
            <p className="mt-0.5 text-sm text-ink-500">{p.unitSummary}</p>
          </div>
        </header>

        <div className="mt-5 flex flex-wrap gap-2">
          <a href="#enquire" className={buttonVariants({ variant: "outline" })} data-track="brochure_cta" data-track-project={p.id}>
            <FileDown aria-hidden="true" />
            Request brochure
          </a>
          <ShareButton url={absoluteUrl(projectUrl(p.slug))} title={p.name} />
        </div>

        <div className="mt-6">
          <Gallery images={p.images} title={p.name} />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <DetailSection id="overview" title="Project overview">
              <FactsGrid facts={projectFacts(p)} />
            </DetailSection>

            {p.configurations.length ? (
              <DetailSection id="configurations" title="Configurations & prices">
                <ConfigurationsTable configurations={p.configurations} />
                <p className="mt-3 text-xs text-ink-500">Prices are indicative and exclude registration, stamp duty and other statutory charges.</p>
              </DetailSection>
            ) : null}

            {p.highlights.length ? (
              <DetailSection id="highlights" title="Highlights">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5 rounded-xl bg-sand-100 px-4 py-3 text-sm font-medium text-ink-800">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-600" aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
              </DetailSection>
            ) : null}

            <DetailSection id="about" title={`About ${p.name}`}>
              <Paragraphs text={p.description} />
            </DetailSection>

            {p.amenities.length ? (
              <DetailSection id="amenities" title="Amenities">
                <AmenitiesList amenities={p.amenities} />
              </DetailSection>
            ) : null}

            {p.videoUrl ? (
              <DetailSection id="video" title="Project video">
                <VideoEmbed url={p.videoUrl} title={`${p.name} — video`} />
              </DetailSection>
            ) : null}

            {p.map ? (
              <DetailSection id="location" title="Location">
                <LocationMap lat={p.map.lat} lng={p.map.lng} exact={p.map.exact} title={`Map of ${p.name}`} />
              </DetailSection>
            ) : null}

            {p.developerDescription ? (
              <DetailSection id="developer" title={`About ${p.developerName}`}>
                <Paragraphs text={p.developerDescription} />
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
              <p className="text-sm text-ink-500">{p.unitSummary}</p>
              <p className="text-2xl font-bold text-ink-950">{priceText(p)}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <WhatsAppButton contact={contact} message={message} context="project_detail" {...track} className="w-full" />
                <CallButton contact={contact} context="project_detail" {...track} className="w-full" />
              </div>
              <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-ink-400">
                <span className="h-px flex-1 bg-ink-100" />
                or send a request
                <span className="h-px flex-1 bg-ink-100" />
              </div>
              <LeadPanel
                tabs={[
                  {
                    id: "brochure",
                    label: "Get brochure",
                    content: (
                      <EnquiryForm
                        source="BROCHURE_REQUEST"
                        context={{ projectId: p.id }}
                        submitLabel="Get brochure & price sheet"
                        defaultMessage={`Please share the brochure, floor plans and payment plan for ${p.name}.`}
                        whatsappMessage={message}
                        contact={contact}
                        trackContext="project_detail"
                      />
                    ),
                  },
                  {
                    id: "visit",
                    label: "Book a visit",
                    content: <SiteVisitForm context={{ projectId: p.id }} contact={contact} whatsappMessage={message} trackContext="project_detail" />,
                  },
                ]}
              />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-ink-500">
              Project details, images and prices are indicative. Verify RERA registration, approvals and the agreement with a qualified
              professional before booking.
            </p>
          </aside>
        </div>
      </Container>

      {listings.length ? (
        <Section className="border-t border-ink-100 bg-white">
          <Container>
            <SectionHeading title={`Available in ${p.name}`} description="Resale and rental listings inside this project." />
            <PropertyGrid properties={listings} />
          </Container>
        </Section>
      ) : null}

      {others.length ? (
        <Section>
          <Container>
            <SectionHeading title="Other projects you may like" action={{ href: "/projects", label: "All projects" }} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => (
                <ProjectCard key={o.id} project={o} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <MobileContactBar contact={contact} message={message} track={track} />
    </>
  );
}
