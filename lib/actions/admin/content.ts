"use server";

import { redirect } from "next/navigation";
import { AuthError, assertAdmin } from "@/lib/auth/session";
import type { ActionState } from "@/lib/actions/types";
import { CACHE_TAGS, revalidatePublicSite } from "@/lib/server/revalidate";
import { blogCategorySchema, blogPostSchema, faqSchema, testimonialSchema } from "@/lib/validation/content-admin";
import { formValues } from "@/lib/validation/form-helpers";
import { fieldErrors } from "@/lib/validation/leads";
import {
  ContentRuleError,
  deleteCategory,
  deleteFaq,
  deletePost,
  deleteTestimonial,
  saveCategory,
  saveFaq,
  savePost,
  saveTestimonial,
} from "@/services/admin/content-admin.service";
import { logAudit } from "@/services/audit.service";

const fail = (e: unknown): ActionState => ({
  status: "error",
  message: e instanceof AuthError || e instanceof ContentRuleError ? e.message : "Something went wrong.",
  submissionId: Date.now(),
});
const invalid = (errors: Record<string, string>): ActionState => ({ status: "error", message: "Please fix:", fieldErrors: errors, submissionId: Date.now() });

export async function savePostAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  let saved;
  try {
    const admin = await assertAdmin("manageContent");
    const parsed = blogPostSchema.safeParse(formValues(formData));
    if (!parsed.success) return invalid(fieldErrors(parsed.error));
    saved = await savePost(id || null, parsed.data, admin.id);
    await logAudit(admin.id, id ? "blog.update" : "blog.create", "BlogPost", saved.id, { title: parsed.data.title, status: parsed.data.status });
    revalidatePublicSite(CACHE_TAGS.blog);
  } catch (e) {
    return fail(e);
  }
  if (!id) redirect(`/admin/blog/${saved.id}?created=1`);
  return { status: "success", message: "Saved.", submissionId: Date.now(), data: { slug: saved.slug } };
}

export async function deletePostAction(id: string): Promise<void> {
  const admin = await assertAdmin("manageContent");
  await deletePost(id);
  await logAudit(admin.id, "blog.delete", "BlogPost", id);
  revalidatePublicSite(CACHE_TAGS.blog);
  redirect("/admin/blog?deleted=1");
}

export async function saveCategoryAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await assertAdmin("manageContent");
    const parsed = blogCategorySchema.safeParse(formValues(formData));
    if (!parsed.success) return invalid(fieldErrors(parsed.error));
    const saved = await saveCategory(id || null, parsed.data);
    await logAudit(admin.id, id ? "blog_category.update" : "blog_category.create", "BlogCategory", saved.id, { name: parsed.data.name });
    revalidatePublicSite(CACHE_TAGS.blog);
    return { status: "success", message: "Saved.", submissionId: Date.now() };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteCategoryAction(id: string): Promise<void> {
  const admin = await assertAdmin("manageContent");
  await deleteCategory(id);
  await logAudit(admin.id, "blog_category.delete", "BlogCategory", id);
  revalidatePublicSite(CACHE_TAGS.blog);
  redirect("/admin/blog");
}

export async function saveFaqAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  let saved;
  try {
    const admin = await assertAdmin("manageContent");
    const parsed = faqSchema.safeParse(formValues(formData));
    if (!parsed.success) return invalid(fieldErrors(parsed.error));
    saved = await saveFaq(id || null, parsed.data);
    await logAudit(admin.id, id ? "faq.update" : "faq.create", "Faq", saved.id);
    revalidatePublicSite(CACHE_TAGS.content);
  } catch (e) {
    return fail(e);
  }
  if (!id) redirect(`/admin/faqs?created=1`);
  return { status: "success", message: "Saved.", submissionId: Date.now() };
}

export async function deleteFaqAction(id: string): Promise<void> {
  const admin = await assertAdmin("manageContent");
  await deleteFaq(id);
  await logAudit(admin.id, "faq.delete", "Faq", id);
  revalidatePublicSite(CACHE_TAGS.content);
  redirect("/admin/faqs?deleted=1");
}

export async function saveTestimonialAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  let saved;
  try {
    const admin = await assertAdmin("manageContent");
    const parsed = testimonialSchema.safeParse(formValues(formData));
    if (!parsed.success) return invalid(fieldErrors(parsed.error));
    saved = await saveTestimonial(id || null, parsed.data);
    await logAudit(admin.id, id ? "testimonial.update" : "testimonial.create", "Testimonial", saved.id);
    revalidatePublicSite(CACHE_TAGS.content);
  } catch (e) {
    return fail(e);
  }
  if (!id) redirect(`/admin/testimonials?created=1`);
  return { status: "success", message: "Saved.", submissionId: Date.now() };
}

export async function deleteTestimonialAction(id: string): Promise<void> {
  const admin = await assertAdmin("manageContent");
  await deleteTestimonial(id);
  await logAudit(admin.id, "testimonial.delete", "Testimonial", id);
  revalidatePublicSite(CACHE_TAGS.content);
  redirect("/admin/testimonials?deleted=1");
}
