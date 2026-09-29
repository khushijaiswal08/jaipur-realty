import { describe, expect, it } from "vitest";
import { activeFacetCount, buildListingHref, enumToSlug, parseListingFilters, toSearchParams } from "./filters";

describe("parseListingFilters", () => {
  it("returns sensible defaults for an empty query", () => {
    const f = parseListingFilters({}, "SALE");
    expect(f).toMatchObject({ transactionType: "SALE", localities: [], types: [], bhk: [], sort: "relevance", page: 1 });
    expect(activeFacetCount(f)).toBe(0);
  });

  it("parses repeated and comma-separated lists, dropping invalid values", () => {
    const f = parseListingFilters(
      { locality: ["vaishali-nagar", "mansarovar,c-scheme", "Bad Slug!"], type: "apartment,villa,castle", bhk: "2,3,9,x", furnishing: "semi-furnished" },
      "SALE",
    );
    expect(f.localities).toEqual(["vaishali-nagar", "mansarovar", "c-scheme"]);
    expect(f.types).toEqual(["APARTMENT", "VILLA"]);
    expect(f.bhk).toEqual([2, 3]);
    expect(f.furnishing).toEqual(["SEMI_FURNISHED"]);
  });

  it("applies budget presets per transaction type", () => {
    expect(parseListingFilters({ budget: "50l-75l" }, "SALE")).toMatchObject({ budget: "50l-75l", minPrice: 5_000_000, maxPrice: 7_500_000 });
    expect(parseListingFilters({ budget: "10k-20k" }, "RENT")).toMatchObject({ minPrice: 10_000, maxPrice: 20_000 });
    // A sale preset key is meaningless on /rent.
    expect(parseListingFilters({ budget: "50l-75l" }, "RENT").minPrice).toBeUndefined();
  });

  it("lets explicit min/max (with shorthand) override presets and swaps inverted ranges", () => {
    const f = parseListingFilters({ budget: "50l-75l", minPrice: "1cr", maxPrice: "60L" }, "SALE");
    expect(f).toMatchObject({ budget: undefined, minPrice: 6_000_000, maxPrice: 10_000_000 });
  });

  it("parses sort, page, flags and fixed locality", () => {
    const f = parseListingFilters({ sort: "price-desc", page: "3", verified: "1", photos: "1" }, "RENT", { fixedLocality: "raja-park" });
    expect(f).toMatchObject({ sort: "price-desc", page: 3, verified: true, withPhotos: true, localities: ["raja-park"] });
    expect(parseListingFilters({ sort: "nonsense", page: "-4" }, "SALE")).toMatchObject({ sort: "relevance", page: 1 });
  });
});

describe("toSearchParams / buildListingHref", () => {
  it("round-trips filters and omits defaults", () => {
    const f = parseListingFilters({ locality: "jagatpura", type: "apartment", bhk: "3", status: "under-construction", sort: "newest", page: "2" }, "SALE");
    expect(toSearchParams(f).toString()).toBe("locality=jagatpura&type=apartment&bhk=3&status=under-construction&sort=newest&page=2");
    // Links built from filters reset to page 1.
    expect(buildListingHref(f)).toBe("/buy?locality=jagatpura&type=apartment&bhk=3&status=under-construction&sort=newest");
  });

  it("supports chip removal via overrides and omitLocality", () => {
    const f = parseListingFilters({ locality: "jagatpura,mansarovar", bhk: "2" }, "RENT");
    expect(buildListingHref(f, { bhk: [] })).toBe("/rent?locality=jagatpura%2Cmansarovar");
    expect(buildListingHref(f, {}, { omitLocality: "jagatpura" })).toBe("/rent?locality=mansarovar&bhk=2");
  });

  it("converts enums to URL slugs", () => {
    expect(enumToSlug("READY_TO_MOVE")).toBe("ready-to-move");
  });
});
