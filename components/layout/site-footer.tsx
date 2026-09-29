import Link from "next/link";
import { Clock, Mail, MapPin } from "lucide-react";
import { CallButton, PhoneLink, WhatsAppButton } from "@/components/shared/contact-buttons";
import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/ui/layout-primitives";
import { formattedAddress, siteConfig } from "@/lib/config";
import { FOOTER_NAV } from "@/lib/constants/navigation";
import type { LocalityLinkDTO } from "@/services/locality.service";

const SOCIAL_LABELS: Record<keyof typeof siteConfig.social, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
};

export function SiteFooter({ localities }: { localities: LocalityLinkDTO[] }) {
  const socials = (Object.keys(SOCIAL_LABELS) as Array<keyof typeof siteConfig.social>)
    .map((key) => ({ key, label: SOCIAL_LABELS[key], href: siteConfig.social[key] }))
    .filter((s): s is { key: keyof typeof siteConfig.social; label: string; href: string } => Boolean(s.href));

  return (
    <footer className="border-t-2 border-gold-500 bg-brand-950 text-brand-100">
      <Container className="grid gap-10 py-12 lg:grid-cols-12 lg:py-16">
        <div className="lg:col-span-4">
          <Logo tone="light" />
          {siteConfig.tagline ? <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-200">{siteConfig.tagline}</p> : null}
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden="true" />
              <address className="not-italic">{formattedAddress()}</address>
            </li>
            <li>
              <PhoneLink context="footer" className="text-white hover:text-gold-300 [&_svg]:text-gold-400" />
            </li>
            <li className="flex items-center gap-3">
              <Mail className="size-4 shrink-0 text-gold-400" aria-hidden="true" />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-white">
                {siteConfig.email}
              </a>
            </li>
            {siteConfig.officeHours ? (
              <li className="flex items-center gap-3">
                <Clock className="size-4 shrink-0 text-gold-400" aria-hidden="true" />
                <span>{siteConfig.officeHours}</span>
              </li>
            ) : null}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2"><WhatsAppButton context="footer" size="sm" /><CallButton context="footer" size="sm" variant="accent" /></div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-4">
          {Object.entries(FOOTER_NAV).map(([heading, links]) => (
            <div key={heading}>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">{heading}</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {localities.length ? (
            <div className="col-span-2 sm:col-span-3 lg:col-span-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">Popular localities</h2>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {localities.map((l) => (
                  <li key={l.id}>
                    <Link href={`/localities/${l.slug}`} className="hover:text-white">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="space-y-3 py-6 text-xs text-brand-200">
          {siteConfig.usesPlaceholders ? (
            <p className="rounded-lg bg-warning-50/10 px-3 py-2 text-warning-50 ring-1 ring-warning-50/20">
              Demo details still in use: {siteConfig.placeholderFields.join(", ")}. They will be replaced before launch.
            </p>
          ) : null}
          <p>
            Property images and details are indicative. Please verify all information, documents and approvals independently before
            making any decision or payment.
            {siteConfig.reraAgentNumber ? <> RERA agent registration: {siteConfig.reraAgentNumber}.</> : null}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
            </p>
            {socials.length ? (
              <ul className="flex flex-wrap gap-4">
                {socials.map((s) => (
                  <li key={s.key}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Container>
      </div>
    </footer>
  );
}
