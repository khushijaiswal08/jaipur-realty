"use server";

import { after } from "next/server";
import { LIMITS, rateLimit } from "@/lib/server/rate-limit";
import { getRequestMeta } from "@/lib/server/request-meta";
import { looksAutomated, verifyTurnstile } from "@/lib/server/spam";
import { notifyNewLead } from "@/lib/server/notify";
import { enquirySchema, fieldErrors, ownerListingSchema, siteVisitSchema } from "@/lib/validation/leads";
import { createLead, createOwnerListing, createSiteVisitRequest } from "@/services/lead.service";
import type { ActionState } from "./types";

// Public lead Server Actions (SPEC §19, §26–30). Every action: rate limit → Turnstile (if
// configured) → zod validation → spam heuristics → save → notify after the response.

const ECHO_FIELDS = [
  "name",
  "phone",
  "email",
  "message",
  "date",
  "slot",
  "ownerName",
  "ownerPhone",
  "ownerEmail",
  "transactionType",
  "propertyType",
  "localitySlug",
  "localityText",
  "address",
  "expectedPrice",
  "area",
  "areaUnit",
  "bedrooms",
  "description",
] as const;

function formObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) out[key] = value;
  }
  return out;
}

function echo(raw: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of ECHO_FIELDS) if (raw[k] !== undefined) out[k] = raw[k]!.slice(0, 2000);
  return out;
}

/** Rate limit + Turnstile. Returns an error state to short-circuit, or null to continue. */
async function guard(raw: Record<string, string>): Promise<ActionState | null> {
  const meta = await getRequestMeta();
  const limit = rateLimit(`form:${meta.visitorHash}`, LIMITS.forms.limit, LIMITS.forms.windowMs);
  if (!limit.allowed) {
    return {
      status: "error",
      message: `Too many submissions. Please try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minute(s), or message us on WhatsApp.`,
      values: echo(raw),
      submissionId: Date.now(),
    };
  }
  if (!(await verifyTurnstile(raw["cf-turnstile-response"]))) {
    return { status: "error", message: "Please complete the verification check and try again.", values: echo(raw), submissionId: Date.now() };
  }
  return null;
}

function invalid(raw: Record<string, string>, errors: Record<string, string>): ActionState {
  return { status: "error", message: "Please check the highlighted fields.", fieldErrors: errors, values: echo(raw), submissionId: Date.now() };
}

export async function submitEnquiry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formObject(formData);
  const blocked = await guard(raw);
  if (blocked) return blocked;

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) return invalid(raw, fieldErrors(parsed.error));
  const data = parsed.data;
  const isSpam = looksAutomated({ honeypot: raw.website, startedAt: raw.startedAt });

  const lead = await createLead({ ...data, isSpam });
  if (!isSpam) {
    after(() =>
      notifyNewLead({
        kind: "lead",
        leadId: lead.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        message: data.message,
        source: data.source,
        propertyTitle: lead.propertyTitle,
        propertyRef: lead.propertyRef,
        projectName: lead.projectName,
        deduped: lead.deduped,
      }),
    );
  }
  return {
    status: "success",
    message:
      data.source === "BROCHURE_REQUEST"
        ? "Thanks! We'll share the brochure and price sheet on WhatsApp shortly."
        : data.source === "CALLBACK_REQUEST"
          ? "Thanks! We'll call you back shortly."
          : "Thanks! Your enquiry has been received — we'll get in touch shortly.",
    submissionId: Date.now(),
  };
}

export async function submitSiteVisit(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formObject(formData);
  const blocked = await guard(raw);
  if (blocked) return blocked;

  const parsed = siteVisitSchema.safeParse(raw);
  if (!parsed.success) return invalid(raw, fieldErrors(parsed.error));
  const data = parsed.data;
  const isSpam = looksAutomated({ honeypot: raw.website, startedAt: raw.startedAt });

  const lead = await createSiteVisitRequest({ ...data, source: "SITE_VISIT_REQUEST", isSpam });
  if (!isSpam) {
    after(() =>
      notifyNewLead({
        kind: "site_visit",
        leadId: lead.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        message: data.message,
        source: "SITE_VISIT_REQUEST",
        propertyTitle: lead.propertyTitle,
        propertyRef: lead.propertyRef,
        projectName: lead.projectName,
        scheduledAt: data.scheduledAt,
        deduped: lead.deduped,
      }),
    );
  }
  return {
    status: "success",
    message: "Visit requested! We'll call or WhatsApp you to confirm the slot.",
    data: { scheduledAt: data.scheduledAt.toISOString() },
    submissionId: Date.now(),
  };
}

export async function submitOwnerListing(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formObject(formData);
  const blocked = await guard(raw);
  if (blocked) return blocked;

  const parsed = ownerListingSchema.safeParse(raw);
  if (!parsed.success) return invalid(raw, fieldErrors(parsed.error));
  const data = parsed.data;
  const isSpam = looksAutomated({ honeypot: raw.website, startedAt: raw.startedAt });

  const { leadId } = await createOwnerListing({ ...data, isSpam });
  if (!isSpam) {
    after(() =>
      notifyNewLead({
        kind: "owner_listing",
        leadId,
        name: data.ownerName,
        phone: data.ownerPhone,
        email: data.ownerEmail,
        message: [
          `${data.transactionType === "RENT" ? "For rent" : "For sale"}: ${data.propertyType.toLowerCase().replace(/_/g, " ")}`,
          data.localitySlug ?? data.localityText,
          data.expectedPrice ? `Expected ₹${data.expectedPrice.toLocaleString("en-IN")}` : null,
          data.description,
        ]
          .filter(Boolean)
          .join(" · "),
        source: "OWNER_LISTING",
      }),
    );
  }
  return {
    status: "success",
    message: "Thank you! Our team will call you to verify the details before anything is published.",
    submissionId: Date.now(),
  };
}
