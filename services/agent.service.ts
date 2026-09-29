import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { resolveContact, type ContactPoint } from "@/lib/contact";
import { db } from "@/lib/db";
import { placeholderImage, type ImageDTO } from "@/lib/images";

export const agentSelect = {
  id: true,
  name: true,
  slug: true,
  designation: true,
  phone: true,
  whatsapp: true,
  email: true,
  photoUrl: true,
  bio: true,
  languages: true,
  experienceYears: true,
  reraAgentNumber: true,
  isDemo: true,
} satisfies Prisma.AgentSelect;

type AgentRow = Prisma.AgentGetPayload<{ select: typeof agentSelect }>;

export interface AgentDTO {
  id: string;
  name: string;
  slug: string;
  designation: string | null;
  email: string | null;
  photo: ImageDTO;
  bio: string | null;
  languages: string[];
  experienceYears: number | null;
  reraAgentNumber: string | null;
  isDemo: boolean;
  /** Agent numbers, falling back to the business numbers (SPEC §20). */
  contact: ContactPoint;
}

export function toAgent(row: AgentRow): AgentDTO {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    designation: row.designation,
    email: row.email,
    photo: row.photoUrl ? { url: row.photoUrl, alt: row.name, width: 600, height: 600 } : placeholderImage("agent", row.name),
    bio: row.bio,
    languages: row.languages,
    experienceYears: row.experienceYears,
    reraAgentNumber: row.reraAgentNumber,
    isDemo: row.isDemo,
    contact: resolveContact(row),
  };
}

/** id/name pairs for admin selects. */
export async function getAgentOptions(): Promise<Array<{ id: string; name: string }>> {
  return db.agent.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } });
}

export async function getActiveAgents(): Promise<AgentDTO[]> {
  const rows = await db.agent.findMany({
    where: { isActive: true },
    select: agentSelect,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(toAgent);
}
