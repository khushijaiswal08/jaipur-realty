"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import {
  Building,
  Building2,
  CalendarCheck,
  CircleHelp,
  ExternalLink,
  History,
  HousePlus,
  Inbox,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  Newspaper,
  Quote,
  ShieldUser,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { ADMIN_ROLE_LABELS } from "@/lib/constants/enums";
import type { AdminNavItem } from "@/lib/constants/admin-nav";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  inbox: Inbox,
  "calendar-check": CalendarCheck,
  "house-plus": HousePlus,
  building: Building,
  "building-2": Building2,
  "map-pinned": MapPinned,
  users: Users,
  newspaper: Newspaper,
  "circle-help": CircleHelp,
  quote: Quote,
  "shield-user": ShieldUser,
  history: History,
};

interface ShellProps {
  nav: AdminNavItem[];
  admin: { name: string; email: string; role: keyof typeof ADMIN_ROLE_LABELS };
  siteName: string;
  badges?: Record<string, number>;
  children: ReactNode;
}

function NavList({ nav, badges, onNavigate }: { nav: AdminNavItem[]; badges?: Record<string, number>; onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = [...new Set(nav.map((n) => n.group))];
  return (
    <nav aria-label="Admin" className="space-y-6">
      {groups.map((group) => (
        <div key={group}>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-ink-400">{group}</p>
          <ul className="space-y-0.5">
            {nav
              .filter((n) => n.group === group)
              .map((n) => {
                const Icon = ICONS[n.icon] ?? LayoutDashboard;
                const active = n.href === "/admin" ? pathname === "/admin" : pathname === n.href || pathname.startsWith(`${n.href}/`);
                const badge = badges?.[n.href];
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                      <span className="flex-1">{n.label}</span>
                      {badge ? <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">{badge}</span> : null}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({ nav, admin, siteName, badges, children }: ShellProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  useEffect(() => dialogRef.current?.close(), [pathname]);

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto bg-ink-950 px-3 py-5 lg:flex">
        <Link href="/admin" className="mb-6 px-3 font-display text-lg text-white">
          {siteName}
          <span className="block font-sans text-xs font-normal text-ink-400">Admin</span>
        </Link>
        <NavList nav={nav} badges={badges} />
        <Link href="/" target="_blank" className="mt-auto flex items-center gap-2 px-3 pt-6 text-sm text-ink-400 hover:text-white">
          <ExternalLink className="size-4" aria-hidden="true" />
          View website
        </Link>
      </aside>

      <dialog
        ref={dialogRef}
        aria-label="Admin menu"
        className="m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-ink-950 p-4 backdrop:bg-ink-950/50 open:flex open:flex-col"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="font-display text-lg text-white">{siteName}</span>
          <button type="button" onClick={() => dialogRef.current?.close()} className="rounded-lg p-2 text-ink-300 hover:bg-white/10" aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <NavList nav={nav} badges={badges} onNavigate={() => dialogRef.current?.close()} />
      </dialog>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-ink-100 bg-white px-4 sm:px-6">
          <button type="button" onClick={() => dialogRef.current?.showModal()} className="rounded-lg p-2 text-ink-700 hover:bg-ink-50 lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-ink-950">{admin.name}</p>
              <p className="text-xs text-ink-500">{ADMIN_ROLE_LABELS[admin.role]}</p>
            </div>
            <form action={logout}>
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
