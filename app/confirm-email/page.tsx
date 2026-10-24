import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Logo } from "@/features/marketing/ui/Logo";
import { findEmailChange } from "@/src/domains/profile/emailChange";
import { ConfirmEmailForm } from "./ConfirmEmailForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Confirm your new email", robots: { index: false } };

// The change only happens on the button press, so a mail scanner opening the link can't make it.
export default async function ConfirmEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const found = await findEmailChange(token);

  return (
    <div className="flex min-h-screen flex-col justify-center bg-paper px-4 py-12 font-sans">
      <div className="mx-auto w-full max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-6 text-center font-serif text-3xl font-bold tracking-tight text-ink-900">Confirm your new email</h1>
        <div className="mt-8 rounded-xl border border-line bg-surface px-6 py-8 sm:px-10">
          {found ? (
            <ConfirmEmailForm token={token} newEmail={found.change.newEmail} />
          ) : (
            <div className="space-y-4 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-rose-600" aria-hidden="true" />
              <p className="text-sm text-ink-700">
                This link has expired or has already been used. To try again, go to your Profile and ask for a new link.
              </p>
              <Link href="/dashboard/profile" className="inline-flex min-h-11 items-center rounded-full bg-forest-800 px-6 text-sm font-bold text-paper hover:bg-forest-900">
                Open my profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
