import "server-only";

import { db } from "@/lib/db";
import { TRUST_METRICS_KEY, type TrustMetric } from "@/lib/settings/trust-metrics";

/** Stores validated trust metrics (Admin → Site settings). */
export async function saveTrustMetrics(metrics: TrustMetric[], adminId: string): Promise<void> {
  // Drop empty optional keys so the stored JSON stays minimal and round-trips through the schema.
  const value = metrics.map((m) => ({ label: m.label, ...(m.source ? { source: m.source } : { value: m.value }) }));
  await db.siteSetting.upsert({
    where: { key: TRUST_METRICS_KEY },
    create: { key: TRUST_METRICS_KEY, value, updatedById: adminId },
    update: { value, updatedById: adminId },
  });
}
