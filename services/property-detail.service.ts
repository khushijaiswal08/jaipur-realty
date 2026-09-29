import "server-only";

import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { PUBLIC_DETAIL_STATUSES } from "@/lib/constants";
import { db } from "@/lib/db";
import { getPrimaryArea, type PrimaryArea } from "@/lib/format/area";
import { placeholderImage, type ImageDTO } from "@/lib/images";
import { agentSelect, toAgent, type AgentDTO } from "./agent.service";
import { propertyCardSelect, publicListingWhere, toMoney, toPropertyCard, type PropertyCardDTO } from "./property.service";

const propertyDetailInclude = {
  locality: { select: { id: true, name: true, slug: true, zone: true, latitude: true, longitude: true } },
  project: { select: { id: true, name: true, slug: true, developerName: true, status: true } },
  agent: { select: agentSelect },
  images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
  amenities: { orderBy: [{ category: "asc" }, { sortOrder: "asc" }] },
  faqs: { where: { isPublished: true }, orderBy: { sortOrder: "asc" }, select: { id: true, question: true, answer: true } },
} satisfies Prisma.PropertyInclude;

type PropertyDetailRow = Prisma.PropertyGetPayload<{ include: typeof propertyDetailInclude }>;

export interface GalleryImageDTO extends ImageDTO {
  id: string;
  kind: PropertyDetailRow["images"][number]["kind"];
  caption: string | null;
}

export interface AmenityDTO {
  name: string;
  slug: string;
  icon: string;
  category: PropertyDetailRow["amenities"][number]["category"];
}

