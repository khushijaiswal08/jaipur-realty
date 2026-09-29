import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { deleteFileByUrl } from "@/lib/server/storage";
import { slugify } from "@/lib/utils";
import type { AgentAdminInput, LocalityAdminInput, ProjectAdminInput } from "@/lib/validation/catalog-admin";

/** Appends -2, -3 … until the slug is free. */
async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  const root = base || "item";
  let slug = root;
  for (let i = 2; await exists(slug); i++) slug = `${root}-${i}`;
  return slug;
}

const money = (n: number | null) => (n === null ? null : BigInt(Math.round(n)));

// ── Projects ──────────────────────────────────────────────────────────────────

export async function listAdminProjects() {
  const rows = await db.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      locality: { select: { name: true } },
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }], take: 1, select: { url: true } },
      _count: { select: { properties: true, leads: true, configurations: true } },
    },
  });
  return rows.map((r) => ({ ...r, priceMin: r.priceMin === null ? null : Number(r.priceMin), priceMax: r.priceMax === null ? null : Number(r.priceMax) }));
}

export async function getProjectForEdit(id: string) {
  const p = await db.project.findUnique({
    where: { id },
    include: {
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      configurations: { orderBy: { sortOrder: "asc" } },
      amenities: { select: { id: true } },
      _count: { select: { leads: true, properties: true } },
    },
  });
  if (!p) return null;
  return {
    ...p,
    priceMin: p.priceMin === null ? null : Number(p.priceMin),
    priceMax: p.priceMax === null ? null : Number(p.priceMax),
    amenityIds: p.amenities.map((a) => a.id),
    configurations: p.configurations.map((c) => ({
      ...c,
      priceMin: c.priceMin === null ? null : Number(c.priceMin),
      priceMax: c.priceMax === null ? null : Number(c.priceMax),
    })),
  };
}

export type ProjectForEdit = NonNullable<Awaited<ReturnType<typeof getProjectForEdit>>>;

export async function saveProjectAdmin(id: string | null, input: ProjectAdminInput): Promise<{ id: string; slug: string }> {
  const locality = await db.locality.findUniqueOrThrow({ where: { id: input.localityId }, select: { cityId: true, slug: true } });
  const { amenityIds, configurations, ...fields } = input;
  const prices = configurations.flatMap((c) => [c.priceMin, c.priceMax]).filter((n): n is number => n !== null);
  const data = {
    ...fields,
    cityId: locality.cityId,
    priceMin: prices.length ? money(Math.min(...prices)) : null,
    priceMax: prices.length ? money(Math.max(...prices)) : null,
  };
  const configRows = configurations.map((c, i) => ({ ...c, priceMin: money(c.priceMin), priceMax: money(c.priceMax), sortOrder: i }));

  if (!id) {
    const slug = await uniqueSlug(slugify(`${input.name} ${locality.slug}`), async (s) => Boolean(await db.project.findUnique({ where: { slug: s }, select: { id: true } })));
    return db.project.create({
      data: {
        ...data,
        slug,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
        amenities: { connect: amenityIds.map((a) => ({ id: a })) },
        configurations: { create: configRows },
      },
      select: { id: true, slug: true },
    });
  }

  const existing = await db.project.findUniqueOrThrow({ where: { id }, select: { publishedAt: true } });
  return db.$transaction(async (tx) => {
    await tx.configuration.deleteMany({ where: { projectId: id } });
    return tx.project.update({
      where: { id },
      data: {
        ...data,
        publishedAt: existing.publishedAt ?? (input.status === "PUBLISHED" ? new Date() : null),
        amenities: { set: amenityIds.map((a) => ({ id: a })) },
        configurations: { create: configRows },
      },
      select: { id: true, slug: true },
    });
  });
}

export async function deleteProjectAdmin(id: string): Promise<void> {
  const p = await db.project.findUniqueOrThrow({ where: { id }, select: { images: { select: { url: true } } } });
  await db.project.delete({ where: { id } });
  for (const { url } of p.images) {
    const stillUsed = (await db.projectImage.count({ where: { url } })) + (await db.propertyImage.count({ where: { url } }));
    if (!stillUsed) await deleteFileByUrl(url);
  }
}

