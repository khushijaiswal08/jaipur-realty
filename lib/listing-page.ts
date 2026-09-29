import "server-only";

import type { Metadata } from "next";
import type { TransactionType } from "@/generated/prisma/enums";
import { absoluteUrl } from "@/lib/config";
import { listingDescription, listingHeading, shouldIndexListing } from "@/lib/seo/listing";
import { pageRobots } from "@/lib/seo/robots";
import { listingPath, parseListingFilters, toSearchParams, type RawSearchParams } from "@/lib/search/filters";
import { getAmenities } from "@/services/amenity.service";
import { getLocalityLinks } from "@/services/locality.service";
import { searchProperties } from "@/services/property-search.service";

/** Loads everything a /buy, /rent or /buy/[locality] page needs in one place. */
export async function loadListingPage(params: RawSearchParams, tx: TransactionType, fixedLocality?: string) {
  const filters = parseListingFilters(params, tx, { fixedLocality });
  const [result, localities, amenities] = await Promise.all([searchProperties(filters), getLocalityLinks(), getAmenities()]);
  const localityNames = new Map(localities.map((l) => [l.slug, l.name]));
  const heading = listingHeading(filters, localityNames);
  return { filters, result, localities, amenities, heading };
}

/**
 * Metadata for listing pages. Landing pages (/buy/[locality]) pass `fixedLocality` so their
 * canonical is the clean path rather than /buy?locality=….
 */
export async function listingMetadata(params: RawSearchParams, tx: TransactionType, options: { fixedLocality?: string } = {}): Promise<Metadata> {
  const filters = parseListingFilters(params, tx, { fixedLocality: options.fixedLocality });
  const localities = await getLocalityLinks();
  const heading = listingHeading(filters, new Map(localities.map((l) => [l.slug, l.name])));
  const basePath = options.fixedLocality ? `${listingPath(tx)}/${options.fixedLocality}` : listingPath(tx);
  const rest = options.fixedLocality ? { ...filters, localities: filters.localities.filter((l) => l !== options.fixedLocality) } : filters;
  const qs = toSearchParams(rest, { sort: "relevance", page: 1 }).toString();
  const index = shouldIndexListing(filters);
  const canonical = index && qs ? `${basePath}?${qs}` : basePath;
  const title = filters.page > 1 ? `${heading} — Page ${filters.page}` : heading;
  const description = listingDescription(filters, heading, 0);
  return {
    title,
    description,
    alternates: { canonical },
    robots: pageRobots(index),
    openGraph: { title, description, url: absoluteUrl(canonical) },
  };
}
