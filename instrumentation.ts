import type { Instrumentation } from "next";

/** Runs once per server start: validate server-only env so misconfiguration fails loudly. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertServerEnv } = await import("./lib/config/validate");
    assertServerEnv();
  }
}

/** Server-side error log hook (SPEC §55). Swap console for a hosted service (e.g. Sentry) before launch. */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const message = error instanceof Error ? error.message : String(error);
  const digest =
    typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : undefined;
  console.error("[request-error]", {
    message,
    digest,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
  });
};
