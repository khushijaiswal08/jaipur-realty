import { z } from "zod";
import { FaqScope, PublishStatus } from "@/generated/prisma/enums";
import { checkbox, optionalDate, optionalId, optionalInt, optionalString, requiredString } from "./form-helpers";

const assetUrl = z
  .string()
  .trim()
  .optional()
  .transform((v, ctx) => {
    if (!v) return null;
    if (/^\/(media|placeholders|brand)\/[\w\-/.]+$/.test(v) || /^https:\/\/\S+$/.test(v)) return v;
    ctx.addIssue({ code: "custom", message: "Upload an image or enter an https:// URL" });
    return z.NEVER;
  });

export const blogPostSchema = z
  .object({
    title: requiredString(5, 150, "Title"),
    slug: z
      .string()
      .trim()
      .optional()
      .transform((v, ctx) => {
        if (!v) return null;
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) || v.length > 100) {
          ctx.addIssue({ code: "custom", message: "Slug: lowercase letters, numbers and hyphens only" });
          return z.NEVER;
        }
        return v;
      }),
    excerpt: requiredString(20, 300, "Excerpt"),
    content: requiredString(50, 50_000, "Content"),
    coverImageUrl: assetUrl,
    coverImageAlt: optionalString(200),
    categoryId: optionalId,
    tags: z
      .string()
      .optional()
      .transform((v) =>
        [...new Set((v ?? "").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 10).map((t) => t.slice(0, 40)),
      ),
    status: z.enum(PublishStatus),
    publishedAt: optionalDate,
    seoTitle: optionalString(70),
    seoDescription: optionalString(170),
  })
  .superRefine((v, ctx) => {
    if (v.coverImageUrl && !v.coverImageAlt) ctx.addIssue({ code: "custom", path: ["coverImageAlt"], message: "Add alt text for the cover image" });
  });

export type BlogPostInput = z.infer<typeof blogPostSchema>;

export const blogCategorySchema = z.object({
  name: requiredString(2, 60, "Name"),
  description: optionalString(300),
  sortOrder: optionalInt(0, 10_000),
});

export const faqSchema = z
  .object({
    question: requiredString(5, 200, "Question"),
    answer: requiredString(5, 4000, "Answer"),
    scope: z.enum(FaqScope),
    propertyId: optionalId,
    projectId: optionalId,
    localityId: optionalId,
    sortOrder: optionalInt(0, 10_000),
    isPublished: checkbox,
  })
  .superRefine((v, ctx) => {
    if (v.scope === "PROPERTY" && !v.propertyId) ctx.addIssue({ code: "custom", path: ["propertyId"], message: "Choose the property" });
    if (v.scope === "PROJECT" && !v.projectId) ctx.addIssue({ code: "custom", path: ["projectId"], message: "Choose the project" });
    if (v.scope === "LOCALITY" && !v.localityId) ctx.addIssue({ code: "custom", path: ["localityId"], message: "Choose the locality" });
  })
  .transform((v) => ({
    ...v,
    // Only keep the link that matches the scope.
    propertyId: v.scope === "PROPERTY" ? v.propertyId : null,
    projectId: v.scope === "PROJECT" ? v.projectId : null,
    localityId: v.scope === "LOCALITY" ? v.localityId : null,
    sortOrder: v.sortOrder ?? 0,
  }));

export type FaqInput = z.infer<typeof faqSchema>;

export const testimonialSchema = z.object({
  name: requiredString(2, 80, "Name"),
  location: optionalString(80),
  context: optionalString(120),
  quote: requiredString(10, 1000, "Quote"),
  rating: optionalInt(1, 5),
  photoUrl: assetUrl,
  isPublished: checkbox,
  sortOrder: optionalInt(0, 10_000),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
