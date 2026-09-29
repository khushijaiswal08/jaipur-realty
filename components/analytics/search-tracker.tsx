"use client";

import { useEffect } from "react";
import { track } from "@/lib/client/track";

/** Fires a `search` event whenever the listing filters change (SPEC §47). */
export function SearchTracker({ signature, transaction, results, facets, term }: { signature: string; transaction: string; results: number; facets: number; term?: string }) {
  useEffect(() => {
    track("search", { transaction, results, facets, search_term: term, filters: signature.slice(0, 100) });
  }, [signature, transaction, results, facets, term]);
  return null;
}
