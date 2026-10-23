import Link from "next/link";
import { PartyPopper } from "lucide-react";
import { PublicShell } from "@/features/joining/ui/PublicShell";

export const metadata = { title: "Welcome | Saarthi Classes", robots: { index: false } };

export default function JoinSuccessPage() {
  return (
    <PublicShell>
      <div role="status" className="mx-auto flex max-w-xl flex-col items-start gap-4 rounded-[28px] border border-line bg-surface p-8">
        <PartyPopper className="h-10 w-10 text-marigold-500" aria-hidden="true" />
        <h1 className="font-serif text-3xl">Payment received. Welcome!</h1>
        <p className="text-ink-500">
          Your seat is confirmed. We’ve emailed you a link to set your password. Once that’s done, sign in to see your
          class timings and Google Meet links.
        </p>
        <Link href="/sign-in" className="inline-flex min-h-12 items-center rounded-full bg-forest-800 px-6 font-bold text-paper hover:bg-forest-900">
          Go to sign in
        </Link>
      </div>
    </PublicShell>
  );
}
