import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { resolveSearchUrl } from "@/lib/search/search-tabs";
import { pageRobots } from "@/lib/seo/robots";

export const metadata: Metadata = { robots: pageRobots(false) };

/**
 * Entry point for the home search panel: `/properties?tab=buy|rent|commercial|projects&locality=…`.
 * Forwards to the canonical, indexable results page (/buy, /rent, /buy/[locality], /projects)
 * so there is one URL per result set.
 */
export default async function PropertiesSearchPage({ searchParams }: PageProps<"/properties">) {
  redirect(resolveSearchUrl(await searchParams));
}
