// The 12 launch localities (SPEC §3). Pincodes, zones, centroids and rates are INDICATIVE —
// verify before launch and maintain from the admin panel. Rates are displayed as "indicative".

export interface LocalitySeed {
  name: string;
  slug: string;
  zone: string;
  pincode: string;
  latitude: number;
  longitude: number;
  avgPricePerSqft: number;
  avgRent2Bhk: number;
  isFeatured: boolean;
  description: string;
  highlights: string[];
  connectivity: string[];
}

export const CITY = { name: "Jaipur", slug: "jaipur", state: "Rajasthan" } as const;

export const LOCALITIES: LocalitySeed[] = [
  {
    name: "Vaishali Nagar",
    slug: "vaishali-nagar",
    zone: "West",
    pincode: "302021",
    latitude: 26.911,
    longitude: 75.743,
    avgPricePerSqft: 7500,
    avgRent2Bhk: 20000,
    isFeatured: true,
    description:
      "One of West Jaipur's most established residential neighbourhoods, Vaishali Nagar combines mature apartment complexes and independent houses with busy shopping streets, schools and hospitals. It suits families who want a settled neighbourhood with everyday conveniences close by.",
    highlights: ["Established residential area", "Strong retail and dining", "Mix of apartments and independent houses", "Good schools and hospitals nearby"],
    connectivity: ["Quick access to Ajmer Road and Queens Road", "Well connected to C-Scheme and the city centre", "City bus routes along main roads"],
  },
  {
    name: "Malviya Nagar",
    slug: "malviya-nagar",
    zone: "South-East",
    pincode: "302017",
    latitude: 26.853,
    longitude: 75.815,
    avgPricePerSqft: 8500,
    avgRent2Bhk: 22000,
    isFeatured: true,
    description:
      "Malviya Nagar is a premium South-East Jaipur locality known for large malls, reputed hospitals and educational institutions. Residential demand is steady across apartments, builder floors and independent houses, with a lively commercial belt along its main roads.",
    highlights: ["Premium residential demand", "Malls and multiplexes", "Reputed hospitals and colleges", "Active commercial belt"],
    connectivity: ["Close to JLN Marg and Tonk Road", "Easy reach to the airport side of the city", "Well served by city buses and cabs"],
  },
  {
    name: "Mansarovar",
    slug: "mansarovar",
    zone: "South-West",
    pincode: "302020",
    latitude: 26.871,
    longitude: 75.76,
    avgPricePerSqft: 6000,
    avgRent2Bhk: 15000,
    isFeatured: true,
    description:
      "Mansarovar is one of Jaipur's largest planned residential colonies, laid out in sectors with parks, markets and community facilities. Metro connectivity and a wide range of mid-segment homes make it popular with first-time buyers and tenants.",
    highlights: ["Large planned colony", "Metro connectivity", "Mid-segment and affordable options", "Parks and local markets in every sector"],
    connectivity: ["Jaipur Metro (Pink Line) stations nearby", "Links to New Sanganer Road and Gopalpura Bypass", "Frequent city bus services"],
  },
  {
    name: "C-Scheme",
    slug: "c-scheme",
    zone: "Central",
    pincode: "302001",
    latitude: 26.907,
    longitude: 75.8,
    avgPricePerSqft: 12000,
    avgRent2Bhk: 30000,
    isFeatured: true,
    description:
      "C-Scheme is Jaipur's prime central address, with tree-lined avenues, heritage bungalows, premium apartments and some of the city's best-known offices, restaurants and clubs. Limited supply keeps it among the most sought-after — and most expensive — localities in the city.",
    highlights: ["Prime central location", "Premium apartments and bungalows", "Offices, clubs and fine dining", "Limited new supply"],
    connectivity: ["Minutes from MI Road and the Walled City", "Central to most parts of Jaipur", "Jaipur Junction railway station within easy reach"],
  },
  {
    name: "Jagatpura",
    slug: "jagatpura",
    zone: "South-East",
    pincode: "302017",
    latitude: 26.825,
    longitude: 75.86,
    avgPricePerSqft: 5200,
    avgRent2Bhk: 14000,
    isFeatured: true,
    description:
      "Jagatpura is one of Jaipur's fastest-growing residential corridors, with a steady pipeline of new apartment projects and gated communities. Proximity to several colleges and universities creates healthy rental demand alongside end-use buyers.",
    highlights: ["Fast-growing corridor", "Many new apartment projects", "Colleges and universities nearby", "Good value per sq ft"],
    connectivity: ["Jagatpura railway station", "Access to Tonk Road and the airport area", "Link roads towards Malviya Nagar"],
  },
  {
    name: "Tonk Road",
    slug: "tonk-road",
    zone: "South",
    pincode: "302018",
    latitude: 26.84,
    longitude: 75.8,
    avgPricePerSqft: 6500,
    avgRent2Bhk: 18000,
    isFeatured: true,
    description:
      "Tonk Road is a major arterial corridor running south from the city centre towards the airport, lined with residential colonies, showrooms, offices and hospitals. Its mixed-use character makes it attractive for both homes and commercial space.",
    highlights: ["Arterial road with strong visibility", "Mixed residential and commercial", "Near the airport", "Showrooms and office spaces"],
    connectivity: ["Direct route to Jaipur International Airport", "Connects the city centre to Sitapura", "Frequent public transport"],
  },
  {
    name: "Ajmer Road",
    slug: "ajmer-road",
    zone: "West",
    pincode: "302006",
    latitude: 26.895,
    longitude: 75.72,
    avgPricePerSqft: 4500,
    avgRent2Bhk: 12000,
    isFeatured: true,
    description:
      "Ajmer Road is a growth corridor along the national highway towards Ajmer, known for plotted developments, townships and larger independent homes. Land availability and improving infrastructure attract investors and buyers looking for space.",
    highlights: ["Plotted developments and townships", "Investment-friendly pricing", "Larger homes and villas", "Improving infrastructure"],
    connectivity: ["On the highway towards Ajmer", "Access to the 200 Feet Bypass", "Short drive to Vaishali Nagar"],
  },
  {
    name: "Raja Park",
    slug: "raja-park",
    zone: "Central-East",
    pincode: "302004",
    latitude: 26.899,
    longitude: 75.827,
    avgPricePerSqft: 8000,
    avgRent2Bhk: 20000,
    isFeatured: false,
    description:
      "Raja Park is a dense, well-established neighbourhood famous for its bustling market. Builder floors and independent homes dominate, and its central-east location keeps both residential and retail demand consistently strong.",
    highlights: ["Busy local market", "Builder floors and shops", "Central-east location", "Strong retail demand"],
    connectivity: ["Close to Adarsh Nagar and Jawahar Nagar", "Easy access to the city centre", "Well served by city buses"],
  },
  {
    name: "Bani Park",
    slug: "bani-park",
    zone: "Central-North",
    pincode: "302016",
    latitude: 26.929,
    longitude: 75.792,
    avgPricePerSqft: 7800,
    avgRent2Bhk: 18000,
    isFeatured: false,
    description:
      "Bani Park is an old, established residential area close to the railway station, known for spacious bungalows, heritage properties and quiet streets. It is popular with families and for company-leased homes.",
    highlights: ["Spacious bungalows", "Quiet, established streets", "Near the railway station", "Popular for company leases"],
    connectivity: ["Jaipur Junction railway station close by", "Quick access to C-Scheme and MI Road", "Links to Sikar Road"],
  },
  {
    name: "Vidhyadhar Nagar",
    slug: "vidhyadhar-nagar",
    zone: "North",
    pincode: "302039",
    latitude: 26.96,
    longitude: 75.78,
    avgPricePerSqft: 5500,
    avgRent2Bhk: 13000,
    isFeatured: false,
    description:
      "Vidhyadhar Nagar is a planned locality in North Jaipur organised into sectors, with independent houses, plots and a growing number of apartments. Wide roads, parks and a sports stadium give it a comfortable residential feel.",
    highlights: ["Planned sectors", "Independent houses and plots", "Wide roads and parks", "Sports stadium"],
    connectivity: ["Access to Sikar Road", "Links to Bani Park and the railway station", "City bus connectivity"],
  },
  {
    name: "Pratap Nagar",
    slug: "pratap-nagar",
    zone: "South",
    pincode: "302033",
    latitude: 26.8,
    longitude: 75.82,
    avgPricePerSqft: 4800,
    avgRent2Bhk: 12000,
    isFeatured: false,
    description:
      "Pratap Nagar is a large housing-board colony in South Jaipur offering affordable to mid-segment homes, independent houses and flats. Its sector-wise layout, markets and proximity to the airport side of the city make it a practical choice for families.",
    highlights: ["Housing-board colony", "Affordable to mid-segment", "Sector-wise layout", "Local markets and parks"],
    connectivity: ["Near Sanganer and the airport side", "Access to Tonk Road", "City bus routes"],
  },
  {
    name: "Jhotwara",
    slug: "jhotwara",
    zone: "North-West",
    pincode: "302012",
    latitude: 26.955,
    longitude: 75.74,
    avgPricePerSqft: 4000,
    avgRent2Bhk: 10000,
    isFeatured: false,
    description:
      "Jhotwara in North-West Jaipur offers some of the city's most affordable housing, with independent homes, builder flats and plots. Proximity to an industrial area supports steady rental demand from working professionals.",
    highlights: ["Affordable housing", "Close to an industrial area", "Steady rental demand", "Plots and independent homes"],
    connectivity: ["Access to Sikar Road and Kalwar Road", "Links to Vaishali Nagar", "City bus services"],
  },
];
