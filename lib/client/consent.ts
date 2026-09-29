"use client";

import { useSyncExternalStore } from "react";

// Analytics consent (SPEC §50). Stored per browser; "denied" = essential only.
export type Consent = "granted" | "denied" | "unset";

const KEY = "jr:consent";
const listeners = new Set<() => void>();

function read(): Consent {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : "unset";
  } catch {
    return "unset";
  }
}

export function setConsent(value: "granted" | "denied"): void {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    // Storage blocked — the choice lasts for this page view only.
  }
  listeners.forEach((l) => l());
}

export function useConsent(): Consent {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => "unset",
  );
}
