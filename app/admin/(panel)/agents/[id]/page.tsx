import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ActionForm } from "@/components/admin/action-form";
import { PageHeader } from "@/components/admin/admin-ui";
import { ConfirmSubmit } from "@/components/admin/confirm-button";
import { AgentFields } from "@/components/admin/people-place-fields";
import { deleteAgentAction, saveAgentAction } from "@/lib/actions/admin/catalog";
import { requireAdmin } from "@/lib/auth/session";
import { getAgentForEdit } from "@/services/admin/catalog-admin.service";

export const metadata: Metadata = { title: "Edit agent" };

export default async function EditAgentPage({ params, searchParams }: PageProps<"/admin/agents/[id]">) {
  await requireAdmin("manageListings");
  const { id } = await params;
  const { created } = await searchParams;
  const agent = await getAgentForEdit(id);
  if (!agent) notFound();
  return (
    <>
      <PageHeader title={agent.name} back={{ href: "/admin/agents", label: "Agents" }} />
      {created ? <p className="mb-4 rounded-xl bg-success-50 px-4 py-3 text-sm text-success-700">Agent created.</p> : null}
      <div className="space-y-5">
        <ActionForm action={saveAgentAction.bind(null, agent.id)} submitLabel="Save changes">
          <AgentFields agent={agent} />
        </ActionForm>
        <section className="rounded-card border border-danger-600/20 bg-white p-5">
          <h2 className="font-semibold text-danger-700">Delete agent</h2>
          <p className="mt-1 text-sm text-ink-600">Their listings and leads fall back to the business contact. To keep history, mark the agent inactive instead.</p>
          <form action={deleteAgentAction.bind(null, agent.id)} className="mt-3">
            <ConfirmSubmit variant="danger" confirm={`Delete ${agent.name}?`}>
              <Trash2 aria-hidden="true" /> Delete agent
            </ConfirmSubmit>
          </form>
        </section>
      </div>
    </>
  );
}
