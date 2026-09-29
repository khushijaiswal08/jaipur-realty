import { describe, expect, it } from "vitest";
import { formatPhone, isValidIndianMobile, normalizeIndianPhone, telHref, whatsappDigits } from "./phone";

describe("Indian phone helpers (SPEC §24.1)", () => {
  it.each([
    ["9829012345", "+919829012345"],
    ["+91 98290 12345", "+919829012345"],
    ["+91-98290-12345", "+919829012345"],
    ["09829012345", "+919829012345"],
    ["919829012345", "+919829012345"],
    ["(98290) 12345", "+919829012345"],
    ["0141 234 5678", "+911412345678"],
  ])("normalises %s → %s", (input, expected) => {
    expect(normalizeIndianPhone(input)).toBe(expected);
  });

  it.each(["12345", "98290123456789", "0000000000", "", "abc"])("rejects %j", (input) => {
    expect(normalizeIndianPhone(input)).toBeNull();
  });

  it("accepts only mobiles for lead forms", () => {
    expect(isValidIndianMobile("98290 12345")).toBe(true);
    expect(isValidIndianMobile("6000012345")).toBe(true);
    expect(isValidIndianMobile("0141 234 5678")).toBe(false);
    expect(isValidIndianMobile("5829012345")).toBe(false);
  });

  it("formats for display", () => {
    expect(formatPhone("+919829012345")).toBe("+91 98290 12345");
    expect(formatPhone("01412345678")).toBe("+91 141 234 5678");
  });

  it("builds tel: and wa.me digits", () => {
    expect(telHref("98290 12345")).toBe("tel:+919829012345");
    expect(whatsappDigits("+91 98290 12345")).toBe("919829012345");
    expect(telHref("123")).toBeNull();
  });
});
