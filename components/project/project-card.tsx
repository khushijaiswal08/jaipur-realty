import Link from "next/link";
import { Building2, CalendarClock, MapPin } from "lucide-react";
import { SmartImage } from "@/components/shared/smart-image";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { CONSTRUCTION_STATUS_LABELS } from "@/lib/constants/enums";
import { formatMonthYear } from "@/lib/format/date";
import { formatPriceRange } from "@/lib/format/price";
import { projectUrl } from "@/lib/listing";
import { cn } from "@/lib/utils";
import type { ProjectCardDTO } from "@/services/project.service";

export function ProjectCard({ project: p, className }: { project: ProjectCardDTO; className?: string }) {
  const price = p.priceOnRequest ? "Price on Request" : formatPriceRange(p.priceMin, p.priceMax);
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border border-ink-100 bg-white shadow-card transition-shadow hover:shadow-card-hover",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-50">
        <SmartImage
          src={p.cover.url}
          alt={p.cover.alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant="dark">{CONSTRUCTION_STATUS_LABELS[p.constructionStatus]}</Badge>
          {p.reraNumber ? <Badge variant="rera">RERA</Badge> : null}
          {p.isDemo ? <DemoBadge /> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink-950">
          <Link href={projectUrl(p.slug)} className="after:absolute after:inset-0 after:content-['']">
            {p.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-ink-600">by {p.developerName}</p>
        <p className="mt-2 flex items-center gap-1 text-sm text-ink-500">
          <MapPin className="size-3.5" aria-hidden="true" />
          {p.locality.name}, Jaipur
        </p>
        {p.unitSummary ? (
          <p className="mt-1 flex items-start gap-1 text-sm text-ink-700">
            <Building2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {p.unitSummary}
          </p>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="text-lg font-bold text-ink-950">{price}</p>
          {p.possessionDate && p.constructionStatus !== "READY_TO_MOVE" ? (
            <p className="flex items-center gap-1 text-xs text-ink-500">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              Possession {formatMonthYear(p.possessionDate)}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
