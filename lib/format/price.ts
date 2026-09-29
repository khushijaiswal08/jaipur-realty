import { formatNumberIN, roundHalfUp, toFiniteNumber } from "./number";

/** Whole rupees. BigInt is accepted because Prisma returns money columns as bigint. */
export type Rupees = number | bigint;

export const LAKH = 100_000;
export const CRORE = 10_000_000;
export const PRICE_ON_REQUEST = "Price on Request";

type Unit = "none" | "lakh" | "cr";

interface Scaled {
  value: number;
  unit: Unit;
}

function validAmount(value: Rupees | null | undefined): number | null {
  const n = toFiniteNumber(value);
  return n !== null && n > 0 ? n : null;
}

/** SPEC §52.1 rules 2–5, including the "₹100 Lakh → ₹1 Cr" promotion. */
function scale(n: number): Scaled {
  if (n < LAKH) return { value: Math.round(n), unit: "none" };
  const lakhs = roundHalfUp(n / LAKH, 2);
  if (n < CRORE && lakhs < 100) return { value: lakhs, unit: "lakh" };
  return { value: roundHalfUp(n / CRORE, 2), unit: "cr" };
}

function amountText({ value, unit }: Scaled): string {
  return unit === "none" ? formatNumberIN(value) : formatNumberIN(value, 2);
}

function unitSuffix(unit: Unit): string {
  return unit === "lakh" ? " Lakh" : unit === "cr" ? " Cr" : "";
}

export interface FormatPriceOptions {
  /** Appends "/month" (RENT listings). */
  rent?: boolean;
  /** "short" (default) = ₹45 Lakh; "full" = ₹45,00,000. */
  style?: "short" | "full";
  priceOnRequest?: boolean;
}

/**
 * Formats whole rupees the Indian way.
 * 85000 → "₹85,000" · 4500000 → "₹45 Lakh" · 12500000 → "₹1.25 Cr" · rent 18000 → "₹18,000/month"
 */
export function formatPrice(value: Rupees | null | undefined, options: FormatPriceOptions = {}): string {
  const n = validAmount(value);
  if (options.priceOnRequest || n === null) return PRICE_ON_REQUEST;
  const suffix = options.rent ? "/month" : "";
  if (options.style === "full") return `₹${formatNumberIN(Math.round(n))}${suffix}`;
  const scaled = scale(n);
  return `₹${amountText(scaled)}${unitSuffix(scaled.unit)}${suffix}`;
}

/**
 * SPEC §52.2. Same unit collapses ("₹45 – 60 Lakh"); mixed units repeat ("₹45 Lakh – ₹1.2 Cr").
 */
export function formatPriceRange(
  min: Rupees | null | undefined,
  max: Rupees | null | undefined,
  options: Pick<FormatPriceOptions, "rent"> = {},
): string {
  let lo = validAmount(min);
  let hi = validAmount(max);
  if (lo === null && hi === null) return PRICE_ON_REQUEST;
  if (lo === null) return `Up to ${formatPrice(hi, options)}`;
  if (hi === null) return `From ${formatPrice(lo, options)}`;
  if (lo > hi) [lo, hi] = [hi, lo];

  const a = scale(lo);
  const b = scale(hi);
  const suffix = options.rent ? "/month" : "";
  if (a.unit === b.unit && a.value === b.value) return formatPrice(lo, options);
  if (a.unit === b.unit) {
    return `₹${amountText(a)} – ${amountText(b)}${unitSuffix(b.unit)}${suffix}`;
  }
  return `₹${amountText(a)}${unitSuffix(a.unit)} – ₹${amountText(b)}${unitSuffix(b.unit)}${suffix}`;
}

/** 5200 → "₹5,200/sq ft". `unitLabel` lets plots show "/sq yd". */
export function formatPricePerUnit(value: number | null | undefined, unitLabel = "sq ft"): string {
  const n = validAmount(value);
  if (n === null) return "—";
  return `₹${formatNumberIN(Math.round(n))}/${unitLabel}`;
}

const PRICE_PATTERN =
  /^(\d+(?:\.\d+)?)(k|thousand|l|lac|lacs|lakh|lakhs|cr|crs|crore|crores)?$/;

const MULTIPLIERS: Record<string, number> = {
  k: 1_000,
  thousand: 1_000,
  l: LAKH,
  lac: LAKH,
  lacs: LAKH,
  lakh: LAKH,
  lakhs: LAKH,
  cr: CRORE,
  crs: CRORE,
  crore: CRORE,
  crores: CRORE,
};

/**
 * Parses user/URL input into whole rupees. SPEC §52.3.
 * "45L" → 4500000 · "1.2 crore" → 12000000 · "85k" → 85000 · "45,00,000" → 4500000
 */
export function parsePrice(input: string | null | undefined): number | null {
  if (!input) return null;
  const cleaned = input
    .toLowerCase()
    .replace(/₹|rs\.?|inr|,|\s/g, "")
    .trim();
  const match = PRICE_PATTERN.exec(cleaned);
  if (!match) return null;
  const amount = Number(match[1]);
  const multiplier = match[2] ? (MULTIPLIERS[match[2]] ?? 1) : 1;
  const result = Math.round(amount * multiplier);
  return Number.isFinite(result) && result > 0 ? result : null;
}
