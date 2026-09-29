"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type { PropertyType } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Checkbox, Input } from "@/components/ui/form-controls";
import { BHK_OPTIONS, BUDGET_PRESETS } from "@/lib/constants/budgets";
import {
  CONSTRUCTION_STATUS_LABELS,
  FACING_LABELS,
  FURNISHING_LABELS,
  LISTED_BY_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@/lib/constants/enums";
import { enumToSlug, listingPath, type ListingFilters } from "@/lib/search/filters";
import { cn } from "@/lib/utils";
import { formDataToQuery, useListingNavigation } from "./listing-navigation";

const TYPE_GROUPS: Array<{ label: string; types: PropertyType[] }> = [
  { label: "Residential", types: ["APARTMENT", "INDEPENDENT_HOUSE", "VILLA", "BUILDER_FLOOR", "PENTHOUSE", "STUDIO", "FARMHOUSE"] },
  { label: "Plots & land", types: ["RESIDENTIAL_PLOT", "COMMERCIAL_PLOT", "AGRICULTURAL_LAND"] },
  { label: "Commercial", types: ["OFFICE_SPACE", "SHOP", "SHOWROOM", "WAREHOUSE"] },
];

export interface FilterFormProps {
  filters: ListingFilters;
  localities: Array<{ name: string; slug: string }>;
  amenities: Array<{ name: string; slug: string }>;
  /** Unique per rendered instance (desktop sidebar vs mobile drawer). */
  idPrefix: string;
  /** Apply checkbox/radio changes immediately (desktop). */
  autoApply?: boolean;
  onApplied?: () => void;
  footer?: (pending: boolean) => ReactNode;
}

function Group({ legend, children, collapsible = false, defaultOpen = true }: { legend: string; children: ReactNode; collapsible?: boolean; defaultOpen?: boolean }) {
  if (collapsible) {
    return (
      <details open={defaultOpen} className="group border-t border-ink-100 py-4 first:border-t-0 first:pt-0">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink-950 [&::-webkit-details-marker]:hidden">
          {legend}
          <span className="text-ink-400 transition-transform group-open:rotate-45" aria-hidden="true">
            +
          </span>
        </summary>
        <fieldset className="mt-3">
          <legend className="sr-only">{legend}</legend>
          {children}
        </fieldset>
      </details>
    );
  }
  return (
    <fieldset className="border-t border-ink-100 py-4 first:border-t-0 first:pt-0">
      <legend className="float-left mb-3 w-full text-sm font-semibold text-ink-950">{legend}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

function CheckRow({ name, value, label, defaultChecked, id }: { name: string; value: string; label: string; defaultChecked: boolean; id: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-ink-700 hover:text-ink-950">
      <Checkbox id={id} name={name} value={value} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}

function Pill({ name, value, label, defaultChecked, id, type = "checkbox" }: { name: string; value: string; label: string; defaultChecked: boolean; id: string; type?: "checkbox" | "radio" }) {
  return (
    <label htmlFor={id} className="cursor-pointer">
      <input id={id} type={type} name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="inline-flex h-9 items-center rounded-full border border-ink-200 bg-white px-3.5 text-sm font-medium text-ink-700 transition-colors peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:text-brand-800 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600 hover:border-ink-300">
        {label}
      </span>
    </label>
  );
}

export function FilterForm({ filters: f, localities, amenities, idPrefix, autoApply = false, onApplied, footer }: FilterFormProps) {
  const { navigate, isPending } = useListingNavigation();
  const action = listingPath(f.transactionType);
  const presets = BUDGET_PRESETS[f.transactionType];
  const [budget, setBudget] = useState(f.budget ?? "");
  const [minPrice, setMinPrice] = useState(!f.budget && f.minPrice ? String(f.minPrice) : "");
  const [maxPrice, setMaxPrice] = useState(!f.budget && f.maxPrice ? String(f.maxPrice) : "");
  const id = (s: string) => `${idPrefix}-${s}`;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const qs = formDataToQuery(e.currentTarget);
    navigate(`${action}${qs ? `?${qs}` : ""}`);
    onApplied?.();
  }

  function onChange(e: ChangeEvent<HTMLFormElement>) {
    const target = e.target as unknown as HTMLInputElement;
    if (autoApply && (target.type === "checkbox" || target.type === "radio")) e.currentTarget.requestSubmit();
  }

  return (
    <form action={action} method="get" onSubmit={onSubmit} onChange={onChange} aria-label="Filter properties">
      {f.sort !== "relevance" ? <input type="hidden" name="sort" value={f.sort} /> : null}

      <Group legend="Keyword">
        <label htmlFor={id("q")} className="sr-only">
          Search by keyword or reference code
        </label>
        <Input id={id("q")} name="q" type="search" defaultValue={f.q ?? ""} placeholder="e.g. corner plot, JP1001" />
      </Group>

      <Group legend="Budget">
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <label key={p.key} htmlFor={id(`budget-${p.key}`)} className="cursor-pointer">
              <input
                id={id(`budget-${p.key}`)}
                type="radio"
                name="budget"
                value={p.key}
                checked={budget === p.key}
                onChange={() => {
                  setBudget(p.key);
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="peer sr-only"
              />
              <span className="inline-flex h-9 items-center rounded-full border border-ink-200 bg-white px-3 text-xs font-medium text-ink-700 peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:text-brand-800 peer-focus-visible:outline-2 peer-focus-visible:outline-brand-600">
                {p.label}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={id("minPrice")} className="mb-1 block text-xs text-ink-500">
              Min (₹)
            </label>
            <Input
              id={id("minPrice")}
              name="minPrice"
              inputMode="decimal"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setBudget("");
              }}
              placeholder={f.transactionType === "SALE" ? "e.g. 40L" : "e.g. 15k"}
              className="h-10"
            />
          </div>
          <div>
            <label htmlFor={id("maxPrice")} className="mb-1 block text-xs text-ink-500">
              Max (₹)
            </label>
            <Input
              id={id("maxPrice")}
              name="maxPrice"
              inputMode="decimal"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setBudget("");
              }}
              placeholder={f.transactionType === "SALE" ? "e.g. 1.2Cr" : "e.g. 30k"}
              className="h-10"
            />
          </div>
        </div>
      </Group>

      <Group legend="Bedrooms">
        <div className="flex flex-wrap gap-2">
          {BHK_OPTIONS.map((o) => (
            <Pill key={o.value} id={id(`bhk-${o.value}`)} name="bhk" value={String(o.value)} label={o.label} defaultChecked={f.bhk.includes(o.value)} />
          ))}
        </div>
      </Group>

      <Group legend="Property type" collapsible>
        {TYPE_GROUPS.map((g) => (
          <div key={g.label} className="mb-2 last:mb-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-400">{g.label}</p>
            {g.types.map((t) => (
              <CheckRow key={t} id={id(`type-${t}`)} name="type" value={enumToSlug(t)} label={PROPERTY_TYPE_LABELS[t]} defaultChecked={f.types.includes(t)} />
            ))}
          </div>
        ))}
        {f.category ? <input type="hidden" name="category" value={enumToSlug(f.category)} /> : null}
      </Group>

      <Group legend="Locality" collapsible>
        <div className="max-h-64 overflow-y-auto pr-1">
          {localities.map((l) => (
            <CheckRow key={l.slug} id={id(`loc-${l.slug}`)} name="locality" value={l.slug} label={l.name} defaultChecked={f.localities.includes(l.slug)} />
          ))}
        </div>
      </Group>

      <Group legend={f.transactionType === "RENT" ? "Furnishing" : "Construction status"} collapsible>
        {f.transactionType === "RENT"
          ? (Object.keys(FURNISHING_LABELS) as Array<keyof typeof FURNISHING_LABELS>).map((k) => (
              <CheckRow key={k} id={id(`furn-${k}`)} name="furnishing" value={enumToSlug(k)} label={FURNISHING_LABELS[k]} defaultChecked={f.furnishing.includes(k)} />
            ))
          : (Object.keys(CONSTRUCTION_STATUS_LABELS) as Array<keyof typeof CONSTRUCTION_STATUS_LABELS>).map((k) => (
              <CheckRow key={k} id={id(`cs-${k}`)} name="status" value={enumToSlug(k)} label={CONSTRUCTION_STATUS_LABELS[k]} defaultChecked={f.construction.includes(k)} />
            ))}
      </Group>

      {f.transactionType === "SALE" ? (
        <Group legend="Furnishing" collapsible defaultOpen={f.furnishing.length > 0}>
          {(Object.keys(FURNISHING_LABELS) as Array<keyof typeof FURNISHING_LABELS>).map((k) => (
            <CheckRow key={k} id={id(`furn-${k}`)} name="furnishing" value={enumToSlug(k)} label={FURNISHING_LABELS[k]} defaultChecked={f.furnishing.includes(k)} />
          ))}
        </Group>
      ) : null}

      <Group legend="Area (sq ft)" collapsible defaultOpen={f.minArea !== undefined || f.maxArea !== undefined}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={id("minArea")} className="mb-1 block text-xs text-ink-500">
              Min
            </label>
            <Input id={id("minArea")} name="minArea" inputMode="numeric" defaultValue={f.minArea ?? ""} placeholder="500" className="h-10" />
          </div>
          <div>
            <label htmlFor={id("maxArea")} className="mb-1 block text-xs text-ink-500">
              Max
            </label>
            <Input id={id("maxArea")} name="maxArea" inputMode="numeric" defaultValue={f.maxArea ?? ""} placeholder="3000" className="h-10" />
          </div>
        </div>
      </Group>

      <Group legend="Facing" collapsible defaultOpen={f.facing.length > 0}>
        <div className="grid grid-cols-2 gap-x-2">
          {(Object.keys(FACING_LABELS) as Array<keyof typeof FACING_LABELS>).map((k) => (
            <CheckRow key={k} id={id(`facing-${k}`)} name="facing" value={enumToSlug(k)} label={FACING_LABELS[k]} defaultChecked={f.facing.includes(k)} />
          ))}
        </div>
      </Group>

      {amenities.length ? (
        <Group legend="Amenities" collapsible defaultOpen={f.amenities.length > 0}>
          <div className="max-h-56 overflow-y-auto pr-1">
            {amenities.map((a) => (
              <CheckRow key={a.slug} id={id(`am-${a.slug}`)} name="amenities" value={a.slug} label={a.name} defaultChecked={f.amenities.includes(a.slug)} />
            ))}
          </div>
        </Group>
      ) : null}

      <Group legend="More" collapsible defaultOpen={Boolean(f.listedBy || f.verified || f.withPhotos)}>
        <div className="mb-2 flex flex-wrap gap-2">
          <Pill id={id("lb-any")} type="radio" name="listedBy" value="" label="Anyone" defaultChecked={!f.listedBy} />
          {(Object.keys(LISTED_BY_LABELS) as Array<keyof typeof LISTED_BY_LABELS>).map((k) => (
            <Pill key={k} id={id(`lb-${k}`)} type="radio" name="listedBy" value={enumToSlug(k)} label={LISTED_BY_LABELS[k]} defaultChecked={f.listedBy === k} />
          ))}
        </div>
        <CheckRow id={id("verified")} name="verified" value="1" label="Verified listings only" defaultChecked={f.verified} />
        <CheckRow id={id("photos")} name="photos" value="1" label="With photos" defaultChecked={f.withPhotos} />
      </Group>

      {footer ? (
        footer(isPending)
      ) : (
        <div className="sticky bottom-0 -mx-1 flex items-center gap-2 border-t border-ink-100 bg-white px-1 pb-1 pt-4">
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            Apply filters
          </Button>
          <Link href={action} className={cn("px-3 text-sm font-semibold text-ink-600 hover:text-ink-950")}>
            Clear
          </Link>
        </div>
      )}
    </form>
  );
}
