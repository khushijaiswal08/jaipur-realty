import "server-only";

import { cache } from "react";
import { db } from "@/lib/db";
import { placeholderImage, type ImageDTO } from "@/lib/images";
import { publishedProjectWhere, projectCardSelect, toProjectCard, type ProjectCardDTO } from "./project.service";
import { propertyCardSelect, publicListingWhere, toPropertyCard, type PropertyCardDTO } from "./property.service";

export interface LocalityStatsDTO {
  saleCount: number;
  rentCount: number;
  salePriceMin: number | null;
  salePriceMax: number | null;
  rentMin: number | null;
  rentMax: number | null;
  /** Average of live sale listings' price per sq ft (null when none). */
  liveAvgPricePerSqft: number | null;
}

export interface LocalityDetailDTO {
  id: string;
  name: string;
  slug: string;
  zone: string | null;
  pincode: string | null;
  description: string | null;
  highlights: string[];
  connectivity: string[];
  map: { lat: number; lng: number } | null;
  avgPricePerSqft: number | null;
  avgRent2Bhk: number | null;
  image: ImageDTO;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
  stats: LocalityStatsDTO;
  faqs: Array<{ id: string; question: string; answer: string }>;
}

export const getLocalityBySlug = cache(async (slug: string): Promise<LocalityDetailDTO | null> => {
  const l = await db.locality.findFirst({
    where: { slug, city: { isActive: true } },
    include: {
      faqs: { where: { isPublished: true }, orderBy: { sortOrder: "asc" }, select: { id: true, question: true, answer: true } },
    },
  });
  if (!l) return null;

  const [groups, ppsf] = await Promise.all([
    db.property.groupBy({
      by: ["transactionType"],
      where: { ...publicListingWhere, localityId: l.id, priceOnRequest: false },
      _count: { _all: true },
      _min: { price: true },
      _max: { price: true },
    }),
    db.property.aggregate({
      where: { ...publicListingWhere, localityId: l.id, transactionType: "SALE", pricePerSqft: { not: null } },
      _avg: { pricePerSqft: true },
    }),
  ]);
  const sale = groups.find((g) => g.transactionType === "SALE");
  const rent = groups.find((g) => g.transactionType === "RENT");
  const n = (v: bigint | null | undefined) => (v === null || v === undefined ? null : Number(v));

  return {
    id: l.id,
    name: l.name,
    slug: l.slug,
    zone: l.zone,
    pincode: l.pincode,
    description: l.description,
    highlights: l.highlights,
    connectivity: l.connectivity,
    map: l.latitude !== null && l.longitude !== null ? { lat: l.latitude, lng: l.longitude } : null,
    avgPricePerSqft: l.avgPricePerSqft,
    avgRent2Bhk: l.avgRent2Bhk,
    image: l.imageUrl ? { url: l.imageUrl, alt: `${l.name}, Jaipur`, width: 1200, height: 900 } : placeholderImage("locality", l.name),
    seoTitle: l.seoTitle,
    seoDescription: l.seoDescription,
    updatedAt: l.updatedAt.toISOString(),
    stats: {
      saleCount: sale?._count._all ?? 0,
      rentCount: rent?._count._all ?? 0,
      salePriceMin: n(sale?._min.price),
      salePriceMax: n(sale?._max.price),
      rentMin: n(rent?._min.price),
      rentMax: n(rent?._max.price),
      liveAvgPricePerSqft: ppsf._avg.pricePerSqft ? Math.round(ppsf._avg.pricePerSqft) : null,
    },
    faqs: l.faqs,
  };
});

export async function getLocalityListings(localityId: string, transactionType: "SALE" | "RENT", limit = 8): Promise<PropertyCardDTO[]> {
  const rows = await db.property.findMany({
    where: { ...publicListingWhere, localityId, transactionType },
    select: propertyCardSelect,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
  return rows.map(toPropertyCard);
}

export async function getLocalityProjects(localityId: string): Promise<ProjectCardDTO[]> {
  const rows = await db.project.findMany({
    where: { ...publishedProjectWhere, localityId },
    select: projectCardSelect,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
  });
  return rows.map(toProjectCard);
}

/** Nearest localities by straight-line distance from this locality's centroid. */
export async function getNearbyLocalities(localityId: string, limit = 4): Promise<Array<{ id: string; name: string; slug: string; zone: string | null; km: number | null }>> {
  const all = await db.locality.findMany({
    where: { city: { isActive: true } },
    select: { id: true, name: true, slug: true, zone: true, latitude: true, longitude: true },
  });
  const self = all.find((l) => l.id === localityId);
  const others = all.filter((l) => l.id !== localityId);
  if (!self || self.latitude === null || self.longitude === null) {
    return others.slice(0, limit).map((l) => ({ id: l.id, name: l.name, slug: l.slug, zone: l.zone, km: null }));
  }
  return others
    .map((l) => ({
      id: l.id,
      name: l.name,
      slug: l.slug,
      zone: l.zone,
      km: l.latitude !== null && l.longitude !== null ? haversineKm(self.latitude!, self.longitude!, l.latitude, l.longitude) : null,
    }))
    .sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity))
    .slice(0, limit);
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)) * 10) / 10;
}

export async function getLocalitySlugs(): Promise<string[]> {
  const rows = await db.locality.findMany({ where: { city: { isActive: true } }, select: { slug: true } });
  return rows.map((r) => r.slug);
}
