export * from "./enums";
export * from "./budgets";

export const PAGE_SIZE = {
  listings: 12,
  blog: 9,
  admin: 20,
} as const;

/** Site-visit booking window and slots (SPEC §27). Hours are IST, 24h clock. */
export const SITE_VISIT = {
  daysAhead: 14,
  firstSlotHour: 10,
  lastSlotHour: 18,
  allowSundays: true,
} as const;
