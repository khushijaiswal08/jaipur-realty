import { ListingView } from "@/components/listing/listing-view";
import { listingMetadata, loadListingPage } from "@/lib/listing-page";

export async function generateMetadata({ searchParams }: PageProps<"/rent">) {
  return listingMetadata(await searchParams, "RENT");
}

export default async function RentPage({ searchParams }: PageProps<"/rent">) {
  const data = await loadListingPage(await searchParams, "RENT");
  return (
    <ListingView
      {...data}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Rent", href: "/rent" }, { label: data.heading }]}
    />
  );
}
