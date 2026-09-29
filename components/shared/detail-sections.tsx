import type { ReactNode } from "react";
import { ChevronDown, Info, TriangleAlert } from "lucide-react";
import { CallButton, WhatsAppButton } from "@/components/shared/contact-buttons";
import { Markdown } from "@/components/shared/markdown";
import { NamedIcon } from "@/components/shared/named-icon";
import { SmartImage } from "@/components/shared/smart-image";
import { DemoBadge } from "@/components/ui/badge";
import { AMENITY_CATEGORY_LABELS } from "@/lib/constants/enums";
import type { ContactPoint } from "@/lib/contact";
import { cn } from "@/lib/utils";
import type { AgentDTO } from "@/services/agent.service";
import type { AmenityDTO } from "@/services/property-detail.service";

export function DetailSection({ id, title, children, className }: { id?: string; title: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={cn("scroll-mt-24 border-t border-ink-100 py-8 first:border-t-0 first:pt-0", className)}>
      <h2 id={id ? `${id}-title` : undefined} className="mb-5 font-display text-xl text-ink-950 sm:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function FactsGrid({ facts }: { facts: Array<{ label: string; value: string; icon: string }> }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
      {facts.map((f) => (
        <div key={f.label} className="flex gap-3">
          <NamedIcon name={f.icon} className="mt-0.5 size-5 shrink-0 text-brand-600" />
          <div className="min-w-0">
            <dt className="text-xs text-ink-500">{f.label}</dt>
            <dd className="font-semibold text-ink-900 [overflow-wrap:anywhere]">{f.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

export function Paragraphs({ text }: { text: string }) {
  return (
    <div className="space-y-4 leading-relaxed text-ink-700">
      {text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </div>
  );
}

export function AmenitiesList({ amenities }: { amenities: AmenityDTO[] }) {
  const groups = new Map<AmenityDTO["category"], AmenityDTO[]>();
  for (const a of amenities) groups.set(a.category, [...(groups.get(a.category) ?? []), a]);
  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([category, items]) => (
        <div key={category}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-500">{AMENITY_CATEGORY_LABELS[category]}</h3>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((a) => (
              <li key={a.slug} className="flex items-center gap-2.5 rounded-xl bg-surface-100 px-3 py-2.5 text-sm font-medium text-ink-800">
                <NamedIcon name={a.icon} className="size-4.5 shrink-0 text-brand-700" />
                {a.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function FaqList({ faqs, idPrefix = "faq" }: { faqs: Array<{ id: string; question: string; answer: string }>; idPrefix?: string }) {
  return (
    <div className="divide-y divide-ink-100 rounded-card border border-ink-100 bg-white">
      {faqs.map((f) => (
        <details key={f.id} id={`${idPrefix}-${f.id}`} className="group px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-950 [&::-webkit-details-marker]:hidden">
            {f.question}
            <ChevronDown className="size-5 shrink-0 text-ink-400 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <Markdown className="mt-3 text-sm">{f.answer}</Markdown>
        </details>
      ))}
    </div>
  );
}

export function AgentCard({ agent, contextId, message }: { agent: AgentDTO; contextId: { propertyId?: string; projectId?: string }; message: string }) {
  return (
    <div className="rounded-card border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-center gap-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-ink-100">
          <SmartImage src={agent.photo.url} alt={agent.photo.alt} fill sizes="56px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-semibold text-ink-950">
            {agent.name}
            {agent.isDemo ? <DemoBadge label="Demo profile" /> : null}
          </p>
          {agent.designation ? <p className="text-sm text-ink-500">{agent.designation}</p> : null}
          {agent.languages.length ? <p className="text-xs text-ink-500">Speaks {agent.languages.join(", ")}</p> : null}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <CallButton contact={agent.contact} context="agent_card" {...contextId} className="w-full" />
        <WhatsAppButton contact={agent.contact} message={message} context="agent_card" {...contextId} className="w-full" />
      </div>
    </div>
  );
}

/** Sticky bottom bar on phones: Call | WhatsApp | Enquire (SPEC §25). Hides the floating button via CSS :has(). */
export function MobileContactBar({ contact, message, enquireHref = "#enquire", track }: { contact: ContactPoint; message: string; enquireHref?: string; track: { propertyId?: string; projectId?: string } }) {
  return (
    <div
      data-mobile-contact-bar=""
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 gap-2 border-t border-ink-100 bg-white/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
    >
      <CallButton contact={contact} context="mobile_bar" {...track} className="w-full" />
      <WhatsAppButton contact={contact} message={message} context="mobile_bar" {...track} className="w-full" />
      <a href={enquireHref} className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700">
        Enquire
      </a>
    </div>
  );
}

export function Banner({ tone, title, children }: { tone: "info" | "warning" | "demo"; title: string; children?: ReactNode }) {
  const styles = {
    info: "border-ink-200 bg-ink-50 text-ink-800",
    warning: "border-warning-600/30 bg-warning-50 text-warning-600",
    demo: "border-dashed border-warning-600/40 bg-warning-50 text-ink-800",
  }[tone];
  const Icon = tone === "info" ? Info : TriangleAlert;
  return (
    <div role="note" className={cn("flex gap-3 rounded-xl border px-4 py-3 text-sm", styles)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-semibold">{title}</p>
        {children ? <div className="mt-0.5 text-ink-700">{children}</div> : null}
      </div>
    </div>
  );
}
