"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pageview, GA_MEASUREMENT_ID } from "@/lib/gtag";

/**
 * Client component that monitors pathname + searchParams in Next.js App Router
 * and triggers a GA4 page_view on initial load and every subsequent client-side route change.
 */
export default function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    const queryString = searchParams?.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    pageview(url);
  }, [pathname, searchParams]);

  return null;
}

