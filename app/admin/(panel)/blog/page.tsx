import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { ActionForm } from "@/components/admin/action-form";
import { EmptyRow, PageHeader, Panel, Pill, Table, td, th } from "@/components/admin/admin-ui";
import { ConfirmSubmit } from "@/components/admin/confirm-button";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/form-controls";
import { deleteCategoryAction, saveCategoryAction } from "@/lib/actions/admin/content";
import { PUBLISH_STATUS_TONE } from "@/lib/admin-tones";
import { requireAdmin } from "@/lib/auth/session";
import { PUBLISH_STATUS_LABELS } from "@/lib/constants/enums";
import { formatDate } from "@/lib/format/date";
import { listAdminPosts, listCategories } from "@/services/admin/content-admin.service";

export const metadata: Metadata = { title: "Blog" };

export default async function AdminBlogPage({ searchParams }: PageProps<"/admin/blog">) {
  await requireAdmin("manageContent");
  const { deleted } = await searchParams;
  const [posts, categories] = await Promise.all([listAdminPosts(), listCategories()]);
  return (
    <>
      <PageHeader
        title="Blog"
        description={`${posts.length} posts`}
        actions={
          <Link href="/admin/blog/new" className={buttonVariants()}>
            <Plus aria-hidden="true" /> New post
          </Link>
        }
      />
      {deleted ? <p className="mb-4 rounded-xl bg-success-50 px-4 py-3 text-sm text-success-700">Post deleted.</p> : null}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Table minWidth="40rem">
          <thead className="border-b border-ink-100 bg-ink-50/60">
            <tr>
              <th className={th}>Title</th>
              <th className={th}>Category</th>
              <th className={th}>Status</th>
              <th className={th}>Published</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {posts.length ? (
              posts.map((p) => (
                <tr key={p.id} className="hover:bg-ink-50/50">
                  <td className={td}>
                    <Link href={`/admin/blog/${p.id}`} className="font-semibold text-ink-950 hover:text-brand-700">
                      {p.title}
                    </Link>
                    {p.isDemo ? (
                      <span className="ml-2">
                        <Pill tone="gray">Demo</Pill>
                      </span>
                    ) : null}
                  </td>
                  <td className={td}>{p.category?.name ?? "—"}</td>
                  <td className={td}>
                    <Pill tone={PUBLISH_STATUS_TONE[p.status]}>
                      {p.isScheduled ? "Scheduled" : PUBLISH_STATUS_LABELS[p.status]}
                    </Pill>
                  </td>
                  <td className={`${td} text-ink-500`}>{p.publishedAt ? formatDate(p.publishedAt) : "—"}</td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={4}>No posts yet.</EmptyRow>
            )}
          </tbody>
        </Table>

        <Panel title="Categories">
          <ul className="mb-5 divide-y divide-ink-100">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span>
                  <span className="font-medium text-ink-900">{c.name}</span> <span className="text-ink-500">({c._count.posts})</span>
                </span>
                <form action={deleteCategoryAction.bind(null, c.id)}>
                  <ConfirmSubmit variant="ghost" className="h-8 px-2 text-danger-700" confirm={`Delete “${c.name}”? Posts keep their content but lose the category.`}>
                    <Trash2 className="size-4" aria-hidden="true" />
                    <span className="sr-only">Delete {c.name}</span>
                  </ConfirmSubmit>
                </form>
              </li>
            ))}
          </ul>
          <ActionForm action={saveCategoryAction.bind(null, "")} submitLabel="Add category" size="sm" resetOnSuccess>
            <Input name="name" placeholder="New category name" aria-label="Category name" className="h-10" />
            <Input name="description" placeholder="Short description (optional)" aria-label="Category description" className="h-10" />
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}
