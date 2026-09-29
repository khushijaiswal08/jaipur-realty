// Editable marketing copy (PLACEHOLDER — review with the business; see docs/ASSUMPTIONS.md).
// Deliberately contains no statistics: numbers must come from the business (SPEC §22).

export const HERO_COPY = {
  eyebrow: "Jaipur real estate",
  title: "Find the right home in Jaipur",
  subtitle: "Apartments, independent houses, villas, plots and commercial spaces across the Pink City — with local help on WhatsApp.",
} as const;

export const WHY_US = [
  {
    icon: "shield-check",
    title: "Verified listings",
    body: "Listings marked Verified have been physically checked by our team before they go live.",
  },
  {
    icon: "map-pinned",
    title: "Local Jaipur knowledge",
    body: "From C-Scheme to Jagatpura, we help you compare neighbourhoods, prices and connectivity.",
  },
  {
    icon: "message-circle",
    title: "Quick answers on WhatsApp",
    body: "Ask about any property and get details, photos and a visit slot without long phone calls.",
  },
  {
    icon: "file-check",
    title: "Help through paperwork",
    body: "We coordinate site visits, negotiations and documentation with your legal and banking professionals.",
  },
] as const;

export const CATEGORY_SHORTCUTS = [
  { label: "Apartments", href: "/buy?type=apartment", icon: "building" },
  { label: "Independent houses", href: "/buy?type=independent-house", icon: "house" },
  { label: "Villas", href: "/buy?type=villa", icon: "castle" },
  { label: "Plots", href: "/buy?category=land", icon: "land-plot" },
  { label: "Commercial", href: "/buy?category=commercial", icon: "store" },
  { label: "For rent", href: "/rent", icon: "key-round" },
] as const;
