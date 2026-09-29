import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndex } from "@/components/blog/blog-index";
import { pageRobots } from "@/lib/seo/robots";
import { getBlogCategories, listPosts } from "@/services/blog.service";

export async function generateMetadata({ params }: PageProps<"/blog/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getBlogCategories()).find((c) => c.slug === slug);
  if (!category) return { title: "Category not found", robots: pageRobots(false) };
  return {
    title: `${category.name} — Jaipur Real Estate Blog`,
    description: category.description ?? `Articles about ${category.name.toLowerCase()} for Jaipur property buyers and tenants.`,
    alternates: { canonical: `/blog/category/${slug}` },
    robots: pageRobots(category._count.posts > 0),
  };
}

export default async function BlogCategoryPage({ params, searchParams }: PageProps<"/blog/category/[slug]">) {
  const { slug } = await params;
  const categories = await getBlogCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();
  const { posts, totalPages, page } = await listPosts(Number((await searchParams).page) || 1, slug);
  return (
    <BlogIndex
      title={category.name}
      description={category.description ?? ""}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: category.name }]}
      posts={posts}
      page={page}
      totalPages={totalPages}
      basePath={`/blog/category/${slug}`}
      categories={categories.map((c) => ({ name: c.name, slug: c.slug, count: c._count.posts }))}
      activeCategory={slug}
    />
  );
}
