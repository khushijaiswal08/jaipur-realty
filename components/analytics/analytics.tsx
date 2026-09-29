"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";
import { setConsent, useConsent } from "@/lib/client/consent";
import { siteConfig } from "@/lib/config";

// Analytics loaders + event forwarding (SPEC §47, §50). Scripts load only when their ID is set
// in .env, and — when NEXT_PUBLIC_REQUIRE_ANALYTICS_CONSENT=true — only after opt-in.

type Params = Record<string, unknown>;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const { ga4Id, gtmId, metaPixelId, clarityId, requireConsent } = siteConfig.analytics;
const anyProvider = Boolean(ga4Id || gtmId || metaPixelId || clarityId);
/** Events that count as conversions for Meta Pixel. */
const LEAD_EVENTS = new Set(["enquiry_submit", "site_visit_request", "owner_listing_submit", "brochure_download"]);

function forward(event: string, params: Params) {
  window.gtag?.("event", event, params);
  window.dataLayer?.push({ event, ...params });
  if (LEAD_EVENTS.has(event)) window.fbq?.("track", "Lead", { content_name: event });
  else if (event === "whatsapp_click" || event === "call_click") window.fbq?.("track", "Contact", { method: event });
}

function Loaders() {
  const pathname = usePathname();

  // SPA page views (GA4 is configured with send_page_view: false).
  useEffect(() => {
    window.gtag?.("event", "page_view", { page_path: pathname, page_location: window.location.href });
    window.fbq?.("track", "PageView");
  }, [pathname]);

  useEffect(() => {
    const onTrack = (e: Event) => {
      const { event, ...params } = (e as CustomEvent<Params & { event: string }>).detail;
      forward(event, params);
    };
    // Any element with data-track="event_name" (call/WhatsApp buttons…) is tracked on click.
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      const d = el.dataset;
      forward(d.track!, { context: d.trackContext, propertyId: d.trackProperty, projectId: d.trackProject, page: window.location.pathname });
    };
    window.addEventListener("jr:track", onTrack);
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      window.removeEventListener("jr:track", onTrack);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  return (
    <>
      {ga4Id ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(ga4Id)},{send_page_view:false});`}
          </Script>
        </>
      ) : null}
      {gtmId ? (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});`}
        </Script>
      ) : null}
      {metaPixelId ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(metaPixelId)});`}
        </Script>
      ) : null}
      {clarityId ? (
        <Script id="clarity" strategy="lazyOnload">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(clarityId)});`}
        </Script>
      ) : null}
    </>
  );
}

function ConsentBanner() {
  return (
    <div role="dialog" aria-label="Cookie preferences" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl bg-ink-950 p-4 text-sm text-ink-100 shadow-card-hover sm:p-5">
      <p>
        We use essential storage to run this site. With your permission we&apos;d also use analytics cookies to understand which pages are
        useful. See our{" "}
        <Link href="/privacy-policy" className="font-semibold text-white underline underline-offset-2">
          privacy policy
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setConsent("granted")} className="rounded-lg bg-white px-4 py-2 font-semibold text-ink-950 hover:bg-ink-100">
          Allow analytics
        </button>
        <button type="button" onClick={() => setConsent("denied")} className="rounded-lg px-4 py-2 font-semibold text-white ring-1 ring-white/30 hover:bg-white/10">
          Essential only
        </button>
      </div>
    </div>
  );
}

export function Analytics() {
  const consent = useConsent();
  if (!anyProvider) return null;
  if (!requireConsent) return <Loaders />;
  if (consent === "granted") return <Loaders />;
  if (consent === "unset") return <ConsentBanner />;
  return null;
}
