"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { dummyHash, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, getCurrentAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { LIMITS, rateLimit } from "@/lib/server/rate-limit";
import { getRequestMeta } from "@/lib/server/request-meta";
import { logAudit } from "@/services/audit.service";
import type { ActionState } from "./types";

const loginSchema = z.object({
  email: z.email("Enter your email").max(120).transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, "Enter your password").max(200),
  next: z.string().optional(),
});

/** Only allow redirects back into the admin area (no open redirects). */
function safeNext(next: string | undefined): string {
  return next && /^\/admin(\/[\w\-/]*)?(\?[\w\-=&%]*)?$/.test(next) && !next.startsWith("//") ? next : "/admin";
}

const GENERIC_ERROR = "Incorrect email or password.";

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });
  const email = typeof formData.get("email") === "string" ? String(formData.get("email")).slice(0, 120) : "";
  if (!parsed.success) return { status: "error", message: GENERIC_ERROR, values: { email }, submissionId: Date.now() };

  const meta = await getRequestMeta();
  const limit = rateLimit(`login:${parsed.data.email}:${meta.visitorHash}`, LIMITS.login.limit, LIMITS.login.windowMs);
  if (!limit.allowed) {
    return {
      status: "error",
      message: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minute(s).`,
      values: { email },
      submissionId: Date.now(),
    };
  }

  const admin = await db.admin.findUnique({ where: { email: parsed.data.email } });
  // Always run bcrypt so response time doesn't reveal whether the account exists.
  const ok = await verifyPassword(parsed.data.password, admin?.passwordHash ?? (await dummyHash()));
  if (!admin || !ok || !admin.isActive) {
    if (admin) await logAudit(admin.id, "auth.login_failed", "Admin", admin.id);
    return { status: "error", message: GENERIC_ERROR, values: { email }, submissionId: Date.now() };
  }

  await createSession(admin.id);
  await db.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  await logAudit(admin.id, "auth.login", "Admin", admin.id, { deviceType: meta.deviceType });
  redirect(safeNext(parsed.data.next));
}

export async function logout(): Promise<void> {
  const admin = await getCurrentAdmin();
  await destroySession();
  if (admin) await logAudit(admin.id, "auth.logout", "Admin", admin.id);
  redirect("/admin/login");
}
