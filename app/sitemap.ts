import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/config";
import { getSitemapData } from "@/services/sitemap.service";

// Rebuilt hourly and whenever an admin change revalidates the site (SPEC §33).
export const revalidate = 3600;

const STATIC_PAGES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/buy", priority: 0.9, changeFrequency: "daily" },
  { path: "/rent", priority: 0.9, changeFrequency: "daily" },
  { path: "/projects", priority: 0.8, changeFrequency: "weekly" },
  { path: "/localities", priority: 0.8, changeFrequency: "weekly" },
  { path: "/post-property", priority: 0.6, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.6, changeFrequency: "weekly" },
  { path: "/tools", priority: 0.4, changeFrequency: "monthly" },
  { path: "/tools/emi-calculator", priority: 0.5, changeFrequency: "monthly" },
  { path: "/tools/area-converter", priority: 0.5, changeFrequency: "monthly" },
  { path: "/tools/stamp-duty", priority: 0.5, changeFrequency: "monthly" },
  { path: "/about", priority: 0.4, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.4, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.1, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.1, changeFrequency: "yearly" },
  { path: "/disclaimer", priority: 0.1, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getSitemapData();
  const now = new Date();
  return [
    ...STATIC_PAGES.map((p) => ({ url: absoluteUrl(p.path), lastModified: now, changeFrequency: p.changeFrequency, priority: p.priority })),
    ...data.localities.flatMap((l) => [
      { url: absoluteUrl(`/localities/${l.slug}`), lastModified: l.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 },
      // Landing pages only when they have listings (avoid thin pages).
      ...(l.hasSale ? [{ url: absoluteUrl(`/buy/${l.slug}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.8 }] : []),
      ...(l.hasRent ? [{ url: absoluteUrl(`/rent/${l.slug}`), lastModified: now, changeFrequency: "daily" as const, priority: 0.8 }] : []),
    ]),
    ...data.properties.map((p) => ({ url: absoluteUrl(`/property/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...data.projects.map((p) => ({ url: absoluteUrl(`/projects/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...data.posts.map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...data.categories.map((c) => ({ url: absoluteUrl(`/blog/category/${c.slug}`), lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.4 })),
  ];
}
