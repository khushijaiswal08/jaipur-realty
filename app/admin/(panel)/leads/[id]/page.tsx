import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Mail, Phone, Trash2 } from "lucide-react";
import { ActionForm } from "@/components/admin/action-form";
import { PageHeader, Panel, Pill } from "@/components/admin/admin-ui";
import { ConfirmSubmit } from "@/components/admin/confirm-button";
import { WhatsAppIcon } from "@/components/shared/icons";
import { buttonVariants } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form-controls";
import { addLeadActivityAction, deleteLeadAction, updateLeadAction } from "@/lib/actions/admin/leads";
import { LEAD_STATUS_TONE, SITE_VISIT_STATUS_TONE } from "@/lib/admin-tones";
import { can } from "@/lib/auth/permissions";
import { requireAdmin } from "@/lib/auth/session";
import { siteConfig } from "@/lib/config";
import { LEAD_ACTIVITY_TYPE_LABELS, LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, SITE_VISIT_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/constants/enums";
import { formatDateTime, toIstDateString } from "@/lib/format/date";
import { formatPhone, telHref } from "@/lib/format/phone";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getLead } from "@/services/admin/lead-admin.service";
import { getAgentOptions } from "@/services/agent.service";

export const metadata: Metadata = { title: "Lead" };

const ACTIVITY_CHOICES = ["NOTE", "CALL", "WHATSAPP", "EMAIL", "MEETING"] as const;

