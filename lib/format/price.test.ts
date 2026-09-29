import { describe, expect, it } from "vitest";
import { formatPrice, formatPricePerUnit, formatPriceRange, parsePrice } from "./price";

describe("formatPrice (SPEC §52.1)", () => {
  it.each([
    [85_000, "₹85,000"],
    [4_500_000, "₹45 Lakh"],
    [4_550_000, "₹45.5 Lakh"],
    [100_000, "₹1 Lakh"],
    [12_500_000, "₹1.25 Cr"],
    [100_000_000, "₹10 Cr"],
    [18_50_000, "₹18.5 Lakh"],
    [4_50_00_000, "₹4.5 Cr"],
    [99_999, "₹99,999"],
  ])("%d → %s", (input, expected) => {
    expect(formatPrice(input)).toBe(expected);
  });

  it("promotes ₹100 Lakh to ₹1 Cr after rounding", () => {
    expect(formatPrice(9_999_999)).toBe("₹1 Cr");
    expect(formatPrice(9_999_499)).toBe("₹99.99 Lakh");
  });

  it("rounds half-up to two decimals", () => {
    expect(formatPrice(12_550_000)).toBe("₹1.26 Cr");
    expect(formatPrice(4_512_345)).toBe("₹45.12 Lakh");
  });

  it("accepts bigint (Prisma money columns)", () => {
    expect(formatPrice(BigInt(8_500_000))).toBe("₹85 Lakh");
  });

  it("formats rent per month", () => {
    expect(formatPrice(18_000, { rent: true })).toBe("₹18,000/month");
    expect(formatPrice(120_000, { rent: true })).toBe("₹1.2 Lakh/month");
  });

  it("supports the full style", () => {
    expect(formatPrice(4_500_000, { style: "full" })).toBe("₹45,00,000");
    expect(formatPrice(123_456_789, { style: "full" })).toBe("₹12,34,56,789");
  });

  it("falls back to Price on Request", () => {
    expect(formatPrice(null)).toBe("Price on Request");
    expect(formatPrice(undefined)).toBe("Price on Request");
    expect(formatPrice(-5)).toBe("Price on Request");
    expect(formatPrice(Number.NaN)).toBe("Price on Request");
    expect(formatPrice(0)).toBe("Price on Request");
    expect(formatPrice(4_500_000, { priceOnRequest: true })).toBe("Price on Request");
  });
});

describe("formatPriceRange (SPEC §52.2)", () => {
  it.each([
    [4_500_000, 6_000_000, "₹45 – 60 Lakh"],
    [4_500_000, 12_000_000, "₹45 Lakh – ₹1.2 Cr"],
    [11_000_000, 18_000_000, "₹1.1 – 1.8 Cr"],
    [8_000, 12_000, "₹8,000 – 12,000"],
  ])("%d – %d → %s", (min, max, expected) => {
    expect(formatPriceRange(min, max)).toBe(expected);
  });

  it("handles open and degenerate ranges", () => {
    expect(formatPriceRange(4_500_000, null)).toBe("From ₹45 Lakh");
    expect(formatPriceRange(null, 6_000_000)).toBe("Up to ₹60 Lakh");
    expect(formatPriceRange(4_500_000, 4_500_000)).toBe("₹45 Lakh");
    expect(formatPriceRange(null, null)).toBe("Price on Request");
  });

  it("swaps inverted bounds and supports rent", () => {
    expect(formatPriceRange(6_000_000, 4_500_000)).toBe("₹45 – 60 Lakh");
    expect(formatPriceRange(15_000, 20_000, { rent: true })).toBe("₹15,000 – 20,000/month");
  });
});

describe("formatPricePerUnit", () => {
  it("formats per sq ft and per sq yd", () => {
    expect(formatPricePerUnit(5200)).toBe("₹5,200/sq ft");
    expect(formatPricePerUnit(32_000, "sq yd")).toBe("₹32,000/sq yd");
    expect(formatPricePerUnit(null)).toBe("—");
  });
});

describe("parsePrice (SPEC §52.3)", () => {
  it.each([
    ["45L", 4_500_000],
    ["45 lakh", 4_500_000],
    ["45 lac", 4_500_000],
    ["1.2cr", 12_000_000],
    ["1.2 crore", 12_000_000],
    ["85k", 85_000],
    ["4500000", 4_500_000],
    ["45,00,000", 4_500_000],
    ["₹ 45 Lakhs", 4_500_000],
  ])("%s → %d", (input, expected) => {
    expect(parsePrice(input)).toBe(expected);
  });

  it.each(["", "abc", "45x", "-5", "0"])("rejects %j", (input) => {
    expect(parsePrice(input)).toBeNull();
  });
});
