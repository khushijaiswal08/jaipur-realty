"use client";

import { useEffect, useState } from "react";

type Status = "loading" | "ready" | "error";

/** Fetches card (or detail) data for ids held in a local list store. */
export function usePropertyList<T extends { id: string }>(ids: string[], detail = false): { items: T[]; status: Status } {
  const key = ids.join(",");
  const [state, setState] = useState<{ key: string; items: T[]; status: Status }>({ key: "", items: [], status: "loading" });

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    fetch(`/api/properties/cards?ids=${encodeURIComponent(key)}${detail ? "&detail=1" : ""}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { items: T[] }) => setState({ key, items: data.items, status: "ready" }))
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === "AbortError")) setState({ key, items: [], status: "error" });
      });
    return () => controller.abort();
  }, [key, detail]);

  if (!key) return { items: [], status: "ready" };
  // Keep showing the previous list while a changed list loads; filter out removed ids immediately.
  const items = state.items.filter((i) => ids.includes(i.id));
  return { items, status: state.key === key ? state.status : items.length ? "ready" : "loading" };
}