export default async function LeadDetailPage({ params }: PageProps<"/admin/leads/[id]">) {
  const admin = await requireAdmin("manageLeads");
  const { id } = await params;
  const [lead, agents] = await Promise.all([getLead(id), getAgentOptions()]);
  if (!lead) notFound();

  const about = lead.property ? `${lead.property.title} (${lead.property.refCode})` : lead.project?.name;
  const firstName = lead.name.split(" ")[0];
  const waMessage = `Hi ${firstName}, this is ${siteConfig.name}${about ? ` regarding your enquiry about ${about}` : ""}.`;
  const wa = buildWhatsAppUrl(lead.phone, waMessage);
  const attribution = [
    ["UTM source", lead.utmSource],
    ["UTM medium", lead.utmMedium],
    ["UTM campaign", lead.utmCampaign],
    ["UTM term", lead.utmTerm],
    ["UTM content", lead.utmContent],
    ["Referrer", lead.referrer],
    ["Page", lead.pageUrl],
  ].filter((r): r is [string, string] => Boolean(r[1]));

  return (
    <>
      <PageHeader
        title={lead.name}
        back={{ href: "/admin/leads", label: "Leads" }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Pill tone={LEAD_STATUS_TONE[lead.status]}>{LEAD_STATUS_LABELS[lead.status]}</Pill>
            <span>
              {LEAD_SOURCE_LABELS[lead.source]} · received {formatDateTime(lead.createdAt)}
            </span>
          </span>
        }
        actions={
          <>
            <a href={telHref(lead.phone) ?? "#"} className={buttonVariants({ variant: "outline" })}>
              <Phone aria-hidden="true" />
              {formatPhone(lead.phone)}
            </a>
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "whatsapp" })}>
                <WhatsAppIcon />
                WhatsApp
              </a>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <Panel title="Enquiry">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-500">Phone</dt>
                <dd className="font-medium text-ink-950">{formatPhone(lead.phone)}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Email</dt>
                <dd className="font-medium text-ink-950">
                  {lead.email ? (
                    <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 hover:text-brand-700">
                      <Mail className="size-3.5" aria-hidden="true" /> {lead.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">About</dt>
                <dd className="font-medium text-ink-950">
                  {lead.property ? (
                    <span className="flex flex-wrap gap-2">
                      <Link href={`/admin/properties/${lead.property.id}`} className="hover:text-brand-700">
                        {about}
                      </Link>
                      <Link href={`/property/${lead.property.slug}`} target="_blank" className="text-ink-400 hover:text-brand-700" aria-label="Open public page">
                        <ExternalLink className="size-4" />
                      </Link>
                    </span>
                  ) : lead.project ? (
                    <Link href={`/projects/${lead.project.slug}`} target="_blank" className="hover:text-brand-700">
                      {lead.project.name}
                    </Link>
                  ) : (
                    (lead.locality?.name ?? "General enquiry")
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">Looking to</dt>
                <dd className="font-medium text-ink-950">{lead.transactionType ? TRANSACTION_TYPE_LABELS[lead.transactionType] : "—"}</dd>
              </div>
              {lead.preferredDate ? (
                <div>
                  <dt className="text-ink-500">Preferred date</dt>
                  <dd className="font-medium text-ink-950">{formatDateTime(lead.preferredDate)}</dd>
                </div>
              ) : null}
              {lead.message ? (
                <div className="sm:col-span-2">
                  <dt className="text-ink-500">Message</dt>
                  <dd className="whitespace-pre-line text-ink-800">{lead.message}</dd>
                </div>
              ) : null}
            </dl>
          </Panel>

          {lead.siteVisits.length ? (
            <Panel title="Site visits" action={<Link href="/admin/site-visits" className="text-sm font-semibold text-brand-700">Manage</Link>}>
              <ul className="divide-y divide-ink-100 text-sm">
                {lead.siteVisits.map((v) => (
                  <li key={v.id} className="flex items-center justify-between py-2">
                    <span className="font-medium text-ink-900">{formatDateTime(v.scheduledAt)}</span>
                    <Pill tone={SITE_VISIT_STATUS_TONE[v.status]}>{SITE_VISIT_STATUS_LABELS[v.status]}</Pill>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          <Panel title="Timeline">
            <ActionForm action={addLeadActivityAction.bind(null, lead.id)} submitLabel="Add to timeline" size="sm" resetOnSuccess className="mb-5">
              <div className="grid gap-2 sm:grid-cols-[10rem_1fr]">
                <div>
                  <Label htmlFor="act-type" className="sr-only">
                    Activity type
                  </Label>
                  <Select id="act-type" name="type" defaultValue="NOTE" className="h-10">
                    {ACTIVITY_CHOICES.map((t) => (
                      <option key={t} value={t}>
                        {LEAD_ACTIVITY_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="act-body" className="sr-only">
                    Note
                  </Label>
                  <Textarea id="act-body" name="body" rows={2} placeholder="e.g. Called — interested, wants a Sunday visit" className="min-h-0" />
                </div>
              </div>
            </ActionForm>
            {lead.activities.length ? (
              <ol className="relative space-y-4 border-l border-ink-100 pl-5">
                {lead.activities.map((a) => (
                  <li key={a.id}>
                    <span className="absolute -left-1.5 mt-1.5 size-3 rounded-full border-2 border-white bg-brand-600" aria-hidden="true" />
                    <p className="text-xs text-ink-500">
                      {LEAD_ACTIVITY_TYPE_LABELS[a.type]} · {formatDateTime(a.createdAt)}
                      {a.createdBy ? ` · ${a.createdBy.name}` : " · system"}
                    </p>
                    {a.body ? <p className="mt-0.5 whitespace-pre-line text-sm text-ink-800">{a.body}</p> : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-ink-500">No activity yet.</p>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Manage">
            <ActionForm action={updateLeadAction.bind(null, lead.id)} submitLabel="Update lead">
              <div>
                <Label htmlFor="lead-status">Status</Label>
                <Select id="lead-status" name="status" defaultValue={lead.status} className="h-10">
                  {Object.entries(LEAD_STATUS_LABELS).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="lead-agent">Assigned agent</Label>
                <Select id="lead-agent" name="assignedAgentId" defaultValue={lead.assignedAgentId ?? ""} className="h-10">
                  <option value="">Unassigned</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="lead-follow">Follow up on</Label>
                <Input id="lead-follow" type="date" name="followUpAt" defaultValue={lead.followUpAt ? toIstDateString(lead.followUpAt) : ""} className="h-10" />
              </div>
            </ActionForm>
          </Panel>

          {attribution.length ? (
            <Panel title="Attribution">
              <dl className="space-y-2 text-sm">
                {attribution.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-ink-500">{k}</dt>
                    <dd className="break-all text-ink-800">{v}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          ) : null}

          {can(admin.role, "manageAdmins") ? (
            <Panel title="Danger zone">
              <p className="mb-3 text-sm text-ink-600">Deleting removes the lead, its timeline and visits (e.g. on a data-deletion request).</p>
              <form action={deleteLeadAction.bind(null, lead.id)}>
                <ConfirmSubmit variant="danger" confirm={`Delete the lead from ${lead.name}? This cannot be undone.`}>
                  <Trash2 aria-hidden="true" />
                  Delete lead
                </ConfirmSubmit>
              </form>
            </Panel>
          ) : null}
        </div>
      </div>
    </>
  );
}
