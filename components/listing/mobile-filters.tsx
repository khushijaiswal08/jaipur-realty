"use client";

import Link from "next/link";
import { useRef } from "react";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { listingPath } from "@/lib/search/filters";
import { FilterForm, type FilterFormProps } from "./filter-form";

/** Filter drawer for small screens (native <dialog>: focus trap + Escape for free). */
export function MobileFilters({ activeCount, total, ...props }: Omit<FilterFormProps, "idPrefix" | "autoApply" | "onApplied" | "footer"> & { activeCount: number; total: number }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => ref.current?.showModal()} className="lg:hidden" aria-haspopup="dialog">
        <SlidersHorizontal aria-hidden="true" />
        Filters
        {activeCount ? <span className="rounded-full bg-brand-600 px-1.5 text-xs text-white">{activeCount}</span> : null}
      </Button>
      <dialog
        ref={ref}
        aria-label="Filters"
        className="m-0 ml-auto h-dvh max-h-none w-full max-w-md bg-white p-0 backdrop:bg-ink-950/40 open:flex open:flex-col"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-ink-100 px-4">
          <h2 className="text-base font-semibold text-ink-950">Filters</h2>
          <Button variant="ghost" size="icon" onClick={() => ref.current?.close()} aria-label="Close filters">
            <X />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pt-4">
          <FilterForm
            {...props}
            idPrefix="m"
            onApplied={() => ref.current?.close()}
            footer={(pending) => (
              <div className="sticky bottom-0 -mx-4 mt-2 flex items-center gap-3 border-t border-ink-100 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <Link href={listingPath(props.filters.transactionType)} className={buttonVariants({ variant: "ghost" })}>
                  Clear all
                </Link>
                <Button type="submit" className="flex-1" disabled={pending}>
                  {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                  Show results
                  {!pending ? ` (${total})` : null}
                </Button>
              </div>
            )}
          />
        </div>
      </dialog>
    </>
  );
}
