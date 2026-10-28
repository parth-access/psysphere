"use client";

import * as React from "react";
import { useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { signInAction, forgotPasswordAction } from "@/src/domains/auth/actions";
import { Logo } from "@/features/marketing/ui/Logo";
import { Note } from "@/features/marketing/ui/Typography";
import { Psi } from "@/features/marketing/ui/Doodles";

const input =
  "block w-full min-h-12 rounded-2xl border border-line bg-surface px-4 text-[16px] text-ink-900 placeholder:text-ink-500/70 focus:outline-none focus:ring-2 focus:ring-forest-800/25 focus:border-forest-800 disabled:opacity-50";
const primary =
  "flex w-full min-h-12 items-center justify-center gap-2 rounded-full bg-forest-800 px-4 font-bold text-paper hover:bg-forest-900 disabled:opacity-60";

function Notice({ tone, children }: { tone: "ok" | "error"; children: React.ReactNode }) {
  const Icon = tone === "ok" ? CheckCircle2 : AlertCircle;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex gap-3 rounded-xl p-4 text-sm font-medium ${tone === "ok" ? "bg-sage-100 text-sage-600" : "bg-rose-100 text-rose-600"}`}>
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

function ForgotForm({ email, onBack }: { email: string; onBack: () => void }) {
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
        <input id="reset-email" name="email" type="email" autoComplete="email" required defaultValue={email} className={input} />
      </div>
      <button type="submit" disabled={pending} className={primary}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Send reset link
      </button>
      <button type="button" onClick={onBack} className="text-sm font-semibold text-ink-500 hover:text-ink-900">Back to log in</button>
    </form>
  );
}

const GOOGLE_ERRORS: Record<string, string> = {
  not_linked: "That Google account isn’t linked to Saarthi Classes yet. Log in with your email and password, then link Google on your Profile.",
  inactive: "This account has been switched off. Contact us if you think that’s a mistake.",
  expired: "That took too long. Try Continue with Google again.",
  failed: "Google didn’t finish signing you in. Try again, or log in with your email and password.",
};

const ACCOUNT_ERRORS: Record<string, string> = {
  missing: "Your account isn’t fully set up yet, so we logged you out. Contact us and we’ll sort it out.",
  inactive: "This account has been switched off, so we logged you out. Contact us if you think that’s a mistake.",
};

function GoogleButton() {
  const [going, setGoing] = useState(false);
  return (
    <a
      href="/api/auth/google"
      onClick={() => setGoing(true)}
      aria-busy={going || undefined}
      className="flex w-full min-h-12 items-center justify-center gap-3 rounded-full border border-line bg-surface px-4 font-semibold text-ink-900 hover:bg-paper-deep aria-busy:pointer-events-none aria-busy:opacity-70"
    >
      {going ? (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      ) : (
        <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
      )}
      Continue with Google
    </a>
  );
}

function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInAction, null);
  const params = useSearchParams();
  const [forgot, setForgot] = useState(params.get("forgot") === "1");
  // Controlled, so a wrong password doesn't wipe it (React resets uncontrolled fields after every form action).
  const [email, setEmail] = useState("");
  const updated = params.get("updated") === "true";
  const googleError = GOOGLE_ERRORS[params.get("google") ?? ""];
  const accountError = ACCOUNT_ERRORS[params.get("account") ?? ""];

  if (forgot) return <ForgotForm email={email} onBack={() => setForgot(false)} />;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {updated && <Notice tone="ok">Password set. Log in with your new password.</Notice>}
      {googleError && <Notice tone="error">{googleError}</Notice>}
      {accountError && <Notice tone="error">{accountError}</Notice>}
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-ink-900">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required readOnly={isPending} value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-semibold text-ink-900">Password</label>
          <button type="button" onClick={() => setForgot(true)} className="text-sm font-semibold text-ink-500 hover:text-ink-900">
            Forgot password?
          </button>
        </div>
        <input id="password" name="password" type="password" autoComplete="current-password" required readOnly={isPending} className={input} />
      </div>
      <button type="submit" disabled={isPending} className={primary}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isPending ? "Logging in…" : "Log in"}
      </button>
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-ink-500" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" />
      </div>
      <div className="flex flex-col gap-2">
        <GoogleButton />
        <p className="text-center text-[13px] text-ink-500">For students who’ve linked Google on their Profile.</p>
      </div>
    </form>
  );
}

export default function SignInPage() {
  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-forest-900 p-12 text-paper lg:flex">
        <Psi className="pointer-events-none absolute -bottom-16 -right-10 h-[420px] w-[360px] text-paper/[0.06]" />
        <Link href="/" aria-label="Saarthi Classes home" className="relative"><Logo tone="paper" /></Link>
        <div className="relative flex flex-col gap-6">
          <p className="max-w-md font-serif text-[52px] leading-[1.02]">
            Understand it once. <em className="text-gold-400">Remember it for the exam.</em>
          </p>
          <Note className="text-gold-400">welcome back :)</Note>
        </div>
        <p className="relative text-sm text-paper/60">Psychology for Class 11, 12 &amp; CUET-UG</p>
      </div>

      <main className="flex items-center justify-center px-4 py-16 sm:px-6">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <Link href="/" className="lg:hidden" aria-label="Saarthi Classes home"><Logo /></Link>
          <div>
            <h1 className="font-serif text-[44px] leading-none text-ink-900">Log in</h1>
            <p className="mt-1 text-[15px] text-ink-500">For students, teachers and admin.</p>
          </div>
          <React.Suspense fallback={<div className="h-64" />}>
            <SignInForm />
          </React.Suspense>
          <p className="text-sm text-ink-500">
            Not a student yet? <Link href="/workshops" className="font-bold text-forest-800 underline decoration-gold-500 decoration-2 underline-offset-4">Join a free workshop</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
