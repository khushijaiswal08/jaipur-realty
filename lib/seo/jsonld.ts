// schema.org JSON-LD builders (SPEC §32). Demo records never emit listing structured data.

import { absoluteUrl, siteConfig } from "@/lib/config";
import { PROPERTY_TYPE_NOUNS, TRANSACTION_TYPE_PHRASE } from "@/lib/constants/enums";
import type { PropertyDetailDTO } from "@/services/property-detail.service";
import type { ProjectDetailDTO } from "@/services/project-detail.service";
import type { LocalityDetailDTO } from "@/services/locality-detail.service";
import type { PostDetailDTO } from "@/services/blog.service";

type Json = Record<string, unknown>;

const abs = (url: string) => absoluteUrl(url);

export function organizationJsonLd(): Json {
  const a = siteConfig.address;
  const sameAs = Object.values(siteConfig.social).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${siteConfig.siteUrl}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.siteUrl,
    logo: siteConfig.logoUrl ? abs(siteConfig.logoUrl) : abs("/icon"),
    image: abs("/opengraph-image"),
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: [a.line1, a.line2].filter(Boolean).join(", "),
      addressLocality: a.city,
      addressRegion: a.state,
      postalCode: a.pincode,
      addressCountry: a.country,
    },
    ...(siteConfig.geo ? { geo: { "@type": "GeoCoordinates", latitude: siteConfig.geo.lat, longitude: siteConfig.geo.lng } } : {}),
    areaServed: { "@type": "City", name: a.city },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.siteUrl}/#website`,
    url: siteConfig.siteUrl,
    name: siteConfig.name,
    publisher: { "@id": `${siteConfig.siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteConfig.siteUrl}/buy?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ label: string; href?: string }>): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: abs(item.href) } : {}),
    })),
  };
}

const RESIDENCE_TYPES: Partial<Record<PropertyDetailDTO["propertyType"], string>> = {
  APARTMENT: "Apartment",
  PENTHOUSE: "Apartment",
  STUDIO: "Apartment",
  BUILDER_FLOOR: "Apartment",
  INDEPENDENT_HOUSE: "SingleFamilyResidence",
  VILLA: "SingleFamilyResidence",
  FARMHOUSE: "House",
};

export function propertyJsonLd(p: PropertyDetailDTO): Json | null {
  if (p.isDemo) return null;
  const url = abs(`/property/${p.slug}`);
  const thing: Json = {
    "@type": RESIDENCE_TYPES[p.propertyType] ?? "Place",
    name: p.title,
    address: { "@type": "PostalAddress", addressLocality: `${p.locality.name}, Jaipur`, addressRegion: "Rajasthan", addressCountry: "IN", ...(p.pincode ? { postalCode: p.pincode } : {}) },
    ...(p.map?.exact ? { geo: { "@type": "GeoCoordinates", latitude: p.map.lat, longitude: p.map.lng } } : {}),
    ...(p.bedrooms ? { numberOfRooms: p.bedrooms, numberOfBedrooms: p.bedrooms } : {}),
    ...(p.bathrooms ? { numberOfBathroomsTotal: p.bathrooms } : {}),
    ...(p.primaryArea ? { floorSize: { "@type": "QuantitativeValue", value: Math.round(p.primaryArea.sqft), unitCode: "FTK" } } : {}),
    ...(p.amenities.length ? { amenityFeature: p.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a.name, value: true })) } : {}),
  };
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    description: p.description.slice(0, 500),
    url,
    image: p.images.map((i) => abs(i.url)).slice(0, 8),
    ...(p.publishedAt ? { datePosted: p.publishedAt } : {}),
    dateModified: p.updatedAt,
    mainEntity: thing,
    offers: {
      "@type": "Offer",
      url,
      ...(p.price !== null && !p.priceOnRequest ? { price: p.price, priceCurrency: "INR" } : {}),
      businessFunction: p.transactionType === "RENT" ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell",
      availability: p.status === "SOLD" || p.status === "RENTED" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      seller: { "@id": `${siteConfig.siteUrl}/#organization` },
    },
    keywords: `${PROPERTY_TYPE_NOUNS[p.propertyType]} ${TRANSACTION_TYPE_PHRASE[p.transactionType]} in ${p.locality.name}, Jaipur`,
  };
}

export function projectJsonLd(p: ProjectDetailDTO): Json | null {
  if (p.isDemo) return null;
  const url = abs(`/projects/${p.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": ["Residence", "Place"],
    name: p.name,
    description: p.description.slice(0, 500),
    url,
    image: p.images.map((i) => abs(i.url)).slice(0, 8),
    address: { "@type": "PostalAddress", addressLocality: `${p.locality.name}, Jaipur`, addressRegion: "Rajasthan", addressCountry: "IN", ...(p.address ? { streetAddress: p.address } : {}) },
    ...(p.map ? { geo: { "@type": "GeoCoordinates", latitude: p.map.lat, longitude: p.map.lng } } : {}),
    ...(p.priceMin !== null && !p.priceOnRequest
      ? { offers: { "@type": "AggregateOffer", priceCurrency: "INR", lowPrice: p.priceMin, highPrice: p.priceMax ?? p.priceMin, url, offerCount: p.configurations.length } }
      : {}),
  };
}

export function localityJsonLd(l: LocalityDetailDTO): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${l.name}, Jaipur`,
    description: l.description?.slice(0, 500),
    url: abs(`/localities/${l.slug}`),
    ...(l.map ? { geo: { "@type": "GeoCoordinates", latitude: l.map.lat, longitude: l.map.lng } } : {}),
    containedInPlace: { "@type": "City", name: "Jaipur" },
  };
}

export function faqJsonLd(faqs: Array<{ question: string; answer: string }>): Json | null {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      // Strip Markdown syntax for the plain-text answer.
      acceptedAnswer: { "@type": "Answer", text: f.answer.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`#>]/g, "").trim() },
    })),
  };
}

export function blogPostingJsonLd(post: PostDetailDTO): Json | null {
  if (post.isDemo) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: [abs(post.cover.url)],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: post.authorName ? { "@type": "Person", name: post.authorName } : { "@id": `${siteConfig.siteUrl}/#organization` },
    publisher: { "@id": `${siteConfig.siteUrl}/#organization` },
    mainEntityOfPage: abs(`/blog/${post.slug}`),
    keywords: post.tags.join(", "),
  };
}
