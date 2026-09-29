import type { BlogPost, Faq, Testimonial } from "@/generated/prisma/client";
import { FAQ_SCOPE_LABELS, PUBLISH_STATUS_LABELS, toOptions } from "@/lib/constants/enums";
import { toIstDateString } from "@/lib/format/date";
import { AssetField } from "./asset-field";
import { CheckboxField, FormSection, SelectField, TextAreaField, TextField } from "./form-fields";
import { MarkdownEditor } from "./markdown-editor";

export function BlogPostFields({ post: p, categories }: { post?: BlogPost | null; categories: Array<{ id: string; name: string }> }) {
  return (
    <div className="space-y-5">
      <FormSection title="Article">
        <TextField name="title" label="Title" required defaultValue={p?.title} className="sm:col-span-2" />
        <TextField name="slug" label="URL slug" defaultValue={p?.slug} hint="Leave blank to generate from the title" />
        <TextAreaField name="excerpt" label="Excerpt" required rows={2} defaultValue={p?.excerpt} className="sm:col-span-2 lg:col-span-3" hint="20–300 characters. Shown on cards and in search results." />
        <MarkdownEditor name="content" label="Content" defaultValue={p?.content} />
      </FormSection>
      <FormSection title="Publishing">
        <SelectField name="status" label="Status" defaultValue={p?.status ?? "DRAFT"} options={toOptions(PUBLISH_STATUS_LABELS)} />
        <TextField name="publishedAt" label="Publish date" type="date" defaultValue={p?.publishedAt ? toIstDateString(p.publishedAt) : ""} hint="Blank = now when published. Future date = scheduled." />
        <SelectField name="categoryId" label="Category" defaultValue={p?.categoryId} options={categories.map((c) => ({ value: c.id, label: c.name }))} placeholder="None" />
        <TextField name="tags" label="Tags (comma-separated)" defaultValue={p?.tags.join(", ")} className="sm:col-span-2" />
      </FormSection>
      <FormSection title="Cover & SEO">
        <AssetField name="coverImageUrl" label="Cover image" defaultValue={p?.coverImageUrl} />
        <TextField name="coverImageAlt" label="Cover image alt text" defaultValue={p?.coverImageAlt} className="sm:col-span-2" />
        <TextField name="seoTitle" label="SEO title" defaultValue={p?.seoTitle} hint="Max 70 characters" />
        <TextAreaField name="seoDescription" label="SEO description" rows={2} defaultValue={p?.seoDescription} className="sm:col-span-2" />
      </FormSection>
    </div>
  );
}

export function FaqFields({
  faq: f,
  targets,
}: {
  faq?: Faq | null;
  targets: { properties: Array<{ value: string; label: string }>; projects: Array<{ value: string; label: string }>; localities: Array<{ value: string; label: string }> };
}) {
  return (
    <FormSection title="FAQ" description="Scope “Specific property/project/locality” shows the FAQ on that page only; other scopes appear on /faq.">
      <TextField name="question" label="Question" required defaultValue={f?.question} className="sm:col-span-2 lg:col-span-3" />
      <MarkdownEditor name="answer" label="Answer" defaultValue={f?.answer} rows={6} />
      <SelectField name="scope" label="Scope" defaultValue={f?.scope ?? "GENERAL"} options={toOptions(FAQ_SCOPE_LABELS)} />
      <SelectField name="propertyId" label="Property (for property scope)" defaultValue={f?.propertyId} options={targets.properties} placeholder="—" />
      <SelectField name="projectId" label="Project (for project scope)" defaultValue={f?.projectId} options={targets.projects} placeholder="—" />
      <SelectField name="localityId" label="Locality (for locality scope)" defaultValue={f?.localityId} options={targets.localities} placeholder="—" />
      <TextField name="sortOrder" label="Sort order" defaultValue={f ? String(f.sortOrder) : ""} inputMode="numeric" />
      <CheckboxField name="isPublished" label="Published" defaultChecked={f?.isPublished ?? true} />
    </FormSection>
  );
}

export function TestimonialFields({ testimonial: t }: { testimonial?: Testimonial | null }) {
  return (
    <FormSection title="Testimonial" description="Only publish genuine feedback you have permission to share (SPEC §22).">
      <TextField name="name" label="Client name" required defaultValue={t?.name} hint="e.g. Neha K." />
      <TextField name="location" label="Location" defaultValue={t?.location} />
      <TextField name="context" label="Context" defaultValue={t?.context} placeholder="Bought a 3 BHK apartment" />
      <TextAreaField name="quote" label="Quote" required rows={4} defaultValue={t?.quote} className="sm:col-span-2 lg:col-span-3" />
      <SelectField name="rating" label="Rating" defaultValue={t?.rating ? String(t.rating) : ""} options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} ★` }))} placeholder="None" />
      <TextField name="sortOrder" label="Sort order" defaultValue={t ? String(t.sortOrder) : ""} inputMode="numeric" />
      <CheckboxField name="isPublished" label="Published" defaultChecked={t?.isPublished ?? true} />
      <AssetField name="photoUrl" label="Photo (optional)" defaultValue={t?.photoUrl} />
    </FormSection>
  );
}
