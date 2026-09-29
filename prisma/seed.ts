// Idempotent demo seed (SPEC §35.4). Safe to run repeatedly: every record is upserted by its
// natural key (slug / refCode / question). Demo rows are reset to the seed state on each run.
//
//   npm run db:seed          (prisma db seed → tsx prisma/seed.ts)
//
// Never creates admin users — use `npm run admin:create` (SPEC §43).

import "dotenv/config";
import type { ImageKind, PropertyType } from "../generated/prisma/enums";
import { PROPERTY_TYPE_CATEGORY } from "../lib/constants/enums";
import { db } from "../lib/db";
import { computePricePerSqft, getPrimaryArea } from "../lib/format/area";
import { propertySlug, readingTimeMinutes } from "../lib/utils";
import { AMENITIES } from "./seed-data/amenities";
import { BLOG_CATEGORIES, DEMO_AGENT, DEMO_POSTS, DEMO_TESTIMONIALS, GENERAL_FAQS } from "./seed-data/content";
import { CITY, LOCALITIES } from "./seed-data/localities";
import { PROJECTS, type ProjectSeed } from "./seed-data/projects";
import { PROPERTIES } from "./seed-data/properties";

const DEMO_DISCLAIMER =
  "Demo listing — for illustration only. This is not an actual property offered for sale or rent.";
const DAY_MS = 86_400_000;
const IMG = { width: 1200, height: 900 };

interface ImageSpec {
  file: string;
  caption: string;
  kind?: ImageKind;
}

const P = (file: string, caption: string, kind?: ImageKind): ImageSpec => ({ file, caption, kind });

function propertyImageSet(type: PropertyType): ImageSpec[] {
  switch (type) {
    case "INDEPENDENT_HOUSE":
      return [P("house-exterior", "Front elevation"), P("living-room", "Living room"), P("bedroom", "Master bedroom"), P("kitchen", "Kitchen"), P("floor-plan", "Floor plan", "FLOOR_PLAN")];
    case "VILLA":
    case "FARMHOUSE":
      return [P("villa-exterior", "Villa exterior"), P("living-room", "Living room"), P("bedroom", "Bedroom"), P("kitchen", "Kitchen"), P("floor-plan", "Floor plan", "FLOOR_PLAN")];
    case "RESIDENTIAL_PLOT":
    case "COMMERCIAL_PLOT":
    case "AGRICULTURAL_LAND":
      return [P("plot-site", "Plot view"), P("plot-layout", "Layout plan", "MASTER_PLAN")];
    case "OFFICE_SPACE":
    case "WAREHOUSE":
      return [P("office-exterior", "Building exterior"), P("office-interior", "Office interior"), P("floor-plan", "Floor plan", "FLOOR_PLAN")];
    case "SHOP":
    case "SHOWROOM":
      return [P("shop-front", "Shop front"), P("office-interior", "Interior")];
    default:
      return [P("apartment-exterior", "Building exterior"), P("living-room", "Living room"), P("bedroom", "Bedroom"), P("kitchen", "Kitchen"), P("balcony-view", "Balcony view"), P("floor-plan", "Floor plan", "FLOOR_PLAN")];
  }
}

function projectImageSet(set: ProjectSeed["imageSet"]): ImageSpec[] {
  switch (set) {
    case "plotted":
      return [P("plot-site", "Township view"), P("villa-exterior", "Sample villa"), P("plot-layout", "Master plan", "MASTER_PLAN")];
    case "commercial":
      return [P("office-exterior", "Project elevation"), P("shop-front", "Retail frontage"), P("office-interior", "Sample office"), P("floor-plan", "Typical floor plan", "FLOOR_PLAN")];
    case "premium":
      return [P("project-towers", "Project view"), P("living-room", "Sample living room"), P("bedroom", "Sample bedroom"), P("floor-plan", "Typical floor plan", "FLOOR_PLAN")];
    default:
      return [P("project-towers", "Project view"), P("apartment-exterior", "Tower elevation"), P("living-room", "Sample living room"), P("kitchen", "Sample kitchen"), P("floor-plan", "Typical floor plan", "FLOOR_PLAN")];
  }
}

