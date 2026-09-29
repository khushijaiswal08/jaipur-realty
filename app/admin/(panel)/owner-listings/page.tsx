import type { Metadata } from "next";
import Link from "next/link";
import { EmptyRow, PageHeader, Pill, Table, td, th } from "@/components/admin/admin-ui";
import type { OwnerListingStatus } from "@/generated/prisma/enums";
import { OWNER_LISTING_STATUS_TONE } from "@/lib/admin-tones";
import { requireAdmin } from "@/lib/auth/session";
import { OWNER_LISTING_STATUS_LABELS, PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/constants/enums";
import { formatAreaValue } from "@/lib/format/area";
import { formatRelative } from "@/lib/format/date";
import { formatPhone } from "@/lib/format/phone";
import { formatPrice } from "@/lib/format/price";
import { cn } from "@/lib/utils";
import { listOwnerListings } from "@/services/admin/lead-admin.service";

export const metadata: Metadata = { title: "Owner listings" };

export default async function OwnerListingsPage({ searchParams }: PageProps<"/admin/owner-listings">) {
  await requireAdmin("manageLeads");
  const sp = await searchParams;
  const raw = typeof sp.status === "string" ? sp.status.toUpperCase() : "PENDING_REVIEW";
  const status = raw === "ALL" ? undefined : raw in OWNER_LISTING_STATUS_LABELS ? (raw as OwnerListingStatus) : "PENDING_REVIEW";
  const rows = await listOwnerListings(status);

  return (
    <>
      <PageHeader title="Owner listings" description="Submissions from “Post your property”. Nothing goes live until you convert and publish it." />
      <nav aria-label="Filter by status" className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["PENDING_REVIEW", "Pending review"],
            ["CONTACTED", "Contacted"],
            ["CONVERTED", "Converted"],
            ["REJECTED", "Rejected"],
            ["ALL", "All"],
          ] as const
        ).map(([k, l]) => {
          const active = (status ?? "ALL") === k;
          return (
            <Link
              key={k}
              href={`/admin/owner-listings?status=${k.toLowerCase()}`}
              aria-current={active ? "page" : undefined}
              className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", active ? "bg-ink-900 text-white" : "bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50")}
            >
              {l}
            </Link>
          );
        })}
      </nav>
      <Table minWidth="56rem">
        <thead className="border-b border-ink-100 bg-ink-50/60">
          <tr>
            <th className={th}>Received</th>
            <th className={th}>Owner</th>
            <th className={th}>Property</th>
            <th className={th}>Expected</th>
            <th className={th}>Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.length ? (
            rows.map((o) => (
              <tr key={o.id} className="hover:bg-ink-50/50">
                <td className={`${td} text-ink-600`}>{formatRelative(o.createdAt)}</td>
                <td className={td}>
                  <Link href={`/admin/owner-listings/${o.id}`} className="font-semibold text-ink-950 hover:text-brand-700">
                    {o.ownerName}
                  </Link>
                  <span className="block text-xs text-ink-500">{formatPhone(o.ownerPhone)}</span>
                </td>
                <td className={td}>
                  {TRANSACTION_TYPE_LABELS[o.transactionType]} · {PROPERTY_TYPE_LABELS[o.propertyType]}
                  <span className="block text-xs text-ink-500">
                    {o.locality?.name ?? o.localityText ?? "—"}
                    {o.area ? ` · ${formatAreaValue(o.area, o.areaUnit)}` : ""}
                  </span>
                </td>
                <td className={td}>{o.expectedPrice ? formatPrice(o.expectedPrice, { rent: o.transactionType === "RENT" }) : "—"}</td>
                <td className={td}>
                  <Pill tone={OWNER_LISTING_STATUS_TONE[o.status]}>{OWNER_LISTING_STATUS_LABELS[o.status]}</Pill>
                </td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={5}>Nothing here.</EmptyRow>
          )}
        </tbody>
      </Table>
    </>
  );
}
