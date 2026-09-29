import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ActionForm } from "@/components/admin/action-form";
import { PageHeader } from "@/components/admin/admin-ui";
import { ConfirmSubmit } from "@/components/admin/confirm-button";
import { TestimonialFields } from "@/components/admin/content-fields";
import { deleteTestimonialAction, saveTestimonialAction } from "@/lib/actions/admin/content";
import { requireAdmin } from "@/lib/auth/session";
import { getTestimonial } from "@/services/admin/content-admin.service";

export const metadata: Metadata = { title: "Testimonial" };

/** /admin/testimonials/new creates; /admin/testimonials/{id} edits. */
export default async function TestimonialEditPage({ params }: PageProps<"/admin/testimonials/[id]">) {
  await requireAdmin("manageContent");
  const { id } = await params;
  const isNew = id === "new";
  const testimonial = isNew ? null : await getTestimonial(id);
  if (!isNew && !testimonial) notFound();
  return (
    <>
      <PageHeader title={isNew ? "New testimonial" : testimonial!.name} back={{ href: "/admin/testimonials", label: "Testimonials" }} />
      <div className="space-y-5">
        <ActionForm action={saveTestimonialAction.bind(null, isNew ? "" : id)} submitLabel={isNew ? "Create testimonial" : "Save changes"}>
          <TestimonialFields testimonial={testimonial} />
        </ActionForm>
        {!isNew ? (
          <form action={deleteTestimonialAction.bind(null, id)}>
            <ConfirmSubmit variant="danger" confirm="Delete this testimonial?">
              <Trash2 aria-hidden="true" /> Delete testimonial
            </ConfirmSubmit>
          </form>
        ) : null}
      </div>
    </>
  );
}
