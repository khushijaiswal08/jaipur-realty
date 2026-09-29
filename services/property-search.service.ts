import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { PAGE_SIZE } from "@/lib/constants";
import { db } from "@/lib/db";
import type { ListingFilters, SortKey } from "@/lib/search/filters";
import { propertyCardSelect, publicListingWhere, toPropertyCard, type PropertyCardDTO } from "./property.service";

export interface SearchResult {
  items: PropertyCardDTO[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

function range<T>(min: T | undefined, max: T | undefined): { gte?: T; lte?: T } | undefined {
  if (min === undefined && max === undefined) return undefined;
  return { ...(min !== undefined ? { gte: min } : {}), ...(max !== undefined ? { lte: max } : {}) };
}

export function buildWhere(f: ListingFilters): Prisma.PropertyWhereInput {
  const and: Prisma.PropertyWhereInput[] = [];

  if (f.q) {
    const q = f.q;
    and.push({
      OR: [
        { refCode: { equals: q.toUpperCase() } },
        { title: { contains: q, mode: "insensitive" } },
        { locality: { name: { contains: q, mode: "insensitive" } } },
        { project: { name: { contains: q, mode: "insensitive" } } },
        { landmark: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (f.bhk.length) {
    const exact = f.bhk.filter((n) => n < 5);
    const fivePlus = f.bhk.includes(5);
    and.push({
      OR: [
        ...(exact.length ? [{ bedrooms: { in: exact } }] : []),
        ...(fivePlus ? [{ bedrooms: { gte: 5 } }] : []),
        // Studios are stored as 1 bedroom but always match "1 BHK" searches.
        ...(exact.includes(1) ? [{ propertyType: "STUDIO" as const }] : []),
      ],
    });
  }

  // "Has all selected amenities".
  for (const slug of f.amenities) and.push({ amenities: { some: { slug } } });

  const price = range(
    f.minPrice !== undefined ? BigInt(f.minPrice) : undefined,
    f.maxPrice !== undefined ? BigInt(f.maxPrice) : undefined,
  );

  return {
    ...publicListingWhere,
    transactionType: f.transactionType,
    ...(f.localities.length ? { locality: { slug: { in: f.localities } } } : {}),
    ...(f.types.length ? { propertyType: { in: f.types } } : {}),
    ...(f.category ? { category: f.category } : {}),
    ...(price ? { price, priceOnRequest: false } : {}),
    ...(f.furnishing.length ? { furnishing: { in: f.furnishing } } : {}),
    ...(f.construction.length ? { constructionStatus: { in: f.construction } } : {}),
    ...(range(f.minArea, f.maxArea) ? { primaryAreaSqft: range(f.minArea, f.maxArea) } : {}),
    ...(f.facing.length ? { facing: { in: f.facing } } : {}),
    ...(f.listedBy ? { listedBy: f.listedBy } : {}),
    ...(f.verified ? { isVerified: true } : {}),
    ...(f.withPhotos ? { images: { some: { kind: "PHOTO" } } } : {}),
    ...(and.length ? { AND: and } : {}),
  };
}

export function buildOrderBy(sort: SortKey): Prisma.PropertyOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ publishedAt: "desc" }];
    case "price-asc":
      return [{ price: { sort: "asc", nulls: "last" } }, { publishedAt: "desc" }];
    case "price-desc":
      return [{ price: { sort: "desc", nulls: "last" } }, { publishedAt: "desc" }];
    case "ppsf-asc":
      return [{ pricePerSqft: { sort: "asc", nulls: "last" } }, { publishedAt: "desc" }];
    case "area-desc":
      return [{ primaryAreaSqft: { sort: "desc", nulls: "last" } }, { publishedAt: "desc" }];
    default:
      return [{ isFeatured: "desc" }, { publishedAt: "desc" }];
  }
}

export async function searchProperties(f: ListingFilters, pageSize: number = PAGE_SIZE.listings): Promise<SearchResult> {
  const where = buildWhere(f);
  const total = await db.property.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(f.page, totalPages);
  const rows = await db.property.findMany({
    where,
    select: propertyCardSelect,
    orderBy: buildOrderBy(f.sort),
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  return { items: rows.map(toPropertyCard), total, page, totalPages, pageSize };
}
