import "server-only";

import { db } from "@/lib/db";

/** True when PostgreSQL answers within 3 seconds. */
export async function checkDatabase(): Promise<boolean> {
  try {
    await Promise.race([
      db.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
    ]);
    return true;
  } catch {
    return false;
  }
}
