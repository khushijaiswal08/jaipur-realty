import "server-only";

import type { AdminRole } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";

export async function listAdmins() {
  return db.admin.findMany({
    orderBy: [{ isActive: "desc" }, { role: "asc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true, _count: { select: { sessions: true } } },
  });
}

export class AdminRuleError extends Error {}

/** Guards against locking everyone out: at least one active SUPER_ADMIN must remain. */
async function assertSuperAdminRemains(changingId: string, next: { role: AdminRole; isActive: boolean }) {
  if (next.role === "SUPER_ADMIN" && next.isActive) return;
  const others = await db.admin.count({ where: { role: "SUPER_ADMIN", isActive: true, id: { not: changingId } } });
  if (others === 0) throw new AdminRuleError("There must always be at least one active super admin.");
}

export async function createAdmin(data: { name: string; email: string; role: AdminRole; password: string }) {
  const existing = await db.admin.findUnique({ where: { email: data.email }, select: { id: true } });
  if (existing) throw new AdminRuleError("An admin with that email already exists.");
  return db.admin.create({
    data: { name: data.name, email: data.email, role: data.role, passwordHash: await hashPassword(data.password) },
    select: { id: true },
  });
}

export async function updateAdmin(id: string, actingAdminId: string, data: { role: AdminRole; isActive: boolean }) {
  if (id === actingAdminId && (!data.isActive || data.role !== "SUPER_ADMIN")) {
    throw new AdminRuleError("You can't deactivate or demote your own account.");
  }
  await assertSuperAdminRemains(id, data);
  await db.admin.update({ where: { id }, data });
  if (!data.isActive) await db.adminSession.deleteMany({ where: { adminId: id } });
}

export async function resetAdminPassword(id: string, password: string, keepSessionId?: string) {
  await db.admin.update({ where: { id }, data: { passwordHash: await hashPassword(password) } });
  await db.adminSession.deleteMany({ where: { adminId: id, ...(keepSessionId ? { id: { not: keepSessionId } } : {}) } });
}

export async function listAuditLog(entityType?: string, take = 200) {
  return db.auditLog.findMany({
    where: entityType ? { entityType } : {},
    orderBy: { createdAt: "desc" },
    take,
    include: { admin: { select: { name: true } } },
  });
}

export async function auditEntityTypes(): Promise<string[]> {
  const rows = await db.auditLog.findMany({ distinct: ["entityType"], select: { entityType: true }, orderBy: { entityType: "asc" } });
  return rows.map((r) => r.entityType);
}

// ── Demo content (SPEC §35.1) ─────────────────────────────────────────────────

export async function demoCounts() {
  const [properties, projects, agents, testimonials, blogPosts] = await Promise.all([
    db.property.count({ where: { isDemo: true } }),
    db.project.count({ where: { isDemo: true } }),
    db.agent.count({ where: { isDemo: true } }),
    db.testimonial.count({ where: { isDemo: true } }),
    db.blogPost.count({ where: { isDemo: true } }),
  ]);
  return { properties, projects, agents, testimonials, blogPosts, total: properties + projects + agents + testimonials + blogPosts };
}

/** Deletes every isDemo record (same scope as `npm run db:purge-demo`). */
export async function purgeDemoContent() {
  const [properties, projects, agents, testimonials, blogPosts] = await db.$transaction([
    db.property.deleteMany({ where: { isDemo: true } }),
    db.project.deleteMany({ where: { isDemo: true } }),
    db.agent.deleteMany({ where: { isDemo: true } }),
    db.testimonial.deleteMany({ where: { isDemo: true } }),
    db.blogPost.deleteMany({ where: { isDemo: true } }),
  ]);
  return { properties: properties.count, projects: projects.count, agents: agents.count, testimonials: testimonials.count, blogPosts: blogPosts.count };
}
