import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { PostCard } from "@/components/blog/post-card";
import { LocationCard } from "@/components/locality/location-card";
import { ProjectCard } from "@/components/project/project-card";
import { PropertyGrid } from "@/components/property/property-card";
import { SearchBar } from "@/components/search/search-bar";
import { CallButton, WhatsAppButton } from "@/components/shared/contact-buttons";
import { NamedIcon } from "@/components/shared/named-icon";
import { TestimonialCard } from "@/components/shared/testimonial-card";
import { buttonVariants } from "@/components/ui/button";
import { Container, Eyebrow, Section, SectionHeading } from "@/components/ui/layout-primitives";
import { formattedAddress, siteConfig } from "@/lib/config";
import { HERO_COPY, WHY_US } from "@/lib/constants/marketing";
import { cn } from "@/lib/utils";
import type { PostCardDTO, TestimonialDTO } from "@/services/content.service";
import type { CategoryTileDTO, PopularSearchDTO } from "@/services/home.service";
import type { LocalityCardDTO, LocalityLinkDTO } from "@/services/locality.service";
import type { ProjectCardDTO } from "@/services/project.service";
import type { PropertyCardDTO } from "@/services/property.service";
import type { TrustMetricDTO } from "@/services/settings.service";

export function HomeHero({ localities, popularSearches }: { localities: LocalityLinkDTO[]; popularSearches: PopularSearchDTO[] }) {
  return (
    <section className="relative overflow-hidden bg-brand-900 bg-arches">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900/95 to-brand-700/85" aria-hidden="true" />
      <div className="absolute -right-32 -top-32 size-96 rounded-full bg-gold-500/10 blur-3xl" aria-hidden="true" />
      <Container className="relative pb-24 pt-12 sm:pb-28 sm:pt-16 lg:pb-32 lg:pt-20">
        <div className="max-w-3xl">
          <Eyebrow tone="light">{HERO_COPY.eyebrow}</Eyebrow>
          <h1 className="mt-4 font-display text-[2.4rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {HERO_COPY.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-100 sm:text-lg">{HERO_COPY.subtitle}</p>
        </div>

        <div className="mt-9 max-w-5xl">
          <SearchBar localities={localities} idPrefix="hero" />
        </div>

        {popularSearches.length ? <PopularSearches items={popularSearches} /> : null}
      </Container>
    </section>
  );
}

