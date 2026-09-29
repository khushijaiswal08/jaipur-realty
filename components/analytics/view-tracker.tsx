"use client";

import { useEffect } from "react";
import { track } from "@/lib/client/track";

/** Sends a view beacon (server-side counting, SPEC §48) and an analytics event (SPEC §47). */
export function ViewTracker({ propertyId, projectId }: { propertyId?: string; projectId?: string }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const body = JSON.stringify({
      propertyId,
      projectId,
      referrer: document.referrer || undefined,
      utmSource: params.get("utm_source") ?? undefined,
      utmMedium: params.get("utm_medium") ?? undefined,
      utmCampaign: params.get("utm_campaign") ?? undefined,
    });
    const blob = new Blob([body], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/track/view", blob)) {
      void fetch("/api/track/view", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => undefined);
    }
    track(propertyId ? "property_view" : "project_view", { propertyId, projectId });
  }, [propertyId, projectId]);
  return null;
}
