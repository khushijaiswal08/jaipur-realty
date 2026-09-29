import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge must know our custom tokens/utilities from app/globals.css, otherwise it
 * guesses (e.g. treats `bg-arches` as a background colour and silently drops `bg-brand-900`).
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: ["card", "card-hover", "header"],
      radius: ["card"],
    },
    classGroups: {
      "bg-image": ["bg-arches"],
    },
  },
});

/** Merges Tailwind class lists, letting later utilities override earlier ones. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** "3 BHK Apartment, Vaishali Nagar!" → "3-bhk-apartment-vaishali-nagar" */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
    .replace(/-+$/g, "");
}

/** Property slugs end with the lowercased refCode so they stay unique (SPEC §13.1). */
export function propertySlug(title: string, refCode: string): string {
  return `${slugify(title)}-${refCode.toLowerCase()}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Reading time at ~200 words per minute, minimum 1. */
export function readingTimeMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
