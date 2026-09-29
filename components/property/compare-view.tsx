"use client";

import Link from "next/link";
import { GitCompareArrows, X } from "lucide-react";
import { SmartImage } from "@/components/shared/smart-image";
import { DemoBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/layout-primitives";
import { compareStore } from "@/lib/client/local-list-store";
import { usePropertyList } from "@/lib/client/use-property-list";
import {
  CONSTRUCTION_STATUS_LABELS,
  FACING_LABELS,
  FURNISHING_LABELS,
  LISTING_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@/lib/constants/enums";
import { formatArea } from "@/lib/format/area";
import { formatMonthYear } from "@/lib/format/date";
import { formatBhk, formatFloor } from "@/lib/format/labels";
import { formatPrice } from "@/lib/format/price";
import { priceLabel, pricePerAreaLabel, primaryAreaLabel, propertyUrl } from "@/lib/listing";
import { cn } from "@/lib/utils";
import type { PropertyDetailDTO } from "@/services/property-detail.service";

type Row = { label: string; value: (p: PropertyDetailDTO) => string };

const dash = "—";
const ROWS: Row[] = [
  { label: "Price", value: (p) => priceLabel(p) },
  { label: "Price per area", value: (p) => pricePerAreaLabel(p) ?? dash },
  { label: "Type", value: (p) => PROPERTY_TYPE_LABELS[p.propertyType] },
  { label: "Locality", value: (p) => p.locality.name },
  { label: "Bedrooms", value: (p) => formatBhk(p.bedrooms, p.propertyType) ?? dash },
  { label: "Bathrooms", value: (p) => (p.bathrooms ? String(p.bathrooms) : dash) },
  { label: "Area", value: (p) => primaryAreaLabel(p.primaryArea, true) ?? dash },
  { label: "Carpet area", value: (p) => (p.carpetArea ? formatArea(p.carpetArea) : dash) },
  { label: "Plot area", value: (p) => (p.plotArea ? formatArea(p.plotArea, p.areaDisplayUnit) : dash) },
  { label: "Floor", value: (p) => formatFloor(p.floorNumber, p.totalFloors) ?? dash },
  { label: "Facing", value: (p) => (p.facing ? FACING_LABELS[p.facing] : dash) },
  { label: "Furnishing", value: (p) => (p.furnishing ? FURNISHING_LABELS[p.furnishing] : dash) },
  { label: "Status", value: (p) => (p.constructionStatus ? CONSTRUCTION_STATUS_LABELS[p.constructionStatus] : dash) },
  { label: "Possession", value: (p) => (p.possessionDate ? formatMonthYear(p.possessionDate) : dash) },
  { label: "Age", value: (p) => (p.ageYears !== null ? `${p.ageYears} yr${p.ageYears === 1 ? "" : "s"}` : dash) },
  { label: "Parking", value: (p) => (p.coveredParking || p.openParking ? `${(p.coveredParking ?? 0) + (p.openParking ?? 0)}` : dash) },
  { label: "Maintenance", value: (p) => (p.maintenanceMonthly ? `${formatPrice(p.maintenanceMonthly)}/month` : dash) },
  { label: "Security deposit", value: (p) => (p.securityDeposit ? formatPrice(p.securityDeposit) : dash) },
  { label: "Amenities", value: (p) => (p.amenities.length ? String(p.amenities.length) : dash) },
  { label: "Listing status", value: (p) => LISTING_STATUS_LABELS[p.status] },
];

export function CompareView() {
  const ids = compareStore.useIds();
  const { items, status } = usePropertyList<PropertyDetailDTO>(ids, true);

  if (status === "loading" && !items.length) return <Skeleton className="h-[32rem] rounded-card" />;

  if (!items.length) {
    return (
      <EmptyState
        icon={<GitCompareArrows />}
        title="Nothing to compare yet"
        description={`Use “Compare” on up to ${compareStore.max} property pages, then come back here to see them side by side.`}
      >
        <Link href="/buy" className={buttonVariants()}>
          Browse properties
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="relative overflow-x-auto rounded-card border border-ink-100 bg-white shadow-card">
      <table className="w-full min-w-[40rem] table-fixed text-sm">
        <caption className="sr-only">Property comparison</caption>
        <thead>
          <tr>
            <th scope="col" className="w-36 p-4 text-left align-bottom text-xs font-semibold uppercase tracking-wider text-ink-500">
              Property
            </th>
            {items.map((p) => (
              <th key={p.id} scope="col" className="p-4 text-left align-top font-normal">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink-50">
                  <SmartImage src={p.images[0]!.url} alt={p.images[0]!.alt} fill sizes="(min-width: 768px) 25vw, 60vw" className="object-cover" />
                  {p.isDemo ? <DemoBadge className="absolute left-2 top-2" /> : null}
                  <button
                    type="button"
                    onClick={() => compareStore.remove(p.id)}
                    className="absolute right-2 top-2 rounded-full bg-white/95 p-1.5 text-ink-700 shadow-sm hover:text-danger-700"
                    aria-label={`Remove ${p.title} from comparison`}
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <Link href={propertyUrl(p.slug)} className="mt-3 line-clamp-2 block font-semibold text-ink-950 hover:text-brand-700">
                  {p.title}
                </Link>
                <p className="mt-0.5 text-xs text-ink-500">Ref: {p.refCode}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const values = items.map((p) => row.value(p));
            const differs = new Set(values).size > 1;
            return (
              <tr key={row.label} className="border-t border-ink-100">
                <th scope="row" className="p-4 text-left font-medium text-ink-600">
                  {row.label}
                </th>
                {values.map((v, i) => (
                  <td key={items[i]!.id} className={cn("p-4 text-ink-900", differs && items.length > 1 && "bg-brand-50/60 font-medium")}>
                    {v}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
