import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { ProjectCard } from "@/components/project/project-card";
import { WhatsAppButton } from "@/components/shared/contact-buttons";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form-controls";
import { Container, EmptyState } from "@/components/ui/layout-primitives";
import { ConstructionStatus } from "@/generated/prisma/enums";
import { CONSTRUCTION_STATUS_LABELS } from "@/lib/constants/enums";
import { pageRobots } from "@/lib/seo/robots";
import { enumToSlug } from "@/lib/search/filters";
import { getLocalityLinks } from "@/services/locality.service";
import { listProjects } from "@/services/project-detail.service";

function statusFromSlug(slug: string | undefined): ConstructionStatus | undefined {
  if (!slug) return undefined;
  const key = slug.toUpperCase().replace(/-/g, "_");
  return (Object.values(ConstructionStatus) as string[]).includes(key) ? (key as ConstructionStatus) : undefined;
}

export async function generateMetadata({ searchParams }: PageProps<"/projects">): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Boolean(sp.locality || sp.status);
  return {
    title: "New & Upcoming Projects in Jaipur — Builder Projects, Prices & Possession",
    description:
      "Explore new launch, under-construction and ready-to-move builder projects in Jaipur with configurations, price ranges and possession timelines.",
    alternates: { canonical: "/projects" },
    robots: pageRobots(!filtered),
  };
}

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
  const sp = await searchParams;
  const locality = typeof sp.locality === "string" && /^[a-z0-9-]{1,80}$/.test(sp.locality) ? sp.locality : undefined;
  const status = statusFromSlug(typeof sp.status === "string" ? sp.status : undefined);
  const [projects, localities] = await Promise.all([listProjects({ locality, status }), getLocalityLinks()]);

  return (
    <>
      <div className="border-b border-ink-100 bg-white">
        <Container className="py-8 sm:py-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Projects" }]} />
          <h1 className="mt-3 font-display text-3xl leading-tight text-ink-950 sm:text-4xl">Projects in Jaipur</h1>
          <p className="mt-3 max-w-3xl text-ink-600">
            New launches, under-construction and ready-to-move projects — with unit configurations, price ranges and possession
            timelines in one place.
          </p>
          <form method="get" action="/projects" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="sm:w-64">
              <label htmlFor="p-locality" className="mb-1.5 block text-sm font-medium text-ink-800">
                Locality
              </label>
              <Select id="p-locality" name="locality" defaultValue={locality ?? ""}>
                <option value="">All localities</option>
                {localities.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:w-64">
              <label htmlFor="p-status" className="mb-1.5 block text-sm font-medium text-ink-800">
                Status
              </label>
              <Select id="p-status" name="status" defaultValue={status ? enumToSlug(status) : ""}>
                <option value="">Any status</option>
                {(Object.keys(CONSTRUCTION_STATUS_LABELS) as ConstructionStatus[]).map((s) => (
                  <option key={s} value={enumToSlug(s)}>
                    {CONSTRUCTION_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit">Show projects</Button>
            {locality || status ? (
              <Link href="/projects" className="text-sm font-semibold text-ink-600 hover:text-ink-950 sm:pb-3">
                Clear
              </Link>
            ) : null}
          </form>
        </Container>
      </div>
      <Container className="py-10">
        {projects.length ? (
          <>
            <h2 className="sr-only">Project listings</h2>
            <p className="mb-5 text-sm text-ink-500">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState icon={<Building2 />} title="No projects match" description="Try another locality or status, or ask us about upcoming launches.">
            <Link href="/projects" className="inline-flex h-11 items-center rounded-xl px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50">
              View all projects
            </Link>
            <WhatsAppButton context="projects_empty" message="Hi, I'd like to know about new and upcoming projects in Jaipur." />
          </EmptyState>
        )}
      </Container>
    </>
  );
}
