import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Building2 } from "lucide-react";
import { ProjectCard } from "@/components/project/project-card";
import { WhatsAppButton } from "@/components/shared/contact-buttons";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form-controls";
import { Container, EmptyState } from "@/components/ui/layout-primitives";
import { ConstructionStatus } from "@/generated/prisma/enums";
import { BHK_OPTIONS, BUDGET_PRESETS, findBudgetPreset } from "@/lib/constants/budgets";
import { CONSTRUCTION_STATUS_LABELS } from "@/lib/constants/enums";
import { pageRobots } from "@/lib/seo/robots";
import { enumToSlug } from "@/lib/search/filters";
import { PROJECT_SEGMENTS, projectSegmentFromSlug } from "@/lib/search/search-tabs";
import { getLocalityLinks } from "@/services/locality.service";
import { listProjects } from "@/services/project-detail.service";

function statusFromSlug(slug: string | undefined): ConstructionStatus | undefined {
  if (!slug) return undefined;
  const key = slug.toUpperCase().replace(/-/g, "_");
  return (Object.values(ConstructionStatus) as string[]).includes(key) ? (key as ConstructionStatus) : undefined;
}

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

/** URL → project filters (locality, status, type segment, budget preset, BHK). Invalid values are dropped. */
function parseProjectFilters(sp: Record<string, string | string[] | undefined>) {
  const localityRaw = one(sp.locality);
  const segment = projectSegmentFromSlug(one(sp.type));
  const budget = findBudgetPreset("SALE", one(sp.budget));
  const bhk = [...new Set((one(sp.bhk) ?? "").split(",").map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 5))];
  return {
    locality: localityRaw && /^[a-z0-9-]{1,80}$/.test(localityRaw) ? localityRaw : undefined,
    status: statusFromSlug(one(sp.status)),
    segment,
    budget,
    bhk,
  };
}

export async function generateMetadata({ searchParams }: PageProps<"/projects">): Promise<Metadata> {
  const f = parseProjectFilters(await searchParams);
  const filtered = Boolean(f.locality || f.status || f.segment || f.budget || f.bhk.length);
  return {
    title: "New & Upcoming Projects in Jaipur — Builder Projects, Prices & Possession",
    description:
      "Explore new launch, under-construction and ready-to-move builder projects in Jaipur with configurations, price ranges and possession timelines.",
    alternates: { canonical: "/projects" },
    robots: pageRobots(!filtered),
  };
}

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
  const { locality, status, segment, budget, bhk } = parseProjectFilters(await searchParams);
  const category = PROJECT_SEGMENTS.find((s) => s.value === segment)?.category;
  const [projects, localities] = await Promise.all([
    listProjects({ locality, status, category, minPrice: budget?.min, maxPrice: budget?.max, bhk }),
    getLocalityLinks(),
  ]);
  const anyFilter = Boolean(locality || status || segment || budget || bhk.length);

  return (
    <>
      <div className="border-b border-ink-100 bg-white">
        <Container className="py-8 sm:py-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Projects" }]} />
          <h1 className="mt-3 font-display text-3xl leading-tight text-ink-950 sm:text-4xl">Projects in Jaipur</h1>
          <p className="mt-3 max-w-3xl text-ink-600">
            New launches, under-construction and ready-to-move projects — with unit configurations, price ranges and possession
            timelines in one place.
          </p>
          <form method="get" action="/projects" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto] lg:items-end">
            <FilterSelect id="p-locality" label="Locality" name="locality" value={locality} placeholder="All localities">
              {localities.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.name}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect id="p-type" label="Project type" name="type" value={segment} placeholder="Any type">
              {PROJECT_SEGMENTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect id="p-budget" label="Budget" name="budget" value={budget?.key} placeholder="Any budget">
              {BUDGET_PRESETS.SALE.map((b) => (
                <option key={b.key} value={b.key}>
                  {b.label}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect id="p-bhk" label="BHK" name="bhk" value={bhk.length === 1 ? String(bhk[0]) : undefined} placeholder="Any">
              {BHK_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect id="p-status" label="Status" name="status" value={status ? enumToSlug(status) : undefined} placeholder="Any status">
              {(Object.keys(CONSTRUCTION_STATUS_LABELS) as ConstructionStatus[]).map((s) => (
                <option key={s} value={enumToSlug(s)}>
                  {CONSTRUCTION_STATUS_LABELS[s]}
                </option>
              ))}
            </FilterSelect>
            <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-1">
              <Button type="submit" className="flex-1 lg:flex-none">
                Show projects
              </Button>
              {anyFilter ? (
                <Link href="/projects" className="text-sm font-semibold text-ink-600 hover:text-ink-950">
                  Clear
                </Link>
              ) : null}
            </div>
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
          <EmptyState icon={<Building2 />} title="No projects match" description="Try a different filter, or ask us about upcoming launches.">
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

function FilterSelect({ id, label, name, value, placeholder, children }: { id: string; label: string; name: string; value?: string; placeholder: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-800">
        {label}
      </label>
      <Select id={id} name={name} defaultValue={value ?? ""}>
        <option value="">{placeholder}</option>
        {children}
      </Select>
    </div>
  );
}
