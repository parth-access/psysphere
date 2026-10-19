"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="flex max-w-md flex-col gap-4 rounded-2xl border border-line bg-surface p-8">
        <h1 className="font-serif text-3xl font-semibold text-ink-900">Something went wrong</h1>
        <p className="text-ink-500">This page couldn’t load just now. Please try again in a moment.</p>
        {error.digest && <p className="text-xs text-ink-500">Reference: {error.digest}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="min-h-12 rounded-xl bg-ink-900 px-6 font-semibold text-paper hover:bg-ink-700">
            Try again
          </button>
          <Link href="/" className="inline-flex min-h-12 items-center rounded-xl border border-line px-6 font-semibold text-ink-900 hover:bg-paper-deep">
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
