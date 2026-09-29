import type { Metadata } from "next";
import { EmiCalculator } from "@/components/tools/calculators";
import { ToolPage } from "@/components/tools/tool-page";
import { pageRobots } from "@/lib/seo/robots";

export const metadata: Metadata = {
  title: "Home Loan EMI Calculator",
  description: "Calculate your monthly home loan EMI, total interest and total payment in Lakh and Crore.",
  alternates: { canonical: "/tools/emi-calculator" },
  robots: pageRobots(),
};

export default function EmiPage() {
  return (
    <ToolPage title="Home loan EMI calculator" intro="See your monthly instalment and how much of it goes to interest." current="/tools/emi-calculator">
      <EmiCalculator />
    </ToolPage>
  );
}
