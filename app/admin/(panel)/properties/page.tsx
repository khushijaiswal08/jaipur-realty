import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyRow, PageHeader, Pill, Table, td, th } from "@/components/admin/admin-ui";
import { SmartImage } from "@/components/shared/smart-image";
import { buttonVariants } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form-controls";
import { Pagination } from "@/components/ui/pagination";
import type { ListingStatus, TransactionType } from "@/generated/prisma/enums";
import { LISTING_STATUS_TONE } from "@/lib/admin-tones";
import { can } from "@/lib/auth/permissions";
import { requireAdmin } from "@/lib/auth/session";
import { LISTING_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/constants/enums";
import { formatRelative } from "@/lib/format/date";
import { formatPrice } from "@/lib/format/price";
import { getPropertyFormOptions, listAdminProperties } from "@/services/admin/property-admin.service";

export const metadata: Metadata = { title: "Properties" };

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export default async function AdminPropertiesPage({ searchParams }: PageProps<"/admin/properties">) {
  const admin = await requireAdmin("viewListings");
  const sp = await searchParams;
  const q = one(sp.q)?.slice(0, 80);
  const txParam = one(sp.tx);
  const tx: TransactionType | undefined = txParam === "sale" ? "SALE" : txParam === "rent" ? "RENT" : undefined;
  const statusParam = one(sp.status)?.toUpperCase();
  const status = statusParam && statusParam in LISTING_STATUS_LABELS ? (statusParam as ListingStatus) : undefined;
  const localityId = one(sp.locality);
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const [{ rows, total, totalPages }, options] = await Promise.all([
    listAdminProperties({ q, tx, status, localityId, page }),
    getPropertyFormOptions(),
  ]);
  const hrefFor = (p: number) => {
    const params = new URLSearchParams(Object.entries({ q, tx: txParam, status: one(sp.status), locality: localityId, page: String(p) }).filter(([, v]) => v) as [string, string][]);
    return `/admin/properties?${params}`;
  };

  return (
    <>
      <PageHeader
        title="Properties"
        description={`${total} ${total === 1 ? "listing" : "listings"}`}
        actions={
          can(admin.role, "manageListings") ? (
            <Link href="/admin/properties/new" className={buttonVariants()}>
              <Plus aria-hidden="true" />
              New property
            </Link>
          ) : null
        }
      />
      {one(sp.deleted) ? <p className="mb-4 rounded-xl bg-success-50 px-4 py-3 text-sm text-success-700">Property deleted.</p> : null}

      <form method="get" className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_10rem_10rem_12rem_auto]">
        <label className="sr-only" htmlFor="pq">
          Search
        </label>
        <Input id="pq" name="q" defaultValue={q} placeholder="Search title, ref (JP1001) or locality" className="h-10" />
        <Select name="tx" defaultValue={txParam ?? ""} aria-label="Transaction" className="h-10">
          <option value="">Sale & rent</option>
          <option value="sale">Sale</option>
          <option value="rent">Rent</option>
        </Select>
        <Select name="status" defaultValue={one(sp.status) ?? ""} aria-label="Status" className="h-10">
          <option value="">Any status</option>
          {Object.entries(LISTING_STATUS_LABELS).map(([k, l]) => (
            <option key={k} value={k.toLowerCase()}>
              {l}
            </option>
          ))}
        </Select>
        <Select name="locality" defaultValue={localityId ?? ""} aria-label="Locality" className="h-10">
          <option value="">All localities</option>
          {options.localities.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
        <button type="submit" className={buttonVariants({ variant: "secondary", className: "h-10" })}>
          Filter
        </button>
      </form>

      <Table minWidth="60rem">
        <thead className="border-b border-ink-100 bg-ink-50/60">
          <tr>
            <th className={th}>Property</th>
            <th className={th}>Price</th>
            <th className={th}>Status</th>
            <th className={th}>Leads</th>
            <th className={th}>Views</th>
            <th className={th}>Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.length ? (
            rows.map((r) => (
              <tr key={r.id} className="hover:bg-ink-50/50">
                <td className={td}>
                  <Link href={`/admin/properties/${r.id}`} className="flex items-center gap-3">
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                      {r.cover ? <SmartImage src={r.cover} alt="" fill sizes="56px" className="object-cover" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink-950 hover:text-brand-700">{r.title}</span>
                      <span className="block text-xs text-ink-500">
                        {r.refCode} · {PROPERTY_TYPE_LABELS[r.propertyType]} · {r.locality.name}
                      </span>
                      <span className="mt-1 flex gap-1">
                        {r.isFeatured ? <Pill tone="amber">Featured</Pill> : null}
                        {r.isVerified ? <Pill tone="green">Verified</Pill> : null}
                        {r.isDemo ? <Pill tone="gray">Demo</Pill> : null}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className={td}>{formatPrice(r.price, { rent: r.transactionType === "RENT", priceOnRequest: r.priceOnRequest })}</td>
                <td className={td}>
                  <Pill tone={LISTING_STATUS_TONE[r.status]}>{LISTING_STATUS_LABELS[r.status]}</Pill>
                </td>
                <td className={td}>{r._count.leads}</td>
                <td className={td}>{r.viewCount}</td>
                <td className={`${td} text-ink-500`}>{formatRelative(r.updatedAt)}</td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={6}>No properties match these filters.</EmptyRow>
          )}
        </tbody>
      </Table>
      <Pagination className="mt-6" page={Math.min(page, totalPages)} totalPages={totalPages} hrefFor={hrefFor} />
    </>
  );
}
