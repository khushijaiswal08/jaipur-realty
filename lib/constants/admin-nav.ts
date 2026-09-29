import type { Capability } from "@/lib/auth/permissions";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: string;
  capability?: Capability;
  group: "Overview" | "Leads" | "Listings" | "Content" | "Settings";
}

export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "layout-dashboard", group: "Overview" },
  { label: "Leads", href: "/admin/leads", icon: "inbox", capability: "manageLeads", group: "Leads" },
  { label: "Site visits", href: "/admin/site-visits", icon: "calendar-check", capability: "manageLeads", group: "Leads" },
  { label: "Owner listings", href: "/admin/owner-listings", icon: "house-plus", capability: "manageLeads", group: "Leads" },
  { label: "Properties", href: "/admin/properties", icon: "building", capability: "viewListings", group: "Listings" },
  { label: "Projects", href: "/admin/projects", icon: "building-2", capability: "viewListings", group: "Listings" },
  { label: "Localities", href: "/admin/localities", icon: "map-pinned", capability: "viewListings", group: "Listings" },
  { label: "Agents", href: "/admin/agents", icon: "users", capability: "manageListings", group: "Listings" },
  { label: "Blog", href: "/admin/blog", icon: "newspaper", capability: "manageContent", group: "Content" },
  { label: "FAQs", href: "/admin/faqs", icon: "circle-help", capability: "manageContent", group: "Content" },
  { label: "Testimonials", href: "/admin/testimonials", icon: "quote", capability: "manageContent", group: "Content" },
  { label: "Site settings", href: "/admin/settings", icon: "sliders-horizontal", capability: "manageSettings", group: "Settings" },
  { label: "Admin users", href: "/admin/users", icon: "shield-user", capability: "manageAdmins", group: "Settings" },
  { label: "Audit log", href: "/admin/audit", icon: "history", capability: "manageAdmins", group: "Settings" },
];
