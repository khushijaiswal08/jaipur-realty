"use server";

import { AuthError, assertAdmin } from "@/lib/auth/session";
import type { ActionState } from "@/lib/actions/types";
import { CACHE_TAGS, revalidatePublicSite } from "@/lib/server/revalidate";
import { trustMetricsSchema } from "@/lib/settings/trust-metrics";
import { saveTrustMetrics } from "@/services/admin/settings-admin.service";
import { logAudit } from "@/services/audit.service";

export async function saveTrustMetricsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await assertAdmin("manageSettings");
    let raw: unknown;
    try {
      raw = JSON.parse(String(formData.get("metrics") ?? "[]"));
    } catch {
      return { status: "error", message: "Couldn't read the metrics. Please try again.", submissionId: Date.now() };
    }
    const parsed = trustMetricsSchema.safeParse(raw);
    if (!parsed.success) {
      return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check the metrics.", submissionId: Date.now() };
    }
    await saveTrustMetrics(parsed.data, admin.id);
    await logAudit(admin.id, "settings.trust_metrics", "SiteSetting", "home.trustMetrics", { metrics: parsed.data });
    revalidatePublicSite(CACHE_TAGS.content);
    return { status: "success", message: "Saved. The home page is updated.", submissionId: Date.now() };
  } catch (e) {
    return {
      status: "error",
      message: e instanceof AuthError ? e.message : "Something went wrong.",
      submissionId: Date.now(),
    };
  }
}
