"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form-controls";
import { MAX_TRUST_METRICS, TRUST_METRIC_SOURCES, type TrustMetric, type TrustMetricSource } from "@/lib/settings/trust-metrics";

type Row = { label: string; mode: TrustMetricSource | "fixed"; value: string };

const toRow = (m: TrustMetric): Row => ({ label: m.label, mode: m.source ?? "fixed", value: m.value ?? "" });
const toMetric = (r: Row): TrustMetric =>
  r.mode === "fixed" ? { label: r.label.trim(), value: r.value.trim() } : { label: r.label.trim(), source: r.mode };

/** Up to four metric rows, serialised to a hidden JSON field and validated server-side. */
export function TrustMetricsEditor({ initial }: { initial: TrustMetric[] }) {
  const [rows, setRows] = useState<Row[]>(initial.map(toRow));
  const update = (i: number, patch: Partial<Row>) => setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  return (
    <div>
      <input type="hidden" name="metrics" value={JSON.stringify(rows.filter((r) => r.label.trim()).map(toMetric))} />
      <div className="space-y-3">
        {rows.map((row, i) => (
          <fieldset key={i} className="grid gap-2 rounded-xl border border-ink-100 p-3 sm:grid-cols-[1.2fr_1.2fr_0.8fr_auto] sm:items-end">
            <legend className="sr-only">Metric {i + 1}</legend>
            <label className="text-xs font-medium text-ink-600">
              Label
              <Input value={row.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="e.g. Families helped" maxLength={60} className="mt-1 h-10 text-sm" />
            </label>
            <label className="text-xs font-medium text-ink-600">
              Number
              <Select value={row.mode} onChange={(e) => update(i, { mode: e.target.value as Row["mode"] })} className="mt-1 h-10 text-sm">
                {(Object.keys(TRUST_METRIC_SOURCES) as TrustMetricSource[]).map((s) => (
                  <option key={s} value={s}>
                    {TRUST_METRIC_SOURCES[s]}
                  </option>
                ))}
                <option value="fixed">Fixed value I enter</option>
              </Select>
            </label>
            <label className="text-xs font-medium text-ink-600">
              Value
              <Input
                value={row.mode === "fixed" ? row.value : ""}
                onChange={(e) => update(i, { value: e.target.value })}
                disabled={row.mode !== "fixed"}
                placeholder={row.mode === "fixed" ? "e.g. 15+" : "Counted live"}
                maxLength={20}
                className="mt-1 h-10 text-sm"
              />
            </label>
            <Button variant="ghost" size="icon" className="size-10 text-danger-700" onClick={() => setRows((r) => r.filter((_, j) => j !== i))} aria-label={`Remove metric ${i + 1}`}>
              <Trash2 />
            </Button>
          </fieldset>
        ))}
      </div>
      {rows.length < MAX_TRUST_METRICS ? (
        <Button variant="outline" size="sm" className="mt-3" onClick={() => setRows((r) => [...r, { label: "", mode: "activeListings", value: "" }])}>
          <Plus aria-hidden="true" /> Add metric
        </Button>
      ) : null}
    </div>
  );
}
