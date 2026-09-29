"use client";

import { useActionState, useEffect, useId } from "react";
import { Field, Input, Textarea, fieldDescribedBy } from "@/components/ui/form-controls";
import { submitEnquiry } from "@/lib/actions/leads";
import { initialActionState } from "@/lib/actions/types";
import { track } from "@/lib/client/track";
import type { ContactPoint } from "@/lib/contact";
import { ConsentField, FormAlert, HiddenLeadFields, PurposeNote, SubmitButton, SuccessPanel, type LeadContext } from "./form-shared";

export type EnquirySource = "PROPERTY_ENQUIRY" | "PROJECT_ENQUIRY" | "CONTACT_FORM" | "CALLBACK_REQUEST" | "BROCHURE_REQUEST";

interface EnquiryFormProps {
  source: EnquirySource;
  context?: LeadContext;
  submitLabel?: string;
  defaultMessage?: string;
  /** Callback requests only need name + phone. */
  fields?: "full" | "minimal";
  /** Prefilled WhatsApp message offered on the success screen. */
  whatsappMessage?: string;
  contact?: ContactPoint;
  trackContext: string;
}

/** Enquiry / callback / brochure / contact form (SPEC §26) backed by the submitEnquiry Server Action. */
export function EnquiryForm({
  source,
  context = {},
  submitLabel = "Send enquiry",
  defaultMessage,
  fields = "full",
  whatsappMessage,
  contact,
  trackContext,
}: EnquiryFormProps) {
  const [state, action] = useActionState(submitEnquiry, initialActionState);
  const uid = useId();
  const id = (s: string) => `${uid}-${s}`;
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.status === "success") {
      track(source === "BROCHURE_REQUEST" ? "brochure_download" : "enquiry_submit", {
        source,
        context: trackContext,
        propertyId: context.propertyId,
        projectId: context.projectId,
      });
    }
  }, [state.status, state.submissionId, source, trackContext, context.propertyId, context.projectId]);

  if (state.status === "success") {
    return <SuccessPanel message={state.message} whatsappMessage={whatsappMessage} contact={contact} context={`${trackContext}_success`} />;
  }

  return (
    <form key={state.submissionId ?? 0} action={action} className="relative space-y-4" noValidate>
      <input type="hidden" name="source" value={source} />
      <HiddenLeadFields context={context} />
      <FormAlert state={state} />

      <Field id={id("name")} label="Your name" required error={e.name}>
        <Input
          id={id("name")}
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={60}
          defaultValue={v.name}
          aria-invalid={Boolean(e.name)}
          aria-describedby={fieldDescribedBy(id("name"), e.name)}
        />
      </Field>

      <Field id={id("phone")} label="Mobile number" required error={e.phone} hint="10-digit Indian mobile, WhatsApp preferred">
        <Input
          id={id("phone")}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required
          placeholder="98290 12345"
          defaultValue={v.phone}
          aria-invalid={Boolean(e.phone)}
          aria-describedby={fieldDescribedBy(id("phone"), e.phone, true)}
        />
      </Field>

      {fields === "full" ? (
        <>
          <Field id={id("email")} label="Email (optional)" error={e.email}>
            <Input
              id={id("email")}
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={v.email}
              aria-invalid={Boolean(e.email)}
              aria-describedby={fieldDescribedBy(id("email"), e.email)}
            />
          </Field>
          <Field id={id("message")} label="Message (optional)" error={e.message}>
            <Textarea
              id={id("message")}
              name="message"
              maxLength={1000}
              rows={3}
              defaultValue={v.message ?? defaultMessage}
              aria-invalid={Boolean(e.message)}
              aria-describedby={fieldDescribedBy(id("message"), e.message)}
            />
          </Field>
        </>
      ) : null}

      <ConsentField id={id("consent")} error={e.consent} />
      <SubmitButton>{submitLabel}</SubmitButton>
      <PurposeNote />
    </form>
  );
}
