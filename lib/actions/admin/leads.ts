"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { LeadActivityType, LeadStatus, OwnerListingStatus, SiteVisitStatus } from "@/generated/prisma/enums";
import { assertAdmin, AuthError } from "@/lib/auth/session";
import type { ActionState } from "@/lib/actions/types";
import { MANUAL_LEAD_SOURCES } from "@/lib/constants/enums";
import { istDateTimeToUtc } from "@/lib/format/date";
import { CACHE_TAGS, revalidatePublicSite } from "@/lib/server/revalidate";
import { optionalDate, optionalId, optionalString } from "@/lib/validation/form-helpers";
import { fieldErrors, mobileField, nameField, optionalEmailField } from "@/lib/validation/leads";
import {
  addLeadActivity,
  convertOwnerListing,
  createManualLead,
  deleteLead,
  updateLead,
  updateOwnerListing,
  updateSiteVisit,
} from "@/services/admin/lead-admin.service";
import { logAudit } from "@/services/audit.service";

const fail = (e: unknown): ActionState => ({
  status: "error",
  message: e instanceof AuthError ? e.message : "Something went wrong.",
  submissionId: Date.now(),
});

export async function updateLeadAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await assertAdmin("manageLeads");
    const parsed = z
      .object({ status: z.enum(LeadStatus), assignedAgentId: optionalId, followUpAt: optionalDate })
      .safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { status: "error", message: "Invalid values.", fieldErrors: fieldErrors(parsed.error), submissionId: Date.now() };
    await updateLead(id, parsed.data, admin.id);
    await logAudit(admin.id, "lead.update", "Lead", id, { status: parsed.data.status });
    revalidatePath(`/admin/leads/${id}`);
    return { status: "success", message: "Lead updated.", submissionId: Date.now() };
  } catch (e) {
    return fail(e);
  }
}

export async function addLeadActivityAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await assertAdmin("manageLeads");
    const parsed = z
      .object({ type: z.enum(LeadActivityType), body: z.string().trim().min(2, "Write a short note").max(2000) })
      .safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { status: "error", message: "Check the note.", fieldErrors: fieldErrors(parsed.error), submissionId: Date.now() };
    await addLeadActivity(id, parsed.data.type, parsed.data.body, admin.id);
    revalidatePath(`/admin/leads/${id}`);
    return { status: "success", message: "Added to the timeline.", submissionId: Date.now() };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteLeadAction(id: string): Promise<void> {
  const admin = await assertAdmin("manageAdmins");
  await deleteLead(id);
  await logAudit(admin.id, "lead.delete", "Lead", id);
  redirect("/admin/leads?deleted=1");
}

const manualLeadSchema = z.object({
  name: nameField,
  phone: mobileField,
  email: optionalEmailField.transform((v) => v ?? null),
  message: optionalString(2000),
  source: z.enum(MANUAL_LEAD_SOURCES),
  propertyId: optionalId,
  assignedAgentId: optionalId,
});

export async function createManualLeadAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let admin;
  try {
    admin = await assertAdmin("manageLeads");
  } catch (e) {
    return fail(e);
  }
  const raw = Object.fromEntries([...formData.entries()].filter(([k]) => !k.startsWith("$ACTION")).map(([k, v]) => [k, String(v)]));
  const parsed = manualLeadSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error), values: raw, submissionId: Date.now() };
  const id = await createManualLead(parsed.data, admin.id);
  await logAudit(admin.id, "lead.create_manual", "Lead", id);
  redirect(`/admin/leads/${id}`);
}

export async function updateSiteVisitAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await assertAdmin("manageLeads");
    const date = String(formData.get("date") ?? "");
    const time = String(formData.get("time") ?? "");
    const [hh, mm] = time.split(":").map(Number);
    const scheduledAt = date && time && hh !== undefined ? istDateTimeToUtc(date, hh, mm ?? 0) : null;
    const status = z.enum(SiteVisitStatus).safeParse(formData.get("status"));
    if (!status.success) return { status: "error", message: "Choose a status.", submissionId: Date.now() };
    const feedback = String(formData.get("feedback") ?? "").trim().slice(0, 2000) || null;
    await updateSiteVisit(id, { status: status.data, scheduledAt, feedback }, admin.id);
    await logAudit(admin.id, "site_visit.update", "SiteVisit", id, { status: status.data });
    revalidatePath("/admin/site-visits");
    revalidatePath("/admin");
    return { status: "success", message: "Visit updated.", submissionId: Date.now() };
  } catch (e) {
    return fail(e);
  }
}

export async function updateOwnerListingAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await assertAdmin("manageLeads");
    const status = z.enum(OwnerListingStatus).safeParse(formData.get("status"));
    if (!status.success) return { status: "error", message: "Choose a status.", submissionId: Date.now() };
    const reviewNotes = String(formData.get("reviewNotes") ?? "").trim().slice(0, 2000) || null;
    await updateOwnerListing(id, { status: status.data, reviewNotes });
    await logAudit(admin.id, "owner_listing.update", "OwnerListing", id, { status: status.data });
    revalidatePath(`/admin/owner-listings/${id}`);
    return { status: "success", message: "Saved.", submissionId: Date.now() };
  } catch (e) {
    return fail(e);
  }
}

export async function convertOwnerListingAction(id: string): Promise<void> {
  const admin = await assertAdmin("manageListings");
  const propertyId = await convertOwnerListing(id);
  await logAudit(admin.id, "owner_listing.convert", "OwnerListing", id, { propertyId });
  revalidatePublicSite(CACHE_TAGS.properties);
  redirect(`/admin/properties/${propertyId}?created=1`);
}
