import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getIpHashSalt } from "@/lib/config/server";
import { toIstDateString } from "@/lib/format/date";

export interface RequestMeta {
  /** SHA-256(IP + UA + daily salt). No raw IP is ever stored (SPEC §48, §50). */
  visitorHash: string;
  userAgent: string;
  deviceType: "mobile" | "tablet" | "desktop";
  referrer: string | null;
  isBot: boolean;
}

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|uptime/i;

export function clientIp(h: Headers): string {
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || h.get("cf-connecting-ip") || "0.0.0.0";
}

export function deviceTypeFromUA(ua: string): RequestMeta["deviceType"] {
  if (/ipad|tablet|playbook|silk/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) return "tablet";
  if (/mobi|iphone|android/i.test(ua)) return "mobile";
  return "desktop";
}

/** Daily-rotating salted hash, so the same visitor can't be linked across days. */
export function hashVisitor(ip: string, ua: string, date: Date = new Date()): string {
  return createHash("sha256").update(`${ip}|${ua}|${toIstDateString(date)}|${getIpHashSalt()}`).digest("hex");
}

export async function getRequestMeta(): Promise<RequestMeta> {
  const h = await headers();
  const ua = h.get("user-agent") ?? "";
  return {
    visitorHash: hashVisitor(clientIp(h), ua),
    userAgent: ua.slice(0, 300),
    deviceType: deviceTypeFromUA(ua),
    referrer: h.get("referer")?.slice(0, 500) ?? null,
    isBot: BOT_UA.test(ua) || ua.length === 0,
  };
}
