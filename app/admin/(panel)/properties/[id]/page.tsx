import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { PageHeader, Pill } from "@/components/admin/admin-ui";
import { ConfirmSubmit } from "@/components/admin/confirm-button";
import { ImageManager } from "@/components/admin/image-manager";
import { PropertyForm } from "@/components/admin/property-form";
import { buttonVariants } from "@/components/ui/button";
import {
  deletePropertyAction,
  deletePropertyImageAction,
  duplicatePropertyAction,
  movePropertyImageAction,
  savePropertyAction,
  setPropertyCoverAction,
  updatePropertyImageAction,
} from "@/lib/actions/admin/properties";
import { LISTING_STATUS_TONE } from "@/lib/admin-tones";
import { can } from "@/lib/auth/permissions";
import { requireAdmin } from "@/lib/auth/session";
import { LISTING_STATUS_LABELS } from "@/lib/constants/enums";
import { formatDateTime } from "@/lib/format/date";
import { getPropertyForEdit, getPropertyFormOptions } from "@/services/admin/property-admin.service";

export const metadata: Metadata = { title: "Edit property" };

export default async function EditPropertyPage({ params, searchParams }: PageProps<"/admin/properties/[id]">) {
  const admin = await requireAdmin("viewListings");
  const { id } = await params;
  const { created } = await searchParams;
  const [property, options] = await Promise.all([getPropertyForEdit(id), getPropertyFormOptions()]);
  if (!property) notFound();
  const editable = can(admin.role, "manageListings");
  const publicVisible = ["ACTIVE", "UNDER_OFFER", "SOLD", "RENTED"].includes(property.status);

  return (
    <>
      <PageHeader
        title={property.title}
        back={{ href: "/admin/properties", label: "Properties" }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>{property.refCode}</span>
            <Pill tone={LISTING_STATUS_TONE[property.status]}>{LISTING_STATUS_LABELS[property.status]}</Pill>
            {property.isDemo ? <Pill tone="gray">Demo</Pill> : null}
            <span>
              · {property._count.leads} leads · {property._count.siteVisits} visits · {property.viewCount} views · updated {formatDateTime(property.updatedAt)}
            </span>
          </span>
        }
        actions={
          <>
            {publicVisible ? (
              <Link href={`/property/${property.slug}`} target="_blank" className={buttonVariants({ variant: "outline" })}>
                <ExternalLink aria-hidden="true" />
                View page
              </Link>
            ) : null}
            {editable ? (
              <form action={duplicatePropertyAction.bind(null, property.id)}>
                <ConfirmSubmit>
                  <Copy aria-hidden="true" />
                  Duplicate
                </ConfirmSubmit>
              </form>
            ) : null}
          </>
        }
      />
      {created ? <p className="mb-4 rounded-xl bg-success-50 px-4 py-3 text-sm text-success-700">Property saved. Add photos below.</p> : null}

      {editable ? (
        <div className="space-y-5">
          <ImageManager
            target="property"
            targetId={property.id}
            images={property.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt, caption: i.caption, kind: i.kind, isCover: i.isCover, width: i.width, height: i.height }))}
            actions={{
              update: updatePropertyImageAction,
              setCover: setPropertyCoverAction,
              move: movePropertyImageAction,
              remove: deletePropertyImageAction,
            }}
          />
          <PropertyForm property={property} options={options} action={savePropertyAction.bind(null, property.id)} />
          <section className="rounded-card border border-danger-600/20 bg-white p-5">
            <h2 className="font-semibold text-danger-700">Delete property</h2>
            <p className="mt-1 text-sm text-ink-600">
              Permanently removes the listing and its photos. Leads keep their history but lose the link. To hide a listing temporarily,
              set its status to Inactive instead.
            </p>
            <form action={deletePropertyAction.bind(null, property.id)} className="mt-3">
              <ConfirmSubmit variant="danger" confirm={`Permanently delete ${property.refCode}? This cannot be undone.`}>
                <Trash2 aria-hidden="true" />
                Delete permanently
              </ConfirmSubmit>
            </form>
          </section>
        </div>
      ) : (
        <p className="rounded-xl bg-ink-100 px-4 py-3 text-sm text-ink-700">You have read-only access to listings.</p>
      )}
    </>
  );
}