export interface PropertyDetailDTO {
  id: string;
  refCode: string;
  slug: string;
  title: string;
  description: string;
  transactionType: PropertyDetailRow["transactionType"];
  propertyType: PropertyDetailRow["propertyType"];
  category: PropertyDetailRow["category"];
  status: PropertyDetailRow["status"];
  constructionStatus: PropertyDetailRow["constructionStatus"];
  listedBy: PropertyDetailRow["listedBy"];
  price: number | null;
  priceOnRequest: boolean;
  isNegotiable: boolean;
  pricePerSqft: number | null;
  maintenanceMonthly: number | null;
  securityDeposit: number | null;
  bookingAmount: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  balconies: number | null;
  carpetArea: number | null;
  builtUpArea: number | null;
  superBuiltUpArea: number | null;
  plotArea: number | null;
  areaDisplayUnit: PropertyDetailRow["areaDisplayUnit"];
  primaryArea: PrimaryArea | null;
  plotLengthFt: number | null;
  plotWidthFt: number | null;
  floorNumber: number | null;
  totalFloors: number | null;
  facing: PropertyDetailRow["facing"];
  furnishing: PropertyDetailRow["furnishing"];
  ownershipType: PropertyDetailRow["ownershipType"];
  ageYears: number | null;
  possessionDate: string | null;
  availableFrom: string | null;
  preferredTenants: PropertyDetailRow["preferredTenants"];
  coveredParking: number | null;
  openParking: number | null;
  roadWidthFt: number | null;
  isCornerPlot: boolean;
  isGatedCommunity: boolean;
  jdaApproved: boolean | null;
  reraNumber: string | null;
  /** Null when hideExactLocation is set (SPEC §15). */
  address: string | null;
  landmark: string | null;
  pincode: string | null;
  /** Exact pin, or the locality centroid when the exact location is hidden. */
  map: { lat: number; lng: number; exact: boolean } | null;
  locality: { id: string; name: string; slug: string; zone: string | null };
  project: { id: string; name: string; slug: string; developerName: string } | null;
  agent: AgentDTO | null;
  images: GalleryImageDTO[];
  amenities: AmenityDTO[];
  faqs: Array<{ id: string; question: string; answer: string }>;
  videoUrl: string | null;
  virtualTourUrl: string | null;
  isFeatured: boolean;
  isVerified: boolean;
  isDemo: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

function toDetail(row: PropertyDetailRow): PropertyDetailDTO {
  const exact = !row.hideExactLocation && row.latitude !== null && row.longitude !== null;
  const map = exact
    ? { lat: row.latitude!, lng: row.longitude!, exact: true }
    : row.locality.latitude !== null && row.locality.longitude !== null
      ? { lat: row.locality.latitude, lng: row.locality.longitude, exact: false }
      : null;

  const images: GalleryImageDTO[] = row.images.length
    ? row.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        width: img.width,
        height: img.height,
        kind: img.kind,
        caption: img.caption,
      }))
    : [{ id: "placeholder", ...placeholderImage(row.propertyType, row.title), kind: "PHOTO", caption: null }];

  return {
    id: row.id,
    refCode: row.refCode,
    slug: row.slug,
    title: row.title,
    description: row.description,
    transactionType: row.transactionType,
    propertyType: row.propertyType,
    category: row.category,
    status: row.status,
    constructionStatus: row.constructionStatus,
    listedBy: row.listedBy,
    price: toMoney(row.price),
    priceOnRequest: row.priceOnRequest,
    isNegotiable: row.isNegotiable,
    pricePerSqft: row.pricePerSqft,
    maintenanceMonthly: row.maintenanceMonthly,
    securityDeposit: toMoney(row.securityDeposit),
    bookingAmount: toMoney(row.bookingAmount),
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    balconies: row.balconies,
    carpetArea: row.carpetArea,
    builtUpArea: row.builtUpArea,
    superBuiltUpArea: row.superBuiltUpArea,
    plotArea: row.plotArea,
    areaDisplayUnit: row.areaDisplayUnit,
    primaryArea: getPrimaryArea(row),
    plotLengthFt: row.plotLengthFt,
    plotWidthFt: row.plotWidthFt,
    floorNumber: row.floorNumber,
    totalFloors: row.totalFloors,
    facing: row.facing,
    furnishing: row.furnishing,
    ownershipType: row.ownershipType,
    ageYears: row.ageYears,
    possessionDate: row.possessionDate?.toISOString() ?? null,
    availableFrom: row.availableFrom?.toISOString() ?? null,
    preferredTenants: row.preferredTenants,
    coveredParking: row.coveredParking,
    openParking: row.openParking,
    roadWidthFt: row.roadWidthFt,
    isCornerPlot: row.isCornerPlot,
    isGatedCommunity: row.isGatedCommunity,
    jdaApproved: row.jdaApproved,
    reraNumber: row.reraNumber,
    address: row.hideExactLocation ? null : row.address,
    landmark: row.landmark,
    pincode: row.pincode,
    map,
    locality: { id: row.locality.id, name: row.locality.name, slug: row.locality.slug, zone: row.locality.zone },
    project: row.project && row.project.status === "PUBLISHED" ? row.project : null,
    agent: row.agent ? toAgent(row.agent) : null,
    images,
    amenities: row.amenities.map((a) => ({ name: a.name, slug: a.slug, icon: a.icon, category: a.category })),
    faqs: row.faqs,
    videoUrl: row.videoUrl,
    virtualTourUrl: row.virtualTourUrl,
    isFeatured: row.isFeatured,
    isVerified: row.isVerified,
    isDemo: row.isDemo,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Public property by slug (ACTIVE, UNDER_OFFER, SOLD, RENTED — SPEC §12). Wrapped in React
 * cache() so generateMetadata and the page share one query per request.
 */
export const getPropertyBySlug = cache(async (slug: string): Promise<PropertyDetailDTO | null> => {
  const row = await db.property.findFirst({
    where: { slug, status: { in: [...PUBLIC_DETAIL_STATUSES] } },
    include: propertyDetailInclude,
  });
  return row ? toDetail(row) : null;
});

/** Finds a property by its reference code (e.g. "JP1001") for redirects from old/short URLs. */
export async function findSlugByRefCode(refCode: string): Promise<string | null> {
  const row = await db.property.findFirst({
    where: { refCode: refCode.toUpperCase(), status: { in: [...PUBLIC_DETAIL_STATUSES] } },
    select: { slug: true },
  });
  return row?.slug ?? null;
}

/**
 * SPEC §9: same locality + transaction within ±25% of the price; widened to the same
 * transaction + category across Jaipur when fewer than 3 match.
 */
export async function getSimilarProperties(p: PropertyDetailDTO, limit = 6): Promise<PropertyCardDTO[]> {
  const priceBand: Prisma.PropertyWhereInput =
    p.price !== null ? { price: { gte: BigInt(Math.round(p.price * 0.75)), lte: BigInt(Math.round(p.price * 1.25)) } } : {};

  const near = await db.property.findMany({
    where: { ...publicListingWhere, id: { not: p.id }, transactionType: p.transactionType, localityId: p.locality.id, ...priceBand },
    select: propertyCardSelect,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
  if (near.length >= 3) return near.map(toPropertyCard);

  const wider = await db.property.findMany({
    where: {
      ...publicListingWhere,
      id: { notIn: [p.id, ...near.map((n) => n.id)] },
      transactionType: p.transactionType,
      category: p.category,
    },
    select: propertyCardSelect,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: limit - near.length,
  });
  return [...near, ...wider].map(toPropertyCard);
}

/** Card DTOs for a set of ids, preserving the given order (shortlist, compare). */
export async function getPropertyCardsByIds(ids: string[]): Promise<PropertyCardDTO[]> {
  if (!ids.length) return [];
  const rows = await db.property.findMany({
    where: { id: { in: ids.slice(0, 50) }, status: { in: [...PUBLIC_DETAIL_STATUSES] } },
    select: propertyCardSelect,
  });
  const byId = new Map(rows.map((r) => [r.id, toPropertyCard(r)]));
  return ids.map((id) => byId.get(id)).filter((p): p is PropertyCardDTO => Boolean(p));
}

/** Slugs for generateStaticParams — prerender the most recent public listings. */
export async function getRecentPropertySlugs(limit = 50): Promise<string[]> {
  const rows = await db.property.findMany({
    where: publicListingWhere,
    select: { slug: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return rows.map((r) => r.slug);
}
