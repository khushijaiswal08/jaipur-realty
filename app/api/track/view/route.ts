import { type NextRequest } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/server/rate-limit";
import { clientIp, deviceTypeFromUA, hashVisitor } from "@/lib/server/request-meta";
import { recordView } from "@/services/view.service";

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|uptime/i;
const ID = /^[a-z0-9]{20,32}$/;

const bodySchema = z.object({
  propertyId: z.string().regex(ID).optional(),
  projectId: z.string().regex(ID).optional(),
  referrer: z.string().max(500).optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
});

/** View beacon from listing pages (SPEC §48). Always 204 so it never affects the page. */
export async function POST(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT_UA.test(ua)) return new Response(null, { status: 204 });
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return new Response(null, { status: 204 });

  const visitorHash = hashVisitor(clientIp(request.headers), ua);
  if (!rateLimit(`view:${visitorHash}`, 60, 60_000).allowed) return new Response(null, { status: 204 });

  let json: unknown;
  try {
    json = JSON.parse(await request.text());
  } catch {
    return new Response(null, { status: 204 });
  }
  const parsed = bodySchema.safeParse(json);
  if (parsed.success && (parsed.data.propertyId || parsed.data.projectId)) {
    await recordView({ ...parsed.data, visitorHash, deviceType: deviceTypeFromUA(ua) });
  }
  return new Response(null, { status: 204 });
}
