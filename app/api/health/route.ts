import { NextResponse } from "next/server";
import { checkDatabase } from "@/services/health.service";

// Liveness/readiness probe for Docker HEALTHCHECK, load balancers and uptime monitors.
// Reveals nothing beyond up/down.
export const dynamic = "force-dynamic";

export async function GET() {
  const dbOk = await checkDatabase();
  return NextResponse.json(
    { status: dbOk ? "ok" : "degraded", database: dbOk ? "ok" : "unreachable" },
    { status: dbOk ? 200 : 503, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
