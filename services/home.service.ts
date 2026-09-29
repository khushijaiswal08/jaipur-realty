import "server-only";

import type { PropertyCategory, PropertyType, TransactionType } from "@/generated/prisma/enums";
import { PROPERTY_CATEGORY_TILES } from "@/lib/constants/marketing";
import { db } from "@/lib/db";
import { LAKH } from "@/lib/format/price";
import { buildListingHref, parseListingFilters } from "@/lib/search/filters";
import { publicListingWhere } from "./property.service";
import { publishedProjectWhere } from "./project.service";

export interface PopularSearchDTO {
  label: string;
  href: string;
  count: number;
}

export interface CategoryTileDTO {
  key: string;
  label: string;
  description: string;
  icon: string;
  href: string;
  count: number;
}

type Row = {
  transactionType: TransactionType;
  localityId: string;
  category: PropertyCategory;
  propertyType: PropertyType;
  bedrooms: number | null;
  count: number;
};

async function inventory(): Promise<Row[]> {
  const groups = await db.property.groupBy({
    by: ["transactionType", "localityId", "category", "propertyType", "bedrooms"],
    where: publicListingWhere,
    _count: { _all: true },
  });
  return groups.map((g) => ({ ...g, count: g._count._all }));
}

/**
 * "Popular searches" built from live inventory: the most-stocked BHK × locality, plot and
 * commercial combinations, so every chip leads to results. At most two chips per locality.
 */
export async function getPopularSearches(limit = 8): Promise<PopularSearchDTO[]> {
  const [rows, localities, affordable] = await Promise.all([
    inventory(),
    db.locality.findMany({ select: { id: true, name: true, slug: true } }),
    db.property.count({ where: { ...publicListingWhere, transactionType: "SALE", category: "RESIDENTIAL", price: { lte: BigInt(50 * LAKH) } } }),
  ]);
  const byId = new Map(localities.map((l) => [l.id, l]));
  const candidates = new Map<string, PopularSearchDTO & { localityId: string }>();

  const add = (key: string, localityId: string, count: number, make: (l: { name: string; slug: string }) => { label: string; href: string }) => {
    const locality = byId.get(localityId);
    if (!locality) return;
    const existing = candidates.get(key);
    if (existing) existing.count += count;
    else candidates.set(key, { ...make(locality), count, localityId });
  };

  for (const r of rows) {
    const category = r.category;
    const tx = r.transactionType === "SALE" ? "for sale" : "for rent";
    const base = r.transactionType === "SALE" ? "/buy" : "/rent";
    if (category === "RESIDENTIAL" && r.bedrooms) {
      const bhk = Math.min(r.bedrooms, 5);
      add(`res:${r.transactionType}:${r.localityId}:${bhk}`, r.localityId, r.count, (l) => ({
        label: `${bhk}${bhk === 5 ? "+" : ""} BHK ${tx} in ${l.name}`,
        href: `${base}/${l.slug}?bhk=${bhk}`,
      }));
    } else if (category === "LAND" && r.transactionType === "SALE") {
      add(`land:${r.localityId}`, r.localityId, r.count, (l) => ({ label: `Plots in ${l.name}`, href: `/buy/${l.slug}?category=land` }));
    } else if (category === "COMMERCIAL") {
      add(`com:${r.transactionType}:${r.localityId}`, r.localityId, r.count, (l) => ({
        label: `Commercial ${r.transactionType === "SALE" ? "property" : "space for rent"} in ${l.name}`,
        href: `${base}/${l.slug}?category=commercial`,
      }));
    }
  }

  const perLocality = new Map<string, number>();
  const picked: PopularSearchDTO[] = [];
  if (affordable > 0) {
    const href = buildListingHref(parseListingFilters({ category: "residential", maxPrice: String(50 * LAKH) }, "SALE"));
    picked.push({ label: "Homes under ₹50 Lakh", href, count: affordable });
  }
  for (const c of [...candidates.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))) {
    if (picked.length >= limit) break;
    const used = perLocality.get(c.localityId) ?? 0;
    if (used >= 2) continue;
    perLocality.set(c.localityId, used + 1);
    picked.push({ label: c.label, href: c.href, count: c.count });
  }
  return picked;
}

/** Tiles for "Browse by property type", each counted with the same filter its link applies. */
export async function getCategoryTiles(): Promise<CategoryTileDTO[]> {
  const [groups, projects] = await Promise.all([
    db.property.groupBy({ by: ["transactionType", "category", "propertyType"], where: publicListingWhere, _count: { _all: true } }),
    db.project.count({ where: publishedProjectWhere }),
  ]);

  const tiles: CategoryTileDTO[] = PROPERTY_CATEGORY_TILES.map((tile) => {
    const types: readonly PropertyType[] = "types" in tile ? tile.types : [];
    const category: PropertyCategory | undefined = "category" in tile ? tile.category : undefined;
    const count = groups
      .filter((g) => g.transactionType === tile.transactionType)
      .filter((g) => (types.length ? types.includes(g.propertyType) : g.category === category))
      .reduce((sum, g) => sum + g._count._all, 0);
    const filters = parseListingFilters({}, tile.transactionType);
    const href = buildListingHref(filters, types.length ? { types: [...types] } : { category });
    return { key: tile.key, label: tile.label, description: tile.description, icon: tile.icon, href, count };
  });

  tiles.push({
    key: "projects",
    label: "New projects",
    description: "New launches and ready-to-move projects",
    icon: "building-2",
    href: "/projects",
    count: projects,
  });
  return tiles;
}
