import { WhatsAppIcon } from "@/components/shared/icons";
import { whatsAppHref } from "@/lib/contact";

/**
 * Bottom-right WhatsApp shortcut (SPEC §25) for tablets and desktops. Phones get the sticky
 * Call / WhatsApp bar instead, so the two never overlap.
 */
export function FloatingWhatsApp() {
  return (
    <a
      href={whatsAppHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      data-track="whatsapp_click"
      data-track-context="floating_button"
      data-floating-whatsapp=""
      className="fixed bottom-6 right-6 z-30 hidden items-center justify-center rounded-full bg-whatsapp p-3.5 text-white shadow-card-hover ring-4 ring-white transition-transform hover:scale-105 hover:bg-whatsapp-hover md:flex"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
