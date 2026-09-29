import Link from "next/link";
import { SmartImage } from "@/components/shared/smart-image";
import { formatPricePerUnit } from "@/lib/format/price";
import { cn } from "@/lib/utils";
import type { LocalityCardDTO } from "@/services/locality.service";

export function LocalityCard({ locality: l, className }: { locality: LocalityCardDTO; className?: string }) {
  const total = l.saleCount + l.rentCount;
  return (
    <article className={cn("group relative overflow-hidden rounded-card bg-ink-900 shadow-card", className)}>
      <div className="relative aspect-[4/3]">
        <SmartImage
          src={l.image.url}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover opacity-80 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/35 to-transparent" aria-hidden="true" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        {l.zone ? <p className="text-xs font-medium uppercase tracking-wider text-brand-200">{l.zone} Jaipur</p> : null}
        <h3 className="mt-0.5 font-display text-lg font-semibold leading-tight">
          <Link href={`/localities/${l.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {l.name}
          </Link>
        </h3>
        <p className="mt-1 text-xs text-ink-100">
          {total > 0 ? `${l.saleCount} for sale · ${l.rentCount} for rent` : "View locality guide"}
        </p>
        {l.avgPricePerSqft ? (
          <p className="mt-0.5 text-xs text-ink-200">~{formatPricePerUnit(l.avgPricePerSqft)} (indicative)</p>
        ) : null}
      </div>
    </article>
  );
}
