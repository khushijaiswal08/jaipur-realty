"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import type { AreaUnit, PropertyType, TransactionType } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/types";
import { initialActionState } from "@/lib/actions/types";
import {
  AMENITY_CATEGORY_LABELS,
  CONSTRUCTION_STATUS_LABELS,
  FACING_LABELS,
  FURNISHING_LABELS,
  LISTED_BY_LABELS,
  LISTING_STATUS_LABELS,
  OWNERSHIP_TYPE_LABELS,
  PROPERTY_TYPE_CATEGORY,
  PROPERTY_TYPE_LABELS,
  TENANT_PREFERENCE_LABELS,
  TRANSACTION_TYPE_LABELS,
  toOptions,
} from "@/lib/constants/enums";
import { AREA_UNIT_NAMES, convertArea } from "@/lib/format/area";
import { toIstDateString } from "@/lib/format/date";
import { roundHalfUp } from "@/lib/format/number";
import type { PropertyForEdit, PropertyFormOptions } from "@/services/admin/property-admin.service";
import { CheckboxField, CheckboxGroup, FormMessage, FormSection, SelectField, TextAreaField, TextField } from "./form-fields";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
      {pending ? "Saving…" : isNew ? "Create property" : "Save changes"}
    </Button>
  );
}

const str = (v: number | string | null | undefined) => (v === null || v === undefined ? "" : String(v));
const dateStr = (d: Date | string | null | undefined) => (d ? toIstDateString(new Date(d)) : "");

