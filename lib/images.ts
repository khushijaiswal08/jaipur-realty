import type { PropertyType } from "@/generated/prisma/enums";

export interface ImageDTO {
  url: string;
  alt: string;
  width: number;
  height: number;
}

const PLACEHOLDER_BY_TYPE: Record<PropertyType, string> = {
  APARTMENT: "apartment-exterior",
  BUILDER_FLOOR: "apartment-exterior",
  PENTHOUSE: "apartment-exterior",
  STUDIO: "apartment-exterior",
  INDEPENDENT_HOUSE: "house-exterior",
  VILLA: "villa-exterior",
  FARMHOUSE: "villa-exterior",
  RESIDENTIAL_PLOT: "plot-site",
  COMMERCIAL_PLOT: "plot-site",
  AGRICULTURAL_LAND: "plot-site",
  OFFICE_SPACE: "office-exterior",
  WAREHOUSE: "office-exterior",
  SHOP: "shop-front",
  SHOWROOM: "shop-front",
};

/** Fallback image when a listing has no photos (SPEC §36 cover rules). */
export function placeholderImage(type: PropertyType | "project" | "locality" | "blog" | "agent", subject: string): ImageDTO {
  const file =
    type === "project"
      ? "project-towers"
      : type === "locality"
        ? "locality-skyline"
        : type === "blog"
          ? "blog-cover"
          : type === "agent"
            ? "agent-avatar"
            : PLACEHOLDER_BY_TYPE[type];
  const square = type === "agent";
  return {
    url: `/placeholders/${file}.svg`,
    alt: `${subject} (placeholder image)`,
    width: square ? 600 : 1200,
    height: square ? 600 : 900,
  };
}
