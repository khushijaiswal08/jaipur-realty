import { OG_SIZE, ogImage } from "@/lib/og";
import { getPostBySlug } from "@/services/blog.service";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Article";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return ogImage({ title: "Guides & insights" });
  return ogImage({
    eyebrow: post.category?.name ?? "Guides & insights",
    title: post.title,
    subtitle: post.readingTimeMinutes ? `${post.readingTimeMinutes} min read` : undefined,
    demo: post.isDemo,
  });
}
