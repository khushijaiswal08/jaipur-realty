// zod building blocks for admin forms: every FormData value arrives as a string.

import { z } from "zod";
import { parsePrice } from "@/lib/format/price";

const blank = (v: unknown) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

export const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .optional()
    .transform((v) => (v ? v : null));

export const requiredString = (min: number, max: number, label: string) =>
  z.string().trim().min(min, `${label} must be at least ${min} characters`).max(max, `${label} must be under ${max} characters`);

export const optionalInt = (min: number, max: number) =>
  z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (blank(v)) return null;
      const n = Number(String(v).replace(/,/g, ""));
      if (!Number.isInteger(n) || n < min || n > max) {
        ctx.addIssue({ code: "custom", message: `Enter a whole number between ${min} and ${max}` });
        return z.NEVER;
      }
      return n;
    });

export const optionalFloat = (min: number, max: number) =>
  z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (blank(v)) return null;
      const n = Number(String(v).replace(/,/g, ""));
      if (!Number.isFinite(n) || n < min || n > max) {
        ctx.addIssue({ code: "custom", message: `Enter a number between ${min} and ${max}` });
        return z.NEVER;
      }
      return n;
    });

/** Rupees; accepts 4500000, 45,00,000, 45L, 1.2Cr, 18k. */
export const optionalMoney = z
  .string()
  .optional()
  .transform((v, ctx) => {
    if (blank(v)) return null;
    const n = parsePrice(String(v));
    if (n === null) {
      ctx.addIssue({ code: "custom", message: "Enter an amount like 4500000, 45L or 1.2Cr" });
      return z.NEVER;
    }
    return n;
  });

/** <input type="date"> value → Date (noon IST to avoid day shifts) or null. */
export const optionalDate = z
  .string()
  .optional()
  .transform((v, ctx) => {
    if (blank(v)) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(v))) {
      ctx.addIssue({ code: "custom", message: "Enter a valid date" });
      return z.NEVER;
    }
    return new Date(`${v}T12:00:00+05:30`);
  });

export const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on" || v === "true" || v === "1");

/** "" → null, "yes" → true, "no" → false. */
export const triState = z
  .enum(["", "yes", "no"])
  .optional()
  .transform((v) => (v === "yes" ? true : v === "no" ? false : null));

export const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((v, ctx) => {
    if (!v) return null;
    try {
      const u = new URL(v);
      if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
      return u.toString();
    } catch {
      ctx.addIssue({ code: "custom", message: "Enter a full URL starting with https://" });
      return z.NEVER;
    }
  });

export const optionalId = z
  .string()
  .optional()
  .transform((v) => (v && /^[a-z0-9]{20,32}$/.test(v) ? v : null));

/** Multi-value field (checkbox group) from FormData.getAll. */
export const idList = z.array(z.string().regex(/^[a-z0-9]{20,32}$/)).default([]);

/** Newline-separated textarea → trimmed list. */
export const lineList = (maxItems: number, maxLen: number) =>
  z
    .string()
    .optional()
    .transform((v) =>
      (v ?? "")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, maxItems)
        .map((s) => s.slice(0, maxLen)),
    );

/** FormData → plain object; repeated keys listed in `multi` become arrays. */
export function formValues(formData: FormData, multi: readonly string[] = []): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$ACTION")) continue;
    out[key] = multi.includes(key) ? formData.getAll(key).map(String) : String(formData.get(key) ?? "");
  }
  for (const key of multi) out[key] ??= [];
  return out;
}
