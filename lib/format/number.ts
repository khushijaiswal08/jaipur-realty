/** Indian digit grouping (12,34,56,789). SPEC §52.1 rule 1. */
const groupers = new Map<number, Intl.NumberFormat>();

export function formatNumberIN(value: number, maxFractionDigits = 0): string {
  let fmt = groupers.get(maxFractionDigits);
  if (!fmt) {
    fmt = new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: maxFractionDigits,
      minimumFractionDigits: 0,
    });
    groupers.set(maxFractionDigits, fmt);
  }
  return fmt.format(value);
}

/** Half-up rounding to `digits` decimals, robust to binary float noise (1.005 → 1.01). */
export function roundHalfUp(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function toFiniteNumber(value: number | bigint | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "bigint" ? Number(value) : value;
  return Number.isFinite(n) ? n : null;
}
