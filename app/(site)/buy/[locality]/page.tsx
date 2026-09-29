import { LocalityLanding } from "@/components/listing/locality-landing";
import { listingMetadata } from "@/lib/listing-page";

export async function generateMetadata({ params, searchParams }: PageProps<"/buy/[locality]">) {
  const { locality } = await params;
  return listingMetadata(await searchParams, "SALE", { fixedLocality: locality });
}

export default async function BuyLocalityPage({ params, searchParams }: PageProps<"/buy/[locality]">) {
  const { locality } = await params;
  return <LocalityLanding slug={locality} tx="SALE" searchParams={await searchParams} />;
}
