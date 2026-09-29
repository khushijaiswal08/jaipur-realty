import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

/**
 * Robots metadata for a page. Always returns an explicit value: Next.js metadata merging lets a
 * child's `robots: undefined` wipe the parent's noindex, which would leak staging pages.
 * - Site indexing disabled (SPEC §33) → noindex, nofollow everywhere.
 * - Page not indexable (demo record, deep filters…) → noindex, follow.
 */
export function pageRobots(indexable = true): NonNullable<Metadata["robots"]> {
  if (!siteConfig.allowIndexing) return { index: false, follow: false };
  return indexable ? { index: true, follow: true } : { index: false, follow: true };
}