function PopularSearches({ items }: { items: PopularSearchDTO[] }) {
  return (
    <nav aria-label="Popular searches" className="mt-6 max-w-5xl">
      <h2 className="mb-2.5 text-xs font-bold uppercase tracking-[0.18em] text-gold-300">Popular searches</h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white ring-1 ring-white/15 transition-colors hover:bg-white hover:text-brand-900"
            >
              {s.label}
              <span className="text-xs text-gold-300">({s.count})</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const METRIC_COLUMNS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

/** Trust numbers from Admin → Site settings (live counts or business-supplied values). */
export function TrustMetrics({ metrics }: { metrics: TrustMetricDTO[] }) {
  if (!metrics.length) return null;
  return (
    <Container className="relative z-10 -mt-14 sm:-mt-16">
      <dl className={cn("grid overflow-hidden rounded-2xl bg-white shadow-card-hover ring-1 ring-brand-900/5", METRIC_COLUMNS[metrics.length])}>
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={cn(
              "flex flex-col-reverse gap-1 border-ink-100 px-3 py-6 text-center sm:px-6 sm:py-7",
              i % 2 === 1 && "border-l",
              metrics.length === 4 && i >= 2 && "border-t lg:border-t-0",
              metrics.length === 4 && i === 2 && "lg:border-l",
              metrics.length === 3 && i > 0 && "border-l",
            )}
          >
            <dt className="text-xs font-semibold text-ink-500 sm:text-sm">{m.label}</dt>
            <dd className="font-display text-3xl font-semibold text-brand-900 sm:text-4xl">
              {m.value}
              <span className="mx-auto mt-2 block h-0.5 w-8 rounded-full bg-gold-500" aria-hidden="true" />
            </dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}

export function FeaturedProperties({ properties }: { properties: PropertyCardDTO[] }) {
  if (!properties.length) return null;
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Handpicked for you"
          title="Featured properties"
          description="Homes, plots and commercial spaces currently available across Jaipur."
          action={{ href: "/buy", label: "View all properties" }}
        />
        <PropertyGrid properties={properties} />
      </Container>
    </Section>
  );
}

export function PropertyCategories({ tiles }: { tiles: CategoryTileDTO[] }) {
  if (!tiles.length) return null;
  return (
    <Section className="bg-surface-50">
      <Container>
        <SectionHeading eyebrow="Browse by type" title="Property categories" />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
          {tiles.map((t) => (
            <li key={t.key}>
              <Link
                href={t.href}
                className="group flex h-full flex-col rounded-card border border-ink-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-card sm:p-5"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-gold-50 text-gold-700 ring-1 ring-gold-200 transition-colors group-hover:bg-brand-600 group-hover:text-gold-300 group-hover:ring-brand-600">
                  <NamedIcon name={t.icon} className="size-5" />
                </span>
                <span className="mt-4 font-semibold leading-snug text-brand-900">{t.label}</span>
                <span className="mt-1 hidden text-sm leading-snug text-ink-500 sm:block">{t.description}</span>
                <span className="mt-auto pt-3 text-sm font-bold text-gold-700">{countLabel(t)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function countLabel(t: CategoryTileDTO): string {
  if (t.count === 0) return "Ask us for options";
  const noun = t.key === "projects" ? "project" : "listing";
  return `${t.count} ${noun}${t.count === 1 ? "" : "s"}`;
}

export function PopularLocations({ localities }: { localities: LocalityCardDTO[] }) {
  if (!localities.length) return null;
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Explore Jaipur"
          title="Popular Jaipur locations"
          description="Compare neighbourhoods by budget, connectivity and lifestyle."
          action={{ href: "/localities", label: "All locality guides" }}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {localities.map((l) => (
            <LocationCard key={l.id} locality={l} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function NewProjects({ projects }: { projects: ProjectCardDTO[] }) {
  if (!projects.length) return null;
  return (
    <Section className="bg-surface-50">
      <Container>
        <SectionHeading
          eyebrow="New launches & ready to move"
          title="New projects in Jaipur"
          description="Builder projects with configurations, price ranges and possession timelines."
          action={{ href: "/projects", label: "View all projects" }}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function WhyChooseUs() {
  return (
    <Section className="relative overflow-hidden bg-brand-900 bg-arches text-white">
      <Container className="relative">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <Eyebrow tone="light" className="justify-center">
            Why {siteConfig.name}
          </Eyebrow>
          <h2 className="mt-3 font-display text-[1.75rem] font-semibold leading-tight sm:text-4xl">Property search, made personal</h2>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_US.map((item) => (
            <li key={item.title} className="rounded-card bg-white/[0.06] p-6 ring-1 ring-white/10">
              <span className="flex size-11 items-center justify-center rounded-xl bg-gold-500/15 text-gold-300 ring-1 ring-gold-400/30">
                <NamedIcon name={item.icon} className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-100">{item.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export function Testimonials({ testimonials }: { testimonials: TestimonialDTO[] }) {
  if (!testimonials.length) return null;
  return (
    <Section>
      <Container>
        <SectionHeading eyebrow="Client stories" title="What our clients say" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 3).map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function LatestPosts({ posts }: { posts: PostCardDTO[] }) {
  if (!posts.length) return null;
  return (
    <Section className="bg-surface-50">
      <Container>
        <SectionHeading eyebrow="Guides & insights" title="From the blog" action={{ href: "/blog", label: "Read the blog" }} />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

/** Closing call to action: list a property, or talk to us directly. */
export function HomeCta() {
  return (
    <Section>
      <Container className="grid gap-5 lg:grid-cols-5">
        <div className="relative overflow-hidden rounded-3xl bg-brand-900 bg-arches px-6 py-10 text-white sm:px-10 sm:py-12 lg:col-span-3">
          <div className="absolute -bottom-24 -right-24 size-72 rounded-full bg-gold-500/15 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-xl">
            <Eyebrow tone="light">For owners</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">Own a property in Jaipur?</h2>
            <p className="mt-3 leading-relaxed text-brand-100">
              List it with us to reach genuine buyers and tenants. Share the details in two minutes — our team calls you to verify before
              anything goes live.
            </p>
            <Link href="/post-property" className={buttonVariants({ variant: "accent", size: "lg", className: "mt-7" })}>
              <Plus aria-hidden="true" />
              Post your property
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 rounded-3xl border border-ink-100 bg-white p-6 shadow-card sm:p-10 lg:col-span-2">
          <div>
            <h2 className="font-display text-2xl font-semibold text-brand-900">Can&apos;t find what you need?</h2>
            <p className="mt-3 leading-relaxed text-ink-600">
              Tell us your budget and preferred locality — we&apos;ll share matching options, including ones not listed online yet.
            </p>
            <p className="mt-3 text-sm text-ink-500">{formattedAddress()}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <WhatsAppButton context="home_cta" size="lg" className="flex-1" />
            <CallButton context="home_cta" size="lg" className="flex-1" />
            <Link href="/contact" className={buttonVariants({ variant: "ghost", size: "lg", className: "w-full" })}>
              Send an enquiry
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
