import "server-only";

import { unstable_cache } from "next/cache";
import type { AmenityCategory } from "@/generated/prisma/enums";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { db } from "@/lib/db";

export interface AmenityOptionDTO {
  id: string;
  name: string;
  slug: string;
  icon: string;
  category: AmenityCategory;
}

export const getAmenities = unstable_cache(
  async (): Promise<AmenityOptionDTO[]> =>
    db.amenity.findMany({
      select: { id: true, name: true, slug: true, icon: true, category: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    }),
  ["amenities"],
  { tags: [CACHE_TAGS.amenities], revalidate: 3600 },
);
