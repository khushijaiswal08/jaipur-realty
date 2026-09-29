import "server-only";

import { db } from "@/lib/db";
import { placeholderImage, type ImageDTO } from "@/lib/images";

export interface TestimonialDTO {
  id: string;
  name: string;
  location: string | null;
  context: string | null;
  quote: string;
  rating: number | null;
  isDemo: boolean;
}

export async function getTestimonials(limit = 6): Promise<TestimonialDTO[]> {
  return db.testimonial.findMany({
    where: { isPublished: true },
    select: { id: true, name: true, location: true, context: true, quote: true, rating: true, isDemo: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export interface PostCardDTO {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: ImageDTO;
  publishedAt: string | null;
  readingTimeMinutes: number | null;
  category: { name: string; slug: string } | null;
  isDemo: boolean;
}

export async function getLatestPosts(limit = 3): Promise<PostCardDTO[]> {
  const rows = await db.blogPost.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      coverImageAlt: true,
      publishedAt: true,
      readingTimeMinutes: true,
      isDemo: true,
      category: { select: { name: true, slug: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    cover: p.coverImageUrl
      ? { url: p.coverImageUrl, alt: p.coverImageAlt ?? p.title, width: 1200, height: 900 }
      : placeholderImage("blog", p.title),
    publishedAt: p.publishedAt?.toISOString() ?? null,
    readingTimeMinutes: p.readingTimeMinutes,
    category: p.category,
    isDemo: p.isDemo,
  }));
}
