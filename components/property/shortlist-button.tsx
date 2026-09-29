"use client";

import { Heart } from "lucide-react";
import { shortlistStore } from "@/lib/client/local-list-store";
import { cn } from "@/lib/utils";

/** Heart toggle (SPEC §17). Saved ids live in localStorage — no login needed. */
export function ShortlistButton({ id, title, className, withLabel = false }: { id: string; title: string; className?: string; withLabel?: boolean }) {
  const saved = shortlistStore.useHas(id);

  return (
    <button
      type="button"
      onClick={() => {
        const { added } = shortlistStore.toggle(id);
        if (added) window.dispatchEvent(new CustomEvent("jr:track", { detail: { event: "shortlist_add", propertyId: id } }));
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from shortlist` : `Save ${title} to shortlist`}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-white/95 text-ink-800 shadow-sm ring-1 ring-ink-900/10 transition-colors hover:bg-white hover:text-brand-700",
        withLabel ? "h-10 px-4 text-sm font-semibold" : "size-9",
        className,
      )}
    >
      <Heart className={cn("size-4.5", saved && "fill-brand-600 text-brand-600")} aria-hidden="true" />
      {withLabel ? (saved ? "Saved" : "Save") : null}
    </button>
  );
}
