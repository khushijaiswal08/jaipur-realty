import { describe, expect, it } from "vitest";
import { formatDate, formatMonthYear, formatRelative, istDateTimeToUtc, toIstDateString } from "./date";
import { formatBhk, formatFloor, ordinal, pluralize, truncate } from "./labels";

describe("labels (SPEC §54)", () => {
  it("formats BHK", () => {
    expect(formatBhk(3)).toBe("3 BHK");
    expect(formatBhk(1, "STUDIO")).toBe("1 RK");
    expect(formatBhk(null)).toBeNull();
  });

  it("formats floors", () => {
    expect(formatFloor(0)).toBe("Ground floor");
    expect(formatFloor(-1)).toBe("Basement");
    expect(formatFloor(3, 12)).toBe("3rd of 12 floors");
    expect(formatFloor(3)).toBe("3rd floor");
    expect(formatFloor(0, 4)).toBe("Ground floor of 4");
  });

  it("builds ordinals and plurals", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 101].map(ordinal)).toEqual([
      "1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd", "101st",
    ]);
    expect(pluralize(1, "bathroom")).toBe("1 bathroom");
    expect(pluralize(2, "bathroom")).toBe("2 bathrooms");
  });

  it("truncates on word boundaries", () => {
    expect(truncate("Short", 10)).toBe("Short");
    expect(truncate("A spacious three bedroom apartment", 20)).toBe("A spacious three…");
  });
});

describe("dates in IST", () => {
  it("formats dates and months", () => {
    expect(formatDate(new Date("2026-10-12T06:00:00Z"))).toBe("12 Oct 2026");
    expect(formatMonthYear("2027-12-31T00:00:00Z")).toBe("Dec 2027");
    expect(formatDate(null)).toBe("—");
  });

  it("uses the IST calendar day", () => {
    // 20:00 UTC on 11 Oct is 01:30 IST on 12 Oct.
    expect(toIstDateString(new Date("2026-10-11T20:00:00Z"))).toBe("2026-10-12");
  });

  it("describes relative days", () => {
    const now = new Date("2026-10-12T06:00:00Z");
    expect(formatRelative(new Date("2026-10-12T01:00:00Z"), now)).toBe("today");
    expect(formatRelative(new Date("2026-10-11T06:00:00Z"), now)).toBe("yesterday");
    expect(formatRelative(new Date("2026-10-09T06:00:00Z"), now)).toBe("3 days ago");
  });

  it("converts IST wall-clock time to UTC", () => {
    expect(istDateTimeToUtc("2026-10-12", 15)?.toISOString()).toBe("2026-10-12T09:30:00.000Z");
    expect(istDateTimeToUtc("not-a-date", 10)).toBeNull();
  });
});
