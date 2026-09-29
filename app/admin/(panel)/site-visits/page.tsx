import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/admin/action-form";
import { PageHeader, Pill } from "@/components/admin/admin-ui";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import type { SiteVisitStatus } from "@/generated/prisma/enums";
import { updateSiteVisitAction } from "@/lib/actions/admin/leads";
import { SITE_VISIT_STATUS_TONE } from "@/lib/admin-tones";
import { requireAdmin } from "@/lib/auth/session";
import { SITE_VISIT_STATUS_LABELS } from "@/lib/constants/enums";
import { formatDateTime, toIstDateString } from "@/lib/format/date";
import { formatPhone } from "@/lib/format/phone";
import { cn } from "@/lib/utils";
import { listSiteVisits } from "@/services/admin/lead-admin.service";

export const metadata: Metadata = { title: "Site visits" };

const istTime = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }).format(d);

export default async function SiteVisitsPage({ searchParams }: PageProps<"/admin/site-visits">) {
  await requireAdmin("manageLeads");
  const sp = await searchParams;
  const when = sp.when === "past" || sp.when === "all" ? sp.when : "upcoming";
  const statusRaw = typeof sp.status === "string" ? sp.status.toUpperCase() : undefined;
  const status = statusRaw && statusRaw in SITE_VISIT_STATUS_LABELS ? (statusRaw as SiteVisitStatus) : undefined;
  const visits = await listSiteVisits(when, status);

  return (
    <>
      <PageHeader title="Site visits" description="Confirm, reschedule and record the outcome of visits. Times are IST." />
      <nav aria-label="Filter visits" className="mb-4 flex flex-wrap gap-2">
        {(["upcoming", "past", "all"] as const).map((w) => (
          <Link
            key={w}
            href={`/admin/site-visits?when=${w}`}
            aria-current={when === w ? "page" : undefined}
            className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", when === w ? "bg-ink-900 text-white" : "bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50")}
          >
            {w[0]!.toUpperCase() + w.slice(1)}
          </Link>
        ))}
      </nav>

      {visits.length ? (
        <ul className="space-y-3">
          {visits.map((v) => (
            <li key={v.id} className="rounded-card border border-ink-100 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink-950">{formatDateTime(v.scheduledAt)}</p>
                  <p className="text-sm text-ink-600">
                    <Link href={`/admin/leads/${v.lead.id}`} className="font-medium hover:text-brand-700">
                      {v.lead.name}
                    </Link>{" "}
                    · {formatPhone(v.lead.phone)}
                  </p>
                  <p className="text-sm text-ink-500">
                    {v.property ? `${v.property.refCode} · ${v.property.title}` : (v.project?.name ?? "—")}
                    {v.agent ? ` · ${v.agent.name}` : ""}
                  </p>
                </div>
                <Pill tone={SITE_VISIT_STATUS_TONE[v.status]}>{SITE_VISIT_STATUS_LABELS[v.status]}</Pill>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-semibold text-brand-700">Update</summary>
                <ActionForm action={updateSiteVisitAction.bind(null, v.id)} submitLabel="Save" size="sm" className="mt-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Select name="status" defaultValue={v.status} aria-label="Status" className="h-10">
                      {Object.entries(SITE_VISIT_STATUS_LABELS).map(([k, l]) => (
                        <option key={k} value={k}>
                          {l}
                        </option>
                      ))}
                    </Select>
                    <Input type="date" name="date" defaultValue={toIstDateString(v.scheduledAt)} aria-label="Date" className="h-10" />
                    <Input type="time" name="time" step={900} defaultValue={istTime(v.scheduledAt)} aria-label="Time (IST)" className="h-10" />
                  </div>
                  <Textarea name="feedback" rows={2} defaultValue={v.feedback ?? ""} placeholder="Outcome / visitor feedback" aria-label="Feedback" />
                </ActionForm>
              </details>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-card border border-dashed border-ink-200 bg-white px-4 py-10 text-center text-sm text-ink-500">No {when === "all" ? "" : when} site visits.</p>
      )}
    </>
  );
}
