import { ListingView } from "@/components/listing/listing-view";
import { listingMetadata, loadListingPage } from "@/lib/listing-page";

export async function generateMetadata({ searchParams }: PageProps<"/buy">) {
  return listingMetadata(await searchParams, "SALE");
}

export default async function BuyPage({ searchParams }: PageProps<"/buy">) {
  const data = await loadListingPage(await searchParams, "SALE");
  return (
    <ListingView
      {...data}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Buy", href: "/buy" }, { label: data.heading }]}
    />
  );
}
