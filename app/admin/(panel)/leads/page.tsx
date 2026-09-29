import type { Metadata } from "next";
import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { EmptyRow, PageHeader, Pill, Table, td, th } from "@/components/admin/admin-ui";
import { buttonVariants } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form-controls";
import { Pagination } from "@/components/ui/pagination";
import type { LeadSource, LeadStatus } from "@/generated/prisma/enums";
import { LEAD_STATUS_TONE } from "@/lib/admin-tones";
import { can } from "@/lib/auth/permissions";
import { requireAdmin } from "@/lib/auth/session";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from "@/lib/constants/enums";
import { formatDateTime, formatRelative } from "@/lib/format/date";
import { formatPhone } from "@/lib/format/phone";
import { listLeads } from "@/services/admin/lead-admin.service";
import { getAgentOptions } from "@/services/agent.service";

export const metadata: Metadata = { title: "Leads" };

const one = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : undefined);

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const admin = await requireAdmin("manageLeads");
  const sp = await searchParams;
  const statusRaw = one(sp.status)?.toUpperCase();
  const sourceRaw = one(sp.source)?.toUpperCase();
  const status = statusRaw && statusRaw in LEAD_STATUS_LABELS ? (statusRaw as LeadStatus) : undefined;
  const source = sourceRaw && sourceRaw in LEAD_SOURCE_LABELS ? (sourceRaw as LeadSource) : undefined;
  const q = one(sp.q)?.slice(0, 80);
  const agent = one(sp.agent);
  const from = one(sp.from);
  const to = one(sp.to);
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const [{ rows, total, totalPages }, agents] = await Promise.all([
    listLeads({
      q,
      status,
      source,
      agentId: agent,
      from: from ? new Date(`${from}T00:00:00+05:30`) : undefined,
      to: to ? new Date(`${to}T23:59:59+05:30`) : undefined,
      page,
    }),
    getAgentOptions(),
  ]);

  const filters = Object.entries({ q, status: one(sp.status), source: one(sp.source), agent, from, to }).filter(([, v]) => v) as [string, string][];
  const qs = new URLSearchParams(filters).toString();

  return (
    <>
      <PageHeader
        title="Leads"
        description={`${total} ${total === 1 ? "lead" : "leads"}${status ? ` · ${LEAD_STATUS_LABELS[status]}` : ""}`}
        actions={
          <>
            {can(admin.role, "exportLeads") ? (
              <a href={`/api/admin/leads/export${qs ? `?${qs}` : ""}`} className={buttonVariants({ variant: "outline" })}>
                <Download aria-hidden="true" />
                Export CSV
              </a>
            ) : null}
            <Link href="/admin/leads/new" className={buttonVariants()}>
              <Plus aria-hidden="true" />
              Add lead
            </Link>
          </>
        }
      />
      {one(sp.deleted) ? <p className="mb-4 rounded-xl bg-success-50 px-4 py-3 text-sm text-success-700">Lead deleted.</p> : null}

      <form method="get" className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_10rem_11rem_10rem_9.5rem_9.5rem_auto]">
        <Input name="q" defaultValue={q} placeholder="Name, phone, email or JP ref" aria-label="Search" className="h-10" />
        <Select name="status" defaultValue={one(sp.status) ?? ""} aria-label="Status" className="h-10">
          <option value="">Any status</option>
          {Object.entries(LEAD_STATUS_LABELS).map(([k, l]) => (
            <option key={k} value={k.toLowerCase()}>
              {l}
            </option>
          ))}
        </Select>
        <Select name="source" defaultValue={one(sp.source) ?? ""} aria-label="Source" className="h-10">
          <option value="">Any source</option>
          {Object.entries(LEAD_SOURCE_LABELS).map(([k, l]) => (
            <option key={k} value={k.toLowerCase()}>
              {l}
            </option>
          ))}
        </Select>
        <Select name="agent" defaultValue={agent ?? ""} aria-label="Agent" className="h-10">
          <option value="">Any agent</option>
          <option value="none">Unassigned</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        <Input type="date" name="from" defaultValue={from} aria-label="From date" className="h-10" />
        <Input type="date" name="to" defaultValue={to} aria-label="To date" className="h-10" />
        <button type="submit" className={buttonVariants({ variant: "secondary", className: "h-10" })}>
          Filter
        </button>
      </form>

      <Table minWidth="62rem">
        <thead className="border-b border-ink-100 bg-ink-50/60">
          <tr>
            <th className={th}>Received</th>
            <th className={th}>Lead</th>
            <th className={th}>Source</th>
            <th className={th}>About</th>
            <th className={th}>Status</th>
            <th className={th}>Agent</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.length ? (
            rows.map((l) => (
              <tr key={l.id} className="hover:bg-ink-50/50">
                <td className={`${td} whitespace-nowrap text-ink-600`} title={formatDateTime(l.createdAt)}>
                  {formatRelative(l.createdAt)}
                </td>
                <td className={td}>
                  <Link href={`/admin/leads/${l.id}`} className="font-semibold text-ink-950 hover:text-brand-700">
                    {l.name}
                  </Link>
                  <span className="block text-xs text-ink-500">{formatPhone(l.phone)}</span>
                </td>
                <td className={td}>{LEAD_SOURCE_LABELS[l.source]}</td>
                <td className={`${td} max-w-64`}>
                  <span className="line-clamp-2">
                    {l.property ? `${l.property.refCode} · ${l.property.title}` : (l.project?.name ?? <span className="text-ink-400">—</span>)}
                  </span>
                </td>
                <td className={td}>
                  <Pill tone={LEAD_STATUS_TONE[l.status]}>{LEAD_STATUS_LABELS[l.status]}</Pill>
                </td>
                <td className={td}>{l.assignedAgent?.name ?? <span className="text-ink-400">Unassigned</span>}</td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={6}>No leads match these filters.</EmptyRow>
          )}
        </tbody>
      </Table>
      <Pagination className="mt-6" page={Math.min(page, totalPages)} totalPages={totalPages} hrefFor={(p) => `/admin/leads?${new URLSearchParams([...filters, ["page", String(p)]])}`} />
    </>
  );
}
