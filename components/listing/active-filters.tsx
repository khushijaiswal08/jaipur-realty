import Link from "next/link";
import { X } from "lucide-react";
import {
  CONSTRUCTION_STATUS_LABELS,
  FACING_LABELS,
  FURNISHING_LABELS,
  LISTED_BY_LABELS,
  PROPERTY_CATEGORY_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@/lib/constants/enums";
import { formatArea } from "@/lib/format/area";
import { formatPriceRange } from "@/lib/format/price";
import { buildListingHref, listingPath, type ListingFilters } from "@/lib/search/filters";

export interface FilterChip {
  label: string;
  href: string;
}

/** Every active refinement as a removable chip (also reused as "try removing" suggestions). */
export function filterChips(f: ListingFilters, localityNames: Map<string, string>, amenityNames: Map<string, string>): FilterChip[] {
  const chips: FilterChip[] = [];
  if (f.q) chips.push({ label: `“${f.q}”`, href: buildListingHref(f, { q: undefined }) });
  for (const slug of f.localities) {
    chips.push({ label: localityNames.get(slug) ?? slug, href: buildListingHref(f, {}, { omitLocality: slug }) });
  }
  for (const t of f.types) chips.push({ label: PROPERTY_TYPE_LABELS[t], href: buildListingHref(f, { types: f.types.filter((x) => x !== t) }) });
  if (f.category) chips.push({ label: PROPERTY_CATEGORY_LABELS[f.category], href: buildListingHref(f, { category: undefined }) });
  if (f.minPrice !== undefined || f.maxPrice !== undefined) {
    chips.push({
      label: formatPriceRange(f.minPrice, f.maxPrice, { rent: f.transactionType === "RENT" }),
      href: buildListingHref(f, { budget: undefined, minPrice: undefined, maxPrice: undefined }),
    });
  }
  for (const n of f.bhk) chips.push({ label: n === 5 ? "5+ BHK" : `${n} BHK`, href: buildListingHref(f, { bhk: f.bhk.filter((x) => x !== n) }) });
  for (const k of f.furnishing) chips.push({ label: FURNISHING_LABELS[k], href: buildListingHref(f, { furnishing: f.furnishing.filter((x) => x !== k) }) });
  for (const k of f.construction) {
    chips.push({ label: CONSTRUCTION_STATUS_LABELS[k], href: buildListingHref(f, { construction: f.construction.filter((x) => x !== k) }) });
  }
  if (f.minArea !== undefined || f.maxArea !== undefined) {
    const label =
      f.minArea !== undefined && f.maxArea !== undefined
        ? `${formatArea(f.minArea)} – ${formatArea(f.maxArea)}`
        : f.minArea !== undefined
          ? `From ${formatArea(f.minArea)}`
          : `Up to ${formatArea(f.maxArea)}`;
    chips.push({ label, href: buildListingHref(f, { minArea: undefined, maxArea: undefined }) });
  }
  for (const k of f.facing) chips.push({ label: `${FACING_LABELS[k]} facing`, href: buildListingHref(f, { facing: f.facing.filter((x) => x !== k) }) });
  for (const slug of f.amenities) {
    chips.push({ label: amenityNames.get(slug) ?? slug, href: buildListingHref(f, { amenities: f.amenities.filter((x) => x !== slug) }) });
  }
  if (f.listedBy) chips.push({ label: `By ${LISTED_BY_LABELS[f.listedBy].toLowerCase()}`, href: buildListingHref(f, { listedBy: undefined }) });
  if (f.verified) chips.push({ label: "Verified only", href: buildListingHref(f, { verified: false }) });
  if (f.withPhotos) chips.push({ label: "With photos", href: buildListingHref(f, { withPhotos: false }) });
  return chips;
}

export function ActiveFilters({ chips, transactionType }: { chips: FilterChip[]; transactionType: ListingFilters["transactionType"] }) {
  if (!chips.length) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="sr-only">Active filters:</span>
      {chips.map((c) => (
        <Link
          key={c.href + c.label}
          href={c.href}
          scroll={false}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 py-1 pl-3 pr-2 text-sm font-medium text-brand-800 hover:border-brand-300 hover:bg-brand-100"
        >
          {c.label}
          <X className="size-3.5" aria-hidden="true" />
          <span className="sr-only">— remove filter</span>
        </Link>
      ))}
      <Link href={listingPath(transactionType)} className="px-2 text-sm font-semibold text-ink-600 underline-offset-4 hover:text-ink-950 hover:underline">
        Clear all
      </Link>
    </div>
  );
}
