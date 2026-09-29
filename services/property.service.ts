import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { PUBLIC_SEARCH_STATUSES } from "@/lib/constants";
import { resolveContact, type ContactPoint } from "@/lib/contact";
import { db } from "@/lib/db";
import { getPrimaryArea, type PrimaryArea } from "@/lib/format/area";
import { placeholderImage, type ImageDTO } from "@/lib/images";

// ───────────────────────── Card DTO (listings, home, similar) ─────────────────────────

export const propertyCardSelect = {
  id: true,
  refCode: true,
  slug: true,
  title: true,
  transactionType: true,
  propertyType: true,
  category: true,
  status: true,
  constructionStatus: true,
  price: true,
  priceOnRequest: true,
  pricePerSqft: true,
  bedrooms: true,
  bathrooms: true,
  furnishing: true,
  floorNumber: true,
  totalFloors: true,
  carpetArea: true,
  builtUpArea: true,
  superBuiltUpArea: true,
  plotArea: true,
  areaDisplayUnit: true,
  isFeatured: true,
  isVerified: true,
  isDemo: true,
  publishedAt: true,
  locality: { select: { name: true, slug: true } },
  project: { select: { name: true, slug: true } },
  agent: { select: { phone: true, whatsapp: true } },
  images: {
    select: { url: true, alt: true, width: true, height: true },
    where: { kind: "PHOTO" },
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
    take: 1,
  },
  _count: { select: { images: true } },
} satisfies Prisma.PropertySelect;

type PropertyCardRow = Prisma.PropertyGetPayload<{ select: typeof propertyCardSelect }>;

export interface PropertyCardDTO {
  id: string;
  refCode: string;
  slug: string;
  title: string;
  transactionType: PropertyCardRow["transactionType"];
  propertyType: PropertyCardRow["propertyType"];
  category: PropertyCardRow["category"];
  status: PropertyCardRow["status"];
  constructionStatus: PropertyCardRow["constructionStatus"];
  price: number | null;
  priceOnRequest: boolean;
  pricePerSqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  furnishing: PropertyCardRow["furnishing"];
  floorNumber: number | null;
  totalFloors: number | null;
  primaryArea: PrimaryArea | null;
  locality: { name: string; slug: string };
  project: { name: string; slug: string } | null;
  cover: ImageDTO;
  imageCount: number;
  isFeatured: boolean;
  isVerified: boolean;
  isDemo: boolean;
  publishedAt: string | null;
  contact: ContactPoint;
}

export function toMoney(value: bigint | null): number | null {
  return value === null ? null : Number(value);
}

export function toPropertyCard(row: PropertyCardRow): PropertyCardDTO {
  const cover = row.images[0];
  return {
    id: row.id,
    refCode: row.refCode,
    slug: row.slug,
    title: row.title,
    transactionType: row.transactionType,
    propertyType: row.propertyType,
    category: row.category,
    status: row.status,
    constructionStatus: row.constructionStatus,
    price: toMoney(row.price),
    priceOnRequest: row.priceOnRequest,
    pricePerSqft: row.pricePerSqft,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    furnishing: row.furnishing,
    floorNumber: row.floorNumber,
    totalFloors: row.totalFloors,
    primaryArea: getPrimaryArea(row),
    locality: row.locality,
    project: row.project,
    cover: cover ?? placeholderImage(row.propertyType, row.title),
    imageCount: row._count.images,
    isFeatured: row.isFeatured,
    isVerified: row.isVerified,
    isDemo: row.isDemo,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    contact: resolveContact(row.agent),
  };
}

/** Listings visible in public search (SPEC §12 ListingStatus). */
export const publicListingWhere = {
  status: { in: [...PUBLIC_SEARCH_STATUSES] },
} satisfies Prisma.PropertyWhereInput;

/** Featured first, then newest — used on the home page. */
export async function getFeaturedProperties(limit = 8): Promise<PropertyCardDTO[]> {
  const rows = await db.property.findMany({
    where: publicListingWhere,
    select: propertyCardSelect,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
  return rows.map(toPropertyCard);
}

/** Counts per transaction type for the home page hero. */
export async function getListingCounts(): Promise<{ sale: number; rent: number }> {
  const groups = await db.property.groupBy({
    by: ["transactionType"],
    where: publicListingWhere,
    _count: { _all: true },
  });
  return {
    sale: groups.find((g) => g.transactionType === "SALE")?._count._all ?? 0,
    rent: groups.find((g) => g.transactionType === "RENT")?._count._all ?? 0,
  };
}
