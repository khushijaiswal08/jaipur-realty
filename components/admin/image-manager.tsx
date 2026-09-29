"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { SmartImage } from "@/components/shared/smart-image";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form-controls";
import { IMAGE_KIND_LABELS } from "@/lib/constants/enums";
import { cn } from "@/lib/utils";

export interface ManagedImage {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
  kind: keyof typeof IMAGE_KIND_LABELS;
  isCover: boolean;
  width: number;
  height: number;
}

interface ImageActions {
  update: (imageId: string, formData: FormData) => Promise<void>;
  setCover: (imageId: string) => Promise<void>;
  move: (imageId: string, direction: -1 | 1) => Promise<void>;
  remove: (imageId: string) => Promise<void>;
}

/** Upload, order, caption and remove listing images (SPEC §44). Alt text is required (SPEC §38). */
export function ImageManager({ target, targetId, images, actions }: { target: "property" | "project"; targetId: string; images: ManagedImage[]; actions: ImageActions }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploads, setUploads] = useState<Array<{ name: string; status: "uploading" | "done" | "error"; error?: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = (fn: () => Promise<void>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = [...files];
    setUploads(list.map((f) => ({ name: f.name, status: "uploading" })));
    for (const [i, file] of list.entries()) {
      const body = new FormData();
      body.set("file", file);
      body.set("target", target);
      body.set("targetId", targetId);
      try {
        const res = await fetch("/api/admin/uploads", { method: "POST", body });
        const data = (await res.json()) as { error?: string };
        setUploads((u) => u.map((x, j) => (j === i ? { ...x, status: res.ok ? "done" : "error", error: data.error } : x)));
      } catch {
        setUploads((u) => u.map((x, j) => (j === i ? { ...x, status: "error", error: "Network error" } : x)));
      }
    }
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <section className="rounded-card border border-ink-100 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-ink-950">Images</h2>
          <p className="text-sm text-ink-500">JPEG, PNG or WebP up to 8 MB. Converted to WebP, resized to 2400 px, location data removed.</p>
        </div>
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-ink-900 px-4 text-sm font-semibold text-white hover:bg-ink-800 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-600">
          <ImagePlus className="size-4" aria-hidden="true" />
          Upload images
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
        </label>
      </div>

      {uploads.length ? (
        <ul className="mt-3 space-y-1 text-sm" aria-live="polite">
          {uploads.map((u, i) => (
            <li key={`${u.name}-${i}`} className={cn(u.status === "error" ? "text-danger-700" : "text-ink-600")}>
              {u.status === "uploading" ? <Loader2 className="mr-1 inline size-3.5 animate-spin" aria-hidden="true" /> : null}
              {u.name} — {u.status === "uploading" ? "uploading…" : u.status === "done" ? "uploaded" : u.error}
            </li>
          ))}
        </ul>
      ) : null}

      {images.length ? (
        <ul className={cn("mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3", pending && "opacity-60")}>
          {images.map((img, i) => (
            <li key={img.id} className="overflow-hidden rounded-xl border border-ink-100">
              <div className="relative aspect-[4/3] bg-ink-50">
                <SmartImage src={img.url} alt={img.alt} fill sizes="(min-width: 1280px) 25vw, 50vw" className="object-cover" />
                {img.isCover ? (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-gold-800">
                    <Star className="size-3" aria-hidden="true" /> Cover
                  </span>
                ) : null}
              </div>
              <form action={(fd) => run(() => actions.update(img.id, fd))} className="space-y-2 p-3">
                <label className="block text-xs font-medium text-ink-600">
                  Alt text
                  <Input name="alt" defaultValue={img.alt} required minLength={3} className="mt-1 h-9 text-sm" />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block text-xs font-medium text-ink-600">
                    Caption
                    <Input name="caption" defaultValue={img.caption ?? ""} className="mt-1 h-9 text-sm" />
                  </label>
                  <label className="block text-xs font-medium text-ink-600">
                    Type
                    <Select name="kind" defaultValue={img.kind} className="mt-1 h-9 text-sm">
                      {Object.entries(IMAGE_KIND_LABELS).map(([k, l]) => (
                        <option key={k} value={k}>
                          {l}
                        </option>
                      ))}
                    </Select>
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <Button type="submit" size="sm" variant="outline" disabled={pending}>
                    Save
                  </Button>
                  {!img.isCover ? (
                    <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => actions.setCover(img.id))}>
                      <Star aria-hidden="true" /> Cover
                    </Button>
                  ) : null}
                  <Button size="icon" variant="ghost" className="size-9" disabled={pending || i === 0} onClick={() => run(() => actions.move(img.id, -1))} aria-label="Move earlier">
                    <ArrowUp />
                  </Button>
                  <Button size="icon" variant="ghost" className="size-9" disabled={pending || i === images.length - 1} onClick={() => run(() => actions.move(img.id, 1))} aria-label="Move later">
                    <ArrowDown />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-auto size-9 text-danger-700 hover:bg-danger-50"
                    disabled={pending}
                    onClick={() => {
                      if (window.confirm("Delete this image? This can't be undone.")) run(() => actions.remove(img.id));
                    }}
                    aria-label="Delete image"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-ink-200 px-4 py-8 text-center text-sm text-ink-500">
          No images yet. The public page shows a placeholder until you upload photos.
        </p>
      )}
    </section>
  );
}
