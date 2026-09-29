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

export const ABOUT_COPY = {
  title: "Your local partner for Jaipur property",
  intro:
    "We help families, investors and businesses buy, sell and rent property across Jaipur — from apartments in Vaishali Nagar and Mansarovar to plots on Ajmer Road and offices on Tonk Road.",
  story: [
    "Buying or renting a home is one of the biggest decisions a family makes. Our job is to make it simpler: honest advice, verified listings and quick answers, whether you are a first-time buyer, an NRI investing back home or an owner looking for the right tenant.",
    "We work locality by locality, so we can tell you what a neighbourhood is really like — the commute, the schools, the markets and what similar homes have actually sold or rented for.",
  ],
} as const;

/**
 * Home "Browse by property type" tiles. Each tile's count is computed from the database with
 * exactly the same filter as its link (services/home.service.ts), so the number always matches
 * what the visitor sees after clicking.
 */
export const PROPERTY_CATEGORY_TILES = [
  {
    key: "apartments",
    label: "Apartments & flats",
    description: "Flats, builder floors and penthouses",
    icon: "building",
    transactionType: "SALE",
    types: ["APARTMENT", "BUILDER_FLOOR", "PENTHOUSE", "STUDIO"],
  },
  {
    key: "houses",
    label: "Houses & villas",
    description: "Independent houses, villas and farmhouses",
    icon: "house",
    transactionType: "SALE",
    types: ["INDEPENDENT_HOUSE", "VILLA", "FARMHOUSE"],
  },
  {
    key: "plots",
    label: "Plots & land",
    description: "Residential plots and land parcels",
    icon: "land-plot",
    transactionType: "SALE",
    category: "LAND",
  },
  {
    key: "commercial",
    label: "Commercial",
    description: "Offices, shops, showrooms and warehouses",
    icon: "store",
    transactionType: "SALE",
    category: "COMMERCIAL",
  },
  {
    key: "rent",
    label: "Homes for rent",
    description: "Furnished and unfurnished rentals",
    icon: "key-round",
    transactionType: "RENT",
    category: "RESIDENTIAL",
  },
] as const;
