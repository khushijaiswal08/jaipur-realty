// Indian phone number helpers. SPEC §24.1.
// Deliberately dependency-free (imported by next.config.ts via lib/config/validate.ts).

const MOBILE = /^[6-9]\d{9}$/;
// STD code (2–4 digits, not starting with 0) + subscriber number = 10 digits.
const LANDLINE = /^[1-5]\d{9}$/;
const JAIPUR_STD = "141";

/** Returns the 10-digit national number, or null. Accepts +91 / 91 / 0 prefixes and separators. */
export function toNationalNumber(input: string | null | undefined): string | null {
  if (!input) return null;
  const digits = input.replace(/[^\d]/g, "");
  let national: string;
  if (digits.length === 10) national = digits;
  else if (digits.length === 11 && digits.startsWith("0")) national = digits.slice(1);
  else if (digits.length === 12 && digits.startsWith("91")) national = digits.slice(2);
  else if (digits.length === 13 && digits.startsWith("091")) national = digits.slice(3);
  else return null;
  return MOBILE.test(national) || LANDLINE.test(national) ? national : null;
}

/** Normalises to E.164 ("+919829012345"), or null when not a valid Indian number. */
export function normalizeIndianPhone(input: string | null | undefined): string | null {
  const national = toNationalNumber(input);
  return national ? `+91${national}` : null;
}

/** True for Indian mobile numbers only (landlines are rejected — lead forms need a mobile). */
export function isValidIndianMobile(input: string | null | undefined): boolean {
  const national = toNationalNumber(input);
  return national !== null && MOBILE.test(national);
}

/** "+91 98290 12345" (mobile) · "+91 141 234 5678" (Jaipur landline). */
export function formatPhone(input: string | null | undefined): string {
  const national = toNationalNumber(input);
  if (!national) return input ?? "";
  if (MOBILE.test(national)) return `+91 ${national.slice(0, 5)} ${national.slice(5)}`;
  if (national.startsWith(JAIPUR_STD)) {
    return `+91 ${JAIPUR_STD} ${national.slice(3, 6)} ${national.slice(6)}`;
  }
  return `+91 ${national.slice(0, 5)} ${national.slice(5)}`;
}

/** "tel:+919829012345" */
export function telHref(input: string | null | undefined): string | null {
  const e164 = normalizeIndianPhone(input);
  return e164 ? `tel:${e164}` : null;
}

/** Digits without "+", as wa.me expects: "919829012345". */
export function whatsappDigits(input: string | null | undefined): string | null {
  const e164 = normalizeIndianPhone(input);
  return e164 ? e164.slice(1) : null;
}
