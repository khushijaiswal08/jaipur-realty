import Link from "next/link";
import { SmartImage } from "@/components/shared/smart-image";
import { formatPricePerUnit } from "@/lib/format/price";
import { cn } from "@/lib/utils";
import type { LocalityCardDTO } from "@/services/locality.service";

/** Jaipur locality tile: photo, zone, live listing counts and indicative rate. */
export function LocationCard({ locality: l, className }: { locality: LocalityCardDTO; className?: string }) {
  const total = l.saleCount + l.rentCount;
  return (
    <article className={cn("group relative overflow-hidden rounded-card bg-brand-900 shadow-card", className)}>
      <div className="relative aspect-[4/5] sm:aspect-[4/3]">
        <SmartImage
          src={l.image.url}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover opacity-85 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-950/40 to-transparent" aria-hidden="true" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        {l.zone ? <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-gold-300">{l.zone} Jaipur</p> : null}
        <h3 className="mt-1 font-display text-lg font-semibold leading-tight sm:text-xl">
          <Link href={`/localities/${l.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {l.name}
          </Link>
        </h3>
        <p className="mt-1.5 text-xs text-brand-100">
          {total > 0 ? `${l.saleCount} for sale · ${l.rentCount} for rent` : "View locality guide"}
        </p>
        {l.avgPricePerSqft ? <p className="mt-0.5 text-xs text-brand-200">~{formatPricePerUnit(l.avgPricePerSqft)} (indicative)</p> : null}
      </div>
      <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gold-500 transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
    </article>
  );
}