function toImageRows(specs: ImageSpec[], subject: string) {
  return specs.map((s, i) => ({
    url: `/placeholders/${s.file}.svg`,
    alt: `${s.caption} — ${subject} (demo image)`,
    caption: s.caption,
    kind: s.kind ?? "PHOTO",
    sortOrder: i,
    isCover: i === 0,
    ...IMG,
  }));
}

const money = (n: number | undefined) => (n === undefined ? null : BigInt(Math.round(n)));
const daysFromNow = (days: number) => new Date(Date.now() + days * DAY_MS);

async function main() {
  const now = Date.now();

  // ── City & localities ──────────────────────────────────────────────────────
  const city = await db.city.upsert({
    where: { slug: CITY.slug },
    update: { name: CITY.name, state: CITY.state, isActive: true },
    create: { name: CITY.name, slug: CITY.slug, state: CITY.state },
  });

  const localityIds = new Map<string, string>();
  for (const [i, l] of LOCALITIES.entries()) {
    const data = {
      name: l.name,
      zone: l.zone,
      pincode: l.pincode,
      latitude: l.latitude,
      longitude: l.longitude,
      avgPricePerSqft: l.avgPricePerSqft,
      avgRent2Bhk: l.avgRent2Bhk,
      isFeatured: l.isFeatured,
      description: l.description,
      highlights: l.highlights,
      connectivity: l.connectivity,
      imageUrl: "/placeholders/locality-skyline.svg",
      sortOrder: i,
    };
    const row = await db.locality.upsert({
      where: { cityId_slug: { cityId: city.id, slug: l.slug } },
      update: data,
      create: { ...data, slug: l.slug, cityId: city.id },
    });
    localityIds.set(l.slug, row.id);
  }

  const localityId = (slug: string) => {
    const id = localityIds.get(slug);
    if (!id) throw new Error(`Unknown locality slug in seed data: ${slug}`);
    return id;
  };

  // ── Amenities ──────────────────────────────────────────────────────────────
  for (const [i, a] of AMENITIES.entries()) {
    await db.amenity.upsert({
      where: { slug: a.slug },
      update: { name: a.name, icon: a.icon, category: a.category, sortOrder: i },
      create: { ...a, sortOrder: i },
    });
  }
  const amenityRefs = (slugs: string[]) => slugs.map((slug) => ({ slug }));

  // ── Demo agent ─────────────────────────────────────────────────────────────
  const agent = await db.agent.upsert({
    where: { slug: DEMO_AGENT.slug },
    update: { ...DEMO_AGENT, isDemo: true, isActive: true },
    create: { ...DEMO_AGENT, isDemo: true },
  });

  // ── Projects ───────────────────────────────────────────────────────────────
  const projectIds = new Map<string, string>();
  for (const p of PROJECTS) {
    const prices = p.configurations.flatMap((c) => [c.priceMin, c.priceMax]);
    const data = {
      name: p.name,
      developerName: p.developerName,
      developerDescription: p.developerDescription,
      status: "PUBLISHED" as const,
      constructionStatus: p.constructionStatus,
      launchDate: p.launchDate ? new Date(p.launchDate) : null,
      possessionDate: p.possessionDate ? new Date(p.possessionDate) : null,
      totalUnits: p.totalUnits ?? null,
      totalTowers: p.totalTowers ?? null,
      totalFloors: p.totalFloors ?? null,
      landAreaAcres: p.landAreaAcres ?? null,
      description: `${p.description}\n\n${DEMO_DISCLAIMER}`,
      highlights: p.highlights,
      priceMin: money(Math.min(...prices)),
      priceMax: money(Math.max(...prices)),
      address: p.address,
      latitude: p.latitude,
      longitude: p.longitude,
      cityId: city.id,
      localityId: localityId(p.localitySlug),
      isFeatured: p.isFeatured,
      isDemo: true,
      reraNumber: null,
      publishedAt: new Date(now - 30 * DAY_MS),
    };
    const row = await db.project.upsert({
      where: { slug: p.slug },
      update: { ...data, amenities: { set: amenityRefs(p.amenities) } },
      create: { ...data, slug: p.slug, amenities: { connect: amenityRefs(p.amenities) } },
    });
    projectIds.set(p.slug, row.id);

    await db.projectImage.deleteMany({ where: { projectId: row.id } });
    await db.projectImage.createMany({
      data: toImageRows(projectImageSet(p.imageSet), p.name).map((img) => ({ ...img, projectId: row.id })),
    });
    await db.configuration.deleteMany({ where: { projectId: row.id } });
    await db.configuration.createMany({
      data: p.configurations.map((c, i) => ({
        projectId: row.id,
        label: c.label,
        propertyType: c.propertyType,
        bedrooms: c.bedrooms ?? null,
        carpetAreaMin: c.carpetAreaMin ?? null,
        carpetAreaMax: c.carpetAreaMax ?? null,
        superAreaMin: c.superAreaMin ?? null,
        superAreaMax: c.superAreaMax ?? null,
        priceMin: money(c.priceMin),
        priceMax: money(c.priceMax),
        unitsAvailable: c.unitsAvailable ?? null,
        floorPlanUrl: "/placeholders/floor-plan.svg",
        sortOrder: i,
      })),
    });
  }

  // ── Properties ─────────────────────────────────────────────────────────────
  for (const p of PROPERTIES) {
    const category = PROPERTY_TYPE_CATEGORY[p.propertyType];
    const areas = {
      category,
      carpetArea: p.carpetArea ?? null,
      builtUpArea: p.builtUpArea ?? null,
      superBuiltUpArea: p.superBuiltUpArea ?? null,
      plotArea: p.plotArea ?? null,
      areaDisplayUnit: p.areaDisplayUnit ?? "SQFT",
    };
    const primary = getPrimaryArea(areas);
    const locId = localityId(p.localitySlug);
    const loc = LOCALITIES.find((l) => l.slug === p.localitySlug);
    const projectId = p.projectSlug ? (projectIds.get(p.projectSlug) ?? null) : null;

    const data = {
      title: p.title,
      slug: propertySlug(p.title, p.refCode),
      description: `${p.description}\n\n${DEMO_DISCLAIMER}`,
      transactionType: p.transactionType,
      propertyType: p.propertyType,
      status: p.status ?? "ACTIVE",
      constructionStatus: p.constructionStatus ?? null,
      listedBy: p.listedBy ?? "AGENCY",
      price: money(p.price),
      priceOnRequest: false,
      isNegotiable: p.isNegotiable ?? false,
      pricePerSqft: p.transactionType === "SALE" ? computePricePerSqft(p.price, primary?.sqft) : null,
      maintenanceMonthly: p.maintenanceMonthly ?? null,
      securityDeposit: money(p.securityDeposit),
      bedrooms: p.bedrooms ?? null,
      bathrooms: p.bathrooms ?? null,
      balconies: p.balconies ?? null,
      ...areas,
      plotLengthFt: p.plotLengthFt ?? null,
      plotWidthFt: p.plotWidthFt ?? null,
      floorNumber: p.floorNumber ?? null,
      totalFloors: p.totalFloors ?? null,
      facing: p.facing ?? null,
      furnishing: p.furnishing ?? null,
      ownershipType: p.ownershipType ?? null,
      ageYears: p.ageYears ?? null,
      possessionDate: p.possessionDate ? new Date(p.possessionDate) : null,
      availableFrom: p.availableInDays !== undefined ? daysFromNow(p.availableInDays) : null,
      preferredTenants: p.preferredTenants ?? [],
      coveredParking: p.coveredParking ?? null,
      openParking: p.openParking ?? null,
      roadWidthFt: p.roadWidthFt ?? null,
      isCornerPlot: p.isCornerPlot ?? false,
      isGatedCommunity: p.isGatedCommunity ?? false,
      jdaApproved: p.jdaApproved ?? null,
      reraNumber: null,
      landmark: p.landmark ?? null,
      pincode: loc?.pincode ?? null,
      // Jitter around the locality centroid; exact location stays hidden (hideExactLocation).
      latitude: loc ? loc.latitude + ((Number(p.refCode.slice(-2)) % 7) - 3) * 0.002 : null,
      longitude: loc ? loc.longitude + ((Number(p.refCode.slice(-2)) % 5) - 2) * 0.002 : null,
      hideExactLocation: true,
      cityId: city.id,
      localityId: locId,
      projectId,
      agentId: agent.id,
      isFeatured: p.isFeatured ?? false,
      isVerified: p.isVerified ?? false,
      isDemo: true,
      publishedAt: new Date(now - p.listedDaysAgo * DAY_MS),
    };

    const row = await db.property.upsert({
      where: { refCode: p.refCode },
      update: { ...data, amenities: { set: amenityRefs(p.amenities) } },
      create: { ...data, refCode: p.refCode, amenities: { connect: amenityRefs(p.amenities) } },
    });

    await db.propertyImage.deleteMany({ where: { propertyId: row.id } });
    await db.propertyImage.createMany({
      data: toImageRows(propertyImageSet(p.propertyType), p.title).map((img) => ({ ...img, propertyId: row.id })),
    });
  }

  // Keep the refCode sequence ahead of every seeded code (JP1001… → next is JP1021).
  await db.$executeRaw`
    SELECT setval('property_ref_seq', GREATEST(
      1000,
      (SELECT COALESCE(MAX(CAST(SUBSTRING("refCode" FROM 3) AS INTEGER)), 1000)
         FROM "properties" WHERE "refCode" ~ '^JP[0-9]+$')
    ))`;

  // ── Testimonials (demo) ────────────────────────────────────────────────────
  await db.testimonial.deleteMany({ where: { isDemo: true } });
  await db.testimonial.createMany({
    data: DEMO_TESTIMONIALS.map((t, i) => ({ ...t, isDemo: true, isPublished: true, sortOrder: i })),
  });

  // ── Blog ───────────────────────────────────────────────────────────────────
  const categoryIds = new Map<string, string>();
  for (const [i, c] of BLOG_CATEGORIES.entries()) {
    const row = await db.blogCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, sortOrder: i },
      create: { ...c, sortOrder: i },
    });
    categoryIds.set(c.slug, row.id);
  }
  for (const post of DEMO_POSTS) {
    const data = {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImageUrl: "/placeholders/blog-cover.svg",
      coverImageAlt: `${post.title} (demo image)`,
      status: "PUBLISHED" as const,
      publishedAt: new Date(now - post.publishedDaysAgo * DAY_MS),
      readingTimeMinutes: readingTimeMinutes(post.content),
      tags: post.tags,
      categoryId: categoryIds.get(post.categorySlug) ?? null,
      isDemo: true,
    };
    await db.blogPost.upsert({ where: { slug: post.slug }, update: data, create: { ...data, slug: post.slug } });
  }

  // ── General FAQs (process-only; not demo-flagged) ──────────────────────────
  for (const [i, f] of GENERAL_FAQS.entries()) {
    const existing = await db.faq.findFirst({ where: { question: f.question, propertyId: null, projectId: null, localityId: null } });
    if (existing) {
      await db.faq.update({ where: { id: existing.id }, data: { answer: f.answer, scope: f.scope, sortOrder: i } });
    } else {
      await db.faq.create({ data: { ...f, sortOrder: i, isPublished: true } });
    }
  }

  const counts = {
    localities: await db.locality.count(),
    amenities: await db.amenity.count(),
    projects: await db.project.count({ where: { isDemo: true } }),
    properties: await db.property.count({ where: { isDemo: true } }),
    images: await db.propertyImage.count(),
    testimonials: await db.testimonial.count({ where: { isDemo: true } }),
    blogPosts: await db.blogPost.count({ where: { isDemo: true } }),
    faqs: await db.faq.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
