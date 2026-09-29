import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/action-form";
import { PageHeader } from "@/components/admin/admin-ui";
import { LocalityFields } from "@/components/admin/people-place-fields";
import { saveLocalityAction } from "@/lib/actions/admin/catalog";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "New locality" };

export default async function NewLocalityPage() {
  await requireAdmin("manageListings");
  return (
    <>
      <PageHeader title="New locality" back={{ href: "/admin/localities", label: "Localities" }} />
      <ActionForm action={saveLocalityAction.bind(null, "")} submitLabel="Create locality">
        <LocalityFields />
      </ActionForm>
    </>
  );
}
