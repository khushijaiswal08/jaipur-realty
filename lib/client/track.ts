"use client";

// Tiny analytics event bus (SPEC §47). Components dispatch events here; the analytics
// loader (components/analytics) forwards them to whichever providers are configured.

export type TrackEvent =
  | "search"
  | "property_view"
  | "project_view"
  | "enquiry_submit"
  | "whatsapp_click"
  | "call_click"
  | "site_visit_request"
  | "owner_listing_submit"
  | "brochure_download"
  | "shortlist_add"
  | "compare_add";

export type TrackParams = Record<string, string | number | boolean | undefined>;

export function track(event: TrackEvent, params: TrackParams = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("jr:track", { detail: { event, ...params } }));
}
