import type { ConstructionStatus, PropertyType } from "../../generated/prisma/enums";

// Demo projects (SPEC §35). Developer names are fictional and end in "(Demo)".
// RERA numbers are intentionally null — never fabricate registration numbers (SPEC §49).

export interface ConfigurationSeed {
  label: string;
  propertyType: PropertyType;
  bedrooms?: number;
  carpetAreaMin?: number;
  carpetAreaMax?: number;
  superAreaMin?: number;
  superAreaMax?: number;
  priceMin: number;
  priceMax: number;
  unitsAvailable?: number;
}

export interface ProjectSeed {
  name: string;
  slug: string;
  developerName: string;
  developerDescription: string;
  localitySlug: string;
  constructionStatus: ConstructionStatus;
  launchDate?: string;
  possessionDate?: string;
  totalUnits?: number;
  totalTowers?: number;
  totalFloors?: number;
  landAreaAcres?: number;
  description: string;
  highlights: string[];
  address: string;
  latitude: number;
  longitude: number;
  isFeatured: boolean;
  amenities: string[];
  /** Which placeholder set to use for gallery images. */
  imageSet: "towers" | "plotted" | "commercial" | "premium";
  configurations: ConfigurationSeed[];
}

const L = 100_000;
const CR = 10_000_000;

