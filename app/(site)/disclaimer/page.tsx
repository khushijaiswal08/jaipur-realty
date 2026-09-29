import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal-page";
import { siteConfig } from "@/lib/config";
import { pageRobots } from "@/lib/seo/robots";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Important information about property listings, prices, images and approvals shown on this website.",
  alternates: { canonical: "/disclaimer" },
  robots: pageRobots(),
};

/** SPEC §49 — listing disclaimer, RERA note and demo-content notice. */
export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer">
      <h2>Indicative information</h2>
      <p>
        Prices, areas, floor plans, specifications, amenities and images on this website are indicative and for general information only.
        Images may be representative. Locality rates marked &ldquo;indicative&rdquo; are approximate guides, not valuations.
      </p>
      <h2>Verify before you transact</h2>
      <p>
        Before paying any token or booking amount, verify title documents, approvals (including JDA/local authority approvals) and, for new
        projects, the Rajasthan RERA registration on the official RERA portal. We recommend consulting a qualified legal professional.
      </p>
      <h2>Not professional advice</h2>
      <p>
        Articles, calculators and guides (including EMI and stamp duty estimates) are general information, not legal, tax or financial
        advice. Actual charges are determined by the relevant authorities and lenders.
      </p>
      {siteConfig.reraAgentNumber ? (
        <>
          <h2>RERA</h2>
          <p>{siteConfig.legalName} is registered as a real estate agent with Rajasthan RERA, registration number {siteConfig.reraAgentNumber}.</p>
        </>
      ) : null}
      <h2>Demo content</h2>
      <p>
        Items labelled &ldquo;Demo&rdquo; are sample listings, projects, profiles and testimonials used to illustrate the website. They are
        not real offers and will be removed.
      </p>
    </LegalPage>
  );
}
