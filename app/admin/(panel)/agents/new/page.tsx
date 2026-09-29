import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/action-form";
import { PageHeader } from "@/components/admin/admin-ui";
import { AgentFields } from "@/components/admin/people-place-fields";
import { saveAgentAction } from "@/lib/actions/admin/catalog";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "New agent" };

export default async function NewAgentPage() {
  await requireAdmin("manageListings");
  return (
    <>
      <PageHeader title="New agent" back={{ href: "/admin/agents", label: "Agents" }} />
      <ActionForm action={saveAgentAction.bind(null, "")} submitLabel="Create agent">
        <AgentFields />
      </ActionForm>
    </>
  );
}
