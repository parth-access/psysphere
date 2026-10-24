"use client";

import * as React from "react";
import { createClient } from "@/src/domains/auth/client";
import { clearLoginLockoutAction } from "@/src/domains/auth/actions";
import { Logo } from "@/features/marketing/ui/Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";

const EXPIRED = "This link has expired or has already been used. You can get a new one below.";

export default function ResetPasswordPage() {
  const router = useRouter();
  // We read the link's tokens ourselves rather than letting the client pick them up on load,
  // so a failed or reused link can't leave a half-made session behind.
  const [supabase] = React.useState(() =>
    createClient({ isSingleton: false, auth: { detectSessionInUrl: false } })
  );
  const started = React.useRef(false);

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const [checkingSession, setCheckingSession] = React.useState(true);
  const [recoveryVerified, setRecoveryVerified] = React.useState(false);
  const [recoveryEmail, setRecoveryEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    // A link can only be redeemed once, so never run this twice (Strict Mode re-runs effects in dev).
    if (started.current) return;
    started.current = true;

    const fail = (message: string) => {
      setError(message);
      setRecoveryVerified(false);
      setCheckingSession(false);
    };
    const verified = (email: string | undefined) => {
      setRecoveryEmail(email ?? null);
      setRecoveryVerified(true);
      setCheckingSession(false);
    };

    const initializeRecoverySession = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash");
        // Our own emails link here with type=invite for new accounts and type=recovery for resets.
        const otpType = searchParams.get("type") === "invite" ? "invite" : "recovery";
        // Supabase sends people back with error_code when a link has expired or was already used.
        const linkError = hashParams.get("error_code") || searchParams.get("error_code");

        // Keep the one-time tokens out of the address bar and browser history.
        if (window.location.hash || window.location.search) {
          window.history.replaceState(null, "", window.location.pathname);
        }

        if (linkError) {
          fail(EXPIRED);
          return;
        }
        if (!accessToken && !code && !tokenHash) {
          fail("This page only works from the link in your email. Open that link again, or get a new one below.");
          return;
        }

        // Each branch below stores the link's session in place of any session already in this
        // browser, so the password change always lands on the account the link was sent to.
        // Don't sign out first: that also deletes the PKCE code verifier the "code" branch needs.
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError || !data?.session) {
            console.error("[ResetPassword] PKCE exchange error:", exchangeError);
            fail(
              exchangeError?.code === "pkce_code_verifier_not_found"
                ? "Open the link in the same browser you asked for it from. If that isn’t handy, get a new link here."
                : EXPIRED
            );
            return;
          }
          verified(data.session.user.email);
          return;
        }

        if (tokenHash) {
          const { data, error: otpError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType,
          });
          if (otpError || !data?.session) {
            console.error("[ResetPassword] OTP verification error:", otpError);
            fail(EXPIRED);
            return;
          }
          verified(data.session.user.email);
          return;
        }

        if (accessToken && refreshToken) {
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (setSessionError || !data?.session) {
            console.error("[ResetPassword] setSession failed:", setSessionError);
            fail(EXPIRED);
            return;
          }
          verified(data.session.user.email);
          return;
        }

        fail("We could not establish a secure session from the provided credentials.");
      } catch (err) {
        console.error("[ResetPassword] Recovery initialization failed:", err);
        fail("We couldn’t check this link. Try it again, or get a new one below.");
      }
    };

    initializeRecoverySession();
  }, [supabase]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError(null);

    if (!recoveryVerified) {
      setError(
        "This link has expired. Get a new one with Forgot password on the log in page."
      );
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      /*
       * Verify the session again immediately before changing credentials.
       */
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setRecoveryVerified(false);
        setError(
          "This link has expired. Get a new one with Forgot password on the log in page."
        );
        setIsLoading(false);
        return;
      }

      // Mandatory identity mismatch verification
      if (recoveryEmail && session.user?.email !== recoveryEmail) {
        setRecoveryVerified(false);
        setError("Account identity mismatch. Please use the original setup link.");
        setIsLoading(false);
        return;
      }

      const {
        data,
        error: updateError,
      } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      if (!data?.user) {
        setError(
          "Password update could not be verified. Please try again."
        );
        setIsLoading(false);
        return;
      }

      /*
       * Password really has been changed at this point.
       */
      await clearLoginLockoutAction().catch(() => {});
      setSuccess(true);
      setIsLoading(false);

      /*
       * End the temporary recovery session so the teacher must authenticate
       * normally with the newly chosen password.
       */
      const { error: signOutError } =
        await supabase.auth.signOut();

      if (signOutError) {
        console.error(
          "[ResetPassword] Sign out after password reset failed:",
          signOutError
        );
      }

      window.setTimeout(() => {
        router.replace("/sign-in?updated=true");
      }, 2000);
    } catch (err: unknown) {
      console.error(
        "[ResetPassword] Password update failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );

      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>

        <h2 className="mt-6 text-center text-3xl font-serif font-bold text-ink-900 tracking-tight">
          Set your password
        </h2>

        <p className="mt-2 text-center text-sm text-ink-500">
          Choose a password for your Saarthi Classes account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-6 border border-line rounded-xl sm:px-10">
          {checkingSession ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-ink-900 animate-spin" />

              <p className="text-sm text-ink-500 font-medium">
                Checking your link…
              </p>
            </div>
          ) : success ? (
            <div className="rounded-xl bg-sage-100 p-6 border border-sage-100 text-center space-y-3">
              <div className="flex justify-center">
                <CheckCircle className="h-10 w-10 text-sage-600" />
              </div>

              <h3 className="text-md font-serif text-sage-600">
                Password saved
              </h3>

              <p className="text-xs text-sage-600">
                Taking you to the log in page…
              </p>
            </div>
          ) : !recoveryVerified ? (
            <div className="rounded-xl bg-rose-100 p-6 border border-rose-100 space-y-3">
              <div className="flex justify-center">
                <AlertCircle className="h-10 w-10 text-rose-600" />
              </div>

              <h3 className="text-center text-md font-serif text-rose-600">
                This link didn’t work
              </h3>

              <p className="text-center text-xs text-rose-600">
                {error || EXPIRED}
              </p>

              <div className="flex justify-center pt-1">
                <Link
                  href="/sign-in?forgot=1"
                  className="inline-flex min-h-11 items-center rounded-full bg-forest-800 px-5 text-sm font-bold text-paper hover:bg-forest-900"
                >
                  Get a new link
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {error && (
                <div className="rounded-xl bg-rose-100 p-4 border border-rose-100">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle
                        className="h-5 w-5 text-rose-600"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="ml-3">
                      <p className="text-xs font-medium text-rose-600">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-ink-700 uppercase tracking-wider"
                >
                  New Password
                </label>

                <div className="mt-1 relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-ink-500" />
                  </div>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={isLoading}
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="block w-full min-h-12 pl-10 pr-3 text-[16px] bg-surface border border-line rounded-xl text-ink-900 placeholder:text-ink-500/70 focus:outline-none focus:ring-2 focus:ring-forest-800/25 focus:border-forest-800 disabled:opacity-50"
                    placeholder="Min 8 characters"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold text-ink-700 uppercase tracking-wider"
                >
                  Confirm Password
                </label>

                <div className="mt-1 relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-ink-500" />
                  </div>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={isLoading}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    className="block w-full min-h-12 pl-10 pr-3 text-[16px] bg-surface border border-line rounded-xl text-ink-900 placeholder:text-ink-500/70 focus:outline-none focus:ring-2 focus:ring-forest-800/25 focus:border-forest-800 disabled:opacity-50"
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-12 flex justify-center items-center gap-2 px-4 rounded-full font-bold text-paper bg-forest-800 hover:bg-forest-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-700/40 disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      Save password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}