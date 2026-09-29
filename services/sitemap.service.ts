import "server-only";

import { PUBLIC_SEARCH_STATUSES } from "@/lib/constants";
import { db } from "@/lib/db";

export interface SitemapData {
  properties: Array<{ slug: string; updatedAt: Date }>;
  projects: Array<{ slug: string; updatedAt: Date }>;
  localities: Array<{ slug: string; updatedAt: Date; hasSale: boolean; hasRent: boolean }>;
  posts: Array<{ slug: string; updatedAt: Date }>;
  categories: Array<{ slug: string; updatedAt: Date }>;
}

/** Everything that belongs in the sitemap: published and non-demo only (SPEC §33). */
export async function getSitemapData(): Promise<SitemapData> {
  const now = new Date();
  const [properties, projects, localities, counts, posts, categories] = await Promise.all([
    db.property.findMany({ where: { status: { in: [...PUBLIC_SEARCH_STATUSES] }, isDemo: false }, select: { slug: true, updatedAt: true } }),
    db.project.findMany({ where: { status: "PUBLISHED", isDemo: false }, select: { slug: true, updatedAt: true } }),
    db.locality.findMany({ where: { city: { isActive: true } }, select: { id: true, slug: true, updatedAt: true } }),
    db.property.groupBy({ by: ["localityId", "transactionType"], where: { status: { in: [...PUBLIC_SEARCH_STATUSES] }, isDemo: false }, _count: { _all: true } }),
    db.blogPost.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: now }, isDemo: false }, select: { slug: true, updatedAt: true } }),
    db.blogCategory.findMany({ where: { posts: { some: { status: "PUBLISHED", isDemo: false } } }, select: { slug: true, updatedAt: true } }),
  ]);
  const has = (id: string, tx: "SALE" | "RENT") => counts.some((c) => c.localityId === id && c.transactionType === tx && c._count._all > 0);
  return {
    properties,
    projects,
    localities: localities.map((l) => ({ slug: l.slug, updatedAt: l.updatedAt, hasSale: has(l.id, "SALE"), hasRent: has(l.id, "RENT") })),
    posts,
    categories,
  };
}
