import { describe, expect, it } from "vitest";
import { DEFAULT_TRUST_METRICS, parseTrustMetrics, trustMetricsSchema } from "./trust-metrics";

describe("trust metrics", () => {
  it("falls back to live-count defaults when nothing is stored", () => {
    expect(parseTrustMetrics(null)).toEqual(DEFAULT_TRUST_METRICS);
    expect(DEFAULT_TRUST_METRICS.every((m) => m.source && !m.value)).toBe(true);
  });

  it("falls back to defaults when stored JSON is invalid", () => {
    expect(parseTrustMetrics([{ label: "x" }])).toEqual(DEFAULT_TRUST_METRICS);
  });

  it("accepts fixed values and live counts", () => {
    const metrics = [
      { label: "Years in Jaipur", value: "15+" },
      { label: "Active listings", source: "activeListings" },
    ];
    expect(parseTrustMetrics(metrics)).toEqual(metrics);
  });

  it("requires a value or a source, and caps the list at four", () => {
    expect(trustMetricsSchema.safeParse([{ label: "Families helped" }]).success).toBe(false);
    expect(trustMetricsSchema.safeParse(Array.from({ length: 5 }, () => ({ label: "Listings", source: "activeListings" }))).success).toBe(false);
  });
});
