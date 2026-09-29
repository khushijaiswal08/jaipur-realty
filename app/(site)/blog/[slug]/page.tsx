import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/blog/post-card";
import { CallButton, WhatsAppButton } from "@/components/shared/contact-buttons";
import { Banner } from "@/components/shared/detail-sections";
import { Markdown } from "@/components/shared/markdown";
import { ShareButton } from "@/components/shared/share-button";
import { SmartImage } from "@/components/shared/smart-image";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container, SectionHeading } from "@/components/ui/layout-primitives";
import { absoluteUrl, siteConfig } from "@/lib/config";
import { formatDate } from "@/lib/format/date";
import { extractToc } from "@/lib/markdown";
import { pageRobots } from "@/lib/seo/robots";
import { getPostBySlug, getPostSlugs, getRelatedPosts } from "@/services/blog.service";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getPostSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found", robots: pageRobots(false) };
  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    robots: pageRobots(!post.isDemo),
    openGraph: {
      type: "article",
      title,
      description,
      url: absoluteUrl(`/blog/${post.slug}`),
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const [related] = await Promise.all([getRelatedPosts(post)]);
  const toc = extractToc(post.content);

  return (
    <>
      <Container className="py-8 sm:py-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Blog", href: "/blog" },
            ...(post.category ? [{ label: post.category.name, href: `/blog/category/${post.category.slug}` }] : []),
            { label: post.title },
          ]}
        />
        <article className="mx-auto mt-6 max-w-3xl">
          {post.category ? (
            <Link href={`/blog/category/${post.category.slug}`} className="text-sm font-semibold uppercase tracking-wider text-brand-700">
              {post.category.name}
            </Link>
          ) : null}
          <h1 className="mt-2 font-display text-3xl leading-tight text-ink-950 sm:text-4xl">{post.title}</h1>
          <p className="mt-3 text-lg text-ink-600">{post.excerpt}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-ink-100 py-3 text-sm text-ink-500">
            <p>
              {post.authorName ? `By ${post.authorName} · ` : `${siteConfig.name} · `}
              {post.publishedAt ? <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> : null}
              {post.readingTimeMinutes ? ` · ${post.readingTimeMinutes} min read` : null}
            </p>
            <ShareButton url={absoluteUrl(`/blog/${post.slug}`)} title={post.title} className="h-9" />
          </div>
          {post.isDemo ? (
            <div className="mt-6">
              <Banner tone="demo" title="Demo article">
                This article is sample content showing how the blog looks. Replace it from the admin panel.
              </Banner>
            </div>
          ) : null}
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-ink-50">
            <SmartImage src={post.cover.url} alt={post.cover.alt} fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
          </div>

          {toc.length >= 3 ? (
            <nav aria-label="On this page" className="mt-8 rounded-card border border-ink-100 bg-white p-5">
              <p className="text-sm font-semibold text-ink-950">On this page</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="text-ink-700 hover:text-brand-700">
                      {t.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <Markdown className="mt-8 text-[1.0625rem]">{post.content}</Markdown>

          {post.tags.length ? (
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Tags">
              {post.tags.map((t) => (
                <li key={t} className="rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-ink-700">
                  #{t}
                </li>
              ))}
            </ul>
          ) : null}

          <aside className="mt-10 rounded-card bg-ink-950 bg-arches p-6 text-white sm:p-8">
            <h2 className="font-display text-2xl">Looking for a property in Jaipur?</h2>
            <p className="mt-2 text-ink-200">Tell us what you need — we&apos;ll share options that match your budget and preferred locality.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <WhatsAppButton context="blog_post" />
              <CallButton context="blog_post" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20" showNumber />
            </div>
          </aside>
        </article>
      </Container>

      {related.length ? (
        <section className="border-t border-ink-100 bg-white py-12">
          <Container>
            <SectionHeading title="Keep reading" action={{ href: "/blog", label: "All articles" }} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
