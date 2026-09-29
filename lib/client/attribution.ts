"use client";

// First-touch marketing attribution (SPEC §26, §28.2): the UTM params, landing page and
// referrer from the visitor's first visit, kept for 30 days and attached to every lead form.

const KEY = "jr:attr";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface Attribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  landingPage?: string;
  referrer?: string;
  ts: number;
}

export function readAttribution(): Attribution | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Attribution;
    if (!parsed.ts || Date.now() - parsed.ts > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Records attribution on landing. Keeps the first touch; a new campaign URL (utm_*) replaces an expired one only. */
export function captureAttribution(): void {
  try {
    if (readAttribution()) return;
    const url = new URL(window.location.href);
    const p = url.searchParams;
    const externalReferrer = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : undefined;
    const data: Attribution = {
      utmSource: p.get("utm_source") ?? undefined,
      utmMedium: p.get("utm_medium") ?? undefined,
      utmCampaign: p.get("utm_campaign") ?? undefined,
      utmTerm: p.get("utm_term") ?? undefined,
      utmContent: p.get("utm_content") ?? undefined,
      landingPage: `${url.pathname}${url.search}`.slice(0, 300),
      referrer: externalReferrer?.slice(0, 300),
      ts: Date.now(),
    };
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable — attribution is best-effort.
  }
}
