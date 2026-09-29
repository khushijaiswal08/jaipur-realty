import Link from "next/link";
import { SearchX } from "lucide-react";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppButton } from "@/components/shared/contact-buttons";
import { buttonVariants } from "@/components/ui/button";
import { Container, EmptyState } from "@/components/ui/layout-primitives";
import { getLocalityLinks } from "@/services/locality.service";

export const metadata = { title: "Page not found" };

/** Global 404 (SPEC §55): search, popular localities and a WhatsApp CTA. */
export default async function NotFound() {
  const localities = await getLocalityLinks();
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Container className="py-16 sm:py-24">
          <EmptyState
            icon={<SearchX />}
            headingLevel={1}
            title="We couldn't find that page"
            description="The listing may have been removed or the link may be incorrect. Try browsing properties or a locality below."
          >
            <Link href="/buy" className={buttonVariants()}>
              Properties for sale
            </Link>
            <Link href="/rent" className={buttonVariants({ variant: "outline" })}>
              Properties for rent
            </Link>
            <WhatsAppButton context="not_found" variant="whatsapp" />
          </EmptyState>
          {localities.length ? (
            <div className="mx-auto mt-10 max-w-3xl text-center">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500">Popular localities</h2>
              <ul className="mt-4 flex flex-wrap justify-center gap-2">
                {localities.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/localities/${l.slug}`}
                      className="inline-block rounded-full border border-ink-200 bg-white px-4 py-1.5 text-sm font-medium text-ink-800 hover:border-brand-300 hover:text-brand-800"
                    >
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Container>
      </main>
      <SiteFooter localities={localities} />
      <FloatingWhatsApp />
    </>
  );
}
