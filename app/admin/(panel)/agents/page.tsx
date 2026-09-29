import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyRow, PageHeader, Pill, Table, td, th } from "@/components/admin/admin-ui";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { formatPhone } from "@/lib/format/phone";
import { listAdminAgents } from "@/services/admin/catalog-admin.service";

export const metadata: Metadata = { title: "Agents" };

export default async function AgentsPage({ searchParams }: PageProps<"/admin/agents">) {
  await requireAdmin("manageListings");
  const { deleted } = await searchParams;
  const rows = await listAdminAgents();
  return (
    <>
      <PageHeader
        title="Agents"
        description="Consultants shown on listings. Their numbers override the business contact for their listings."
        actions={
          <Link href="/admin/agents/new" className={buttonVariants()}>
            <Plus aria-hidden="true" /> New agent
          </Link>
        }
      />
      {deleted ? <p className="mb-4 rounded-xl bg-success-50 px-4 py-3 text-sm text-success-700">Agent deleted.</p> : null}
      <Table minWidth="44rem">
        <thead className="border-b border-ink-100 bg-ink-50/60">
          <tr>
            <th className={th}>Agent</th>
            <th className={th}>Phone</th>
            <th className={th}>Listings</th>
            <th className={th}>Leads</th>
            <th className={th}>Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.length ? (
            rows.map((a) => (
              <tr key={a.id} className="hover:bg-ink-50/50">
                <td className={td}>
                  <Link href={`/admin/agents/${a.id}`} className="font-semibold text-ink-950 hover:text-brand-700">
                    {a.name}
                  </Link>
                  <span className="block text-xs text-ink-500">{a.designation ?? "—"}</span>
                </td>
                <td className={td}>{a.phone ? formatPhone(a.phone) : <span className="text-ink-400">Business phone</span>}</td>
                <td className={td}>{a._count.properties}</td>
                <td className={td}>{a._count.leads}</td>
                <td className={td}>
                  <span className="flex gap-1">
                    <Pill tone={a.isActive ? "green" : "gray"}>{a.isActive ? "Active" : "Inactive"}</Pill>
                    {a.isDemo ? <Pill tone="gray">Demo</Pill> : null}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={5}>No agents yet.</EmptyRow>
          )}
        </tbody>
      </Table>
    </>
  );
}
