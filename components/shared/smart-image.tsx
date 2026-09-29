import Image, { type ImageProps } from "next/image";

/**
 * next/image wrapper. SVG placeholders bypass the optimiser (SPEC §36: no global
 * dangerouslyAllowSVG); raster uploads get full optimisation.
 */
export function SmartImage({ src, alt, unoptimized, ...props }: ImageProps) {
  const isSvg = typeof src === "string" && src.toLowerCase().split("?")[0]!.endsWith(".svg");
  return <Image src={src} alt={alt} unoptimized={unoptimized ?? isSvg} {...props} />;
}
