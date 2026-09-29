import { WhatsAppIcon } from "@/components/shared/icons";
import { whatsAppHref } from "@/lib/contact";

/**
 * Bottom-right WhatsApp shortcut (SPEC §25). On phones it hides itself (CSS :has() rule in
 * globals.css) when a page renders the sticky mobile contact bar, so the two never overlap.
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
      className="fixed bottom-5 right-5 z-30 flex items-center justify-center rounded-full bg-whatsapp p-3.5 text-white shadow-card-hover transition-transform hover:scale-105 hover:bg-whatsapp-hover"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
