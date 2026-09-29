import bcrypt from "bcryptjs";

// Password hashing (SPEC §43). bcrypt cost 12 ≈ 250 ms — slow enough to resist offline attacks.
// Not marked server-only so the admin CLI can reuse it.

const COST = 12;
export const MIN_PASSWORD_LENGTH = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

let cachedDummyHash: Promise<string> | undefined;

/**
 * A real bcrypt hash of a throwaway string, compared when the email is unknown so response
 * timing doesn't reveal which accounts exist. Generated once, lazily.
 */
export function dummyHash(): Promise<string> {
  cachedDummyHash ??= bcrypt.hash(`dummy-${Math.random()}`, COST);
  return cachedDummyHash;
}

export function passwordProblems(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return "Use a mix of letters and numbers.";
  return null;
}
