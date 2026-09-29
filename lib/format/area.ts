import type { AreaUnit, PropertyCategory } from "@/generated/prisma/enums";
import { formatNumberIN, roundHalfUp } from "./number";

/** Square feet per unit. SPEC §53.1. Canonical storage is square feet. */
export const SQFT_PER_UNIT: Record<AreaUnit, number> = {
  SQFT: 1,
  SQYD: 9,
  SQM: 10.7639,
  ACRE: 43_560,
  HECTARE: 107_639.1,
  // Rajasthan "pucca" bigha. Bigha varies by region, so it lives in one named constant.
  BIGHA: 27_225,
};

export const AREA_UNIT_LABELS: Record<AreaUnit, { singular: string; plural: string }> = {
  SQFT: { singular: "sq ft", plural: "sq ft" },
  SQYD: { singular: "sq yd", plural: "sq yd" },
  SQM: { singular: "sq m", plural: "sq m" },
  ACRE: { singular: "acre", plural: "acres" },
  HECTARE: { singular: "hectare", plural: "hectares" },
  BIGHA: { singular: "bigha", plural: "bigha" },
};

/** Long names for selects and the area converter. */
export const AREA_UNIT_NAMES: Record<AreaUnit, string> = {
  SQFT: "Square feet (sq ft)",
  SQYD: "Square yards (sq yd / Gaj)",
  SQM: "Square metres (sq m)",
  ACRE: "Acres",
  HECTARE: "Hectares",
  BIGHA: "Bigha (Rajasthan)",
};

const WHOLE_NUMBER_UNITS: ReadonlySet<AreaUnit> = new Set<AreaUnit>(["SQFT", "SQYD", "SQM"]);

export function convertArea(value: number, from: AreaUnit, to: AreaUnit): number {
  return (value * SQFT_PER_UNIT[from]) / SQFT_PER_UNIT[to];
}

export function toSqft(value: number, from: AreaUnit): number {
  return convertArea(value, from, "SQFT");
}

function isValidArea(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/** Formats a value that is already expressed in `unit`. */
export function formatAreaValue(value: number | null | undefined, unit: AreaUnit): string {
  if (!isValidArea(value)) return "—";
  const digits = WHOLE_NUMBER_UNITS.has(unit) ? 0 : 2;
  const rounded = roundHalfUp(value, digits);
  const labels = AREA_UNIT_LABELS[unit];
  return `${formatNumberIN(rounded, digits)} ${rounded === 1 ? labels.singular : labels.plural}`;
}

/** 1250 → "1,250 sq ft"; formatArea(1800, "SQYD") → "200 sq yd". SPEC §53.2. */
export function formatArea(sqft: number | null | undefined, unit: AreaUnit = "SQFT"): string {
  if (!isValidArea(sqft)) return "—";
  return formatAreaValue(convertArea(sqft, "SQFT", unit), unit);
}

/** "1,800 sq ft (200 sq yd)" — used on plot detail pages. */
export function formatAreaDual(sqft: number | null | undefined, unit: AreaUnit): string {
  if (!isValidArea(sqft)) return "—";
  if (unit === "SQFT") return formatArea(sqft);
  return `${formatArea(sqft)} (${formatArea(sqft, unit)})`;
}

/** "780 – 850 sq ft", "200 sq yd" (equal bounds), or "—". Values in sq ft. */
export function formatAreaRange(minSqft: number | null | undefined, maxSqft: number | null | undefined, unit: AreaUnit = "SQFT"): string {
  const lo = isValidArea(minSqft) ? minSqft : null;
  const hi = isValidArea(maxSqft) ? maxSqft : null;
  if (lo === null && hi === null) return "—";
  if (lo === null || hi === null || Math.abs(lo - hi) < 1) return formatArea((lo ?? hi)!, unit);
  const digits = WHOLE_NUMBER_UNITS.has(unit) ? 0 : 2;
  const a = formatNumberIN(roundHalfUp(convertArea(Math.min(lo, hi), "SQFT", unit), digits), digits);
  return `${a} – ${formatArea(Math.max(lo, hi), unit)}`;
}

/** "30 × 60 ft" */
export function formatDimensions(widthFt: number | null | undefined, lengthFt: number | null | undefined): string | null {
  if (!isValidArea(widthFt) || !isValidArea(lengthFt)) return null;
  return `${formatNumberIN(roundHalfUp(widthFt, 1), 1)} × ${formatNumberIN(roundHalfUp(lengthFt, 1), 1)} ft`;
}

export type AreaKind = "superBuiltUp" | "builtUp" | "carpet" | "plot";

export const AREA_KIND_LABELS: Record<AreaKind, string> = {
  superBuiltUp: "super built-up",
  builtUp: "built-up",
  carpet: "carpet",
  plot: "plot",
};

export interface AreaFields {
  category: PropertyCategory;
  carpetArea: number | null;
  builtUpArea: number | null;
  superBuiltUpArea: number | null;
  plotArea: number | null;
  areaDisplayUnit: AreaUnit;
}

export interface PrimaryArea {
  sqft: number;
  kind: AreaKind;
  /** Unit to display this area in. */
  unit: AreaUnit;
}

/** SPEC §53.3 — which area a card or price-per-area calculation uses. */
export function getPrimaryArea(p: AreaFields): PrimaryArea | null {
  const candidates: Array<[AreaKind, number | null]> =
    p.category === "LAND"
      ? [["plot", p.plotArea]]
      : p.category === "COMMERCIAL"
        ? [
            ["carpet", p.carpetArea],
            ["builtUp", p.builtUpArea],
            ["superBuiltUp", p.superBuiltUpArea],
            ["plot", p.plotArea],
          ]
        : [
            ["superBuiltUp", p.superBuiltUpArea],
            ["builtUp", p.builtUpArea],
            ["carpet", p.carpetArea],
            ["plot", p.plotArea],
          ];
  for (const [kind, sqft] of candidates) {
    if (isValidArea(sqft)) {
      return { sqft, kind, unit: kind === "plot" ? p.areaDisplayUnit : "SQFT" };
    }
  }
  return null;
}

/** Whole-rupee price per sq ft, or null when either side is missing. SPEC §53.4. */
export function computePricePerSqft(price: number | bigint | null | undefined, sqft: number | null | undefined): number | null {
  if (price === null || price === undefined || !isValidArea(sqft)) return null;
  const p = typeof price === "bigint" ? Number(price) : price;
  if (!Number.isFinite(p) || p <= 0) return null;
  return Math.round(p / sqft);
}
