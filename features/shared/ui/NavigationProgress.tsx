"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin bar along the top of the page that starts as soon as an internal link is
 * clicked and finishes when the new page has rendered, so a click never feels ignored.
 * Driven straight through the DOM: no re-renders while it runs.
 */
export function NavigationProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const active = useRef(false);
  const safety = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pathname = usePathname();
  const search = useSearchParams().toString();

  const finish = () => {
    const el = bar.current;
    clearTimeout(safety.current);
    if (!el || !active.current) return;
    active.current = false;
    el.style.transition = "width 200ms ease-out, opacity 300ms ease 200ms";
    el.style.width = "100%";
    el.style.opacity = "0";
  };

  // The new page is on screen.
  useEffect(finish, [pathname, search]);

  useEffect(() => {
    const start = () => {
      const el = bar.current;
      if (!el) return;
      active.current = true;
      el.style.transition = "none";
      el.style.width = "0%";
      el.style.opacity = "1";
      void el.offsetWidth; // restart the transition from zero
      // One long ease-out reads as steady progress without ever reaching the end on its own.
      el.style.transition = "width 10s cubic-bezier(0.1, 0.7, 0.2, 1)";
      el.style.width = "90%";
      clearTimeout(safety.current);
      safety.current = setTimeout(finish, 20_000);
    };

    // Capture phase, before Next's <Link> handles the click (it always calls preventDefault to navigate itself).
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page or a #hash
      start();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]">
      <div ref={bar} className="h-full w-0 bg-gold-500 opacity-0 shadow-[0_0_8px_var(--color-gold-400)]" />
    </div>
  );
}
