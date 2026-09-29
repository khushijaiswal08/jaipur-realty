"use server";

import { redirect } from "next/navigation";
import { AuthError, assertAdmin } from "@/lib/auth/session";
import type { ActionState } from "@/lib/actions/types";
import { CACHE_TAGS, revalidatePublicSite } from "@/lib/server/revalidate";
import { fieldErrors } from "@/lib/validation/leads";
import { formValues } from "@/lib/validation/form-helpers";
import { PROPERTY_MULTI_FIELDS, propertyAdminSchema } from "@/lib/validation/property-admin";
import {
  deletePropertyAdmin,
  deletePropertyImage,
  duplicatePropertyAdmin,
  movePropertyImage,
  savePropertyAdmin,
  setPropertyCover,
  updatePropertyImage,
} from "@/services/admin/property-admin.service";
import { logAudit } from "@/services/audit.service";

function authFailure(e: unknown): ActionState {
  return { status: "error", message: e instanceof AuthError ? e.message : "Something went wrong.", submissionId: Date.now() };
}

/** Create (id = "") or update a property from the admin form. */
export async function savePropertyAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  let admin;
  try {
    admin = await assertAdmin("manageListings");
  } catch (e) {
    return authFailure(e);
  }
  const raw = formValues(formData, PROPERTY_MULTI_FIELDS);
  const parsed = propertyAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
      values: Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : v])),
      submissionId: Date.now(),
    };
  }

  const saved = await savePropertyAdmin(id || null, parsed.data);
  await logAudit(admin.id, id ? "property.update" : "property.create", "Property", saved.id, {
    status: parsed.data.status,
    title: parsed.data.title,
  });
  revalidatePublicSite(CACHE_TAGS.properties, CACHE_TAGS.localities);
  if (!id) redirect(`/admin/properties/${saved.id}?created=1`);
  return { status: "success", message: "Saved.", submissionId: Date.now(), data: { slug: saved.slug } };
}

export async function deletePropertyAction(id: string): Promise<void> {
  const admin = await assertAdmin("manageListings");
  const deleted = await deletePropertyAdmin(id);
  if (deleted) {
    await logAudit(admin.id, "property.delete", "Property", id, { slug: deleted.slug });
    revalidatePublicSite(CACHE_TAGS.properties, CACHE_TAGS.localities);
  }
  redirect("/admin/properties?deleted=1");
}

export async function duplicatePropertyAction(id: string): Promise<void> {
  const admin = await assertAdmin("manageListings");
  const copy = await duplicatePropertyAdmin(id);
  await logAudit(admin.id, "property.duplicate", "Property", copy.id, { from: id });
  redirect(`/admin/properties/${copy.id}?created=1`);
}

// ── Image actions (bound with the image id from the image manager) ─────────────

async function afterImageChange(adminId: string, propertyId: string, action: string, imageId: string) {
  await logAudit(adminId, `property.${action}`, "Property", propertyId, { imageId });
  revalidatePublicSite(CACHE_TAGS.properties);
}

export async function updatePropertyImageAction(imageId: string, formData: FormData): Promise<void> {
  const admin = await assertAdmin("manageListings");
  const alt = String(formData.get("alt") ?? "").trim().slice(0, 200);
  const caption = String(formData.get("caption") ?? "").trim().slice(0, 120) || null;
  const kind = String(formData.get("kind") ?? "PHOTO");
  if (alt.length < 3) return;
  const { propertyId } = await updatePropertyImage(imageId, {
    alt,
    caption,
    kind: ["PHOTO", "FLOOR_PLAN", "MASTER_PLAN", "LOCATION_MAP"].includes(kind) ? (kind as "PHOTO") : "PHOTO",
  });
  await afterImageChange(admin.id, propertyId, "image_update", imageId);
}

export async function setPropertyCoverAction(imageId: string): Promise<void> {
  const admin = await assertAdmin("manageListings");
  const { propertyId } = await setPropertyCover(imageId);
  await afterImageChange(admin.id, propertyId, "image_cover", imageId);
}

export async function movePropertyImageAction(imageId: string, direction: -1 | 1): Promise<void> {
  const admin = await assertAdmin("manageListings");
  const { propertyId } = await movePropertyImage(imageId, direction);
  await afterImageChange(admin.id, propertyId, "image_move", imageId);
}

export async function deletePropertyImageAction(imageId: string): Promise<void> {
  const admin = await assertAdmin("manageListings");
  const { propertyId } = await deletePropertyImage(imageId);
  await afterImageChange(admin.id, propertyId, "image_delete", imageId);
}
