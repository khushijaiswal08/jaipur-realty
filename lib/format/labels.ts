import type { PropertyType } from "@/generated/prisma/enums";

/** 1st, 2nd, 3rd, 4th, 11th, 12th, 13th, 21st … */
export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

/** "1 bathroom", "2 bathrooms". */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** "3 BHK"; studios display as "1 RK". Returns null when bedrooms don't apply. SPEC §54. */
export function formatBhk(bedrooms: number | null | undefined, propertyType?: PropertyType): string | null {
  if (propertyType === "STUDIO") return "1 RK";
  if (bedrooms === null || bedrooms === undefined || bedrooms < 1) return null;
  return `${bedrooms} BHK`;
}

/** "Ground floor", "Basement", "3rd of 12 floors", "3rd floor". */
export function formatFloor(floorNumber: number | null | undefined, totalFloors?: number | null): string | null {
  if (floorNumber === null || floorNumber === undefined) {
    return totalFloors ? pluralize(totalFloors, "floor") + " in total" : null;
  }
  if (floorNumber < 0) return "Basement";
  if (floorNumber === 0) return totalFloors ? `Ground floor of ${totalFloors}` : "Ground floor";
  return totalFloors ? `${ordinal(floorNumber)} of ${totalFloors} floors` : `${ordinal(floorNumber)} floor`;
}

/** Truncates on a word boundary and appends an ellipsis. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, Math.max(0, max - 1));
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
