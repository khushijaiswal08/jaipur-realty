import Link from "next/link";
import { BadgeCheck, Camera, MapPin, Star } from "lucide-react";
import { CallButton, WhatsAppButton } from "@/components/shared/contact-buttons";
import { SmartImage } from "@/components/shared/smart-image";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { LISTING_STATUS_LABELS, TRANSACTION_TYPE_BADGE } from "@/lib/constants/enums";
import { formatRelative } from "@/lib/format/date";
import { cardFacts, priceLabel, pricePerAreaLabel, propertyUrl, propertyWhatsAppMessage } from "@/lib/listing";
import { cn } from "@/lib/utils";
import type { PropertyCardDTO } from "@/services/property.service";
import { ShortlistButton } from "./shortlist-button";

export function PropertyCard({ property: p, priority = false, className }: { property: PropertyCardDTO; priority?: boolean; className?: string }) {
  const href = propertyUrl(p.slug);
  const perArea = pricePerAreaLabel(p);
  const facts = cardFacts(p);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border border-ink-100 bg-white shadow-card transition-shadow hover:shadow-card-hover",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-50">
        <SmartImage
          src={p.cover.url}
          alt={p.cover.alt}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant="dark">{TRANSACTION_TYPE_BADGE[p.transactionType]}</Badge>
          {p.status === "UNDER_OFFER" ? <Badge variant="warning">{LISTING_STATUS_LABELS.UNDER_OFFER}</Badge> : null}
          {p.isFeatured ? (
            <Badge variant="featured">
              <Star aria-hidden="true" />
              Featured
            </Badge>
          ) : null}
          {p.isDemo ? <DemoBadge /> : null}
        </div>
        <div className="absolute right-3 top-3 z-10">
          <ShortlistButton id={p.id} title={p.title} />
        </div>
        {p.imageCount > 1 ? (
          <Badge variant="dark" className="absolute bottom-3 right-3">
            <Camera aria-hidden="true" />
            {p.imageCount}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xl font-bold tracking-tight text-ink-950">{priceLabel(p)}</p>
          {perArea ? <p className="text-xs text-ink-500">{perArea}</p> : null}
        </div>
        <h3 className="mt-1 line-clamp-2 font-semibold leading-snug text-ink-900">
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {p.title}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {p.locality.name}, Jaipur{p.project ? ` · ${p.project.name}` : ""}
          </span>
        </p>
        {facts.length ? (
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm font-medium text-ink-700">
            {facts.map((f, i) => (
              <li key={f} className="flex items-center gap-3">
                {i > 0 ? <span className="size-1 rounded-full bg-ink-300" aria-hidden="true" /> : null}
                {f}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-2 border-t border-ink-100 pt-3">
            <p className="flex items-center gap-1.5 text-xs text-ink-500">
              {p.isVerified ? (
                <span className="inline-flex items-center gap-1 font-medium text-success-700">
                  <BadgeCheck className="size-3.5" aria-hidden="true" />
                  Verified
                </span>
              ) : null}
              {p.publishedAt ? <span>Listed {formatRelative(p.publishedAt)}</span> : null}
            </p>
            <div className="relative z-10 flex gap-1.5">
              <CallButton contact={p.contact} size="icon" variant="outline" context="property_card" propertyId={p.id} className="size-9" />
              <WhatsAppButton
                contact={p.contact}
                size="icon"
                message={propertyWhatsAppMessage(p)}
                context="property_card"
                propertyId={p.id}
                className="size-9"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PropertyGrid({ properties, className, priorityCount = 0 }: { properties: PropertyCardDTO[]; className?: string; priorityCount?: number }) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {properties.map((p, i) => (
        <PropertyCard key={p.id} property={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}
