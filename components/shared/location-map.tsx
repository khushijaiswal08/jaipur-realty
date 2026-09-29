import { MapPin } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

interface LocationMapProps {
  lat: number;
  lng: number;
  /** False = approximate (locality centroid): no pin, a highlighted area instead (SPEC §15). */
  exact: boolean;
  title: string;
  className?: string;
}

/**
 * Lazy iframe map — zero JavaScript. OpenStreetMap by default; Google Maps Embed API when
 * NEXT_PUBLIC_MAP_PROVIDER=google and a key are configured (SPEC §15, §34).
 */
export function LocationMap({ lat, lng, exact, title, className }: LocationMapProps) {
  const d = exact ? 0.006 : 0.012;
  const c = (n: number) => n.toFixed(5);
  const bbox = [c(lng - d), c(lat - d), c(lng + d), c(lat + d)].join(",");
  const src =
    siteConfig.maps.provider === "google" && siteConfig.maps.googleApiKey
      ? exact
        ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(siteConfig.maps.googleApiKey)}&q=${lat},${lng}&zoom=15`
        : `https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(siteConfig.maps.googleApiKey)}&center=${lat},${lng}&zoom=14`
      : `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${exact ? `&marker=${c(lat)},${c(lng)}` : ""}`;

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-ink-100 bg-ink-50", className)}>
      <iframe src={src} title={title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="aspect-[16/10] w-full sm:aspect-[16/7]" />
      {!exact ? (
        <>
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-600/70 bg-brand-600/15"
            aria-hidden="true"
          />
          <p className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs text-ink-700 shadow-sm sm:right-auto">
            <MapPin className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
            Approximate location — the exact address is shared when you book a visit.
          </p>
        </>
      ) : null}
    </div>
  );
}
