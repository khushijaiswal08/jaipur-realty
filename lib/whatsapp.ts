// WhatsApp link + prefilled-message builders. SPEC §24.2.
// Pure functions: business identity is passed in (see lib/contact.ts for config-bound helpers).

import { whatsappDigits } from "./format/phone";
import { truncate } from "./format/labels";

export const WHATSAPP_MESSAGE_MAX = 1000;

/** https://wa.me/919829012345?text=… — returns null for an invalid number. */
export function buildWhatsAppUrl(phone: string | null | undefined, message?: string): string | null {
  const digits = whatsappDigits(phone);
  if (!digits) return null;
  if (!message) return `https://wa.me/${digits}`;
  const text = message.length > WHATSAPP_MESSAGE_MAX ? message.slice(0, WHATSAPP_MESSAGE_MAX) : message;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function generalMessage(businessName: string): string {
  return `Hi ${businessName}, I'm looking for a property in Jaipur. Please share details.`;
}

export interface PropertyMessageInput {
  title: string;
  refCode: string;
  priceLabel: string;
  url: string;
}

/** Truncates the title first so the ref code and URL always survive. */
export function propertyMessage({ title, refCode, priceLabel, url }: PropertyMessageInput): string {
  const build = (t: string) =>
    `Hi, I'm interested in this property:\n${t}\nRef: ${refCode}\nPrice: ${priceLabel}\n${url}\n\nPlease share more details.`;
  const full = build(title);
  if (full.length <= WHATSAPP_MESSAGE_MAX) return full;
  const room = Math.max(20, title.length - (full.length - WHATSAPP_MESSAGE_MAX));
  return build(truncate(title, room));
}

export function projectMessage({ name, localityName, url }: { name: string; localityName: string; url: string }): string {
  return `Hi, I'd like details about ${name} in ${localityName}.\n${url}`;
}

export function localityMessage(localityName: string): string {
  return `Hi, I'm looking for properties in ${localityName}, Jaipur.`;
}

export function siteVisitMessage({ title, refCode }: { title: string; refCode: string }): string {
  return `Hi, I'd like to schedule a site visit for ${title} (Ref: ${refCode}).`;
}

export function ownerListingMessage({ transactionType, localityName }: { transactionType: "SALE" | "RENT"; localityName?: string }): string {
  const purpose = transactionType === "RENT" ? "rent" : "sale";
  return localityName
    ? `Hi, I want to list my property for ${purpose} in ${localityName}.`
    : `Hi, I want to list my property for ${purpose} in Jaipur.`;
}

export function shortlistMessage(items: ReadonlyArray<{ refCode: string; url: string }>): string {
  const lines = items.map((i) => `${i.refCode} – ${i.url}`);
  return `Hi, I'm interested in these properties:\n${lines.join("\n")}`;
}
