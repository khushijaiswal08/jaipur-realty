import { slugify } from "./utils";

export interface TocItem {
  id: string;
  text: string;
}

/** "## Heading" lines → table of contents (SPEC §23). Ids match Markdown's heading anchors. */
export function extractToc(markdown: string): TocItem[] {
  const out: TocItem[] = [];
  const seen = new Map<string, number>();
  for (const line of markdown.split(/\r?\n/)) {
    const m = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = m[1]!.replace(/[*_`[\]]/g, "").trim();
    out.push({ id: uniqueId(slugify(text), seen), text });
  }
  return out;
}

export function uniqueId(base: string, seen: Map<string, number>): string {
  const id = base || "section";
  const n = seen.get(id) ?? 0;
  seen.set(id, n + 1);
  return n ? `${id}-${n + 1}` : id;
}
