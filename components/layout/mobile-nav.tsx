"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Menu, Plus, X } from "lucide-react";
import { CallButton, WhatsAppButton } from "@/components/shared/contact-buttons";
import { Logo } from "@/components/shared/logo";
import { buttonVariants } from "@/components/ui/button";
import type { NavItem } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import { isActivePath } from "./desktop-nav-links";

/**
 * Full-screen mobile menu built on the native <dialog> element: focus trapping, Escape to
 * close and an inert background come for free (SPEC §38).
 */
export function MobileNav({ items }: { items: NavItem[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Close after navigating.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={buttonVariants({ variant: "ghost", size: "icon", className: "lg:hidden" })}
        aria-label="Open menu"
        aria-haspopup="dialog"
      >
        <Menu />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        className="m-0 h-dvh max-h-none w-full max-w-none bg-white p-0 backdrop:bg-ink-950/40 open:flex open:flex-col"
        onClick={(e) => {
          // Clicking the backdrop (the dialog element itself) closes the menu.
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="flex h-16 items-center justify-between border-b border-ink-100 px-4">
          <Logo />
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-1">
            {items.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex flex-col rounded-xl px-4 py-3 transition-colors",
                      active ? "bg-brand-50" : "hover:bg-ink-50",
                    )}
                  >
                    <span className={cn("text-base font-semibold", active ? "text-brand-800" : "text-ink-950")}>{item.label}</span>
                    {item.description ? <span className="text-sm text-ink-500">{item.description}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/post-property" className={buttonVariants({ variant: "outline", size: "lg", className: "mt-4 w-full" })}>
            <Plus aria-hidden="true" />
            Post your property
          </Link>
        </nav>

        <div className="grid grid-cols-2 gap-3 border-t border-ink-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <CallButton context="mobile_menu" size="lg" className="w-full" />
          <WhatsAppButton context="mobile_menu" size="lg" className="w-full" />
        </div>
      </dialog>
    </>
  );
}
