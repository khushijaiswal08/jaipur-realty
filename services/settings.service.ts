import "server-only";

import { db } from "@/lib/db";
import { formatNumberIN } from "@/lib/format/number";
import { parseTrustMetrics, TRUST_METRICS_KEY, type TrustMetric, type TrustMetricSource } from "@/lib/settings/trust-metrics";
import { publicListingWhere } from "./property.service";
import { publishedProjectWhere } from "./project.service";

export interface TrustMetricDTO {
  label: string;
  value: string;
}

/** Stored (or default) metric definitions, for the admin editor. */
export async function getTrustMetricSettings(): Promise<TrustMetric[]> {
  const row = await db.siteSetting.findUnique({ where: { key: TRUST_METRICS_KEY }, select: { value: true } });
  return parseTrustMetrics(row?.value);
}

const COUNTERS: Record<TrustMetricSource, () => Promise<number>> = {
  activeListings: () => db.property.count({ where: publicListingWhere }),
  saleListings: () => db.property.count({ where: { ...publicListingWhere, transactionType: "SALE" } }),
  rentListings: () => db.property.count({ where: { ...publicListingWhere, transactionType: "RENT" } }),
  verifiedListings: () => db.property.count({ where: { ...publicListingWhere, isVerified: true } }),
  projects: () => db.project.count({ where: publishedProjectWhere }),
  localities: () => db.locality.count({ where: { city: { isActive: true } } }),
};

/**
 * Home-page trust metrics with live counts resolved. A live count of zero is hidden rather
 * than shown as "0 verified listings".
 */
export async function getTrustMetrics(): Promise<TrustMetricDTO[]> {
  const metrics = await getTrustMetricSettings();
  const resolved = await Promise.all(
    metrics.map(async (m): Promise<TrustMetricDTO | null> => {
      if (!m.source) return m.value ? { label: m.label, value: m.value } : null;
      const n = await COUNTERS[m.source]();
      return n > 0 ? { label: m.label, value: formatNumberIN(n) } : null;
    }),
  );
  return resolved.filter((m): m is TrustMetricDTO => m !== null);
}
