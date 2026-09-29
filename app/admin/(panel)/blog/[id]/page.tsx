import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Trash2 } from "lucide-react";
import { ActionForm } from "@/components/admin/action-form";
import { PageHeader } from "@/components/admin/admin-ui";
import { ConfirmSubmit } from "@/components/admin/confirm-button";
import { BlogPostFields } from "@/components/admin/content-fields";
import { buttonVariants } from "@/components/ui/button";
import { deletePostAction, savePostAction } from "@/lib/actions/admin/content";
import { requireAdmin } from "@/lib/auth/session";
import { getPostForEdit, listCategories } from "@/services/admin/content-admin.service";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage({ params, searchParams }: PageProps<"/admin/blog/[id]">) {
  await requireAdmin("manageContent");
  const { id } = await params;
  const { created } = await searchParams;
  const [post, categories] = await Promise.all([getPostForEdit(id), listCategories()]);
  if (!post) notFound();
  const live = post.status === "PUBLISHED" && post.publishedAt && post.publishedAt <= new Date();
  return (
    <>
      <PageHeader
        title={post.title}
        back={{ href: "/admin/blog", label: "Blog" }}
        actions={
          live ? (
            <Link href={`/blog/${post.slug}`} target="_blank" className={buttonVariants({ variant: "outline" })}>
              <ExternalLink aria-hidden="true" /> View post
            </Link>
          ) : null
        }
      />
      {created ? <p className="mb-4 rounded-xl bg-success-50 px-4 py-3 text-sm text-success-700">Post created.</p> : null}
      <div className="space-y-5">
        <ActionForm action={savePostAction.bind(null, post.id)} submitLabel="Save changes">
          <BlogPostFields post={post} categories={categories} />
        </ActionForm>
        <section className="rounded-card border border-danger-600/20 bg-white p-5">
          <h2 className="font-semibold text-danger-700">Delete post</h2>
          <form action={deletePostAction.bind(null, post.id)} className="mt-3">
            <ConfirmSubmit variant="danger" confirm="Delete this post permanently?">
              <Trash2 aria-hidden="true" /> Delete post
            </ConfirmSubmit>
          </form>
        </section>
      </div>
    </>
  );
}
