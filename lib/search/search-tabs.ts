// Home search panel tabs (Buy / Rent / Commercial / Projects) and the mapping from its
// `/properties?tab=…` submission to the canonical results page. Pure and unit-tested.

import type { PropertyCategory, PropertyType, TransactionType } from "@/generated/prisma/enums";
import { BUDGET_PRESETS, type BudgetPreset } from "@/lib/constants/budgets";
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPE_SLUGS } from "@/lib/constants/enums";
import { buildListingHref, parseListingFilters, type RawSearchParams } from "./filters";

export const SEARCH_TABS = [
  { key: "buy", label: "Buy" },
  { key: "rent", label: "Rent" },
  { key: "commercial", label: "Commercial" },
  { key: "projects", label: "Projects" },
] as const;

export type SearchTab = (typeof SEARCH_TABS)[number]["key"];

export interface OptionGroup {
  label?: string;
  options: Array<{ value: string; label: string }>;
}

const typeOptions = (types: readonly PropertyType[]) => types.map((t) => ({ value: PROPERTY_TYPE_SLUGS[t], label: PROPERTY_TYPE_LABELS[t] }));

const RESIDENTIAL_TYPES = ["APARTMENT", "INDEPENDENT_HOUSE", "VILLA", "BUILDER_FLOOR", "PENTHOUSE", "STUDIO"] as const satisfies readonly PropertyType[];
const LAND_TYPES = ["RESIDENTIAL_PLOT", "AGRICULTURAL_LAND"] as const satisfies readonly PropertyType[];
export const COMMERCIAL_TYPES = ["OFFICE_SPACE", "SHOP", "SHOWROOM", "WAREHOUSE", "COMMERCIAL_PLOT"] as const satisfies readonly PropertyType[];

/** Project segments filter on the unit types in a project's configurations. */
export const PROJECT_SEGMENTS = [
  { value: "residential", label: "Residential apartments & villas", category: "RESIDENTIAL" },
  { value: "plots", label: "Plotted developments", category: "LAND" },
  { value: "commercial", label: "Commercial projects", category: "COMMERCIAL" },
] as const satisfies ReadonlyArray<{ value: string; label: string; category: PropertyCategory }>;

export type ProjectSegment = (typeof PROJECT_SEGMENTS)[number]["value"];

export function projectSegmentFromSlug(slug: string | undefined): ProjectSegment | undefined {
  return PROJECT_SEGMENTS.find((s) => s.value === slug)?.value;
}

export function typeOptionsFor(tab: SearchTab): OptionGroup[] {
  switch (tab) {
    case "commercial":
      return [{ options: typeOptions(COMMERCIAL_TYPES) }];
    case "projects":
      return [{ options: PROJECT_SEGMENTS.map(({ value, label }) => ({ value, label })) }];
    case "rent":
      return [
        { label: "Residential", options: typeOptions(RESIDENTIAL_TYPES) },
        { label: "Commercial", options: typeOptions(COMMERCIAL_TYPES.filter((t) => t !== "COMMERCIAL_PLOT")) },
      ];
    default:
      return [
        { label: "Residential", options: typeOptions(RESIDENTIAL_TYPES) },
        { label: "Plots & land", options: typeOptions(LAND_TYPES) },
        { label: "Commercial", options: typeOptions(COMMERCIAL_TYPES) },
      ];
  }
}

export function transactionFor(tab: SearchTab): TransactionType {
  return tab === "rent" ? "RENT" : "SALE";
}

export function budgetOptionsFor(tab: SearchTab): BudgetPreset[] {
  return BUDGET_PRESETS[transactionFor(tab)];
}

/** BHK makes no sense for shops and offices. */
export function tabUsesBhk(tab: SearchTab): boolean {
  return tab !== "commercial";
}

export function parseSearchTab(raw: string | string[] | undefined): SearchTab {
  const v = (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase();
  return SEARCH_TABS.find((t) => t.key === v)?.key ?? "buy";
}

const first = (raw: string | string[] | undefined) => (Array.isArray(raw) ? raw[0] : raw)?.trim() || undefined;

/**
 * Where a home-search submission should land. Buy/Rent/Commercial go to /buy or /rent
 * (a bare locality search goes to its SEO landing page), Projects to /projects.
 * Unknown or out-of-tab values are dropped, never passed through.
 */
export function resolveSearchUrl(params: RawSearchParams): string {
  const tab = parseSearchTab(params.tab);
  const locality = first(params.locality);
  const validLocality = locality && /^[a-z0-9-]{1,80}$/.test(locality) ? locality : undefined;
  const budget = first(params.budget);
  const validBudget = budgetOptionsFor(tab).some((b) => b.key === budget) ? budget : undefined;
  const typeRaw = first(params.type);
  const allowedTypes = typeOptionsFor(tab).flatMap((g) => g.options.map((o) => o.value));
  const type = typeRaw && allowedTypes.includes(typeRaw) ? typeRaw : undefined;
  const bhk = tabUsesBhk(tab) ? first(params.bhk) : undefined;

  if (tab === "projects") {
    const q = new URLSearchParams();
    if (validLocality) q.set("locality", validLocality);
    if (type) q.set("type", type);
    if (validBudget) q.set("budget", validBudget);
    const bhkValues = (bhk ?? "").split(",").map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 5);
    if (bhkValues.length) q.set("bhk", [...new Set(bhkValues)].sort().join(","));
    const qs = q.toString();
    return `/projects${qs ? `?${qs}` : ""}`;
  }

  const tx = transactionFor(tab);
  const filters = parseListingFilters(
    {
      locality: validLocality,
      type,
      budget: validBudget,
      bhk,
      category: tab === "commercial" && !type ? "commercial" : undefined,
    },
    tx,
  );

  const onlyLocality =
    filters.localities.length === 1 && !filters.types.length && !filters.category && !filters.budget && !filters.bhk.length;
  if (onlyLocality) return `${tx === "SALE" ? "/buy" : "/rent"}/${filters.localities[0]}`;
  return buildListingHref(filters);
}
