// Contact helpers bound to the site config: business fallbacks for agents, WhatsApp/call links.

import { siteConfig } from "@/lib/config";
import { isValidIndianMobile, normalizeIndianPhone, telHref } from "@/lib/format/phone";
import { buildWhatsAppUrl, generalMessage } from "@/lib/whatsapp";

export interface ContactPoint {
  /** E.164 */
  phone: string;
  /** E.164 mobile */
  whatsapp: string;
}

/** Agent numbers when present, otherwise the business numbers (SPEC §20, §24.2). */
export function resolveContact(agent?: { phone: string | null; whatsapp: string | null } | null): ContactPoint {
  const agentPhone = normalizeIndianPhone(agent?.phone);
  const agentWhatsApp =
    normalizeIndianPhone(agent?.whatsapp) ?? (agentPhone && isValidIndianMobile(agentPhone) ? agentPhone : null);
  return {
    phone: agentPhone ?? siteConfig.phone,
    whatsapp: agentWhatsApp ?? siteConfig.whatsapp,
  };
}

export function whatsAppHref(message?: string, contact: ContactPoint = resolveContact()): string {
  return (
    buildWhatsAppUrl(contact.whatsapp, message ?? generalMessage(siteConfig.name)) ?? `mailto:${siteConfig.email}`
  );
}

export function callHref(contact: ContactPoint = resolveContact()): string {
  return telHref(contact.phone) ?? `mailto:${siteConfig.email}`;
}
