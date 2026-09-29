import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ActionForm } from "@/components/admin/action-form";
import { PageHeader } from "@/components/admin/admin-ui";
import { ConfirmSubmit } from "@/components/admin/confirm-button";
import { FaqFields } from "@/components/admin/content-fields";
import { deleteFaqAction, saveFaqAction } from "@/lib/actions/admin/content";
import { requireAdmin } from "@/lib/auth/session";
import { faqTargets, getFaq } from "@/services/admin/content-admin.service";

export const metadata: Metadata = { title: "FAQ" };

/** /admin/faqs/new creates; /admin/faqs/{id} edits. */
export default async function FaqEditPage({ params }: PageProps<"/admin/faqs/[id]">) {
  await requireAdmin("manageContent");
  const { id } = await params;
  const isNew = id === "new";
  const [faq, targets] = await Promise.all([isNew ? null : getFaq(id), faqTargets()]);
  if (!isNew && !faq) notFound();
  return (
    <>
      <PageHeader title={isNew ? "New FAQ" : "Edit FAQ"} back={{ href: "/admin/faqs", label: "FAQs" }} />
      <div className="space-y-5">
        <ActionForm action={saveFaqAction.bind(null, isNew ? "" : id)} submitLabel={isNew ? "Create FAQ" : "Save changes"}>
          <FaqFields faq={faq} targets={targets} />
        </ActionForm>
        {!isNew ? (
          <form action={deleteFaqAction.bind(null, id)}>
            <ConfirmSubmit variant="danger" confirm="Delete this FAQ?">
              <Trash2 aria-hidden="true" /> Delete FAQ
            </ConfirmSubmit>
          </form>
        ) : null}
      </div>
    </>
  );
}
