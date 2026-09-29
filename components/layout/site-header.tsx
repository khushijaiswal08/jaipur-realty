import Link from "next/link";
import { Plus } from "lucide-react";
import { CallButton, WhatsAppButton } from "@/components/shared/contact-buttons";
import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/ui/layout-primitives";
import { MAIN_NAV, MOBILE_NAV } from "@/lib/constants/navigation";
import { DesktopNavLinks } from "./desktop-nav-links";
import { HeaderShell } from "./header-shell";
import { MobileNav } from "./mobile-nav";

/** Sticky navbar: logo, main nav (desktop), Call + WhatsApp on the right, hamburger below lg. */
export function SiteHeader() {
  return (
    <HeaderShell>
      <Container className="flex h-16 items-center justify-between gap-3 transition-[height] duration-200 lg:h-20 lg:group-data-[scrolled]:h-16">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <DesktopNavLinks items={MAIN_NAV} />
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/post-property"
            className="hidden items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-brand-700 hover:text-brand-900 2xl:inline-flex"
          >
            <Plus className="size-4" aria-hidden="true" />
            Post property
          </Link>
          {/* Call: icon on phones, "Call" on tablets/laptops, full number on wide screens. */}
          <CallButton context="header" size="icon" className="size-10 md:hidden" />
          <CallButton context="header" size="sm" className="hidden md:inline-flex xl:hidden" />
          <CallButton context="header" size="sm" showNumber className="hidden xl:inline-flex" />
          <WhatsAppButton context="header" size="icon" className="size-10 md:hidden" />
          <WhatsAppButton context="header" size="sm" className="hidden md:inline-flex" />
          <MobileNav items={MOBILE_NAV} />
        </div>
      </Container>
    </HeaderShell>
  );
}
