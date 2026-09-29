import "server-only";

import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import type { PropertyCategory, PropertyType } from "@/generated/prisma/enums";
import { PROPERTY_TYPE_CATEGORY } from "@/lib/constants/enums";
import { db } from "@/lib/db";
import { placeholderImage } from "@/lib/images";
import type { AmenityDTO, GalleryImageDTO } from "./property-detail.service";
import { projectCardSelect, publishedProjectWhere, summariseUnits, toProjectCard, type ProjectCardDTO } from "./project.service";
import { propertyCardSelect, publicListingWhere, toMoney, toPropertyCard, type PropertyCardDTO } from "./property.service";

const projectDetailInclude = {
  locality: { select: { id: true, name: true, slug: true, zone: true, latitude: true, longitude: true } },
  images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
  configurations: { orderBy: { sortOrder: "asc" } },
  amenities: { orderBy: [{ category: "asc" }, { sortOrder: "asc" }] },
  faqs: { where: { isPublished: true }, orderBy: { sortOrder: "asc" }, select: { id: true, question: true, answer: true } },
} satisfies Prisma.ProjectInclude;

type ProjectDetailRow = Prisma.ProjectGetPayload<{ include: typeof projectDetailInclude }>;

export interface ConfigurationDTO {
  id: string;
  label: string;
  propertyType: ProjectDetailRow["configurations"][number]["propertyType"];
  bedrooms: number | null;
  carpetAreaMin: number | null;
  carpetAreaMax: number | null;
  superAreaMin: number | null;
  superAreaMax: number | null;
  priceMin: number | null;
  priceMax: number | null;
  unitsAvailable: number | null;
  floorPlanUrl: string | null;
}

export interface ProjectDetailDTO {
  id: string;
  slug: string;
  name: string;
  developerName: string;
  developerDescription: string | null;
  reraNumber: string | null;
  constructionStatus: ProjectDetailRow["constructionStatus"];
  launchDate: string | null;
  possessionDate: string | null;
  totalUnits: number | null;
  totalTowers: number | null;
  totalFloors: number | null;
  landAreaAcres: number | null;
  description: string;
  highlights: string[];
  priceMin: number | null;
  priceMax: number | null;
  priceOnRequest: boolean;
  address: string | null;
  map: { lat: number; lng: number; exact: boolean } | null;
  locality: { id: string; name: string; slug: string; zone: string | null };
  brochureUrl: string | null;
  videoUrl: string | null;
  images: GalleryImageDTO[];
  configurations: ConfigurationDTO[];
  amenities: AmenityDTO[];
  faqs: Array<{ id: string; question: string; answer: string }>;
  unitSummary: string;
  isFeatured: boolean;
  isDemo: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
}

function toDetail(row: ProjectDetailRow): ProjectDetailDTO {
  const map =
    row.latitude !== null && row.longitude !== null
      ? { lat: row.latitude, lng: row.longitude, exact: true }
      : row.locality.latitude !== null && row.locality.longitude !== null
        ? { lat: row.locality.latitude, lng: row.locality.longitude, exact: false }
        : null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    developerName: row.developerName,
    developerDescription: row.developerDescription,
    reraNumber: row.reraNumber,
    constructionStatus: row.constructionStatus,
    launchDate: row.launchDate?.toISOString() ?? null,
    possessionDate: row.possessionDate?.toISOString() ?? null,
    totalUnits: row.totalUnits,
    totalTowers: row.totalTowers,
    totalFloors: row.totalFloors,
    landAreaAcres: row.landAreaAcres,
    description: row.description,
    highlights: row.highlights,
    priceMin: toMoney(row.priceMin),
    priceMax: toMoney(row.priceMax),
    priceOnRequest: row.priceOnRequest,
    address: row.address,
    map,
    locality: { id: row.locality.id, name: row.locality.name, slug: row.locality.slug, zone: row.locality.zone },
    brochureUrl: row.brochureUrl,
    videoUrl: row.videoUrl,
    images: row.images.length
      ? row.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt, width: i.width, height: i.height, kind: i.kind, caption: i.caption }))
      : [{ id: "placeholder", ...placeholderImage("project", row.name), kind: "PHOTO", caption: null }],
    configurations: row.configurations.map((c) => ({
      id: c.id,
      label: c.label,
      propertyType: c.propertyType,
      bedrooms: c.bedrooms,
      carpetAreaMin: c.carpetAreaMin,
      carpetAreaMax: c.carpetAreaMax,
      superAreaMin: c.superAreaMin,
      superAreaMax: c.superAreaMax,
      priceMin: toMoney(c.priceMin),
      priceMax: toMoney(c.priceMax),
      unitsAvailable: c.unitsAvailable,
      floorPlanUrl: c.floorPlanUrl,
    })),
    amenities: row.amenities.map((a) => ({ name: a.name, slug: a.slug, icon: a.icon, category: a.category })),
    faqs: row.faqs,
    unitSummary: summariseUnits(row.configurations),
    isFeatured: row.isFeatured,
    isDemo: row.isDemo,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const getProjectBySlug = cache(async (slug: string): Promise<ProjectDetailDTO | null> => {
  const row = await db.project.findFirst({ where: { slug, ...publishedProjectWhere }, include: projectDetailInclude });
  return row ? toDetail(row) : null;
});