export async function updateProjectImage(imageId: string, data: Prisma.ProjectImageUpdateInput) {
  return db.projectImage.update({ where: { id: imageId }, data, select: { projectId: true } });
}

export async function setProjectCover(imageId: string) {
  const img = await db.projectImage.findUniqueOrThrow({ where: { id: imageId }, select: { projectId: true } });
  await db.$transaction([
    db.projectImage.updateMany({ where: { projectId: img.projectId }, data: { isCover: false } }),
    db.projectImage.update({ where: { id: imageId }, data: { isCover: true } }),
  ]);
  return img;
}

export async function moveProjectImage(imageId: string, direction: -1 | 1) {
  const img = await db.projectImage.findUniqueOrThrow({ where: { id: imageId }, select: { projectId: true } });
  const ids = (await db.projectImage.findMany({ where: { projectId: img.projectId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true } })).map((a) => a.id);
  const i = ids.indexOf(imageId);
  const j = i + direction;
  if (i >= 0 && j >= 0 && j < ids.length) {
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    await db.$transaction(ids.map((id, index) => db.projectImage.update({ where: { id }, data: { sortOrder: index } })));
  }
  return img;
}

export async function deleteProjectImage(imageId: string) {
  const img = await db.projectImage.delete({ where: { id: imageId }, select: { projectId: true, url: true, isCover: true } });
  if (img.isCover) {
    const next = await db.projectImage.findFirst({ where: { projectId: img.projectId }, orderBy: { sortOrder: "asc" }, select: { id: true } });
    if (next) await db.projectImage.update({ where: { id: next.id }, data: { isCover: true } });
  }
  const stillUsed = (await db.projectImage.count({ where: { url: img.url } })) + (await db.propertyImage.count({ where: { url: img.url } }));
  if (!stillUsed) await deleteFileByUrl(img.url);
  return img;
}

// ── Localities ────────────────────────────────────────────────────────────────

export async function listAdminLocalities() {
  return db.locality.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { properties: true, projects: true, leads: true } } },
  });
}

export async function getLocalityForEdit(id: string) {
  return db.locality.findUnique({ where: { id }, include: { _count: { select: { properties: true, projects: true } } } });
}

export async function saveLocalityAdmin(id: string | null, input: LocalityAdminInput): Promise<{ id: string; slug: string }> {
  const data = { ...input, sortOrder: input.sortOrder ?? 0 };
  if (!id) {
    const city = await db.city.findFirstOrThrow({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true } });
    const slug = await uniqueSlug(slugify(input.name), async (s) => Boolean(await db.locality.findFirst({ where: { cityId: city.id, slug: s }, select: { id: true } })));
    return db.locality.create({ data: { ...data, slug, cityId: city.id }, select: { id: true, slug: true } });
  }
  return db.locality.update({ where: { id }, data, select: { id: true, slug: true } });
}

/** Refuses when listings or projects still reference the locality. */
export async function deleteLocalityAdmin(id: string): Promise<{ ok: boolean; reason?: string }> {
  const l = await db.locality.findUniqueOrThrow({ where: { id }, include: { _count: { select: { properties: true, projects: true } } } });
  if (l._count.properties || l._count.projects) {
    return { ok: false, reason: `Move or delete its ${l._count.properties} properties and ${l._count.projects} projects first.` };
  }
  await db.locality.delete({ where: { id } });
  return { ok: true };
}

// ── Agents ────────────────────────────────────────────────────────────────────

export async function listAdminAgents() {
  return db.agent.findMany({
    orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { properties: true, leads: true } } },
  });
}

export async function getAgentForEdit(id: string) {
  return db.agent.findUnique({ where: { id } });
}

export async function saveAgentAdmin(id: string | null, input: AgentAdminInput): Promise<{ id: string }> {
  const data = { ...input, sortOrder: input.sortOrder ?? 0 };
  if (!id) {
    const slug = await uniqueSlug(slugify(input.name), async (s) => Boolean(await db.agent.findUnique({ where: { slug: s }, select: { id: true } })));
    return db.agent.create({ data: { ...data, slug }, select: { id: true } });
  }
  return db.agent.update({ where: { id }, data, select: { id: true } });
}

export async function deleteAgentAdmin(id: string): Promise<void> {
  await db.agent.delete({ where: { id } });
}
