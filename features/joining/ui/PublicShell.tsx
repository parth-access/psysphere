import type { ReactNode } from "react";
import { Navbar } from "@/features/marketing/ui/Navbar";
import { Footer } from "@/features/marketing/ui/Footer";

/** Page frame for the workshop and join pages. */
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-32 sm:px-6">{children}</main>
      <Footer />
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-marigold-700">{children}</p>
  );
}
