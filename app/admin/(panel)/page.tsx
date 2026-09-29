import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/admin/action-form";
import { Panel, PageHeader, Pill, StatCard } from "@/components/admin/admin-ui";
import { Input, Label } from "@/components/ui/form-controls";
import { purgeDemoAction } from "@/lib/actions/admin/users";
import { demoCounts } from "@/services/admin/admin-users.service";
import { LEAD_STATUS_TONE, SITE_VISIT_STATUS_TONE } from "@/lib/admin-tones";
import { can } from "@/lib/auth/permissions";
import { requireAdmin } from "@/lib/auth/session";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, SITE_VISIT_STATUS_LABELS } from "@/lib/constants/enums";
import { formatDateTime, formatRelative } from "@/lib/format/date";
import { formatPhone } from "@/lib/format/phone";
import { getDashboardStats } from "@/services/admin-dashboard.service";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboard({ searchParams }: PageProps<"/admin">) {
  const admin = await requireAdmin();
  const { denied } = await searchParams;
  const leadsAccess = can(admin.role, "manageLeads");
  const [s, demo] = await Promise.all([getDashboardStats(), can(admin.role, "purgeDemo") ? demoCounts() : Promise.resolve(null)]);
  const maxSource = Math.max(1, ...s.leadsBySource.map((x) => x.count));

  return (
    <>
      <PageHeader title={`Welcome, ${admin.name.split(" ")[0]}`} description="Here's what's happening across your listings and leads." />
      {denied ? (
        <p role="alert" className="mb-6 rounded-xl bg-warning-50 px-4 py-3 text-sm text-warning-600">
          You don&apos;t have access to that section. Ask a super admin if you need it.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Leads today" value={s.leadsToday} tone="brand" href={leadsAccess ? "/admin/leads" : undefined} />
        <StatCard label="Leads (7 days)" value={s.leads7d} href={leadsAccess ? "/admin/leads" : undefined} />
        <StatCard label="New, not yet contacted" value={s.newLeads} tone={s.newLeads ? "warning" : "default"} href={leadsAccess ? "/admin/leads?status=new" : undefined} />
        <StatCard label="Owner listings to review" value={s.pendingOwnerListings} href={leadsAccess ? "/admin/owner-listings" : undefined} />
        <StatCard label="Active for sale" value={s.activeListings.sale} href="/admin/properties?tx=sale" />
        <StatCard label="Active for rent" value={s.activeListings.rent} href="/admin/properties?tx=rent" />
        <StatCard label="Draft listings" value={s.draftListings} href="/admin/properties?status=draft" />
        <StatCard label="Upcoming site visits" value={s.upcomingVisits.length} hint="Next 7 days" href={leadsAccess ? "/admin/site-visits" : undefined} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {leadsAccess ? (
          <Panel title="Recent leads" action={<Link href="/admin/leads" className="text-sm font-semibold text-brand-700">View all</Link>} className="xl:col-span-2">
            {s.recentLeads.length ? (
              <ul className="-my-2 divide-y divide-ink-100">
                {s.recentLeads.map((l) => (
                  <li key={l.id}>
                    <Link href={`/admin/leads/${l.id}`} className="flex items-center justify-between gap-4 py-3 hover:bg-ink-50/60">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-950">
                          {l.name} <span className="font-normal text-ink-500">· {formatPhone(l.phone)}</span>
                        </p>
                        <p className="truncate text-xs text-ink-500">
                          {LEAD_SOURCE_LABELS[l.source]}
                          {l.subject ? ` — ${l.subject}` : ""}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <Pill tone={LEAD_STATUS_TONE[l.status]}>{LEAD_STATUS_LABELS[l.status]}</Pill>
                        <p className="mt-1 text-xs text-ink-500">{formatRelative(l.createdAt)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-500">No leads yet. They&apos;ll appear here as soon as visitors enquire.</p>
            )}
          </Panel>
        ) : null}

        {leadsAccess ? (
          <Panel title="Leads by source (7 days)">
            {s.leadsBySource.length ? (
              <ul className="space-y-3">
                {s.leadsBySource.map((row) => (
                  <li key={row.source}>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-700">{LEAD_SOURCE_LABELS[row.source]}</span>
                      <span className="font-semibold text-ink-950">{row.count}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-ink-100">
                      <div className="h-2 rounded-full bg-brand-600" style={{ width: `${(row.count / maxSource) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-500">No leads in the last 7 days.</p>
            )}
          </Panel>
        ) : null}

        {leadsAccess ? (
          <Panel title="Upcoming site visits" action={<Link href="/admin/site-visits" className="text-sm font-semibold text-brand-700">View all</Link>} className="xl:col-span-2">
            {s.upcomingVisits.length ? (
              <ul className="-my-2 divide-y divide-ink-100">
                {s.upcomingVisits.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <Link href={`/admin/leads/${v.leadId}`} className="font-medium text-ink-950 hover:text-brand-700">
                        {v.name}
                      </Link>
                      <p className="truncate text-xs text-ink-500">{v.subject ?? "—"}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-ink-900">{formatDateTime(v.scheduledAt)}</p>
                      <Pill tone={SITE_VISIT_STATUS_TONE[v.status]}>{SITE_VISIT_STATUS_LABELS[v.status]}</Pill>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-500">No visits scheduled for the next 7 days.</p>
            )}
          </Panel>
        ) : null}

        {demo && demo.total > 0 ? (
          <Panel title="Demo content" className="xl:col-span-3">
            <p className="text-sm text-ink-600">
              The site still contains demo records: {demo.properties} properties, {demo.projects} projects, {demo.agents} agent(s), {demo.testimonials}{" "}
              testimonials and {demo.blogPosts} blog posts. Remove them once your real listings are live.
            </p>
            <ActionForm action={purgeDemoAction} submitLabel="Delete all demo content" variant="danger" size="sm" className="mt-3 max-w-md">
              <div>
                <Label htmlFor="purge-confirm">Type PURGE to confirm</Label>
                <Input id="purge-confirm" name="confirm" autoComplete="off" className="h-10" />
              </div>
            </ActionForm>
          </Panel>
        ) : null}

        <Panel title={s.topViewed[0]?.source === "views7d" ? "Most viewed (7 days)" : "Most viewed"}>
          <ol className="space-y-2.5">
            {s.topViewed.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-ink-400">{i + 1}.</span>
                <Link href={`/admin/properties/${p.id}`} className="min-w-0 flex-1 truncate text-ink-800 hover:text-brand-700">
                  {p.title}
                </Link>
                <span className="font-semibold text-ink-950">{p.views}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </>
  );
}
