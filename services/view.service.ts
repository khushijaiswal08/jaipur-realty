import "server-only";

import { db } from "@/lib/db";

const DEDUPE_MS = 30 * 60 * 1000;
const MAX_CLAIMS = 20_000;

/**
 * In-process claims, taken synchronously before any await, so near-simultaneous beacons (double
 * effects, retries) can't both pass the DB check. The DB check still covers restarts/other instances.
 */
const claims = new Map<string, number>();

function claim(key: string, now: number): boolean {
  const at = claims.get(key);
  if (at !== undefined && now - at < DEDUPE_MS) return false;
  if (claims.size >= MAX_CLAIMS) {
    for (const [k, t] of claims) if (now - t >= DEDUPE_MS) claims.delete(k);
    if (claims.size >= MAX_CLAIMS) claims.clear();
  }
  claims.set(key, now);
  return true;
}

export interface ViewInput {
  propertyId?: string;
  projectId?: string;
  visitorHash: string;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  deviceType: string;
}

/**
 * Records a listing view (SPEC §48): one per visitor per listing per 30 minutes, and increments
 * the denormalised viewCount. Returns false when deduplicated or the listing doesn't exist.
 */
export async function recordView(v: ViewInput): Promise<boolean> {
  const target = v.propertyId ? { propertyId: v.propertyId } : v.projectId ? { projectId: v.projectId } : null;
  if (!target) return false;
  const now = Date.now();
  if (!claim(`${v.propertyId ? "p" : "j"}:${v.propertyId ?? v.projectId}:${v.visitorHash}`, now)) return false;
  const recent = await db.propertyView.findFirst({
    where: { ...target, visitorHash: v.visitorHash, viewedAt: { gte: new Date(now - DEDUPE_MS) } },
    select: { id: true },
  });
  if (recent) return false;
  try {
    await db.$transaction([
      db.propertyView.create({
        data: {
          ...target,
          visitorHash: v.visitorHash,
          referrer: v.referrer?.slice(0, 500) ?? null,
          utmSource: v.utmSource?.slice(0, 100) ?? null,
          utmMedium: v.utmMedium?.slice(0, 100) ?? null,
          utmCampaign: v.utmCampaign?.slice(0, 100) ?? null,
          deviceType: v.deviceType,
        },
      }),
      v.propertyId
        ? db.property.update({ where: { id: v.propertyId }, data: { viewCount: { increment: 1 } } })
        : db.project.update({ where: { id: v.projectId! }, data: { viewCount: { increment: 1 } } }),
    ]);
    return true;
  } catch {
    // Unknown id (FK violation) — ignore.
    return false;
  }
}
