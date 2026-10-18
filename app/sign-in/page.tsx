"use client";

import * as React from "react";
import { useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { signInAction, forgotPasswordAction } from "@/src/domains/auth/actions";
import { Logo } from "@/features/marketing/ui/Logo";

const input =
  "block w-full min-h-12 rounded-xl border border-line bg-surface px-4 text-[16px] text-ink-900 placeholder:text-ink-500/70 focus:outline-none focus:ring-2 focus:ring-ink-700/30 focus:border-ink-700 disabled:opacity-50";
const primary =
  "flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 font-semibold text-paper hover:bg-ink-700 disabled:opacity-60";

function Notice({ tone, children }: { tone: "ok" | "error"; children: React.ReactNode }) {
  const Icon = tone === "ok" ? CheckCircle2 : AlertCircle;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex gap-3 rounded-xl p-4 text-sm font-medium ${tone === "ok" ? "bg-sage-100 text-sage-600" : "bg-rose-100 text-rose-600"}`}>
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

function ForgotForm({ onBack }: { onBack: () => void }) {
  const [state, action, pending] = useActionState(forgotPasswordAction, null);
  if (state?.sent) {
    return (
      <div className="flex flex-col gap-5">
        <Notice tone="ok">If an account exists for that email, a reset link is on its way. It can take a minute.</Notice>
        <button type="button" onClick={onBack} className="font-semibold text-ink-900 underline underline-offset-4">Back to log in</button>
      </div>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-5">
      <p className="text-[15px] text-ink-500">Enter your email and we’ll send you a link to set a new password.</p>
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reset-email" className="text-sm font-semibold text-ink-900">Email</label>
        <input id="reset-email" name="email" type="email" autoComplete="email" required className={input} />
      </div>
      <button type="submit" disabled={pending} className={primary}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Send reset link
      </button>
      <button type="button" onClick={onBack} className="text-sm font-semibold text-ink-500 hover:text-ink-900">Back to log in</button>
    </form>
  );
}

function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInAction, null);
  const [forgot, setForgot] = useState(false);
  const updated = useSearchParams().get("updated") === "true";

  if (forgot) return <ForgotForm onBack={() => setForgot(false)} />;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {updated && <Notice tone="ok">Password set. Log in with your new password.</Notice>}
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-ink-900">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required disabled={isPending} className={input} />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-semibold text-ink-900">Password</label>
          <button type="button" onClick={() => setForgot(true)} className="text-sm font-semibold text-ink-500 hover:text-ink-900">
            Forgot password?
          </button>
        </div>
        <input id="password" name="password" type="password" autoComplete="current-password" required disabled={isPending} className={input} />
      </div>
      <button type="submit" disabled={isPending} className={primary}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isPending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}

export default function SignInPage() {
  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink-900 p-12 text-paper lg:flex">
        <Link href="/" aria-label="Saarthi Classes home"><Logo tone="paper" /></Link>
        <div className="flex flex-col gap-6">
          <svg viewBox="0 0 520 120" className="w-full max-w-md" aria-hidden="true">
            <path d="M8 96 C 120 96, 150 24, 260 24 S 420 90, 512 40" fill="none" stroke="#2E3A5F" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M8 96 C 120 96, 150 24, 260 24" fill="none" stroke="#FAF6EF" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="260" cy="24" r="9" fill="#E3962B" />
          </svg>
          <p className="max-w-md font-serif text-4xl font-semibold leading-tight">Understand it once. Remember it for the exam.</p>
        </div>
        <p className="text-sm text-ink-300">Psychology for Class 11, 12 &amp; CUET-UG</p>
      </div>

      <main className="flex items-center justify-center px-4 py-16 sm:px-6">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <Link href="/" className="lg:hidden" aria-label="Saarthi Classes home"><Logo /></Link>
          <div>
            <h1 className="font-serif text-[32px] font-semibold text-ink-900">Log in</h1>
            <p className="mt-1 text-[15px] text-ink-500">For students, teachers and admin.</p>
          </div>
          <React.Suspense fallback={<div className="h-64" />}>
            <SignInForm />
          </React.Suspense>
          <p className="text-sm text-ink-500">
            Not a student yet? <Link href="/workshops" className="font-semibold text-ink-900 underline underline-offset-4">Join a free workshop</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
