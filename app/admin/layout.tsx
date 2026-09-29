import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: { default: "Admin", template: `%s — Admin | ${siteConfig.name}` },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-dvh flex-1 flex-col bg-ink-50">{children}</div>;
}
