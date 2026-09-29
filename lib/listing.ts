// Presentation helpers shared by property cards and detail pages.

import type { ConstructionStatus, Furnishing, PropertyType, TransactionType } from "@/generated/prisma/enums";
import { absoluteUrl } from "@/lib/config";
import { AREA_KIND_LABELS, formatArea, SQFT_PER_UNIT, type PrimaryArea } from "@/lib/format/area";
import { formatBhk } from "@/lib/format/labels";
import { formatPrice, formatPricePerUnit } from "@/lib/format/price";
import { AREA_UNIT_SHORT_LABELS, CONSTRUCTION_STATUS_LABELS, FURNISHING_LABELS } from "@/lib/constants/enums";
import { propertyMessage } from "@/lib/whatsapp";

export interface PriceFields {
  price: number | null;
  priceOnRequest: boolean;
  transactionType: TransactionType;
}

export function priceLabel(p: PriceFields): string {
  return formatPrice(p.price, { rent: p.transactionType === "RENT", priceOnRequest: p.priceOnRequest });
}

/** "₹5,152/sq ft", or "₹32,000/sq yd" for plots displayed in sq yd. Sale listings only. */
export function pricePerAreaLabel(p: PriceFields & { pricePerSqft: number | null; primaryArea: PrimaryArea | null }): string | null {
  if (p.transactionType !== "SALE" || p.priceOnRequest || !p.pricePerSqft) return null;
  const unit = p.primaryArea?.kind === "plot" ? p.primaryArea.unit : "SQFT";
  if (unit === "SQFT") return formatPricePerUnit(p.pricePerSqft);
  return formatPricePerUnit(p.pricePerSqft * SQFT_PER_UNIT[unit], AREA_UNIT_SHORT_LABELS[unit]);
}

export function primaryAreaLabel(area: PrimaryArea | null, withKind = false): string | null {
  if (!area) return null;
  const text = formatArea(area.sqft, area.unit);
  return withKind && area.kind !== "plot" ? `${text} (${AREA_KIND_LABELS[area.kind]})` : text;
}

export function propertyUrl(slug: string): string {
  return `/property/${slug}`;
}

export function projectUrl(slug: string): string {
  return `/projects/${slug}`;
}

export function propertyWhatsAppMessage(p: PriceFields & { title: string; refCode: string; slug: string }): string {
  return propertyMessage({
    title: p.title,
    refCode: p.refCode,
    priceLabel: priceLabel(p),
    url: absoluteUrl(propertyUrl(p.slug)),
  });
}

/** Up to three short facts for a card: BHK · area · furnishing/possession. */
export function cardFacts(p: {
  bedrooms: number | null;
  propertyType: PropertyType;
  primaryArea: PrimaryArea | null;
  transactionType: TransactionType;
  furnishing: Furnishing | null;
  constructionStatus: ConstructionStatus | null;
}): string[] {
  const facts: string[] = [];
  const bhk = formatBhk(p.bedrooms, p.propertyType);
  if (bhk) facts.push(bhk);
  const area = primaryAreaLabel(p.primaryArea);
  if (area) facts.push(area);
  if (p.transactionType === "RENT" && p.furnishing) facts.push(FURNISHING_LABELS[p.furnishing]);
  else if (p.constructionStatus) facts.push(CONSTRUCTION_STATUS_LABELS[p.constructionStatus]);
  return facts;
}
