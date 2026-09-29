import "server-only";

import type { ListingStatus, Prisma, TransactionType } from "@/generated/prisma/client";
import { PROPERTY_TYPE_CATEGORY } from "@/lib/constants/enums";
import { db } from "@/lib/db";
import { computePricePerSqft, getPrimaryArea, toSqft } from "@/lib/format/area";
import { deleteFileByUrl } from "@/lib/server/storage";
import { propertySlug } from "@/lib/utils";
import type { PropertyAdminInput } from "@/lib/validation/property-admin";

export interface AdminPropertyFilters {
  q?: string;
  tx?: TransactionType;
  status?: ListingStatus;
  localityId?: string;
  demo?: boolean;
  page: number;
}

export async function listAdminProperties(f: AdminPropertyFilters, pageSize = 20) {
  const where: Prisma.PropertyWhereInput = {
    ...(f.tx ? { transactionType: f.tx } : {}),
    ...(f.status ? { status: f.status } : {}),
    ...(f.localityId ? { localityId: f.localityId } : {}),
    ...(f.demo !== undefined ? { isDemo: f.demo } : {}),
    ...(f.q
      ? {
          OR: [
            { refCode: { equals: f.q.toUpperCase() } },
            { title: { contains: f.q, mode: "insensitive" } },
            { locality: { name: { contains: f.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
  const [total, rows] = await Promise.all([
    db.property.count({ where }),
    db.property.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (f.page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        refCode: true,
        slug: true,
        title: true,
        transactionType: true,
        propertyType: true,
        status: true,
        price: true,
        priceOnRequest: true,
        isFeatured: true,
        isVerified: true,
        isDemo: true,
        viewCount: true,
        updatedAt: true,
        locality: { select: { name: true } },
        images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }], take: 1, select: { url: true } },
        _count: { select: { leads: true } },
      },
    }),
  ]);
  return {
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    rows: rows.map((r) => ({ ...r, price: r.price === null ? null : Number(r.price), updatedAt: r.updatedAt.toISOString(), cover: r.images[0]?.url ?? null })),
  };
}

export async function getPropertyForEdit(id: string) {
  const p = await db.property.findUnique({
    where: { id },
    include: {
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      amenities: { select: { id: true } },
      locality: { select: { name: true, slug: true } },
      _count: { select: { leads: true, siteVisits: true, views: true } },
    },
  });
  if (!p) return null;
  return {
    ...p,
    price: p.price === null ? null : Number(p.price),
    securityDeposit: p.securityDeposit === null ? null : Number(p.securityDeposit),
    bookingAmount: p.bookingAmount === null ? null : Number(p.bookingAmount),
    amenityIds: p.amenities.map((a) => a.id),
  };
}

export type PropertyForEdit = NonNullable<Awaited<ReturnType<typeof getPropertyForEdit>>>;

export async function getPropertyFormOptions() {
  const [localities, projects, agents, amenities] = await Promise.all([
    db.locality.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
    db.project.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.agent.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.amenity.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }], select: { id: true, name: true, category: true } }),
  ]);
  return { localities, projects, agents, amenities };
}

export type PropertyFormOptions = Awaited<ReturnType<typeof getPropertyFormOptions>>;

/** Compact list for pickers (e.g. linking a manual lead to a listing). */
export async function getPropertyPickerOptions() {
  const rows = await db.property.findMany({
    where: { status: { not: "INACTIVE" } },
    orderBy: { refCode: "asc" },
    select: { id: true, refCode: true, title: true },
  });
  return rows.map((r) => ({ value: r.id, label: `${r.refCode} — ${r.title}` }));
}

/** Next human-readable reference from the Postgres sequence (JP1021, JP1022 …). */
export async function nextRefCode(): Promise<string> {
  const rows = await db.$queryRaw<Array<{ n: bigint }>>`SELECT nextval('property_ref_seq') AS n`;
  return `JP${rows[0]!.n.toString()}`;
}

function derivedFields(input: PropertyAdminInput) {
  const category = PROPERTY_TYPE_CATEGORY[input.propertyType];
  const plotArea = input.plotAreaValue !== null ? toSqft(input.plotAreaValue, input.plotAreaUnit) : null;
  const areas = {
    category,
    carpetArea: input.carpetArea,
    builtUpArea: input.builtUpArea,
    superBuiltUpArea: input.superBuiltUpArea,
    plotArea,
    areaDisplayUnit: plotArea !== null ? input.plotAreaUnit : ("SQFT" as const),
  };
  const primary = getPrimaryArea(areas);
  return {
    ...areas,
    primaryAreaSqft: primary?.sqft ?? null,
    pricePerSqft: input.transactionType === "SALE" && !input.priceOnRequest ? computePricePerSqft(input.price, primary?.sqft) : null,
  };
}

