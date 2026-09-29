import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

/** Visual breadcrumbs. The matching BreadcrumbList JSON-LD is emitted by lib/seo (SPEC §32). */
export function Breadcrumbs({ items, className, tone = "light" }: { items: Crumb[]; className?: string; tone?: "light" | "dark" }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className={cn(
                    "underline-offset-4 hover:underline",
                    tone === "dark" ? "text-ink-200 hover:text-white" : "text-ink-500 hover:text-ink-900",
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn("line-clamp-1", tone === "dark" ? "text-white" : "text-ink-800")}>
                  {item.label}
                </span>
              )}
              {!last ? <ChevronRight className={cn("size-3.5", tone === "dark" ? "text-ink-300" : "text-ink-300")} aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
