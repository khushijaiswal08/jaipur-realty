import Link from "next/link";
import { SmartImage } from "@/components/shared/smart-image";
import { DemoBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";
import type { PostCardDTO } from "@/services/content.service";

export function PostCard({ post: p, className }: { post: PostCardDTO; className?: string }) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border border-ink-100 bg-white shadow-card transition-shadow hover:shadow-card-hover",
        className,
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-ink-50">
        <SmartImage src={p.cover.url} alt={p.cover.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        {p.isDemo ? <DemoBadge label="Demo article" className="absolute left-3 top-3" /> : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {p.category ? <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">{p.category.name}</p> : null}
        <h3 className="mt-1.5 text-lg font-semibold leading-snug text-ink-950">
          <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {p.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-ink-600">{p.excerpt}</p>
        <p className="mt-auto pt-4 text-xs text-ink-500">
          {p.publishedAt ? <time dateTime={p.publishedAt}>{formatDate(p.publishedAt)}</time> : null}
          {p.readingTimeMinutes ? ` · ${p.readingTimeMinutes} min read` : null}
        </p>
      </div>
    </article>
  );
}