/** Creates or updates a property. Returns the id and (possibly new) slug. */
export async function savePropertyAdmin(id: string | null, input: PropertyAdminInput): Promise<{ id: string; slug: string; previousSlug?: string }> {
  const locality = await db.locality.findUniqueOrThrow({ where: { id: input.localityId }, select: { cityId: true } });
  const { amenityIds, plotAreaValue: _v, plotAreaUnit: _u, ...rest } = input;
  const money = (n: number | null) => (n === null ? null : BigInt(Math.round(n)));
  const data = {
    ...rest,
    ...derivedFields(input),
    price: input.priceOnRequest ? null : money(input.price),
    securityDeposit: money(input.securityDeposit),
    bookingAmount: money(input.bookingAmount),
    cityId: locality.cityId,
  };

  if (!id) {
    const refCode = await nextRefCode();
    const created = await db.property.create({
      data: {
        ...data,
        refCode,
        slug: propertySlug(input.title, refCode),
        publishedAt: input.status === "ACTIVE" ? new Date() : null,
        amenities: { connect: amenityIds.map((a) => ({ id: a })) },
      },
      select: { id: true, slug: true },
    });
    return created;
  }

  const existing = await db.property.findUniqueOrThrow({ where: { id }, select: { slug: true, refCode: true, status: true, publishedAt: true } });
  // Slugs only change while a listing is still a draft, so live links never break.
  const slug = existing.status === "DRAFT" ? propertySlug(input.title, existing.refCode) : existing.slug;
  const updated = await db.property.update({
    where: { id },
    data: {
      ...data,
      slug,
      publishedAt: existing.publishedAt ?? (input.status === "ACTIVE" ? new Date() : null),
      amenities: { set: amenityIds.map((a) => ({ id: a })) },
    },
    select: { id: true, slug: true },
  });
  return { ...updated, previousSlug: existing.slug !== updated.slug ? existing.slug : undefined };
}

export async function deletePropertyAdmin(id: string): Promise<{ slug: string } | null> {
  const p = await db.property.findUnique({ where: { id }, select: { slug: true, images: { select: { url: true } } } });
  if (!p) return null;
  await db.property.delete({ where: { id } });
  for (const { url } of p.images) {
    // Duplicated listings can share files — only delete unreferenced ones.
    const stillUsed = (await db.propertyImage.count({ where: { url } })) + (await db.projectImage.count({ where: { url } }));
    if (!stillUsed) await deleteFileByUrl(url);
  }
  return { slug: p.slug };
}

/** Copies a listing as a new DRAFT (images reference the same files; amenities copied). */
export async function duplicatePropertyAdmin(id: string): Promise<{ id: string }> {
  const src = await db.property.findUniqueOrThrow({ where: { id }, include: { amenities: { select: { id: true } }, images: true } });
  const refCode = await nextRefCode();
  const {
    id: _id,
    refCode: _r,
    slug: _s,
    createdAt: _c,
    updatedAt: _u,
    publishedAt: _p,
    viewCount: _vc,
    amenities,
    images,
    ...fields
  } = src;
  const title = `${src.title} (copy)`.slice(0, 120);
  const copy = await db.property.create({
    data: {
      ...fields,
      title,
      refCode,
      slug: propertySlug(title, refCode),
      status: "DRAFT",
      isFeatured: false,
      isDemo: false,
      amenities: { connect: amenities.map((a) => ({ id: a.id })) },
      images: {
        create: images.map((i) => ({ url: i.url, alt: i.alt, width: i.width, height: i.height, kind: i.kind, caption: i.caption, sortOrder: i.sortOrder, isCover: i.isCover })),
      },
    },
    select: { id: true },
  });
  return copy;
}

// ── Images ────────────────────────────────────────────────────────────────────

export async function updatePropertyImage(imageId: string, data: { alt?: string; caption?: string | null; kind?: Prisma.PropertyImageUpdateInput["kind"] }) {
  return db.propertyImage.update({ where: { id: imageId }, data, select: { propertyId: true } });
}

export async function setPropertyCover(imageId: string) {
  const img = await db.propertyImage.findUniqueOrThrow({ where: { id: imageId }, select: { propertyId: true } });
  await db.$transaction([
    db.propertyImage.updateMany({ where: { propertyId: img.propertyId }, data: { isCover: false } }),
    db.propertyImage.update({ where: { id: imageId }, data: { isCover: true } }),
  ]);
  return img;
}

export async function movePropertyImage(imageId: string, direction: -1 | 1) {
  const img = await db.propertyImage.findUniqueOrThrow({ where: { id: imageId }, select: { propertyId: true } });
  const all = await db.propertyImage.findMany({ where: { propertyId: img.propertyId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true } });
  const ids = all.map((a) => a.id);
  const i = ids.indexOf(imageId);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= ids.length) return img;
  [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  await db.$transaction(ids.map((id, index) => db.propertyImage.update({ where: { id }, data: { sortOrder: index } })));
  return img;
}

export async function deletePropertyImage(imageId: string) {
  const img = await db.propertyImage.delete({ where: { id: imageId }, select: { propertyId: true, url: true, isCover: true } });
  // Keep a cover if one was removed.
  if (img.isCover) {
    const next = await db.propertyImage.findFirst({ where: { propertyId: img.propertyId }, orderBy: { sortOrder: "asc" }, select: { id: true } });
    if (next) await db.propertyImage.update({ where: { id: next.id }, data: { isCover: true } });
  }
  // Only delete the file when no other record (e.g. a duplicated listing) still uses it.
  const stillUsed = await db.propertyImage.count({ where: { url: img.url } });
  if (!stillUsed) await deleteFileByUrl(img.url);
  return img;
}
