import { Phone } from "lucide-react";
import type { ReactNode } from "react";
import { buttonVariants, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { callHref, resolveContact, whatsAppHref, type ContactPoint } from "@/lib/contact";
import { formatPhone } from "@/lib/format/phone";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";

// Call/WhatsApp links carry data-track attributes; the analytics listener (SPEC §47) turns
// clicks into `call_click` / `whatsapp_click` events with this context.

interface TrackProps {
  /** Where the click happened, e.g. "header", "property_card", "property_detail". */
  context: string;
  propertyId?: string;
  projectId?: string;
}

function trackAttrs(event: string, { context, propertyId, projectId }: TrackProps) {
  return {
    "data-track": event,
    "data-track-context": context,
    ...(propertyId ? { "data-track-property": propertyId } : {}),
    ...(projectId ? { "data-track-project": projectId } : {}),
  };
}

interface ContactButtonProps extends TrackProps {
  contact?: ContactPoint;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
}

export function WhatsAppButton({
  message,
  contact = resolveContact(),
  variant = "whatsapp",
  size = "md",
  className,
  children,
  ...track
}: ContactButtonProps & { message?: string }) {
  return (
    <a
      href={whatsAppHref(message, contact)}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({ variant, size, className })}
      {...trackAttrs("whatsapp_click", track)}
    >
      <WhatsAppIcon />
      {children ?? (size === "icon" ? <span className="sr-only">Chat on WhatsApp</span> : "WhatsApp")}
    </a>
  );
}

export function CallButton({
  contact = resolveContact(),
  variant = "outline",
  size = "md",
  className,
  children,
  showNumber = false,
  ...track
}: ContactButtonProps & { showNumber?: boolean }) {
  return (
    <a href={callHref(contact)} className={buttonVariants({ variant, size, className })} {...trackAttrs("call_click", track)}>
      <Phone />
      {children ??
        (size === "icon" ? (
          <span className="sr-only">Call {formatPhone(contact.phone)}</span>
        ) : showNumber ? (
          formatPhone(contact.phone)
        ) : (
          "Call"
        ))}
    </a>
  );
}

/** Inline text link to call, e.g. in the header or footer. */
export function PhoneLink({ className, context, contact = resolveContact() }: { className?: string; context: string; contact?: ContactPoint }) {
  return (
    <a href={callHref(contact)} className={cn("inline-flex items-center gap-2", className)} {...trackAttrs("call_click", { context })}>
      <Phone className="size-4" aria-hidden="true" />
      <span>{formatPhone(contact.phone)}</span>
    </a>
  );
}
