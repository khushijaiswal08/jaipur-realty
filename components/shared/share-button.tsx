"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/** Native share sheet on mobile; copies the link elsewhere. */
export function ShareButton({ url, title, className }: { url: string; title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or share failed — fall back to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <button type="button" onClick={share} className={buttonVariants({ variant: "outline", className })}>
      {copied ? <Check aria-hidden="true" /> : <Share2 aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}
