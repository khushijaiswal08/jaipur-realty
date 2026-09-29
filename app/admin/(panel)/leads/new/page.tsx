import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/action-form";
import { PageHeader, Panel } from "@/components/admin/admin-ui";
import { SelectField, TextAreaField, TextField } from "@/components/admin/form-fields";
import { createManualLeadAction } from "@/lib/actions/admin/leads";
import { requireAdmin } from "@/lib/auth/session";
import { LEAD_SOURCE_LABELS, MANUAL_LEAD_SOURCES } from "@/lib/constants/enums";
import { getPropertyPickerOptions } from "@/services/admin/property-admin.service";
import { getAgentOptions } from "@/services/agent.service";

export const metadata: Metadata = { title: "Add lead" };

/** Record enquiries that arrive by phone, WhatsApp, walk-in or referral (SPEC §28.1). */
export default async function NewLeadPage() {
  await requireAdmin("manageLeads");
  const [properties, agents] = await Promise.all([getPropertyPickerOptions(), getAgentOptions()]);
  return (
    <>
      <PageHeader title="Add lead" description="For enquiries received outside the website." back={{ href: "/admin/leads", label: "Leads" }} />
      <Panel className="max-w-3xl">
        <ActionForm action={createManualLeadAction} submitLabel="Save lead">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="name" label="Name" required />
            <TextField name="phone" label="Mobile" required inputMode="tel" placeholder="98290 12345" />
            <TextField name="email" label="Email" type="email" />
            <SelectField name="source" label="Source" required defaultValue="PHONE_CALL" options={MANUAL_LEAD_SOURCES.map((s) => ({ value: s, label: LEAD_SOURCE_LABELS[s] }))} />
            <SelectField name="propertyId" label="Property" options={properties} placeholder="None" />
            <SelectField name="assignedAgentId" label="Assign to" options={agents.map((a) => ({ value: a.id, label: a.name }))} placeholder="Unassigned" />
            <TextAreaField name="message" label="Notes" rows={4} className="sm:col-span-2" />
          </div>
        </ActionForm>
      </Panel>
    </>
  );
}
