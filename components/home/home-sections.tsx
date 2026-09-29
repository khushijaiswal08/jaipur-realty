import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { PostCard } from "@/components/blog/post-card";
import { LocalityCard } from "@/components/locality/locality-card";
import { ProjectCard } from "@/components/project/project-card";
import { PropertyGrid } from "@/components/property/property-card";
import { CallButton, WhatsAppButton } from "@/components/shared/contact-buttons";
import { NamedIcon } from "@/components/shared/named-icon";
import { TestimonialCard } from "@/components/shared/testimonial-card";
import { buttonVariants } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/layout-primitives";
import { siteConfig } from "@/lib/config";
import { CATEGORY_SHORTCUTS, HERO_COPY, WHY_US } from "@/lib/constants/marketing";
import type { PostCardDTO, TestimonialDTO } from "@/services/content.service";
import type { LocalityCardDTO, LocalityLinkDTO } from "@/services/locality.service";
import type { ProjectCardDTO } from "@/services/project.service";
import type { PropertyCardDTO } from "@/services/property.service";
import { HeroSearch } from "./hero-search";

export function HomeHero({ localities, counts }: { localities: LocalityLinkDTO[]; counts: { sale: number; rent: number } }) {
  return (
    <section className="relative overflow-hidden bg-ink-950 bg-arches">
      <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-ink-900/95 to-brand-900/70" aria-hidden="true" />
      <Container className="relative pb-14 pt-12 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-300">{HERO_COPY.eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.1] text-white sm:text-5xl lg:text-6xl">{HERO_COPY.title}</h1>
          <p className="mt-4 max-w-2xl text-base text-ink-200 sm:text-lg">{HERO_COPY.subtitle}</p>
        </div>
        <div className="mt-8 max-w-4xl">
          <HeroSearch localities={localities} />
        </div>
        <p className="mt-4 text-sm text-ink-300">
          <Link href="/buy" className="font-semibold text-white underline-offset-4 hover:underline">
            {counts.sale} properties for sale
          </Link>
          {" · "}
          <Link href="/rent" className="font-semibold text-white underline-offset-4 hover:underline">
            {counts.rent} for rent
          </Link>
          {" across Jaipur"}
        </p>
      </Container>
    </section>
  );
}

export function CategoryShortcuts() {
  return (
    <Container className="-mt-7 relative z-10">
      <ul className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-2 shadow-card ring-1 ring-ink-900/5 sm:grid-cols-6">
        {CATEGORY_SHORTCUTS.map((c) => (
          <li key={c.label}>
            <Link
              href={c.href}
              className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center text-xs font-semibold text-ink-800 transition-colors hover:bg-brand-50 hover:text-brand-800 sm:text-sm"
            >
              <NamedIcon name={c.icon} className="size-6 text-brand-600" />
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}

export function FeaturedProperties({ properties }: { properties: PropertyCardDTO[] }) {
  if (!properties.length) return null;
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Handpicked"
          title="Featured properties"
          description="A selection of homes, plots and commercial spaces currently available across Jaipur."
          action={{ href: "/buy", label: "View all properties" }}
        />
        <PropertyGrid properties={properties} />
      </Container>
    </Section>
  );
}

export function PopularLocalities({ localities }: { localities: LocalityCardDTO[] }) {
  if (!localities.length) return null;
  return (
    <Section className="bg-white">
      <Container>
        <SectionHeading
          eyebrow="Explore Jaipur"
          title="Popular localities"
          description="Compare neighbourhoods by budget, connectivity and lifestyle."
          action={{ href: "/localities", label: "All locality guides" }}
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {localities.map((l) => (
            <LocalityCard key={l.id} locality={l} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function NewProjects({ projects }: { projects: ProjectCardDTO[] }) {
  if (!projects.length) return null;
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="New launches & ready projects"
          title="Projects in Jaipur"
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
    <Section className="bg-sand-100">
      <Container>
        <SectionHeading eyebrow={`Why ${siteConfig.name}`} title="Property search made simpler" align="center" />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_US.map((item) => (
            <li key={item.title} className="rounded-card bg-white p-6 shadow-card">
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <NamedIcon name={item.icon} className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold text-ink-950">{item.title}</h3>
              <p className="mt-2 text-sm text-ink-600">{item.body}</p>
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

export function PostPropertyCta() {
  return (
    <Section className="py-0 sm:py-0">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-brand-700 bg-arches px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl">Own a property in Jaipur?</h2>
              <p className="mt-2 text-brand-50">
                List it with us to reach genuine buyers and tenants. Share the details in two minutes — our team will call you to verify
                before anything goes live.
              </p>
            </div>
            <Link href="/post-property" className={buttonVariants({ variant: "secondary", size: "lg", className: "bg-white text-ink-950 hover:bg-brand-50" })}>
              <Plus aria-hidden="true" />
              Post your property
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function LatestPosts({ posts }: { posts: PostCardDTO[] }) {
  if (!posts.length) return null;
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Guides & insights"
          title="From the blog"
          action={{ href: "/blog", label: "Read the blog" }}
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function ContactStrip() {
  return (
    <Section className="pb-0 sm:pb-0">
      <Container>
        <div className="flex flex-col gap-6 rounded-3xl border border-ink-100 bg-white p-6 shadow-card sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-2xl text-ink-950">Can&apos;t find what you&apos;re looking for?</h2>
            <p className="mt-2 max-w-xl text-ink-600">
              Tell us your budget and preferred locality — we&apos;ll share matching options, including ones not yet listed online.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <WhatsAppButton context="home_contact_strip" size="lg" />
            <CallButton context="home_contact_strip" size="lg" showNumber />
            <Link href="/contact" className={buttonVariants({ variant: "ghost", size: "lg" })}>
              Send an enquiry
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
