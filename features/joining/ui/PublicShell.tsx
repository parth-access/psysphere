import type { ReactNode } from "react";
import { Navbar } from "@/features/marketing/ui/Navbar";
import { Footer } from "@/features/marketing/ui/Footer";
import { Eyebrow as MarketingEyebrow } from "@/features/marketing/ui/Typography";

/** Page frame for the workshop and join pages. */
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-paper text-ink-900">
      <div
        className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[520px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
        aria-hidden="true"
      />
      <Navbar />
      <main className="relative mx-auto w-full max-w-5xl px-4 pb-24 pt-32 sm:px-6 sm:pt-40">{children}</main>
      <Footer />
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <MarketingEyebrow>{children}</MarketingEyebrow>;
}
