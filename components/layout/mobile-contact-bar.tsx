import { CallButton, WhatsAppButton } from "@/components/shared/contact-buttons";

/**
 * Site-wide sticky Call / WhatsApp bar for phones (SPEC §25). Property and project pages render
 * their own bar with a listing-specific message instead (globals.css hides this one there).
 */
export function SiteMobileContactBar() {
  return (
    <div
      data-site-contact-bar=""
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t border-ink-100 bg-white/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-header backdrop-blur md:hidden"
    >
      <CallButton context="mobile_bar" className="w-full" />
      <WhatsAppButton context="mobile_bar" className="w-full" />
    </div>
  );
}
