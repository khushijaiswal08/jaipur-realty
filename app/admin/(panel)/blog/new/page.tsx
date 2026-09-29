import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/action-form";
import { PageHeader } from "@/components/admin/admin-ui";
import { BlogPostFields } from "@/components/admin/content-fields";
import { savePostAction } from "@/lib/actions/admin/content";
import { requireAdmin } from "@/lib/auth/session";
import { listCategories } from "@/services/admin/content-admin.service";

export const metadata: Metadata = { title: "New post" };

export default async function NewPostPage() {
  await requireAdmin("manageContent");
  const categories = await listCategories();
  return (
    <>
      <PageHeader title="New post" back={{ href: "/admin/blog", label: "Blog" }} />
      <ActionForm action={savePostAction.bind(null, "")} submitLabel="Create post">
        <BlogPostFields categories={categories} />
      </ActionForm>
    </>
  );
}
