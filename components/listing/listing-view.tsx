import Link from "next/link";
import type { ReactNode } from "react";
import { SearchX } from "lucide-react";
import { SearchTracker } from "@/components/analytics/search-tracker";
import { PropertyGrid } from "@/components/property/property-card";
import { WhatsAppButton } from "@/components/shared/contact-buttons";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button";
import { Container, EmptyState } from "@/components/ui/layout-primitives";
import { Pagination } from "@/components/ui/pagination";
import { formatNumberIN } from "@/lib/format/number";
import { formatPriceRange } from "@/lib/format/price";
import { activeFacetCount, buildListingHref, listingPath, toSearchParams, type ListingFilters } from "@/lib/search/filters";
import type { AmenityOptionDTO } from "@/services/amenity.service";
import type { LocalityLinkDTO } from "@/services/locality.service";
import type { SearchResult } from "@/services/property-search.service";
import { ActiveFilters, filterChips } from "./active-filters";
import { FilterForm } from "./filter-form";
import { ListingNavigationProvider, ResultsPane } from "./listing-navigation";
import { MobileFilters } from "./mobile-filters";
import { SortSelect } from "./sort-select";

interface ListingViewProps {
  filters: ListingFilters;
  result: SearchResult;
  heading: string;
  localities: LocalityLinkDTO[];
  amenities: AmenityOptionDTO[];
  breadcrumbs: Crumb[];
  /** Optional intro block (locality landing pages). */
  intro?: ReactNode;
  /** Optional content below results (SEO copy, related links). */
  after?: ReactNode;
}

export function ListingView({ filters: f, result, heading, localities, amenities, breadcrumbs, intro, after }: ListingViewProps) {
  const localityNames = new Map(localities.map((l) => [l.slug, l.name]));
  const amenityNames = new Map(amenities.map((a) => [a.slug, a.name]));
  const chips = filterChips(f, localityNames, amenityNames);
  const formKey = toSearchParams(f, { page: 1 }).toString();
  const formProps = {
    filters: f,
    localities: localities.map((l) => ({ name: l.name, slug: l.slug })),
    amenities: amenities.map((a) => ({ name: a.name, slug: a.slug })),
  };
  const from = result.total ? (result.page - 1) * result.pageSize + 1 : 0;
  const to = Math.min(result.total, result.page * result.pageSize);
  const budget =
    f.minPrice !== undefined || f.maxPrice !== undefined ? `, budget ${formatPriceRange(f.minPrice, f.maxPrice, { rent: f.transactionType === "RENT" })}` : "";
  const enquiryMessage = `Hi, I'm looking for: ${heading}${budget}. Please share matching options.`;

  return (
    <ListingNavigationProvider>
      <SearchTracker signature={formKey} transaction={f.transactionType} results={result.total} facets={activeFacetCount(f)} term={f.q} />
      <div className="border-b border-ink-100 bg-white">
        <Container className="py-6 sm:py-8">
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="mt-3 font-display text-2xl leading-tight text-ink-950 sm:text-3xl">{heading}</h1>
          <p className="mt-1 text-sm text-ink-500" aria-live="polite">
            {result.total === 1 ? "1 property" : `${formatNumberIN(result.total)} properties`} found
          </p>
          {intro}
        </Container>
      </div>

      <Container className="py-6 sm:py-8">
        <div className="lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-8">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-card border border-ink-100 bg-white p-5 shadow-card">
              <FilterForm key={`d-${formKey}`} {...formProps} idPrefix="d" autoApply />
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <MobileFilters key={`m-${formKey}`} {...formProps} activeCount={activeFacetCount(f)} total={result.total} />
                {result.total ? (
                  <p className="text-sm text-ink-600">
                    Showing {from}–{to} of {formatNumberIN(result.total)}
                  </p>
                ) : null}
              </div>
              <SortSelect filters={f} />
            </div>

            <ActiveFilters chips={chips} transactionType={f.transactionType} />

            <ResultsPane>
              {result.items.length ? (
                <>
                  <PropertyGrid properties={result.items} className="mt-6 lg:grid-cols-2 xl:grid-cols-3" priorityCount={3} />
                  <Pagination
                    className="mt-10"
                    page={result.page}
                    totalPages={result.totalPages}
                    hrefFor={(page) => {
                      const qs = toSearchParams(f, { page }).toString();
                      return `${listingPath(f.transactionType)}${qs ? `?${qs}` : ""}`;
                    }}
                  />
                </>
              ) : (
                <EmptyState
                  className="mt-6"
                  icon={<SearchX />}
                  title="No properties match these filters"
                  description={
                    chips.length ? (
                      <>
                        <p>Try removing a filter:</p>
                        <ul className="mt-3 flex flex-wrap justify-center gap-2">
                          {chips.slice(0, 6).map((c) => (
                            <li key={c.href + c.label}>
                              <Link href={c.href} className="inline-block rounded-full border border-ink-200 px-3 py-1 text-sm font-medium text-ink-700 hover:border-brand-300 hover:text-brand-800">
                                Remove {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-4">Or tell us what you need — we often have options that aren&apos;t listed online yet.</p>
                      </>
                    ) : (
                      "New listings are added regularly. Tell us what you need and we'll share options."
                    )
                  }
                >
                  <WhatsAppButton context="listing_empty" message={enquiryMessage} />
                  <Link href={buildListingHref({ ...f, localities: [], types: [], bhk: [] }, { transactionType: f.transactionType === "SALE" ? "RENT" : "SALE" })} className={buttonVariants({ variant: "outline" })}>
                    Browse {f.transactionType === "SALE" ? "rentals" : "properties for sale"}
                  </Link>
                </EmptyState>
              )}
            </ResultsPane>
            {after}
          </div>
        </div>
      </Container>
    </ListingNavigationProvider>
  );
}
