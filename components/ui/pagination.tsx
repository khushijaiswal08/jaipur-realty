import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Builds the href for a page number, preserving the current filters. */
  hrefFor: (page: number) => string;
  className?: string;
}

/** Windowed page list: 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(page: number, total: number): Array<number | "gap"> {
  const pages = new Set<number>([1, total, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  for (const [i, p] of sorted.entries()) {
    const prev = sorted[i - 1];
    if (prev !== undefined && p - prev > 1) out.push("gap");
    out.push(p);
  }
  return out;
}

export function Pagination({ page, totalPages, hrefFor, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  const item = "inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium";
  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1", className)}>
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={cn(item, "text-ink-700 hover:bg-ink-50")} rel="prev">
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
        </Link>
      ) : null}
      {pageWindow(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className={cn(item, "text-ink-400")} aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(item, p === page ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-50")}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={cn(item, "text-ink-700 hover:bg-ink-50")} rel="next">
          <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </nav>
  );
}
