import type { ReactNode } from "react";
import { Banner } from "@/components/shared/detail-sections";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/layout-primitives";
import { formatDate } from "@/lib/format/date";

/**
 * Flip to true once a qualified legal professional has reviewed the privacy policy, terms and
 * disclaimer text (docs/ASSUMPTIONS.md). Until then each page shows a notice.
 */
export const LEGAL_REVIEWED = false;
export const LEGAL_LAST_UPDATED = "2026-09-29";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: title }]} />
      <h1 className="mt-4 font-display text-3xl text-ink-950 sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-ink-500">Last updated {formatDate(`${LEGAL_LAST_UPDATED}T12:00:00+05:30`)}</p>
      {!LEGAL_REVIEWED ? (
        <div className="mt-6">
          <Banner tone="info" title="Template pending legal review">
            This page is a starting template and has not yet been reviewed by a legal professional.
          </Banner>
        </div>
      ) : null}
      <div className="prose-content mt-8">{children}</div>
    </Container>
  );
}
