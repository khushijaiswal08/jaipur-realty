"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GitCompareArrows, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { compareStore } from "@/lib/client/local-list-store";
import { cn } from "@/lib/utils";

/** "Add to compare" toggle (max 3 — SPEC §16). */
export function CompareButton({ id, className }: { id: string; className?: string }) {
  const selected = compareStore.useHas(id);
  const [limitHit, setLimitHit] = useState(false);
  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => {
          const { added, limitReached } = compareStore.toggle(id);
          setLimitHit(limitReached);
          if (added) window.dispatchEvent(new CustomEvent("jr:track", { detail: { event: "compare_add", propertyId: id } }));
        }}
        className={buttonVariants({ variant: selected ? "subtle" : "outline", size: "md", className: "w-full" })}
      >
        <GitCompareArrows aria-hidden="true" />
        {selected ? "Added to compare" : "Compare"}
      </button>
      {limitHit ? (
        <p role="status" className="mt-1.5 text-xs text-warning-600">
          You can compare up to {compareStore.max} properties. Remove one first.
        </p>
      ) : null}
    </div>
  );
}

/** Floating tray while a comparison is in progress (hidden on /compare itself). */
export function CompareTray() {
  const ids = compareStore.useIds();
  const pathname = usePathname();
  if (!ids.length || pathname === "/compare") return null;
  return (
    <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 max-md:bottom-20">
      <div className="flex items-center gap-3 rounded-full bg-ink-950 py-2 pl-5 pr-2 text-sm text-white shadow-card-hover">
        <GitCompareArrows className="size-4 text-gold-300" aria-hidden="true" />
        <span>
          {ids.length} of {compareStore.max} selected
        </span>
        <Link href="/compare" className={buttonVariants({ size: "sm", className: "rounded-full" })}>
          Compare
        </Link>
        <button
          type="button"
          onClick={() => compareStore.clear()}
          className="rounded-full p-2 text-ink-300 hover:bg-white/10 hover:text-white"
          aria-label="Clear comparison"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
