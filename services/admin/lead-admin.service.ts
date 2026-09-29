import "server-only";

import type { LeadActivityType, LeadSource, LeadStatus, OwnerListingStatus, Prisma, SiteVisitStatus } from "@/generated/prisma/client";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, PROPERTY_TYPE_CATEGORY, SITE_VISIT_STATUS_LABELS } from "@/lib/constants/enums";
import { db } from "@/lib/db";
import { toSqft } from "@/lib/format/area";
import { formatDateTime } from "@/lib/format/date";
import { nextRefCode } from "./property-admin.service";
import { propertySlug } from "@/lib/utils";

// ── Leads ─────────────────────────────────────────────────────────────────────

export interface LeadFilters {
  q?: string;
  status?: LeadStatus;
  source?: LeadSource;
  agentId?: string;
  from?: Date;
  to?: Date;
  includeSpam?: boolean;
  page: number;
}

export function leadWhere(f: Omit<LeadFilters, "page">): Prisma.LeadWhereInput {
  const digits = f.q?.replace(/\D/g, "");
  return {
    ...(f.status ? { status: f.status } : f.includeSpam ? {} : { isSpam: false }),
    ...(f.source ? { source: f.source } : {}),
    ...(f.agentId ? { assignedAgentId: f.agentId === "none" ? null : f.agentId } : {}),
    ...(f.from || f.to ? { createdAt: { ...(f.from ? { gte: f.from } : {}), ...(f.to ? { lte: f.to } : {}) } } : {}),
    ...(f.q
      ? {
          OR: [
            { name: { contains: f.q, mode: "insensitive" } },
            { email: { contains: f.q, mode: "insensitive" } },
            ...(digits && digits.length >= 4 ? [{ phone: { contains: digits.slice(-10) } }] : []),
            { property: { refCode: { equals: f.q.toUpperCase() } } },
          ],
        }
      : {}),
  };
}

export async function listLeads(f: LeadFilters, pageSize = 25) {
  const where = leadWhere(f);
  const [total, rows] = await Promise.all([
    db.lead.count({ where }),
    db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (f.page - 1) * pageSize,
      take: pageSize,
      include: {
        property: { select: { title: true, refCode: true } },
        project: { select: { name: true } },
        assignedAgent: { select: { name: true } },
        _count: { select: { activities: true } },
      },
    }),
  ]);
  return { total, totalPages: Math.max(1, Math.ceil(total / pageSize)), rows };
}

export async function getLead(id: string) {
  return db.lead.findUnique({
    where: { id },
    include: {
      property: { select: { id: true, title: true, refCode: true, slug: true } },
      project: { select: { id: true, name: true, slug: true } },
      locality: { select: { name: true, slug: true } },
      assignedAgent: { select: { id: true, name: true } },
      activities: { orderBy: { createdAt: "desc" }, include: { createdBy: { select: { name: true } } } },
      siteVisits: { orderBy: { scheduledAt: "desc" } },
      ownerListing: { select: { id: true, status: true } },
    },
  });
}

export async function updateLead(
  id: string,
  data: { status: LeadStatus; assignedAgentId: string | null; followUpAt: Date | null },
  adminId: string,
): Promise<void> {
  const before = await db.lead.findUniqueOrThrow({ where: { id }, select: { status: true, assignedAgentId: true } });
  const activities: Prisma.LeadActivityCreateManyInput[] = [];
  if (before.status !== data.status) {
    activities.push({ leadId: id, type: "STATUS_CHANGE", body: `${LEAD_STATUS_LABELS[before.status]} → ${LEAD_STATUS_LABELS[data.status]}`, createdByAdminId: adminId });
  }
  if (before.assignedAgentId !== data.assignedAgentId) {
    const agent = data.assignedAgentId ? await db.agent.findUnique({ where: { id: data.assignedAgentId }, select: { name: true } }) : null;
    activities.push({ leadId: id, type: "ASSIGNMENT", body: agent ? `Assigned to ${agent.name}` : "Unassigned", createdByAdminId: adminId });
  }
  await db.$transaction([
    db.lead.update({ where: { id }, data: { ...data, isSpam: data.status === "SPAM" } }),
    ...(activities.length ? [db.leadActivity.createMany({ data: activities })] : []),
  ]);
}

export async function addLeadActivity(leadId: string, type: LeadActivityType, body: string, adminId: string) {
  await db.leadActivity.create({ data: { leadId, type, body, createdByAdminId: adminId } });
  // Contacting a NEW lead moves it to CONTACTED automatically.
  if (type === "CALL" || type === "WHATSAPP" || type === "EMAIL" || type === "MEETING") {
    await db.lead.updateMany({ where: { id: leadId, status: "NEW" }, data: { status: "CONTACTED" } });
  }
}

export async function deleteLead(id: string) {
  await db.lead.delete({ where: { id } });
}

export async function createManualLead(data: {
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: LeadSource;
  propertyId: string | null;
  assignedAgentId: string | null;
}, adminId: string): Promise<string> {
  const lead = await db.lead.create({
    data: { ...data, status: "NEW", consentAt: new Date() },
    select: { id: true },
  });
  await db.leadActivity.create({ data: { leadId: lead.id, type: "NOTE", body: `Added manually (${LEAD_SOURCE_LABELS[data.source]})`, createdByAdminId: adminId } });
  return lead.id;
}

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  // Neutralise spreadsheet formula injection and quote everything.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function exportLeadsCsv(f: Omit<LeadFilters, "page">): Promise<string> {
  const rows = await db.lead.findMany({
    where: leadWhere(f),
    orderBy: { createdAt: "desc" },
    take: 10_000,
    include: { property: { select: { refCode: true, title: true } }, project: { select: { name: true } }, locality: { select: { name: true } }, assignedAgent: { select: { name: true } } },
  });
  const header = ["Created (IST)", "Name", "Phone", "Email", "Source", "Status", "Property ref", "Property", "Project", "Locality", "Agent", "Message", "UTM source", "UTM medium", "UTM campaign", "Page URL"];
  const lines = rows.map((l) =>
    [
      formatDateTime(l.createdAt),
      l.name,
      l.phone,
      l.email,
      LEAD_SOURCE_LABELS[l.source],
      LEAD_STATUS_LABELS[l.status],
      l.property?.refCode,
      l.property?.title,
      l.project?.name,
      l.locality?.name,
      l.assignedAgent?.name,
      l.message,
      l.utmSource,
      l.utmMedium,
      l.utmCampaign,
      l.pageUrl,
    ]
      .map(csvCell)
      .join(","),
  );
  return `﻿${[header.map(csvCell).join(","), ...lines].join("\r\n")}`;
}

