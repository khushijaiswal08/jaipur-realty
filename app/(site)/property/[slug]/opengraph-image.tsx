import { TRANSACTION_TYPE_BADGE } from "@/lib/constants/enums";
import { priceLabel, primaryAreaLabel } from "@/lib/listing";
import { OG_SIZE, ogImage } from "@/lib/og";
import { getPropertyBySlug } from "@/services/property-detail.service";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Property details";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPropertyBySlug(slug);
  if (!p) return ogImage({ title: "Property in Jaipur" });
  return ogImage({
    eyebrow: `${TRANSACTION_TYPE_BADGE[p.transactionType]} · ${p.locality.name}, Jaipur`,
    title: p.title,
    subtitle: [primaryAreaLabel(p.primaryArea, true), `Ref ${p.refCode}`].filter(Boolean).join(" · "),
    highlight: priceLabel(p),
    demo: p.isDemo,
  });
}
