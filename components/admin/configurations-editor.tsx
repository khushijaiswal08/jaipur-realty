"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { PropertyType } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form-controls";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants/enums";

export interface ConfigRowInput {
  label: string;
  propertyType: PropertyType;
  bedrooms: string;
  carpetAreaMin: string;
  carpetAreaMax: string;
  superAreaMin: string;
  superAreaMax: string;
  priceMin: string;
  priceMax: string;
  unitsAvailable: string;
  floorPlanUrl: string;
}

const EMPTY: ConfigRowInput = {
  label: "",
  propertyType: "APARTMENT",
  bedrooms: "",
  carpetAreaMin: "",
  carpetAreaMax: "",
  superAreaMin: "",
  superAreaMax: "",
  priceMin: "",
  priceMax: "",
  unitsAvailable: "",
  floorPlanUrl: "",
};

const FIELDS: Array<{ key: keyof ConfigRowInput; label: string; placeholder?: string }> = [
  { key: "bedrooms", label: "BHK" },
  { key: "carpetAreaMin", label: "Carpet min", placeholder: "sq ft" },
  { key: "carpetAreaMax", label: "Carpet max", placeholder: "sq ft" },
  { key: "superAreaMin", label: "Super/plot min", placeholder: "sq ft" },
  { key: "superAreaMax", label: "Super/plot max", placeholder: "sq ft" },
  { key: "priceMin", label: "Price from", placeholder: "52L" },
  { key: "priceMax", label: "Price to", placeholder: "58L" },
  { key: "unitsAvailable", label: "Units left" },
];

/** Rows of unit configurations, serialised into a hidden JSON field (validated server-side). */
export function ConfigurationsEditor({ initial }: { initial: ConfigRowInput[] }) {
  const [rows, setRows] = useState<ConfigRowInput[]>(initial.length ? initial : [{ ...EMPTY }]);
  const update = (i: number, patch: Partial<ConfigRowInput>) => setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  return (
    <div className="sm:col-span-2 lg:col-span-3">
      <input type="hidden" name="configurations" value={JSON.stringify(rows.filter((r) => r.label.trim()))} />
      <p className="mb-2 text-xs text-ink-500">Areas in sq ft (for plots, 1 sq yd = 9 sq ft). Prices accept 52L / 1.1Cr. The project price range is calculated from these rows.</p>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <fieldset key={i} className="rounded-xl border border-ink-100 p-3">
            <legend className="sr-only">Configuration {i + 1}</legend>
            <div className="grid gap-2 sm:grid-cols-[1fr_12rem_auto]">
              <Input aria-label="Label" placeholder="e.g. 3 BHK Apartment" value={row.label} onChange={(e) => update(i, { label: e.target.value })} className="h-9 text-sm" />
              <Select aria-label="Type" value={row.propertyType} onChange={(e) => update(i, { propertyType: e.target.value as PropertyType })} className="h-9 text-sm">
                {Object.entries(PROPERTY_TYPE_LABELS).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </Select>
              <Button variant="ghost" size="icon" className="size-9 text-danger-700" onClick={() => setRows((r) => r.filter((_, j) => j !== i))} aria-label={`Remove configuration ${i + 1}`}>
                <Trash2 />
              </Button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
              {FIELDS.map((f) => (
                <label key={f.key} className="text-xs text-ink-500">
                  {f.label}
                  <Input value={row[f.key]} placeholder={f.placeholder} onChange={(e) => update(i, { [f.key]: e.target.value })} className="mt-0.5 h-9 text-sm" />
                </label>
              ))}
            </div>
            <label className="mt-2 block text-xs text-ink-500">
              Floor plan URL (optional)
              <Input value={row.floorPlanUrl} onChange={(e) => update(i, { floorPlanUrl: e.target.value })} placeholder="/media/… or https://…" className="mt-0.5 h-9 text-sm" />
            </label>
          </fieldset>
        ))}
      </div>
      <Button variant="outline" size="sm" className="mt-3" onClick={() => setRows((r) => [...r, { ...EMPTY }])}>
        <Plus aria-hidden="true" /> Add configuration
      </Button>
    </div>
  );
}
