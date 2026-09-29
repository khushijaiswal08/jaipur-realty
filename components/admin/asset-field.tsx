"use client";

import { useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { SmartImage } from "@/components/shared/smart-image";
import { Input, Label } from "@/components/ui/form-controls";

/**
 * Single-file field: upload (image → WebP, or PDF) via /api/admin/uploads and store the URL in
 * a named input, or paste a URL. Used for locality images, agent photos, brochures, blog covers.
 */
export function AssetField({ name, label, defaultValue, kind = "image", hint }: { name: string; label: string; defaultValue?: string | null; kind?: "image" | "pdf"; hint?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<{ busy: boolean; error?: string }>({ busy: false });

  async function upload(file: File | undefined) {
    if (!file) return;
    setStatus({ busy: true });
    const body = new FormData();
    body.set("file", file);
    body.set("target", kind === "pdf" ? "brochure" : "image");
    try {
      const res = await fetch("/api/admin/uploads", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      setUrl(data.url);
      setStatus({ busy: false });
    } catch (e) {
      setStatus({ busy: false, error: e instanceof Error ? e.message : "Upload failed" });
    }
  }

  const id = `f-${name}`;
  return (
    <div className="sm:col-span-2 lg:col-span-3">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-wrap items-center gap-3">
        {url && kind === "image" ? (
          <span className="relative size-16 overflow-hidden rounded-lg bg-ink-100">
            <SmartImage src={url} alt="" fill sizes="64px" className="object-cover" />
          </span>
        ) : url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
            <FileText className="size-4" aria-hidden="true" /> View file
          </a>
        ) : null}
        <Input id={id} name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/media/… or https://…" className="h-10 min-w-0 flex-1" />
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800 hover:bg-ink-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-600">
          {status.busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" aria-hidden="true" />}
          Upload
          <input type="file" className="sr-only" accept={kind === "pdf" ? "application/pdf" : "image/jpeg,image/png,image/webp"} onChange={(e) => upload(e.target.files?.[0])} />
        </label>
        {url ? (
          <button type="button" onClick={() => setUrl("")} className="rounded-lg p-2 text-ink-500 hover:bg-ink-50" aria-label={`Clear ${label}`}>
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      {status.error ? (
        <p role="alert" className="mt-1 text-sm text-danger-700">
          {status.error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}
