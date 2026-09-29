import Link from "next/link";
import { Newspaper } from "lucide-react";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { Container, EmptyState } from "@/components/ui/layout-primitives";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import type { PostCardDTO } from "@/services/content.service";
import { PostCard } from "./post-card";

interface BlogIndexProps {
  title: string;
  description: string;
  breadcrumbs: Crumb[];
  posts: PostCardDTO[];
  page: number;
  totalPages: number;
  basePath: string;
  categories: Array<{ name: string; slug: string; count: number }>;
  activeCategory?: string;
}

export function BlogIndex({ title, description, breadcrumbs, posts, page, totalPages, basePath, categories, activeCategory }: BlogIndexProps) {
  return (
    <>
      <div className="border-b border-ink-100 bg-white">
        <Container className="py-8 sm:py-10">
          <Breadcrumbs items={breadcrumbs} />
          <h1 className="mt-3 font-display text-3xl leading-tight text-ink-950 sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-ink-600">{description}</p>
          <nav aria-label="Categories" className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/blog"
              aria-current={!activeCategory ? "page" : undefined}
              className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", !activeCategory ? "bg-ink-900 text-white" : "bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50")}
            >
              All
            </Link>
            {categories
              .filter((c) => c.count > 0)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/blog/category/${c.slug}`}
                  aria-current={activeCategory === c.slug ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-semibold",
                    activeCategory === c.slug ? "bg-ink-900 text-white" : "bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50",
                  )}
                >
                  {c.name} <span className="font-normal opacity-70">({c.count})</span>
                </Link>
              ))}
          </nav>
        </Container>
      </div>
      <Container className="py-10">
        {posts.length ? (
          <>
            <h2 className="sr-only">Articles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
            <Pagination className="mt-10" page={page} totalPages={totalPages} hrefFor={(p) => (p === 1 ? basePath : `${basePath}?page=${p}`)} />
          </>
        ) : (
          <EmptyState icon={<Newspaper />} title="No articles yet" description="New guides and market insights are on their way." />
        )}
      </Container>
    </>
  );
}
