import { describe, expect, it } from "vitest";
import { PROPERTY_TYPE_CATEGORY } from "@/lib/constants/enums";
import { AMENITIES } from "./amenities";
import { DEMO_TESTIMONIALS } from "./content";
import { LOCALITIES } from "./localities";
import { PROJECTS } from "./projects";
import { PROPERTIES } from "./properties";

// Guards the demo-content requirements in SPEC §35.2 so future edits to seed data can't
// silently drop coverage.

describe("seed data coverage (SPEC §35.2)", () => {
  it("has exactly the 12 launch localities from SPEC §3", () => {
    expect(LOCALITIES.map((l) => l.slug)).toEqual([
      "vaishali-nagar",
      "malviya-nagar",
      "mansarovar",
      "c-scheme",
      "jagatpura",
      "tonk-road",
      "ajmer-road",
      "raja-park",
      "bani-park",
      "vidhyadhar-nagar",
      "pratap-nagar",
      "jhotwara",
    ]);
  });

  it("has 15+ properties with the required sale/rent mix and locality spread", () => {
    expect(PROPERTIES.length).toBeGreaterThanOrEqual(15);
    expect(PROPERTIES.filter((p) => p.transactionType === "SALE").length).toBeGreaterThanOrEqual(10);
    expect(PROPERTIES.filter((p) => p.transactionType === "RENT").length).toBeGreaterThanOrEqual(5);
    expect(new Set(PROPERTIES.map((p) => p.localitySlug)).size).toBeGreaterThanOrEqual(8);
  });

  it("covers the required property types", () => {
    const count = (pred: (p: (typeof PROPERTIES)[number]) => boolean) => PROPERTIES.filter(pred).length;
    expect(count((p) => p.propertyType === "APARTMENT")).toBeGreaterThanOrEqual(5);
    expect(count((p) => p.propertyType === "INDEPENDENT_HOUSE" || p.propertyType === "VILLA")).toBeGreaterThanOrEqual(2);
    expect(count((p) => p.propertyType === "RESIDENTIAL_PLOT" && p.areaDisplayUnit === "SQYD")).toBeGreaterThanOrEqual(2);
    expect(count((p) => p.propertyType === "BUILDER_FLOOR")).toBeGreaterThanOrEqual(1);
    expect(count((p) => PROPERTY_TYPE_CATEGORY[p.propertyType] === "COMMERCIAL")).toBeGreaterThanOrEqual(2);
  });

  it("covers BHK 1–5, every furnishing value and every construction status", () => {
    const bhk = new Set(PROPERTIES.map((p) => p.bedrooms).filter(Boolean));
    for (const n of [1, 2, 3, 4, 5]) expect(bhk.has(n)).toBe(true);
    const furnishing = new Set(PROPERTIES.map((p) => p.furnishing).filter(Boolean));
    expect([...furnishing].sort()).toEqual(["FULLY_FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]);
    const statuses = new Set([
      ...PROPERTIES.map((p) => p.constructionStatus).filter(Boolean),
      ...PROJECTS.map((p) => p.constructionStatus),
    ]);
    expect([...statuses].sort()).toEqual(["NEW_LAUNCH", "READY_TO_MOVE", "UNDER_CONSTRUCTION", "UPCOMING"]);
  });

  it("keeps prices within the specified demo ranges", () => {
    const sale = PROPERTIES.filter((p) => p.transactionType === "SALE").map((p) => p.price);
    const rent = PROPERTIES.filter((p) => p.transactionType === "RENT").map((p) => p.price);
    expect(Math.min(...sale)).toBeGreaterThanOrEqual(15_00_000);
    expect(Math.max(...sale)).toBeLessThanOrEqual(5_00_00_000);
    expect(Math.min(...rent)).toBeGreaterThanOrEqual(8_000);
    expect(Math.max(...rent)).toBeLessThanOrEqual(1_50_000);
  });

  it("has featured, verified, project-linked and status-variant listings", () => {
    expect(PROPERTIES.filter((p) => p.isFeatured).length).toBeGreaterThanOrEqual(4);
    expect(PROPERTIES.filter((p) => p.isVerified).length).toBeGreaterThanOrEqual(3);
    expect(PROPERTIES.filter((p) => p.projectSlug).length).toBeGreaterThanOrEqual(3);
    expect(PROPERTIES.some((p) => p.status === "UNDER_OFFER")).toBe(true);
    expect(PROPERTIES.some((p) => p.status === "SOLD")).toBe(true);
  });

  it("uses unique ref codes and valid references", () => {
    const refs = PROPERTIES.map((p) => p.refCode);
    expect(new Set(refs).size).toBe(refs.length);
    const localitySlugs = new Set(LOCALITIES.map((l) => l.slug));
    const projectSlugs = new Set(PROJECTS.map((p) => p.slug));
    const amenitySlugs = new Set(AMENITIES.map((a) => a.slug));
    for (const p of PROPERTIES) {
      expect(localitySlugs.has(p.localitySlug), p.refCode).toBe(true);
      if (p.projectSlug) expect(projectSlugs.has(p.projectSlug), p.refCode).toBe(true);
      for (const a of p.amenities) expect(amenitySlugs.has(a), `${p.refCode}: ${a}`).toBe(true);
    }
    for (const project of PROJECTS) {
      expect(localitySlugs.has(project.localitySlug)).toBe(true);
      for (const a of project.amenities) expect(amenitySlugs.has(a), `${project.slug}: ${a}`).toBe(true);
    }
  });

  it("marks demo developers and never invents registration numbers", () => {
    expect(PROJECTS.length).toBeGreaterThanOrEqual(4);
    expect(PROJECTS.length).toBeLessThanOrEqual(5);
    for (const project of PROJECTS) {
      expect(project.developerName.endsWith("(Demo)")).toBe(true);
      expect(project).not.toHaveProperty("reraNumber");
    }
    expect(DEMO_TESTIMONIALS.length).toBeGreaterThanOrEqual(4);
  });
});
