// Environment validation (SPEC §34.2, §57). Imported by next.config.ts, so it uses relative
// imports only. Reports EVERY problem at once instead of failing on the first.

import { z } from "zod";
import { isValidIndianMobile, normalizeIndianPhone } from "../format/phone";

type Env = Record<string, string | undefined>;

/** Treat empty strings as "not set". */
function normalise(env: Env): Env {
  const out: Env = {};
  for (const [k, v] of Object.entries(env)) {
    const t = v?.trim();
    out[k] = t ? t : undefined;
  }
  return out;
}

const indianPhone = z
  .string()
  .refine((v) => normalizeIndianPhone(v) !== null, "must be a valid Indian phone number, e.g. +91 98290 12345");
const indianMobile = z
  .string()
  .refine((v) => isValidIndianMobile(v), "must be an Indian mobile number (WhatsApp needs a mobile)");
const booleanString = z.enum(["true", "false"]);
const httpsUrl = z.url({ protocol: /^https?$/ });

const publicSchema = z
  .object({
    NEXT_PUBLIC_SITE_URL: httpsUrl.refine((v) => !v.endsWith("/"), "must not end with '/'"),
    NEXT_PUBLIC_BUSINESS_NAME: z.string().min(2),
    NEXT_PUBLIC_BUSINESS_PHONE: indianPhone,
    NEXT_PUBLIC_BUSINESS_EMAIL: z.email(),
    NEXT_PUBLIC_BUSINESS_ADDRESS_LINE1: z.string().min(3),
    NEXT_PUBLIC_BUSINESS_CITY: z.string().min(2),
    NEXT_PUBLIC_BUSINESS_STATE: z.string().min(2),
    NEXT_PUBLIC_BUSINESS_PINCODE: z.string().regex(/^[1-9]\d{5}$/, "must be a 6-digit Indian pincode"),
    NEXT_PUBLIC_BUSINESS_WHATSAPP: indianMobile.optional(),
    NEXT_PUBLIC_BUSINESS_PHONE_SECONDARY: indianPhone.optional(),
    NEXT_PUBLIC_BUSINESS_LAT: z.coerce.number().min(-90).max(90).optional(),
    NEXT_PUBLIC_BUSINESS_LNG: z.coerce.number().min(-180).max(180).optional(),
    NEXT_PUBLIC_BUSINESS_LOGO_URL: z
      .string()
      .refine((v) => v.startsWith("/") || v.startsWith("https://"), "must start with '/' or 'https://'")
      .optional(),
    NEXT_PUBLIC_SOCIAL_FACEBOOK: httpsUrl.optional(),
    NEXT_PUBLIC_SOCIAL_INSTAGRAM: httpsUrl.optional(),
    NEXT_PUBLIC_SOCIAL_YOUTUBE: httpsUrl.optional(),
    NEXT_PUBLIC_SOCIAL_LINKEDIN: httpsUrl.optional(),
    NEXT_PUBLIC_SOCIAL_X: httpsUrl.optional(),
    NEXT_PUBLIC_GA4_ID: z.string().regex(/^G-[A-Z0-9]+$/, "must look like G-XXXXXXX").optional(),
    NEXT_PUBLIC_GTM_ID: z.string().regex(/^GTM-[A-Z0-9]+$/, "must look like GTM-XXXXXX").optional(),
    NEXT_PUBLIC_META_PIXEL_ID: z.string().regex(/^\d{6,20}$/, "must be numeric").optional(),
    NEXT_PUBLIC_CLARITY_ID: z.string().regex(/^[a-z0-9]{6,20}$/i).optional(),
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z.string().optional(),
    NEXT_PUBLIC_ALLOW_INDEXING: booleanString.optional(),
    NEXT_PUBLIC_REQUIRE_ANALYTICS_CONSENT: booleanString.optional(),
    NEXT_PUBLIC_MAP_PROVIDER: z.enum(["osm", "google"]).optional(),
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (!env.NEXT_PUBLIC_BUSINESS_WHATSAPP && !isValidIndianMobile(env.NEXT_PUBLIC_BUSINESS_PHONE)) {
      ctx.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_BUSINESS_WHATSAPP"],
        message: "is required when NEXT_PUBLIC_BUSINESS_PHONE is a landline",
      });
    }
    if (env.NEXT_PUBLIC_MAP_PROVIDER === "google" && !env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      ctx.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"],
        message: "is required when NEXT_PUBLIC_MAP_PROVIDER=google",
      });
    }
    const usesPlaceholders =
      env.NEXT_PUBLIC_BUSINESS_NAME === "Demo Realty Jaipur" ||
      normalizeIndianPhone(env.NEXT_PUBLIC_BUSINESS_PHONE) === "+919000000000" ||
      (env.NEXT_PUBLIC_BUSINESS_EMAIL ?? "").endsWith("@example.com");
    if (env.NEXT_PUBLIC_ALLOW_INDEXING === "true" && usesPlaceholders) {
      ctx.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_ALLOW_INDEXING"],
        message: "cannot be true while placeholder business details are in use (see docs/ASSUMPTIONS.md)",
      });
    }
  });

const serverSchema = z.object({
  DATABASE_URL: z.string().regex(/^postgres(ql)?:\/\//, "must be a postgresql:// connection string"),
  AUTH_SECRET: z.string().min(32, "must be at least 32 characters"),
  IP_HASH_SALT: z.string().min(16).optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  LEAD_NOTIFICATION_EMAIL: z
    .string()
    .refine(
      (v) => v.split(",").every((e) => z.email().safeParse(e.trim()).success),
      "must be a comma-separated list of emails",
    )
    .optional(),
  STORAGE_DRIVER: z.enum(["local", "s3"]).optional(),
});

function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => `  • ${issue.path.join(".") || "(root)"} ${issue.message}`);
}

function assertValid(schema: z.ZodType, env: Env, label: string): void {
  const result = schema.safeParse(normalise(env));
  if (!result.success) {
    throw new Error(
      `Invalid ${label} environment variables:\n${formatIssues(result.error).join("\n")}\n` +
        "See .env.example and docs/SPEC.md §57.",
    );
  }
}

/** Public (NEXT_PUBLIC_*) values — checked at build and dev start from next.config.ts. */
export function assertPublicEnv(env: Env = process.env): void {
  assertValid(publicSchema, env, "public");
}

/** Server-only values — checked when the Node.js server starts (instrumentation.ts). */
export function assertServerEnv(env: Env = process.env): void {
  assertValid(serverSchema, env, "server");
  const s3 = normalise(env);
  if (s3.STORAGE_DRIVER === "s3") {
    const missing = ["S3_BUCKET", "S3_REGION", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_PUBLIC_URL"].filter(
      (k) => !s3[k],
    );
    if (missing.length) {
      throw new Error(`STORAGE_DRIVER=s3 requires: ${missing.join(", ")}`);
    }
  }
}
