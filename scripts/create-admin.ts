// Creates (or resets) an admin login (SPEC §43). There are no default credentials.
//
// Interactive:
//   npm run admin:create
// Non-interactive (password read from an env var so it never appears in shell history):
//   npm run admin:create -- --email you@example.com --name "Your Name" --role SUPER_ADMIN --password-env ADMIN_PASSWORD

import "dotenv/config";
import { createInterface } from "node:readline";
import { AdminRole } from "../generated/prisma/enums";
import { hashPassword, passwordProblems } from "../lib/auth/password";
import { db } from "../lib/db";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function ask(question: string, { hidden = false } = {}): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      // Mask typed characters.
      (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) => {
        if (s.includes(question)) process.stdout.write(s);
        else process.stdout.write("*".repeat(s.length ? 1 : 0));
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

async function main() {
  const email = (arg("email") ?? (await ask("Email: "))).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("A valid email is required.");
  const name = arg("name") ?? (await ask("Full name: "));
  if (name.length < 2) throw new Error("A name is required.");
  const roleInput = (arg("role") ?? (await ask("Role [SUPER_ADMIN/ADMIN/EDITOR] (SUPER_ADMIN): "))) || "SUPER_ADMIN";
  const role = roleInput.toUpperCase() as AdminRole;
  if (!Object.values(AdminRole).includes(role)) throw new Error(`Unknown role: ${roleInput}`);

  const envName = arg("password-env");
  const password = envName ? (process.env[envName] ?? "") : await ask("Password: ", { hidden: true });
  const problem = passwordProblems(password);
  if (problem) throw new Error(`Password rejected: ${problem}`);
  if (!envName) {
    const confirm = await ask("Confirm password: ", { hidden: true });
    if (confirm !== password) throw new Error("Passwords don't match.");
  }

  const passwordHash = await hashPassword(password);
  const existing = await db.admin.findUnique({ where: { email } });
  const admin = await db.admin.upsert({
    where: { email },
    update: { name, role, passwordHash, isActive: true },
    create: { email, name, role, passwordHash },
  });
  if (existing) {
    // Password reset → sign out every existing session.
    await db.adminSession.deleteMany({ where: { adminId: admin.id } });
  }
  await db.auditLog.create({
    data: { adminId: null, action: existing ? "admin.reset_via_cli" : "admin.create_via_cli", entityType: "Admin", entityId: admin.id, changes: { email, role } },
  });
  console.log(`${existing ? "Updated" : "Created"} ${role} ${email}. Sign in at /admin/login`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
