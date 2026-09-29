"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PropertyType } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, fieldDescribedBy } from "@/components/ui/form-controls";
import { submitOwnerListing } from "@/lib/actions/leads";
import { initialActionState } from "@/lib/actions/types";
import { track } from "@/lib/client/track";
import { PROPERTY_TYPE_CATEGORY, PROPERTY_TYPE_LABELS } from "@/lib/constants/enums";
import { AREA_UNIT_NAMES } from "@/lib/format/area";
import { cn } from "@/lib/utils";
import { ownerListingMessage } from "@/lib/whatsapp";
import { ConsentField, FormAlert, HiddenLeadFields, PurposeNote, SubmitButton, SuccessPanel } from "./form-shared";

const STEPS = [
  { title: "Property", fields: ["transactionType", "propertyType", "bedrooms"] },
  { title: "Location", fields: ["localitySlug", "localityText", "address"] },
  { title: "Price & size", fields: ["expectedPrice", "area", "areaUnit", "description"] },
  { title: "Your details", fields: ["ownerName", "ownerPhone", "ownerEmail", "consent"] },
] as const;

/** "Post your property" (SPEC §19): 4-step form; never auto-published — staff verify first. */
export function OwnerListingForm({ localities }: { localities: Array<{ name: string; slug: string }> }) {
  const [state, action] = useActionState(submitOwnerListing, initialActionState);
  const uid = useId();
  const id = (s: string) => `${uid}-${s}`;
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  const [step, setStep] = useState(0);
  const [tx, setTx] = useState<"SALE" | "RENT">((v.transactionType as "SALE" | "RENT") ?? "SALE");
  const [type, setType] = useState<PropertyType>((v.propertyType as PropertyType) ?? "APARTMENT");
  const [locality, setLocality] = useState(v.localitySlug ?? "");
  const formRef = useRef<HTMLFormElement>(null);
  const stepRefs = useRef<Array<HTMLFieldSetElement | null>>([]);

  // After a server error, jump to the first step that has an invalid field.
  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) return;
    const first = STEPS.findIndex((s) => s.fields.some((f) => state.fieldErrors?.[f]));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (first >= 0) setStep(first);
  }, [state]);

  useEffect(() => {
    if (state.status === "success") track("owner_listing_submit", { transactionType: tx, propertyType: type });
  }, [state.status, state.submissionId, tx, type]);

  if (state.status === "success") {
    return (
      <SuccessPanel
        title="Listing received"
        message={state.message}
        whatsappMessage={ownerListingMessage({ transactionType: tx, localityName: localities.find((l) => l.slug === locality)?.name })}
        context="owner_listing_success"
      >
        <p className="mt-2 text-sm text-ink-600">You can share photos with us on WhatsApp.</p>
      </SuccessPanel>
    );
  }

  const isBuilt = PROPERTY_TYPE_CATEGORY[type] !== "LAND";
  const next = () => {
    const current = stepRefs.current[step];
    const invalid = current?.querySelector<HTMLInputElement | HTMLSelectElement>(":invalid");
    if (invalid) {
      invalid.reportValidity();
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    // noValidate: steps are checked on "Continue" and the server validates everything; native
    // validation on submit would trip over fields inside hidden steps.
    <form ref={formRef} key={state.submissionId ?? 0} action={action} className="relative scroll-mt-24" noValidate>
      <HiddenLeadFields context={{}} />
      <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s.title} aria-current={i === step ? "step" : undefined}>
            <span className={cn("block h-1.5 rounded-full", i <= step ? "bg-brand-600" : "bg-ink-100")} />
            <span className={cn("mt-1.5 block text-xs font-medium", i === step ? "text-ink-950" : "text-ink-500")}>
              {i + 1}. {s.title}
            </span>
          </li>
        ))}
      </ol>

      <FormAlert state={state} />

      <fieldset ref={(el) => void (stepRefs.current[0] = el)} hidden={step !== 0} className="space-y-4">
        <legend className="sr-only">Property</legend>
        <div>
          <p className="mb-2 text-sm font-medium text-ink-800">I want to</p>
          <div className="grid grid-cols-2 gap-2">
            {(["SALE", "RENT"] as const).map((t) => (
              <label key={t} className="cursor-pointer">
                <input type="radio" name="transactionType" value={t} checked={tx === t} onChange={() => setTx(t)} className="peer sr-only" />
                <span className="block rounded-xl border border-ink-200 px-4 py-3 text-center font-semibold text-ink-700 peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:text-brand-800 peer-focus-visible:outline-2 peer-focus-visible:outline-brand-600">
                  {t === "SALE" ? "Sell" : "Rent out"}
                </span>
              </label>
            ))}
          </div>
        </div>
        <Field id={id("type")} label="Property type" required error={e.propertyType}>
          <Select id={id("type")} name="propertyType" value={type} onChange={(ev) => setType(ev.target.value as PropertyType)} required>
            {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((t) => (
              <option key={t} value={t}>
                {PROPERTY_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </Field>
        {isBuilt && PROPERTY_TYPE_CATEGORY[type] === "RESIDENTIAL" ? (
          <Field id={id("bedrooms")} label="Bedrooms" error={e.bedrooms}>
            <Select id={id("bedrooms")} name="bedrooms" defaultValue={v.bedrooms ?? ""}>
              <option value="">Select</option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n === 6 ? "6+" : n} BHK
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
      </fieldset>

      <fieldset ref={(el) => void (stepRefs.current[1] = el)} hidden={step !== 1} className="space-y-4">
        <legend className="sr-only">Location</legend>
        <Field id={id("locality")} label="Locality" required error={e.localitySlug}>
          <Select id={id("locality")} name="localitySlug" value={locality} onChange={(ev) => setLocality(ev.target.value)} required>
            <option value="">Select locality</option>
            {localities.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}
              </option>
            ))}
            <option value="other">Other (type below)</option>
          </Select>
        </Field>
        {locality === "other" ? (
          <Field id={id("localityText")} label="Locality name" required error={e.localityText}>
            <Input id={id("localityText")} name="localityText" required maxLength={80} defaultValue={v.localityText} />
          </Field>
        ) : null}
        <Field id={id("address")} label="Address / landmark (optional)" error={e.address} hint="Not shown publicly">
          <Input id={id("address")} name="address" maxLength={200} defaultValue={v.address} aria-describedby={fieldDescribedBy(id("address"), e.address, true)} />
        </Field>
      </fieldset>

      <fieldset ref={(el) => void (stepRefs.current[2] = el)} hidden={step !== 2} className="space-y-4">
        <legend className="sr-only">Price and size</legend>
        <Field id={id("price")} label={tx === "RENT" ? "Expected rent per month (₹)" : "Expected price (₹)"} error={e.expectedPrice} hint="e.g. 45L, 1.2Cr or 25000">
          <Input
            id={id("price")}
            name="expectedPrice"
            inputMode="decimal"
            defaultValue={v.expectedPrice}
            aria-invalid={Boolean(e.expectedPrice)}
            aria-describedby={fieldDescribedBy(id("price"), e.expectedPrice, true)}
          />
        </Field>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Field id={id("area")} label={isBuilt ? "Built-up area" : "Plot area"} error={e.area}>
            <Input id={id("area")} name="area" inputMode="decimal" defaultValue={v.area} aria-invalid={Boolean(e.area)} />
          </Field>
          <Field id={id("unit")} label="Unit">
            <Select id={id("unit")} name="areaUnit" defaultValue={v.areaUnit ?? (isBuilt ? "SQFT" : "SQYD")} className="w-36">
              {(Object.keys(AREA_UNIT_NAMES) as Array<keyof typeof AREA_UNIT_NAMES>).map((u) => (
                <option key={u} value={u}>
                  {AREA_UNIT_NAMES[u].split(" (")[0]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field id={id("desc")} label="Anything else we should know? (optional)" error={e.description}>
          <Textarea id={id("desc")} name="description" maxLength={2000} rows={4} defaultValue={v.description} placeholder="Floor, facing, furnishing, age, parking…" />
        </Field>
      </fieldset>

      <fieldset ref={(el) => void (stepRefs.current[3] = el)} hidden={step !== 3} className="space-y-4">
        <legend className="sr-only">Your details</legend>
        <Field id={id("ownerName")} label="Your name" required error={e.ownerName}>
          <Input id={id("ownerName")} name="ownerName" autoComplete="name" required minLength={2} defaultValue={v.ownerName} aria-invalid={Boolean(e.ownerName)} />
        </Field>
        <Field id={id("ownerPhone")} label="Mobile number" required error={e.ownerPhone}>
          <Input
            id={id("ownerPhone")}
            name="ownerPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            required
            placeholder="98290 12345"
            defaultValue={v.ownerPhone}
            aria-invalid={Boolean(e.ownerPhone)}
          />
        </Field>
        <Field id={id("ownerEmail")} label="Email (optional)" error={e.ownerEmail}>
          <Input id={id("ownerEmail")} name="ownerEmail" type="email" autoComplete="email" defaultValue={v.ownerEmail} aria-invalid={Boolean(e.ownerEmail)} />
        </Field>
        <ConsentField id={id("consent")} error={e.consent} />
      </fieldset>

      <div className="mt-6 flex items-center gap-3">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft aria-hidden="true" />
            Back
          </Button>
        ) : null}
        <div className="flex-1">
          {step < STEPS.length - 1 ? (
            <Button className="w-full" size="lg" onClick={next}>
              Continue
              <ArrowRight aria-hidden="true" />
            </Button>
          ) : (
            <SubmitButton>Submit property</SubmitButton>
          )}
        </div>
      </div>
      <div className="mt-3">
        <PurposeNote />
      </div>
    </form>
  );
}
