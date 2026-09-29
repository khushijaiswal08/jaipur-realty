import { describe, expect, it } from "vitest";
import { parseSearchTab, resolveSearchUrl, tabUsesBhk, typeOptionsFor } from "./search-tabs";

describe("resolveSearchUrl", () => {
  it("sends Buy searches to /buy with canonical params", () => {
    expect(resolveSearchUrl({ tab: "buy", locality: "vaishali-nagar", type: "apartment", budget: "50l-75l", bhk: "3" })).toBe(
      "/buy?locality=vaishali-nagar&type=apartment&budget=50l-75l&bhk=3",
    );
  });

  it("defaults to Buy and an empty search", () => {
    expect(resolveSearchUrl({})).toBe("/buy");
  });

  it("uses the locality landing page when only a locality is chosen", () => {
    expect(resolveSearchUrl({ tab: "rent", locality: "malviya-nagar" })).toBe("/rent/malviya-nagar");
  });

  it("uses rent budgets on the Rent tab and drops sale budgets", () => {
    expect(resolveSearchUrl({ tab: "rent", budget: "10k-20k" })).toBe("/rent?budget=10k-20k");
    expect(resolveSearchUrl({ tab: "rent", budget: "50l-75l" })).toBe("/rent");
  });

  it("scopes Commercial to the commercial category and ignores BHK", () => {
    expect(resolveSearchUrl({ tab: "commercial", bhk: "2" })).toBe("/buy?category=commercial");
    expect(resolveSearchUrl({ tab: "commercial", type: "shop", locality: "raja-park" })).toBe("/buy?locality=raja-park&type=shop");
  });

  it("drops types that don't belong to the tab", () => {
    expect(resolveSearchUrl({ tab: "commercial", type: "villa" })).toBe("/buy?category=commercial");
  });

  it("sends Projects searches to /projects with segment, budget and BHK", () => {
    expect(resolveSearchUrl({ tab: "projects", locality: "jagatpura", type: "residential", budget: "50l-75l", bhk: "2,3" })).toBe(
      "/projects?locality=jagatpura&type=residential&budget=50l-75l&bhk=2%2C3",
    );
  });

  it("rejects malformed localities", () => {
    expect(resolveSearchUrl({ tab: "buy", locality: "../etc" })).toBe("/buy");
  });
});

describe("tab helpers", () => {
  it("parses tabs case-insensitively with a Buy fallback", () => {
    expect(parseSearchTab("Rent")).toBe("rent");
    expect(parseSearchTab("nonsense")).toBe("buy");
  });

  it("hides BHK only for Commercial", () => {
    expect(tabUsesBhk("commercial")).toBe(false);
    expect(tabUsesBhk("projects")).toBe(true);
  });

  it("offers project segments on the Projects tab", () => {
    expect(typeOptionsFor("projects")[0]!.options.map((o) => o.value)).toEqual(["residential", "plots", "commercial"]);
  });
});
