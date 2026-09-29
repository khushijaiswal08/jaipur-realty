import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { can } from "@/lib/auth/permissions";
import { requireAdmin } from "@/lib/auth/session";
import { siteConfig } from "@/lib/config";
import { ADMIN_NAV } from "@/lib/constants/admin-nav";
import { getAdminBadges } from "@/services/admin-dashboard.service";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const nav = ADMIN_NAV.filter((n) => !n.capability || can(admin.role, n.capability));
  const badges = can(admin.role, "manageLeads") ? await getAdminBadges() : undefined;
  return (
    <AdminShell nav={nav} admin={{ name: admin.name, email: admin.email, role: admin.role }} siteName={siteConfig.name} badges={badges}>
      {children}
    </AdminShell>
  );
}
