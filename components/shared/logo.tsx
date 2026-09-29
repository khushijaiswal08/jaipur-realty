import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * Brand mark. Uses NEXT_PUBLIC_BUSINESS_LOGO_URL when set, otherwise a text wordmark built from
 * the business name — the placeholder until a real logo exists (docs/ASSUMPTIONS.md).
 */
export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  const initials = siteConfig.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <Link href="/" className={cn("inline-flex min-w-0 items-center gap-2.5", className)} aria-label={`${siteConfig.name} — home`}>
      {siteConfig.logoUrl ? (
        <Image
          src={siteConfig.logoUrl}
          alt={siteConfig.name}
          width={160}
          height={40}
          className="h-9 w-auto"
          unoptimized={siteConfig.logoUrl.endsWith(".svg")}
          preload
        />
      ) : (
        <>
          <span
            aria-hidden="true"
            className={cn(
              "flex size-9 items-center justify-center rounded-xl font-display text-base font-bold shadow-sm",
              tone === "light" ? "bg-gold-500 text-brand-900" : "bg-brand-600 text-gold-300",
            )}
          >
            {initials}
          </span>
          <span className={cn("truncate font-display text-lg font-semibold leading-tight", tone === "light" ? "text-white" : "text-brand-900")}>
            {siteConfig.name}
          </span>
        </>
      )}
    </Link>
  );
}