/** Resale/rental listings inside a project. */
export async function getProjectListings(projectId: string, limit = 8): Promise<PropertyCardDTO[]> {
  const rows = await db.property.findMany({
    where: { ...publicListingWhere, projectId },
    select: propertyCardSelect,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
  return rows.map(toPropertyCard);
}

export interface ProjectListFilters {
  locality?: string;
  status?: ProjectDetailRow["constructionStatus"];
  /** Unit category a project must offer (from its configurations). */
  category?: PropertyCategory;
  /** Whole rupees; matches projects whose price range overlaps. */
  minPrice?: number;
  maxPrice?: number;
  /** 1–5, where 5 means "5 or more". */
  bhk?: number[];
}

/** Configuration-level conditions: a single unit type must satisfy both category and BHK. */
function configurationWhere(f: ProjectListFilters): Prisma.ConfigurationWhereInput | undefined {
  const and: Prisma.ConfigurationWhereInput[] = [];
  if (f.category) {
    const types = (Object.keys(PROPERTY_TYPE_CATEGORY) as PropertyType[]).filter((t) => PROPERTY_TYPE_CATEGORY[t] === f.category);
    and.push({ propertyType: { in: types } });
  }
  if (f.bhk?.length) {
    const exact = f.bhk.filter((n) => n < 5);
    and.push({ OR: [...(exact.length ? [{ bedrooms: { in: exact } }] : []), ...(f.bhk.includes(5) ? [{ bedrooms: { gte: 5 } }] : [])] });
  }
  return and.length ? { AND: and } : undefined;
}

export async function listProjects(filters: ProjectListFilters = {}): Promise<ProjectCardDTO[]> {
  const config = configurationWhere(filters);
  const rows = await db.project.findMany({
    where: {
      ...publishedProjectWhere,
      ...(filters.locality ? { locality: { slug: filters.locality } } : {}),
      ...(filters.status ? { constructionStatus: filters.status } : {}),
      ...(config ? { configurations: { some: config } } : {}),
      ...(filters.maxPrice !== undefined ? { priceMin: { lte: BigInt(filters.maxPrice) } } : {}),
      ...(filters.minPrice !== undefined ? { priceMax: { gte: BigInt(filters.minPrice) } } : {}),
    },
    select: projectCardSelect,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
  });
  return rows.map(toProjectCard);
}

export async function getOtherProjects(excludeId: string, localitySlug: string, limit = 3): Promise<ProjectCardDTO[]> {
  const rows = await db.project.findMany({
    where: { ...publishedProjectWhere, id: { not: excludeId } },
    select: projectCardSelect,
    orderBy: [{ publishedAt: "desc" }],
  });
  // Same locality first, then everything else (stable sort keeps recency within each group).
  const sorted = [...rows].sort((a, b) => Number(b.locality.slug === localitySlug) - Number(a.locality.slug === localitySlug));
  return sorted.slice(0, limit).map(toProjectCard);
}

export async function getPublishedProjectSlugs(): Promise<string[]> {
  const rows = await db.project.findMany({ where: publishedProjectWhere, select: { slug: true } });
  return rows.map((r) => r.slug);
}
