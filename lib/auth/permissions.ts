import type { AdminRole } from "@/generated/prisma/enums";

// Role → capability matrix (SPEC §43). Checked server-side on every admin page and action.
export const CAPABILITIES = {
  manageAdmins: ["SUPER_ADMIN"],
  purgeDemo: ["SUPER_ADMIN"],
  manageListings: ["SUPER_ADMIN", "ADMIN"],
  viewListings: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  manageLeads: ["SUPER_ADMIN", "ADMIN"],
  exportLeads: ["SUPER_ADMIN", "ADMIN"],
  manageContent: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
} as const satisfies Record<string, readonly AdminRole[]>;

export type Capability = keyof typeof CAPABILITIES;

export function can(role: AdminRole, capability: Capability): boolean {
  return (CAPABILITIES[capability] as readonly AdminRole[]).includes(role);
}
