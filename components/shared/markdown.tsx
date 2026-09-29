import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Renders CMS Markdown (blog posts, FAQ answers). react-markdown never renders raw HTML, so
 * admin-entered content can't inject scripts (SPEC §23, §56). Internal links use next/link.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href = "", children: text }) =>
            href.startsWith("/") ? (
              <Link href={href}>{text}</Link>
            ) : (
              <a href={href} target="_blank" rel="noopener noreferrer nofollow">
                {text}
              </a>
            ),
          // Headings inside CMS content start at h2 (the page owns h1).
          h1: ({ children: text }) => <h2>{text}</h2>,
          img: () => null,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
