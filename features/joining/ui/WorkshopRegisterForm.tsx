"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, MailCheck } from "lucide-react";
import { registerAction, type RegisterState } from "@/app/workshops/[id]/actions";
import { PersonFields } from "./PersonFields";
import { primaryButtonClass } from "./Field";

export function WorkshopRegisterForm({ workshopId, defaultClass, when }: { workshopId: string; defaultClass?: string; when: string }) {
  const [state, action, pending] = useActionState<RegisterState, FormData>(registerAction, { status: "idle" });

  if (state.status === "done") {
    return (
      <div role="status" className="flex flex-col gap-6 rounded-[28px] border border-line bg-surface p-7 sm:p-8">
        <div className="flex flex-col gap-3">
          <CheckCircle2 className="h-10 w-10 text-forest-700" aria-hidden="true" />
          <h2 className="font-serif text-[34px] leading-tight">
            {state.alreadyRegistered ? "You’re already registered" : "Your seat is reserved"}
          </h2>
          <p className="flex items-center gap-2 text-[15px] font-semibold text-ink-700">
            <CalendarDays className="h-4 w-4 text-forest-800" aria-hidden="true" /> {when}
          </p>
        </div>
        <div className="flex gap-3 rounded-[20px] bg-mint p-4 text-[15px] text-ink-900">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-forest-800" aria-hidden="true" />
          <p>
            We’ve emailed the details{state.email ? <> to <strong>{state.email}</strong></> : ""}. If you can’t find the
            email in a few minutes, check your spam folder.
          </p>
        </div>
        <div className="flex flex-col gap-2 border-t border-line pt-5">
          <p className="text-sm text-ink-500">Already sure you want to join?</p>
          <Link href="/join" className="inline-flex items-center gap-1.5 font-bold text-forest-800 hover:underline">
            Join a batch directly <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  const errors = state.status === "error" ? state.errors : {};

  return (
    <form action={action} noValidate className="relative flex flex-col gap-7 rounded-[28px] border border-line bg-surface p-7 shadow-soft sm:p-8">
      <div>
        <h2 className="font-serif text-[30px] leading-tight">Reserve your free seat</h2>
        <p className="mt-1 text-[15px] text-ink-500">No payment, no commitment.</p>
      </div>
      <input type="hidden" name="workshopId" value={workshopId} />
      <PersonFields errors={errors} defaultClass={defaultClass} />
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-2xl bg-rose-100 px-4 py-3 text-sm font-medium text-rose-600">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Reserving…" : "Reserve my free seat"}
      </button>
    </form>
  );
}
