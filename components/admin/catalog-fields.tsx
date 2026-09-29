import { AMENITY_CATEGORY_LABELS, CONSTRUCTION_STATUS_LABELS, PUBLISH_STATUS_LABELS, toOptions } from "@/lib/constants/enums";
import { toIstDateString } from "@/lib/format/date";
import type { ProjectForEdit } from "@/services/admin/catalog-admin.service";
import type { PropertyFormOptions } from "@/services/admin/property-admin.service";
import { AssetField } from "./asset-field";
import { ConfigurationsEditor } from "./configurations-editor";
import { CheckboxField, CheckboxGroup, FormSection, SelectField, TextAreaField, TextField } from "./form-fields";

const s = (v: number | string | null | undefined) => (v === null || v === undefined ? "" : String(v));
const d = (v: Date | null | undefined) => (v ? toIstDateString(v) : "");

/** Field groups for the project editor (SPEC §10, §44). Rendered inside <ActionForm>. */
export function ProjectFields({ project: p, options }: { project?: ProjectForEdit; options: Pick<PropertyFormOptions, "localities" | "amenities"> }) {
  return (
    <div className="space-y-5">
      <FormSection title="Basics">
        <TextField name="name" label="Project name" required defaultValue={p?.name} />
        <TextField name="developerName" label="Developer" required defaultValue={p?.developerName} />
        <SelectField name="localityId" label="Locality" required defaultValue={p?.localityId} options={options.localities.map((l) => ({ value: l.id, label: l.name }))} placeholder="Choose…" />
        <SelectField name="status" label="Publishing" defaultValue={p?.status ?? "DRAFT"} options={toOptions(PUBLISH_STATUS_LABELS)} />
        <SelectField name="constructionStatus" label="Construction status" defaultValue={p?.constructionStatus ?? "UNDER_CONSTRUCTION"} options={toOptions(CONSTRUCTION_STATUS_LABELS)} />
        <TextField name="reraNumber" label="RERA number" defaultValue={p?.reraNumber} hint="Only a real registration number" />
        <CheckboxField name="isFeatured" label="Featured" defaultChecked={p?.isFeatured} />
        <CheckboxField name="priceOnRequest" label="Price on request" defaultChecked={p?.priceOnRequest} />
        <TextAreaField name="description" label="Description" required rows={6} defaultValue={p?.description} className="sm:col-span-2 lg:col-span-3" />
        <TextAreaField name="highlights" label="Highlights (one per line)" rows={4} defaultValue={p?.highlights.join("\n")} className="sm:col-span-2 lg:col-span-3" />
      </FormSection>

      <FormSection title="Configurations & prices">
        <ConfigurationsEditor
          initial={(p?.configurations ?? []).map((c) => ({
            label: c.label,
            propertyType: c.propertyType,
            bedrooms: s(c.bedrooms),
            carpetAreaMin: s(c.carpetAreaMin),
            carpetAreaMax: s(c.carpetAreaMax),
            superAreaMin: s(c.superAreaMin),
            superAreaMax: s(c.superAreaMax),
            priceMin: s(c.priceMin),
            priceMax: s(c.priceMax),
            unitsAvailable: s(c.unitsAvailable),
            floorPlanUrl: s(c.floorPlanUrl),
          }))}
        />
      </FormSection>

      <FormSection title="Timeline & scale">
        <TextField name="launchDate" label="Launch date" type="date" defaultValue={d(p?.launchDate)} />
        <TextField name="possessionDate" label="Possession date" type="date" defaultValue={d(p?.possessionDate)} />
        <TextField name="totalUnits" label="Total units" defaultValue={s(p?.totalUnits)} inputMode="numeric" />
        <TextField name="totalTowers" label="Towers" defaultValue={s(p?.totalTowers)} inputMode="numeric" />
        <TextField name="totalFloors" label="Floors per tower" defaultValue={s(p?.totalFloors)} inputMode="numeric" />
        <TextField name="landAreaAcres" label="Land area (acres)" defaultValue={s(p?.landAreaAcres)} inputMode="decimal" />
      </FormSection>

      <FormSection title="Location">
        <TextField name="address" label="Address" defaultValue={p?.address} className="sm:col-span-2" />
        <TextField name="pincode" label="Pincode" defaultValue={p?.pincode} inputMode="numeric" />
        <TextField name="latitude" label="Latitude" defaultValue={s(p?.latitude)} inputMode="decimal" />
        <TextField name="longitude" label="Longitude" defaultValue={s(p?.longitude)} inputMode="decimal" />
      </FormSection>

      <section className="rounded-card border border-ink-100 bg-white p-5">
        <h2 className="mb-4 font-semibold text-ink-950">Amenities</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(AMENITY_CATEGORY_LABELS).map(([cat, label]) => {
            const items = options.amenities.filter((a) => a.category === cat);
            return items.length ? (
              <CheckboxGroup key={cat} name="amenityIds" label={label} options={items.map((a) => ({ value: a.id, label: a.name }))} selected={p?.amenityIds ?? []} columns={2} />
            ) : null;
          })}
        </div>
      </section>

      <FormSection title="Developer, media & SEO">
        <TextAreaField name="developerDescription" label="About the developer" rows={3} defaultValue={p?.developerDescription} className="sm:col-span-2 lg:col-span-3" />
        <AssetField name="brochureUrl" label="Brochure (PDF)" kind="pdf" defaultValue={p?.brochureUrl} hint="Shared with visitors who request the brochure." />
        <TextField name="videoUrl" label="YouTube video URL" type="url" defaultValue={p?.videoUrl} />
        <TextField name="seoTitle" label="SEO title" defaultValue={p?.seoTitle} hint="Max 70 characters" />
        <TextAreaField name="seoDescription" label="SEO description" rows={2} defaultValue={p?.seoDescription} className="sm:col-span-2 lg:col-span-3" />
      </FormSection>
    </div>
  );
}
