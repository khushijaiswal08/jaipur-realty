import type { Metadata } from "next";
import { BadgeCheck, MessageCircle, PhoneCall, ShieldCheck } from "lucide-react";
import { OwnerListingForm } from "@/components/forms/owner-listing-form";
import { WhatsAppButton } from "@/components/shared/contact-buttons";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/layout-primitives";
import { pageRobots } from "@/lib/seo/robots";
import { ownerListingMessage } from "@/lib/whatsapp";
import { getLocalityLinks } from "@/services/locality.service";

export const metadata: Metadata = {
  title: "Post Your Property — Sell or Rent Out in Jaipur",
  description: "List your Jaipur flat, house, plot or commercial space for sale or rent. Share the details in two minutes; our team verifies every listing before it goes live.",
  alternates: { canonical: "/post-property" },
  robots: pageRobots(),
};

const STEPS = [
  { icon: MessageCircle, title: "Share the basics", body: "Type, locality, price and size — two minutes, no sign-up." },
  { icon: PhoneCall, title: "We call to verify", body: "Our team confirms the details and arranges photos if needed." },
  { icon: BadgeCheck, title: "Go live & get enquiries", body: "Your listing reaches buyers and tenants actively searching in Jaipur." },
];

export default async function PostPropertyPage() {
  const localities = await getLocalityLinks();
  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Post your property" }]} />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_28rem]">
        <div>
          <h1 className="font-display text-3xl leading-tight text-ink-950 sm:text-4xl">Sell or rent out your property in Jaipur</h1>
          <p className="mt-3 max-w-xl text-ink-600">
            Tell us about your flat, house, plot or shop. Nothing is published until our team has spoken to you and verified the
            details.
          </p>
          <ol className="mt-8 space-y-5">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <s.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-ink-950">
                    {i + 1}. {s.title}
                  </p>
                  <p className="text-sm text-ink-600">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex items-start gap-3 rounded-card border border-ink-100 bg-white p-5 text-sm text-ink-600">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success-600" aria-hidden="true" />
            <p>Your phone number and address are never shown publicly. We only use them to contact you about this listing.</p>
          </div>
          <div className="mt-6">
            <p className="mb-2 text-sm text-ink-500">Prefer to chat?</p>
            <WhatsAppButton context="post_property" message={ownerListingMessage({ transactionType: "SALE" })} />
          </div>
        </div>
        <div className="rounded-card border border-ink-100 bg-white p-5 shadow-card sm:p-6">
          <h2 className="mb-5 font-display text-xl text-ink-950">Property details</h2>
          <OwnerListingForm localities={localities.map((l) => ({ name: l.name, slug: l.slug }))} />
        </div>
      </div>
    </Container>
  );
}
