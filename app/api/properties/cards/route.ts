import { NextResponse, type NextRequest } from "next/server";
import { getPropertyCardsByIds, getPropertyDetailsByIds } from "@/services/property-detail.service";

const ID = /^[a-z0-9]{20,32}$/;

/**
 * Public card data for client-side lists (shortlist, compare). Read-only; ids are validated and
 * capped. `?detail=1` returns full details (max 3) for the compare table.
 */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = [...new Set(raw.split(",").map((s) => s.trim()).filter((s) => ID.test(s)))].slice(0, 50);
  const detail = request.nextUrl.searchParams.get("detail") === "1";
  const items = detail ? await getPropertyDetailsByIds(ids) : await getPropertyCardsByIds(ids);
  return NextResponse.json({ items }, { headers: { "Cache-Control": "private, max-age=30" } });
}
