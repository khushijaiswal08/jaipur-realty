"use server";

import { redirect } from "next/navigation";
import { AuthError, assertAdmin } from "@/lib/auth/session";
import type { ActionState } from "@/lib/actions/types";
import { CACHE_TAGS, revalidatePublicSite } from "@/lib/server/revalidate";
import { agentAdminSchema, localityAdminSchema, projectAdminSchema } from "@/lib/validation/catalog-admin";
import { formValues } from "@/lib/validation/form-helpers";
import { fieldErrors } from "@/lib/validation/leads";
import {
  deleteAgentAdmin,
  deleteLocalityAdmin,
  deleteProjectAdmin,
  deleteProjectImage,
  moveProjectImage,
  saveAgentAdmin,
  saveLocalityAdmin,
  saveProjectAdmin,
  setProjectCover,
  updateProjectImage,
} from "@/services/admin/catalog-admin.service";
import { logAudit } from "@/services/audit.service";

const fail = (e: unknown): ActionState => ({ status: "error", message: e instanceof AuthError ? e.message : "Something went wrong.", submissionId: Date.now() });
const invalid = (errors: Record<string, string>): ActionState => ({ status: "error", message: "Please fix:", fieldErrors: errors, submissionId: Date.now() });

// ── Projects ──────────────────────────────────────────────────────────────────

export async function saveProjectAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  let admin;
  try {
    admin = await assertAdmin("manageListings");
  } catch (e) {
    return fail(e);
  }
  const parsed = projectAdminSchema.safeParse(formValues(formData, ["amenityIds"]));
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const saved = await saveProjectAdmin(id || null, parsed.data);
  await logAudit(admin.id, id ? "project.update" : "project.create", "Project", saved.id, { name: parsed.data.name, status: parsed.data.status });
  revalidatePublicSite(CACHE_TAGS.projects, CACHE_TAGS.properties);
  if (!id) redirect(`/admin/projects/${saved.id}?created=1`);
  return { status: "success", message: "Saved.", submissionId: Date.now() };
}

export async function deleteProjectAction(id: string): Promise<void> {
  const admin = await assertAdmin("manageListings");
  await deleteProjectAdmin(id);
  await logAudit(admin.id, "project.delete", "Project", id);
  revalidatePublicSite(CACHE_TAGS.projects, CACHE_TAGS.properties);
  redirect("/admin/projects?deleted=1");
}

async function projectImageDone(adminId: string, projectId: string, action: string, imageId: string) {
  await logAudit(adminId, `project.${action}`, "Project", projectId, { imageId });
  revalidatePublicSite(CACHE_TAGS.projects);
}

export async function updateProjectImageAction(imageId: string, formData: FormData): Promise<void> {
  const admin = await assertAdmin("manageListings");
  const alt = String(formData.get("alt") ?? "").trim().slice(0, 200);
  if (alt.length < 3) return;
  const kind = String(formData.get("kind") ?? "PHOTO");
  const { projectId } = await updateProjectImage(imageId, {
    alt,
    caption: String(formData.get("caption") ?? "").trim().slice(0, 120) || null,
    kind: ["PHOTO", "FLOOR_PLAN", "MASTER_PLAN", "LOCATION_MAP"].includes(kind) ? (kind as "PHOTO") : "PHOTO",
  });
  await projectImageDone(admin.id, projectId, "image_update", imageId);
}

export async function setProjectCoverAction(imageId: string): Promise<void> {
  const admin = await assertAdmin("manageListings");
  const { projectId } = await setProjectCover(imageId);
  await projectImageDone(admin.id, projectId, "image_cover", imageId);
}

export async function moveProjectImageAction(imageId: string, direction: -1 | 1): Promise<void> {
  const admin = await assertAdmin("manageListings");
  const { projectId } = await moveProjectImage(imageId, direction);
  await projectImageDone(admin.id, projectId, "image_move", imageId);
}

export async function deleteProjectImageAction(imageId: string): Promise<void> {
  const admin = await assertAdmin("manageListings");
  const { projectId } = await deleteProjectImage(imageId);
  await projectImageDone(admin.id, projectId, "image_delete", imageId);
}

// ── Localities ────────────────────────────────────────────────────────────────

export async function saveLocalityAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  let admin;
  try {
    admin = await assertAdmin("manageListings");
  } catch (e) {
    return fail(e);
  }
  const parsed = localityAdminSchema.safeParse(formValues(formData));
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const saved = await saveLocalityAdmin(id || null, parsed.data);
  await logAudit(admin.id, id ? "locality.update" : "locality.create", "Locality", saved.id, { name: parsed.data.name });
  revalidatePublicSite(CACHE_TAGS.localities);
  if (!id) redirect(`/admin/localities/${saved.id}?created=1`);
  return { status: "success", message: "Saved.", submissionId: Date.now() };
}

export async function deleteLocalityAction(id: string, _prev: ActionState): Promise<ActionState> {
  let admin;
  try {
    admin = await assertAdmin("manageListings");
  } catch (e) {
    return fail(e);
  }
  const result = await deleteLocalityAdmin(id);
  if (!result.ok) return { status: "error", message: result.reason, submissionId: Date.now() };
  await logAudit(admin.id, "locality.delete", "Locality", id);
  revalidatePublicSite(CACHE_TAGS.localities);
  redirect("/admin/localities?deleted=1");
}

// ── Agents ────────────────────────────────────────────────────────────────────

export async function saveAgentAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  let admin;
  try {
    admin = await assertAdmin("manageListings");
  } catch (e) {
    return fail(e);
  }
  const parsed = agentAdminSchema.safeParse(formValues(formData));
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const saved = await saveAgentAdmin(id || null, parsed.data);
  await logAudit(admin.id, id ? "agent.update" : "agent.create", "Agent", saved.id, { name: parsed.data.name });
  revalidatePublicSite();
  if (!id) redirect(`/admin/agents/${saved.id}?created=1`);
  return { status: "success", message: "Saved.", submissionId: Date.now() };
}

export async function deleteAgentAction(id: string): Promise<void> {
  const admin = await assertAdmin("manageListings");
  await deleteAgentAdmin(id);
  await logAudit(admin.id, "agent.delete", "Agent", id);
  revalidatePublicSite();
  redirect("/admin/agents?deleted=1");
}
