import "server-only";

import { siteConfig } from "@/lib/config";
import { getTurnstileSecret } from "@/lib/config/server";

/** Submissions faster than this after the form rendered are treated as bots (SPEC §30). */
export const MIN_FILL_MS = 3000;

export interface SpamSignals {
  honeypot?: string;
  startedAt?: string;
}

/**
 * True when the honeypot is filled or the form was submitted implausibly fast.
 * A missing timestamp is NOT treated as spam: visitors without JavaScript (progressive
 * enhancement) never get one, and silently discarding their leads would be worse than the
 * occasional bot — which the honeypot and rate limit still catch.
 */
export function looksAutomated({ honeypot, startedAt }: SpamSignals, now = Date.now()): boolean {
  if (honeypot && honeypot.trim() !== "") return true;
  const started = Number(startedAt);
  if (!Number.isFinite(started) || started <= 0) return false;
  return now - started < MIN_FILL_MS;
}

export function turnstileEnabled(): boolean {
  return Boolean(siteConfig.turnstileSiteKey && getTurnstileSecret());
}

/** Verifies a Cloudflare Turnstile token when Turnstile is configured; otherwise passes. */
export async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  const secret = getTurnstileSecret();
  if (!siteConfig.turnstileSiteKey || !secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    // Verification is configured but unreachable — fail closed.
    return false;
  }
}
