import { formatPricePerUnit } from "@/lib/format/price";
import { OG_SIZE, ogImage } from "@/lib/og";
import { getLocalityBySlug } from "@/services/locality-detail.service";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Jaipur locality guide";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = await getLocalityBySlug(slug);
  if (!l) return ogImage({ title: "Jaipur localities" });
  return ogImage({
    eyebrow: `${l.zone ? `${l.zone} ` : ""}Jaipur · locality guide`,
    title: l.name,
    subtitle: `${l.stats.saleCount} for sale · ${l.stats.rentCount} for rent`,
    highlight: l.avgPricePerSqft ? `~${formatPricePerUnit(l.avgPricePerSqft)}` : undefined,
  });
}
