"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { TransactionType } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form-controls";
import { BUDGET_PRESETS } from "@/lib/constants/budgets";
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPE_SLUGS } from "@/lib/constants/enums";
import { cn } from "@/lib/utils";

const TYPE_GROUPS = [
  { label: "Residential", types: ["APARTMENT", "INDEPENDENT_HOUSE", "VILLA", "BUILDER_FLOOR", "PENTHOUSE", "STUDIO"] },
  { label: "Plots & land", types: ["RESIDENTIAL_PLOT", "COMMERCIAL_PLOT", "AGRICULTURAL_LAND"] },
  { label: "Commercial", types: ["OFFICE_SPACE", "SHOP", "SHOWROOM", "WAREHOUSE"] },
] as const;

/**
 * Plain GET form → /buy or /rent with the same query params the listing page parses
 * (locality, type, budget). Works without JavaScript; JS only swaps the target and presets.
 */
export function HeroSearch({ localities }: { localities: Array<{ name: string; slug: string }> }) {
  const [tx, setTx] = useState<TransactionType>("SALE");

  return (
    <form
      action={tx === "SALE" ? "/buy" : "/rent"}
      method="get"
      role="search"
      aria-label="Search properties"
      className="rounded-2xl bg-white p-3 shadow-card-hover ring-1 ring-ink-900/5 sm:p-4"
    >
      <fieldset className="mb-3 flex gap-1 rounded-xl bg-ink-50 p-1 sm:w-fit">
        <legend className="sr-only">I want to</legend>
        {(["SALE", "RENT"] as const).map((value) => (
          <label
            key={value}
            className={cn(
              "flex-1 cursor-pointer rounded-lg px-5 py-2 text-center text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-600 sm:flex-none",
              tx === value ? "bg-white text-ink-950 shadow-sm" : "text-ink-600 hover:text-ink-900",
            )}
          >
            <input type="radio" name="_tx" value={value} checked={tx === value} onChange={() => setTx(value)} className="sr-only" />
            {value === "SALE" ? "Buy" : "Rent"}
          </label>
        ))}
      </fieldset>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
        <div>
          <label htmlFor="hero-locality" className="sr-only">
            Locality
          </label>
          <Select id="hero-locality" name="locality" defaultValue="">
            <option value="">All Jaipur localities</option>
            {localities.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="hero-type" className="sr-only">
            Property type
          </label>
          <Select id="hero-type" name="type" defaultValue="">
            <option value="">Any property type</option>
            {TYPE_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.types.map((t) => (
                  <option key={t} value={PROPERTY_TYPE_SLUGS[t]}>
                    {PROPERTY_TYPE_LABELS[t]}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="hero-budget" className="sr-only">
            Budget
          </label>
          <Select id="hero-budget" name="budget" defaultValue="" key={tx}>
            <option value="">Any budget</option>
            {BUDGET_PRESETS[tx].map((b) => (
              <option key={b.key} value={b.key}>
                {b.label}
                {tx === "RENT" ? " / month" : ""}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" size="lg" className="h-11 sm:col-span-2 lg:col-span-1">
          <Search aria-hidden="true" />
          Search
        </Button>
      </div>
    </form>
  );
}
