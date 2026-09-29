// Site-visit booking window (SPEC §27). Dependency-light so client pickers can use it.

import { SITE_VISIT } from "@/lib/constants";
import { toIstDateString } from "@/lib/format/date";

/** Bookable dates (IST, YYYY-MM-DD): tomorrow … +N days, optionally excluding Sundays. */
export function bookableDates(now: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = 1; i <= SITE_VISIT.daysAhead; i++) {
    const iso = toIstDateString(new Date(now.getTime() + i * 86_400_000));
    const weekday = new Date(`${iso}T12:00:00+05:30`).getUTCDay();
    if (!SITE_VISIT.allowSundays && weekday === 0) continue;
    out.push(iso);
  }
  return out;
}

/** Hourly slot start times in IST (24h). */
export function bookableSlots(): number[] {
  const out: number[] = [];
  for (let h = SITE_VISIT.firstSlotHour; h <= SITE_VISIT.lastSlotHour; h++) out.push(h);
  return out;
}

/** 15 → "3:00 – 4:00 pm" */
export function slotLabel(hour: number): string {
  const fmt = (h: number) => `${((h + 11) % 12) + 1}:00`;
  const suffix = (h: number) => (h < 12 ? "am" : "pm");
  const end = hour + 1;
  return suffix(hour) === suffix(end) ? `${fmt(hour)} – ${fmt(end)} ${suffix(end)}` : `${fmt(hour)} ${suffix(hour)} – ${fmt(end)} ${suffix(end)}`;
}
