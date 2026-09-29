"use client";

import { useState } from "react";
import { Markdown } from "@/components/shared/markdown";
import { Label, Textarea } from "@/components/ui/form-controls";
import { cn } from "@/lib/utils";

/** Markdown textarea with a live preview tab (SPEC §46). Raw HTML is never rendered. */
export function MarkdownEditor({ name, label, defaultValue, rows = 18, hint }: { name: string; label: string; defaultValue?: string | null; rows?: number; hint?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const words = value.trim().split(/\s+/).filter(Boolean).length;
  return (
    <div className="sm:col-span-2 lg:col-span-3">
      <div className="mb-1.5 flex items-end justify-between gap-3">
        <Label htmlFor={`f-${name}`} className="mb-0">
          {label}
        </Label>
        <div role="tablist" aria-label="Editor mode" className="flex gap-1 rounded-lg bg-ink-50 p-0.5">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn("rounded-md px-3 py-1 text-xs font-semibold capitalize", tab === t ? "bg-white text-ink-950 shadow-sm" : "text-ink-600")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <Textarea id={`f-${name}`} name={name} rows={rows} value={value} onChange={(e) => setValue(e.target.value)} className={cn("font-mono text-sm", tab === "preview" && "hidden")} />
      {tab === "preview" ? (
        <div className="min-h-64 rounded-xl border border-ink-200 bg-white p-5">
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-sm text-ink-400">Nothing to preview yet.</p>}
        </div>
      ) : null}
      <p className="mt-1 text-xs text-ink-500">
        {hint ?? "Markdown: ## Heading, **bold**, [link](/buy), - list items, > quote."} · {words} words · ~{Math.max(1, Math.round(words / 200))} min read
      </p>
    </div>
  );
}
