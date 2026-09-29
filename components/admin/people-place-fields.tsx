import type { Agent, Locality } from "@/generated/prisma/client";
import { AssetField } from "./asset-field";
import { CheckboxField, FormSection, TextAreaField, TextField } from "./form-fields";

const s = (v: number | string | null | undefined) => (v === null || v === undefined ? "" : String(v));

/** Locality content & indicative rates (SPEC §11). */
export function LocalityFields({ locality: l }: { locality?: Locality }) {
  return (
    <div className="space-y-5">
      <FormSection title="Locality">
        <TextField name="name" label="Name" required defaultValue={l?.name} />
        <TextField name="zone" label="Zone" defaultValue={l?.zone} placeholder="West, South-East…" />
        <TextField name="pincode" label="Pincode" defaultValue={l?.pincode} inputMode="numeric" />
        <TextField name="latitude" label="Centroid latitude" defaultValue={s(l?.latitude)} inputMode="decimal" />
        <TextField name="longitude" label="Centroid longitude" defaultValue={s(l?.longitude)} inputMode="decimal" />
        <TextField name="sortOrder" label="Sort order" defaultValue={s(l?.sortOrder)} inputMode="numeric" />
        <CheckboxField name="isFeatured" label="Featured on home page" defaultChecked={l?.isFeatured} />
        <TextAreaField name="description" label="Description" rows={5} defaultValue={l?.description} className="sm:col-span-2 lg:col-span-3" />
        <TextAreaField name="highlights" label="Highlights (one per line)" rows={4} defaultValue={l?.highlights.join("\n")} />
        <TextAreaField name="connectivity" label="Connectivity (one per line)" rows={4} defaultValue={l?.connectivity.join("\n")} className="sm:col-span-2" />
      </FormSection>
      <FormSection title="Indicative rates" description="Shown as “indicative” on the site. Update periodically.">
        <TextField name="avgPricePerSqft" label="Avg. sale rate (₹/sq ft)" defaultValue={s(l?.avgPricePerSqft)} inputMode="numeric" />
        <TextField name="avgRent2Bhk" label="Typical 2 BHK rent (₹/month)" defaultValue={s(l?.avgRent2Bhk)} inputMode="numeric" />
      </FormSection>
      <FormSection title="Image & SEO">
        <AssetField name="imageUrl" label="Locality image" defaultValue={l?.imageUrl} />
        <TextField name="seoTitle" label="SEO title" defaultValue={l?.seoTitle} hint="Max 70 characters" />
        <TextAreaField name="seoDescription" label="SEO description" rows={2} defaultValue={l?.seoDescription} className="sm:col-span-2" />
      </FormSection>
    </div>
  );
}

/** Agent profile (SPEC §20, §42.3). */
export function AgentFields({ agent: a }: { agent?: Agent }) {
  return (
    <FormSection title="Profile">
      <TextField name="name" label="Name" required defaultValue={a?.name} />
      <TextField name="designation" label="Designation" defaultValue={a?.designation} placeholder="Property Consultant" />
      <TextField name="experienceYears" label="Experience (years)" defaultValue={s(a?.experienceYears)} inputMode="numeric" />
      <TextField name="phone" label="Phone" defaultValue={a?.phone} inputMode="tel" hint="Blank = business phone" />
      <TextField name="whatsapp" label="WhatsApp (mobile)" defaultValue={a?.whatsapp} inputMode="tel" hint="Blank = phone, then business WhatsApp" />
      <TextField name="email" label="Email" type="email" defaultValue={a?.email} />
      <TextField name="languages" label="Languages (comma-separated)" defaultValue={a?.languages.join(", ")} placeholder="Hindi, English" />
      <TextField name="reraAgentNumber" label="RERA agent number" defaultValue={a?.reraAgentNumber} />
      <TextField name="sortOrder" label="Sort order" defaultValue={s(a?.sortOrder)} inputMode="numeric" />
      <CheckboxField name="isActive" label="Active" defaultChecked={a?.isActive ?? true} />
      <AssetField name="photoUrl" label="Photo" defaultValue={a?.photoUrl} />
      <TextAreaField name="bio" label="Bio" rows={4} defaultValue={a?.bio} className="sm:col-span-2 lg:col-span-3" />
    </FormSection>
  );
}
