import type { Metadata } from "next";
import Link from "next/link";
import { CallButton, WhatsAppButton } from "@/components/shared/contact-buttons";
import { NamedIcon } from "@/components/shared/named-icon";
import { SmartImage } from "@/components/shared/smart-image";
import { DemoBadge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/layout-primitives";
import { siteConfig } from "@/lib/config";
import { ABOUT_COPY, WHY_US } from "@/lib/constants/marketing";
import { pageRobots } from "@/lib/seo/robots";
import { getActiveAgents } from "@/services/agent.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About Us",
  description: `${siteConfig.name} helps you buy, sell and rent homes, plots and commercial property across Jaipur.`,
  alternates: { canonical: "/about" },
  robots: pageRobots(),
};

export default async function AboutPage() {
  const agents = await getActiveAgents();
  return (
    <>
      <div className="bg-ink-950 bg-arches text-white">
        <Container className="py-12 sm:py-16">
          <Breadcrumbs tone="dark" items={[{ label: "Home", href: "/" }, { label: "About" }]} />
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">{ABOUT_COPY.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-200">{ABOUT_COPY.intro}</p>
        </Container>
      </div>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4 text-lg leading-relaxed text-ink-700">
            {ABOUT_COPY.story.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
            {siteConfig.reraAgentNumber ? <p className="text-sm text-ink-500">Rajasthan RERA agent registration: {siteConfig.reraAgentNumber}</p> : null}
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {WHY_US.map((w) => (
              <li key={w.title} className="rounded-card border border-ink-100 bg-white p-5 shadow-card">
                <NamedIcon name={w.icon} className="size-6 text-brand-600" />
                <h2 className="mt-3 font-semibold text-ink-950">{w.title}</h2>
                <p className="mt-1 text-sm text-ink-600">{w.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {agents.length ? (
        <Section className="bg-white">
          <Container>
            <SectionHeading title="Our team" description="Talk to a consultant who knows your neighbourhood." />
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {agents.map((a) => (
                <li key={a.id} className="rounded-card border border-ink-100 bg-sand-50 p-5 text-center">
                  <div className="relative mx-auto size-24 overflow-hidden rounded-full bg-ink-100">
                    <SmartImage src={a.photo.url} alt={a.photo.alt} fill sizes="96px" className="object-cover" />
                  </div>
                  <p className="mt-3 font-semibold text-ink-950">{a.name}</p>
                  {a.designation ? <p className="text-sm text-ink-500">{a.designation}</p> : null}
                  {a.isDemo ? <DemoBadge label="Demo profile" className="mt-2" /> : null}
                  {a.languages.length ? <p className="mt-2 text-xs text-ink-500">{a.languages.join(" · ")}</p> : null}
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <Section>
        <Container>
          <div className="flex flex-col items-start gap-5 rounded-3xl border border-ink-100 bg-white p-8 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl text-ink-950">Let&apos;s find the right property</h2>
              <p className="mt-1 text-ink-600">Share your requirement and we&apos;ll get back with options.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <WhatsAppButton context="about" />
              <CallButton context="about" showNumber />
              <Link href="/contact" className={buttonVariants({ variant: "ghost" })}>
                Contact page
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
