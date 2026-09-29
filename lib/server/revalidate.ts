import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS, type CacheTag } from "@/lib/cache-tags";

/**
 * After an admin change to public content: expire every ISR page (home, listings, detail pages,
 * sitemaps) so the site reflects the change on the next request (SPEC §37, §44). The catalogue is
 * small, so a full-site revalidation is simpler and safer than tracking every dependent path.
 */
export function revalidatePublicSite(...tags: CacheTag[]): void {
  revalidatePath("/", "layout");
  for (const tag of tags) revalidateTag(tag, "max");
}

export { CACHE_TAGS };
