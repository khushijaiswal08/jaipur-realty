import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { ActionForm } from "@/components/admin/action-form";
import { PageHeader } from "@/components/admin/admin-ui";
import { LocalityFields } from "@/components/admin/people-place-fields";
import { buttonVariants } from "@/components/ui/button";
import { deleteLocalityAction, saveLocalityAction } from "@/lib/actions/admin/catalog";
import { can } from "@/lib/auth/permissions";
import { requireAdmin } from "@/lib/auth/session";
import { getLocalityForEdit } from "@/services/admin/catalog-admin.service";

export const metadata: Metadata = { title: "Edit locality" };

export default async function EditLocalityPage({ params, searchParams }: PageProps<"/admin/localities/[id]">) {
  const admin = await requireAdmin("viewListings");
  const { id } = await params;
  const { created } = await searchParams;
  const locality = await getLocalityForEdit(id);
  if (!locality) notFound();
  const editable = can(admin.role, "manageListings");
  return (
    <>
      <PageHeader
        title={locality.name}
        back={{ href: "/admin/localities", label: "Localities" }}
        description={`${locality._count.properties} listings · ${locality._count.projects} projects`}
        actions={
          <Link href={`/localities/${locality.slug}`} target="_blank" className={buttonVariants({ variant: "outline" })}>
            <ExternalLink aria-hidden="true" /> View guide
          </Link>
        }
      />
      {created ? <p className="mb-4 rounded-xl bg-success-50 px-4 py-3 text-sm text-success-700">Locality created.</p> : null}
      {editable ? (
        <div className="space-y-5">
          <ActionForm action={saveLocalityAction.bind(null, locality.id)} submitLabel="Save changes">
            <LocalityFields locality={locality} />
          </ActionForm>
          <section className="rounded-card border border-danger-600/20 bg-white p-5">
            <h2 className="mb-2 font-semibold text-danger-700">Delete locality</h2>
            <ActionForm action={deleteLocalityAction.bind(null, locality.id)} submitLabel="Delete locality" variant="danger">
              <p className="text-sm text-ink-600">Only possible when no properties or projects use it.</p>
            </ActionForm>
          </section>
        </div>
      ) : (
        <p className="rounded-xl bg-ink-100 px-4 py-3 text-sm text-ink-700">You have read-only access.</p>
      )}
    </>
  );
}
