"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { WhatsAppButton } from "@/components/shared/contact-buttons";
import { Button } from "@/components/ui/button";
import { Container, EmptyState } from "@/components/ui/layout-primitives";

/** Route-segment error boundary (SPEC §55). Details are logged server-side via instrumentation. */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-16 sm:py-24">
      <EmptyState
        icon={<TriangleAlert />}
        title="Something went wrong"
        description={
          <>
            Please try again. If the problem continues, message us on WhatsApp and we&apos;ll help right away.
            {error.digest ? <span className="mt-2 block text-xs text-ink-400">Reference: {error.digest}</span> : null}
          </>
        }
      >
        <Button onClick={reset}>Try again</Button>
        <WhatsAppButton context="error_page" />
      </EmptyState>
    </Container>
  );
}
