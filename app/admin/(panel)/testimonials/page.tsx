import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyRow, PageHeader, Pill, Table, td, th } from "@/components/admin/admin-ui";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { listTestimonials } from "@/services/admin/content-admin.service";

export const metadata: Metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage({ searchParams }: PageProps<"/admin/testimonials">) {
  await requireAdmin("manageContent");
  const { created, deleted } = await searchParams;
  const rows = await listTestimonials();
  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Demo testimonials are labelled on the site. Editing one turns it into real content — only do that with genuine client feedback."
        actions={
          <Link href="/admin/testimonials/new" className={buttonVariants()}>
            <Plus aria-hidden="true" /> New testimonial
          </Link>
        }
      />
      {created || deleted ? (
        <p className="mb-4 rounded-xl bg-success-50 px-4 py-3 text-sm text-success-700">{created ? "Testimonial created." : "Testimonial deleted."}</p>
      ) : null}
      <Table minWidth="44rem">
        <thead className="border-b border-ink-100 bg-ink-50/60">
          <tr>
            <th className={th}>Client</th>
            <th className={th}>Quote</th>
            <th className={th}>Rating</th>
            <th className={th}>Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.length ? (
            rows.map((t) => (
              <tr key={t.id} className="hover:bg-ink-50/50">
                <td className={td}>
                  <Link href={`/admin/testimonials/${t.id}`} className="font-semibold text-ink-950 hover:text-brand-700">
                    {t.name}
                  </Link>
                  <span className="block text-xs text-ink-500">{[t.context, t.location].filter(Boolean).join(" · ")}</span>
                </td>
                <td className={`${td} max-w-96`}>
                  <span className="line-clamp-2">{t.quote}</span>
                </td>
                <td className={td}>{t.rating ? `${t.rating} ★` : "—"}</td>
                <td className={td}>
                  <span className="flex gap-1">
                    <Pill tone={t.isPublished ? "green" : "gray"}>{t.isPublished ? "Published" : "Hidden"}</Pill>
                    {t.isDemo ? <Pill tone="gray">Demo</Pill> : null}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={4}>No testimonials yet.</EmptyRow>
          )}
        </tbody>
      </Table>
    </>
  );
}
