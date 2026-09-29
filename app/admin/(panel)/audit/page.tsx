import type { Metadata } from "next";
import Link from "next/link";
import { EmptyRow, PageHeader, Table, td, th } from "@/components/admin/admin-ui";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format/date";
import { cn } from "@/lib/utils";
import { auditEntityTypes, listAuditLog } from "@/services/admin/admin-users.service";

export const metadata: Metadata = { title: "Audit log" };

export default async function AuditPage({ searchParams }: PageProps<"/admin/audit">) {
  await requireAdmin("manageAdmins");
  const { type } = await searchParams;
  const entityType = typeof type === "string" && /^[A-Za-z]{2,40}$/.test(type) ? type : undefined;
  const [rows, types] = await Promise.all([listAuditLog(entityType), auditEntityTypes()]);
  return (
    <>
      <PageHeader title="Audit log" description="The last 200 admin actions (SPEC §42.9)." />
      <nav aria-label="Filter by type" className="mb-4 flex flex-wrap gap-2">
        {[undefined, ...types].map((t) => (
          <Link
            key={t ?? "all"}
            href={t ? `/admin/audit?type=${t}` : "/admin/audit"}
            aria-current={entityType === t ? "page" : undefined}
            className={cn("rounded-full px-3 py-1 text-sm font-semibold", entityType === t ? "bg-ink-900 text-white" : "bg-white text-ink-700 ring-1 ring-ink-200")}
          >
            {t ?? "All"}
          </Link>
        ))}
      </nav>
      <Table minWidth="48rem">
        <thead className="border-b border-ink-100 bg-ink-50/60">
          <tr>
            <th className={th}>When</th>
            <th className={th}>Who</th>
            <th className={th}>Action</th>
            <th className={th}>Record</th>
            <th className={th}>Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.length ? (
            rows.map((r) => (
              <tr key={r.id}>
                <td className={`${td} whitespace-nowrap text-ink-600`}>{formatDateTime(r.createdAt)}</td>
                <td className={td}>{r.admin?.name ?? "system / CLI"}</td>
                <td className={`${td} font-mono text-xs`}>{r.action}</td>
                <td className={`${td} text-xs text-ink-500`}>
                  {r.entityType} · {r.entityId.slice(0, 12)}
                </td>
                <td className={`${td} max-w-80 break-all font-mono text-xs text-ink-500`}>{r.changes ? JSON.stringify(r.changes).slice(0, 200) : ""}</td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={5}>No entries.</EmptyRow>
          )}
        </tbody>
      </Table>
    </>
  );
}
