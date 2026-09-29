"use client";

import { Select } from "@/components/ui/form-controls";
import { SORT_OPTIONS, listingPath, toSearchParams, type ListingFilters, type SortKey } from "@/lib/search/filters";
import { useListingNavigation } from "./listing-navigation";

/** Sort dropdown. Plain GET form without JS (hidden inputs carry the current filters). */
export function SortSelect({ filters }: { filters: ListingFilters }) {
  const { navigate } = useListingNavigation();
  const path = listingPath(filters.transactionType);
  const carried = [...toSearchParams(filters, { sort: "relevance", page: 1 }).entries()];

  return (
    <form action={path} method="get" className="flex items-center gap-2">
      {carried.map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <label htmlFor="sort" className="hidden text-sm text-ink-500 sm:block">
        Sort by
      </label>
      <Select
        id="sort"
        name="sort"
        defaultValue={filters.sort}
        className="h-9 w-auto rounded-lg text-sm"
        onChange={(e) => {
          const qs = toSearchParams(filters, { sort: e.target.value as SortKey, page: 1 }).toString();
          navigate(`${path}${qs ? `?${qs}` : ""}`);
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
      <noscript>
        <button type="submit" className="text-sm font-semibold text-brand-700">
          Apply
        </button>
      </noscript>
    </form>
  );
}
