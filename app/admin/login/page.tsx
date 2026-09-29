import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getCurrentAdmin } from "@/lib/auth/session";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getCurrentAdmin()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="font-display text-2xl text-ink-950">
            {siteConfig.name}
          </Link>
          <p className="mt-1 text-sm text-ink-500">Admin panel</p>
        </div>
        <div className="rounded-card border border-ink-100 bg-white p-6 shadow-card">
          <h1 className="mb-5 text-lg font-semibold text-ink-950">Sign in</h1>
          <LoginForm next={typeof next === "string" ? next : undefined} />
        </div>
        <p className="mt-6 text-center text-xs text-ink-500">
          No account yet? An administrator can create one with <code className="rounded bg-ink-100 px-1">npm run admin:create</code>.
        </p>
      </div>
    </main>
  );
}
