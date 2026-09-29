"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useTransition, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ListingNavigation {
  navigate: (href: string) => void;
  isPending: boolean;
}

const Ctx = createContext<ListingNavigation | null>(null);

/** Shares one transition between filters, sort and results so the grid dims while loading. */
export function ListingNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const navigate = useCallback(
    (href: string) => {
      startTransition(() => router.push(href, { scroll: false }));
    },
    [router],
  );
  return <Ctx.Provider value={{ navigate, isPending }}>{children}</Ctx.Provider>;
}

export function useListingNavigation(): ListingNavigation {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useListingNavigation must be used inside ListingNavigationProvider");
  return ctx;
}

export function ResultsPane({ children }: { children: ReactNode }) {
  const { isPending } = useListingNavigation();
  return (
    <div aria-busy={isPending} className={cn("transition-opacity", isPending && "pointer-events-none opacity-50")}>
      {children}
    </div>
  );
}

/** Collapses repeated keys into comma lists and drops empty values for clean URLs. */
export function formDataToQuery(form: HTMLFormElement): string {
  const data = new FormData(form);
  const grouped = new Map<string, string[]>();
  for (const [key, value] of data.entries()) {
    if (typeof value !== "string" || !value.trim() || key.startsWith("_")) continue;
    grouped.set(key, [...(grouped.get(key) ?? []), value.trim()]);
  }
  // A custom price range overrides the preset.
  if (grouped.has("minPrice") || grouped.has("maxPrice")) grouped.delete("budget");
  const params = new URLSearchParams();
  for (const [key, values] of grouped) params.set(key, values.join(","));
  return params.toString();
}
