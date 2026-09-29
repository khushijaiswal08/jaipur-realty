import {
  CategoryShortcuts,
  ContactStrip,
  FeaturedProperties,
  HomeHero,
  LatestPosts,
  NewProjects,
  PopularLocalities,
  PostPropertyCta,
  Testimonials,
  WhyChooseUs,
} from "@/components/home/home-sections";
import { getLatestPosts, getTestimonials } from "@/services/content.service";
import { getLocalityCards, getLocalityLinks } from "@/services/locality.service";
import { getFeaturedProjects } from "@/services/project.service";
import { getFeaturedProperties, getListingCounts } from "@/services/property.service";

// ISR: rebuilt at most every 5 minutes, and on demand when admins save (SPEC §37).
export const revalidate = 300;

export default async function HomePage() {
  const [localityLinks, counts, properties, localities, projects, testimonials, posts] = await Promise.all([
    getLocalityLinks(),
    getListingCounts(),
    getFeaturedProperties(8),
    getLocalityCards(),
    getFeaturedProjects(4),
    getTestimonials(3),
    getLatestPosts(3),
  ]);

  return (
    <>
      <HomeHero localities={localityLinks} counts={counts} />
      <CategoryShortcuts />
      <FeaturedProperties properties={properties} />
      <PopularLocalities localities={localities.filter((l) => l.isFeatured).slice(0, 8)} />
      <NewProjects projects={projects} />
      <WhyChooseUs />
      <Testimonials testimonials={testimonials} />
      <PostPropertyCta />
      <LatestPosts posts={posts} />
      <ContactStrip />
    </>
  );
}
