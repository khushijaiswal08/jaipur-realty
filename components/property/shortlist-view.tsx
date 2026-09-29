"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { PropertyGrid } from "@/components/property/property-card";
import { WhatsAppButton } from "@/components/shared/contact-buttons";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/layout-primitives";
import { shortlistStore } from "@/lib/client/local-list-store";
import { usePropertyList } from "@/lib/client/use-property-list";
import { absoluteUrl } from "@/lib/config";
import { shortlistMessage } from "@/lib/whatsapp";
import type { PropertyCardDTO } from "@/services/property.service";

export function ShortlistView() {
  const ids = shortlistStore.useIds();
  const { items, status } = usePropertyList<PropertyCardDTO>(ids);

  if (status === "loading" && !items.length) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {Array.from({ length: Math.min(ids.length || 3, 6) }, (_, i) => (
          <Skeleton key={i} className="h-96 rounded-card" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={<Heart />}
        title="Your shortlist is empty"
        description="Tap the heart on any property to save it here. Your shortlist is stored on this device."
      >
        <Link href="/buy" className={buttonVariants()}>
          Browse properties for sale
        </Link>
        <Link href="/rent" className={buttonVariants({ variant: "outline" })}>
          Browse rentals
        </Link>
      </EmptyState>
    );
  }

  const message = shortlistMessage(items.map((p) => ({ refCode: p.refCode, url: absoluteUrl(`/property/${p.slug}`) })));
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-600">
          {items.length} saved {items.length === 1 ? "property" : "properties"}
        </p>
        <div className="flex flex-wrap gap-2">
          <WhatsAppButton context="shortlist" message={message} size="sm">
            Share shortlist on WhatsApp
          </WhatsAppButton>
          <Button variant="ghost" size="sm" onClick={() => shortlistStore.clear()}>
            Clear all
          </Button>
        </div>
      </div>
      <PropertyGrid properties={items} className="lg:grid-cols-3 xl:grid-cols-3" />
    </>
  );
}
