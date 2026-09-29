import { NextResponse, type NextRequest } from "next/server";
import type { LeadSource, LeadStatus } from "@/generated/prisma/enums";
import { AuthError, assertAdmin } from "@/lib/auth/session";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS } from "@/lib/constants/enums";
import { toIstDateString } from "@/lib/format/date";
import { exportLeadsCsv } from "@/services/admin/lead-admin.service";
import { logAudit } from "@/services/audit.service";

/** CSV export of leads with the same filters as the inbox (SPEC §45). ADMIN and above. */
export async function GET(request: NextRequest) {
  let admin;
  try {
    admin = await assertAdmin("exportLeads");
  } catch (e) {
    return NextResponse.json({ error: e instanceof AuthError ? e.message : "Forbidden" }, { status: 403 });
  }
  const sp = request.nextUrl.searchParams;
  const status = sp.get("status")?.toUpperCase();
  const source = sp.get("source")?.toUpperCase();
  const from = sp.get("from");
  const to = sp.get("to");
  const csv = await exportLeadsCsv({
    q: sp.get("q")?.slice(0, 80) || undefined,
    status: status && status in LEAD_STATUS_LABELS ? (status as LeadStatus) : undefined,
    source: source && source in LEAD_SOURCE_LABELS ? (source as LeadSource) : undefined,
    agentId: sp.get("agent") || undefined,
    from: from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? new Date(`${from}T00:00:00+05:30`) : undefined,
    to: to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? new Date(`${to}T23:59:59+05:30`) : undefined,
  });
  await logAudit(admin.id, "lead.export", "Lead", "csv", { filters: Object.fromEntries(sp) });
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${toIstDateString(new Date())}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
