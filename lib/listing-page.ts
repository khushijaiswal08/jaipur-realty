import "server-only";

import type { Metadata } from "next";
import type { TransactionType } from "@/generated/prisma/enums";
import { listingDescription, listingHeading, shouldIndexListing } from "@/lib/seo/listing";
import { pageRobots } from "@/lib/seo/robots";
import { listingPath, parseListingFilters, toSearchParams, type ListingFilters, type RawSearchParams } from "@/lib/search/filters";
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

export async function listingMetadata(params: RawSearchParams, tx: TransactionType, canonicalPath?: string): Promise<Metadata> {
  const filters: ListingFilters = parseListingFilters(params, tx);
  const localities = await getLocalityLinks();
  const heading = listingHeading(filters, new Map(localities.map((l) => [l.slug, l.name])));
  const qs = toSearchParams(filters, { sort: "relevance", page: 1 }).toString();
  const index = shouldIndexListing(filters);
  return {
    title: filters.page > 1 ? `${heading} — Page ${filters.page}` : heading,
    description: listingDescription(filters, heading, 0),
    alternates: { canonical: canonicalPath ?? (index && qs ? `${listingPath(tx)}?${qs}` : listingPath(tx)) },
    robots: pageRobots(index),
  };
}
