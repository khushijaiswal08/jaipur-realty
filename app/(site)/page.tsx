import {
  FeaturedProperties,
  HomeCta,
  HomeHero,
  LatestPosts,
  NewProjects,
  PopularLocations,
  PropertyCategories,
  Testimonials,
  TrustMetrics,
  WhyChooseUs,
} from "@/components/home/home-sections";
import { getLatestPosts, getTestimonials } from "@/services/content.service";
import { getCategoryTiles, getPopularSearches } from "@/services/home.service";
import { getLocalityCards, getLocalityLinks } from "@/services/locality.service";
import { getFeaturedProjects } from "@/services/project.service";
import { getFeaturedProperties } from "@/services/property.service";
import { getTrustMetrics } from "@/services/settings.service";

// ISR: rebuilt at most every 5 minutes, and on demand when admins save (SPEC §37).
export const revalidate = 300;

/** Home (SPEC §6). Every section reads from the database; empty sections render nothing. */
export default async function HomePage() {
  const [localityLinks, popularSearches, metrics, properties, tiles, localities, projects, testimonials, posts] = await Promise.all([
    getLocalityLinks(),
    getPopularSearches(8),
    getTrustMetrics(),
    getFeaturedProperties(8),
    getCategoryTiles(),
    getLocalityCards(),
    getFeaturedProjects(4),
    getTestimonials(3),
    getLatestPosts(3),
  ]);

  return (
    <>
      <HomeHero localities={localityLinks} popularSearches={popularSearches} />
      <TrustMetrics metrics={metrics} />
      <FeaturedProperties properties={properties} />
      <PropertyCategories tiles={tiles} />
      <PopularLocations localities={localities.filter((l) => l.isFeatured).slice(0, 8)} />
      <NewProjects projects={projects} />
      <WhyChooseUs />
      <Testimonials testimonials={testimonials} />
      <LatestPosts posts={posts} />
      <HomeCta />
    </>
  );
}
