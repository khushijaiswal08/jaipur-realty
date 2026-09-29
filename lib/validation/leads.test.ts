import { describe, expect, it } from "vitest";
import { looksAutomated } from "@/lib/server/spam";
import { rateLimit, resetRateLimits } from "@/lib/server/rate-limit";
import { bookableDates, enquirySchema, fieldErrors, ownerListingSchema, siteVisitSchema } from "./leads";

const ID = "cmumd89t4002yikjagyefbk7v";

describe("enquirySchema", () => {
  it("accepts a valid enquiry and normalises the phone", () => {
    const r = enquirySchema.safeParse({ name: "  Neha  ", phone: "98290 12345", email: "", source: "PROPERTY_ENQUIRY", consent: "on", propertyId: ID });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toMatchObject({ name: "Neha", phone: "+919829012345", email: undefined, propertyId: ID });
    }
  });

  it("rejects bad input with field messages", () => {
    const r = enquirySchema.safeParse({ name: "N", phone: "12345", email: "nope", source: "ADMIN_ONLY", propertyId: "x" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const errors = fieldErrors(r.error);
      expect(errors.name).toMatch(/name/i);
      expect(errors.phone).toMatch(/mobile/i);
      expect(errors.email).toMatch(/email/i);
      expect(errors.consent).toMatch(/agree/i);
      expect(errors.source).toBeDefined();
    }
  });

  it("drops malformed ids instead of trusting them", () => {
    const r = enquirySchema.parse({ name: "Ravi", phone: "9829012345", source: "CONTACT_FORM", consent: "on", propertyId: "../../etc" });
    expect(r.propertyId).toBeUndefined();
  });
});

describe("siteVisitSchema", () => {
  it("accepts a bookable date/slot and converts IST to UTC", () => {
    const date = bookableDates()[0]!;
    const r = siteVisitSchema.parse({ name: "Ravi", phone: "9829012345", date, slot: "15", consent: "on", propertyId: ID });
    expect(r.scheduledAt.toISOString()).toBe(new Date(`${date}T15:00:00+05:30`).toISOString());
  });

  it("rejects past dates, odd slots and missing context", () => {
    const r = siteVisitSchema.safeParse({ name: "Ravi", phone: "9829012345", date: "2020-01-01", slot: "3", consent: "on" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const errors = fieldErrors(r.error);
      expect(errors.date).toBeDefined();
      expect(errors.slot).toBeDefined();
    }
  });
});

describe("ownerListingSchema", () => {
  it("parses shorthand prices and areas", () => {
    const r = ownerListingSchema.parse({
      ownerName: "Suresh",
      ownerPhone: "+91 70000 12345",
      transactionType: "SALE",
      propertyType: "RESIDENTIAL_PLOT",
      expectedPrice: "36L",
      area: "200",
      areaUnit: "SQYD",
      consent: "on",
    });
    expect(r).toMatchObject({ expectedPrice: 3_600_000, area: 200, areaUnit: "SQYD", ownerPhone: "+917000012345" });
  });

  it("reports unparseable prices", () => {
    const r = ownerListingSchema.safeParse({ ownerName: "S", ownerPhone: "1", transactionType: "SALE", propertyType: "VILLA", expectedPrice: "lots", consent: "on" });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error).expectedPrice).toMatch(/price/i);
  });
});

describe("spam heuristics (SPEC §30)", () => {
  it("flags honeypots and too-fast submissions", () => {
    const now = 1_000_000;
    expect(looksAutomated({ honeypot: "http://spam", startedAt: String(now - 10_000) }, now)).toBe(true);
    expect(looksAutomated({ startedAt: String(now - 1000) }, now)).toBe(true);
    // No-JS visitors never send a timestamp — don't discard them.
    expect(looksAutomated({ startedAt: undefined }, now)).toBe(false);
    expect(looksAutomated({ honeypot: "", startedAt: String(now - 8000) }, now)).toBe(false);
  });

  it("rate-limits 5 per window", () => {
    resetRateLimits();
    const results = Array.from({ length: 6 }, (_, i) => rateLimit("k", 5, 60_000, 1000 + i));
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, true, true, false]);
    expect(rateLimit("k", 5, 60_000, 1000 + 61_000).allowed).toBe(true);
  });
});
