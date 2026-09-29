// Key facts for the property detail page (SPEC §9) — only fields that have values.

import {
  CONSTRUCTION_STATUS_LABELS,
  FACING_LABELS,
  FURNISHING_LABELS,
  LISTED_BY_LABELS,
  OWNERSHIP_TYPE_LABELS,
  PROPERTY_TYPE_LABELS,
  TENANT_PREFERENCE_LABELS,
} from "@/lib/constants/enums";
import { formatArea, formatAreaDual, formatDimensions } from "@/lib/format/area";
import { formatDate, formatMonthYear } from "@/lib/format/date";
import { formatBhk, formatFloor, pluralize } from "@/lib/format/labels";
import { formatPrice } from "@/lib/format/price";
import type { PropertyDetailDTO } from "@/services/property-detail.service";

export interface Fact {
  label: string;
  value: string;
  /** lucide icon name (components/shared/named-icon). */
  icon: string;
}

export function propertyFacts(p: PropertyDetailDTO): Fact[] {
  const facts: Array<Fact | null> = [
    { label: "Property type", value: PROPERTY_TYPE_LABELS[p.propertyType], icon: "building" },
    p.bedrooms || p.propertyType === "STUDIO" ? { label: "Configuration", value: formatBhk(p.bedrooms, p.propertyType) ?? "", icon: "bed" } : null,
    p.bathrooms ? { label: "Bathrooms", value: String(p.bathrooms), icon: "bath" } : null,
    p.balconies ? { label: "Balconies", value: String(p.balconies), icon: "fence" } : null,
    p.superBuiltUpArea ? { label: "Super built-up area", value: formatArea(p.superBuiltUpArea), icon: "ruler" } : null,
    p.builtUpArea ? { label: "Built-up area", value: formatArea(p.builtUpArea), icon: "ruler" } : null,
    p.carpetArea ? { label: "Carpet area", value: formatArea(p.carpetArea), icon: "ruler" } : null,
    p.plotArea ? { label: "Plot area", value: formatAreaDual(p.plotArea, p.areaDisplayUnit), icon: "land-plot" } : null,
    formatDimensions(p.plotWidthFt, p.plotLengthFt) ? { label: "Plot dimensions", value: formatDimensions(p.plotWidthFt, p.plotLengthFt)!, icon: "ruler" } : null,
    formatFloor(p.floorNumber, p.totalFloors) ? { label: "Floor", value: formatFloor(p.floorNumber, p.totalFloors)!, icon: "layers" } : null,
    p.facing ? { label: "Facing", value: FACING_LABELS[p.facing], icon: "compass" } : null,
    p.furnishing ? { label: "Furnishing", value: FURNISHING_LABELS[p.furnishing], icon: "sofa" } : null,
    p.constructionStatus ? { label: "Status", value: CONSTRUCTION_STATUS_LABELS[p.constructionStatus], icon: "hard-hat" } : null,
    p.possessionDate ? { label: "Possession", value: formatMonthYear(p.possessionDate), icon: "calendar" } : null,
    p.ageYears !== null ? { label: "Age of property", value: p.ageYears === 0 ? "New" : pluralize(p.ageYears, "year"), icon: "calendar" } : null,
    p.availableFrom && p.transactionType === "RENT" ? { label: "Available from", value: availableLabel(p.availableFrom), icon: "calendar" } : null,
    p.preferredTenants.length ? { label: "Preferred tenants", value: p.preferredTenants.map((t) => TENANT_PREFERENCE_LABELS[t]).join(", "), icon: "users" } : null,
    p.securityDeposit ? { label: "Security deposit", value: formatPrice(p.securityDeposit), icon: "wallet" } : null,
    p.maintenanceMonthly ? { label: "Maintenance", value: `${formatPrice(p.maintenanceMonthly)}/month`, icon: "wallet" } : null,
    p.bookingAmount ? { label: "Booking amount", value: formatPrice(p.bookingAmount), icon: "wallet" } : null,
    p.coveredParking || p.openParking ? { label: "Parking", value: parkingLabel(p.coveredParking, p.openParking), icon: "car" } : null,
    p.ownershipType ? { label: "Ownership", value: OWNERSHIP_TYPE_LABELS[p.ownershipType], icon: "file-check" } : null,
    p.roadWidthFt ? { label: "Road width", value: `${p.roadWidthFt} ft`, icon: "route" } : null,
    p.isCornerPlot ? { label: "Corner property", value: "Yes", icon: "square-dashed" } : null,
    p.isGatedCommunity ? { label: "Gated community", value: "Yes", icon: "door-closed" } : null,
    p.jdaApproved !== null ? { label: "JDA approved", value: p.jdaApproved ? "Yes" : "No", icon: "shield-check" } : null,
    p.reraNumber ? { label: "RERA number", value: p.reraNumber, icon: "shield-check" } : null,
    { label: "Listed by", value: LISTED_BY_LABELS[p.listedBy], icon: "user" },
    { label: "Reference", value: p.refCode, icon: "hash" },
    p.publishedAt ? { label: "Listed on", value: formatDate(p.publishedAt), icon: "calendar" } : null,
  ];
  return facts.filter((f): f is Fact => f !== null && f.value !== "");
}

function availableLabel(iso: string): string {
  return new Date(iso).getTime() <= Date.now() ? "Immediately" : formatDate(iso);
}

function parkingLabel(covered: number | null, open: number | null): string {
  const parts = [covered ? `${covered} covered` : null, open ? `${open} open` : null].filter(Boolean);
  return parts.join(", ");
}
