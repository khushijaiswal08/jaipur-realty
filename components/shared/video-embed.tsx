"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/** Extracts a YouTube video id from watch, youtu.be, shorts and embed URLs. */
export function youTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.endsWith("youtube.com") || u.hostname.endsWith("youtube-nocookie.com")) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const m = /^\/(?:embed|shorts)\/([\w-]{6,})/.exec(u.pathname);
      return m?.[1] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Lightweight YouTube facade (SPEC §14): nothing loads from YouTube until the visitor clicks
 * play, then a privacy-enhanced (youtube-nocookie) player is inserted.
 */
export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const [active, setActive] = useState(false);
  const id = youTubeId(url);
  if (!id) return null;
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink-950">
      {active ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button type="button" onClick={() => setActive(true)} className="group absolute inset-0 flex items-center justify-center" aria-label={`Play video: ${title}`}>
          <span className="flex size-16 items-center justify-center rounded-full bg-brand-600 text-white shadow-card-hover transition-transform group-hover:scale-110">
            <Play className="ml-1 size-7" aria-hidden="true" />
          </span>
        </button>
      )}
    </div>
  );
}
