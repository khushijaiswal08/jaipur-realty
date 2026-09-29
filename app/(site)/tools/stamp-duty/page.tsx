import type { Metadata } from "next";
import { StampDutyCalculator } from "@/components/tools/calculators";
import { ToolPage } from "@/components/tools/tool-page";
import { pageRobots } from "@/lib/seo/robots";

export const metadata: Metadata = {
  title: "Stamp Duty Estimator — Rajasthan",
  description: "Estimate stamp duty and registration charges for a property purchase in Jaipur, Rajasthan (indicative).",
  alternates: { canonical: "/tools/stamp-duty" },
  robots: pageRobots(),
};

export default function StampDutyPage() {
  return (
    <ToolPage title="Stamp duty estimator" intro="A quick, indicative estimate of registration costs when buying property in Rajasthan." current="/tools/stamp-duty">
      <StampDutyCalculator />
    </ToolPage>
  );
}
