import "server-only";

import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { db } from "@/lib/db";
import { placeholderImage, type ImageDTO } from "@/lib/images";
import { publicListingWhere } from "./property.service";

export interface LocalityLinkDTO {
  id: string;
  name: string;
  slug: string;
}

export interface LocalityCardDTO extends LocalityLinkDTO {
  zone: string | null;
  image: ImageDTO;
  avgPricePerSqft: number | null;
  avgRent2Bhk: number | null;
  saleCount: number;
  rentCount: number;
  isFeatured: boolean;
}

/** All localities (name/slug) for selects, nav and footers. Cached; revalidated by tag. */
export const getLocalityLinks = unstable_cache(
  async (): Promise<LocalityLinkDTO[]> => {
    return db.locality.findMany({
      where: { city: { isActive: true } },
      select: { id: true, name: true, slug: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  },
  ["locality-links"],
  { tags: [CACHE_TAGS.localities], revalidate: 3600 },
);

/** Locality cards with live listing counts (SPEC §11.3 "live stats"). */
export async function getLocalityCards(options: { featuredOnly?: boolean } = {}): Promise<LocalityCardDTO[]> {
  const [localities, counts] = await Promise.all([
    db.locality.findMany({
      where: { city: { isActive: true }, ...(options.featuredOnly ? { isFeatured: true } : {}) },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    db.property.groupBy({
      by: ["localityId", "transactionType"],
      where: publicListingWhere,
      _count: { _all: true },
    }),
  ]);

  const countFor = (localityId: string, tx: "SALE" | "RENT") =>
    counts.find((c) => c.localityId === localityId && c.transactionType === tx)?._count._all ?? 0;

  return localities.map((l) => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    zone: l.zone,
    image: l.imageUrl
      ? { url: l.imageUrl, alt: `${l.name}, Jaipur`, width: 1200, height: 900 }
      : placeholderImage("locality", l.name),
    avgPricePerSqft: l.avgPricePerSqft,
    avgRent2Bhk: l.avgRent2Bhk,
    saleCount: countFor(l.id, "SALE"),
    rentCount: countFor(l.id, "RENT"),
    isFeatured: l.isFeatured,
  }));
}
