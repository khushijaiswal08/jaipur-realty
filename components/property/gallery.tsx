"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { ImageKind } from "@/generated/prisma/enums";
import { SmartImage } from "@/components/shared/smart-image";
import { IMAGE_KIND_LABELS } from "@/lib/constants/enums";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  kind: ImageKind;
  caption: string | null;
}

/**
 * Property/project gallery (SPEC §14): hero grid on desktop, swipeable strip on mobile,
 * full-screen lightbox (native <dialog>) with keyboard and swipe navigation, tabs per ImageKind.
 */
export function Gallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const kinds = useMemo(() => [...new Set(images.map((i) => i.kind))], [images]);
  const [kind, setKind] = useState<ImageKind>(kinds[0] ?? "PHOTO");
  const shown = images.filter((i) => i.kind === kind);
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const step = useCallback((delta: number) => setIndex((i) => (i + delta + shown.length) % shown.length), [shown.length]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (!dialog.open) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const current = shown[index] ?? shown[0];
  const [first, second, third] = shown;

  return (
    <div>
      {kinds.length > 1 ? (
        <div role="tablist" aria-label="Image categories" className="relative mb-3 flex gap-2 overflow-x-auto">
          {kinds.map((k) => (
            <button
              key={k}
              role="tab"
              type="button"
              aria-selected={k === kind}
              onClick={() => {
                setKind(k);
                setIndex(0);
              }}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                k === kind ? "bg-ink-900 text-white" : "bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50",
              )}
            >
              {IMAGE_KIND_LABELS[k]} ({images.filter((i) => i.kind === k).length})
            </button>
          ))}
        </div>
      ) : null}

      {/* Mobile: swipeable strip */}
      <div className="relative -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 sm:hidden" aria-label={`${title} photos`}>
        {shown.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => open(i)}
            className="relative aspect-[4/3] w-[88%] shrink-0 snap-center overflow-hidden rounded-2xl bg-ink-50"
            aria-label={`Open image ${i + 1} of ${shown.length}: ${img.caption ?? img.alt}`}
          >
            <SmartImage src={img.url} alt={img.alt} fill sizes="88vw" preload={i === 0} className="object-cover" />
            <span className="absolute bottom-2 right-2 rounded-full bg-ink-900/80 px-2 py-0.5 text-xs font-semibold text-white">
              {i + 1}/{shown.length}
            </span>
          </button>
        ))}
      </div>

      {/* Desktop: hero grid */}
      {first ? (
        <div className={cn("hidden gap-2 sm:grid", second ? "grid-cols-3 grid-rows-2" : "grid-cols-1")} style={{ height: "min(30rem, 56vw)" }}>
          <button
            type="button"
            onClick={() => open(0)}
            className={cn("group relative overflow-hidden rounded-2xl bg-ink-50", second ? "col-span-2 row-span-2" : "")}
            aria-label={`Open gallery: ${first.caption ?? first.alt}`}
          >
            <SmartImage src={first.url} alt={first.alt} fill preload sizes="(min-width: 1280px) 800px, 66vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
          </button>
          {[second, third].map((img, n) =>
            img ? (
              <button
                key={img.id}
                type="button"
                onClick={() => open(n + 1)}
                className={cn("group relative overflow-hidden rounded-2xl bg-ink-50", !third && "row-span-2")}
                aria-label={`Open image ${n + 2}: ${img.caption ?? img.alt}`}
              >
                <SmartImage src={img.url} alt={img.alt} fill sizes="33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                {n === 1 || (n === 0 && !third) ? (
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-ink-900 shadow-sm">
                    <Expand className="size-4" aria-hidden="true" />
                    View all {shown.length}
                  </span>
                ) : null}
              </button>
            ) : null,
          )}
        </div>
      ) : null}

      <dialog
        ref={dialogRef}
        aria-label={`${title} — image viewer`}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-ink-950/95 p-0 text-white backdrop:bg-ink-950/80 open:flex open:flex-col"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm text-ink-200" aria-live="polite">
            {index + 1} / {shown.length}
            {current?.caption ? ` · ${current.caption}` : ""}
          </p>
          <button type="button" onClick={() => dialogRef.current?.close()} className="rounded-full p-2 hover:bg-white/10" aria-label="Close image viewer">
            <X className="size-6" />
          </button>
        </div>
        <div
          className="relative flex-1"
          onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            const start = touchX.current;
            const end = e.changedTouches[0]?.clientX;
            if (start !== null && end !== undefined && Math.abs(end - start) > 40) step(end < start ? 1 : -1);
            touchX.current = null;
          }}
        >
          {current ? <SmartImage key={current.id} src={current.url} alt={current.alt} fill sizes="100vw" className="object-contain" /> : null}
          {shown.length > 1 ? (
            <>
              <button type="button" onClick={() => step(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label="Previous image">
                <ChevronLeft className="size-6" />
              </button>
              <button type="button" onClick={() => step(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20" aria-label="Next image">
                <ChevronRight className="size-6" />
              </button>
            </>
          ) : null}
        </div>
        <div className="relative flex justify-center gap-2 overflow-x-auto px-4 py-3">
          {shown.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              className={cn("relative h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-2", i === index ? "ring-white" : "ring-transparent opacity-60 hover:opacity-100")}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
            >
              <SmartImage src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      </dialog>
    </div>
  );
}
