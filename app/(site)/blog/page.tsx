import type { Metadata } from "next";
import { BlogIndex } from "@/components/blog/blog-index";
import { pageRobots } from "@/lib/seo/robots";
import { getBlogCategories, listPosts } from "@/services/blog.service";

export async function generateMetadata({ searchParams }: PageProps<"/blog">): Promise<Metadata> {
  const page = Number((await searchParams).page) || 1;
  return {
    title: page > 1 ? `Real Estate Guides & Jaipur Market Insights — Page ${page}` : "Real Estate Guides & Jaipur Market Insights",
    description: "Buying guides, locality comparisons, renting tips and property paperwork explained for Jaipur home buyers, tenants and investors.",
    alternates: { canonical: page > 1 ? `/blog?page=${page}` : "/blog" },
    robots: pageRobots(),
  };
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const page = Number((await searchParams).page) || 1;
  const [{ posts, totalPages, page: current }, categories] = await Promise.all([listPosts(page), getBlogCategories()]);
  return (
    <BlogIndex
      title="Guides & insights"
      description="Practical advice for buying, renting and investing in Jaipur property."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      posts={posts}
      page={current}
      totalPages={totalPages}
      basePath="/blog"
      categories={categories.map((c) => ({ name: c.name, slug: c.slug, count: c._count.posts }))}
    />
  );
}