export const PROJECTS: ProjectSeed[] = [
  {
    name: "Pink City Heights",
    slug: "pink-city-heights-jagatpura",
    developerName: "Sunrise Buildcon (Demo)",
    developerDescription:
      "Sunrise Buildcon (Demo) is a fictional developer used to illustrate how developer profiles appear on this site.",
    localitySlug: "jagatpura",
    constructionStatus: "UNDER_CONSTRUCTION",
    launchDate: "2025-03-01",
    possessionDate: "2027-12-31",
    totalUnits: 420,
    totalTowers: 3,
    totalFloors: 14,
    landAreaAcres: 4.5,
    description:
      "Pink City Heights is a demo gated community of 2, 3 and 4 BHK apartments across three towers in Jagatpura. The layout keeps over half of the land open for landscaped gardens, a clubhouse and sports courts, with apartments designed for cross-ventilation and natural light.",
    highlights: ["3 towers, 14 floors each", "Over 50% open green area", "Clubhouse with pool and gym", "Close to schools and colleges"],
    address: "Near Jagatpura Railway Station, Jagatpura",
    latitude: 26.823,
    longitude: 75.862,
    isFeatured: true,
    amenities: ["lift", "power-backup", "security", "cctv", "gated-community", "covered-parking", "swimming-pool", "clubhouse", "gym", "play-area", "garden", "jogging-track", "rainwater-harvesting"],
    imageSet: "towers",
    configurations: [
      { label: "2 BHK Apartment", propertyType: "APARTMENT", bedrooms: 2, carpetAreaMin: 780, carpetAreaMax: 850, superAreaMin: 1150, superAreaMax: 1250, priceMin: 52 * L, priceMax: 58 * L, unitsAvailable: 64 },
      { label: "3 BHK Apartment", propertyType: "APARTMENT", bedrooms: 3, carpetAreaMin: 1080, carpetAreaMax: 1180, superAreaMin: 1500, superAreaMax: 1650, priceMin: 68 * L, priceMax: 78 * L, unitsAvailable: 48 },
      { label: "4 BHK Apartment", propertyType: "APARTMENT", bedrooms: 4, carpetAreaMin: 1600, carpetAreaMax: 1750, superAreaMin: 2250, superAreaMax: 2400, priceMin: 1 * CR, priceMax: 1.1 * CR, unitsAvailable: 12 },
    ],
  },
  {
    name: "Marigold Township",
    slug: "marigold-township-ajmer-road",
    developerName: "Heritage Infra (Demo)",
    developerDescription:
      "Heritage Infra (Demo) is a fictional developer used to illustrate plotted developments and villa communities.",
    localitySlug: "ajmer-road",
    constructionStatus: "READY_TO_MOVE",
    launchDate: "2021-06-01",
    possessionDate: "2024-03-31",
    totalUnits: 310,
    landAreaAcres: 38,
    description:
      "Marigold Township is a demo plotted township on Ajmer Road offering residential plots from 150 to 300 sq yd along with a limited number of independent villas. Internal roads, underground utilities and a central park are complete, and plots are ready for construction.",
    highlights: ["Residential plots 150–300 sq yd", "Wide internal roads", "Central park and clubhouse", "Ready for registry and construction"],
    address: "Off Ajmer Road (NH-48), Jaipur",
    latitude: 26.884,
    longitude: 75.705,
    isFeatured: true,
    amenities: ["gated-community", "security", "cctv", "garden", "clubhouse", "play-area", "jogging-track", "water-supply", "temple"],
    imageSet: "plotted",
    configurations: [
      { label: "150 sq yd Residential Plot", propertyType: "RESIDENTIAL_PLOT", superAreaMin: 1350, superAreaMax: 1350, priceMin: 27 * L, priceMax: 30 * L, unitsAvailable: 40 },
      { label: "200 sq yd Residential Plot", propertyType: "RESIDENTIAL_PLOT", superAreaMin: 1800, superAreaMax: 1800, priceMin: 36 * L, priceMax: 40 * L, unitsAvailable: 35 },
      { label: "300 sq yd Residential Plot", propertyType: "RESIDENTIAL_PLOT", superAreaMin: 2700, superAreaMax: 2700, priceMin: 54 * L, priceMax: 60 * L, unitsAvailable: 18 },
      { label: "4 & 5 BHK Villa", propertyType: "VILLA", bedrooms: 4, superAreaMin: 4200, superAreaMax: 5200, priceMin: 2.1 * CR, priceMax: 3.4 * CR, unitsAvailable: 6 },
    ],
  },
  {
    name: "Vaishali Grand Residency",
    slug: "vaishali-grand-residency",
    developerName: "Saffron Realtors (Demo)",
    developerDescription:
      "Saffron Realtors (Demo) is a fictional developer used to illustrate new-launch projects on this site.",
    localitySlug: "vaishali-nagar",
    constructionStatus: "NEW_LAUNCH",
    launchDate: "2026-07-15",
    possessionDate: "2029-06-30",
    totalUnits: 180,
    totalTowers: 2,
    totalFloors: 12,
    landAreaAcres: 2.2,
    description:
      "Vaishali Grand Residency is a demo new-launch project of 2 and 3 BHK homes in the heart of Vaishali Nagar. Early-bird buyers get a choice of floors and facings, with a rooftop amenity deck and a compact, efficient layout.",
    highlights: ["New launch — early-bird pricing", "Central Vaishali Nagar location", "Rooftop amenity deck", "Efficient 2 & 3 BHK layouts"],
    address: "Near Amrapali Circle, Vaishali Nagar",
    latitude: 26.913,
    longitude: 75.741,
    isFeatured: true,
    amenities: ["lift", "power-backup", "security", "cctv", "covered-parking", "gym", "garden", "solar-power", "intercom", "fire-safety"],
    imageSet: "towers",
    configurations: [
      { label: "2 BHK Apartment", propertyType: "APARTMENT", bedrooms: 2, carpetAreaMin: 760, carpetAreaMax: 820, superAreaMin: 1100, superAreaMax: 1200, priceMin: 55 * L, priceMax: 62 * L, unitsAvailable: 70 },
      { label: "3 BHK Apartment", propertyType: "APARTMENT", bedrooms: 3, carpetAreaMin: 1050, carpetAreaMax: 1200, superAreaMin: 1500, superAreaMax: 1700, priceMin: 78 * L, priceMax: 95 * L, unitsAvailable: 60 },
    ],
  },
  {
    name: "Tonk Road Business Park",
    slug: "tonk-road-business-park",
    developerName: "Metro Commercial Spaces (Demo)",
    developerDescription:
      "Metro Commercial Spaces (Demo) is a fictional developer used to illustrate commercial projects.",
    localitySlug: "tonk-road",
    constructionStatus: "UPCOMING",
    launchDate: "2027-01-15",
    possessionDate: "2030-03-31",
    totalUnits: 240,
    totalTowers: 1,
    totalFloors: 10,
    landAreaAcres: 1.6,
    description:
      "Tonk Road Business Park is a demo upcoming commercial project with ground-floor retail and flexible office floors on one of Jaipur's busiest corridors. Floor plates can be combined for larger occupiers.",
    highlights: ["High-visibility Tonk Road frontage", "Retail on ground and first floors", "Flexible office floor plates", "Ample basement parking"],
    address: "Tonk Road, near Durgapura",
    latitude: 26.842,
    longitude: 75.797,
    isFeatured: false,
    amenities: ["lift", "power-backup", "security", "cctv", "covered-parking", "visitor-parking", "fire-safety"],
    imageSet: "commercial",
    configurations: [
      { label: "Retail Shop", propertyType: "SHOP", carpetAreaMin: 250, carpetAreaMax: 800, priceMin: 45 * L, priceMax: 1.4 * CR, unitsAvailable: 40 },
      { label: "Office Space", propertyType: "OFFICE_SPACE", carpetAreaMin: 500, carpetAreaMax: 3000, priceMin: 50 * L, priceMax: 2.8 * CR, unitsAvailable: 120 },
    ],
  },
  {
    name: "Malviya Signature Towers",
    slug: "malviya-signature-towers",
    developerName: "Lotus Habitat (Demo)",
    developerDescription:
      "Lotus Habitat (Demo) is a fictional developer used to illustrate premium ready-to-move projects.",
    localitySlug: "malviya-nagar",
    constructionStatus: "READY_TO_MOVE",
    launchDate: "2021-01-10",
    possessionDate: "2025-06-30",
    totalUnits: 96,
    totalTowers: 2,
    totalFloors: 12,
    landAreaAcres: 1.8,
    description:
      "Malviya Signature Towers is a demo premium ready-to-move project of spacious 3 and 4 BHK residences in Malviya Nagar, with large balconies, servant rooms and a fully equipped clubhouse.",
    highlights: ["Ready to move in", "Spacious 3 & 4 BHK residences", "Servant room in every home", "Premium clubhouse"],
    address: "Malviya Nagar, near JLN Marg",
    latitude: 26.855,
    longitude: 75.812,
    isFeatured: false,
    amenities: ["lift", "power-backup", "security", "cctv", "gated-community", "covered-parking", "swimming-pool", "clubhouse", "gym", "garden", "indoor-games", "intercom"],
    imageSet: "premium",
    configurations: [
      { label: "3 BHK Residence", propertyType: "APARTMENT", bedrooms: 3, carpetAreaMin: 1450, carpetAreaMax: 1550, superAreaMin: 2050, superAreaMax: 2200, priceMin: 1.35 * CR, priceMax: 1.55 * CR, unitsAvailable: 8 },
      { label: "4 BHK Residence", propertyType: "APARTMENT", bedrooms: 4, carpetAreaMin: 1950, carpetAreaMax: 2100, superAreaMin: 2800, superAreaMax: 3000, priceMin: 1.9 * CR, priceMax: 2.2 * CR, unitsAvailable: 4 },
    ],
  },
];
