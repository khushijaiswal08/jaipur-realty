import type { Metadata } from "next";
import { FaqList } from "@/components/shared/detail-sections";
import { WhatsAppButton } from "@/components/shared/contact-buttons";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd } from "@/lib/seo/jsonld";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/layout-primitives";
import { FAQ_SCOPE_LABELS } from "@/lib/constants/enums";
import { pageRobots } from "@/lib/seo/robots";
import { getGeneralFaqs, type FaqDTO } from "@/services/content.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about site visits, listing your property, verification, home loans and renting in Jaipur.",
  alternates: { canonical: "/faq" },
  robots: pageRobots(),
};

export default async function FaqPage() {
  const faqs = await getGeneralFaqs();
  const groups = new Map<FaqDTO["scope"], FaqDTO[]>();
  for (const f of faqs) groups.set(f.scope, [...(groups.get(f.scope) ?? []), f]);

  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <JsonLd data={faqJsonLd(faqs)} />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "FAQs" }]} />
      <h1 className="mt-4 font-display text-3xl text-ink-950 sm:text-4xl">Frequently asked questions</h1>
      <div className="mt-8 space-y-10">
        {[...groups.entries()].map(([scope, items]) => (
          <section key={scope} aria-labelledby={`faq-${scope}`}>
            <h2 id={`faq-${scope}`} className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-500">
              {FAQ_SCOPE_LABELS[scope]}
            </h2>
            <FaqList faqs={items} />
          </section>
        ))}
      </div>
      <div className="mt-10 rounded-card border border-ink-100 bg-white p-6 text-center">
        <p className="font-semibold text-ink-950">Didn&apos;t find your answer?</p>
        <p className="mt-1 text-sm text-ink-600">Ask us on WhatsApp — we usually reply within minutes during office hours.</p>
        <WhatsAppButton context="faq_page" className="mt-4" />
      </div>
    </Container>
  );
}
