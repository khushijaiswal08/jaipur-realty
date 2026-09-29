import { z } from "zod";
import { ConstructionStatus, PropertyType, PublishStatus } from "@/generated/prisma/enums";
import { isValidIndianMobile, normalizeIndianPhone } from "@/lib/format/phone";
import { parsePrice } from "@/lib/format/price";
import {
  checkbox,
  idList,
  lineList,
  optionalDate,
  optionalFloat,
  optionalInt,
  optionalString,
  optionalUrl,
  requiredString,
} from "./form-helpers";

/** Site-relative upload path (/media/…, /placeholders/…) or absolute URL. */
const optionalAssetUrl = z
  .string()
  .trim()
  .optional()
  .transform((v, ctx) => {
    if (!v) return null;
    if (/^\/(media|placeholders|brand)\/[\w\-/.]+$/.test(v)) return v;
    try {
      const u = new URL(v);
      if (u.protocol === "https:" || u.protocol === "http:") return u.toString();
    } catch {
      /* fall through */
    }
    ctx.addIssue({ code: "custom", message: "Upload a file or enter a full https:// URL" });
    return z.NEVER;
  });

const pincode = z
  .string()
  .trim()
  .optional()
  .transform((v, ctx) => {
    if (!v) return null;
    if (!/^[1-9]\d{5}$/.test(v)) {
      ctx.addIssue({ code: "custom", message: "Enter a 6-digit pincode" });
      return z.NEVER;
    }
    return v;
  });

// ── Projects ──────────────────────────────────────────────────────────────────

const num = (v: unknown) => {
  if (v === null || v === undefined || String(v).trim() === "") return null;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const configurationRowSchema = z.object({
  label: z.string().trim().min(2, "Each configuration needs a label").max(80),
  propertyType: z.enum(PropertyType),
  bedrooms: z.unknown().transform((v) => {
    const n = num(v);
    return n !== null && Number.isInteger(n) && n <= 20 ? n : null;
  }),
  carpetAreaMin: z.unknown().transform(num),
  carpetAreaMax: z.unknown().transform(num),
  superAreaMin: z.unknown().transform(num),
  superAreaMax: z.unknown().transform(num),
  priceMin: z.unknown().transform((v) => (typeof v === "string" && v.trim() ? parsePrice(v) : null)),
  priceMax: z.unknown().transform((v) => (typeof v === "string" && v.trim() ? parsePrice(v) : null)),
  unitsAvailable: z.unknown().transform((v) => {
    const n = num(v);
    return n !== null && Number.isInteger(n) ? n : null;
  }),
  floorPlanUrl: z
    .unknown()
    .transform((v) => (typeof v === "string" && /^(\/(media|placeholders)\/[\w\-/.]+|https?:\/\/\S+)$/.test(v.trim()) ? v.trim() : null)),
});

export type ConfigurationRow = z.infer<typeof configurationRowSchema>;

export const projectAdminSchema = z.object({
  name: requiredString(3, 100, "Name"),
  developerName: requiredString(2, 100, "Developer"),
  developerDescription: optionalString(3000),
  reraNumber: optionalString(80),
  status: z.enum(PublishStatus),
  constructionStatus: z.enum(ConstructionStatus),
  launchDate: optionalDate,
  possessionDate: optionalDate,
  totalUnits: optionalInt(1, 100_000),
  totalTowers: optionalInt(1, 500),
  totalFloors: optionalInt(1, 200),
  landAreaAcres: optionalFloat(0.01, 100_000),
  description: requiredString(20, 8000, "Description"),
  highlights: lineList(12, 120),
  priceOnRequest: checkbox,
  address: optionalString(300),
  pincode,
  latitude: optionalFloat(-90, 90),
  longitude: optionalFloat(-180, 180),
  localityId: z.string().regex(/^[a-z0-9]{20,32}$/, "Choose a locality"),
  brochureUrl: optionalAssetUrl,
  videoUrl: optionalUrl,
  isFeatured: checkbox,
  amenityIds: idList,
  seoTitle: optionalString(70),
  seoDescription: optionalString(170),
  configurations: z
    .string()
    .optional()
    .transform((v, ctx) => {
      try {
        const parsed: unknown = JSON.parse(v || "[]");
        const rows = z.array(configurationRowSchema).max(20).safeParse(parsed);
        if (!rows.success) {
          ctx.addIssue({ code: "custom", message: rows.error.issues[0]?.message ?? "Check the configurations" });
          return z.NEVER;
        }
        return rows.data;
      } catch {
        ctx.addIssue({ code: "custom", message: "Configurations could not be read" });
        return z.NEVER;
      }
    }),
});

export type ProjectAdminInput = z.infer<typeof projectAdminSchema>;

// ── Localities ────────────────────────────────────────────────────────────────

export const localityAdminSchema = z.object({
  name: requiredString(2, 80, "Name"),
  zone: optionalString(40),
  pincode,
  description: optionalString(4000),
  highlights: lineList(10, 120),
  connectivity: lineList(10, 160),
  latitude: optionalFloat(-90, 90),
  longitude: optionalFloat(-180, 180),
  avgPricePerSqft: optionalInt(100, 1_000_000),
  avgRent2Bhk: optionalInt(500, 10_000_000),
  imageUrl: optionalAssetUrl,
  isFeatured: checkbox,
  sortOrder: optionalInt(0, 10_000),
  seoTitle: optionalString(70),
  seoDescription: optionalString(170),
});

export type LocalityAdminInput = z.infer<typeof localityAdminSchema>;

// ── Agents ────────────────────────────────────────────────────────────────────

const optionalPhone = (mobileOnly: boolean) =>
  z
    .string()
    .trim()
    .optional()
    .transform((v, ctx) => {
      if (!v) return null;
      const ok = mobileOnly ? isValidIndianMobile(v) : normalizeIndianPhone(v) !== null;
      if (!ok) {
        ctx.addIssue({ code: "custom", message: mobileOnly ? "Enter an Indian mobile number" : "Enter an Indian phone number" });
        return z.NEVER;
      }
      return normalizeIndianPhone(v);
    });

export const agentAdminSchema = z.object({
  name: requiredString(2, 80, "Name"),
  designation: optionalString(80),
  phone: optionalPhone(false),
  whatsapp: optionalPhone(true),
  email: z
    .union([z.literal(""), z.email("Enter a valid email")])
    .optional()
    .transform((v) => (v ? v.toLowerCase() : null)),
  photoUrl: optionalAssetUrl,
  bio: optionalString(2000),
  languages: z
    .string()
    .optional()
    .transform((v) =>
      (v ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 8),
    ),
  experienceYears: optionalInt(0, 70),
  reraAgentNumber: optionalString(80),
  isActive: checkbox,
  sortOrder: optionalInt(0, 10_000),
});

export type AgentAdminInput = z.infer<typeof agentAdminSchema>;
