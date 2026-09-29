import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/lib/config";

/** SPEC §33 — everything is disallowed until NEXT_PUBLIC_ALLOW_INDEXING=true (staging-safe). */
export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.allowIndexing) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/compare", "/shortlist"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.siteUrl,
  };
}
