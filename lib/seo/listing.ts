// Headings, titles and descriptions for listing pages (SPEC §31).

import type { PropertyType } from "@/generated/prisma/enums";
import { TRANSACTION_TYPE_PHRASE } from "@/lib/constants/enums";
import { formatPriceRange } from "@/lib/format/price";
import { activeFacetCount, type ListingFilters } from "@/lib/search/filters";

export const PROPERTY_TYPE_PLURALS: Record<PropertyType, string> = {
  APARTMENT: "Apartments",
  BUILDER_FLOOR: "Builder Floors",
  INDEPENDENT_HOUSE: "Independent Houses",
  VILLA: "Villas",
  PENTHOUSE: "Penthouses",
  STUDIO: "Studio Apartments",
  FARMHOUSE: "Farmhouses",
  RESIDENTIAL_PLOT: "Residential Plots",
  COMMERCIAL_PLOT: "Commercial Plots",
  AGRICULTURAL_LAND: "Agricultural Land",
  OFFICE_SPACE: "Office Spaces",
  SHOP: "Shops",
  SHOWROOM: "Showrooms",
  WAREHOUSE: "Warehouses",
};

const CATEGORY_NOUNS = { RESIDENTIAL: "Residential Properties", COMMERCIAL: "Commercial Properties", LAND: "Plots & Land" } as const;

/** "3 BHK Apartments for Sale in Vaishali Nagar, Jaipur" */
export function listingHeading(f: ListingFilters, localityNames: Map<string, string>): string {
  const bhk = f.bhk.length === 1 ? `${f.bhk[0] === 5 ? "5+" : f.bhk[0]} BHK ` : "";
  const noun =
    f.types.length === 1
      ? PROPERTY_TYPE_PLURALS[f.types[0]!]
      : f.category
        ? CATEGORY_NOUNS[f.category]
        : bhk
          ? "Homes"
          : "Properties";
  const place =
    f.localities.length === 1 ? `${localityNames.get(f.localities[0]!) ?? "Jaipur"}, Jaipur` : "Jaipur";
  return `${bhk}${noun} ${TRANSACTION_TYPE_PHRASE[f.transactionType]} in ${place}`;
}

export function listingDescription(f: ListingFilters, heading: string, total: number): string {
  const budget = f.minPrice !== undefined || f.maxPrice !== undefined ? ` in the ${formatPriceRange(f.minPrice, f.maxPrice, { rent: f.transactionType === "RENT" })} range` : "";
  const count = total > 0 ? `${total} verified and new listings` : "Listings";
  return `${count}${budget}: ${heading.toLowerCase()}. Compare prices, photos, amenities and locations, then call or WhatsApp to book a site visit.`;
}

/** SPEC §31: more than two facets, or deep pagination on a filtered page, is noindex. */
export function shouldIndexListing(f: ListingFilters): boolean {
  const facets = activeFacetCount(f);
  if (facets > 2) return false;
  if (f.q) return false;
  if (f.page > 1 && facets > 0) return false;
  return true;
}
