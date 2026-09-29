export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export const MAIN_NAV: NavItem[] = [
  { label: "Buy", href: "/buy", description: "Homes, plots & offices for sale" },
  { label: "Rent", href: "/rent", description: "Flats, houses & shops for rent" },
  { label: "Projects", href: "/projects", description: "New launches & builder projects" },
  { label: "Localities", href: "/localities", description: "Jaipur neighbourhood guides" },
  { label: "Blog", href: "/blog", description: "Guides & market insights" },
  { label: "Contact", href: "/contact", description: "Talk to our team" },
];

export const FOOTER_NAV: Record<string, NavItem[]> = {
  Explore: [
    { label: "Properties for sale", href: "/buy" },
    { label: "Properties for rent", href: "/rent" },
    { label: "New projects", href: "/projects" },
    { label: "Jaipur localities", href: "/localities" },
    { label: "Post your property", href: "/post-property" },
  ],
  Tools: [
    { label: "EMI calculator", href: "/tools/emi-calculator" },
    { label: "Area converter", href: "/tools/area-converter" },
    { label: "Stamp duty estimator", href: "/tools/stamp-duty" },
    { label: "Shortlist", href: "/shortlist" },
    { label: "Compare", href: "/compare" },
  ],
  Company: [
    { label: "About us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Blog", href: "/blog" },
    { label: "FAQs", href: "/faq" },
  ],
  Legal: [
    { label: "Privacy policy", href: "/privacy-policy" },
    { label: "Terms of use", href: "/terms" },
    { label: "Disclaimer", href: "/disclaimer" },
  ],
};
