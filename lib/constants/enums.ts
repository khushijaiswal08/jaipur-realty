// Display labels for every enum. SPEC §12: labels are never derived by string manipulation.
// Imports come from the browser-safe `enums` entrypoint so client components can use them.

import type {
  AdminRole,
  AmenityCategory,
  AreaUnit,
  ConstructionStatus,
  Facing,
  FaqScope,
  Furnishing,
  ImageKind,
  LeadActivityType,
  LeadSource,
  LeadStatus,
  ListedBy,
  ListingStatus,
  OwnerListingStatus,
  OwnershipType,
  PropertyCategory,
  PropertyType,
  PublishStatus,
  SiteVisitStatus,
  TenantPreference,
  TransactionType,
} from "@/generated/prisma/enums";

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  SALE: "Sale",
  RENT: "Rent",
};

/** Verb form for headings: "for Sale" / "for Rent". */
export const TRANSACTION_TYPE_PHRASE: Record<TransactionType, string> = {
  SALE: "for Sale",
  RENT: "for Rent",
};

export const PROPERTY_CATEGORY_LABELS: Record<PropertyCategory, string> = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
  LAND: "Land & Plots",
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  APARTMENT: "Apartment / Flat",
  BUILDER_FLOOR: "Builder Floor",
  INDEPENDENT_HOUSE: "Independent House",
  VILLA: "Villa",
  PENTHOUSE: "Penthouse",
  STUDIO: "Studio / 1 RK",
  FARMHOUSE: "Farmhouse",
  RESIDENTIAL_PLOT: "Residential Plot",
  COMMERCIAL_PLOT: "Commercial Plot",
  AGRICULTURAL_LAND: "Agricultural Land",
  OFFICE_SPACE: "Office Space",
  SHOP: "Shop",
  SHOWROOM: "Showroom",
  WAREHOUSE: "Warehouse / Godown",
};

/** Short singular nouns for titles and SEO ("3 BHK Apartment for Sale"). */
export const PROPERTY_TYPE_NOUNS: Record<PropertyType, string> = {
  APARTMENT: "Apartment",
  BUILDER_FLOOR: "Builder Floor",
  INDEPENDENT_HOUSE: "Independent House",
  VILLA: "Villa",
  PENTHOUSE: "Penthouse",
  STUDIO: "Studio Apartment",
  FARMHOUSE: "Farmhouse",
  RESIDENTIAL_PLOT: "Residential Plot",
  COMMERCIAL_PLOT: "Commercial Plot",
  AGRICULTURAL_LAND: "Agricultural Land",
  OFFICE_SPACE: "Office Space",
  SHOP: "Shop",
  SHOWROOM: "Showroom",
  WAREHOUSE: "Warehouse",
};

/** URL slugs for property types (filters, SEO landings). */
export const PROPERTY_TYPE_SLUGS: Record<PropertyType, string> = {
  APARTMENT: "apartment",
  BUILDER_FLOOR: "builder-floor",
  INDEPENDENT_HOUSE: "independent-house",
  VILLA: "villa",
  PENTHOUSE: "penthouse",
  STUDIO: "studio",
  FARMHOUSE: "farmhouse",
  RESIDENTIAL_PLOT: "residential-plot",
  COMMERCIAL_PLOT: "commercial-plot",
  AGRICULTURAL_LAND: "agricultural-land",
  OFFICE_SPACE: "office-space",
  SHOP: "shop",
  SHOWROOM: "showroom",
  WAREHOUSE: "warehouse",
};

/** SPEC §12 — category is derived from type on save. */
export const PROPERTY_TYPE_CATEGORY: Record<PropertyType, PropertyCategory> = {
  APARTMENT: "RESIDENTIAL",
  BUILDER_FLOOR: "RESIDENTIAL",
  INDEPENDENT_HOUSE: "RESIDENTIAL",
  VILLA: "RESIDENTIAL",
  PENTHOUSE: "RESIDENTIAL",
  STUDIO: "RESIDENTIAL",
  FARMHOUSE: "RESIDENTIAL",
  RESIDENTIAL_PLOT: "LAND",
  COMMERCIAL_PLOT: "LAND",
  AGRICULTURAL_LAND: "LAND",
  OFFICE_SPACE: "COMMERCIAL",
  SHOP: "COMMERCIAL",
  SHOWROOM: "COMMERCIAL",
  WAREHOUSE: "COMMERCIAL",
};

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  UNDER_OFFER: "Under offer",
  SOLD: "Sold",
  RENTED: "Rented",
  INACTIVE: "Inactive",
};

/** Statuses shown in public search results. */
export const PUBLIC_SEARCH_STATUSES = ["ACTIVE", "UNDER_OFFER"] as const satisfies readonly ListingStatus[];
/** Statuses whose detail page is publicly reachable (SOLD/RENTED show a banner). */
export const PUBLIC_DETAIL_STATUSES = [
  "ACTIVE",
  "UNDER_OFFER",
  "SOLD",
  "RENTED",
] as const satisfies readonly ListingStatus[];

