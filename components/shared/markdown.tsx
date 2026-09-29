import Link from "next/link";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { uniqueId } from "@/lib/markdown";
import { cn, slugify } from "@/lib/utils";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) return textOf((node as { props: { children?: ReactNode } }).props.children);
  return "";
}

/**
 * Renders CMS Markdown (blog posts, FAQ answers). react-markdown never renders raw HTML, so
 * admin-entered content can't inject scripts (SPEC §23, §56). Internal links use next/link;
 * h2s get stable ids for the table of contents (lib/markdown.ts).
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  const seen = new Map<string, number>();
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
          h2: ({ children: text }) => (
            <h2 id={uniqueId(slugify(textOf(text).replace(/[*_`[\]]/g, "")), seen)} className="scroll-mt-24">
              {text}
            </h2>
          ),
          img: () => null,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