/** Admin create/edit form for properties (SPEC §44). */
export function PropertyForm({ property, options, action }: { property?: PropertyForEdit; options: PropertyFormOptions; action: Action }) {
  const [state, formAction] = useActionState(action, initialActionState);
  const e = state.fieldErrors ?? {};
  const echoed = state.status === "error" ? state.values : undefined;
  // Echoed values (after a failed save) take precedence over the stored record.
  const v = (key: string, stored: string) => (echoed && key in echoed ? (echoed[key] ?? "") : stored);
  const p = property;

  const [tx, setTx] = useState<TransactionType>((v("transactionType", p?.transactionType ?? "SALE") as TransactionType) || "SALE");
  const [type, setType] = useState<PropertyType>((v("propertyType", p?.propertyType ?? "APARTMENT") as PropertyType) || "APARTMENT");
  const category = PROPERTY_TYPE_CATEGORY[type];
  const plotUnit: AreaUnit = (p?.plotArea ? p.areaDisplayUnit : "SQYD") as AreaUnit;
  const plotValue = p?.plotArea ? String(roundHalfUp(convertArea(p.plotArea, "SQFT", plotUnit), 2)) : "";
  const echoedList = (key: string, stored: string[]) => (echoed && key in echoed ? (echoed[key] ?? "").split(",").filter(Boolean) : stored);

  return (
    <form key={state.submissionId ?? 0} action={formAction} className="space-y-5">
      <FormMessage status={state.status} message={state.message} />

      <FormSection title="Basics">
        <TextField name="title" label="Title" required defaultValue={v("title", p?.title ?? "")} error={e.title} className="sm:col-span-2 lg:col-span-3" placeholder="3 BHK Apartment in Vaishali Nagar" />
        <SelectField name="transactionType" label="Listing for" required defaultValue={tx} options={toOptions(TRANSACTION_TYPE_LABELS)} onChange={(x) => setTx(x as TransactionType)} error={e.transactionType} />
        <SelectField name="propertyType" label="Property type" required defaultValue={type} options={toOptions(PROPERTY_TYPE_LABELS)} onChange={(x) => setType(x as PropertyType)} error={e.propertyType} />
        <SelectField name="status" label="Status" required defaultValue={v("status", p?.status ?? "DRAFT")} options={toOptions(LISTING_STATUS_LABELS)} error={e.status} hint="Only Active / Under offer appear in search" />
        <SelectField name="constructionStatus" label="Construction status" defaultValue={v("constructionStatus", p?.constructionStatus ?? "")} options={toOptions(CONSTRUCTION_STATUS_LABELS)} placeholder="—" error={e.constructionStatus} />
        <SelectField name="listedBy" label="Listed by" defaultValue={v("listedBy", p?.listedBy ?? "AGENCY")} options={toOptions(LISTED_BY_LABELS)} />
        <SelectField name="agentId" label="Agent" defaultValue={v("agentId", p?.agentId ?? "")} options={options.agents.map((a) => ({ value: a.id, label: a.name }))} placeholder="Business contact" />
        <CheckboxField name="isFeatured" label="Featured" hint="Shown first on the home page" defaultChecked={echoed ? echoed.isFeatured === "on" : p?.isFeatured} />
        <CheckboxField name="isVerified" label="Verified by our team" defaultChecked={echoed ? echoed.isVerified === "on" : p?.isVerified} />
        <TextAreaField name="description" label="Description" required rows={7} defaultValue={v("description", p?.description ?? "")} error={e.description} className="sm:col-span-2 lg:col-span-3" hint="Separate paragraphs with a blank line." />
      </FormSection>

      <FormSection title="Price" description="Amounts accept 45L, 1.2Cr, 18k or plain numbers.">
        <TextField name="price" label={tx === "RENT" ? "Rent per month (₹)" : "Price (₹)"} defaultValue={v("price", str(p?.price))} error={e.price} inputMode="decimal" />
        <CheckboxField name="priceOnRequest" label="Price on request" defaultChecked={echoed ? echoed.priceOnRequest === "on" : p?.priceOnRequest} />
        <CheckboxField name="isNegotiable" label="Negotiable" defaultChecked={echoed ? echoed.isNegotiable === "on" : p?.isNegotiable} />
        <TextField name="maintenanceMonthly" label="Maintenance per month (₹)" defaultValue={v("maintenanceMonthly", str(p?.maintenanceMonthly))} error={e.maintenanceMonthly} inputMode="numeric" />
        {tx === "RENT" ? <TextField name="securityDeposit" label="Security deposit (₹)" defaultValue={v("securityDeposit", str(p?.securityDeposit))} error={e.securityDeposit} inputMode="decimal" /> : null}
        {tx === "SALE" ? <TextField name="bookingAmount" label="Booking amount (₹)" defaultValue={v("bookingAmount", str(p?.bookingAmount))} error={e.bookingAmount} inputMode="decimal" /> : null}
      </FormSection>

      <FormSection title="Size & layout" description="Built areas in sq ft. Plot area in any unit (stored in sq ft).">
        {category !== "LAND" ? (
          <>
            <TextField name="bedrooms" label="Bedrooms" defaultValue={v("bedrooms", str(p?.bedrooms))} error={e.bedrooms} inputMode="numeric" />
            <TextField name="bathrooms" label="Bathrooms" defaultValue={v("bathrooms", str(p?.bathrooms))} error={e.bathrooms} inputMode="numeric" />
            <TextField name="balconies" label="Balconies" defaultValue={v("balconies", str(p?.balconies))} error={e.balconies} inputMode="numeric" />
            <TextField name="carpetArea" label="Carpet area (sq ft)" defaultValue={v("carpetArea", str(p?.carpetArea))} error={e.carpetArea} inputMode="decimal" />
            <TextField name="builtUpArea" label="Built-up area (sq ft)" defaultValue={v("builtUpArea", str(p?.builtUpArea))} error={e.builtUpArea} inputMode="decimal" />
            <TextField name="superBuiltUpArea" label="Super built-up (sq ft)" defaultValue={v("superBuiltUpArea", str(p?.superBuiltUpArea))} error={e.superBuiltUpArea} inputMode="decimal" />
          </>
        ) : null}
        <TextField name="plotAreaValue" label="Plot area" defaultValue={v("plotAreaValue", plotValue)} error={e.plotAreaValue} inputMode="decimal" />
        <SelectField name="plotAreaUnit" label="Plot area unit" defaultValue={v("plotAreaUnit", plotUnit)} options={toOptions(AREA_UNIT_NAMES)} />
        <div className="grid grid-cols-2 gap-2">
          <TextField name="plotWidthFt" label="Width (ft)" defaultValue={v("plotWidthFt", str(p?.plotWidthFt))} error={e.plotWidthFt} inputMode="decimal" />
          <TextField name="plotLengthFt" label="Length (ft)" defaultValue={v("plotLengthFt", str(p?.plotLengthFt))} error={e.plotLengthFt} inputMode="decimal" />
        </div>
      </FormSection>

      <FormSection title="Details">
        {category !== "LAND" ? (
          <>
            <TextField name="floorNumber" label="Floor (0 = ground)" defaultValue={v("floorNumber", str(p?.floorNumber))} error={e.floorNumber} inputMode="numeric" />
            <TextField name="totalFloors" label="Total floors" defaultValue={v("totalFloors", str(p?.totalFloors))} error={e.totalFloors} inputMode="numeric" />
            <SelectField name="furnishing" label="Furnishing" defaultValue={v("furnishing", p?.furnishing ?? "")} options={toOptions(FURNISHING_LABELS)} placeholder="—" />
            <TextField name="ageYears" label="Age (years)" defaultValue={v("ageYears", str(p?.ageYears))} error={e.ageYears} inputMode="numeric" />
            <TextField name="coveredParking" label="Covered parking" defaultValue={v("coveredParking", str(p?.coveredParking))} error={e.coveredParking} inputMode="numeric" />
            <TextField name="openParking" label="Open parking" defaultValue={v("openParking", str(p?.openParking))} error={e.openParking} inputMode="numeric" />
          </>
        ) : null}
        <SelectField name="facing" label="Facing" defaultValue={v("facing", p?.facing ?? "")} options={toOptions(FACING_LABELS)} placeholder="—" />
        <SelectField name="ownershipType" label="Ownership" defaultValue={v("ownershipType", p?.ownershipType ?? "")} options={toOptions(OWNERSHIP_TYPE_LABELS)} placeholder="—" />
        <TextField name="possessionDate" label="Possession date" type="date" defaultValue={v("possessionDate", dateStr(p?.possessionDate))} error={e.possessionDate} />
        {tx === "RENT" ? <TextField name="availableFrom" label="Available from" type="date" defaultValue={v("availableFrom", dateStr(p?.availableFrom))} error={e.availableFrom} /> : null}
        <TextField name="roadWidthFt" label="Road width (ft)" defaultValue={v("roadWidthFt", str(p?.roadWidthFt))} error={e.roadWidthFt} inputMode="numeric" />
        <SelectField
          name="jdaApproved"
          label="JDA approved"
          defaultValue={v("jdaApproved", p?.jdaApproved === true ? "yes" : p?.jdaApproved === false ? "no" : "")}
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          placeholder="Unknown"
        />
        <TextField name="reraNumber" label="RERA number" defaultValue={v("reraNumber", p?.reraNumber ?? "")} error={e.reraNumber} hint="Only enter a real registration number" />
        <CheckboxField name="isCornerPlot" label="Corner property" defaultChecked={echoed ? echoed.isCornerPlot === "on" : p?.isCornerPlot} />
        <CheckboxField name="isGatedCommunity" label="Gated community" defaultChecked={echoed ? echoed.isGatedCommunity === "on" : p?.isGatedCommunity} />
        {tx === "RENT" ? (
          <CheckboxGroup name="preferredTenants" label="Preferred tenants" options={toOptions(TENANT_PREFERENCE_LABELS)} selected={echoedList("preferredTenants", p?.preferredTenants ?? [])} columns={4} />
        ) : null}
      </FormSection>

      <FormSection title="Location">
        <SelectField name="localityId" label="Locality" required defaultValue={v("localityId", p?.localityId ?? "")} options={options.localities.map((l) => ({ value: l.id, label: l.name }))} placeholder="Choose…" error={e.localityId} />
        <SelectField name="projectId" label="Project" defaultValue={v("projectId", p?.projectId ?? "")} options={options.projects.map((x) => ({ value: x.id, label: x.name }))} placeholder="None" />
        <TextField name="pincode" label="Pincode" defaultValue={v("pincode", p?.pincode ?? "")} error={e.pincode} inputMode="numeric" />
        <TextField name="address" label="Address" defaultValue={v("address", p?.address ?? "")} error={e.address} className="sm:col-span-2" hint="Hidden publicly while “hide exact location” is on" />
        <TextField name="landmark" label="Landmark" defaultValue={v("landmark", p?.landmark ?? "")} error={e.landmark} />
        <TextField name="latitude" label="Latitude" defaultValue={v("latitude", str(p?.latitude))} error={e.latitude} inputMode="decimal" />
        <TextField name="longitude" label="Longitude" defaultValue={v("longitude", str(p?.longitude))} error={e.longitude} inputMode="decimal" />
        <CheckboxField name="hideExactLocation" label="Hide exact location" hint="Show an approximate area on the map" defaultChecked={echoed ? echoed.hideExactLocation === "on" : (p?.hideExactLocation ?? true)} />
      </FormSection>

      <section className="rounded-card border border-ink-100 bg-white p-5">
        <h2 className="mb-4 font-semibold text-ink-950">Amenities</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(AMENITY_CATEGORY_LABELS).map(([cat, label]) => {
            const items = options.amenities.filter((a) => a.category === cat);
            if (!items.length) return null;
            return (
              <CheckboxGroup
                key={cat}
                name="amenityIds"
                label={label}
                options={items.map((a) => ({ value: a.id, label: a.name }))}
                selected={echoedList("amenityIds", p?.amenityIds ?? [])}
                columns={2}
              />
            );
          })}
        </div>
      </section>

      <FormSection title="Media & SEO">
        <TextField name="videoUrl" label="YouTube video URL" defaultValue={v("videoUrl", p?.videoUrl ?? "")} error={e.videoUrl} type="url" />
        <TextField name="virtualTourUrl" label="Virtual tour URL" defaultValue={v("virtualTourUrl", p?.virtualTourUrl ?? "")} error={e.virtualTourUrl} type="url" />
        <TextField name="seoTitle" label="SEO title (optional)" defaultValue={v("seoTitle", p?.seoTitle ?? "")} error={e.seoTitle} hint="Max 70 characters. Leave blank for the automatic title." />
        <TextAreaField name="seoDescription" label="SEO description (optional)" rows={2} defaultValue={v("seoDescription", p?.seoDescription ?? "")} error={e.seoDescription} className="sm:col-span-2 lg:col-span-3" hint="Max 170 characters." />
      </FormSection>

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t border-ink-100 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {state.status === "error" ? <p className="mr-auto text-sm text-danger-700">Fix the highlighted fields and save again.</p> : null}
        <SaveButton isNew={!property} />
      </div>
    </form>
  );
}
