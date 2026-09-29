import Link from "next/link";
import { Plus } from "lucide-react";
import { PhoneLink, WhatsAppButton } from "@/components/shared/contact-buttons";
import { Logo } from "@/components/shared/logo";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/layout-primitives";
import { MAIN_NAV } from "@/lib/constants/navigation";
import { DesktopNavLinks } from "./desktop-nav-links";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-18">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <DesktopNavLinks items={MAIN_NAV} />
        </nav>

        <div className="flex items-center gap-2">
          <PhoneLink
            context="header"
            className="hidden text-sm font-semibold text-ink-800 hover:text-brand-700 xl:inline-flex"
          />
          <Link href="/post-property" className={buttonVariants({ variant: "outline", size: "sm", className: "hidden md:inline-flex" })}>
            <Plus aria-hidden="true" />
            Post property
          </Link>
          <WhatsAppButton context="header" size="sm" className="hidden sm:inline-flex" />
          <MobileNav items={MAIN_NAV} />
        </div>
      </Container>
    </header>
  );
}
