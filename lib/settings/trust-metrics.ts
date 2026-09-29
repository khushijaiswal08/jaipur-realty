import { z } from "zod";

// Home-page trust metrics (SPEC §6, §22), stored in SiteSetting "home.trustMetrics".
// Each metric is either a live count from the database (always true) or a fixed value the
// business enters in Admin → Site settings. Numbers are never invented by the code.

export const TRUST_METRICS_KEY = "home.trustMetrics";
export const MAX_TRUST_METRICS = 4;

export const TRUST_METRIC_SOURCES = {
  activeListings: "Active listings (live count)",
  saleListings: "Properties for sale (live count)",
  rentListings: "Properties for rent (live count)",
  verifiedListings: "Verified listings (live count)",
  projects: "Builder projects (live count)",
  localities: "Localities covered (live count)",
} as const;

export type TrustMetricSource = keyof typeof TRUST_METRIC_SOURCES;

export const trustMetricSchema = z
  .object({
    label: z.string().trim().min(2, "Each metric needs a label.").max(60),
    /** Fixed value, e.g. "15+ years" or "2,500+". Used when `source` is empty. */
    value: z.string().trim().max(20).optional(),
    source: z.enum(Object.keys(TRUST_METRIC_SOURCES) as [TrustMetricSource, ...TrustMetricSource[]]).optional(),
  })
  .refine((m) => Boolean(m.source) || Boolean(m.value), { message: "Enter a value or choose a live count.", path: ["value"] });

export type TrustMetric = z.infer<typeof trustMetricSchema>;

export const trustMetricsSchema = z.array(trustMetricSchema).max(MAX_TRUST_METRICS, `At most ${MAX_TRUST_METRICS} metrics.`);

/** Used until an admin saves their own — live counts only, so nothing on the page is made up. */
export const DEFAULT_TRUST_METRICS: TrustMetric[] = [
  { label: "Active listings", source: "activeListings" },
  { label: "Verified by our team", source: "verifiedListings" },
  { label: "Jaipur localities covered", source: "localities" },
  { label: "Builder projects", source: "projects" },
];

/** Parses stored JSON, falling back to the defaults when missing or invalid. */
export function parseTrustMetrics(value: unknown): TrustMetric[] {
  if (value === undefined || value === null) return DEFAULT_TRUST_METRICS;
  const parsed = trustMetricsSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_TRUST_METRICS;
}
