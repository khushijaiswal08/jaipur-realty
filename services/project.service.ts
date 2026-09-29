import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import type { PropertyType } from "@/generated/prisma/enums";
import { PROPERTY_TYPE_NOUNS } from "@/lib/constants";
import { db } from "@/lib/db";
import { placeholderImage, type ImageDTO } from "@/lib/images";
import { toMoney } from "./property.service";

export const projectCardSelect = {
  id: true,
  slug: true,
  name: true,
  developerName: true,
  constructionStatus: true,
  possessionDate: true,
  priceMin: true,
  priceMax: true,
  priceOnRequest: true,
  isFeatured: true,
  isDemo: true,
  reraNumber: true,
  locality: { select: { name: true, slug: true } },
  images: {
    select: { url: true, alt: true, width: true, height: true },
    where: { kind: "PHOTO" },
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
    take: 1,
  },
  configurations: { select: { propertyType: true, bedrooms: true }, orderBy: { sortOrder: "asc" } },
} satisfies Prisma.ProjectSelect;

type ProjectCardRow = Prisma.ProjectGetPayload<{ select: typeof projectCardSelect }>;

export interface ProjectCardDTO {
  id: string;
  slug: string;
  name: string;
  developerName: string;
  constructionStatus: ProjectCardRow["constructionStatus"];
  possessionDate: string | null;
  priceMin: number | null;
  priceMax: number | null;
  priceOnRequest: boolean;
  isFeatured: boolean;
  isDemo: boolean;
  reraNumber: string | null;
  locality: { name: string; slug: string };
  cover: ImageDTO;
  /** e.g. "2, 3 & 4 BHK Apartments" or "Residential Plots · Villas" */
  unitSummary: string;
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} & ${items.at(-1)}`;
}

/** Human summary of a project's unit mix from its configurations. */
export function summariseUnits(configs: Array<{ propertyType: PropertyType; bedrooms: number | null }>): string {
  const types = [...new Set(configs.map((c) => c.propertyType))];
  const parts = types.map((type) => {
    const bhk = [...new Set(configs.filter((c) => c.propertyType === type && c.bedrooms).map((c) => c.bedrooms!))].sort(
      (a, b) => a - b,
    );
    const noun = `${PROPERTY_TYPE_NOUNS[type]}s`;
    return bhk.length ? `${joinList(bhk.map(String))} BHK ${noun}` : noun;
  });
  return parts.join(" · ");
}

export function toProjectCard(row: ProjectCardRow): ProjectCardDTO {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    developerName: row.developerName,
    constructionStatus: row.constructionStatus,
    possessionDate: row.possessionDate?.toISOString() ?? null,
    priceMin: toMoney(row.priceMin),
    priceMax: toMoney(row.priceMax),
    priceOnRequest: row.priceOnRequest,
    isFeatured: row.isFeatured,
    isDemo: row.isDemo,
    reraNumber: row.reraNumber,
    locality: row.locality,
    cover: row.images[0] ?? placeholderImage("project", row.name),
    unitSummary: summariseUnits(row.configurations),
  };
}

export const publishedProjectWhere = { status: "PUBLISHED" } satisfies Prisma.ProjectWhereInput;

export async function getFeaturedProjects(limit = 4): Promise<ProjectCardDTO[]> {
  const rows = await db.project.findMany({
    where: publishedProjectWhere,
    select: projectCardSelect,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
  return rows.map(toProjectCard);
}
