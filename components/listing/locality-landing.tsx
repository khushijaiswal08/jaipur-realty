import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import type { TransactionType } from "@/generated/prisma/enums";
import { formatPricePerUnit } from "@/lib/format/price";
import { truncate } from "@/lib/format/labels";
import { loadListingPage } from "@/lib/listing-page";
import type { RawSearchParams } from "@/lib/search/filters";
import { listingPath } from "@/lib/search/filters";
import { getLocalityBySlug } from "@/services/locality-detail.service";
import { ListingView } from "./listing-view";

/** /buy/[locality] and /rent/[locality] — crawlable locality landing pages (SPEC §5). */
export async function LocalityLanding({ slug, tx, searchParams }: { slug: string; tx: TransactionType; searchParams: RawSearchParams }) {
  const locality = await getLocalityBySlug(slug);
  if (!locality) notFound();
  const data = await loadListingPage(searchParams, tx, slug);
  const other: TransactionType = tx === "SALE" ? "RENT" : "SALE";
  const otherCount = other === "SALE" ? locality.stats.saleCount : locality.stats.rentCount;

  return (
    <ListingView
      {...data}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: tx === "SALE" ? "Buy" : "Rent", href: listingPath(tx) },
        { label: locality.name },
      ]}
      intro={
        <div className="mt-4 max-w-3xl space-y-2 text-sm text-ink-600">
          {locality.description ? <p>{truncate(locality.description, 260)}</p> : null}
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            {locality.avgPricePerSqft && tx === "SALE" ? <span>Indicative rate ~{formatPricePerUnit(locality.avgPricePerSqft)}</span> : null}
            {locality.avgRent2Bhk && tx === "RENT" ? <span>Typical 2 BHK rent ~{formatPricePerUnit(locality.avgRent2Bhk, "month")}</span> : null}
            <Link href={`/localities/${locality.slug}`} className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-800">
              {locality.name} locality guide <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            {otherCount ? (
              <Link href={`${listingPath(other)}/${locality.slug}`} className="font-semibold text-brand-700 hover:text-brand-800">
                {otherCount} {other === "SALE" ? "for sale" : "for rent"} in {locality.name}
              </Link>
            ) : null}
          </p>
        </div>
      }
    />
  );
}
