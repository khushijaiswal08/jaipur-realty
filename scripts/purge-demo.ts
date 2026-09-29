// Deletes every demo record (isDemo = true) — SPEC §35.1.
//   npm run db:purge-demo            (asks for confirmation)
//   npm run db:purge-demo -- --yes   (non-interactive)
//
// Localities, amenities, blog categories and general FAQs are reference data and are kept.

import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { db } from "../lib/db";

async function confirm(): Promise<boolean> {
  if (process.argv.includes("--yes")) return true;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question("Delete ALL demo properties, projects, agents, testimonials and blog posts? Type 'purge' to continue: ");
  rl.close();
  return answer.trim().toLowerCase() === "purge";
}

async function main() {
  const counts = {
    properties: await db.property.count({ where: { isDemo: true } }),
    projects: await db.project.count({ where: { isDemo: true } }),
    agents: await db.agent.count({ where: { isDemo: true } }),
    testimonials: await db.testimonial.count({ where: { isDemo: true } }),
    blogPosts: await db.blogPost.count({ where: { isDemo: true } }),
  };
  console.log("Demo records found:", counts);
  if (Object.values(counts).every((n) => n === 0)) return;
  if (!(await confirm())) {
    console.log("Aborted — nothing deleted.");
    return;
  }

  // Order matters: properties reference projects and agents (images/views/FAQs cascade).
  const result = await db.$transaction([
    db.property.deleteMany({ where: { isDemo: true } }),
    db.project.deleteMany({ where: { isDemo: true } }),
    db.agent.deleteMany({ where: { isDemo: true } }),
    db.testimonial.deleteMany({ where: { isDemo: true } }),
    db.blogPost.deleteMany({ where: { isDemo: true } }),
  ]);
  console.log(
    "Deleted:",
    Object.fromEntries(Object.keys(counts).map((k, i) => [k, result[i]?.count ?? 0])),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
