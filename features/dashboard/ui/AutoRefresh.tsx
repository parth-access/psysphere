"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-renders the page from the server every `seconds` while it's visible, for views of a class that's on now. */
export function AutoRefresh({ seconds = 60 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => window.clearInterval(id);
  }, [router, seconds]);
  return null;
}
