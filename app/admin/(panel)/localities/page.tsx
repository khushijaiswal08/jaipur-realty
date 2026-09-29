import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader, Pill, Table, td, th } from "@/components/admin/admin-ui";
import { buttonVariants } from "@/components/ui/button";
import { can } from "@/lib/auth/permissions";
import { requireAdmin } from "@/lib/auth/session";
import { formatPricePerUnit } from "@/lib/format/price";
import { listAdminLocalities } from "@/services/admin/catalog-admin.service";

export const metadata: Metadata = { title: "Localities" };

export default async function AdminLocalitiesPage({ searchParams }: PageProps<"/admin/localities">) {
  const admin = await requireAdmin("viewListings");
  const { deleted } = await searchParams;
  const rows = await listAdminLocalities();
  return (
    <>
      <PageHeader
        title="Localities"
        description="Guides, indicative rates and SEO content for each neighbourhood."
        actions={
          can(admin.role, "manageListings") ? (
            <Link href="/admin/localities/new" className={buttonVariants()}>
              <Plus aria-hidden="true" /> New locality
            </Link>
          ) : null
        }
      />
      {deleted ? <p className="mb-4 rounded-xl bg-success-50 px-4 py-3 text-sm text-success-700">Locality deleted.</p> : null}
      <Table minWidth="50rem">
        <thead className="border-b border-ink-100 bg-ink-50/60">
          <tr>
            <th className={th}>Locality</th>
            <th className={th}>Indicative rate</th>
            <th className={th}>2 BHK rent</th>
            <th className={th}>Listings</th>
            <th className={th}>Projects</th>
            <th className={th}>Leads</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.map((l) => (
            <tr key={l.id} className="hover:bg-ink-50/50">
              <td className={td}>
                <Link href={`/admin/localities/${l.id}`} className="font-semibold text-ink-950 hover:text-brand-700">
                  {l.name}
                </Link>
                <span className="block text-xs text-ink-500">
                  {l.zone ?? "—"} · {l.pincode ?? "—"} {l.isFeatured ? <Pill tone="amber">Featured</Pill> : null}
                </span>
              </td>
              <td className={td}>{l.avgPricePerSqft ? formatPricePerUnit(l.avgPricePerSqft) : "—"}</td>
              <td className={td}>{l.avgRent2Bhk ? formatPricePerUnit(l.avgRent2Bhk, "month") : "—"}</td>
              <td className={td}>{l._count.properties}</td>
              <td className={td}>{l._count.projects}</td>
              <td className={td}>{l._count.leads}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
