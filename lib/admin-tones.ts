import type { LeadStatus, ListingStatus, OwnerListingStatus, PublishStatus, SiteVisitStatus } from "@/generated/prisma/enums";
import type { PillTone } from "@/components/admin/admin-ui";

export const LEAD_STATUS_TONE: Record<LeadStatus, PillTone> = {
  NEW: "brand",
  CONTACTED: "blue",
  QUALIFIED: "blue",
  SITE_VISIT_SCHEDULED: "amber",
  SITE_VISIT_DONE: "amber",
  NEGOTIATION: "amber",
  WON: "green",
  LOST: "gray",
  SPAM: "red",
};

export const LISTING_STATUS_TONE: Record<ListingStatus, PillTone> = {
  DRAFT: "gray",
  ACTIVE: "green",
  UNDER_OFFER: "amber",
  SOLD: "blue",
  RENTED: "blue",
  INACTIVE: "red",
};

export const SITE_VISIT_STATUS_TONE: Record<SiteVisitStatus, PillTone> = {
  REQUESTED: "brand",
  CONFIRMED: "green",
  RESCHEDULED: "amber",
  COMPLETED: "blue",
  CANCELLED: "gray",
  NO_SHOW: "red",
};

export const OWNER_LISTING_STATUS_TONE: Record<OwnerListingStatus, PillTone> = {
  PENDING_REVIEW: "brand",
  CONTACTED: "blue",
  APPROVED: "green",
  REJECTED: "gray",
  CONVERTED: "green",
};

export const PUBLISH_STATUS_TONE: Record<PublishStatus, PillTone> = {
  DRAFT: "gray",
  PUBLISHED: "green",
  ARCHIVED: "red",
};
