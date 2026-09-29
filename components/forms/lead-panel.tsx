"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Two-tab switcher for sidebars: e.g. "Enquire" | "Book a visit". Both panels stay mounted. */
export function LeadPanel({ tabs }: { tabs: Array<{ id: string; label: string; content: ReactNode }> }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <div>
      <div role="tablist" aria-label="Contact options" className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-ink-50 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setActive(t.id)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              active === t.id ? "bg-white text-ink-950 shadow-sm" : "text-ink-600 hover:text-ink-900",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={active !== t.id}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
