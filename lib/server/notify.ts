import "server-only";

import nodemailer, { type Transporter } from "nodemailer";
import { absoluteUrl, siteConfig } from "@/lib/config";
import { getLeadNotificationRecipients, getSmtpConfig } from "@/lib/config/server";
import { LEAD_SOURCE_LABELS } from "@/lib/constants/enums";
import { formatDateTime } from "@/lib/format/date";
import { formatPhone } from "@/lib/format/phone";

// Lead notifications (SPEC §29). Failures are logged and never block saving the lead.
// Without SMTP settings, notifications are written to the server log instead.

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;
  const smtp = getSmtpConfig();
  transporter = smtp
    ? nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.port === 465,
        auth: smtp.user ? { user: smtp.user, pass: smtp.password } : undefined,
      })
    : null;
  return transporter;
}

export interface LeadNotification {
  kind: "lead" | "site_visit" | "owner_listing";
  leadId: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: keyof typeof LEAD_SOURCE_LABELS;
  propertyTitle?: string;
  propertyRef?: string;
  projectName?: string;
  scheduledAt?: Date;
  deduped?: boolean;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function buildLeadEmail(n: LeadNotification): { subject: string; text: string; html: string } {
  const about = n.propertyTitle ? `${n.propertyTitle}${n.propertyRef ? ` (${n.propertyRef})` : ""}` : n.projectName;
  const subject = `${n.deduped ? "Repeat enquiry" : "New lead"}: ${LEAD_SOURCE_LABELS[n.source]} — ${n.name}${about ? ` — ${about}` : ""}`;
  const rows: Array<[string, string | undefined]> = [
    ["Source", LEAD_SOURCE_LABELS[n.source]],
    ["Name", n.name],
    ["Phone", formatPhone(n.phone)],
    ["Email", n.email],
    ["About", about],
    ["Visit requested", n.scheduledAt ? `${formatDateTime(n.scheduledAt)} IST` : undefined],
    ["Message", n.message],
  ];
  const present = rows.filter((r): r is [string, string] => Boolean(r[1]));
  const link = absoluteUrl(`/admin/leads/${n.leadId}`);
  const text = `${present.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nOpen in admin: ${link}`;
  const html = `<div style="font-family:system-ui,sans-serif;font-size:14px;color:#1b2638">
<h2 style="margin:0 0 12px">${escapeHtml(subject)}</h2>
<table cellpadding="6" style="border-collapse:collapse">${present
    .map(([k, v]) => `<tr><td style="color:#4f678b;vertical-align:top">${escapeHtml(k)}</td><td>${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`)
    .join("")}</table>
<p><a href="${escapeHtml(link)}">Open lead in admin</a></p>
<p style="color:#6f86a8;font-size:12px">${escapeHtml(siteConfig.name)} website</p></div>`;
  return { subject, text, html };
}

export async function notifyNewLead(n: LeadNotification): Promise<void> {
  const email = buildLeadEmail(n);
  const recipients = getLeadNotificationRecipients();
  const t = getTransporter();
  if (!t || !recipients.length) {
    console.info(`[lead] ${email.subject}\n${email.text}`);
    return;
  }
  try {
    const smtp = getSmtpConfig()!;
    await t.sendMail({ from: smtp.from, to: recipients, subject: email.subject, text: email.text, html: email.html, replyTo: n.email });
  } catch (error) {
    console.error("[lead] notification email failed", { leadId: n.leadId, error: error instanceof Error ? error.message : error });
  }
}
