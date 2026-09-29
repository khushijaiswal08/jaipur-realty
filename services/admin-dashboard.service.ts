import "server-only";

import type { LeadSource, LeadStatus, SiteVisitStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { istDateTimeToUtc, toIstDateString } from "@/lib/format/date";

const DAY = 86_400_000;

export interface DashboardStats {
  leadsToday: number;
  leads7d: number;
  newLeads: number;
  leadsBySource: Array<{ source: LeadSource; count: number }>;
  pendingOwnerListings: number;
  activeListings: { sale: number; rent: number };
  draftListings: number;
  upcomingVisits: Array<{ id: string; leadId: string; scheduledAt: string; status: SiteVisitStatus; name: string; phone: string; subject: string | null }>;
  topViewed: Array<{ id: string; title: string; refCode: string; views: number; source: "views7d" | "lifetime" }>;
  recentLeads: Array<{ id: string; name: string; phone: string; source: LeadSource; status: LeadStatus; createdAt: string; subject: string | null }>;
}

/** Start of today in IST, as a UTC Date. */
function istStartOfToday(now = new Date()): Date {
  return istDateTimeToUtc(toIstDateString(now), 0)!;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const since7d = new Date(now.getTime() - 7 * DAY);
  const notSpam = { isSpam: false };

  const [leadsToday, leads7d, newLeads, bySource, pendingOwnerListings, listingGroups, draftListings, visits, views, recent] = await Promise.all([
    db.lead.count({ where: { ...notSpam, createdAt: { gte: istStartOfToday(now) } } }),
    db.lead.count({ where: { ...notSpam, createdAt: { gte: since7d } } }),
    db.lead.count({ where: { ...notSpam, status: "NEW" } }),
    db.lead.groupBy({ by: ["source"], where: { ...notSpam, createdAt: { gte: since7d } }, _count: { _all: true } }),
    db.ownerListing.count({ where: { status: "PENDING_REVIEW" } }),
    db.property.groupBy({ by: ["transactionType"], where: { status: { in: ["ACTIVE", "UNDER_OFFER"] } }, _count: { _all: true } }),
    db.property.count({ where: { status: "DRAFT" } }),
    db.siteVisit.findMany({
      where: { scheduledAt: { gte: istStartOfToday(now), lte: new Date(now.getTime() + 7 * DAY) }, status: { in: ["REQUESTED", "CONFIRMED", "RESCHEDULED"] } },
      orderBy: { scheduledAt: "asc" },
      take: 8,
      include: { lead: { select: { name: true, phone: true } }, property: { select: { title: true } }, project: { select: { name: true } } },
    }),
    db.propertyView.groupBy({
      by: ["propertyId"],
      where: { viewedAt: { gte: since7d }, propertyId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { propertyId: "desc" } },
      take: 5,
    }),
    db.lead.findMany({
      where: notSpam,
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { property: { select: { title: true } }, project: { select: { name: true } } },
    }),
  ]);

  let topViewed: DashboardStats["topViewed"];
  if (views.length) {
    const props = await db.property.findMany({
      where: { id: { in: views.map((v) => v.propertyId!) } },
      select: { id: true, title: true, refCode: true },
    });
    topViewed = views
      .map((v) => {
        const p = props.find((x) => x.id === v.propertyId);
        return p ? { ...p, views: v._count._all, source: "views7d" as const } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  } else {
    // Before view tracking has data, fall back to lifetime counters.
    const props = await db.property.findMany({
      where: { status: { in: ["ACTIVE", "UNDER_OFFER"] } },
      orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
      take: 5,
      select: { id: true, title: true, refCode: true, viewCount: true },
    });
    topViewed = props.map((p) => ({ id: p.id, title: p.title, refCode: p.refCode, views: p.viewCount, source: "lifetime" as const }));
  }

  return {
    leadsToday,
    leads7d,
    newLeads,
    leadsBySource: bySource.map((g) => ({ source: g.source, count: g._count._all })).sort((a, b) => b.count - a.count),
    pendingOwnerListings,
    activeListings: {
      sale: listingGroups.find((g) => g.transactionType === "SALE")?._count._all ?? 0,
      rent: listingGroups.find((g) => g.transactionType === "RENT")?._count._all ?? 0,
    },
    draftListings,
    upcomingVisits: visits.map((v) => ({
      id: v.id,
      leadId: v.leadId,
      scheduledAt: v.scheduledAt.toISOString(),
      status: v.status,
      name: v.lead.name,
      phone: v.lead.phone,
      subject: v.property?.title ?? v.project?.name ?? null,
    })),
    topViewed,
    recentLeads: recent.map((l) => ({
      id: l.id,
      name: l.name,
      phone: l.phone,
      source: l.source,
      status: l.status,
      createdAt: l.createdAt.toISOString(),
      subject: l.property?.title ?? l.project?.name ?? null,
    })),
  };
}

/** Counts for sidebar badges. */
export async function getAdminBadges(): Promise<Record<string, number>> {
  const [newLeads, pendingListings, requestedVisits] = await Promise.all([
    db.lead.count({ where: { status: "NEW", isSpam: false } }),
    db.ownerListing.count({ where: { status: "PENDING_REVIEW" } }),
    db.siteVisit.count({ where: { status: "REQUESTED", scheduledAt: { gte: new Date() } } }),
  ]);
  return { "/admin/leads": newLeads, "/admin/owner-listings": pendingListings, "/admin/site-visits": requestedVisits };
}
