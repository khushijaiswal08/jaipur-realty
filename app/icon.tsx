import { ImageResponse } from "next/og";
import { BrandMarkImage } from "@/lib/brand-mark";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon generated from the configured business name (no hardcoded branding). */
export default function Icon() {
  return new ImageResponse(<BrandMarkImage size={64} radius={14} />, { ...size });
}
