"use client";

import * as React from "react";
import { createClient } from "@/src/domains/auth/client";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [supabase] = React.useState<any>(() => createClient());

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const [checkingSession, setCheckingSession] = React.useState(true);
  const [recoveryVerified, setRecoveryVerified] = React.useState(false);
  const [recoveryEmail, setRecoveryEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const initializeRecoverySession = async () => {
      if (!supabase) {
        if (mounted) {
          setError("Authentication client could not be initialized.");
          setCheckingSession(false);
        }
        return;
      }
      try {
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        const search = typeof window !== "undefined" ? window.location.search : "";

        // Parse hash fragment
        const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.substring(1) : hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        // Parse query params (PKCE flow or verification token)
        const searchParams = new URLSearchParams(search);
        const code = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash");

        const hasRecoveryParams = !!(accessToken || code || tokenHash);

        console.log("[ResetPassword] Checking URL tokens:", {
          hasHashToken: !!accessToken,
          hasCode: !!code,
          hasTokenHash: !!tokenHash
        });

        // If we have no recovery parameters, reject access immediately to prevent direct navigation access
        if (!hasRecoveryParams) {
          if (mounted) {
            setError("This password setup link is invalid or has expired. Please request a new invitation from the PsySphere administrator.");
            setRecoveryVerified(false);
            setCheckingSession(false);
          }
          return;
        }

        // Isolating the session: Sign out any pre-existing user (e.g. admin) to ensure clean credential state
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          console.log("[ResetPassword] Pre-existing session found. Signing out before processing recovery credentials...");
          await supabase.auth.signOut();
        }

        // 1. Process PKCE Code
        if (code) {
          console.log("[ResetPassword] Exchanging PKCE code...");
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("[ResetPassword] PKCE exchange error:", exchangeError);
            if (mounted) {
              setError("The verification code is invalid or has expired.");
              setRecoveryVerified(false);
              setCheckingSession(false);
            }
            return;
          }

          if (data?.session) {
            console.log("[ResetPassword] Successfully established recovery session via PKCE.");
            if (mounted) {
              setRecoveryEmail(data.session.user.email ?? null);
              setRecoveryVerified(true);
              setCheckingSession(false);
            }
            return;
          }
        }

        // 2. Process token_hash
        if (tokenHash) {
          console.log("[ResetPassword] Verifying OTP token_hash...");
          const { data, error: otpError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });

          if (otpError) {
            console.error("[ResetPassword] OTP verification error:", otpError);
            if (mounted) {
              setError("Verification via token failed or token has expired.");
              setRecoveryVerified(false);
              setCheckingSession(false);
            }
            return;
          }

          if (data?.session) {
            console.log("[ResetPassword] Successfully established recovery session via OTP verification.");
            if (mounted) {
              setRecoveryEmail(data.session.user.email ?? null);
              setRecoveryVerified(true);
              setCheckingSession(false);
            }
            return;
          }
        }

        // 3. Process Hash/Implicit tokens
        if (accessToken && refreshToken) {
          console.log("[ResetPassword] Initializing session via hash tokens...");
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) {
            console.error("[ResetPassword] setSession failed:", setSessionError);
            if (mounted) {
              setError("We could not establish the secure session from your invitation link.");
              setRecoveryVerified(false);
              setCheckingSession(false);
            }
            return;
          }

          if (data?.session) {
            console.log("[ResetPassword] Successfully established recovery session via hash tokens.");
            if (mounted) {
              setRecoveryEmail(data.session.user.email ?? null);
              setRecoveryVerified(true);
              setCheckingSession(false);
            }
            return;
          }
        }

        if (mounted) {
          setError("We could not establish a secure session from the provided credentials.");
          setRecoveryVerified(false);
          setCheckingSession(false);
        }

      } catch (err) {
        console.error("[ResetPassword] Recovery initialization failed:", err);
        if (mounted) {
          setRecoveryVerified(false);
          setError("We could not verify this password setup link. Please request a new invitation.");
          setCheckingSession(false);
        }
      }
    };

    let cleanup: (() => void) | undefined;

    initializeRecoverySession().then((result) => {
      if (typeof result === "function") {
        cleanup = result as any;
      }
    });

    return () => {
      mounted = false;

      if (cleanup) {
        cleanup();
      }
    };
  }, [supabase]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError(null);

    if (!recoveryVerified) {
      setError(
        "Your password setup session is invalid or has expired. Please request a new invitation."
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

    if (!supabase) {
      setError("Authentication client not initialized.");
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
          "Your password setup session has expired. Please request a new invitation."
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
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-brand-charcoal flex items-center justify-center text-white font-serif italic text-2xl rounded-xs">
            P
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-serif font-bold text-gray-900 tracking-tight">
          Secure Your Account
        </h2>

        <p className="mt-2 text-center text-sm text-gray-500">
          Set your new access password to complete setup
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-[#E7E0D8] rounded-xs sm:px-10">
          {checkingSession ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-brand-charcoal animate-spin" />

              <p className="text-sm text-gray-500 font-medium">
                Verifying your secure invitation link...
              </p>
            </div>
          ) : success ? (
            <div className="rounded-xs bg-green-50 p-6 border border-green-200 text-center space-y-3">
              <div className="flex justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>

              <h3 className="text-md font-serif font-semibold text-green-900">
                Password Set Successfully
              </h3>

              <p className="text-xs text-green-800">
                Your credentials have been updated. Redirecting
                you to the sign-in portal...
              </p>
            </div>
          ) : !recoveryVerified ? (
            <div className="rounded-xs bg-red-50 p-6 border border-red-200 space-y-3">
              <div className="flex justify-center">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>

              <h3 className="text-center text-md font-serif font-semibold text-red-900">
                Invalid or Expired Link
              </h3>

              <p className="text-center text-xs text-red-800">
                {error ||
                  "This password setup link is invalid or has expired. Please request a new invitation from the PsySphere administrator."}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {error && (
                <div className="rounded-xs bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle
                        className="h-5 w-5 text-red-600"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="ml-3">
                      <p className="text-xs font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  New Password
                </label>

                <div className="mt-1 relative rounded-xs shadow-3xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-gray-400" />
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
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-[#E7E0D8] rounded-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-charcoal focus:border-brand-charcoal disabled:opacity-50"
                    placeholder="Min 8 characters"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Confirm Password
                </label>

                <div className="mt-1 relative rounded-xs shadow-3xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-gray-400" />
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
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-[#E7E0D8] rounded-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-charcoal focus:border-brand-charcoal disabled:opacity-50"
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2.5 border border-transparent rounded-xs shadow-xs text-sm font-semibold text-white bg-brand-charcoal hover:bg-brand-charcoal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-charcoal disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Setting Password...
                    </>
                  ) : (
                    <>
                      Confirm Password
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