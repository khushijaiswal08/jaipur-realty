import { describe, expect, it } from "vitest";
import { clientIp, deviceTypeFromUA, hashVisitor } from "./request-meta";

const h = (init: Record<string, string>) => new Headers(init);

describe("clientIp", () => {
  it("uses the address appended by the trusted proxy, ignoring spoofed entries", () => {
    expect(clientIp(h({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" }), 1)).toBe("203.0.113.9");
  });

  it("walks back one entry per trusted proxy", () => {
    expect(clientIp(h({ "x-forwarded-for": "6.6.6.6, 203.0.113.9, 172.70.1.1" }), 2)).toBe("203.0.113.9");
  });

  it("never walks past the start of the chain", () => {
    expect(clientIp(h({ "x-forwarded-for": "203.0.113.9" }), 3)).toBe("203.0.113.9");
  });

  it("falls back to x-real-ip, then a constant", () => {
    expect(clientIp(h({ "x-real-ip": "198.51.100.4" }), 1)).toBe("198.51.100.4");
    expect(clientIp(h({}), 1)).toBe("0.0.0.0");
  });
});

describe("deviceTypeFromUA", () => {
  it("classifies common agents", () => {
    expect(deviceTypeFromUA("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148")).toBe("mobile");
    expect(deviceTypeFromUA("Mozilla/5.0 (Linux; Android 14; SM-X710) Safari/537.36")).toBe("tablet");
    expect(deviceTypeFromUA("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140.0")).toBe("desktop");
  });
});

describe("hashVisitor", () => {
  it("is stable within a day and rotates across days", () => {
    const day1 = new Date("2026-09-29T06:00:00Z");
    const day1Later = new Date("2026-09-29T15:00:00Z");
    const day2 = new Date("2026-09-30T06:00:00Z");
    expect(hashVisitor("203.0.113.9", "ua", day1)).toBe(hashVisitor("203.0.113.9", "ua", day1Later));
    expect(hashVisitor("203.0.113.9", "ua", day1)).not.toBe(hashVisitor("203.0.113.9", "ua", day2));
  });
});
