// Dates are stored in UTC and always displayed in IST. SPEC §54.

export const IST_TIME_ZONE = "Asia/Kolkata";

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: IST_TIME_ZONE,
});

const monthYearFmt = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  year: "numeric",
  timeZone: IST_TIME_ZONE,
});

const dateTimeFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: IST_TIME_ZONE,
});

const relativeFmt = new Intl.RelativeTimeFormat("en-IN", { numeric: "auto" });

type DateInput = Date | string | number | null | undefined;

function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "12 Oct 2026" */
export function formatDate(value: DateInput): string {
  const d = toDate(value);
  return d ? dateFmt.format(d) : "—";
}

/** "Dec 2027" — possession dates. */
export function formatMonthYear(value: DateInput): string {
  const d = toDate(value);
  return d ? monthYearFmt.format(d) : "—";
}

/** "12 Oct 2026, 3:30 pm" */
export function formatDateTime(value: DateInput): string {
  const d = toDate(value);
  return d ? dateTimeFmt.format(d) : "—";
}

const DAY_MS = 86_400_000;

/** "today", "yesterday", "3 days ago", "2 weeks ago", "5 months ago", "last year". */
export function formatRelative(value: DateInput, now: Date = new Date()): string {
  const d = toDate(value);
  if (!d) return "—";
  const days = Math.round((istMidnight(d) - istMidnight(now)) / DAY_MS);
  const abs = Math.abs(days);
  if (abs < 7) return relativeFmt.format(days, "day");
  if (abs < 30) return relativeFmt.format(Math.trunc(days / 7), "week");
  if (abs < 365) return relativeFmt.format(Math.trunc(days / 30), "month");
  return relativeFmt.format(Math.trunc(days / 365), "year");
}

/** Epoch ms of midnight (IST) on the calendar day containing `d`. */
function istMidnight(d: Date): number {
  const [y, m, day] = toIstDateString(d).split("-").map(Number) as [number, number, number];
  return Date.UTC(y, m - 1, day);
}

/** "2026-10-12" — the IST calendar date; also the value format for <input type="date">. */
export function toIstDateString(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: IST_TIME_ZONE,
  }).format(d);
}

/** Builds a UTC Date for a wall-clock time in IST, e.g. ("2026-10-12", 15) → 09:30Z. */
export function istDateTimeToUtc(isoDate: string, hour: number, minute = 0): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  const [, y, m, d] = match;
  // IST is UTC+05:30 with no DST.
  const utc = Date.UTC(Number(y), Number(m) - 1, Number(d), hour, minute) - 330 * 60_000;
  const result = new Date(utc);
  return Number.isNaN(result.getTime()) ? null : result;
}
