import type { ReactNode } from "react";
import { Analytics } from "@/components/analytics/analytics";
import { AttributionCapture } from "@/components/analytics/attribution-capture";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CompareTray } from "@/components/property/compare-controls";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { getLocalityLinks } from "@/services/locality.service";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const localities = await getLocalityLinks();
  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-ink-950 shadow-card focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter localities={localities} />
      <FloatingWhatsApp />
      <CompareTray />
      <AttributionCapture />
      <Analytics />
    </>
  );
}
