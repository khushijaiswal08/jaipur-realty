import type { Metadata } from "next";
import { AreaConverter } from "@/components/tools/calculators";
import { ToolPage } from "@/components/tools/tool-page";
import { pageRobots } from "@/lib/seo/robots";

export const metadata: Metadata = {
  title: "Area Converter — Sq Ft, Sq Yd (Gaj), Acre, Bigha",
  description: "Convert land and built-up areas between square feet, square yards (Gaj), square metres, acres, hectares and Rajasthan bigha.",
  alternates: { canonical: "/tools/area-converter" },
  robots: pageRobots(),
};

export default function AreaConverterPage() {
  return (
    <ToolPage title="Area converter" intro="Plots in Jaipur are usually quoted in square yards (Gaj); built-up homes in square feet." current="/tools/area-converter">
      <AreaConverter />
    </ToolPage>
  );
}
