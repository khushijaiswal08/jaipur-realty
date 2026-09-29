import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HousePlus, Phone } from "lucide-react";
import { ActionForm } from "@/components/admin/action-form";
import { PageHeader, Panel, Pill } from "@/components/admin/admin-ui";
import { ConfirmSubmit } from "@/components/admin/confirm-button";
import { WhatsAppIcon } from "@/components/shared/icons";
import { buttonVariants } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/form-controls";
import { convertOwnerListingAction, updateOwnerListingAction } from "@/lib/actions/admin/leads";
import { OWNER_LISTING_STATUS_TONE } from "@/lib/admin-tones";
import { can } from "@/lib/auth/permissions";
import { requireAdmin } from "@/lib/auth/session";
import { siteConfig } from "@/lib/config";
import { OWNER_LISTING_STATUS_LABELS, PROPERTY_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/constants/enums";
import { formatAreaValue } from "@/lib/format/area";
import { formatDateTime } from "@/lib/format/date";
import { formatPhone, telHref } from "@/lib/format/phone";
import { formatPrice } from "@/lib/format/price";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getOwnerListing } from "@/services/admin/lead-admin.service";

export const metadata: Metadata = { title: "Owner listing" };

export default async function OwnerListingPage({ params }: PageProps<"/admin/owner-listings/[id]">) {
  const admin = await requireAdmin("manageLeads");
  const { id } = await params;
  const o = await getOwnerListing(id);
  if (!o) notFound();
  const wa = buildWhatsAppUrl(o.ownerPhone, `Hi ${o.ownerName.split(" ")[0]}, this is ${siteConfig.name} about the property you listed with us.`);
  const rows: Array<[string, string | null | undefined]> = [
    ["Listing for", TRANSACTION_TYPE_LABELS[o.transactionType]],
    ["Type", PROPERTY_TYPE_LABELS[o.propertyType]],
    ["Bedrooms", o.bedrooms?.toString()],
    ["Locality", o.locality?.name ?? o.localityText],
    ["Address", o.address],
    ["Area", o.area ? formatAreaValue(o.area, o.areaUnit) : null],
    ["Expected price", o.expectedPrice ? formatPrice(o.expectedPrice, { rent: o.transactionType === "RENT" }) : null],
    ["Email", o.ownerEmail],
    ["Received", formatDateTime(o.createdAt)],
  ];

  return (
    <>
      <PageHeader
        title={`${o.ownerName} — ${PROPERTY_TYPE_LABELS[o.propertyType]}`}
        back={{ href: "/admin/owner-listings", label: "Owner listings" }}
        description={<Pill tone={OWNER_LISTING_STATUS_TONE[o.status]}>{OWNER_LISTING_STATUS_LABELS[o.status]}</Pill>}
        actions={
          <>
            <a href={telHref(o.ownerPhone) ?? "#"} className={buttonVariants({ variant: "outline" })}>
              <Phone aria-hidden="true" /> {formatPhone(o.ownerPhone)}
            </a>
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "whatsapp" })}>
                <WhatsAppIcon /> WhatsApp
              </a>
            ) : null}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel title="Submission">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            {rows
              .filter((r): r is [string, string] => Boolean(r[1]))
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-ink-500">{k}</dt>
                  <dd className="font-medium text-ink-950">{v}</dd>
                </div>
              ))}
            {o.description ? (
              <div className="sm:col-span-2">
                <dt className="text-ink-500">Description</dt>
                <dd className="whitespace-pre-line text-ink-800">{o.description}</dd>
              </div>
            ) : null}
          </dl>
          {o.lead ? (
            <Link href={`/admin/leads/${o.lead.id}`} className="mt-4 inline-block text-sm font-semibold text-brand-700">
              Open the related lead →
            </Link>
          ) : null}
        </Panel>
        <div className="space-y-6">
          <Panel title="Review">
            <ActionForm action={updateOwnerListingAction.bind(null, o.id)} submitLabel="Save">
              <div>
                <Label htmlFor="ol-status">Status</Label>
                <Select id="ol-status" name="status" defaultValue={o.status} className="h-10">
                  {Object.entries(OWNER_LISTING_STATUS_LABELS).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="ol-notes">Review notes</Label>
                <Textarea id="ol-notes" name="reviewNotes" rows={3} defaultValue={o.reviewNotes ?? ""} />
              </div>
            </ActionForm>
          </Panel>
          <Panel title="Publish">
            {o.convertedProperty ? (
              <p className="text-sm text-ink-700">
                Converted to{" "}
                <Link href={`/admin/properties/${o.convertedProperty.id}`} className="font-semibold text-brand-700">
                  {o.convertedProperty.refCode}
                </Link>
                .
              </p>
            ) : can(admin.role, "manageListings") ? (
              <>
                <p className="mb-3 text-sm text-ink-600">Creates a draft property with these details. Verify, add photos, then set it to Active.</p>
                <form action={convertOwnerListingAction.bind(null, o.id)}>
                  <ConfirmSubmit variant="primary" confirm="Create a draft property from this submission?">
                    <HousePlus aria-hidden="true" /> Convert to property
                  </ConfirmSubmit>
                </form>
              </>
            ) : (
              <p className="text-sm text-ink-500">An admin can convert this into a property.</p>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
