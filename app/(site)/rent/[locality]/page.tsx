import { LocalityLanding } from "@/components/listing/locality-landing";
import { listingMetadata } from "@/lib/listing-page";

export async function generateMetadata({ params, searchParams }: PageProps<"/rent/[locality]">) {
  const { locality } = await params;
  return listingMetadata(await searchParams, "RENT", { fixedLocality: locality });
}

export default async function RentLocalityPage({ params, searchParams }: PageProps<"/rent/[locality]">) {
  const { locality } = await params;
  return <LocalityLanding slug={locality} tx="RENT" searchParams={await searchParams} />;
}
