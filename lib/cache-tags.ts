// Cache tags for unstable_cache + on-demand revalidation from admin saves (SPEC §37, §44).
export const CACHE_TAGS = {
  properties: "properties",
  projects: "projects",
  localities: "localities",
  amenities: "amenities",
  content: "content",
  blog: "blog",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
