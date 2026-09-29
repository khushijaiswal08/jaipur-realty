import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyRow, PageHeader, Pill, Table, td, th } from "@/components/admin/admin-ui";
import { SmartImage } from "@/components/shared/smart-image";
import { buttonVariants } from "@/components/ui/button";
import { PUBLISH_STATUS_TONE } from "@/lib/admin-tones";
import { can } from "@/lib/auth/permissions";
import { requireAdmin } from "@/lib/auth/session";
import { CONSTRUCTION_STATUS_LABELS, PUBLISH_STATUS_LABELS } from "@/lib/constants/enums";
import { formatRelative } from "@/lib/format/date";
import { formatPriceRange } from "@/lib/format/price";
import { listAdminProjects } from "@/services/admin/catalog-admin.service";

export const metadata: Metadata = { title: "Projects" };

export default async function AdminProjectsPage({ searchParams }: PageProps<"/admin/projects">) {
  const admin = await requireAdmin("viewListings");
  const { deleted } = await searchParams;
  const rows = await listAdminProjects();
  return (
    <>
      <PageHeader
        title="Projects"
        description={`${rows.length} projects`}
        actions={
          can(admin.role, "manageListings") ? (
            <Link href="/admin/projects/new" className={buttonVariants()}>
              <Plus aria-hidden="true" /> New project
            </Link>
          ) : null
        }
      />
      {deleted ? <p className="mb-4 rounded-xl bg-success-50 px-4 py-3 text-sm text-success-700">Project deleted.</p> : null}
      <Table minWidth="56rem">
        <thead className="border-b border-ink-100 bg-ink-50/60">
          <tr>
            <th className={th}>Project</th>
            <th className={th}>Price range</th>
            <th className={th}>Status</th>
            <th className={th}>Listings</th>
            <th className={th}>Leads</th>
            <th className={th}>Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.length ? (
            rows.map((p) => (
              <tr key={p.id} className="hover:bg-ink-50/50">
                <td className={td}>
                  <Link href={`/admin/projects/${p.id}`} className="flex items-center gap-3">
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                      {p.images[0] ? <SmartImage src={p.images[0].url} alt="" fill sizes="56px" className="object-cover" /> : null}
                    </span>
                    <span>
                      <span className="block font-semibold text-ink-950 hover:text-brand-700">{p.name}</span>
                      <span className="block text-xs text-ink-500">
                        {p.developerName} · {p.locality.name} · {CONSTRUCTION_STATUS_LABELS[p.constructionStatus]}
                      </span>
                      {p.isDemo ? <Pill tone="gray">Demo</Pill> : null}
                    </span>
                  </Link>
                </td>
                <td className={td}>{p.priceOnRequest ? "On request" : formatPriceRange(p.priceMin, p.priceMax)}</td>
                <td className={td}>
                  <Pill tone={PUBLISH_STATUS_TONE[p.status]}>{PUBLISH_STATUS_LABELS[p.status]}</Pill>
                </td>
                <td className={td}>{p._count.properties}</td>
                <td className={td}>{p._count.leads}</td>
                <td className={`${td} text-ink-500`}>{formatRelative(p.updatedAt)}</td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={6}>No projects yet.</EmptyRow>
          )}
        </tbody>
      </Table>
    </>
  );
}
