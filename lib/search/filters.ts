// URL ⇄ filter state for /buy and /rent (SPEC §7, §8). Pure and unit-tested.
// Invalid values are dropped silently — a bad link should still show results.

import {
  ConstructionStatus,
  Facing,
  Furnishing,
  ListedBy,
  PropertyCategory,
  PropertyType,
  type TransactionType,
} from "@/generated/prisma/enums";
import { findBudgetPreset } from "@/lib/constants/budgets";
import { parsePrice } from "@/lib/format/price";

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "ppsf-asc", label: "Price per sq ft: low to high" },
  { value: "area-desc", label: "Area: largest first" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export interface ListingFilters {
  transactionType: TransactionType;
  q?: string;
  localities: string[];
  types: PropertyType[];
  category?: PropertyCategory;
  budget?: string;
  minPrice?: number;
  maxPrice?: number;
  /** 1–5; 5 means "5 or more". */
  bhk: number[];
  furnishing: Furnishing[];
  construction: ConstructionStatus[];
  minArea?: number;
  maxArea?: number;
  facing: Facing[];
  amenities: string[];
  listedBy?: ListedBy;
  verified: boolean;
  withPhotos: boolean;
  sort: SortKey;
  page: number;
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** APARTMENT ⇄ "apartment", SEMI_FURNISHED ⇄ "semi-furnished". */
export function enumToSlug(value: string): string {
  return value.toLowerCase().replace(/_/g, "-");
}

function slugToEnum<T extends string>(slug: string, values: Record<string, T>): T | undefined {
  const key = slug.trim().toUpperCase().replace(/-/g, "_");
  return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : undefined;
}

/** Accepts repeated params (?a=1&a=2) and comma lists (?a=1,2). */
function list(raw: string | string[] | undefined): string[] {
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return [...new Set(values.flatMap((v) => v.split(",")).map((v) => v.trim()).filter(Boolean))];
}

function first(raw: string | string[] | undefined): string | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v?.trim() || undefined;
}

function enumList<T extends string>(raw: string | string[] | undefined, values: Record<string, T>): T[] {
  return list(raw)
    .map((s) => slugToEnum(s, values))
    .filter((v): v is T => v !== undefined);
}

function positiveNumber(raw: string | string[] | undefined): number | undefined {
  const v = first(raw);
  if (!v) return undefined;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
}

const SLUG = /^[a-z0-9-]{1,80}$/;

export function parseListingFilters(
  params: RawSearchParams,
  transactionType: TransactionType,
  options: { fixedLocality?: string } = {},
): ListingFilters {
  const q = first(params.q)?.slice(0, 80);
  const budget = first(params.budget);
  const preset = findBudgetPreset(transactionType, budget);
  const explicitMin = parsePrice(first(params.minPrice)) ?? undefined;
  const explicitMax = parsePrice(first(params.maxPrice)) ?? undefined;
  let minPrice = explicitMin ?? preset?.min;
  let maxPrice = explicitMax ?? preset?.max;
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];

  let minArea = positiveNumber(params.minArea);
  let maxArea = positiveNumber(params.maxArea);
  if (minArea !== undefined && maxArea !== undefined && minArea > maxArea) [minArea, maxArea] = [maxArea, minArea];

  const sortRaw = first(params.sort);
  const sort = (SORT_OPTIONS.find((o) => o.value === sortRaw)?.value ?? "relevance") as SortKey;
  const page = Math.min(500, Math.max(1, Math.floor(Number(first(params.page)) || 1)));

  const localities = list(params.locality).filter((s) => SLUG.test(s));
  if (options.fixedLocality && !localities.includes(options.fixedLocality)) localities.unshift(options.fixedLocality);

  return {
    transactionType,
    q: q || undefined,
    localities,
    types: enumList(params.type, PropertyType),
    category: first(params.category) ? slugToEnum(first(params.category)!, PropertyCategory) : undefined,
    budget: preset && explicitMin === undefined && explicitMax === undefined ? preset.key : undefined,
    minPrice,
    maxPrice,
    bhk: [...new Set(list(params.bhk).map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 5))].sort((a, b) => a - b),
    furnishing: enumList(params.furnishing, Furnishing),
    construction: enumList(params.status, ConstructionStatus),
    minArea,
    maxArea,
    facing: enumList(params.facing, Facing),
    amenities: list(params.amenities).filter((s) => SLUG.test(s)),
    listedBy: first(params.listedBy) ? slugToEnum(first(params.listedBy)!, ListedBy) : undefined,
    verified: first(params.verified) === "1",
    withPhotos: first(params.photos) === "1",
    sort,
    page,
  };
}

/** Serialises filters back to a query string (defaults omitted). `omit` drops keys, e.g. for chip removal. */
export function toSearchParams(f: ListingFilters, overrides: Partial<ListingFilters> = {}, options: { omitLocality?: string } = {}): URLSearchParams {
  const v = { ...f, ...overrides };
  const p = new URLSearchParams();
  if (v.q) p.set("q", v.q);
  const localities = options.omitLocality ? v.localities.filter((l) => l !== options.omitLocality) : v.localities;
  if (localities.length) p.set("locality", localities.join(","));
  if (v.types.length) p.set("type", v.types.map(enumToSlug).join(","));
  if (v.category) p.set("category", enumToSlug(v.category));
  if (v.budget) p.set("budget", v.budget);
  else {
    if (v.minPrice !== undefined) p.set("minPrice", String(v.minPrice));
    if (v.maxPrice !== undefined) p.set("maxPrice", String(v.maxPrice));
  }
  if (v.bhk.length) p.set("bhk", v.bhk.join(","));
  if (v.furnishing.length) p.set("furnishing", v.furnishing.map(enumToSlug).join(","));
  if (v.construction.length) p.set("status", v.construction.map(enumToSlug).join(","));
  if (v.minArea !== undefined) p.set("minArea", String(v.minArea));
  if (v.maxArea !== undefined) p.set("maxArea", String(v.maxArea));
  if (v.facing.length) p.set("facing", v.facing.map(enumToSlug).join(","));
  if (v.amenities.length) p.set("amenities", v.amenities.join(","));
  if (v.listedBy) p.set("listedBy", enumToSlug(v.listedBy));
  if (v.verified) p.set("verified", "1");
  if (v.withPhotos) p.set("photos", "1");
  if (v.sort !== "relevance") p.set("sort", v.sort);
  if (v.page > 1) p.set("page", String(v.page));
  return p;
}

export function listingPath(transactionType: TransactionType): "/buy" | "/rent" {
  return transactionType === "SALE" ? "/buy" : "/rent";
}

export function buildListingHref(f: ListingFilters, overrides: Partial<ListingFilters> = {}, options: { omitLocality?: string } = {}): string {
  const qs = toSearchParams(f, { page: 1, ...overrides }, options).toString();
  return `${listingPath(f.transactionType)}${qs ? `?${qs}` : ""}`;
}

/** Number of active refinements (used for the mobile "Filters (3)" badge and the SEO noindex rule). */
export function activeFacetCount(f: ListingFilters): number {
  return [
    f.q,
    f.localities.length,
    f.types.length,
    f.category,
    f.minPrice !== undefined || f.maxPrice !== undefined,
    f.bhk.length,
    f.furnishing.length,
    f.construction.length,
    f.minArea !== undefined || f.maxArea !== undefined,
    f.facing.length,
    f.amenities.length,
    f.listedBy,
    f.verified,
    f.withPhotos,
  ].filter(Boolean).length;
}
