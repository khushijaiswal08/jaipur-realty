import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/shared/legal-page";
import { formattedAddress, siteConfig } from "@/lib/config";
import { pageRobots } from "@/lib/seo/robots";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects your personal data.`,
  alternates: { canonical: "/privacy-policy" },
  robots: pageRobots(),
};

/** Privacy policy template aligned with India's Digital Personal Data Protection Act, 2023 (SPEC §50). */
export default function PrivacyPolicyPage() {
  const name = siteConfig.legalName;
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy explains how {name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) handles personal data collected through this website, in line with
        the Digital Personal Data Protection Act, 2023.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Details you give us</strong> — name, mobile number, email and message when you enquire, request a callback or site visit, or
          post a property.
        </li>
        <li>
          <strong>Context of your request</strong> — the property, project or locality you asked about, and the page and campaign (UTM) that
          brought you to us.
        </li>
        <li>
          <strong>Usage data</strong> — pages viewed and device type. We do not store your IP address; visits are counted using a one-way hash
          that changes daily.
        </li>
      </ul>
      <h2>Why we use it</h2>
      <p>
        Only to respond to your request: to call, WhatsApp or email you about properties, arrange site visits and, if you list a property,
        verify and market it. We rely on the consent you give when you submit a form.
      </p>
      <h2>Sharing</h2>
      <p>
        We share your details only with our team and, where needed to complete your request, with the property owner, developer or your
        chosen professionals. We do not sell personal data. Service providers (hosting, email, analytics) process data on our behalf.
      </p>
      <h2>Cookies & analytics</h2>
      <p>
        Essential browser storage keeps your shortlist and comparison on your device. If analytics is enabled, it helps us understand
        which pages are useful; you can decline non-essential cookies where a choice is offered.
      </p>
      <h2>Retention</h2>
      <p>
        Enquiries are kept while they are useful for following up and as required by law, then deleted. Submissions identified as spam are
        deleted within 90 days.
      </p>
      <h2>Your rights</h2>
      <p>
        You can ask to access, correct or erase your personal data, or withdraw consent, by writing to{" "}
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. Withdrawing consent does not affect processing already carried out.
      </p>
      <h2>Grievances</h2>
      <p>
        For any concern about your data, contact our grievance officer at <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> or{" "}
        {formattedAddress()}. You may also approach the Data Protection Board of India.
      </p>
      <h2>Changes</h2>
      <p>
        We may update this policy; the date above shows the latest version. See also our <Link href="/terms">terms of use</Link>.
      </p>
    </LegalPage>
  );
}
