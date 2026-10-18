import Link from "next/link";
import { MailCheck } from "lucide-react";
import { PublicShell } from "@/features/joining/ui/PublicShell";

export const metadata = { title: "Request sent | Saarthi Classes" };

export default function RequestedPage() {
  return (
    <PublicShell>
      <div role="status" className="mx-auto flex max-w-xl flex-col items-start gap-4 rounded-2xl border border-line bg-surface p-8">
        <MailCheck className="h-10 w-10 text-sage-600" aria-hidden="true" />
        <h1 className="font-serif text-3xl font-semibold">Request sent</h1>
        <p className="text-ink-500">
          Dravina will look at your request soon. When it’s approved you’ll get an email with a secure payment
          link. Your account is created as soon as you pay.
        </p>
        <Link href="/workshops" className="font-semibold underline underline-offset-4">
          Meanwhile, see upcoming free workshops
        </Link>
      </div>
    </PublicShell>
  );
}
