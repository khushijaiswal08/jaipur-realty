import { siteConfig } from "@/lib/config";
import { HERO_COPY } from "@/lib/constants/marketing";
import { OG_SIZE, ogImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = `${siteConfig.name} — property for sale and rent in Jaipur`;

export default function Image() {
  return ogImage({ eyebrow: "Jaipur real estate", title: HERO_COPY.title, subtitle: siteConfig.tagline ?? "Homes, plots & commercial spaces across Jaipur" });
}
