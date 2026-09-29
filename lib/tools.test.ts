import { describe, expect, it } from "vitest";
import { calculateEmi, calculateStampDuty } from "./tools";

describe("calculateEmi", () => {
  it("matches the standard reducing-balance formula", () => {
    // ₹50 lakh at 8.5% for 20 years ≈ ₹43,391/month.
    const r = calculateEmi(50_00_000, 8.5, 20)!;
    expect(r.emi).toBe(43_391);
    expect(Math.abs(r.totalPayment - r.emi * 240)).toBeLessThan(240);
    expect(r.totalInterest).toBeGreaterThan(54_00_000);
  });

  it("handles zero interest and rejects invalid input", () => {
    expect(calculateEmi(12_00_000, 0, 1)).toEqual({ emi: 100_000, totalInterest: 0, totalPayment: 12_00_000 });
    expect(calculateEmi(0, 8, 20)).toBeNull();
    expect(calculateEmi(1_00_000, 8, 0)).toBeNull();
  });
});

describe("calculateStampDuty", () => {
  it("applies percentages to the property value", () => {
    expect(calculateStampDuty(50_00_000, 6, 1)).toEqual({ stampDuty: 3_00_000, registrationFee: 50_000, total: 3_50_000 });
    expect(calculateStampDuty(-1, 6, 1)).toBeNull();
  });
});
