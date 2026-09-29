import "server-only";

import type { AreaUnit, LeadSource, PropertyType } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface LeadTracking {
  propertyId?: string;
  projectId?: string;
  localityId?: string;
  pageUrl?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

export interface NewLeadInput extends LeadTracking {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: LeadSource;
  isSpam?: boolean;
  preferredDate?: Date;
}

export interface LeadResult {
  id: string;
  deduped: boolean;
  /** Context for notifications. */
  propertyTitle?: string;
  propertyRef?: string;
  projectName?: string;
}

/**
 * Only keep references that actually exist and are public, and derive the transaction type
 * and locality from the listing. Client-supplied ids are never trusted blindly (SPEC §56).
 */
async function resolveContext(input: LeadTracking) {
  const [property, project, locality] = await Promise.all([
    input.propertyId
      ? db.property.findUnique({
          where: { id: input.propertyId },
          select: { id: true, title: true, refCode: true, localityId: true, transactionType: true, projectId: true, agentId: true },
        })
      : null,
    input.projectId ? db.project.findUnique({ where: { id: input.projectId }, select: { id: true, name: true, localityId: true } }) : null,
    input.localityId ? db.locality.findUnique({ where: { id: input.localityId }, select: { id: true } }) : null,
  ]);
  return {
    property,
    project,
    propertyId: property?.id ?? null,
    projectId: project?.id ?? property?.projectId ?? null,
    localityId: locality?.id ?? property?.localityId ?? project?.localityId ?? null,
    transactionType: property?.transactionType ?? null,
    assignedAgentId: property?.agentId ?? null,
  };
}

/**
 * Creates a lead, or — when the same phone enquired about the same listing within 24 hours —
 * appends a REPEAT_ENQUIRY activity to the existing lead instead (SPEC §26).
 */
export async function createLead(input: NewLeadInput): Promise<LeadResult> {
  const ctx = await resolveContext(input);
  const meta = { propertyTitle: ctx.property?.title, propertyRef: ctx.property?.refCode, projectName: ctx.project?.name };

  if (!input.isSpam && (ctx.propertyId || ctx.projectId)) {
    const existing = await db.lead.findFirst({
      where: {
        phone: input.phone,
        isSpam: false,
        createdAt: { gte: new Date(Date.now() - DEDUPE_WINDOW_MS) },
        ...(ctx.propertyId ? { propertyId: ctx.propertyId } : { projectId: ctx.projectId }),
      },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });
    if (existing) {
      await db.leadActivity.create({
        data: {
          leadId: existing.id,
          type: "REPEAT_ENQUIRY",
          body: [`Repeat ${input.source.toLowerCase().replace(/_/g, " ")} from ${input.name}`, input.message].filter(Boolean).join(": "),
        },
      });
      await db.lead.update({ where: { id: existing.id }, data: { updatedAt: new Date() } });
      return { id: existing.id, deduped: true, ...meta };
    }
  }

  const lead = await db.lead.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      message: input.message ?? null,
      source: input.source,
      status: input.isSpam ? "SPAM" : input.source === "SITE_VISIT_REQUEST" ? "SITE_VISIT_SCHEDULED" : "NEW",
      isSpam: input.isSpam ?? false,
      propertyId: ctx.propertyId,
      projectId: ctx.projectId,
      localityId: ctx.localityId,
      assignedAgentId: ctx.assignedAgentId,
      transactionType: ctx.transactionType,
      preferredDate: input.preferredDate ?? null,
      pageUrl: input.pageUrl ?? null,
      referrer: input.referrer ?? null,
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
      utmTerm: input.utmTerm ?? null,
      utmContent: input.utmContent ?? null,
      consentAt: new Date(),
    },
    select: { id: true },
  });
  return { id: lead.id, deduped: false, ...meta };
}

/** Site visit = lead (SITE_VISIT_REQUEST) + SiteVisit (REQUESTED) — SPEC §27. */
export async function createSiteVisitRequest(input: NewLeadInput & { scheduledAt: Date }): Promise<LeadResult> {
  const lead = await createLead({ ...input, source: "SITE_VISIT_REQUEST", preferredDate: input.scheduledAt });
  if (input.isSpam) return lead;
  const ctx = await resolveContext(input);
  await db.siteVisit.create({
    data: {
      leadId: lead.id,
      propertyId: ctx.propertyId,
      projectId: ctx.projectId,
      agentId: ctx.assignedAgentId,
      scheduledAt: input.scheduledAt,
      status: "REQUESTED",
      notes: input.message ?? null,
    },
  });
  if (lead.deduped) {
    await db.lead.update({ where: { id: lead.id }, data: { status: "SITE_VISIT_SCHEDULED", preferredDate: input.scheduledAt } });
  }
  return lead;
}

export interface NewOwnerListingInput extends LeadTracking {
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  transactionType: "SALE" | "RENT";
  propertyType: PropertyType;
  localitySlug?: string;
  localityText?: string;
  address?: string;
  expectedPrice?: number;
  area?: number;
  areaUnit: AreaUnit;
  bedrooms?: number;
  description?: string;
  imageUrls?: string[];
  isSpam?: boolean;
}

/** Owner listing + companion lead (source OWNER_LISTING). Never auto-published (SPEC §19). */
export async function createOwnerListing(input: NewOwnerListingInput): Promise<{ listingId: string; leadId: string }> {
  const locality = input.localitySlug
    ? await db.locality.findFirst({ where: { slug: input.localitySlug }, select: { id: true, cityId: true, name: true } })
    : null;
  const lead = await createLead({
    name: input.ownerName,
    phone: input.ownerPhone,
    email: input.ownerEmail,
    message: `Owner listing: ${input.transactionType === "RENT" ? "for rent" : "for sale"} — ${input.propertyType.toLowerCase().replace(/_/g, " ")} in ${locality?.name ?? input.localityText ?? "Jaipur"}`,
    source: "OWNER_LISTING",
    isSpam: input.isSpam,
    localityId: locality?.id,
    pageUrl: input.pageUrl,
    referrer: input.referrer,
    utmSource: input.utmSource,
    utmMedium: input.utmMedium,
    utmCampaign: input.utmCampaign,
    utmTerm: input.utmTerm,
    utmContent: input.utmContent,
  });
  const listing = await db.ownerListing.create({
    data: {
      ownerName: input.ownerName,
      ownerPhone: input.ownerPhone,
      ownerEmail: input.ownerEmail ?? null,
      transactionType: input.transactionType,
      propertyType: input.propertyType,
      cityId: locality?.cityId ?? null,
      localityId: locality?.id ?? null,
      localityText: locality ? null : (input.localityText ?? null),
      address: input.address ?? null,
      expectedPrice: input.expectedPrice !== undefined ? BigInt(Math.round(input.expectedPrice)) : null,
      area: input.area ?? null,
      areaUnit: input.areaUnit,
      bedrooms: input.bedrooms ?? null,
      description: input.description ?? null,
      imageUrls: input.imageUrls ?? [],
      status: input.isSpam ? "REJECTED" : "PENDING_REVIEW",
      reviewNotes: input.isSpam ? "Automatically flagged as spam" : null,
      leadId: lead.deduped ? null : lead.id,
      consentAt: new Date(),
    },
    select: { id: true },
  });
  return { listingId: listing.id, leadId: lead.id };
}
