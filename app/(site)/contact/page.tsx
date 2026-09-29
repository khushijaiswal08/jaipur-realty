import type { Metadata } from "next";
import { Clock, Mail, MapPin } from "lucide-react";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { CallButton, PhoneLink, WhatsAppButton } from "@/components/shared/contact-buttons";
import { LocationMap } from "@/components/shared/location-map";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/layout-primitives";
import { formattedAddress, siteConfig } from "@/lib/config";
import { pageRobots } from "@/lib/seo/robots";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Call, WhatsApp or visit ${siteConfig.name} in ${siteConfig.address.city}. We reply to property enquiries quickly.`,
  alternates: { canonical: "/contact" },
  robots: pageRobots(),
};

/** Contact page (SPEC §21) — every detail comes from lib/config. */
export default function ContactPage() {
  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <h1 className="mt-4 font-display text-3xl text-ink-950 sm:text-4xl">Contact us</h1>
      <p className="mt-2 max-w-2xl text-ink-600">The fastest way to reach us is WhatsApp. You can also call, email, visit the office or send a message below.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-card border border-ink-100 bg-white p-5 shadow-card">
              <h2 className="font-semibold text-ink-950">Call or WhatsApp</h2>
              <PhoneLink context="contact_page" className="mt-2 text-lg font-semibold text-ink-900 hover:text-brand-700" />
              <div className="mt-4 flex flex-wrap gap-2">
                <WhatsAppButton context="contact_page" />
                <CallButton context="contact_page" />
              </div>
            </div>
            <div className="rounded-card border border-ink-100 bg-white p-5 shadow-card">
              <h2 className="font-semibold text-ink-950">Office</h2>
              <div className="mt-2 flex gap-2 text-ink-700">
                <MapPin className="mt-1 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                <address className="not-italic">{formattedAddress()}</address>
              </div>
              {siteConfig.officeHours ? (
                <p className="mt-2 flex items-center gap-2 text-ink-700">
                  <Clock className="size-4 shrink-0 text-brand-600" aria-hidden="true" /> {siteConfig.officeHours}
                </p>
              ) : null}
              <p className="mt-2 flex items-center gap-2 text-ink-700">
                <Mail className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-brand-700">
                  {siteConfig.email}
                </a>
              </p>
            </div>
          </div>
          {siteConfig.geo ? <LocationMap lat={siteConfig.geo.lat} lng={siteConfig.geo.lng} exact title={`Map to the ${siteConfig.name} office`} /> : null}
          {siteConfig.geo ? (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${siteConfig.geo.lat},${siteConfig.geo.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Get directions →
            </a>
          ) : null}
        </div>
        <div id="enquire" className="scroll-mt-24 rounded-card border border-ink-100 bg-white p-5 shadow-card sm:p-6">
          <h2 className="mb-4 font-display text-xl text-ink-950">Send us a message</h2>
          <EnquiryForm source="CONTACT_FORM" submitLabel="Send message" trackContext="contact_page" />
        </div>
      </div>
    </Container>
  );
}
