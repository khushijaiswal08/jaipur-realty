import "server-only";

import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { PAGE_SIZE } from "@/lib/constants";
import { db } from "@/lib/db";
import { placeholderImage, type ImageDTO } from "@/lib/images";
import type { PostCardDTO } from "./content.service";

const publishedWhere = (): Prisma.BlogPostWhereInput => ({ status: "PUBLISHED", publishedAt: { lte: new Date() } });

const cardSelect = {
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
} satisfies Prisma.BlogPostSelect;

type CardRow = Prisma.BlogPostGetPayload<{ select: typeof cardSelect }>;

function cover(url: string | null, alt: string | null, title: string): ImageDTO {
  return url ? { url, alt: alt ?? title, width: 1200, height: 900 } : placeholderImage("blog", title);
}

function toCard(p: CardRow): PostCardDTO {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    cover: cover(p.coverImageUrl, p.coverImageAlt, p.title),
    publishedAt: p.publishedAt?.toISOString() ?? null,
    readingTimeMinutes: p.readingTimeMinutes,
    category: p.category,
    isDemo: p.isDemo,
  };
}

export async function listPosts(page: number, categorySlug?: string) {
  const where: Prisma.BlogPostWhereInput = { ...publishedWhere(), ...(categorySlug ? { category: { slug: categorySlug } } : {}) };
  const total = await db.blogPost.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE.blog));
  const current = Math.min(Math.max(1, page), totalPages);
  const rows = await db.blogPost.findMany({
    where,
    select: cardSelect,
    orderBy: { publishedAt: "desc" },
    skip: (current - 1) * PAGE_SIZE.blog,
    take: PAGE_SIZE.blog,
  });
  return { posts: rows.map(toCard), total, page: current, totalPages };
}

export const getBlogCategories = cache(async () =>
  db.blogCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, description: true, _count: { select: { posts: { where: { status: "PUBLISHED" } } } } },
  }),
);

export interface PostDetailDTO extends PostCardDTO {
  content: string;
  tags: string[];
  authorName: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
}

export const getPostBySlug = cache(async (slug: string): Promise<PostDetailDTO | null> => {
  const p = await db.blogPost.findFirst({
    where: { slug, ...publishedWhere() },
    select: { ...cardSelect, content: true, tags: true, seoTitle: true, seoDescription: true, updatedAt: true, author: { select: { name: true } } },
  });
  if (!p) return null;
  return {
    ...toCard(p),
    content: p.content,
    tags: p.tags,
    authorName: p.author?.name ?? null,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    updatedAt: p.updatedAt.toISOString(),
  };
});

/** Same category first, then shared tags, then most recent. */
export async function getRelatedPosts(post: PostDetailDTO, limit = 3): Promise<PostCardDTO[]> {
  const rows = await db.blogPost.findMany({
    where: {
      ...publishedWhere(),
      id: { not: post.id },
      OR: [...(post.category ? [{ category: { slug: post.category.slug } }] : []), ...(post.tags.length ? [{ tags: { hasSome: post.tags } }] : [])],
    },
    select: cardSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  if (rows.length >= limit) return rows.map(toCard);
  const more = await db.blogPost.findMany({
    where: { ...publishedWhere(), id: { notIn: [post.id, ...rows.map((r) => r.id)] } },
    select: cardSelect,
    orderBy: { publishedAt: "desc" },
    take: limit - rows.length,
  });
  return [...rows, ...more].map(toCard);
}

export async function getPostSlugs(): Promise<string[]> {
  const rows = await db.blogPost.findMany({ where: publishedWhere(), select: { slug: true } });
  return rows.map((r) => r.slug);
}
