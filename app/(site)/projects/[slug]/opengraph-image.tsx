import { CONSTRUCTION_STATUS_LABELS } from "@/lib/constants/enums";
import { formatPriceRange } from "@/lib/format/price";
import { OG_SIZE, ogImage } from "@/lib/og";
import { getProjectBySlug } from "@/services/project-detail.service";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Project details";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) return ogImage({ title: "Projects in Jaipur" });
  return ogImage({
    eyebrow: `${CONSTRUCTION_STATUS_LABELS[p.constructionStatus]} · ${p.locality.name}, Jaipur`,
    title: p.name,
    subtitle: `${p.unitSummary} · by ${p.developerName}`,
    highlight: p.priceOnRequest ? "Price on Request" : formatPriceRange(p.priceMin, p.priceMax),
    demo: p.isDemo,
  });
}
