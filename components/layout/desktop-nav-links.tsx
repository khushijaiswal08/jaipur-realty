"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

/** Query-string links (e.g. Commercial → /buy?category=commercial) never claim "current page". */
export function isActivePath(pathname: string, href: string): boolean {
  if (href.includes("?")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-0.5 xl:gap-1">
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors xl:px-3",
                "after:absolute after:inset-x-2.5 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-gold-500 after:transition-transform xl:after:inset-x-3",
                active ? "text-brand-900 after:scale-x-100" : "text-ink-700 after:scale-x-0 hover:text-brand-900 hover:after:scale-x-100",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
