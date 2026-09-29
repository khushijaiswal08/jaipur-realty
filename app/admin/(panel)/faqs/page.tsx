import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyRow, PageHeader, Pill, Table, td, th } from "@/components/admin/admin-ui";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { FAQ_SCOPE_LABELS } from "@/lib/constants/enums";
import { listFaqs } from "@/services/admin/content-admin.service";

export const metadata: Metadata = { title: "FAQs" };

export default async function AdminFaqsPage({ searchParams }: PageProps<"/admin/faqs">) {
  await requireAdmin("manageContent");
  const { created, deleted } = await searchParams;
  const faqs = await listFaqs();
  return (
    <>
      <PageHeader
        title="FAQs"
        description="General FAQs appear on /faq; scoped ones appear on the linked property, project or locality page."
        actions={
          <Link href="/admin/faqs/new" className={buttonVariants()}>
            <Plus aria-hidden="true" /> New FAQ
          </Link>
        }
      />
      {created || deleted ? (
        <p className="mb-4 rounded-xl bg-success-50 px-4 py-3 text-sm text-success-700">{created ? "FAQ created." : "FAQ deleted."}</p>
      ) : null}
      <Table minWidth="44rem">
        <thead className="border-b border-ink-100 bg-ink-50/60">
          <tr>
            <th className={th}>Question</th>
            <th className={th}>Scope</th>
            <th className={th}>Shown on</th>
            <th className={th}>Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {faqs.length ? (
            faqs.map((f) => (
              <tr key={f.id} className="hover:bg-ink-50/50">
                <td className={td}>
                  <Link href={`/admin/faqs/${f.id}`} className="font-medium text-ink-950 hover:text-brand-700">
                    {f.question}
                  </Link>
                </td>
                <td className={td}>{FAQ_SCOPE_LABELS[f.scope]}</td>
                <td className={td}>{f.property?.refCode ?? f.project?.name ?? f.locality?.name ?? "/faq"}</td>
                <td className={td}>
                  <Pill tone={f.isPublished ? "green" : "gray"}>{f.isPublished ? "Published" : "Hidden"}</Pill>
                </td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={4}>No FAQs yet.</EmptyRow>
          )}
        </tbody>
      </Table>
    </>
  );
}
