import { Quote, Star } from "lucide-react";
import { DemoBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TestimonialDTO } from "@/services/content.service";

export function TestimonialCard({ testimonial: t, className }: { testimonial: TestimonialDTO; className?: string }) {
  return (
    <figure className={cn("flex h-full flex-col rounded-card border border-ink-100 bg-white p-6 shadow-card", className)}>
      <div className="flex items-center justify-between">
        <Quote className="size-8 text-brand-200" aria-hidden="true" />
        {t.isDemo ? <DemoBadge label="Demo testimonial" /> : null}
      </div>
      {t.rating ? (
        <p className="mt-3 flex gap-0.5" aria-label={`Rated ${t.rating} out of 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={cn("size-4", i < t.rating! ? "fill-gold-600 text-gold-600" : "text-ink-200")}
              aria-hidden="true"
            />
          ))}
        </p>
      ) : null}
      <blockquote className="mt-3 flex-1 text-ink-700">
        <p>{t.quote}</p>
      </blockquote>
      <figcaption className="mt-5 border-t border-ink-100 pt-4">
        <p className="font-semibold text-ink-950">{t.name}</p>
        <p className="text-sm text-ink-500">{[t.context, t.location].filter(Boolean).join(" · ")}</p>
      </figcaption>
    </figure>
  );
}
