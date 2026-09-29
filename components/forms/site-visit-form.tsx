"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { Field, Input, fieldDescribedBy } from "@/components/ui/form-controls";
import { submitSiteVisit } from "@/lib/actions/leads";
import { initialActionState } from "@/lib/actions/types";
import { track } from "@/lib/client/track";
import type { ContactPoint } from "@/lib/contact";
import { formatDateTime } from "@/lib/format/date";
import { bookableDates, bookableSlots, slotLabel } from "@/lib/site-visit";
import { cn } from "@/lib/utils";
import { ConsentField, FormAlert, HiddenLeadFields, PurposeNote, SubmitButton, SuccessPanel, type LeadContext } from "./form-shared";

const weekdayFmt = new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "Asia/Kolkata" });
const dayFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

function Chip({ name, value, checked, onChange, children, id }: { name: string; value: string; checked: boolean; onChange: () => void; children: React.ReactNode; id: string }) {
  return (
    <label htmlFor={id} className="cursor-pointer">
      <input id={id} type="radio" name={name} value={value} checked={checked} onChange={onChange} className="peer sr-only" required />
      <span
        className={cn(
          "flex flex-col items-center rounded-xl border px-3 py-2 text-center text-sm transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-brand-600",
          checked ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-200 bg-white text-ink-700 hover:border-ink-300",
        )}
      >
        {children}
      </span>
    </label>
  );
}

/** Site visit booking (SPEC §27): next 14 days × hourly slots, confirmed by the team. */
export function SiteVisitForm({ context, contact, whatsappMessage, trackContext }: { context: LeadContext; contact?: ContactPoint; whatsappMessage?: string; trackContext: string }) {
  const [state, action] = useActionState(submitSiteVisit, initialActionState);
  const uid = useId();
  const id = (s: string) => `${uid}-${s}`;
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  // Dates depend on "today" in the visitor's session, so they're computed after mount.
  const [dates, setDates] = useState<string[] | null>(null);
  const [date, setDate] = useState(v.date ?? "");
  const [slot, setSlot] = useState(v.slot ?? "");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDates(bookableDates());
  }, []);

  useEffect(() => {
    if (state.status === "success") track("site_visit_request", { context: trackContext, propertyId: context.propertyId, projectId: context.projectId });
  }, [state.status, state.submissionId, trackContext, context.propertyId, context.projectId]);

  if (state.status === "success") {
    return (
      <SuccessPanel title="Visit requested" message={state.message} whatsappMessage={whatsappMessage} contact={contact} context={`${trackContext}_success`}>
        {state.data?.scheduledAt ? <p className="mt-2 text-sm font-semibold text-ink-900">{formatDateTime(state.data.scheduledAt)}</p> : null}
      </SuccessPanel>
    );
  }

  return (
    <form key={state.submissionId ?? 0} action={action} className="relative space-y-4" noValidate>
      <HiddenLeadFields context={context} />
      <FormAlert state={state} />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink-800">Choose a day</legend>
        {dates ? (
          <div className="relative -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {dates.map((d) => {
              const at = new Date(`${d}T12:00:00+05:30`);
              return (
                <Chip key={d} id={id(`date-${d}`)} name="date" value={d} checked={date === d} onChange={() => setDate(d)}>
                  <span className="text-xs text-ink-500">{weekdayFmt.format(at)}</span>
                  <span className="whitespace-nowrap font-semibold">{dayFmt.format(at)}</span>
                </Chip>
              );
            })}
          </div>
        ) : (
          <Input type="date" name="date" defaultValue={v.date} required aria-label="Visit date" />
        )}
        {e.date ? (
          <p role="alert" className="mt-1 text-sm text-danger-700">
            {e.date}
          </p>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink-800">Preferred time</legend>
        <div className="grid grid-cols-2 gap-2">
          {bookableSlots().map((h) => (
            <Chip key={h} id={id(`slot-${h}`)} name="slot" value={String(h)} checked={slot === String(h)} onChange={() => setSlot(String(h))}>
              <span className="whitespace-nowrap text-xs font-semibold">{slotLabel(h)}</span>
            </Chip>
          ))}
        </div>
        {e.slot ? (
          <p role="alert" className="mt-1 text-sm text-danger-700">
            {e.slot}
          </p>
        ) : null}
      </fieldset>

      <Field id={id("name")} label="Your name" required error={e.name}>
        <Input id={id("name")} name="name" autoComplete="name" required defaultValue={v.name} aria-invalid={Boolean(e.name)} aria-describedby={fieldDescribedBy(id("name"), e.name)} />
      </Field>
      <Field id={id("phone")} label="Mobile number" required error={e.phone}>
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
          aria-describedby={fieldDescribedBy(id("phone"), e.phone)}
        />
      </Field>

      <ConsentField id={id("consent")} error={e.consent} />
      <SubmitButton>Request site visit</SubmitButton>
      <PurposeNote />
    </form>
  );
}
