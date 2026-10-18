"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { registerAction, type RegisterState } from "@/app/workshops/[id]/actions";
import { PersonFields } from "./PersonFields";
import { primaryButtonClass } from "./Field";

export function WorkshopRegisterForm({ workshopId, defaultClass }: { workshopId: string; defaultClass?: string }) {
  const [state, action, pending] = useActionState<RegisterState, FormData>(registerAction, { status: "idle" });

  if (state.status === "done") {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-6">
        <CheckCircle2 className="h-8 w-8 text-sage-600" aria-hidden="true" />
        <h2 className="font-serif text-2xl font-semibold">
          {state.alreadyRegistered ? "You’re already registered" : "Your seat is reserved"}
        </h2>
        <p className="text-ink-500">
          We’ve emailed the Google Meet link{state.email ? ` to ${state.email}` : ""}. Check your spam folder if you
          don’t see it in a few minutes.
        </p>
        <Link href="/workshops" className="font-semibold underline underline-offset-4">
          See other workshops
        </Link>
      </div>
    );
  }

  const errors = state.status === "error" ? state.errors : {};

  return (
    <form action={action} noValidate className="relative flex flex-col gap-8 rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <input type="hidden" name="workshopId" value={workshopId} />
      <PersonFields errors={errors} defaultClass={defaultClass} />
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-xl bg-rose-100 px-4 py-3 text-sm font-medium text-rose-600">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Reserving…" : "Reserve my free seat"}
      </button>
    </form>
  );
}
