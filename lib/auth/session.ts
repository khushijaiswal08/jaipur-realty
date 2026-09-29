import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { AdminRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { SESSION_TTL_MS, sessionCookieName } from "./cookie";
import { can, type Capability } from "./permissions";

// DB-backed admin sessions (SPEC §43, §42.10). The cookie carries a random 256-bit token;
// only its SHA-256 is stored, so a database leak doesn't expose usable sessions.

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  sessionId: string;
}

const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(adminId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const ua = (await headers()).get("user-agent")?.slice(0, 300) ?? null;
  await db.adminSession.create({ data: { adminId, tokenHash: hashToken(token), expiresAt, userAgent: ua } });
  (await cookies()).set(sessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** The signed-in admin for this request, or null. Deduplicated per request. */
export const getCurrentAdmin = cache(async (): Promise<AdminUser | null> => {
  const token = (await cookies()).get(sessionCookieName())?.value;
  if (!token || token.length < 32) return null;
  const session = await db.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { admin: { select: { id: true, email: true, name: true, role: true, isActive: true } } },
  });
  if (!session || session.expiresAt < new Date() || !session.admin.isActive) return null;
  if (Date.now() - session.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    await db.adminSession.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } });
  }
  const { id, email, name, role } = session.admin;
  return { id, email, name, role, sessionId: session.id };
});

/** For admin pages: the admin, or a redirect to the login page. */
export async function requireAdmin(capability?: Capability): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  if (capability && !can(admin.role, capability)) redirect("/admin?denied=1");
  return admin;
}

/** For Server Actions: throws instead of redirecting so callers can return an error state. */
export async function assertAdmin(capability?: Capability): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new AuthError("Your session has expired. Please sign in again.");
  if (capability && !can(admin.role, capability)) throw new AuthError("You don't have permission to do that.");
  return admin;
}

export class AuthError extends Error {}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(sessionCookieName())?.value;
  if (token) await db.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.delete(sessionCookieName());
}

/** Revoke every session for an admin (password change, deactivation). */
export async function revokeAllSessions(adminId: string, exceptSessionId?: string): Promise<void> {
  await db.adminSession.deleteMany({ where: { adminId, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) } });
}

/** Housekeeping: remove expired sessions. */
export async function purgeExpiredSessions(): Promise<number> {
  const { count } = await db.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return count;
}
