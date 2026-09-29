import Link from "next/link";
import { formatPricePerUnit, formatPriceRange } from "@/lib/format/price";
import type { LocalityDetailDTO } from "@/services/locality-detail.service";

/** Live stats from current listings + manually maintained indicative rates (SPEC §11.3). */
export function LocalityStats({ locality: l }: { locality: LocalityDetailDTO }) {
  const s = l.stats;
  const items: Array<{ label: string; value: string; sub: string; href?: string }> = [
    {
      label: "For sale",
      value: String(s.saleCount),
      sub: s.saleCount ? formatPriceRange(s.salePriceMin, s.salePriceMax) : "No active listings",
      href: `/buy/${l.slug}`,
    },
    {
      label: "For rent",
      value: String(s.rentCount),
      sub: s.rentCount ? formatPriceRange(s.rentMin, s.rentMax, { rent: true }) : "No active listings",
      href: `/rent/${l.slug}`,
    },
    {
      label: "Avg. listed price / sq ft",
      value: s.liveAvgPricePerSqft ? formatPricePerUnit(s.liveAvgPricePerSqft) : "—",
      sub: "From current sale listings",
    },
    {
      label: "Indicative rate",
      value: l.avgPricePerSqft ? formatPricePerUnit(l.avgPricePerSqft) : "—",
      sub: l.avgRent2Bhk ? `2 BHK rent ~${formatPricePerUnit(l.avgRent2Bhk, "month")}` : "Guide value",
    },
  ];
  const card = "block rounded-card border border-ink-100 bg-white p-4 shadow-card";
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((i) => {
        const body = (
          <>
            <span className="block text-xs font-medium uppercase tracking-wider text-ink-500">{i.label}</span>
            <span className="mt-1 block text-2xl font-bold text-ink-950">{i.value}</span>
            <span className="mt-0.5 block text-xs text-ink-500">{i.sub}</span>
          </>
        );
        return (
          <li key={i.label}>
            {i.href ? (
              <Link href={i.href} className={`${card} transition-shadow hover:shadow-card-hover`}>
                {body}
              </Link>
            ) : (
              <div className={card}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
