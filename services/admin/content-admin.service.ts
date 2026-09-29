import "server-only";

import { db } from "@/lib/db";
import { readingTimeMinutes, slugify } from "@/lib/utils";
import type { BlogPostInput, FaqInput, TestimonialInput } from "@/lib/validation/content-admin";

export class ContentRuleError extends Error {}

// ── Blog ──────────────────────────────────────────────────────────────────────

export async function listAdminPosts() {
  const rows = await db.blogPost.findMany({
    orderBy: [{ status: "asc" }, { publishedAt: "desc" }, { updatedAt: "desc" }],
    select: { id: true, title: true, slug: true, status: true, publishedAt: true, updatedAt: true, isDemo: true, category: { select: { name: true } } },
  });
  const now = new Date();
  return rows.map((r) => ({ ...r, isScheduled: r.status === "PUBLISHED" && r.publishedAt !== null && r.publishedAt > now }));
}

export async function getPostForEdit(id: string) {
  return db.blogPost.findUnique({ where: { id } });
}

export async function savePost(id: string | null, input: BlogPostInput, authorId: string): Promise<{ id: string; slug: string }> {
  const slug = input.slug ?? slugify(input.title);
  const clash = await db.blogPost.findFirst({ where: { slug, ...(id ? { id: { not: id } } : {}) }, select: { id: true } });
  if (clash) throw new ContentRuleError(`Another post already uses the slug “${slug}”.`);
  const { slug: _s, ...fields } = input;
  const data = {
    ...fields,
    slug,
    readingTimeMinutes: readingTimeMinutes(input.content),
    // Publishing without a date publishes now; a future date schedules the post.
    publishedAt: input.status === "PUBLISHED" ? (input.publishedAt ?? new Date()) : input.publishedAt,
  };
  if (!id) return db.blogPost.create({ data: { ...data, authorId }, select: { id: true, slug: true } });
  return db.blogPost.update({ where: { id }, data, select: { id: true, slug: true } });
}

export async function deletePost(id: string) {
  await db.blogPost.delete({ where: { id } });
}

export async function listCategories() {
  return db.blogCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], include: { _count: { select: { posts: true } } } });
}

export async function saveCategory(id: string | null, data: { name: string; description: string | null; sortOrder: number | null }) {
  const values = { ...data, sortOrder: data.sortOrder ?? 0 };
  const clash = await db.blogCategory.findFirst({ where: { name: data.name, ...(id ? { id: { not: id } } : {}) }, select: { id: true } });
  if (clash) throw new ContentRuleError("A category with that name already exists.");
  if (id) return db.blogCategory.update({ where: { id }, data: values });
  let slug = slugify(data.name);
  for (let i = 2; await db.blogCategory.findUnique({ where: { slug } }); i++) slug = `${slugify(data.name)}-${i}`;
  return db.blogCategory.create({ data: { ...values, slug } });
}

export async function deleteCategory(id: string) {
  await db.blogCategory.delete({ where: { id } });
}

// ── FAQs ──────────────────────────────────────────────────────────────────────

export async function listFaqs() {
  return db.faq.findMany({
    orderBy: [{ scope: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    include: { property: { select: { refCode: true } }, project: { select: { name: true } }, locality: { select: { name: true } } },
  });
}

export async function getFaq(id: string) {
  return db.faq.findUnique({ where: { id } });
}

export async function saveFaq(id: string | null, input: FaqInput) {
  if (id) return db.faq.update({ where: { id }, data: input, select: { id: true } });
  return db.faq.create({ data: input, select: { id: true } });
}

export async function deleteFaq(id: string) {
  await db.faq.delete({ where: { id } });
}

export async function faqTargets() {
  const [properties, projects, localities] = await Promise.all([
    db.property.findMany({ orderBy: { refCode: "asc" }, select: { id: true, refCode: true, title: true } }),
    db.project.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.locality.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return {
    properties: properties.map((p) => ({ value: p.id, label: `${p.refCode} — ${p.title}` })),
    projects: projects.map((p) => ({ value: p.id, label: p.name })),
    localities: localities.map((l) => ({ value: l.id, label: l.name })),
  };
}

// ── Testimonials ──────────────────────────────────────────────────────────────

export async function listTestimonials() {
  return db.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
}

export async function getTestimonial(id: string) {
  return db.testimonial.findUnique({ where: { id } });
}

export async function saveTestimonial(id: string | null, input: TestimonialInput) {
  const data = { ...input, sortOrder: input.sortOrder ?? 0 };
  // Editing a demo testimonial makes it real content.
  if (id) return db.testimonial.update({ where: { id }, data: { ...data, isDemo: false }, select: { id: true } });
  return db.testimonial.create({ data, select: { id: true } });
}

export async function deleteTestimonial(id: string) {
  await db.testimonial.delete({ where: { id } });
}
