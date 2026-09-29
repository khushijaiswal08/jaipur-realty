// zod schemas for public lead forms (SPEC §19, §26, §27). Server-side validation is the
// source of truth; client-side checks are UX only (SPEC §56).

import { z } from "zod";
import { AreaUnit, PropertyType, TransactionType } from "@/generated/prisma/enums";
import { istDateTimeToUtc } from "@/lib/format/date";
import { isValidIndianMobile, normalizeIndianPhone } from "@/lib/format/phone";
import { parsePrice } from "@/lib/format/price";
import { bookableDates, bookableSlots } from "@/lib/site-visit";

const ID = /^[a-z0-9]{20,32}$/;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const nameField = z.string().trim().min(2, "Please enter your name").max(60, "Please keep the name under 60 characters");

export const mobileField = z
  .string()
  .trim()
  .refine((v) => isValidIndianMobile(v), "Enter a valid 10-digit Indian mobile number")
  .transform((v) => normalizeIndianPhone(v)!);

export const optionalEmailField = z
  .union([z.literal(""), z.email("Enter a valid email address").max(120)])
  .optional()
  .transform((v) => (v ? v.toLowerCase() : undefined));

export const consentField = z.literal("on", "Please tick the box to agree to be contacted");

const optionalId = z
  .string()
  .optional()
  .transform((v) => (v && ID.test(v) ? v : undefined));

/** Hidden context + first-touch attribution sent with every lead form. */
export const trackingFields = {
  propertyId: optionalId,
  projectId: optionalId,
  localityId: optionalId,
  pageUrl: optionalText(500),
  referrer: optionalText(500),
  utmSource: optionalText(100),
  utmMedium: optionalText(100),
  utmCampaign: optionalText(100),
  utmTerm: optionalText(100),
  utmContent: optionalText(100),
};

export const PUBLIC_ENQUIRY_SOURCES = [
  "PROPERTY_ENQUIRY",
  "PROJECT_ENQUIRY",
  "CONTACT_FORM",
  "CALLBACK_REQUEST",
  "BROCHURE_REQUEST",
] as const;

export const enquirySchema = z.object({
  name: nameField,
  phone: mobileField,
  email: optionalEmailField,
  message: optionalText(1000),
  source: z.enum(PUBLIC_ENQUIRY_SOURCES),
  consent: consentField,
  ...trackingFields,
});
export type EnquiryInput = z.infer<typeof enquirySchema>;

export { bookableDates, bookableSlots };

export const siteVisitSchema = z
  .object({
    name: nameField,
    phone: mobileField,
    email: optionalEmailField,
    message: optionalText(500),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
    slot: z.coerce.number({ error: "Choose a time slot" }).int("Choose a time slot"),
    consent: consentField,
    ...trackingFields,
  })
  .superRefine((v, ctx) => {
    if (!bookableDates().includes(v.date)) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "Choose a date within the next two weeks" });
    }
    if (!bookableSlots().includes(v.slot)) {
      ctx.addIssue({ code: "custom", path: ["slot"], message: "Choose one of the available time slots" });
    }
    if (!v.propertyId && !v.projectId) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "Missing property details — please reload the page" });
    }
  })
  .transform((v) => ({ ...v, scheduledAt: istDateTimeToUtc(v.date, v.slot)! }));
export type SiteVisitInput = z.infer<typeof siteVisitSchema>;

export const ownerListingSchema = z.object({
  ownerName: nameField,
  ownerPhone: mobileField,
  ownerEmail: optionalEmailField,
  transactionType: z.enum(TransactionType, "Choose sale or rent"),
  propertyType: z.enum(PropertyType, "Choose a property type"),
  localitySlug: z
    .string()
    .optional()
    .transform((v) => (v && /^[a-z0-9-]{1,80}$/.test(v) ? v : undefined)),
  localityText: optionalText(80),
  address: optionalText(200),
  expectedPrice: z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (!v || !v.trim()) return undefined;
      const n = parsePrice(v);
      if (n === null) {
        ctx.addIssue({ code: "custom", message: "Enter a price like 45L, 1.2Cr or 25000" });
        return z.NEVER;
      }
      return n;
    }),
  area: z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (!v || !v.trim()) return undefined;
      const n = Number(v.replace(/,/g, ""));
      if (!Number.isFinite(n) || n <= 0 || n > 10_000_000) {
        ctx.addIssue({ code: "custom", message: "Enter the area as a number" });
        return z.NEVER;
      }
      return n;
    }),
  areaUnit: z.enum(AreaUnit).default("SQFT"),
  bedrooms: z
    .string()
    .optional()
    .transform((v) => {
      const n = Number(v);
      return v && Number.isInteger(n) && n >= 0 && n <= 20 ? n : undefined;
    }),
  description: optionalText(2000),
  consent: consentField,
  ...trackingFields,
});
export type OwnerListingInput = z.infer<typeof ownerListingSchema>;

/** Field → first error message, for inline display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
