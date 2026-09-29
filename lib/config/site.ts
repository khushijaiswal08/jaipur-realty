// Public site configuration — the ONLY place business identity and integration IDs are read
// from the environment (SPEC §34). Safe for client components: every NEXT_PUBLIC_* variable is
// referenced literally so Next.js can inline it into the browser bundle.
//
// Validation lives in ./validate.ts and runs from next.config.ts (build + dev start), so by the
// time this module executes the values are known to be well-formed.

import { normalizeIndianPhone } from "../format/phone";

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function num(value: string | undefined): number | undefined {
  const v = clean(value);
  if (v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

const phone = normalizeIndianPhone(clean(process.env.NEXT_PUBLIC_BUSINESS_PHONE)) ?? "";
const whatsapp = normalizeIndianPhone(clean(process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP)) ?? phone;
const lat = num(process.env.NEXT_PUBLIC_BUSINESS_LAT);
const lng = num(process.env.NEXT_PUBLIC_BUSINESS_LNG);
const name = clean(process.env.NEXT_PUBLIC_BUSINESS_NAME) ?? "";
const email = clean(process.env.NEXT_PUBLIC_BUSINESS_EMAIL) ?? "";
const googleMapsKey = clean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

export const PLACEHOLDER_VALUES = {
  name: "Demo Realty Jaipur",
  phoneE164: "+919000000000",
  emailDomain: "@example.com",
} as const;

export const siteConfig = {
  name,
  legalName: clean(process.env.NEXT_PUBLIC_BUSINESS_LEGAL_NAME) ?? name,
  tagline: clean(process.env.NEXT_PUBLIC_BUSINESS_TAGLINE),
  /** E.164, e.g. "+919829012345" */
  phone,
  secondaryPhone: normalizeIndianPhone(clean(process.env.NEXT_PUBLIC_BUSINESS_PHONE_SECONDARY)) ?? undefined,
  /** E.164 mobile used for WhatsApp; falls back to `phone`. */
  whatsapp,
  email,
  address: {
    line1: clean(process.env.NEXT_PUBLIC_BUSINESS_ADDRESS_LINE1) ?? "",
    line2: clean(process.env.NEXT_PUBLIC_BUSINESS_ADDRESS_LINE2),
    city: clean(process.env.NEXT_PUBLIC_BUSINESS_CITY) ?? "",
    state: clean(process.env.NEXT_PUBLIC_BUSINESS_STATE) ?? "",
    pincode: clean(process.env.NEXT_PUBLIC_BUSINESS_PINCODE) ?? "",
    country: "IN",
  },
  geo: lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
  officeHours: clean(process.env.NEXT_PUBLIC_BUSINESS_HOURS),
  logoUrl: clean(process.env.NEXT_PUBLIC_BUSINESS_LOGO_URL),
  reraAgentNumber: clean(process.env.NEXT_PUBLIC_RERA_AGENT_NUMBER),
  social: {
    facebook: clean(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK),
    instagram: clean(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM),
    youtube: clean(process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE),
    linkedin: clean(process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN),
    x: clean(process.env.NEXT_PUBLIC_SOCIAL_X),
  },
  /** Absolute, no trailing slash. */
  siteUrl: (clean(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000").replace(/\/+$/, ""),
  allowIndexing: clean(process.env.NEXT_PUBLIC_ALLOW_INDEXING) === "true",
  analytics: {
    ga4Id: clean(process.env.NEXT_PUBLIC_GA4_ID),
    gtmId: clean(process.env.NEXT_PUBLIC_GTM_ID),
    metaPixelId: clean(process.env.NEXT_PUBLIC_META_PIXEL_ID),
    clarityId: clean(process.env.NEXT_PUBLIC_CLARITY_ID),
    googleSiteVerification: clean(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION),
    requireConsent: clean(process.env.NEXT_PUBLIC_REQUIRE_ANALYTICS_CONSENT) === "true",
  },
  maps: {
    provider: (clean(process.env.NEXT_PUBLIC_MAP_PROVIDER) === "google" && googleMapsKey ? "google" : "osm") as
      | "google"
      | "osm",
    googleApiKey: googleMapsKey,
  },
  turnstileSiteKey: clean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
  /** True while any placeholder business detail from .env.example is still in use. */
  usesPlaceholders:
    name === PLACEHOLDER_VALUES.name ||
    phone === PLACEHOLDER_VALUES.phoneE164 ||
    email.endsWith(PLACEHOLDER_VALUES.emailDomain),
} as const;

export type SiteConfig = typeof siteConfig;

/** "/property/x" → "https://example.com/property/x" */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteConfig.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/** One-line postal address. */
export function formattedAddress(): string {
  const a = siteConfig.address;
  return [a.line1, a.line2, `${a.city}, ${a.state} ${a.pincode}`].filter(Boolean).join(", ");
}
