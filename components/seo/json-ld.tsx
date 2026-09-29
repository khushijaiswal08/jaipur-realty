/**
 * Renders JSON-LD structured data (SPEC §32). `<` is escaped so CMS text can't close the
 * script tag (per the Next.js JSON-LD guide). Null entries are skipped.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | null | Array<Record<string, unknown> | null> }) {
  const items = (Array.isArray(data) ? data : [data]).filter((d): d is Record<string, unknown> => d !== null);
  if (!items.length) return null;
  return (
    <>
      {items.map((item, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }} />
      ))}
    </>
  );
}
