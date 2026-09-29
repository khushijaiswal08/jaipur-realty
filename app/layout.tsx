import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { siteConfig } from "@/lib/config";
import { THEME } from "@/lib/constants/theme";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const defaultTitle = `${siteConfig.name} — Property for Sale & Rent in Jaipur`;
const defaultDescription =
  "Buy, rent or invest in Jaipur real estate — apartments, independent houses, villas, plots, offices and shops across Vaishali Nagar, Malviya Nagar, Mansarovar, C-Scheme, Jagatpura and more.";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: { default: defaultTitle, template: `%s | ${siteConfig.name}` },
  description: defaultDescription,
  applicationName: siteConfig.name,
  // SPEC §33: everything is noindex until NEXT_PUBLIC_ALLOW_INDEXING=true.
  robots: siteConfig.allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
  verification: siteConfig.analytics.googleSiteVerification ? { google: siteConfig.analytics.googleSiteVerification } : undefined,
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: siteConfig.name,
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: THEME.brand600,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
