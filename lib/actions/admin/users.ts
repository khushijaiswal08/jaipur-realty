"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AdminRole } from "@/generated/prisma/enums";
import { passwordProblems } from "@/lib/auth/password";
import { AuthError, assertAdmin } from "@/lib/auth/session";
import type { ActionState } from "@/lib/actions/types";
import { revalidatePublicSite } from "@/lib/server/revalidate";
import { AdminRuleError, createAdmin, purgeDemoContent, resetAdminPassword, updateAdmin } from "@/services/admin/admin-users.service";
import { logAudit } from "@/services/audit.service";

const fail = (e: unknown): ActionState => ({
  status: "error",
  message: e instanceof AuthError || e instanceof AdminRuleError ? e.message : "Something went wrong.",
  submissionId: Date.now(),
});

const passwordField = z.string().superRefine((v, ctx) => {
  const problem = passwordProblems(v);
  if (problem) ctx.addIssue({ code: "custom", message: problem });
});

export async function createAdminAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await assertAdmin("manageAdmins");
    const parsed = z
      .object({
        name: z.string().trim().min(2, "Enter a name").max(80),
        email: z.email("Enter a valid email").transform((v) => v.toLowerCase()),
        role: z.enum(AdminRole),
        password: passwordField,
      })
      .safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { status: "error", message: parsed.error.issues.map((i) => i.message).join(" "), submissionId: Date.now() };
    const created = await createAdmin(parsed.data);
    await logAudit(admin.id, "admin.create", "Admin", created.id, { email: parsed.data.email, role: parsed.data.role });
    revalidatePath("/admin/users");
    return { status: "success", message: `Created ${parsed.data.email}. Share the password with them securely.`, submissionId: Date.now() };
  } catch (e) {
    return fail(e);
  }
}

export async function updateAdminAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await assertAdmin("manageAdmins");
    const role = z.enum(AdminRole).parse(formData.get("role"));
    const isActive = formData.get("isActive") === "on";
    await updateAdmin(id, admin.id, { role, isActive });
    await logAudit(admin.id, "admin.update", "Admin", id, { role, isActive });
    revalidatePath("/admin/users");
    return { status: "success", message: "Saved.", submissionId: Date.now() };
  } catch (e) {
    return fail(e);
  }
}

export async function resetAdminPasswordAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await assertAdmin("manageAdmins");
    const parsed = passwordField.safeParse(formData.get("password"));
    if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message, submissionId: Date.now() };
    await resetAdminPassword(id, parsed.data, id === admin.id ? admin.sessionId : undefined);
    await logAudit(admin.id, "admin.password_reset", "Admin", id);
    return { status: "success", message: "Password changed. Other sessions were signed out.", submissionId: Date.now() };
  } catch (e) {
    return fail(e);
  }
}

export async function purgeDemoAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await assertAdmin("purgeDemo");
    if (formData.get("confirm") !== "PURGE") return { status: "error", message: "Type PURGE to confirm.", submissionId: Date.now() };
    const result = await purgeDemoContent();
    await logAudit(admin.id, "demo.purge", "System", "demo", result);
    revalidatePublicSite();
    return { status: "success", message: `Removed ${Object.entries(result).map(([k, v]) => `${v} ${k}`).join(", ")}.`, submissionId: Date.now() };
  } catch (e) {
    return fail(e);
  }
}
