import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/action-form";
import { PageHeader } from "@/components/admin/admin-ui";
import { ProjectFields } from "@/components/admin/catalog-fields";
import { saveProjectAction } from "@/lib/actions/admin/catalog";
import { requireAdmin } from "@/lib/auth/session";
import { getPropertyFormOptions } from "@/services/admin/property-admin.service";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  await requireAdmin("manageListings");
  const options = await getPropertyFormOptions();
  return (
    <>
      <PageHeader title="New project" description="Save first, then add images." back={{ href: "/admin/projects", label: "Projects" }} />
      <ActionForm action={saveProjectAction.bind(null, "")} submitLabel="Create project">
        <ProjectFields options={options} />
      </ActionForm>
    </>
  );
}
