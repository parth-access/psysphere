"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle } from "lucide-react";
import { PendingButton } from "@/features/shared/ui/PendingButton";
import { confirmEmailAction, type ConfirmEmailState } from "./actions";

export function ConfirmEmailForm({ token, newEmail }: { token: string; newEmail: string }) {
  const [state, action] = useActionState<ConfirmEmailState, FormData>(confirmEmailAction, {});

  if (state.ok) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle className="mx-auto h-10 w-10 text-sage-600" aria-hidden="true" />
        <h2 className="font-serif text-xl text-ink-900">Email changed</h2>
        <p className="text-sm text-ink-700">
          From now on, log in with <strong className="text-ink-900">{state.ok}</strong>. Your password stays the same.
        </p>
        <Link href="/dashboard" className="inline-flex min-h-11 items-center rounded-full bg-forest-800 px-6 text-sm font-bold text-paper hover:bg-forest-900">
          Go to my dashboard
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5 text-center">
      <input type="hidden" name="token" value={token} />
      <p className="text-sm text-ink-700">
        Your account will log in with <strong className="break-all text-ink-900">{newEmail}</strong> instead of your old email.
      </p>
      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-rose-100 p-3 text-left text-sm font-medium text-rose-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      )}
      <PendingButton className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-forest-800 px-6 text-sm font-bold text-paper hover:bg-forest-900 disabled:opacity-60">
        Confirm new email
      </PendingButton>
    </form>
  );
}
