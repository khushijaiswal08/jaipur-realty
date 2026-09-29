import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Trash2 } from "lucide-react";
import { ActionForm } from "@/components/admin/action-form";
import { PageHeader } from "@/components/admin/admin-ui";
import { ProjectFields } from "@/components/admin/catalog-fields";
import { ConfirmSubmit } from "@/components/admin/confirm-button";
import { ImageManager } from "@/components/admin/image-manager";
import { buttonVariants } from "@/components/ui/button";
import {
  deleteProjectAction,
  deleteProjectImageAction,
  moveProjectImageAction,
  saveProjectAction,
  setProjectCoverAction,
  updateProjectImageAction,
} from "@/lib/actions/admin/catalog";
import { can } from "@/lib/auth/permissions";
import { requireAdmin } from "@/lib/auth/session";
import { getProjectForEdit } from "@/services/admin/catalog-admin.service";
import { getPropertyFormOptions } from "@/services/admin/property-admin.service";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params, searchParams }: PageProps<"/admin/projects/[id]">) {
  const admin = await requireAdmin("viewListings");
  const { id } = await params;
  const { created } = await searchParams;
  const [project, options] = await Promise.all([getProjectForEdit(id), getPropertyFormOptions()]);
  if (!project) notFound();
  const editable = can(admin.role, "manageListings");

  return (
    <>
      <PageHeader
        title={project.name}
        back={{ href: "/admin/projects", label: "Projects" }}
        description={`${project._count.properties} listings · ${project._count.leads} leads`}
        actions={
          project.status === "PUBLISHED" ? (
            <Link href={`/projects/${project.slug}`} target="_blank" className={buttonVariants({ variant: "outline" })}>
              <ExternalLink aria-hidden="true" /> View page
            </Link>
          ) : null
        }
      />
      {created ? <p className="mb-4 rounded-xl bg-success-50 px-4 py-3 text-sm text-success-700">Project saved. Add images below.</p> : null}
      {editable ? (
        <div className="space-y-5">
          <ImageManager
            target="project"
            targetId={project.id}
            images={project.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt, caption: i.caption, kind: i.kind, isCover: i.isCover, width: i.width, height: i.height }))}
            actions={{ update: updateProjectImageAction, setCover: setProjectCoverAction, move: moveProjectImageAction, remove: deleteProjectImageAction }}
          />
          <ActionForm action={saveProjectAction.bind(null, project.id)} submitLabel="Save changes">
            <ProjectFields project={project} options={options} />
          </ActionForm>
          <section className="rounded-card border border-danger-600/20 bg-white p-5">
            <h2 className="font-semibold text-danger-700">Delete project</h2>
            <p className="mt-1 text-sm text-ink-600">Listings inside the project are kept but unlinked. To hide it, set publishing to Draft or Archived.</p>
            <form action={deleteProjectAction.bind(null, project.id)} className="mt-3">
              <ConfirmSubmit variant="danger" confirm={`Delete ${project.name}? This cannot be undone.`}>
                <Trash2 aria-hidden="true" /> Delete permanently
              </ConfirmSubmit>
            </form>
          </section>
        </div>
      ) : (
        <p className="rounded-xl bg-ink-100 px-4 py-3 text-sm text-ink-700">You have read-only access to projects.</p>
      )}
    </>
  );
}
