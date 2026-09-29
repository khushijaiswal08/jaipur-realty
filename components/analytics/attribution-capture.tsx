"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/client/attribution";

/** Records first-touch UTM/referrer on the visitor's landing page. Renders nothing. */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