export const CONSTRUCTION_STATUS_LABELS: Record<ConstructionStatus, string> = {
  UPCOMING: "Upcoming",
  NEW_LAUNCH: "New launch",
  UNDER_CONSTRUCTION: "Under construction",
  READY_TO_MOVE: "Ready to move",
};

export const FURNISHING_LABELS: Record<Furnishing, string> = {
  UNFURNISHED: "Unfurnished",
  SEMI_FURNISHED: "Semi-furnished",
  FULLY_FURNISHED: "Fully furnished",
};

export const FACING_LABELS: Record<Facing, string> = {
  NORTH: "North",
  NORTH_EAST: "North-East",
  EAST: "East",
  SOUTH_EAST: "South-East",
  SOUTH: "South",
  SOUTH_WEST: "South-West",
  WEST: "West",
  NORTH_WEST: "North-West",
};

export const OWNERSHIP_TYPE_LABELS: Record<OwnershipType, string> = {
  FREEHOLD: "Freehold",
  LEASEHOLD: "Leasehold",
  COOPERATIVE_SOCIETY: "Co-operative society",
  POWER_OF_ATTORNEY: "Power of attorney",
};

export const LISTED_BY_LABELS: Record<ListedBy, string> = {
  AGENCY: "Agency",
  OWNER: "Owner",
  BUILDER: "Builder",
};

export const TENANT_PREFERENCE_LABELS: Record<TenantPreference, string> = {
  ANY: "Anyone",
  FAMILY: "Family",
  BACHELORS: "Bachelors",
  COMPANY_LEASE: "Company lease",
};

export const AREA_UNIT_SHORT_LABELS: Record<AreaUnit, string> = {
  SQFT: "sq ft",
  SQYD: "sq yd",
  SQM: "sq m",
  ACRE: "acre",
  HECTARE: "hectare",
  BIGHA: "bigha",
};

export const IMAGE_KIND_LABELS: Record<ImageKind, string> = {
  PHOTO: "Photos",
  FLOOR_PLAN: "Floor plans",
  MASTER_PLAN: "Master plan",
  LOCATION_MAP: "Location map",
};

export const AMENITY_CATEGORY_LABELS: Record<AmenityCategory, string> = {
  BASIC: "Basics",
  SECURITY: "Safety & security",
  RECREATION: "Recreation",
  HEALTH_FITNESS: "Health & fitness",
  CONVENIENCE: "Convenience",
  ENVIRONMENT: "Environment",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  SITE_VISIT_SCHEDULED: "Site visit scheduled",
  SITE_VISIT_DONE: "Site visit done",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
  SPAM: "Spam",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  PROPERTY_ENQUIRY: "Property enquiry",
  PROJECT_ENQUIRY: "Project enquiry",
  CONTACT_FORM: "Contact form",
  CALLBACK_REQUEST: "Callback request",
  SITE_VISIT_REQUEST: "Site visit request",
  BROCHURE_REQUEST: "Brochure request",
  OWNER_LISTING: "Owner listing",
  WHATSAPP: "WhatsApp",
  PHONE_CALL: "Phone call",
  WALK_IN: "Walk-in",
  REFERRAL: "Referral",
  OTHER: "Other",
};

/** Sources staff can enter manually in the admin panel. */
export const MANUAL_LEAD_SOURCES = [
  "WHATSAPP",
  "PHONE_CALL",
  "WALK_IN",
  "REFERRAL",
  "OTHER",
] as const satisfies readonly LeadSource[];

export const LEAD_ACTIVITY_TYPE_LABELS: Record<LeadActivityType, string> = {
  NOTE: "Note",
  CALL: "Call",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  MEETING: "Meeting",
  STATUS_CHANGE: "Status change",
  ASSIGNMENT: "Assignment",
  REPEAT_ENQUIRY: "Repeat enquiry",
};

export const SITE_VISIT_STATUS_LABELS: Record<SiteVisitStatus, string> = {
  REQUESTED: "Requested",
  CONFIRMED: "Confirmed",
  RESCHEDULED: "Rescheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
};

export const OWNER_LISTING_STATUS_LABELS: Record<OwnerListingStatus, string> = {
  PENDING_REVIEW: "Pending review",
  CONTACTED: "Contacted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CONVERTED: "Converted",
};

export const PUBLISH_STATUS_LABELS: Record<PublishStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
};

export const FAQ_SCOPE_LABELS: Record<FaqScope, string> = {
  GENERAL: "General",
  BUYING: "Buying",
  RENTING: "Renting",
  SELLING: "Selling",
  HOME_LOANS: "Home loans",
  LEGAL: "Legal",
  PROPERTY: "Specific property",
  PROJECT: "Specific project",
  LOCALITY: "Specific locality",
};

/** Turns a label map into <select> options, preserving declaration order. */
export function toOptions<T extends string>(labels: Record<T, string>): Array<{ value: T; label: string }> {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}
