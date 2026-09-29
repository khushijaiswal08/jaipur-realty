import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

/** Records an admin action (SPEC §44, §56). Never throws — auditing must not break the action. */
export async function logAudit(
  adminId: string | null,
  action: string,
  entityType: string,
  entityId: string,
  changes?: Prisma.InputJsonValue,
): Promise<void> {
  try {
    await db.auditLog.create({ data: { adminId, action, entityType, entityId, changes: changes ?? undefined } });
  } catch (error) {
    console.error("[audit] failed to record", { action, entityType, entityId, error: error instanceof Error ? error.message : error });
  }
}
