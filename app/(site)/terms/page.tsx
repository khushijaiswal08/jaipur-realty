import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/shared/legal-page";
import { siteConfig } from "@/lib/config";
import { pageRobots } from "@/lib/seo/robots";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms for using the ${siteConfig.name} website.`,
  alternates: { canonical: "/terms" },
  robots: pageRobots(),
};

export default function TermsPage() {
  const name = siteConfig.legalName;
  return (
    <LegalPage title="Terms of Use">
      <p>By using this website you agree to these terms. If you do not agree, please do not use the site.</p>
      <h2>About the listings</h2>
      <p>
        Property details, prices, areas, images and availability are provided in good faith by owners, developers and our team, and may
        change without notice. They are not an offer or a contract. Always verify details, documents, approvals and measurements
        independently before making any decision or payment. See our <Link href="/disclaimer">disclaimer</Link>.
      </p>
      <h2>Your submissions</h2>
      <p>
        When you post a property or send an enquiry, you confirm the information is accurate and that you are entitled to share it. We may
        decline or remove any listing at our discretion.
      </p>
      <h2>Acceptable use</h2>
      <p>Do not misuse the site — for example by scraping listings, submitting false information, or attempting to disrupt or access systems without permission.</p>
      <h2>Intellectual property</h2>
      <p>The site design, text and branding belong to {name} or its licensors. Listing photos belong to their respective owners.</p>
      <h2>Liability</h2>
      <p>
        To the extent permitted by law, {name} is not liable for losses arising from reliance on information on this site or from
        transactions between buyers, sellers, landlords and tenants.
      </p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India. Courts at {siteConfig.address.city}, {siteConfig.address.state} have jurisdiction.</p>
      <h2>Contact</h2>
      <p>
        Questions: <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
      </p>
    </LegalPage>
  );
}
