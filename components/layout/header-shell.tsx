"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}
const isScrolled = () => window.scrollY > 8;
const serverSnapshot = () => false;

/**
 * Sticky header frame. Once the page scrolls it gains a shadow and a slightly shorter bar
 * (children read the `data-scrolled` state via `group-data-[scrolled]:`).
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const scrolled = useSyncExternalStore(subscribe, isScrolled, serverSnapshot);
  return (
    <header
      data-scrolled={scrolled ? "" : undefined}
      className={cn(
        "group sticky top-0 z-40 border-b transition-[box-shadow,background-color,border-color] duration-200",
        scrolled ? "border-transparent bg-white/95 shadow-header backdrop-blur supports-[backdrop-filter]:bg-white/90" : "border-ink-100 bg-white",
      )}
    >
      {children}
    </header>
  );
}
