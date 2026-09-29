"use client";

import { useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form-controls";
import { BHK_OPTIONS } from "@/lib/constants/budgets";
import { SEARCH_TABS, budgetOptionsFor, tabUsesBhk, typeOptionsFor, type SearchTab } from "@/lib/search/search-tabs";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  localities: Array<{ name: string; slug: string }>;
  defaultTab?: SearchTab;
  /** Prefix for field ids when more than one search bar is on a page. */
  idPrefix?: string;
  className?: string;
}

/**
 * Property search panel: Buy / Rent / Commercial / Projects tabs with Location, Type, Budget
 * and BHK. A plain GET form to /properties, which forwards to the canonical results page, so
 * it works without JavaScript; JS only swaps the options per tab.
 */
export function SearchBar({ localities, defaultTab = "buy", idPrefix = "search", className }: SearchBarProps) {
  const [tab, setTab] = useState<SearchTab>(defaultTab);
  const showBhk = tabUsesBhk(tab);
  const id = (field: string) => `${idPrefix}-${field}`;

  return (
    <form action="/properties" method="get" role="search" aria-label="Search properties" className={cn("w-full", className)}>
      <fieldset className="flex gap-1 overflow-x-auto">
        <legend className="sr-only">What are you looking for?</legend>
        {SEARCH_TABS.map((t) => (
          <label
            key={t.key}
            className={cn(
              "relative shrink-0 cursor-pointer rounded-t-xl px-4 py-2.5 text-sm font-bold transition-colors sm:px-6",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-gold-400",
              tab === t.key ? "bg-white text-brand-900" : "bg-white/10 text-white/85 hover:bg-white/20 hover:text-white",
            )}
          >
            <input type="radio" name="tab" value={t.key} checked={tab === t.key} onChange={() => setTab(t.key)} className="sr-only" />
            {t.label}
            {tab === t.key ? <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-gold-500 sm:inset-x-6" aria-hidden="true" /> : null}
          </label>
        ))}
      </fieldset>

      <div
        className={cn(
          "grid gap-3 rounded-b-2xl rounded-tr-2xl bg-white p-4 shadow-card-hover sm:grid-cols-2 sm:p-5",
          showBhk ? "lg:grid-cols-[1.25fr_1fr_1fr_0.75fr_auto]" : "lg:grid-cols-[1.25fr_1fr_1fr_auto]",
        )}
      >
        <Field label="Location" htmlFor={id("locality")}>
          <Select id={id("locality")} name="locality" defaultValue="">
            <option value="">All of Jaipur</option>
            {localities.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={tab === "projects" ? "Project type" : "Property type"} htmlFor={id("type")}>
          <Select id={id("type")} name="type" defaultValue="" key={`type-${tab}`}>
            <option value="">{tab === "commercial" ? "Any commercial space" : "Any type"}</option>
            {typeOptionsFor(tab).map((group, i) =>
              group.label ? (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              ) : (
                group.options.map((o) => (
                  <option key={`${i}-${o.value}`} value={o.value}>
                    {o.label}
                  </option>
                ))
              ),
            )}
          </Select>
        </Field>

        <Field label={tab === "rent" ? "Monthly rent" : "Budget"} htmlFor={id("budget")}>
          <Select id={id("budget")} name="budget" defaultValue="" key={`budget-${tab}`}>
            <option value="">Any budget</option>
            {budgetOptionsFor(tab).map((b) => (
              <option key={b.key} value={b.key}>
                {b.label}
              </option>
            ))}
          </Select>
        </Field>

        {showBhk ? (
          <Field label="BHK" htmlFor={id("bhk")}>
            <Select id={id("bhk")} name="bhk" defaultValue="">
              <option value="">Any</option>
              {BHK_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <Button type="submit" size="lg" className="h-11 w-full lg:w-auto lg:px-7">
            <Search aria-hidden="true" />
            Search
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-500">
        {label}
      </label>
      {children}
    </div>
  );
}
