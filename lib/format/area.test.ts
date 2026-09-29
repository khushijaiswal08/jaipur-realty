import { describe, expect, it } from "vitest";
import {
  computePricePerSqft,
  convertArea,
  formatArea,
  formatAreaDual,
  formatAreaValue,
  formatDimensions,
  getPrimaryArea,
} from "./area";

describe("area conversion & formatting (SPEC §53)", () => {
  it("converts between units exactly", () => {
    expect(convertArea(200, "SQYD", "SQFT")).toBe(1800);
    expect(convertArea(1, "ACRE", "SQFT")).toBe(43_560);
    expect(convertArea(27_225, "SQFT", "BIGHA")).toBe(1);
  });

  it.each([
    [1250, "SQFT", "1,250 sq ft"],
    [1800, "SQYD", "200 sq yd"],
    [108_900, "ACRE", "2.5 acres"],
    [43_560, "ACRE", "1 acre"],
    [107_639.1, "HECTARE", "1 hectare"],
    [54_450, "BIGHA", "2 bigha"],
    [1000, "SQM", "93 sq m"],
  ] as const)("formatArea(%d, %s) → %s", (sqft, unit, expected) => {
    expect(formatArea(sqft, unit)).toBe(expected);
  });

  it("returns an em dash for missing or invalid areas", () => {
    expect(formatArea(null)).toBe("—");
    expect(formatArea(0)).toBe("—");
    expect(formatArea(-10)).toBe("—");
  });

  it("formats dual units and dimensions", () => {
    expect(formatAreaDual(1800, "SQYD")).toBe("1,800 sq ft (200 sq yd)");
    expect(formatAreaDual(1200, "SQFT")).toBe("1,200 sq ft");
    expect(formatDimensions(30, 60)).toBe("30 × 60 ft");
    expect(formatDimensions(null, 60)).toBeNull();
    expect(formatAreaValue(200, "SQYD")).toBe("200 sq yd");
  });
});

describe("getPrimaryArea (SPEC §53.3)", () => {
  const base = { carpetArea: null, builtUpArea: null, superBuiltUpArea: null, plotArea: null, areaDisplayUnit: "SQFT" as const };

  it("prefers super built-up for residential", () => {
    expect(getPrimaryArea({ ...base, category: "RESIDENTIAL", carpetArea: 1000, superBuiltUpArea: 1400 })).toEqual({
      sqft: 1400,
      kind: "superBuiltUp",
      unit: "SQFT",
    });
  });

  it("prefers carpet for commercial", () => {
    expect(getPrimaryArea({ ...base, category: "COMMERCIAL", carpetArea: 1400, superBuiltUpArea: 1950 })?.kind).toBe("carpet");
  });

  it("uses plot area in its display unit for land", () => {
    expect(getPrimaryArea({ ...base, category: "LAND", plotArea: 2250, areaDisplayUnit: "SQYD" })).toEqual({
      sqft: 2250,
      kind: "plot",
      unit: "SQYD",
    });
  });

  it("returns null when nothing is set", () => {
    expect(getPrimaryArea({ ...base, category: "RESIDENTIAL" })).toBeNull();
  });

  it("computes whole-rupee price per sq ft", () => {
    expect(computePricePerSqft(8_500_000, 1650)).toBe(5152);
    expect(computePricePerSqft(BigInt(7_200_000), 2250)).toBe(3200);
    expect(computePricePerSqft(null, 1000)).toBeNull();
  });
});
