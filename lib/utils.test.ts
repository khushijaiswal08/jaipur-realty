import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("keeps custom utilities alongside the standard ones they don't conflict with", () => {
    expect(cn("bg-brand-900 bg-arches")).toBe("bg-brand-900 bg-arches");
    expect(cn("rounded-card shadow-card", "hover:shadow-card-hover")).toBe("rounded-card shadow-card hover:shadow-card-hover");
  });

  it("still lets later utilities win within a group", () => {
    expect(cn("shadow-card", "shadow-header")).toBe("shadow-header");
    expect(cn("py-14 sm:py-20", "py-0 sm:py-0")).toBe("py-0 sm:py-0");
  });
});
