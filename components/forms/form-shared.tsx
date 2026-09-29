"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { WhatsAppButton } from "@/components/shared/contact-buttons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/form-controls";
import type { ActionState } from "@/lib/actions/types";
import { readAttribution } from "@/lib/client/attribution";
import { siteConfig } from "@/lib/config";
import type { ContactPoint } from "@/lib/contact";
import { cn } from "@/lib/utils";

export interface LeadContext {
  propertyId?: string;
  projectId?: string;
  localityId?: string;
}

/**
 * Hidden fields every lead form sends: listing context, first-touch attribution, page URL,
 * a render timestamp (bot timing check) and a honeypot (SPEC §26, §30).
 */
export function HiddenLeadFields({ context }: { context: LeadContext }) {
  const [meta, setMeta] = useState<Record<string, string>>({});

  useEffect(() => {
    const attr = readAttribution();
    const next: Record<string, string> = { startedAt: String(Date.now()), pageUrl: window.location.href.slice(0, 500) };
    if (attr?.referrer) next.referrer = attr.referrer;
    else if (document.referrer) next.referrer = document.referrer.slice(0, 500);
    if (attr?.utmSource) next.utmSource = attr.utmSource;
    if (attr?.utmMedium) next.utmMedium = attr.utmMedium;
    if (attr?.utmCampaign) next.utmCampaign = attr.utmCampaign;
    if (attr?.utmTerm) next.utmTerm = attr.utmTerm;
    if (attr?.utmContent) next.utmContent = attr.utmContent;
    // Reading browser-only state after mount; one extra render is intended.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMeta(next);
  }, []);

  return (
    <>
      {context.propertyId ? <input type="hidden" name="propertyId" value={context.propertyId} /> : null}
      {context.projectId ? <input type="hidden" name="projectId" value={context.projectId} /> : null}
      {context.localityId ? <input type="hidden" name="localityId" value={context.localityId} /> : null}
      {Object.entries(meta).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      {siteConfig.turnstileSiteKey ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
          <div className="cf-turnstile" data-sitekey={siteConfig.turnstileSiteKey} data-size="flexible" />
        </>
      ) : null}
    </>
  );
}

export function ConsentField({ id, error }: { id: string; error?: string }) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-ink-600">
        <Checkbox id={id} name="consent" required aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className="mt-0.5" />
        <span>
          I agree to be contacted by {siteConfig.name} about this request by phone, WhatsApp or email, and accept the{" "}
          <Link href="/privacy-policy" className="font-medium text-brand-700 underline underline-offset-2">
            privacy policy
          </Link>
          .
        </span>
      </label>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-danger-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SubmitButton({ children, className, size = "lg" }: { children: ReactNode; className?: string; size?: "md" | "lg" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size={size} disabled={pending} className={cn("w-full", className)}>
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {pending ? "Sending…" : children}
    </Button>
  );
}

export function FormAlert({ state }: { state: ActionState }) {
  if (state.status !== "error" || !state.message) return null;
  return (
    <div role="alert" className="flex gap-2 rounded-xl border border-danger-600/25 bg-danger-50 px-3 py-2.5 text-sm text-danger-700">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {state.message}
    </div>
  );
}

export function SuccessPanel({ title = "Request received", message, whatsappMessage, contact, context, children }: {
  title?: string;
  message?: string;
  whatsappMessage?: string;
  contact?: ContactPoint;
  context: string;
  children?: ReactNode;
}) {
  return (
    <div role="status" className="rounded-xl bg-success-50 p-5 text-center">
      <CheckCircle2 className="mx-auto size-10 text-success-600" aria-hidden="true" />
      <p className="mt-3 font-semibold text-ink-950">{title}</p>
      {message ? <p className="mt-1 text-sm text-ink-700">{message}</p> : null}
      {children}
      {whatsappMessage ? (
        <div className="mt-4">
          <p className="mb-2 text-xs text-ink-500">Need a faster reply?</p>
          <WhatsAppButton message={whatsappMessage} contact={contact} context={context} className="w-full">
            Continue on WhatsApp
          </WhatsAppButton>
        </div>
      ) : null}
    </div>
  );
}

/** Purpose statement required next to forms (SPEC §50, DPDP Act 2023). */
export function PurposeNote() {
  return <p className="text-xs text-ink-500">We use your details only to respond to this request. We never sell your data.</p>;
}