// ── Site visits ───────────────────────────────────────────────────────────────

export async function listSiteVisits(when: "upcoming" | "past" | "all", status?: SiteVisitStatus) {
  const now = new Date();
  return db.siteVisit.findMany({
    where: {
      ...(when === "upcoming" ? { scheduledAt: { gte: new Date(now.getTime() - 2 * 3600_000) } } : when === "past" ? { scheduledAt: { lt: now } } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { scheduledAt: when === "past" ? "desc" : "asc" },
    take: 200,
    include: {
      lead: { select: { id: true, name: true, phone: true } },
      property: { select: { title: true, refCode: true, slug: true } },
      project: { select: { name: true, slug: true } },
      agent: { select: { name: true } },
    },
  });
}

export async function updateSiteVisit(id: string, data: { status: SiteVisitStatus; scheduledAt: Date | null; feedback: string | null }, adminId: string) {
  const before = await db.siteVisit.findUniqueOrThrow({ where: { id }, select: { status: true, scheduledAt: true, leadId: true } });
  const rescheduled = data.scheduledAt && data.scheduledAt.getTime() !== before.scheduledAt.getTime();
  const status = rescheduled && data.status === before.status ? "RESCHEDULED" : data.status;
  await db.siteVisit.update({
    where: { id },
    data: { status, ...(rescheduled ? { scheduledAt: data.scheduledAt! } : {}), feedback: data.feedback },
  });
  const notes = [
    status !== before.status ? `Visit ${SITE_VISIT_STATUS_LABELS[before.status]} → ${SITE_VISIT_STATUS_LABELS[status]}` : null,
    rescheduled ? `Rescheduled to ${formatDateTime(data.scheduledAt!)}` : null,
  ].filter(Boolean);
  if (notes.length) await db.leadActivity.create({ data: { leadId: before.leadId, type: "STATUS_CHANGE", body: notes.join(" · "), createdByAdminId: adminId } });
  if (status === "COMPLETED") await db.lead.updateMany({ where: { id: before.leadId, status: { in: ["NEW", "CONTACTED", "QUALIFIED", "SITE_VISIT_SCHEDULED"] } }, data: { status: "SITE_VISIT_DONE" } });
}

// ── Owner listings ────────────────────────────────────────────────────────────

export async function listOwnerListings(status?: OwnerListingStatus) {
  return db.ownerListing.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { locality: { select: { name: true } }, convertedProperty: { select: { id: true, refCode: true } } },
  });
}

export async function getOwnerListing(id: string) {
  return db.ownerListing.findUnique({
    where: { id },
    include: { locality: { select: { id: true, name: true } }, convertedProperty: { select: { id: true, refCode: true, title: true } }, lead: { select: { id: true } } },
  });
}

export async function updateOwnerListing(id: string, data: { status: OwnerListingStatus; reviewNotes: string | null }) {
  await db.ownerListing.update({ where: { id }, data });
}

/** Creates a DRAFT property from an owner submission (SPEC §19, §45). */
export async function convertOwnerListing(id: string): Promise<string> {
  const o = await db.ownerListing.findUniqueOrThrow({ where: { id } });
  if (o.convertedPropertyId) return o.convertedPropertyId;
  const locality = o.localityId
    ? await db.locality.findUniqueOrThrow({ where: { id: o.localityId }, select: { id: true, cityId: true, name: true } })
    : await db.locality.findFirstOrThrow({ orderBy: { sortOrder: "asc" }, select: { id: true, cityId: true, name: true } });
  const category = PROPERTY_TYPE_CATEGORY[o.propertyType];
  const areaSqft = o.area ? toSqft(o.area, o.areaUnit) : null;
  const refCode = await nextRefCode();
  const bhk = o.bedrooms ? `${o.bedrooms} BHK ` : "";
  const noun = o.propertyType.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const title = `${bhk}${noun} ${o.transactionType === "RENT" ? "for Rent" : "for Sale"} in ${o.localityText ?? locality.name}`.slice(0, 120);

  const property = await db.property.create({
    data: {
      refCode,
      slug: propertySlug(title, refCode),
      title,
      description: o.description?.trim() || "Description to be added after verification.",
      transactionType: o.transactionType,
      propertyType: o.propertyType,
      category,
      status: "DRAFT",
      listedBy: "OWNER",
      price: o.expectedPrice,
      priceOnRequest: o.expectedPrice === null,
      bedrooms: o.bedrooms,
      ...(category === "LAND" ? { plotArea: areaSqft, areaDisplayUnit: o.areaUnit } : { builtUpArea: areaSqft }),
      primaryAreaSqft: areaSqft,
      address: o.address,
      cityId: locality.cityId,
      localityId: locality.id,
    },
    select: { id: true },
  });
  await db.ownerListing.update({ where: { id }, data: { status: "CONVERTED", convertedPropertyId: property.id } });
  return property.id;
}
